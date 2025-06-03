import User from '../model/user.models.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import ConsultantProfile from '../model/consultantprofile.model.js';


export const generateOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    otp,
                    otpExpiry,
                }
            },
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your Login OTP',
                text: `Your OTP for login is: ${otp}. This OTP is valid for 10 minutes.`
            });

            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (emailError) {
            console.error("Email send failed:", emailError);
            return res.status(500).json({ message: "Failed to send OTP email" });
        }

    } catch (error) {
        console.error("OTP generation error:", error.message, error.stack);
        res.status(500).json({ message: "Failed to generate OTP" });
    }
};

// Verify OTP and Login
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user and check OTP
        const user = await User.findOne({
            email,
            otp,
            otpExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "OTP verified successfully"
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ message: "Failed to verify OTP" });
    }
};

//consultent match route
export const match = async (req, res) => {
    try {
        const { skills = [], domain, timeline } = req.body;

        if (!skills.length || !domain || !timeline?.start || !timeline?.end) {
            return res.status(400).json({ message: 'Missing skills, domain or timeline in request' });
        }

        const consultants = await ConsultantProfile.find({});

        const matches = consultants.map((consultant) => {
            const matchedSkills = consultant.skills.filter(skill => skills.includes(skill));
            const skillScore = matchedSkills.length;

            const domainMatch = consultant.domain === domain;
            const domainScore = domainMatch ? 1 : 0;

            // Timeline overlap (optional scoring, simple check)
            const isTimelineCompatible = (
                new Date(consultant.availableFrom) <= new Date(timeline.start) &&
                new Date(consultant.availableTo) >= new Date(timeline.end)
            );
            const timelineScore = isTimelineCompatible ? 1 : 0;

            const totalScore = skillScore + domainScore + timelineScore;

            return {
                consultant,
                score: totalScore,
                explanation: `${matchedSkills.length} out of ${skills.length} skills matched. ` +
                    `${domainMatch ? 'Domain matched.' : 'Domain did not match.'} ` +
                    `${isTimelineCompatible ? 'Timeline is compatible.' : 'Timeline not compatible.'}`
            };
        });

        const topMatches = matches
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        res.status(200).json({
            message: 'Top consultant matches found',
            matches: topMatches.map(({ consultant, score, explanation }) => ({
                name: consultant.name,
                email: consultant.email,
                skills: consultant.skills,
                domain: consultant.domain,
                availableFrom: consultant.availableFrom,
                availableTo: consultant.availableTo,
                score,
                explanation
            }))
        });

    } catch (error) {
        console.error("Match error:", error);
        res.status(500).json({ message: "Failed to match consultants" });
    }
};
