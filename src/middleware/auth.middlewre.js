import jwt from "jsonwebtoken";
import { User } from "../model/user.models.js";


export const verifyJwt = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access token is missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded._id).select("-otp -otpExpiry -refreshToken");
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
};