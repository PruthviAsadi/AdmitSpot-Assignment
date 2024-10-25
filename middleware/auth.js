// middleware/auth.js
import jwt from 'jsonwebtoken';
import { query } from '../lib/db';

export const authMiddleware = (handler) => async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Optionally fetch user data
        const result = await query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        req.userData = result.rows[0];

        return handler(req, res);
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
