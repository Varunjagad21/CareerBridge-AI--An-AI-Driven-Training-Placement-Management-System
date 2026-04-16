const jwt = require("jsonwebtoken");

// ── Protect any route that needs login ──
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized. No token." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // { id, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token expired or invalid. Please log in again." });
    }
};

// ── Admin only ──
const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access only." });
    }
    next();
};

// ── Company only ──
const companyOnly = (req, res, next) => {
    if (req.user?.role !== "company" && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Company access only." });
    }
    next();
};

module.exports = { protect, adminOnly, companyOnly };