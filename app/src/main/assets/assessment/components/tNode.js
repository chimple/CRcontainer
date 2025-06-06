export class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}
export function sortedArrayToIDsBST(start, end, usedIndices) {
    if (start > end)
        return null;
    let mid;
    if ((start + end) % 2 === 0 && usedIndices.size !== 1) {
        mid = Math.floor((start + end) / 2);
        if (mid === 0)
            return null;
    }
    else {
        do {
            mid = Math.floor((start + end) / 2);
            mid += Math.floor(Math.random() * 2);
        } while (mid > end || usedIndices.has(mid));
    }
    usedIndices.add(mid);
    let node = new TreeNode(mid);
    node.left = sortedArrayToIDsBST(start, mid - 1, usedIndices);
    node.right = sortedArrayToIDsBST(mid + 1, end, usedIndices);
    return node;
}
//# sourceMappingURL=tNode.js.map