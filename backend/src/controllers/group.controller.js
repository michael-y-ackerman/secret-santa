import Group from "../models/group.model.js";
import Participant from "../models/participant.model.js";
import { generateVerificationToken } from "../utils/token.util.js";
import * as emailUtils from "../utils/email.util.js";
import { drawingAlgorithm } from "../utils/draw.util.js";

/**
 * What this does: Creates a new Group and the creator Participant, generating
 * a verification token for the creator to verify their email. Sends an email
 * to the creator with the verification link.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const createGroup = async (req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — createGroup — payload: ${JSON.stringify({ name: req.body?.name, creatorEmail: req.body?.creatorEmail })}`);
    try {
        const { name, creatorEmail, creatorName, giftLimit } = req.body;

        if (!name || !creatorEmail || !creatorName) {
            return res.status(400).json({ error: "Group name, creator name, and creator email are required." });
        }

        const newGroup = new Group({
            name: name,
            giftLimit: giftLimit || null,
            status: "open",
        });
        await newGroup.save();

        const creatorParticipant = new Participant({
            name: creatorName,
            email: creatorEmail,
            isCreator: true,
            verified: false,
            groupId: newGroup._id
        });

        const token = generateVerificationToken();
        creatorParticipant.verificationToken = token;
        await creatorParticipant.save();

        newGroup.participantIds.push(creatorParticipant._id);
        await newGroup.save();

        emailUtils.sendCreatorVerificationEmail(
            creatorEmail,
            creatorName,
            name,
            `${process.env.FRONTEND_URL}/verify-status?token=${token}`
        );
        console.log(`[EMAIL] Initiated creator verification email to ${creatorEmail}`);

        res.status(201).json({
            message: "Group created successfully! Please check your email to verify your participation.",
            groupId: newGroup._id
        });

    } catch (error) {
        console.error("Error creating group:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroupPublicDetails = async (req, res) => {
    const { groupId } = req.params;
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — getGroupPublicDetails — groupId: ${groupId}`);

    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found." });

        // Fetch the count of verified members.
        const verifiedCount = await Participant.countDocuments({
            groupId: groupId,
            verified: true
        });

        // Return public data + the count
        return res.status(200).json({
            groupId: group._id,
            name: group.name,
            status: group.status,
            giftLimit: group.giftLimit,
            participantsCount: verifiedCount, // Only return the count
            createdAt: group.createdAt
        });

    } catch (error) {
        console.error("Error fetching public group details:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const getGroupRoster = async (req, res) => {
    const { groupId } = req.params;
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — getGroupRoster — groupId: ${groupId} — participant: ${req.participant?.participantId || 'unknown'}`);

    // Check authentication and authorization here
    if (!req.participant || req.participant.groupId.toString() !== groupId) {
        return res.status(403).json({ error: "You must be a participant to view the roster." });
    }

    try {
        const allVerifiedParticipants = await Participant.find({
            groupId: groupId,
            verified: true
        }).select("name -_id"); // Only select public fields
        return res.status(200).json({
            roster: allVerifiedParticipants.map(p => p.name),
            rosterCount: allVerifiedParticipants.length
        });

    } catch (error) {
        console.error("Error fetching group roster:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const joinGroup = async (req, res) => {
    const { groupId } = req.params;
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — joinGroup — groupId: ${groupId} — payload: ${JSON.stringify({ name: req.body?.name, email: req.body?.email })}`);
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required to join the group." });
    }

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found." });
        }

        if (group.status !== "open") {
            return res.status(400).json({ error: "Cannot join a group that is not open." });
        }

        const doesParticipantExist = await Participant.findOne({ groupId: groupId, email: email });

        if (doesParticipantExist) {
            return res.status(409).json({ error: "You are already a member of this group. Please check your email." });
        }

        const verificationToken = generateVerificationToken();

        const newParticipant = new Participant({
            name: name,
            email: email,
            groupId: group._id,
            verified: false,
            verificationToken: verificationToken,
            isCreator: false
        });

        await newParticipant.save();

        group.participantIds.push(newParticipant._id);
        await group.save();

        const participantVerificationLink = `${process.env.FRONTEND_URL}/verify-status?token=${verificationToken}`;

        await emailUtils.sendParticipantVerificationEmail(
            email,
            name,
            group.name,
            participantVerificationLink
        );
        console.log(`[EMAIL] Sent participant verification email to ${email}`);

        return res.status(201).json({
            message: "Successfully joined the group! Please check your email to verify your participation.",
            participantId: newParticipant._id
        });
    } catch (error) {
        console.error("Error joining group:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const drawParticipants = async (req, res) => {
    const { groupId } = req.params;
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — drawParticipants — groupId: ${groupId} — by: ${req.participant?.participantId || 'unknown'}`);

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found." });
        }

        if (!req.participant || req.participant.groupId.toString() !== groupId || !req.participant.isCreator) {
            return res.status(403).json({ error: "Only the group creator can perform the draw." });
        }

        if (group.status === 'completed') {
            return res.status(400).json({ error: "The draw has already been completed for this group." });
        }

        const verifiedParticipants = await Participant.find({
            groupId: groupId,
            verified: true
        });

        if (verifiedParticipants.length < 3) {
            return res.status(400).json({ error: "At least 3 verified participants are required to perform the draw." });
        }

        const participantIds = verifiedParticipants.map(p => p._id);
        const pairings = drawingAlgorithm(verifiedParticipants.map(p => p._id));

        group.status = "drawing";
        group.pairings = pairings;
        await group.save();

        await emailUtils.sendDrawNotificationEmails(verifiedParticipants, group.name, group.giftLimit, pairings);
        console.log(`[EMAIL] Completed draw notification emails for group ${group.name}`);

        // Update status to completed now that emails are sent
        group.status = "completed";
        await group.save();

        return res.status(200).json({
            message: "Draw completed successfully! Participants are being notified.",
            pairingsCount: Object.keys(pairings).length
        })
    } catch (error) {
        if (error.message.includes("No-Self-Match Pairing")) {
            return res.status(500).json({ error: "Failed to complete the draw due to pairing issues. Please try again.", error: error.message });
        }

        console.error("Error during drawParticipants:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

/**
 * Retrieves the Secret Santa match (the recipient's name) for the authenticated user.
 * This is called by the Group Page once the group status is 'drawn'.
 * @param {*} req 
 * @param {*} res 
 * @returns {object} The recipient's name, group name, and gift limit.
 */
export const getParticipantMatch = async (req, res) => {
    const { groupId } = req.params;
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — getParticipantMatch — groupId: ${groupId} — participant: ${req.participant?.participantId || 'unknown'}`);
    // The Giver's ID (the person logged in) is provided by the JWT middleware.
    const giverId = req.participant.participantId;

    // 1. Authorization Check (Ensures the user belongs to the requested group)
    if (!req.participant || req.participant.groupId.toString() !== groupId) {
        return res.status(403).json({ error: "Access denied. You do not belong to this group." });
    }

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found." });
        }
        if (group.status !== 'completed') {
            return res.status(400).json({ error: "The draw has not been conducted yet." });
        }

        // 2. Lookup the Recipient ID (The Match)
        // The pairings map is stored as { giverId: receiverId }
        const receiverId = group.pairings[giverId];

        if (!receiverId) {
            // This is a safety check for a data integrity issue
            return res.status(404).json({ error: "Your Secret Santa match could not be found in the pairings." });
        }

        // 3. Lookup the Recipient's Name
        const receiver = await Participant.findById(receiverId).select('name');

        if (!receiver) {
            // Data integrity check: pairing points to a non-existent participant
            return res.status(500).json({ error: "Recipient participant record is missing." });
        }

        // 4. Success: Return ONLY the necessary information
        return res.status(200).json({
            recipientName: receiver.name,
            groupName: group.name,
            giftLimit: group.giftLimit
        });

    } catch (error) {
        console.error("Error fetching participant match:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const deleteGroup = async (req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} — deleteGroup`);
    try {
        const { groupId } = req.params;
        const participantId = req.participant.participantId;

        // 1. Check if group exists
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found." });

        // 2. Verify Creator Permission
        // We check if there is ANY participant record for this user's email 
        // in the TARGET group that has isCreator=true.
        // This handles cases where the current token belongs to "Participant A" in "Group A",
        // but they are trying to delete "Group B" where they are "Participant B" (Creator).
        const requesterEmail = req.participant.email; // Extracted from token

        const creatorParticipant = await Participant.findOne({
            groupId: groupId,
            email: requesterEmail,
            isCreator: true
        });

        if (!creatorParticipant) {
            return res.status(403).json({ error: "Only the group creator can delete this group." });
        }

        // 3. Delete all participants
        await Participant.deleteMany({ groupId: groupId });

        // 4. Delete the group
        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: "Group deleted successfully." });

    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};