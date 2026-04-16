import os
import streamlit as st
import pdfplumber
import json

from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client — reads GROQ_API_KEY from .env automatically
client = Groq(api_key="GROQ_API_KEY")
MODEL = "llama3-8b-8192"  # You can also use: mixtral-8x7b-32768, llama3-70b-8192


# ── Helper functions ──────────────────────────────────────────────────────────

@st.cache_data()
def get_groq_response(system_prompt: str, resume_text: str, job_description: str) -> str:
    """Send resume text + job description to Groq and return the response."""
    user_message = f"""
Job Description:
{job_description}

Resume Content:
{resume_text}
"""
    chat_completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
        temperature=0.7,
    )
    return chat_completion.choices[0].message.content


@st.cache_data()
def get_groq_response_keywords(system_prompt: str, resume_text: str, job_description: str) -> dict:
    """Same as above but parses the JSON response for keyword extraction."""
    raw = get_groq_response(system_prompt, resume_text, job_description)
    # Strip markdown code fences if the model wraps the JSON
    clean = raw.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    return json.loads(clean.strip())


@st.cache_data()
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF using pdfplumber."""
    import io
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


# ── Prompts ───────────────────────────────────────────────────────────────────

input_prompt1 = """
You are an experienced Technical Human Resource Manager. Your task is to review the provided 
resume against the job description. Share your professional evaluation on whether the candidate's 
profile aligns with the role. Highlight the strengths and weaknesses of the applicant in relation 
to the specified job requirements.
"""

input_prompt2 = """
You are an expert ATS (Applicant Tracking System) scanner with in-depth understanding of ATS 
functionality. Evaluate the resume against the provided job description. Identify the specific 
skills and keywords necessary to maximize the resume's impact.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{"Technical Skills": [], "Analytical Skills": [], "Soft Skills": []}

Only include skills/keywords that appear in the job description — do not make anything up.
"""

input_prompt3 = """
You are a skilled ATS (Applicant Tracking System) scanner with a deep understanding of data 
science and ATS functionality. Evaluate the resume against the provided job description.

Your response must follow this structure:
1. Percentage match (e.g. "Match: 75%")
2. Missing keywords
3. Final thoughts
"""


# ── Streamlit UI ──────────────────────────────────────────────────────────────

st.set_page_config(page_title="ATS Resume Scanner")
st.header("Application Tracking System")

input_text = st.text_area("Job Description:", key="input")
uploaded_file = st.file_uploader("Upload your resume (PDF)...", type=["pdf"])

if "resume_bytes" not in st.session_state:
    st.session_state.resume_bytes = None

if uploaded_file is not None:
    st.success("PDF Uploaded Successfully")
    st.session_state.resume_bytes = uploaded_file.read()

col1, col2, col3 = st.columns(3, gap="medium")

with col1:
    submit1 = st.button("Tell Me About the Resume")
with col2:
    submit2 = st.button("Get Keywords")
with col3:
    submit3 = st.button("Percentage Match")


# ── Button Handlers ───────────────────────────────────────────────────────────

if submit1:
    if st.session_state.resume_bytes:
        with st.spinner("Analyzing resume..."):
            resume_text = extract_text_from_pdf(st.session_state.resume_bytes)
            response = get_groq_response(input_prompt1, resume_text, input_text)
        st.subheader("The Response is")
        st.write(response)
    else:
        st.warning("Please upload a resume first.")

elif submit2:
    if st.session_state.resume_bytes:
        with st.spinner("Extracting keywords..."):
            resume_text = extract_text_from_pdf(st.session_state.resume_bytes)
            response = get_groq_response_keywords(input_prompt2, resume_text, input_text)
        st.subheader("Skills Found in Job Description:")
        if response:
            st.write(f"**Technical Skills:** {', '.join(response.get('Technical Skills', []))}")
            st.write(f"**Analytical Skills:** {', '.join(response.get('Analytical Skills', []))}")
            st.write(f"**Soft Skills:** {', '.join(response.get('Soft Skills', []))}")
    else:
        st.warning("Please upload a resume first.")

elif submit3:
    if st.session_state.resume_bytes:
        with st.spinner("Calculating match percentage..."):
            resume_text = extract_text_from_pdf(st.session_state.resume_bytes)
            response = get_groq_response(input_prompt3, resume_text, input_text)
        st.subheader("The Response is")
        st.write(response)
    else:
        st.warning("Please upload a resume first.")