// src/utils/email.util.js
import postmark from "postmark";

const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;
console.log(`Postmark API Key Loaded: ${POSTMARK_API_KEY}`);
// Initialize the client
const client = new postmark.ServerClient(POSTMARK_API_KEY);

/**
 * Sends a verification email to a participant with their unique magic link.
 * * @param {string} participantEmail - The recipient's email address.
 * @param {string} participantName - The recipient's name.
 * @param {string} groupName - The name of the Secret Santa group.
 * @param {string} verificationLink - The full URL containing the verification token.
 */
export const sendParticipantVerificationEmail = async (participantEmail, participantName, groupName, verificationLink) => {

    // We need the group name in the email body, so let's adjust the parameters to include it.
    // NOTE: I've added 'groupName' to the function signature below.

    console.log(`[EMAIL] Sending participant verification email to ${participantEmail} (Group: ${groupName})`);

    try {
        console.log(`[EMAIL] [START] sendParticipantVerificationEmail -> ${participantEmail}`);
        await client.sendEmail({
            // Ensure the 'From' email is a verified sender signature in Postmark
            "From": "Secret Santa <verify@secretsanta.michaelyackerman.com>",
            "To": participantEmail,
            "Subject": `Confirm Your Participation in the ${groupName} Secret Santa!`,

            // 2. Complete the HTML Body with a clear Call to Action (CTA)
            "HtmlBody": `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello ${participantName},</h2>
                    <p>You have been invited to participate in the <strong>${groupName}</strong> Secret Santa exchange!</p>
                    
                    <p>To confirm your participation and ensure your email is correct, please click the button below:</p>

                    <p style="text-align: center;">
                        <a href="${verificationLink}" style="
                            display: inline-block; 
                            padding: 12px 25px; 
                            background-color: #007bff; 
                            color: #ffffff; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold;
                        ">
                            Verify My Email & Join Group
                        </a>
                    </p>

                    <p>This is your Magic Link. By clicking it, you instantly confirm your participation and securely sign into your group's page.</p>
                    <p>If you did not intend to join this group, please ignore this email.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8em; color: #666;">
                        If the button above does not work, copy and paste this link into your browser: 
                        <br>
                        <a href="${verificationLink}">${verificationLink}</a>
                    </p>
                </div>
            `,
            // Include a simple text-only version for better deliverability
            "TextBody": `Hello ${participantName},\n\nYou have been invited to join the ${groupName} Secret Santa! Please click the link below to verify your email and complete your registration:\n\n${verificationLink}`
        });

        // Postmark API call was successful
        console.log(`[EMAIL] [SUCCESS] sendParticipantVerificationEmail -> ${participantEmail}`);

    } catch (error) {
        // Log the full Postmark error for debugging
        console.error(`Postmark Error sending email to ${participantEmail}:`, error);

    }
};

/**
 * Sends a verification email to the GROUP CREATOR with their unique magic link.
 * @param {string} creatorEmail 
 * @param {string} creatorName 
 * @param {string} groupName 
 * @param {string} verificationLink 
 */
export const sendCreatorVerificationEmail = async (creatorEmail, creatorName, groupName, verificationLink) => {
    console.log(`[EMAIL] Sending creator verification email to ${creatorEmail} (Group: ${groupName})`);

    try {
        console.log(`[EMAIL] [START] sendCreatorVerificationEmail -> ${creatorEmail}`);
        await client.sendEmail({
            "From": "Secret Santa <verify@secretsanta.michaelyackerman.com>",
            "To": creatorEmail,
            "Subject": `Verify Your Secret Santa Group: ${groupName}`,
            "HtmlBody": `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello ${creatorName},</h2>
                    <p>You have successfully created the <strong>${groupName}</strong> Secret Santa group!</p>
                    
                    <p>To verify your email and activate the group, please click the button below:</p>

                    <p style="text-align: center;">
                        <a href="${verificationLink}" style="
                            display: inline-block; 
                            padding: 12px 25px; 
                            background-color: #28a745; 
                            color: #ffffff; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold;
                        ">
                            Verify & Activate Group
                        </a>
                    </p>

                    <p>Or use this link: <a href="${verificationLink}">${verificationLink}</a></p>
                </div>
            `,
            "TextBody": `Hello ${creatorName},\n\nYou created the ${groupName} Secret Santa group! Verify your email here: ${verificationLink}`
        });

        console.log(`[EMAIL] [SUCCESS] sendCreatorVerificationEmail -> ${creatorEmail}`);

    } catch (error) {
        console.error(`Postmark Error sending creator email to ${creatorEmail}:`, error);
        throw new Error("Failed to send creator verification email via Postmark.");
    }
};

/**
 * Sends a notification email to ALL verified participants with their match details.
 * @param {Array<Participant>} participants - Array of verified Participant objects.
 * @param {string} groupName - The name of the group.
 * @param {number} giftLimit - The gift limit.
 * @param {Object<string, string>} pairings - The Giver ID -> Receiver ID map.
 */
export const sendDrawNotificationEmails = async (participants, groupName, giftLimit, pairings) => {

    // Create a map for quick ID lookup: { participantId: ParticipantObject }
    const participantMap = participants.reduce((acc, p) => {
        acc[p._id.toString()] = p;
        return acc;
    }, {});

    console.log(`[EMAIL] Starting draw notification emails: count=${participants.length} group=${groupName}`);
    const sendPromises = participants.map(giver => {
        const receiverId = pairings[giver._id.toString()];
        const receiver = participantMap[receiverId];

        // Ensure both giver and receiver exist
        if (!receiver) {
            console.error(`Draw failure: Could not find receiver ID ${receiverId} for giver ${giver._id}`);
            return Promise.resolve(); // Skip this one, but log error
        }

        // Call the individual email sender function
        return sendDrawNotificationEmail(
            giver.email,
            giver.name,
            receiver.name,
            groupName,
            giftLimit
        );
    });

    // Wait for all emails to attempt sending
    const results = await Promise.allSettled(sendPromises);

    const summary = results.reduce((acc, r) => {
        if (r.status === 'fulfilled') acc.success += 1; else acc.fail += 1;
        return acc;
    }, { success: 0, fail: 0 });

    console.log(`[EMAIL] Draw notification summary for group=${groupName}: attempted=${participants.length}, success=${summary.success}, fail=${summary.fail}`);
};


/**
 * Sends the final Secret Santa match email.
 * @param {string} giverEmail - Email of the person receiving the gift match.
 * @param {string} giverName - Name of the Giver.
 * @param {string} receiverName - Name of the person the Giver is buying for.
 * @param {string} groupName - The name of the Secret Santa group.
 * @param {number} giftLimit - The spending limit for the group.
 */
export const sendDrawNotificationEmail = async (giverEmail, giverName, receiverName, groupName, giftLimit) => {

    // Format the gift limit for display
    const limitText = giftLimit ? `The spending limit is **$${giftLimit}**.` : "There is no official spending limit set.";

    try {
        console.log(`[EMAIL] [START] sendDrawNotificationEmail -> ${giverEmail} for receiver=${receiverName} in group=${groupName}`);
        await client.sendEmail({
            "From": "Secret Santa <notify@secretsanta.michaelyackerman.com>",
            "To": giverEmail,
            "Subject": `🎁 Your Secret Santa Match for ${groupName} is HERE!`,
            "HtmlBody": `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Congratulations, ${giverName}!</h2>
                    <p>The draw for the **${groupName}** Secret Santa exchange has been completed!</p>
                    
                    <p>Your recipient is...</p>
                    
                    <h1 style="color: #c0392b; text-align: center; padding: 15px; border: 2px solid #c0392b; border-radius: 5px;">
                        ${receiverName}
                    </h1>
                    
                    <p>${limitText}</p>

                    <p>It's time to start planning your gift! Have fun!</p>
                </div>
            `,
            "TextBody": `Hello ${giverName},\n\nThe Secret Santa draw for ${groupName} is complete! Your match is: ${receiverName}.\n\n${limitText}`
        });

    } catch (error) {
        console.error(`[EMAIL] [ERROR] sendDrawNotificationEmail -> ${giverEmail} :`, error);
    }
};