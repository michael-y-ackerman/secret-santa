// utils/draw.util.js

/**
 * Standard array shuffle utility (Fisher-Yates)
 * Shuffles the array in place.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The shuffled array.
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
 * Conducts the Secret Santa draw, guaranteeing no one buys a gift for themselves
 * (a Derangement). Uses the efficient Shuffle + Single Rotation Fix method.
 * * @param {Array<string>} participantIds - Array of all unique participant IDs.
 * @returns {Object<string, string>} An object where key=Giver ID, value=Receiver ID.
 * @throws {Error} If there are less than 2 participants.
 */
export const drawingAlgorithm = (participantIds) => {
    const N = participantIds.length;

    if (N < 2) {
        throw new Error("Secret Santa requires at least two participants.");
    }

    // 1. Preparation: Lists representing Givers and Receivers
    const givers = [...participantIds];
    let receivers = [...participantIds];
    let isValid = false;

    // 2. Rejection Sampling: Shuffle indefinitely until we find a Derangement (no value matches its index)
    // The probability of a derangement is ~1/e (36.8%), so this converges extremely quickly.
    while (!isValid) {
        shuffle(receivers);
        isValid = true;

        for (let i = 0; i < N; i++) {
            if (givers[i] === receivers[i]) {
                isValid = false;
                break;
            }
        }
    }

    // 3. Finalize Pairings Map
    const pairingsMap = {};
    for (let i = 0; i < N; i++) {
        pairingsMap[givers[i]] = receivers[i];
    }

    return pairingsMap;
};