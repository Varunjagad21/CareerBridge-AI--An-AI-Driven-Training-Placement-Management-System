const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const JobApplication = require('../models/JobApplication');
const Announcement   = require('../models/Announcement');

// ── Multer setup (saves resumes to /uploads/resumes/) ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/resumes'));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only PDF, DOC, DOCX files are allowed'));
    }
});

// ── GET all applications (for company dashboard) ──
router.get('/', async (req, res) => {
    try {
        const apps = await JobApplication.find().sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
    }
});

// ── GET applications filtered by announcementId ──
router.get('/by-job/:announcementId', async (req, res) => {
    try {
        const apps = await JobApplication.find({ announcementId: req.params.announcementId }).sort({ createdAt: -1 });
        res.status(200).json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
    }
});

// ── GET single application ──
router.get('/:id', async (req, res) => {
    try {
        const app = await JobApplication.findById(req.params.id);
        if (!app) return res.status(404).json({ message: 'Application not found' });
        res.status(200).json(app);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching application', error: err.message });
    }
});

// ── POST submit application (student applies) ──
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        const { announcementId, studentName, studentEmail, studentPhone, department } = req.body;

        if (!announcementId || !studentName || !studentEmail) {
            return res.status(400).json({ message: 'announcementId, studentName and studentEmail are required' });
        }

        // Check duplicate application
        const existing = await JobApplication.findOne({ announcementId, studentEmail });
        if (existing) {
            return res.status(409).json({ message: 'You have already applied for this job' });
        }

        // Get job details from announcement
        const announcement = await Announcement.findOne({ announcementId });
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        const application = new JobApplication({
            announcementId,
            jobTitle:  announcement.job,
            company:   announcement.company,
            studentName,
            studentEmail,
            studentPhone: studentPhone || '',
            department:   department   || '',
            resumeUrl:          req.file ? `/uploads/resumes/${req.file.filename}` : '',
            resumeOriginalName: req.file ? req.file.originalname : ''
        });

        await application.save();
        res.status(201).json({ message: 'Application submitted successfully', data: application });

    } catch (err) {
        res.status(500).json({ message: 'Error submitting application', error: err.message });
    }
});

// ── PATCH update application status ──
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updated = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Application not found' });
        res.status(200).json({ message: 'Status updated', data: updated });
    } catch (err) {
        res.status(500).json({ message: 'Error updating status', error: err.message });
    }
});

// ── DELETE application ──
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await JobApplication.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Application not found' });
        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting application', error: err.message });
    }
});

module.exports = router;