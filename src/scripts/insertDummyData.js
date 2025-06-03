import mongoose from "mongoose";
import User from "../model/user.models.js";
import ConsultantProfile from "../model/consultantprofile.model.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const users = [
    { name: "Alice Sharma", email: "alice@example.com", role: "consultant" },
    { name: "Rohan Mehta", email: "rohan@example.com", role: "consultant" },
    { name: "Priya Singh", email: "priya@example.com", role: "consultant" },
    { name: "Aman Verma", email: "aman@example.com", role: "consultant" },
    { name: "Neha Kapoor", email: "neha@example.com", role: "consultant" },
    { name: "Vikram Chauhan", email: "vikram@example.com", role: "consultant" },
    { name: "Sana Khan", email: "sana@example.com", role: "consultant" },
    { name: "Harsh Gupta", email: "harsh@example.com", role: "consultant" },
    { name: "Divya Mishra", email: "divya@example.com", role: "consultant" },
    { name: "Kunal Roy", email: "kunal@example.com", role: "consultant" }
];

const profiles = [
    {
        skills: ["React", "Node.js", "MongoDB", "Express"],
        domain: "Web Development",
        availableFrom: new Date("2025-06-10"),
        availableTo: new Date("2025-07-10"),
    },
    {
        skills: ["AWS", "Docker", "Terraform"],
        domain: "Cloud",
        availableFrom: new Date("2025-06-01"),
        availableTo: new Date("2025-08-15"),
    },
    {
        skills: ["TensorFlow", "Python", "Pandas", "NLP"],
        domain: "AI",
        availableFrom: new Date("2025-06-05"),
        availableTo: new Date("2025-07-15"),
    },
    {
        skills: ["Android", "Kotlin", "Firebase"],
        domain: "Mobile Development",
        availableFrom: new Date("2025-06-03"),
        availableTo: new Date("2025-06-30"),
    },
    {
        skills: ["React", "Redux", "GraphQL"],
        domain: "Web Development",
        availableFrom: new Date("2025-06-15"),
        availableTo: new Date("2025-07-20"),
    },
    {
        skills: ["Azure", "CI/CD", "Kubernetes"],
        domain: "Cloud",
        availableFrom: new Date("2025-06-12"),
        availableTo: new Date("2025-08-01"),
    },
    {
        skills: ["Scikit-learn", "Jupyter", "Deep Learning"],
        domain: "AI",
        availableFrom: new Date("2025-06-20"),
        availableTo: new Date("2025-09-01"),
    },
    {
        skills: ["Flutter", "Dart", "Firebase"],
        domain: "Mobile Development",
        availableFrom: new Date("2025-06-07"),
        availableTo: new Date("2025-07-07"),
    },
    {
        skills: ["Vue.js", "Node.js", "MongoDB"],
        domain: "Web Development",
        availableFrom: new Date("2025-06-18"),
        availableTo: new Date("2025-07-25"),
    },
    {
        skills: ["CloudFormation", "AWS", "Serverless"],
        domain: "Cloud",
        availableFrom: new Date("2025-06-04"),
        availableTo: new Date("2025-07-20"),
    }
];

const insertDummyConsultants = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        await User.deleteMany({ role: "consultant" });
        await ConsultantProfile.deleteMany({});
        console.log("Cleared existing data");

        for (let i = 0; i < users.length; i++) {
            const user = await User.create(users[i]);
            const profile = {
                ...profiles[i],
                consultantId: user._id
            };
            await ConsultantProfile.create(profile);
            console.log(`Inserted consultant: ${user.name}`);
        }

        console.log("✅ Dummy consultants inserted successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error inserting dummy data:", error);
        process.exit(1);
    }
};

insertDummyConsultants();
