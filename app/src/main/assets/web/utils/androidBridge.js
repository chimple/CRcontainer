import { logEvent } from 'firebase/analytics';
window._callbacks = window._callbacks || {};
const _callbacks = window._callbacks;
export const AndroidBridge = {
    sendDataToContainer(key, data) {
        try {
            console.log(`Attempting to send ${key} to container:`, JSON.stringify(data));
            if (window.Android !== undefined) {
                const jsonData = typeof data === "object" ? JSON.stringify(data) : data;
                window.Android.sendDataToContainer(key, jsonData);
            }
            else {
                console.warn("Android bridge not available: sendDataToContainer");
            }
        }
        catch (error) {
            console.error("Error sending data to container:", error);
        }
    },
    requestDataFromContainer(type) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`requesting ${type}`);
                if (window.Android !== undefined) {
                    _callbacks[type] = resolve;
                    window.Android.requestDataFromContainer(type);
                }
                else {
                    reject("Android bridge not available: In requestDataFromContainer");
                }
            }
            catch (error) {
                reject(error);
            }
        });
    },
    requestInstalledAppInfo() {
        return new Promise((resolve, reject) => {
            try {
                console.log("Requesting InstalledAppInfo");
                if (window.Android !== undefined) {
                    _callbacks["installedAppInfo"] = resolve;
                    window.Android.sendInstalledAppInfoToJS();
                }
                else {
                    reject("Android bridge not available: In requestInstalledAppInfo");
                }
            }
            catch (error) {
                reject(error);
            }
        });
    },
    requestAssessmentInfo() {
        return new Promise((resolve, reject) => {
            try {
                if (window.Android !== undefined) {
                    _callbacks["assessmentInfo"] = resolve;
                    window.Android.sendAssessmentInfoToJS();
                }
                else {
                    reject("Android bridge not available: sendAssessmentInfoToJS");
                }
            }
            catch (error) {
                reject(error);
            }
        });
    },
    requestUserInfo() {
        return new Promise((resolve, reject) => {
            try {
                if (window.Android !== undefined) {
                    _callbacks["userInfo"] = resolve;
                    window.Android.sendUserInfoToJS();
                }
                else {
                    reject("Android bridge not available: sendUserInfoToJS");
                }
            }
            catch (error) {
                reject(error);
            }
        });
    },
    sendAssessmentResults(results) {
        try {
            this.sendDataToContainer("assessmentResults", results);
            if (results && typeof results === 'object') {
                logEvent(null, 'assessment_results', {
                    type: 'assessment_results',
                    data: results
                });
            }
        }
        catch (error) {
            console.error("Error sending assessment results:", error);
        }
    },
    _handleDataFromAndroid(responseJson) {
        try {
            const data = JSON.parse(responseJson);
            console.log("Data received from Android:", responseJson);
            const type = data === null || data === void 0 ? void 0 : data.type;
            if (type === "assessmentInfo" && data.data) {
                this._handleAssessmentInfo(data);
                return;
            }
            if (type === "userInfo" && data.data) {
                this._handleUserInfo(data);
                return;
            }
            if (type && _callbacks[type]) {
                _callbacks[type](data);
                delete _callbacks[type];
            }
            else {
                console.warn("No callback found for type:", type);
            }
        }
        catch (e) {
            console.error("Failed to parse data from Android:", e);
        }
    },
    _handleAssessmentInfo(data) {
        try {
            if (data && data.data) {
                const assessmentInfo = data.data;
                localStorage.setItem("assessmentInfo", JSON.stringify(assessmentInfo));
                console.log("Received and saved assessment info from Android:", assessmentInfo);
                if (_callbacks["assessmentInfo"]) {
                    _callbacks["assessmentInfo"](assessmentInfo);
                    delete _callbacks["assessmentInfo"];
                }
            }
        }
        catch (e) {
            console.error("Failed to process assessment info from Android:", e);
        }
    },
    _handleUserInfo(data) {
        try {
            if (data && data.data) {
                const userInfo = data.data;
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                console.log("Received and saved user info from Android:", userInfo);
                if (_callbacks["userInfo"]) {
                    _callbacks["userInfo"](userInfo);
                    delete _callbacks["userInfo"];
                }
            }
        }
        catch (e) {
            console.error("Failed to process user info from Android:", e);
        }
    }
};
//# sourceMappingURL=androidBridge.js.map