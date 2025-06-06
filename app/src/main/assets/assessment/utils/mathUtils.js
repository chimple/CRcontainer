export function randFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
//# sourceMappingURL=mathUtils.js.map