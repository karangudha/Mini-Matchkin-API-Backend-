import express from 'express';
import { generateOTP, verifyOTP, match, refreshAccessToken, getMe } from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middlewre.js';

const router = express.Router();

// Generate OTP route
router.post('/generate-otp', generateOTP);

// Verify OTP route
router.post('/verify-otp', verifyOTP);

// Consultant match route
router.post('/consultant-match', match);

// refresh access token route
router.post('/refresh-token', refreshAccessToken);

// getMe route
router.get('/me', verifyJwt, getMe);

export default router;