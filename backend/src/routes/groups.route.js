import express from "express";
import { createGroup } from "../controllers/groups.controller.js";

const router = express.Router();

router.post("/groups", (req, res) => {
    createGroup(req, res);
});