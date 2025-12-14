import Participant from "../models/participant.model.js";
import { generateAccessToken, attachTokenCookie } from "../utils/token.util.js";

export const verifyParticipantEmail = async (req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — verifyParticipantEmail — token: ${req.query?.token || 'none'}`);
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Verification token is missing." });
    }

    try {
        // Lookup the Participant using the string token
        const participant = await Participant.findOne({ verificationToken: token });

        if (!participant) {
            // Invalid token (Error: Send JSON)
            return res.status(404).json({ error: "Invalid or expired verification link." });
        }
        
        // 3. Update Status 
        if (!participant.verified) {
            participant.verified = true;
            await participant.save();
        }

        // 4. GENERATE A ACCESS TOKEN (JWT)
        const sessionPayload = { 
            participantId: participant._id, 
            groupId: participant.groupId,
            isCreator: participant.isCreator 
        };
        const accessToken = generateAccessToken(sessionPayload); 

        // 5. Attach the JWT as the session cookie.
        attachTokenCookie(res, accessToken); 

        return res.status(200).json({ 
            message: "Email verified successfully!",
            groupId: participant.groupId, // Needed for frontend navigation
            isCreator: participant.isCreator
        });

    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ error: "Internal server error during verification." });
    }
};

export const resendVerificationEmail = async (req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — resendVerificationEmail — participant: ${req.participant?.participantId || 'unknown'}`);
    // TODO: implement resend logic
    res.status(501).json({ message: 'Not implemented yet.' });
};

export const updateParticipantDetails = async (req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — updateParticipantDetails — participant: ${req.participant?.participantId || 'unknown'}`);
    // TODO: implement update logic
    res.status(501).json({ message: 'Not implemented yet.' });
};