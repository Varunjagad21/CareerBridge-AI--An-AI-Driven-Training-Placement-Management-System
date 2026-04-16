const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
    {
        announcementId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        job: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        publishDate: {
            type: Date,
            required: true
        },
        lastDate: {
            type: Date,
            required: true
        },
        createdBy: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Announcement', announcementSchema);