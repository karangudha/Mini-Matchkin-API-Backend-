import express from 'express';
import { generateOTP, verifyOTP, match } from '../controllers/user.controller.js';

const router = express.Router();

// Generate OTP route
router.post('/generate-otp', generateOTP);

// Verify OTP route
router.post('/verify-otp', verifyOTP);

//consultent match route
router.post('/consultant-match', match);

export default router; 