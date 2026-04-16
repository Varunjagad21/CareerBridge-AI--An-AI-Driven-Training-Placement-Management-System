const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const CompanyProfile = require('../models/CompanyProfile');

// ── Multer for logo upload ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/logos')),
    filename:    (req, file, cb) => {
        cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
        if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

// ── GET profile by userId ──
// GET /api/company-profile/:userId
router.get('/:userId', async (req, res) => {
    try {
        let profile = await CompanyProfile.findOne({ userId: req.params.userId });

        // Auto-create empty profile if none exists
        if (!profile) {
            profile = await CompanyProfile.create({ userId: req.params.userId });
        }

        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
});

// ── PUT update profile (text fields) ──
// PUT /api/company-profile/:userId
router.put('/:userId', async (req, res) => {
    try {
        const {
            companyName, industry, companySize, foundedYear, website, description,
            contactEmail, contactPhone, address, city, state, country, pincode,
            linkedin, twitter
        } = req.body;

        const updated = await CompanyProfile.findOneAndUpdate(
            { userId: req.params.userId },
            {
                companyName, industry, companySize, foundedYear, website, description,
                contactEmail, contactPhone, address, city, state, country, pincode,
                linkedin, twitter
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: 'Profile updated successfully', data: updated });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

// ── POST upload logo ──
// POST /api/company-profile/:userId/logo
router.post('/:userId/logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const logoUrl = `/uploads/logos/${req.file.filename}`;
        const updated = await CompanyProfile.findOneAndUpdate(
            { userId: req.params.userId },
            { logoUrl },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Logo uploaded successfully', logoUrl, data: updated });
    } catch (err) {
        res.status(500).json({ message: 'Error uploading logo', error: err.message });
    }
});

module.exports = router;