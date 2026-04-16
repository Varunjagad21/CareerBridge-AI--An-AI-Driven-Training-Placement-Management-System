const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
    {
        announcementId: {
            type: String,
            required: true,
            trim: true
        },
        jobTitle: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        studentName: {
            type: String,
            required: true,
            trim: true
        },
        studentEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        studentPhone: {
            type: String,
            trim: true
        },
        department: {
            type: String,
            trim: true
        },
        resumeUrl: {
            type: String,  // store file path or cloud URL
            trim: true
        },
        resumeOriginalName: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'],
            default: 'Pending'
        }
    },
    {
        timestamps: true  // createdAt = applied date
    }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);