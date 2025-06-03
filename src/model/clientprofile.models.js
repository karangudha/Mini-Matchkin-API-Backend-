import mongoose, { Schema } from 'mongoose';

const clientProfileSchema = new Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    skills:{
        type: [String],
        required: true,
        default: [],
    },
    domain: {
        enum: ["AI", "Cloud", "Web Development", "Mobile Development"],
    },
}, { timestamps: true }
);
