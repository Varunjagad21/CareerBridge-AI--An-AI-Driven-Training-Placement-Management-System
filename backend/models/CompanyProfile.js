const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema(
    {
        // Linked to the logged-in user
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        // Basic Info
        companyName: { type: String, trim: true, default: '' },
        industry:    { type: String, trim: true, default: '' },
        companySize: { type: String, trim: true, default: '' }, // e.g. "50-200 employees"
        foundedYear: { type: Number, default: null },
        website:     { type: String, trim: true, default: '' },
        description: { type: String, trim: true, default: '' },

        // Contact
        contactEmail: { type: String, trim: true, default: '' },
        contactPhone: { type: String, trim: true, default: '' },

        // Address
        address:  { type: String, trim: true, default: '' },
        city:     { type: String, trim: true, default: '' },
        state:    { type: String, trim: true, default: '' },
        country:  { type: String, trim: true, default: '' },
        pincode:  { type: String, trim: true, default: '' },

        // Social
        linkedin:  { type: String, trim: true, default: '' },
        twitter:   { type: String, trim: true, default: '' },

        // Logo (stored as URL or path)
        logoUrl: { type: String, trim: true, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);