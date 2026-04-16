const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['student', 'admin', 'company'],
            required: true
        },

        // ── Student-specific fields ──
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', ''],
            default: ''
        },
        department: {
            type: String,
            trim: true,
            default: ''
        },
        college: {
            type: String,
            trim: true,
            default: ''
        },
        dob: {
            type: String,
            trim: true,
            default: ''
        },
        semester: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);