// pages/api/contacts/[id].js
import { query } from '../../../lib/db';
import { authMiddleware } from '../../../middleware/auth';

export default authMiddleware(async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        const result = await query('SELECT * FROM contacts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL', [id, req.user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        return res.json(result.rows[0]);
    } else if (req.method === 'PUT') {
        const { name, email, phone, address, timezone } = req.body;

        const result = await query(
            'UPDATE contacts SET name = $1, email = $2, phone = $3, address = $4, timezone = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7',
            [name, email, phone, address, timezone, id, req.user.userId]
        );

        return res.status(200).json({ message: 'Contact updated successfully' });
    } else if (req.method === 'DELETE') {
        await query('UPDATE contacts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
        return res.status(204).end();
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
});
