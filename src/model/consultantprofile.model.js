import mongoose, { Schema } from "mongoose";

const consultantSchema = new Schema(
    {
        consultantId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        skills: {
            type: [String],
            required: true,
        },
        domain: {
            type: String,
            enum: ["AI", "Cloud", "Web Development", "Mobile Development"],
            required: true, // Optional, but recommended if every profile must have a domain
        },
        availableFrom: {
            type: Date,
            required: true,
        },
        availableTo: {
            type: Date,
        },
    }, { timestamps: true }
);

const ConsultantProfile = mongoose.model("ConsultantProfile", consultantSchema);

export default ConsultantProfile;   