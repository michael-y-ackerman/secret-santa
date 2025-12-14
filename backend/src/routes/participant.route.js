import express from "express";
import { verifyParticipantEmail, updateParticipantDetails, resendVerificationEmail } from "../controllers/participant.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Verifies a participant's email using a token
router.get("/verify", verifyParticipantEmail);

// Updates participant details
router.patch("/", authenticateToken, updateParticipantDetails);

// Resends verification email to participant
router.post("/resend-verification", resendVerificationEmail);

export default router;

