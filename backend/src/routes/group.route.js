import express from "express";
import { createGroup, getGroupPublicDetails, getGroupRoster, joinGroup, drawParticipants } from "../controllers/group.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
const router = express.Router();

// Creates a new group
router.post("/", createGroup);

// Retrieves the status of a specific group
router.get("/:groupId", getGroupPublicDetails);

// Retrieves the roster of verified participants in a group
router.get("/:groupId/roster", authenticateToken, getGroupRoster);

// Join a group as a participant
router.post("/:groupId/join", joinGroup);

// Conducts the Secret Santa draw for the group
router.post("/:groupId/draw", authenticateToken, drawParticipants);

export default router;

