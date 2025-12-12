import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ["open", "drawing", "completed"],
            default: "open"
        },
        giftLimit: {
            // Use Number for dollar amount
            type: Number,
            required: false
        },    
        // --- Relationship to Participants ---
        participantIds: [
            {
                // References the separate Participant documents
                type: mongoose.Schema.Types.ObjectId,
                ref: "Participant"
            }
        ],

        pairings: {
            // Stores the final GiverId -> ReceiverId results after the draw
            type: mongoose.Schema.Types.Mixed, // Use Mixed or Object for flexible map structure
            required: false,
            default: {}
        }
    },
    { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;