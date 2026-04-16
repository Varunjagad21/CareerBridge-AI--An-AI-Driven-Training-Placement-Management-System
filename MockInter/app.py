import streamlit as st
import time
import os
import json
import numpy as np
import speech_recognition as sr
import cv2
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from groq import Groq
from streamlit_webrtc import webrtc_streamer, VideoTransformerBase, RTCConfiguration
from PIL import Image as PILImage

# ---------------------------
# Environment and API Configuration
# ---------------------------
load_dotenv()

# ✅ Paste your Groq API key here directly
client = Groq(api_key="GROQ_API_KEY")
MODEL = "llama3-70b-8192"  # Better quality for interviews; can use llama3-8b-8192 for speed


def groq_generate(prompt: str) -> str:
    """Send a prompt to Groq and return the text response."""
    chat_completion = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return chat_completion.choices[0].message.content


# ---------------------------
# MongoDB Connection
# ---------------------------
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["mock_interviews"]
feedback_collection = db["feedbacks"]


def store_face_log(student_id, message):
    """Log proctoring violations in the database."""
    collection = db["face_logs"]
    log_data = {
        "student_id": student_id,
        "timestamp": datetime.now(),
        "violation": message
    }
    try:
        collection.insert_one(log_data)
    except Exception as e:
        st.error(f"Error logging face violation: {e}")


# ---------------------------
# Helper function for rerunning the app
# ---------------------------
def rerun_app():
    if hasattr(st, 'rerun'):
        st.rerun()
    elif hasattr(st, 'experimental_rerun'):
        st.experimental_rerun()
    else:
        st.error("Rerun not supported in this version of Streamlit. Please upgrade Streamlit.")


# ---------------------------
# Video Transformer with Proctoring
# ---------------------------
class VideoTransformer(VideoTransformerBase):
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

        self.no_face_warning_count = 0
        self.multiple_face_warning_count = 0
        self.eye_gaze_warning_count = 0
        self.last_no_face_warning_time = time.time()
        self.last_multiple_warning_time = time.time()
        self.last_eye_gaze_warning_time = time.time()
        self.test_terminated = False

        self.no_face_frames = 0
        self.multiple_face_frames = 0
        self.frame_threshold = 5

        self.warning_interval = 2
        self.warning_limit = 10

        self.proctoring_enabled = False
        self.student_id = None

    def transform(self, frame):
        img = frame.to_ndarray(format="bgr24")

        if not self.proctoring_enabled:
            return img

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        current_time = time.time()
        violation_message = None

        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) == 0:
            self.no_face_frames += 1
            if self.no_face_frames >= self.frame_threshold:
                if current_time - self.last_no_face_warning_time > self.warning_interval:
                    self.no_face_warning_count += 1
                    self.last_no_face_warning_time = current_time
                    if self.student_id:
                        store_face_log(self.student_id, "No Face Detected!")
                violation_message = "No Face Detected!"
        else:
            self.no_face_frames = 0

        if len(faces) > 1:
            self.multiple_face_frames += 1
            if self.multiple_face_frames >= self.frame_threshold:
                if current_time - self.last_multiple_warning_time > self.warning_interval:
                    self.multiple_face_warning_count += 1
                    self.last_multiple_warning_time = current_time
                    if self.student_id:
                        store_face_log(self.student_id, "Multiple Faces Detected!")
                violation_message = "Multiple Faces Detected!"
        else:
            self.multiple_face_frames = 0

        for (x, y, w, h) in faces:
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)

        if len(faces) == 1:
            (fx, fy, fw, fh) = faces[0]
            face_roi_gray = gray[fy:fy + fh, fx:fx + fw]
            eyes = self.eye_cascade.detectMultiScale(face_roi_gray, scaleFactor=1.1, minNeighbors=5)
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(img, (fx + ex, fy + ey), (fx + ex + ew, fy + ey + eh), (255, 0, 0), 2)

            eye_violation = False
            if len(eyes) < 2:
                eye_violation = True
            else:
                for (ex, ey, ew, eh) in eyes:
                    eye_roi = face_roi_gray[ey:ey + eh, ex:ex + ew]
                    eye_roi = cv2.equalizeHist(eye_roi)
                    _, thresholded = cv2.threshold(eye_roi, 30, 255, cv2.THRESH_BINARY_INV)
                    contours, _ = cv2.findContours(thresholded, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                    if contours:
                        max_contour = max(contours, key=cv2.contourArea)
                        M = cv2.moments(max_contour)
                        if M["m00"] != 0:
                            cx = int(M["m10"] / M["m00"])
                            if cx < ew / 4 or cx > 3 * ew / 4:
                                eye_violation = True
                    else:
                        eye_violation = True

            if eye_violation:
                violation_message = "Not Looking at Screen!"
                if current_time - self.last_eye_gaze_warning_time > self.warning_interval:
                    self.eye_gaze_warning_count += 1
                    self.last_eye_gaze_warning_time = current_time
                    if self.student_id:
                        store_face_log(self.student_id, "Not Looking at Screen!")

        if violation_message:
            overlay = img.copy()
            cv2.rectangle(overlay, (0, 0), (img.shape[1], img.shape[0]), (0, 0, 255), -1)
            alpha = 0.4
            cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = img.shape[1] / 800
            thickness = max(2, int(img.shape[1] / 400))
            text_size, _ = cv2.getTextSize(violation_message, font, font_scale, thickness)
            text_x = (img.shape[1] - text_size[0]) // 2
            text_y = (img.shape[0] + text_size[1]) // 2
            cv2.putText(img, violation_message, (text_x, text_y), font, font_scale, (255, 255, 255), thickness,
                        cv2.LINE_AA)

        if (self.no_face_warning_count >= self.warning_limit or
                self.multiple_face_warning_count >= self.warning_limit or
                self.eye_gaze_warning_count >= self.warning_limit):
            self.test_terminated = True

        return img


# ---------------------------
# RTC Configuration
# ---------------------------
RTC_CONFIGURATION = RTCConfiguration({
    "iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]
})


# ---------------------------
# Interview Functions (now using Groq)
# ---------------------------
def get_interview_questions(job_role, tech_stack, experience):
    prompt = f"""
    Generate five interview questions for a {job_role} role requiring experience in {tech_stack}. 
    The candidate has {experience} years of experience. Ensure the questions assess relevant skills and knowledge.
    Number each question (1. 2. 3. etc.) and end each with a question mark.
    """
    response_text = groq_generate(prompt)
    questions = response_text.split("\n")
    filtered_questions = []
    for question in questions:
        question = question.strip()
        if question and question[0].isdigit():
            if not question.endswith("?"):
                question += "?"
            filtered_questions.append(question)
    return filtered_questions


def process_answer(question, answer):
    prompt = f"""
    Evaluate the following candidate's answer to an interview question. 
    Provide a score out of 10 based on correctness, depth, and relevance, and give detailed feedback.

    Question: {question}
    Answer: {answer}
    """
    return groq_generate(prompt)


def record_audio():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        st.write("Recording... Speak now!")
        audio = recognizer.listen(source, timeout=5)
    try:
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError:
        return "Could not request results"


# ---------------------------
# Streamlit Session State Setup
# ---------------------------
if "interviews" not in st.session_state:
    st.session_state.interviews = []

# ---------------------------
# Sidebar: Live Camera Feed (Proctoring)
# ---------------------------
with st.sidebar:
    st.title("Live Camera Feed")
    camera = webrtc_streamer(
        key="camera",
        video_transformer_factory=VideoTransformer,
        rtc_configuration=RTC_CONFIGURATION,
        async_processing=True,
        media_stream_constraints={"video": True, "audio": False}
    )
    if camera and hasattr(camera, "video_transformer") and camera.video_transformer is not None:
        st.markdown(f"**No Face Warnings:** {camera.video_transformer.no_face_warning_count}")
        st.markdown(f"**Multiple Face Warnings:** {camera.video_transformer.multiple_face_warning_count}")
        st.markdown(f"**Eye-Gaze Warnings:** {camera.video_transformer.eye_gaze_warning_count}")

# ---------------------------
# Main Interface: Interview Creation
# ---------------------------
if "current_interview" not in st.session_state:
    st.title("AI Mock Interview")
    st.subheader("Create and start your AI Mock Interview")
    if st.button("+ Add New"):
        st.session_state.show_form = True

    if st.session_state.get("show_form"):
        with st.form("interview_form"):
            username = st.text_input("Username", placeholder="Enter your username")
            job_role = st.text_input("Job Role/Job Position", placeholder="Ex. Full Stack Developer")
            tech_stack = st.text_input("Job Description/Tech Stack", placeholder="Ex. React, Angular, Node.js")
            experience = st.number_input("Years of Experience", min_value=0, step=1)
            start_btn = st.form_submit_button("Start Interview")
            cancel_btn = st.form_submit_button("Cancel")
            if cancel_btn:
                st.session_state.show_form = False
                rerun_app()
            if start_btn and username and job_role and tech_stack:
                questions = get_interview_questions(job_role, tech_stack, experience)
                interview_data = {
                    "username": username,
                    "role": job_role,
                    "stack": tech_stack,
                    "experience": experience,
                    "questions": questions,
                    "responses": []
                }
                st.session_state.current_interview = interview_data
                st.session_state.interviews.append(interview_data)
                st.session_state.show_form = False
                st.session_state.question_index = 0
                if camera is not None and hasattr(camera, "video_transformer") and camera.video_transformer is not None:
                    camera.video_transformer.proctoring_enabled = True
                    camera.video_transformer.student_id = username
                rerun_app()

# ---------------------------
# Interview Process
# ---------------------------
if "current_interview" in st.session_state:
    if not (camera and hasattr(camera, "state") and getattr(camera.state, "playing", False)):
        st.warning("Please start your camera in the left sidebar before proceeding with the interview!")
    else:
        interview = st.session_state.current_interview
        st.subheader(f"Job Role: {interview['role']}")
        st.text(f"Tech Stack: {interview['stack']}")
        st.text(f"Years of Experience: {interview['experience']}")
        index = st.session_state.question_index
        if index < len(interview["questions"]):
            st.subheader(f"Question #{index + 1}")
            st.write(interview["questions"][index])
            answer_widget_key = f"answer_{index}"
            recorded_key = f"recorded_answer_{index}"
            if recorded_key not in st.session_state:
                st.session_state[recorded_key] = ""
            answer = st.text_area("Your Answer", key=answer_widget_key,
                                  value=st.session_state.get(recorded_key, ""))
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Record Answer", key=f"record_{index}"):
                    st.session_state[recorded_key] = record_audio()
                    rerun_app()
            with col2:
                if st.button("Next Question", key=f"next_{index}"):
                    answer = st.session_state.get(answer_widget_key, "")
                    feedback = process_answer(interview["questions"][index], answer)
                    response_data = {
                        "username": interview["username"],
                        "question": interview["questions"][index],
                        "answer": answer,
                        "feedback": feedback
                    }
                    feedback_collection.insert_one(response_data)
                    interview["responses"].append(response_data)
                    st.session_state.question_index += 1
                    rerun_app()
        else:
            if camera is not None and hasattr(camera, "video_transformer"):
                camera.video_transformer.proctoring_enabled = False

            st.success("Interview Completed!")
            st.markdown("## Interview Summary")
            for idx, response in enumerate(interview["responses"]):
                with st.expander(f"Question {idx + 1}: {response['question']}"):
                    st.markdown(f"**Your Answer:** {response['answer']}")
                    st.markdown(f"**Feedback:** {response['feedback']}")
            if st.button("Close Interview"):
                if camera is not None and hasattr(camera, "video_transformer"):
                    camera.video_transformer.no_face_warning_count = 0
                    camera.video_transformer.multiple_face_warning_count = 0
                    camera.video_transformer.eye_gaze_warning_count = 0
                del st.session_state["current_interview"]
                del st.session_state["question_index"]
                rerun_app()

# ---------------------------
# Previous Mock Interviews
# ---------------------------
if "current_interview" not in st.session_state and st.session_state.interviews:
    st.subheader("Previous Mock Interviews")
    for i, interview in enumerate(st.session_state.interviews):
        with st.expander(
                f"{interview['role']} - {interview['experience']} Years (Created At: {datetime.now().strftime('%Y-%m-%d')})"
        ):
            st.write(f"Tech Stack: {interview['stack']}")
            for response in interview["responses"]:
                st.write(f"**Q:** {response['question']}")
                st.write(f"**Your Answer:** {response['answer']}")
                st.write(f"**Feedback:** {response['feedback']}")