var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getUUID, getUserSource, getDataFile } from './utils/urlUtils';
import { Survey } from './survey/survey';
import { Assessment } from './assessment/assessment';
import { UnityBridge } from './utils/unityBridge';
import { AnalyticsEvents } from './analytics/analyticsEvents';
import { fetchAppData, getDataURL } from './utils/jsonUtils';
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { Workbox } from 'workbox-window';
import CacheModel from './components/cacheModel';
import { UIController } from './ui/uiController';
const appVersion = 'v1.1.3';
let contentVersion = '';
let loadingScreen = document.getElementById('loadingScreen');
const progressBar = document.getElementById('progressBar');
const broadcastChannel = new BroadcastChannel('as-message-channel');
export class App {
    constructor() {
        this.lang = 'english';
        this.unityBridge = new UnityBridge();
        console.log('Initializing app...');
        this.dataURL = getDataFile();
        this.cacheModel = new CacheModel(this.dataURL, this.dataURL, new Set());
        const firebaseConfig = {
            apiKey: 'AIzaSyB8c2lBVi26u7YRL9sxOP97Uaq3yN8hTl4',
            authDomain: 'ftm-b9d99.firebaseapp.com',
            databaseURL: 'https://ftm-b9d99.firebaseio.com',
            projectId: 'ftm-b9d99',
            storageBucket: 'ftm-b9d99.appspot.com',
            messagingSenderId: '602402387941',
            appId: '1:602402387941:web:7b1b1181864d28b49de10c',
            measurementId: 'G-FF1159TGCF',
        };
        const fapp = initializeApp(firebaseConfig);
        const fanalytics = getAnalytics(fapp);
        this.analytics = fanalytics;
        logEvent(fanalytics, 'notification_received');
        logEvent(fanalytics, 'test initialization event', {});
        console.log('firebase initialized');
    }
    spinUp() {
        return __awaiter(this, void 0, void 0, function* () {
            window.addEventListener('load', () => {
                console.log('Window Loaded!');
                (() => __awaiter(this, void 0, void 0, function* () {
                    yield fetchAppData(this.dataURL).then((data) => {
                        console.log('Assessment/Survey ' + appVersion + ' initializing!');
                        console.log('App data loaded!');
                        console.log(data);
                        this.cacheModel.setContentFilePath(getDataURL(this.dataURL));
                        UIController.SetFeedbackText(data['feedbackText']);
                        let appType = data['appType'];
                        let assessmentType = data['assessmentType'];
                        if (appType == 'survey') {
                            this.game = new Survey(this.dataURL, this.unityBridge);
                        }
                        else if (appType == 'assessment') {
                            let buckets = data['buckets'];
                            for (let i = 0; i < buckets.length; i++) {
                                for (let j = 0; j < buckets[i].items.length; j++) {
                                    let audioItemURL;
                                    if (data['quizName'].includes('Luganda') ||
                                        data['quizName'].toLowerCase().includes('west african english')) {
                                        audioItemURL =
                                            '..lessonAsset/audio/' + this.dataURL + '/' + buckets[i].items[j].itemName.toLowerCase().trim() + '.mp3';
                                    }
                                    else {
                                        audioItemURL = '../lessonAsset/audio/' + this.dataURL + '/' + buckets[i].items[j].itemName.trim() + '.mp3';
                                    }
                                    this.cacheModel.addItemToAudioVisualResources(audioItemURL);
                                }
                            }
                            this.cacheModel.addItemToAudioVisualResources('../lessonAsset/audio/' + this.dataURL + '/answer_feedback.mp3');
                            this.game = new Assessment(this.dataURL, this.unityBridge);
                        }
                        this.game.unityBridge = this.unityBridge;
                        AnalyticsEvents.setUuid(getUUID(), getUserSource());
                        AnalyticsEvents.linkAnalytics(this.analytics, this.dataURL);
                        AnalyticsEvents.setAssessmentType(assessmentType);
                        contentVersion = data['contentVersion'];
                        AnalyticsEvents.sendInit(appVersion, data['contentVersion']);
                        this.game.Run(this);
                    });

                    yield this.registerServiceWorker(this.game, this.dataURL);
                }))();
            });
        });
    }
    registerServiceWorker(game, dataURL = '') {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Registering service worker...');
            if ('serviceWorker' in navigator) {
                let wb = new Workbox('./sw.js', {});
                wb.register()
                    .then((registration) => {
                        console.log('Service worker registered!');
                        this.handleServiceWorkerRegistation(registration);
                    })
                    .catch((err) => {
                        console.log('Service worker registration failed: ' + err);
                    });
                navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
                yield navigator.serviceWorker.ready;
                console.log('Cache Model: ');
                console.log(this.cacheModel);
                console.log('Checking for content version updates...' + dataURL);
                fetch(this.cacheModel.contentFilePath + '?cache-bust=' + new Date().getTime(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store',
                    },
                    cache: 'no-store',
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                        if (!response.ok) {
                            console.error('Failed to fetch the content file from the server!');
                            return;
                        }
                        const newContentFileData = yield response.json();
                        const aheadContentVersion = newContentFileData['contentVersion'];
                        console.log('No Cache Content version: ' + aheadContentVersion);
                        if (aheadContentVersion && contentVersion != aheadContentVersion) {
                            console.log('Content version mismatch! Reloading...');
                            localStorage.removeItem(this.cacheModel.appName);
                            caches.delete(this.cacheModel.appName);
                            handleUpdateFoundMessage();
                        }
                    }))
                    .catch((error) => {
                        console.error('Error fetching the content file: ' + error);
                    });
                if (localStorage.getItem(this.cacheModel.appName) == null) {
                    console.log('Caching!' + this.cacheModel.appName);
                    loadingScreen.style.display = 'flex';
                    broadcastChannel.postMessage({
                        command: 'Cache',
                        data: {
                            appData: this.cacheModel,
                        },
                    });
                }
                else {
                    progressBar.style.width = 100 + '%';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        UIController.SetContentLoaded(true);
                    }, 1500);
                }
                broadcastChannel.onmessage = (event) => {
                    console.log(event.data.command + ' received from service worker!');
                    if (event.data.command == 'Activated' && localStorage.getItem(this.cacheModel.appName) == null) {
                        broadcastChannel.postMessage({
                            command: 'Cache',
                            data: {
                                appData: this.cacheModel,
                            },
                        });
                    }
                };
            }
            else {
                console.warn('Service workers are not supported in this browser.');
            }
        });
    }
    handleServiceWorkerRegistation(registration) {
        var _a;
        try {
            (_a = registration === null || registration === void 0 ? void 0 : registration.installing) === null || _a === void 0 ? void 0 : _a.postMessage({
                type: 'Registartion',
                value: this.lang,
            });
        }
        catch (err) {
            console.log('Service worker registration failed: ' + err);
        }
    }
    GetDataURL() {
        return this.dataURL;
    }
}
broadcastChannel.addEventListener('message', handleServiceWorkerMessage);
function handleServiceWorkerMessage(event) {
    if (event.data.msg == 'Loading') {
        let progressValue = parseInt(event.data.data.progress);
        handleLoadingMessage(event, progressValue);
    }
    if (event.data.msg == 'UpdateFound') {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>.,update Found');
        handleUpdateFoundMessage();
    }
}
function handleLoadingMessage(event, progressValue) {
    if (progressValue < 40 && progressValue >= 10) {
        progressBar.style.width = progressValue + '%';
    }
    else if (progressValue >= 100) {
        progressBar.style.width = 100 + '%';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            UIController.SetContentLoaded(true);
        }, 1500);
        localStorage.setItem(event.data.data.bookName, 'true');
        readLanguageDataFromCacheAndNotifyAndroidApp(event.data.data.bookName);
    }
}
function readLanguageDataFromCacheAndNotifyAndroidApp(bookName) {
    if (window.Android) {
        let isContentCached = localStorage.getItem(bookName) !== null;
        window.Android.cachedStatus(isContentCached);
    }
}
function handleUpdateFoundMessage() {
    let text = 'Update Found.\nPlease accept the update by pressing Ok.';
    if (confirm(text) == true) {
        window.location.reload();
    }
    else {
        text = 'Update will happen on the next launch.';
    }
}
const app = new App();
app.spinUp();
//# sourceMappingURL=App.js.map