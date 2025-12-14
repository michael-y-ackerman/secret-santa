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
            `${process.env.BASE_URL}/verify-status?token=${token}`
        );

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

        const participantVerificationLink = `${process.env.BASE_URL}/verify-status?token=${verificationToken}`;

        await emailUtils.sendParticipantVerificationEmail(
            email,
            name,
            group.name,
            participantVerificationLink
        );

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

        return res.status(200).json({
            message: "Draw completed successfully! Participants are being notified.",
            pairingsCount: Object.keys(pairings).length
        })
    } catch (error) {
        if (error.message.includes("No-Self-Match Pairing")) {
            return res.status(500).json({ error: "Failed to complete the draw due to pairing issues. Please try again." });
        }

        console.error("Error during drawParticipants:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};