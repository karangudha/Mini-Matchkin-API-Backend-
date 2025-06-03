import mongoose, { Schema } from "mongoose";
import { type } from "os";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['consultant', 'client'],
            required: true,
        },
        otp: {
            type: String
        },
        otpExpiry: {
            type: Date
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;