// pages/api/download.js
import { query } from '../../lib/db';
import { authMiddleware } from '../../middleware/auth';
import { Parser } from 'json2csv';
import xlsx from 'xlsx';

const generateCSV = (data) => {
    const parser = new Parser();
    return parser.parse(data);
};

const generateExcel = (data) => {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Contacts');
    return xlsx.writeFile(wb, 'contacts.xlsx');
};

export default authMiddleware(async (req, res) => {
    if (req.method === 'GET') {
        const result = await query('SELECT * FROM contacts WHERE user_id = $1 AND deleted_at IS NULL', [req.user.userId]);
        const contacts = result.rows;

        if (req.query.format === 'csv') {
            const csvData = generateCSV(contacts);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
            return res.send(csvData);
        } else if (req.query.format === 'xlsx') {
            const filePath = generateExcel(contacts);
            res.download(filePath, 'contacts.xlsx');
        } else {
            return res.status(400).json({ message: 'Invalid format. Use csv or xlsx.' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
});
