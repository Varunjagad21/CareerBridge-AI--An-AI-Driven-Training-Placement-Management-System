const express = require('express');
const router  = express.Router();
const User    = require('../models/user');

// ── GET all students ──
router.get('/', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch students', error: err.message });
    }
});

// ── GET student count ──
router.get('/count', async (req, res) => {
    try {
        const count = await User.countDocuments({ role: 'student' });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get count', error: err.message });
    }
});

// ── GET single student ──
router.get('/:id', async (req, res) => {
    try {
        const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching student', error: err.message });
    }
});

// ── PUT update student ──
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, department, gender, college, dob, semester } = req.body;

        // Build update object — only include fields that are provided
        const updateFields = {};
        if (name       !== undefined) updateFields.name       = name;
        if (email      !== undefined) updateFields.email      = email;
        if (phone      !== undefined) updateFields.phone      = phone;
        if (department !== undefined) updateFields.department = department;
        if (gender     !== undefined) updateFields.gender     = gender;
        if (college    !== undefined) updateFields.college    = college;
        if (dob        !== undefined) updateFields.dob        = dob;
        if (semester   !== undefined) updateFields.semester   = semester;

        const updated = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'student' },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updated) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student updated successfully', data: updated });
    } catch (err) {
        res.status(500).json({ message: 'Error updating student', error: err.message });
    }
});

// ── DELETE student ──
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
        if (!deleted) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student', error: err.message });
    }
});

module.exports = router;