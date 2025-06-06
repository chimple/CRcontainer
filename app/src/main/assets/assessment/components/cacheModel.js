class CacheModel {
    constructor(appName, contentFilePath, audioVisualResources) {
        this.appName = appName;
        this.contentFilePath = contentFilePath;
        this.audioVisualResources = audioVisualResources;
    }
    setAppName(appName) {
        this.appName = appName;
    }
    setContentFilePath(contentFilePath) {
        this.contentFilePath = contentFilePath;
    }
    setAudioVisualResources(audioVisualResources) {
        this.audioVisualResources = audioVisualResources;
    }
    addItemToAudioVisualResources(item) {
        if (!this.audioVisualResources.has(item)) {
            this.audioVisualResources.add(item);
        }
    }
}
export default CacheModel;
//# sourceMappingURL=cacheModel.js.map