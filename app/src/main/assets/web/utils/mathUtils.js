export function randFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
export class MathUtils {
    static calculateScore() {
        let score = 0;
        if (MathUtils.correctMove > 0) {
            score = MathUtils.correctMove / (MathUtils.correctMove + MathUtils.wrongMove) * 100;
        }
        else {
            score = 0;
        }
        return score;
    }
}
//# sourceMappingURL=mathUtils.js.map