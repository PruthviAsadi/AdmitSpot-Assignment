// pages/api/contacts/index.js
import { query } from '../../../lib/db';
import { validateContact } from '../../../utils/validation';
import { authMiddleware } from '../../../middleware/auth';

export default authMiddleware(async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, phone, address, timezone } = req.body;

        const { error } = validateContact(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const result = await query(
            'INSERT INTO contacts (user_id, name, email, phone, address, timezone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.userId, name, email, phone, address, timezone]
        );

        return res.status(201).json(result.rows[0]);
    } else if (req.method === 'GET') {
        const { userId } = req.user;
        const result = await query('SELECT * FROM contacts WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
        return res.json(result.rows);
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
});
