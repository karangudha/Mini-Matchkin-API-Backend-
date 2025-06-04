import { User } from '../model/user.models.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import ConsultantProfile from '../model/consultantprofile.model.js';


export const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        console.log("Fetching user with ID:", userId);

        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found");
            throw new Error("User not found");
        }

        console.log("User found:", user.email);

        const accessToken = user.generateAccessToken();
        console.log("Access token generated");

        const refreshToken = user.generateRefreshToken();
        console.log("Refresh token generated");

        await User.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );

        console.log("User updated with refresh token");

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Failed to create token", error);
        throw new Error("Something went wrong while generating tokens");
    }
};


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

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id);

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }


        res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json({
                message: "OTP verified successfully"
            });
    } catch (error) {
        console.error("OTP verification error:", error);
        res
            .status(500)
            .json({
                message: "Failed to verify OTP"
            });
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

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const user = await User.findById(decodedToken._id);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({ message: "Refresh token is used or expired" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                message: "Access token refreshed successfully"
            });
    } catch (error) {
        console.error("Access token refresh error:", error);
        res.status(500).json({
            message: "Failed to refresh token"
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-otp -otpExpiry -refreshToken');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Failed to fetch user details" });
    }
};