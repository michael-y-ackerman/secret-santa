import Participant from "../models/participant.model.js";
import { generateAccessToken, attachTokenCookie } from "../utils/token.util.js";
import * as emailUtils from "../utils/email.util.js";

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
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — resendVerificationEmail`);
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        // Find the most recent participant record for this email
        // We leverage the fact that authentication is email-based across groups
        const participant = await Participant.findOne({ email: email })
            .sort({ createdAt: -1 })
            .populate('groupId');

        if (!participant) {
            // For security, do not reveal if the email exists or not
            // But for this MVP, we might want to return 200 anyway to prevent enumeration,
            // or just be honest. The user is asking for help recovering.
            // Let's return 200 with a generic message.
            console.log(`[RESEND] No participant found for email: ${email}`);
            return res.status(200).json({ message: "If that email is registered, a magic link has been sent." });
        }

        // Generate the link
        const token = participant.verificationToken;
        const verificationLink = `${process.env.FRONTEND_URL}/verify-status?token=${token}`;

        // Send the email
        // We use the "Participant" template even if they are creator, it's generic enough for "Click here to access"
        // Or we could check isCreator.
        const groupName = participant.groupId ? participant.groupId.name : "Secret Santa";

        // Check if we need to use a specific utility based on creator status
        // sendParticipantVerificationEmail works fine for access.

        // However, we need to import emailUtils properly if it wasn't imported.
        // Looking at the top of the file... it is NOT imported currently.
        // We need to fix the imports first.

        // Actually, I can't call emailUtils if it's not imported. 
        // I will add the import in a separate edit or use dynamic import? 
        // Better to use multi_replace to add the import.
    } catch (error) {
        console.error("Error resending verification:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const updateParticipantDetails = async (req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — updateParticipantDetails — participant: ${req.participant?.participantId || 'unknown'}`);
    // TODO: implement update logic
    res.status(501).json({ message: 'Not implemented yet.' });
};

export const getCurrentParticipant = async (req, res) => {
    // console.log(`[REQUEST] ${req.method} ${req.originalUrl} — getCurrentParticipant — participant: ${req.participant?.participantId || 'unknown'}`);

    if (!req.participant) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        // 1. Fetch the current participant to get their email
        const currentParticipant = await Participant.findById(req.participant.participantId);

        if (!currentParticipant) {
            return res.status(404).json({ error: "Participant not found." });
        }

        // 2. Find ALL participant records for this email (across all groups)
        // Populate the 'groupId' to get the Group Name and Status.
        // Also populate 'participantIds' to get the count.
        const allMemberships = await Participant.find({ email: currentParticipant.email })
            .populate({
                path: 'groupId',
                select: 'name status participantIds'
            })
            .select('groupId isCreator');

        // 3. Format the response
        const groups = allMemberships.map(m => {
            if (!m.groupId) return null; // Handle edge case if group was deleted

            // Calculate member count safely
            const memberCount = m.groupId.participantIds ? m.groupId.participantIds.length : 0;

            return {
                groupId: m.groupId._id,
                groupName: m.groupId.name,
                status: m.groupId.status,
                participantCount: memberCount,
                isCreator: m.isCreator
            };
        }).filter(g => g !== null);

        return res.status(200).json({
            participantId: currentParticipant._id, // Return current context ID
            groupId: currentParticipant.groupId,   // Return current context Group ID
            isCreator: currentParticipant.isCreator,
            myGroups: groups // Return full list of memberships
        });

    } catch (error) {
        console.error("Error fetching current participant details:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};