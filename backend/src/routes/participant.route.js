import express from "express";
import { verifyParticipantEmail, updateParticipantDetails, resendVerificationEmail, getCurrentParticipant } from "../controllers/participant.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Verifies a participant's email using a token
router.get("/verify", verifyParticipantEmail);

// Updates participant details
router.patch("/", authenticateToken, updateParticipantDetails);

// Get current participant details (Session Restoration)
// Note: This matches /me, so it must be placed before paths that might capture it (though none conflict here)
// or be distinctive.
router.get("/me", authenticateToken, getCurrentParticipant);

// Resends verification email to participant
router.post("/resend-verification", resendVerificationEmail);

export default router;

