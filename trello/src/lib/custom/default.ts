export const MAX_SCORE: number = 5;

export function scoreRelease(release) {
    return Math.floor(Math.random() * MAX_SCORE);
}

export function filterCard(card) {
    return true;
}
