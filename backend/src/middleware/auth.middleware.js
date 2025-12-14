import { verifyToken } from "../utils/token.util.js";
import Participant from "../models/participant.model.js";

export const authenticateToken = (req, res, next) => {
    // 1. Get the token from the cookie
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // 2. Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }

    // 3. Attach user info to request
    req.participant = decoded;

    next();
};

/**
 * Middleware to support multi-group navigation.
 * If the token's groupId doesn't match the requested groupId,
 * it checks if the token's EMAIL belongs to a verified participant in the requested group.
 * If yes, it "switches context" for this request by updating req.participant.
 */
export const resolveGroupContext = async (req, res, next) => {
    const { groupId } = req.params;

    // If no groupId in params, or token matches group, proceed as normal.
    if (!groupId || !req.participant || req.participant.groupId === groupId) {
        return next();
    }

    try {
        // Attempt to find a verified participant record for this user in the target group
        const targetMember = await Participant.findOne({
            groupId: groupId,
            email: req.participant.email,
            verified: true
        });

        if (targetMember) {
            // Context Switch Success: Update req.participant to reflect the target group membership
            // This treats the request "as if" the user logged in to this group directly.
            req.participant = {
                participantId: targetMember._id,
                email: targetMember.email,
                name: targetMember.name,
                groupId: targetMember.groupId.toString(),
                isCreator: targetMember.isCreator
            };
        }
        // If not found, we do nothing. The subsequent controller logic will catch the mismatch (e.g. 403 Forbidden).
    } catch (error) {
        console.error("Error in resolveGroupContext:", error);
        // Fallthrough to next() and let standard auth fail if needed
    }

    next();
};