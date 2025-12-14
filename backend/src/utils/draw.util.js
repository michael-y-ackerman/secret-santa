// utils/draw.util.js

/**
 * Standard array shuffle utility (Fisher-Yates)
 * @param {Array} array - The array to shuffle.
 */
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
};

/**
 * Conducts the Secret Santa draw, guaranteeing no one buys a gift for themselves.
 * @param {Array<string>} participantIds - Array of all verified participant IDs.
 * @returns {Object<string, string>} An object where key=Giver ID, value=Receiver ID.
 */
export const drawingAlgorithm = (participantIds) => {
    
    // 1. Preparation: Lists representing Givers and Receivers
    const givers = [...participantIds];
    let receivers = [...participantIds];
    
    // 2. Initial Random Assignment
    shuffle(receivers);
    
    // 3. Check and Fix Errors (Self-Match Audit)
    let selfMatchFound = true;
    let attempts = 0;
    
    while (selfMatchFound && attempts < 15) {
        selfMatchFound = false;
        
        // Audit: Check for Giver ID === Receiver ID
        for (let i = 0; i < givers.length; i++) {
            if (givers[i] === receivers[i]) {
                selfMatchFound = true;
                break; // Found a critical error, must shift and try again
            }
        }
        
        if (selfMatchFound) {
            // Perform a single circular right shift on the Receivers list.
            const lastReceiver = receivers.pop();
            receivers.unshift(lastReceiver);
            attempts++;
        }
    }
    
    if (selfMatchFound) {
        // Very low probability case where we couldn't fix self-matches
        throw new Error("Failed to find a No-Self-Match Pairing after multiple shifts.");
    }
    
    // 4. Finalize Pairings Map
    const pairingsMap = {};
    for (let i = 0; i < givers.length; i++) {
        // Key: The Giver's ID, Value: The Receiver's ID
        pairingsMap[givers[i]] = receivers[i];
    }

    return pairingsMap;
};