import mongoose, { Schema } from "mongoose";
import { type } from "os";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: function () {
                return !this.otp; // Only required when not verifying OTP
            }
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['consultant', 'client'],
            required: function () {
                return !this.otp; // Only required when not verifying OTP
            }
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