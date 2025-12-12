import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            // Magic link token for email verification
            type: String,
            unique: true,
            required: true
        },
        groupId: {
            // References the Group this Participant belongs to
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        receiverId: {
            // References the Participant assigned as this Participant's gift receiver
            type: mongoose.Schema.Types.ObjectId,
            ref: "Participant",
            required: false // Will be set after the draw
        },
        isCreator: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    { timestamps: true }
);

participantSchema.index({ groupId: 1, email: 1 }, { unique: true }); // Ensure unique email per group to allow same email in different groups

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;