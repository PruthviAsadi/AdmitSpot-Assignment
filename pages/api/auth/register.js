// pages/api/auth/register.js
import { query } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validateRegistration } from '../../../utils/validation';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        const { error } = validateRegistration(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, hashedPassword]);

        // Send verification email (implement this function in utils/email.js)
        await sendVerificationEmail(email, result.rows[0].id);

        return res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Email sending function (utils/email.js)
async function sendVerificationEmail(email, userId) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const verificationToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const url = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${verificationToken}`;

    await transporter.sendMail({
        to: email,
        subject: 'Email Verification',
        html: `<a href="${url}">Verify your email</a>`,
    });
}
