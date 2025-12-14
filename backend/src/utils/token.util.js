import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Generate a verification token for a participant ID. This function only
 * creates a random string and returns it; it does not attach cookies or otherwise
 * perform side effects. Callers should set cookies when appropriate (e.g.,
 * after a user completes email verification).
 */
export const generateVerificationToken = () => {
    const token = crypto.randomBytes(32).toString("hex");
    return token;
};


/**
 * Generate a JWT for the given participant ID.
 */
export const generateAccessToken = (payload) => { 
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Verify a token and return the decoded payload or null on invalid/expired.
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * Attach a token to the response as a cookie if `res` is valid. This should
 * be used only after login/verification steps where you want the client to
 * have the cookie session set.
 */
export const attachTokenCookie = (res, accessToken) => {
    if (!res || typeof res.cookie !== "function") return;
    res.cookie("jwt", accessToken, { // Uses the Access Token provided by the caller
        maxAge: 7 * 24 * 60 * 60 * 1000, // Matches 7d expiration
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
};