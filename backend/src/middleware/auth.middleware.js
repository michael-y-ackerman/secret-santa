import { verifyToken } from "../utils/token.util.js";

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