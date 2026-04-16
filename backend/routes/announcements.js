const express = require('express');
const router  = express.Router();
const Announcement = require('../models/Announcement');

// ── Helper to generate ANN-XXXXXX ID ──
function generateId() {
    return 'ANN-' + Date.now().toString(36).toUpperCase();
}

// ── GET all announcements ──
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch announcements', error: err.message });
    }
});

// ── GET single announcement by announcementId ──
router.get('/:id', async (req, res) => {
    try {
        const ann = await Announcement.findOne({ announcementId: req.params.id });
        if (!ann) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json(ann);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching announcement', error: err.message });
    }
});

// ── POST create announcement ──
router.post('/', async (req, res) => {
    try {
        const { job, company, description, publishDate, lastDate, createdBy } = req.body;

        if (!job || !company || !description || !publishDate || !lastDate || !createdBy) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const ann = new Announcement({
            announcementId: generateId(),
            job,
            company,
            description,
            publishDate: new Date(publishDate),
            lastDate:    new Date(lastDate),
            createdBy
        });

        await ann.save();
        res.status(201).json({ message: 'Announcement created successfully', data: ann });

    } catch (err) {
        res.status(500).json({ message: 'Error creating announcement', error: err.message });
    }
});

// ── PUT update announcement ──
router.put('/:id', async (req, res) => {
    try {
        const { job, company, description, publishDate, lastDate, createdBy } = req.body;

        const updated = await Announcement.findOneAndUpdate(
            { announcementId: req.params.id },
            {
                job,
                company,
                description,
                publishDate: new Date(publishDate),
                lastDate:    new Date(lastDate),
                createdBy
            },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json({ message: 'Announcement updated successfully', data: updated });

    } catch (err) {
        res.status(500).json({ message: 'Error updating announcement', error: err.message });
    }
});

// ── DELETE announcement ──
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Announcement.findOneAndDelete({ announcementId: req.params.id });
        if (!deleted) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting announcement', error: err.message });
    }
});

module.exports = router;