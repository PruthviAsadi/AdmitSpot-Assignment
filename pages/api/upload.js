// pages/api/upload.js
import multer from 'multer';
import { query } from '../../lib/db';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import { authMiddleware } from '../../middleware/auth';

const upload = multer({ dest: 'uploads/' });

const processCSV = (filePath, userId) => {
    return new Promise((resolve, reject) => {
        const contacts = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                contacts.push({ ...row, user_id: userId });
            })
            .on('end', async () => {
                // Insert contacts into the database
                for (const contact of contacts) {
                    await query('INSERT INTO contacts (user_id, name, email, phone, address, timezone) VALUES ($1, $2, $3, $4, $5, $6)', [contact.user_id, contact.name, contact.email, contact.phone, contact.address, contact.timezone]);
                }
                resolve(contacts.length);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const processExcel = (filePath, userId) => {
    return new Promise((resolve, reject) => {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Insert contacts into the database
        for (const contact of data) {
            await query('INSERT INTO contacts (user_id, name, email, phone, address, timezone) VALUES ($1, $2, $3, $4, $5, $6)', [userId, contact.name, contact.email, contact.phone, contact.address, contact.timezone]);
        }
        resolve(data.length);
    });
};

export default authMiddleware(upload.single('file'), async (req, res) => {
    const userId = req.user.userId;

    try {
        if (req.file.mimetype === 'text/csv') {
            const count = await processCSV(req.file.path, userId);
            res.status(200).json({ message: `${count} contacts added from CSV.` });
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const count = await processExcel(req.file.path, userId);
            res.status(200).json({ message: `${count} contacts added from Excel.` });
        } else {
            return res.status(400).json({ message: 'Unsupported file format.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to process the file.', error });
    }
});
