const Contact = require("../models/contact");

exports.sendContact = async (req, res) => {
  try {
    const { name, email, phone, sub, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await Contact.create({
      name,
      email,
      phone,
      subject: sub,
      message
    });

    res.status(201).json({ message: "Message sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
