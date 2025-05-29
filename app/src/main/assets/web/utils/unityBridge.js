export class UnityBridge {
    constructor() {
        if (typeof Unity !== 'undefined') {
            this.unityReference = Unity;
        }
        else {
            this.unityReference = null;
        }
    }
    SendMessage(message) {
        if (this.unityReference !== null) {
            this.unityReference.call(message);
        }
    }
    SendLoaded() {
        if (this.unityReference !== null) {
            this.unityReference.call('loaded');
        }
        else {
            console.log('would call Unity loaded now');
        }
    }
    SendClose() {
        if (this.unityReference !== null) {
            this.unityReference.call('close');
        }
        else {
            console.log('would close Unity now');
        }
    }
}
//# sourceMappingURL=unityBridge.js.map