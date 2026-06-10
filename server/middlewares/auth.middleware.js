const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'No intelligence token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        req.user._id = decoded.id; // Compatibility
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired intelligence token.' });
    }
};

exports.isAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'No intelligence token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Operation denied. Intelligence level insufficient.' });
        }
        
        req.user = decoded;
        req.user._id = decoded.id; // Compatibility
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired intelligence token.' });
    }
};
