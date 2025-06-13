var Bundle = (() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    define("utils/urlUtils", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.getDataFile = exports.getUserSource = exports.getUUID = exports.getAppType = void 0;
        function getAppType() {
            const pathParams = getPathName();
            const appType = pathParams.get('appType');
            return appType;
        }
        exports.getAppType = getAppType;
        function getUUID() {
            const pathParams = getPathName();
            var nuuid = pathParams.get('cr_user_id');
            if (nuuid == undefined) {
                console.log('no uuid provided');
                nuuid = 'WebUserNoID';
            }
            return nuuid;
        }
        exports.getUUID = getUUID;
        function getUserSource() {
            const pathParams = getPathName();
            var nuuid = pathParams.get('userSource');
            if (nuuid == undefined) {
                console.log('no user source provided');
                nuuid = 'WebUserNoSource';
            }
            return nuuid;
        }
        exports.getUserSource = getUserSource;
        function getDataFile() {
            const pathParams = getPathName();
            var data = pathParams.get('data');
            if (data == undefined) {
                console.log('default data file');
                data = 'zulu-lettersounds';
            }
            return data;
        }
        exports.getDataFile = getDataFile;
        function getPathName() {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            return urlParams;
        }
    });
    define("components/questionData", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
    });
    define("assessment/bucketData", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
    });
    define("utils/jsonUtils", ["require", "exports", "utils/urlUtils"], function (require, exports, urlUtils_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.getCaseIndependentLangList = exports.getDataURL = exports.fetchAssessmentBuckets = exports.fetchSurveyQuestions = exports.fetchFeedback = exports.fetchAppType = exports.fetchAppData = exports.GlobalFlags = void 0;
        exports.GlobalFlags = {
            isRespect: true,
        };
//        function fetchAppData(url) {
//            return __awaiter(this, void 0, void 0, function* () {
//                if (exports.GlobalFlags.isRespect) {
//                    const lessonId = (0, urlUtils_1.getDataFile)();
//                    const furl = `/data/${lessonId}.json`;
//                    return fetch(furl).then((response) => response.json());
//                }
//
//                // ...existing code...
//
//                // Test: Try to fetch lesson data from StorageAssetServer (port 8401)
//                fetch("http://localhost:8401/french-lettersounds.json")
//                  .then(res => {
//                    if (!res.ok) throw new Error("Failed to load from StorageAssetServer");
//                    return res.json();
//                  })
//                  .then(data => {
//                    console.log("[StorageAssetServer] Successfully loaded data:", data);
//                  })
//                  .catch(err => {
//                    console.warn("[StorageAssetServer] Could not load asset:", err);
//                  });
//
//                return loadData(url).then((data) => data);
//            });
//        }


         function fetchAppData(url) {
            return __awaiter(this, void 0, void 0, function* () {
                if (exports.GlobalFlags.isRespect) {
                    const lessonId = (0, urlUtils_1.getDataFile)();
                    const storageUrl = `http://localhost:8401/french-lettersounds.json`;
                    try {
                        const res = yield fetch(storageUrl);
                        if (res.ok) {
                            const data = yield res.json();
                            console.log("[StorageAssetServer] Successfully loaded data:", data);
                            return data; // Use the data from storage if available
                        } else {
                            console.warn("[StorageAssetServer] Asset not found or failed to load, status:", res.status);
                        }
                    } catch (err) {
                        console.warn("[StorageAssetServer] Could not load asset:----", err);
                    }
                    // If fetch from storage fails, fall back to normal behavior
                    console.log("DATA_________________");
                    const furl = `/data/${lessonId}.json`;
                    return fetch(furl).then((response) => response.json());
                }

                // ...existing code for non-Respect mode...
                return loadData(url).then((data) => data);
            });
        }

        exports.fetchAppData = fetchAppData;
        function fetchAppType(url) {
            return __awaiter(this, void 0, void 0, function* () {
                return loadData(url).then((data) => {
                    return data['appType'];
                });
            });
        }
        exports.fetchAppType = fetchAppType;
        function fetchFeedback(url) {
            return __awaiter(this, void 0, void 0, function* () {
                return loadData(url).then((data) => {
                    return data['feedbackText'];
                });
            });
        }
        exports.fetchFeedback = fetchFeedback;
        function fetchSurveyQuestions(url) {
            return __awaiter(this, void 0, void 0, function* () {
                return loadData(url).then((data) => {
                    return data['questions'];
                });
            });
        }
        exports.fetchSurveyQuestions = fetchSurveyQuestions;
        function fetchAssessmentBuckets(url) {
            return __awaiter(this, void 0, void 0, function* () {
                return loadData(url).then((data) => {
                    return data['buckets'];
                });
            });
        }
        exports.fetchAssessmentBuckets = fetchAssessmentBuckets;
        function getDataURL(url) {
            return '/data/' + url + '.json';
        }
        exports.getDataURL = getDataURL;
        function getCaseIndependentLangList() {
            return ['luganda'];
        }
        exports.getCaseIndependentLangList = getCaseIndependentLangList;
        function loadData(url) {
            return __awaiter(this, void 0, void 0, function* () {
                var furl = getDataURL(url);
                return fetch(furl).then((response) => response.json());
            });
        }
    });
    define("components/audioController", ["require", "exports", "utils/jsonUtils"], function (require, exports, jsonUtils_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.AudioController = void 0;
        class AudioController {
            constructor() {
                this.imageToCache = [];
                this.wavToCache = [];
                this.allAudios = {};
                this.allImages = {};
                this.dataURL = '';
                this.correctSoundPath = 'audio/Correct.wav';
                this.feedbackAudio = null;
                this.correctAudio = null;
            }
            init() {
                this.feedbackAudio = new Audio();
                this.feedbackAudio.src = this.correctSoundPath;
                this.correctAudio = new Audio();
            }
            static PrepareAudioAndImagesForSurvey(questionsData, dataURL) {
                AudioController.getInstance().dataURL = dataURL;
                const feedbackSoundPath = 'audio/' + AudioController.getInstance().dataURL + '/answer_feedback.mp3';
                AudioController.getInstance().wavToCache.push(feedbackSoundPath);
                AudioController.getInstance().correctAudio.src = feedbackSoundPath;
                for (var questionIndex in questionsData) {
                    let questionData = questionsData[questionIndex];
                    if (questionData.promptAudio != null) {
                        AudioController.FilterAndAddAudioToAllAudios(questionData.promptAudio.toLowerCase());
                    }
                    if (questionData.promptImg != null) {
                        AudioController.AddImageToAllImages(questionData.promptImg);
                    }
                    for (var answerIndex in questionData.answers) {
                        let answerData = questionData.answers[answerIndex];
                        if (answerData.answerImg != null) {
                            AudioController.AddImageToAllImages(answerData.answerImg);
                        }
                    }
                }
                console.log(AudioController.getInstance().allAudios);
                console.log(AudioController.getInstance().allImages);
            }
            static AddImageToAllImages(newImageURL) {
                console.log('Add image: ' + newImageURL);
                let newImage = new Image();
                newImage.src = newImageURL;
                AudioController.getInstance().allImages[newImageURL] = newImage;
            }
            static FilterAndAddAudioToAllAudios(newAudioURL) {
                console.log('Adding audio: ' + newAudioURL);
                if (newAudioURL.includes('.wav')) {
                    newAudioURL = newAudioURL.replace('.wav', '.mp3');
                }
                else if (newAudioURL.includes('.mp3')) {
                }
                else {
                    newAudioURL = newAudioURL.trim() + '.mp3';
                }
                console.log('Filtered: ' + newAudioURL);
                let newAudio = new Audio();
                if ((0, jsonUtils_1.getCaseIndependentLangList)().includes(AudioController.getInstance().dataURL.split('-')[0])) {
                    newAudio.src = 'audio/' + AudioController.getInstance().dataURL + '/' + newAudioURL;
                }
                else {
                    newAudio.src = 'audio/' + AudioController.getInstance().dataURL + '/' + newAudioURL;
                }
                AudioController.getInstance().allAudios[newAudioURL] = newAudio;
                console.log(newAudio.src);
            }
            static PreloadBucket(newBucket, dataURL) {
                AudioController.getInstance().dataURL = dataURL;
                AudioController.getInstance().correctAudio.src =
                    'audio/' + AudioController.getInstance().dataURL + '/answer_feedback.mp3';
                for (var itemIndex in newBucket.items) {
                    var item = newBucket.items[itemIndex];
                    AudioController.FilterAndAddAudioToAllAudios(item.itemName.toLowerCase());
                }
            }
            static PlayAudio(audioName, finishedCallback, audioAnim) {
                audioName = audioName.toLowerCase();
                console.log('trying to play ' + audioName);
                if (audioName.includes('.mp3')) {
                    if (audioName.slice(-4) != '.mp3') {
                        audioName = audioName.trim() + '.mp3';
                    }
                }
                else {
                    audioName = audioName.trim() + '.mp3';
                }
                console.log('Pre play all audios: ');
                console.log(AudioController.getInstance().allAudios);
                const playPromise = new Promise((resolve, reject) => {
                    const audio = AudioController.getInstance().allAudios[audioName];
                    if (audio) {
                        audio.addEventListener('play', () => {
                            typeof audioAnim !== 'undefined' ? audioAnim(true) : null;
                        });
                        audio.addEventListener('ended', () => {
                            typeof audioAnim !== 'undefined' ? audioAnim(false) : null;
                            resolve();
                        });
                        audio.play().catch((error) => {
                            console.error('Error playing audio:', error);
                            resolve();
                        });
                    }
                    else {
                        console.warn('Audio file not found:', audioName);
                        resolve();
                    }
                });
                playPromise
                    .then(() => {
                    typeof finishedCallback !== 'undefined' ? finishedCallback() : null;
                })
                    .catch((error) => {
                    console.error('Promise error:', error);
                });
            }
            static GetImage(imageName) {
                return AudioController.getInstance().allImages[imageName];
            }
            static PlayDing() {
                AudioController.getInstance().feedbackAudio.play();
            }
            static PlayCorrect() {
                AudioController.getInstance().correctAudio.play();
            }
            static getInstance() {
                if (AudioController.instance == null) {
                    AudioController.instance = new AudioController();
                    AudioController.instance.init();
                }
                return AudioController.instance;
            }
        }
        exports.AudioController = AudioController;
        AudioController.instance = null;
    });
    define("utils/mathUtils", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.MathUtils = exports.shuffleArray = exports.randFrom = void 0;
        function randFrom(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        exports.randFrom = randFrom;
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        exports.shuffleArray = shuffleArray;
        class MathUtils {
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
        exports.MathUtils = MathUtils;
    });
    define("ui/uiController", ["require", "exports", "components/audioController", "utils/mathUtils", "utils/urlUtils"], function (require, exports, audioController_1, mathUtils_1, urlUtils_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.UIController = void 0;
        class UIController {
            constructor() {
                this.landingContainerId = 'landWrap';
                this.gameContainerId = 'gameWrap';
                this.endContainerId = 'endWrap';
                this.starContainerId = 'starWrapper';
                this.chestContainerId = 'chestWrapper';
                this.questionsContainerId = 'qWrap';
                this.feedbackContainerId = 'feedbackWrap';
                this.answersContainerId = 'aWrap';
                this.answerButton1Id = 'answerButton1';
                this.answerButton2Id = 'answerButton2';
                this.answerButton3Id = 'answerButton3';
                this.answerButton4Id = 'answerButton4';
                this.answerButton5Id = 'answerButton5';
                this.answerButton6Id = 'answerButton6';
                this.playButtonId = 'pbutton';
                this.chestImgId = 'chestImage';
                this.nextQuestion = null;
                this.contentLoaded = false;
                this.shown = false;
                this.stars = [];
                this.shownStarsCount = 0;
                this.starPositions = Array();
                this.qAnsNum = 0;
                this.buttons = [];
                this.buttonsActive = false;
                this.devModeCorrectLabelVisibility = false;
                this.devModeBucketControlsEnabled = false;
                this.animationSpeedMultiplier = 1;
            }
            init() {
                this.landingContainer = document.getElementById(this.landingContainerId);
                this.gameContainer = document.getElementById(this.gameContainerId);
                this.endContainer = document.getElementById(this.endContainerId);
                this.starContainer = document.getElementById(this.starContainerId);
                this.chestContainer = document.getElementById(this.chestContainerId);
                this.questionsContainer = document.getElementById(this.questionsContainerId);
                this.feedbackContainer = document.getElementById(this.feedbackContainerId);
                this.answersContainer = document.getElementById(this.answersContainerId);
                this.answerButton1 = document.getElementById(this.answerButton1Id);
                this.answerButton2 = document.getElementById(this.answerButton2Id);
                this.answerButton3 = document.getElementById(this.answerButton3Id);
                this.answerButton4 = document.getElementById(this.answerButton4Id);
                this.answerButton5 = document.getElementById(this.answerButton5Id);
                this.answerButton6 = document.getElementById(this.answerButton6Id);
                this.playButton = document.getElementById(this.playButtonId);
                this.chestImg = document.getElementById(this.chestImgId);
                this.initializeStars();
                this.initEventListeners();
            }
            initializeStars() {
                for (let i = 0; i < 20; i++) {
                    const newStar = document.createElement('img');
                    newStar.id = 'star' + i;
                    newStar.classList.add('topstarv');
                    this.starContainer.appendChild(newStar);
                    this.starContainer.innerHTML += '';
                    if (i == 9) {
                        this.starContainer.innerHTML += '<br>';
                    }
                    this.stars.push(i);
                }
                (0, mathUtils_1.shuffleArray)(this.stars);
            }
            SetAnimationSpeedMultiplier(multiplier) {
                UIController.getInstance().animationSpeedMultiplier = multiplier;
            }
            SetCorrectLabelVisibility(visible) {
                this.devModeCorrectLabelVisibility = visible;
                console.log('Correct label visibility set to ', this.devModeCorrectLabelVisibility);
            }
            SetBucketControlsVisibility(visible) {
                console.log('Bucket controls visibility set to ', visible);
                this.devModeBucketControlsEnabled = visible;
            }
            static OverlappingOtherStars(starPositions, x, y, minDistance) {
                if (starPositions.length < 1)
                    return false;
                for (let i = 0; i < starPositions.length; i++) {
                    const dx = starPositions[i].x - x;
                    const dy = starPositions[i].y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minDistance) {
                        return true;
                    }
                }
                return false;
            }
            initEventListeners() {
                this.answerButton1.addEventListener('click', () => {
                    this.answerButtonPress(1);
                });
                this.buttons.push(this.answerButton1);
                this.answerButton2.addEventListener('click', () => {
                    this.answerButtonPress(2);
                });
                this.buttons.push(this.answerButton2);
                this.answerButton3.addEventListener('click', () => {
                    this.answerButtonPress(3);
                });
                this.buttons.push(this.answerButton3);
                this.answerButton4.addEventListener('click', () => {
                    this.answerButtonPress(4);
                });
                this.buttons.push(this.answerButton4);
                this.answerButton5.addEventListener('click', () => {
                    this.answerButtonPress(5);
                });
                this.buttons.push(this.answerButton5);
                this.answerButton6.addEventListener('click', () => {
                    this.answerButtonPress(6);
                });
                this.buttons.push(this.answerButton6);
                this.landingContainer.addEventListener('click', () => {
                    if (localStorage.getItem((0, urlUtils_2.getDataFile)()) && UIController.getInstance().contentLoaded) {
                        this.showGame();
                    }
                });
            }
            showOptions() {
                if (!UIController.getInstance().shown) {
                    const newQ = UIController.getInstance().nextQuestion;
                    const buttons = UIController.getInstance().buttons;
                    const animationSpeedMultiplier = UIController.getInstance().animationSpeedMultiplier;
                    let animationDuration = 220 * animationSpeedMultiplier;
                    const delayBforeOption = 150 * animationSpeedMultiplier;
                    UIController.getInstance().shown = true;
                    let optionsDisplayed = 0;
                    buttons.forEach((button) => {
                        button.style.visibility = 'hidden';
                        button.style.animation = '';
                        button.innerHTML = '';
                    });
                    setTimeout(() => {
                        for (let i = 0; i < newQ.answers.length; i++) {
                            const curAnswer = newQ.answers[i];
                            const button = buttons[i];
                            const isCorrect = curAnswer.answerName === newQ.correct;
                            button.innerHTML = 'answerText' in curAnswer ? curAnswer.answerText : '';
                            if (isCorrect && UIController.getInstance().devModeCorrectLabelVisibility) {
                                const correctLabel = document.createElement('div');
                                correctLabel.classList.add('correct-label');
                                correctLabel.innerHTML = 'Correct';
                                button.appendChild(correctLabel);
                            }
                            button.style.visibility = 'hidden';
                            button.style.boxShadow = '0px 0px 0px 0px rgba(0,0,0,0)';
                            setTimeout(() => {
                                button.style.visibility = 'visible';
                                button.style.boxShadow = '0px 6px 8px #606060';
                                button.style.animation = `zoomIn ${animationDuration * animationSpeedMultiplier}ms ease forwards`;
                                if ('answerImg' in curAnswer) {
                                    const tmpimg = audioController_1.AudioController.GetImage(curAnswer.answerImg);
                                    button.appendChild(tmpimg);
                                }
                                button.addEventListener('animationend', () => {
                                    optionsDisplayed++;
                                    if (optionsDisplayed === newQ.answers.length) {
                                        UIController.getInstance().enableAnswerButton();
                                    }
                                });
                            }, i * animationDuration * animationSpeedMultiplier * 0.3);
                        }
                    }, delayBforeOption);
                    UIController.getInstance().qStart = Date.now();
                }
            }
            enableAnswerButton() {
                UIController.getInstance().buttonsActive = true;
            }
            static SetFeedbackText(nt) {
                console.log('Feedback text set to ' + nt);
                UIController.getInstance().feedbackContainer.innerHTML = nt;
            }
            showLanding() {
                this.landingContainer.style.display = 'flex';
                this.gameContainer.style.display = 'none';
                this.endContainer.style.display = 'none';
            }
            static ShowEnd() {
                UIController.getInstance().landingContainer.style.display = 'none';
                UIController.getInstance().gameContainer.style.display = 'none';
                UIController.getInstance().endContainer.style.display = 'flex';
            }
            showGame() {
                this.landingContainer.style.display = 'none';
                this.gameContainer.style.display = 'grid';
                this.endContainer.style.display = 'none';
                this.allStart = Date.now();
                this.startPressCallback();
            }
            static SetFeedbackVisibile(visible, isCorrect) {
                if (visible) {
                    UIController.getInstance().feedbackContainer.classList.remove('hidden');
                    UIController.getInstance().feedbackContainer.classList.add('visible');
                    UIController.getInstance().buttonsActive = false;
                    if (isCorrect) {
                        UIController.getInstance().feedbackContainer.style.color = 'rgb(109, 204, 122)';
                        audioController_1.AudioController.PlayCorrect();
                    }
                    else {
                        UIController.getInstance().feedbackContainer.style.color = 'red';
                    }
                }
                else {
                    UIController.getInstance().feedbackContainer.classList.remove('visible');
                    UIController.getInstance().feedbackContainer.classList.add('hidden');
                    UIController.getInstance().buttonsActive = false;
                }
            }
            static ReadyForNext(newQ, reGenerateItems = true) {
                if (newQ === null) {
                    return;
                }
                console.log('ready for next!');
                UIController.getInstance().answersContainer.style.visibility = 'hidden';
                for (var b in UIController.getInstance().buttons) {
                    UIController.getInstance().buttons[b].style.visibility = 'hidden';
                }
                UIController.getInstance().shown = false;
                UIController.getInstance().nextQuestion = newQ;
                UIController.getInstance().questionsContainer.innerHTML = '';
                UIController.getInstance().questionsContainer.style.display = 'none';
                const isBucketControlsEnabled = UIController.getInstance().devModeBucketControlsEnabled;
                if (isBucketControlsEnabled) {
                    UIController.getInstance().externalBucketControlsGenerationHandler(UIController.getInstance().playButton, () => {
                        console.log('Call from inside click handler of external bucket controls');
                        UIController.ShowQuestion();
                        audioController_1.AudioController.PlayAudio(newQ.promptAudio, UIController.getInstance().showOptions, UIController.ShowAudioAnimation);
                    });
                }
                else {
                    UIController.getInstance().playButton.innerHTML =
                        "<button id='nextqButton'><img class=audio-button width='100px' height='100px' src='/img/SoundButton_Idle.png' type='image/svg+xml'> </img></button>";
                    var nextQuestionButton = document.getElementById('nextqButton');
                    nextQuestionButton.addEventListener('click', function () {
                        UIController.ShowQuestion();
                        audioController_1.AudioController.PlayAudio(newQ.promptAudio, UIController.getInstance().showOptions, UIController.ShowAudioAnimation);
                    });
                }
            }
            static ShowAudioAnimation(playing = false) {
                if (!UIController.getInstance().devModeBucketControlsEnabled) {
                    const playButtonImg = UIController.getInstance().playButton.querySelector('img');
                    if (playing) {
                        playButtonImg.src = 'animation/SoundButton.gif';
                    }
                    else {
                        playButtonImg.src = '/img/SoundButton_Idle.png';
                    }
                }
            }
            static ShowQuestion(newQuestion) {
                const isBucketControlsEnabled = UIController.getInstance().devModeBucketControlsEnabled;
                if (isBucketControlsEnabled) {
                    UIController.getInstance().externalBucketControlsGenerationHandler(UIController.getInstance().playButton, () => {
                        console.log('Call from inside click handler of external bucket controls #2');
                        console.log('next question button pressed');
                        console.log(newQuestion.promptAudio);
                        if ('promptAudio' in newQuestion) {
                            audioController_1.AudioController.PlayAudio(newQuestion.promptAudio, undefined, UIController.ShowAudioAnimation);
                        }
                    });
                }
                else {
                    UIController.getInstance().playButton.innerHTML =
                        "<button id='nextqButton'><img class=audio-button width='100px' height='100px' src='/img/SoundButton_Idle.png' type='image/svg+xml'> </img></button>";
                    var nextQuestionButton = document.getElementById('nextqButton');
                    nextQuestionButton.addEventListener('click', function () {
                        console.log('next question button pressed');
                        console.log(newQuestion.promptAudio);
                        if ('promptAudio' in newQuestion) {
                            audioController_1.AudioController.PlayAudio(newQuestion.promptAudio, undefined, UIController.ShowAudioAnimation);
                        }
                    });
                }
                UIController.getInstance().answersContainer.style.visibility = 'visible';
                let qCode = '';
                UIController.getInstance().questionsContainer.innerHTML = '';
                if (typeof newQuestion == 'undefined') {
                    newQuestion = UIController.getInstance().nextQuestion;
                }
                if ('promptImg' in newQuestion) {
                    var tmpimg = audioController_1.AudioController.GetImage(newQuestion.promptImg);
                    UIController.getInstance().questionsContainer.appendChild(tmpimg);
                }
                qCode += newQuestion.promptText;
                qCode += '<BR>';
                UIController.getInstance().questionsContainer.innerHTML += qCode;
                for (var buttonIndex in UIController.getInstance().buttons) {
                    UIController.getInstance().buttons[buttonIndex].style.visibility = 'hidden';
                }
            }
            static AddStar() {
                var starToShow = document.getElementById('star' + UIController.getInstance().stars[UIController.getInstance().qAnsNum]);
                starToShow.src = '../animation/Star.gif';
                starToShow.classList.add('topstarv');
                starToShow.classList.remove('topstarh');
                starToShow.style.position = 'absolute';
                let containerWidth = UIController.getInstance().starContainer.offsetWidth;
                let containerHeight = UIController.getInstance().starContainer.offsetHeight;
                console.log('Stars Container dimensions: ', containerWidth, containerHeight);
                let randomX = 0;
                let randomY = 0;
                do {
                    randomX = Math.floor(Math.random() * (containerWidth - containerWidth * 0.2));
                    randomY = Math.floor(Math.random() * containerHeight);
                } while (UIController.OverlappingOtherStars(UIController.instance.starPositions, randomX, randomY, 28));
                const animationSpeedMultiplier = UIController.getInstance().animationSpeedMultiplier;
                starToShow.style.transform = 'scale(10)';
                starToShow.style.transition = `top ${1 * animationSpeedMultiplier}s ease, left ${1 * animationSpeedMultiplier}s ease, transform ${0.5 * animationSpeedMultiplier}s ease`;
                starToShow.style.zIndex = '500';
                starToShow.style.top = window.innerHeight / 2 + 'px';
                starToShow.style.left = UIController.instance.gameContainer.offsetWidth / 2 - starToShow.offsetWidth / 2 + 'px';
                setTimeout(() => {
                    starToShow.style.transition = `top ${2 * animationSpeedMultiplier}s ease, left ${2 * animationSpeedMultiplier}s ease, transform ${2 * animationSpeedMultiplier}s ease`;
                    if (randomX < containerWidth / 2 - 30) {
                        const rotation = 5 + Math.random() * 8;
                        console.log('Rotating star to the right', rotation);
                        starToShow.style.transform = 'rotate(-' + rotation + 'deg) scale(1)';
                    }
                    else {
                        const rotation = 5 + Math.random() * 8;
                        console.log('Rotating star to the left', rotation);
                        starToShow.style.transform = 'rotate(' + rotation + 'deg) scale(1)';
                    }
                    starToShow.style.left = 10 + randomX + 'px';
                    starToShow.style.top = randomY + 'px';
                    setTimeout(() => {
                        starToShow.style.filter = 'drop-shadow(0px 0px 10px yellow)';
                    }, 1900 * animationSpeedMultiplier);
                }, 1000 * animationSpeedMultiplier);
                UIController.instance.starPositions.push({ x: randomX, y: randomY });
                UIController.getInstance().qAnsNum += 1;
                UIController.getInstance().shownStarsCount += 1;
            }
            static ChangeStarImageAfterAnimation() {
                var starToShow = document.getElementById('star' + UIController.getInstance().stars[UIController.getInstance().qAnsNum - 1]);
                starToShow.src = '../img/star_after_animation.gif';
            }
            answerButtonPress(buttonNum) {
                const allButtonsVisible = this.buttons.every((button) => button.style.visibility === 'visible');
                console.log(this.buttonsActive, allButtonsVisible);
                if (this.buttonsActive === true) {
                    audioController_1.AudioController.PlayDing();
                    const nPressed = Date.now();
                    const dTime = nPressed - this.qStart;
                    console.log('answered in ' + dTime);
                    this.buttonPressCallback(buttonNum, dTime);
                }
            }
            static ProgressChest() {
                const chestImage = document.getElementById('chestImage');
                let currentImgSrc = chestImage.src;
                console.log('Chest Progression-->', chestImage);
                console.log('Chest Progression-->', chestImage.src);
                const currentImageNumber = parseInt(currentImgSrc.slice(-6, -4), 10);
                console.log('Chest Progression number-->', currentImageNumber);
                const nextImageNumber = (currentImageNumber % 4) + 1;
                const nextImageSrc = `img/chestprogression/TreasureChestOpen0${nextImageNumber}.svg`;
                chestImage.src = nextImageSrc;
            }
            static SetContentLoaded(value) {
                UIController.getInstance().contentLoaded = value;
            }
            static SetButtonPressAction(callback) {
                UIController.getInstance().buttonPressCallback = callback;
            }
            static SetStartAction(callback) {
                UIController.getInstance().startPressCallback = callback;
            }
            static SetExternalBucketControlsGenerationHandler(handler) {
                UIController.getInstance().externalBucketControlsGenerationHandler = handler;
            }
            static getInstance() {
                if (UIController.instance === null) {
                    UIController.instance = new UIController();
                    UIController.instance.init();
                }
                return UIController.instance;
            }
        }
        exports.UIController = UIController;
        UIController.instance = null;
    });
    define("utils/androidBridge", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.AndroidBridge = void 0;
        window._callbacks = window._callbacks || {};
        const _callbacks = window._callbacks;
        exports.AndroidBridge = {
            sendDataToContainer(key, data) {
                try {
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
                        (0, analytics_1.logEvent)(null, 'assessment_results', {
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
    });
    define("analytics/analyticsEvents", ["require", "exports", "utils/androidBridge", "utils/mathUtils"], function (require, exports, androidBridge_1, mathUtils_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.AnalyticsEvents = void 0;
        class AnalyticsEvents {
            constructor() {
            }
            static getInstance() {
                if (!AnalyticsEvents.instance) {
                    AnalyticsEvents.instance = new AnalyticsEvents();
                }
                return AnalyticsEvents.instance;
            }
            static setAssessmentType(assessmentType) {
                AnalyticsEvents.assessmentType = assessmentType;
            }
            static getLocation() {
                console.log('starting to get location');
                fetch(`https://ipinfo.io/json?token=b6268727178610`)
                    .then((response) => {
                    console.log('got location response');
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response.json();
                })
                    .then((jsonResponse) => {
                    console.log(jsonResponse);
                    AnalyticsEvents.latlong = jsonResponse.loc;
                    var lpieces = AnalyticsEvents.latlong.split(',');
                    var lat = parseFloat(lpieces[0]).toFixed(2);
                    var lon = parseFloat(lpieces[1]).toFixed(1);
                    AnalyticsEvents.clat = lat;
                    AnalyticsEvents.clon = lon;
                    AnalyticsEvents.latlong = '';
                    lpieces = [];
                    AnalyticsEvents.sendLocation();
                    return {};
                })
                    .catch((err) => {
                    console.warn(`location failed to update! encountered error ${err.msg}`);
                });
            }
            static linkAnalytics(newgana, dataurl) {
                AnalyticsEvents.gana = newgana;
                AnalyticsEvents.dataURL = dataurl;
            }
            static setUuid(newUuid, newUserSource) {
                AnalyticsEvents.uuid = newUuid;
                AnalyticsEvents.userSource = newUserSource;
            }
            static sendInit(appVersion, contentVersion) {
                AnalyticsEvents.appVersion = appVersion;
                AnalyticsEvents.contentVersion = contentVersion;
                AnalyticsEvents.getLocation();
                var eventString = 'user ' + AnalyticsEvents.uuid + ' opened the assessment';
                console.log(eventString);
                // (0, analytics_2.logEvent)(AnalyticsEvents.gana, 'opened', {});
            }
            static getAppLanguageFromDataURL(appType) {
                if (appType && appType !== '' && appType.includes('-')) {
                    let language = appType.split('-').slice(0, -1).join('-');
                    if (language.includes('west-african')) {
                        return 'west-african-english';
                    }
                    else {
                        return language;
                    }
                }
                return 'NotAvailable';
            }
            static getAppTypeFromDataURL(appType) {
                if (appType && appType !== '' && appType.includes('-')) {
                    return appType.substring(appType.lastIndexOf('-') + 1);
                }
                return 'NotAvailable';
            }
            static sendLocation() {
                var eventString = 'Sending User coordinates: ' + AnalyticsEvents.uuid + ' : ' + AnalyticsEvents.clat + ', ' + AnalyticsEvents.clon;
                console.log(eventString);
                // (0, analytics_2.logEvent)(AnalyticsEvents.gana, 'user_location', {
                //     user: AnalyticsEvents.uuid,
                //     lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
                //     app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
                //     latlong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
                // });
                console.log('INITIALIZED EVENT SENT');
                console.log('App Language: ' + AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL));
                console.log('App Type: ' + AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL));
                console.log('App Version: ' + AnalyticsEvents.appVersion);
                console.log('Content Version: ' + AnalyticsEvents.contentVersion);
                // (0, analytics_2.logEvent)(AnalyticsEvents.gana, 'initialized', {
                //     type: 'initialized',
                //     clUserId: AnalyticsEvents.uuid,
                //     userSource: AnalyticsEvents.userSource,
                //     latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
                //     appVersion: AnalyticsEvents.appVersion,
                //     contentVersion: AnalyticsEvents.contentVersion,
                //     app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
                //     lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
                // });
            }
            static sendAnswered(theQ, theA, elapsed) {
                var ans = theQ.answers[theA - 1];
                var iscorrect = null;
                var bucket = null;
                if ('correct' in theQ) {
                    if (theQ.correct != null) {
                        if (theQ.correct == ans.answerName) {
                            iscorrect = true;
                        }
                        else {
                            iscorrect = false;
                        }
                    }
                }
                if ('bucket' in theQ) {
                    bucket = theQ.bucket;
                }
                var eventString = 'user ' + AnalyticsEvents.uuid + ' answered ' + theQ.qName + ' with ' + ans.answerName;
                eventString += ', all answers were [';
                var opts = '';
                for (var aNum in theQ.answers) {
                    eventString += theQ.answers[aNum].answerName + ',';
                    opts += theQ.answers[aNum].answerName + ',';
                }
                eventString += '] ';
                eventString += iscorrect;
                eventString += bucket;
                console.log(eventString);
                console.log('Answered App Version: ' + AnalyticsEvents.appVersion);
                console.log('Content Version: ' + AnalyticsEvents.contentVersion);
                // (0, analytics_2.logEvent)(AnalyticsEvents.gana, 'answered', {
                //     type: 'answered',
                //     clUserId: AnalyticsEvents.uuid,
                //     userSource: AnalyticsEvents.userSource,
                //     latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
                //     app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
                //     lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
                //     dt: elapsed,
                //     question_number: theQ.qNumber,
                //     target: theQ.qTarget,
                //     question: theQ.promptText,
                //     selected_answer: ans.answerName,
                //     iscorrect: iscorrect,
                //     options: opts,
                //     bucket: bucket,
                //     appVersion: AnalyticsEvents.appVersion,
                //     contentVersion: AnalyticsEvents.contentVersion,
                // });
            }
            static sendBucket(tb, passed) {
                var bn = tb.bucketID;
                var btried = tb.numTried;
                var bcorrect = tb.numCorrect;
                var eventString = 'user ' +
                    AnalyticsEvents.uuid +
                    ' finished the bucket ' +
                    bn +
                    ' with ' +
                    bcorrect +
                    ' correct answers out of ' +
                    btried +
                    ' tried' +
                    ' and passed: ' +
                    passed;
                console.log(eventString);
                console.log('Bucket Completed App Version: ' + AnalyticsEvents.appVersion);
                console.log('Content Version: ' + AnalyticsEvents.contentVersion);
                // (0, analytics_2.logEvent)(AnalyticsEvents.gana, 'bucketCompleted', {
                //     type: 'bucketCompleted',
                //     clUserId: AnalyticsEvents.uuid,
                //     userSource: AnalyticsEvents.userSource,
                //     latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
                //     app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
                //     lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
                //     bucketNumber: bn,
                //     numberTriedInBucket: btried,
                //     numberCorrectInBucket: bcorrect,
                //     passedBucket: passed,
                //     appVersion: AnalyticsEvents.appVersion,
                //     contentVersion: AnalyticsEvents.contentVersion,
                // });
            }
            static sendFinished(buckets = null, basalBucket, ceilingBucket) {
                let eventString = 'user ' + AnalyticsEvents.uuid + ' finished the assessment';
                console.log(eventString);
                let basalBucketID = AnalyticsEvents.getBasalBucketID(buckets);
                let ceilingBucketID = AnalyticsEvents.getCeilingBucketID(buckets);
                if (basalBucketID == 0) {
                    basalBucketID = ceilingBucketID;
                }
                let score = AnalyticsEvents.calculateScore(buckets, basalBucketID);
                const maxScore = buckets.length * 100;
                console.log('Sending completed event');
                console.log('Score: ' + score);
                console.log('Max Score: ' + maxScore);
                console.log('Basal Bucket: ' + basalBucketID);
                console.log('BASAL FROM ASSESSMENT: ' + basalBucket);
                console.log('Ceiling Bucket: ' + ceilingBucketID);
                console.log('CEILING FROM ASSESSMENT: ' + ceilingBucket);
                console.log('Completed App Version: ' + AnalyticsEvents.appVersion);
                console.log('Content Version: ' + AnalyticsEvents.contentVersion);
                console.log('MathUtils.wrongMove: ' + mathUtils_2.MathUtils.wrongMove);
                console.log('MathUtils.correctMove: ' + mathUtils_2.MathUtils.correctMove);
                console.log("MathUtils.duration: ", Date.now() - mathUtils_2.MathUtils.duration);
                const lessonName = AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL);
                const lessonScore = mathUtils_2.MathUtils.calculateScore();
                const levelCompletedData = {
                    right_moves: mathUtils_2.MathUtils.wrongMove,
                    wrong_moves: mathUtils_2.MathUtils.correctMove,
                    success_or_failure: lessonScore > 35 ? "success" : "failure",
                    level_number: lessonName,
                    number_of_successful_puzzles: 0,
                    duration: (Date.now() - mathUtils_2.MathUtils.duration) / 1000,
                    score: lessonScore
                };
                androidBridge_1.AndroidBridge.sendDataToContainer("gameData", levelCompletedData);
                console.log("Sent level completed data to container:", levelCompletedData);
                AnalyticsEvents.sendDataToThirdParty(score, AnalyticsEvents.uuid);
                if (window.parent) {
                    window.parent.postMessage({
                        type: 'assessment_completed',
                        score: score,
                    }, 'https://synapse.curiouscontent.org/');
                }
                // (0, analytics_2.logEvent)(AnalyticsEvents.gana, 'completed', {
                //     type: 'completed',
                //     clUserId: AnalyticsEvents.uuid,
                //     userSource: AnalyticsEvents.userSource,
                //     app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
                //     lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
                //     latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
                //     score: score,
                //     maxScore: maxScore,
                //     basalBucket: basalBucketID,
                //     ceilingBucket: ceilingBucketID,
                //     appVersion: AnalyticsEvents.appVersion,
                //     contentVersion: AnalyticsEvents.contentVersion,
                // });
            }
            static sendDataToThirdParty(score, uuid) {
                console.log('Attempting to send score to a third party! Score: ', score);
                const urlParams = new URLSearchParams(window.location.search);
                const targetPartyURL = urlParams.get('endpoint');
                const organization = urlParams.get('organization');
                const xhr = new XMLHttpRequest();
                if (!targetPartyURL) {
                    console.error('No target party URL found!');
                    return;
                }
                const payload = {
                    user: uuid,
                    page: '111108121363615',
                    event: {
                        type: 'external',
                        value: {
                            type: 'assessment',
                            subType: AnalyticsEvents.assessmentType,
                            score: score,
                            completed: true,
                        },
                    },
                };
                const payloadString = JSON.stringify(payload);
                try {
                    xhr.open('POST', targetPartyURL, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.onload = function () {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            console.log('POST success!' + xhr.responseText);
                        }
                        else {
                            console.error('Request failed with status: ' + xhr.status);
                        }
                    };
                    xhr.send(payloadString);
                }
                catch (error) {
                    console.error('Failed to send data to target party: ', error);
                }
            }
            static calculateScore(buckets, basalBucketID) {
                console.log('Calculating score');
                console.log(buckets);
                let score = 0;
                console.log('Basal Bucket ID: ' + basalBucketID);
                let numCorrect = 0;
                for (const index in buckets) {
                    const bucket = buckets[index];
                    if (bucket.bucketID == basalBucketID) {
                        numCorrect = bucket.numCorrect;
                        break;
                    }
                }
                console.log('Num Correct: ' + numCorrect, ' basal: ' + basalBucketID, ' buckets: ' + buckets.length);
                if (basalBucketID === buckets.length && numCorrect >= 4) {
                    console.log('Perfect score');
                    return buckets.length * 100;
                }
                score = Math.round((basalBucketID - 1) * 100 + (numCorrect / 5) * 100) | 0;
                return score;
            }
            static getBasalBucketID(buckets) {
                let bucketID = 0;
                for (const index in buckets) {
                    const bucket = buckets[index];
                    if (bucket.tested && !bucket.passed) {
                        if (bucketID == 0 || bucket.bucketID < bucketID) {
                            bucketID = bucket.bucketID;
                        }
                    }
                }
                return bucketID;
            }
            static getCeilingBucketID(buckets) {
                let bucketID = 0;
                for (const index in buckets) {
                    const bucket = buckets[index];
                    if (bucket.tested && bucket.passed) {
                        if (bucketID == 0 || bucket.bucketID > bucketID) {
                            bucketID = bucket.bucketID;
                        }
                    }
                }
                return bucketID;
            }
            static joinLatLong(lat, lon) {
                return lat + ',' + lon;
            }
        }
        exports.AnalyticsEvents = AnalyticsEvents;
    });
    define("utils/unityBridge", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.UnityBridge = void 0;
        class UnityBridge {
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
        exports.UnityBridge = UnityBridge;
    });
    define("baseQuiz", ["require", "exports", "ui/uiController"], function (require, exports, uiController_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.BaseQuiz = void 0;
        class BaseQuiz {
            constructor() {
                this.devModeAvailable = false;
                this.isInDevMode = false;
                this.isCorrectLabelShown = false;
                this.isBucketInfoShown = false;
                this.isBucketControlsEnabled = false;
                this.animationSpeedMultiplier = 1;
                this.devModeToggleButtonContainerId = 'devModeModalToggleButtonContainer';
                this.devModeToggleButtonId = 'devModeModalToggleButton';
                this.devModeModalId = 'devModeSettingsModal';
                this.devModeBucketGenSelectId = 'devModeBucketGenSelect';
                this.devModeCorrectLabelShownCheckboxId = 'devModeCorrectLabelShownCheckbox';
                this.devModeBucketInfoShownCheckboxId = 'devModeBucketInfoShownCheckbox';
                this.devModeBucketInfoContainerId = 'devModeBucketInfoContainer';
                this.devModeBucketControlsShownCheckboxId = 'devModeBucketControlsShownCheckbox';
                this.devModeAnimationSpeedMultiplierRangeId = 'devModeAnimationSpeedMultiplierRange';
                this.devModeAnimationSpeedMultiplierValueId = 'devModeAnimationSpeedMultiplierValue';
                this.toggleDevModeModal = () => {
                    if (this.devModeSettingsModal.style.display == 'block') {
                        this.devModeSettingsModal.style.display = 'none';
                    }
                    else {
                        this.devModeSettingsModal.style.display = 'block';
                    }
                };
                this.isInDevMode =
                    window.location.href.includes('localhost') ||
                        window.location.href.includes('127.0.0.1') ||
                        window.location.href.includes('assessmentdev');
                this.devModeToggleButtonContainer = document.getElementById(this.devModeToggleButtonContainerId);
                this.devModeSettingsModal = document.getElementById(this.devModeModalId);
                this.devModeBucketGenSelect = document.getElementById(this.devModeBucketGenSelectId);
                this.devModeBucketGenSelect.onchange = (event) => {
                    this.handleBucketGenModeChange(event);
                };
                this.devModeToggleButton = document.getElementById(this.devModeToggleButtonId);
                this.devModeToggleButton.onclick = this.toggleDevModeModal;
                this.devModeCorrectLabelShownCheckbox = document.getElementById(this.devModeCorrectLabelShownCheckboxId);
                this.devModeCorrectLabelShownCheckbox.onchange = () => {
                    this.isCorrectLabelShown = this.devModeCorrectLabelShownCheckbox.checked;
                    this.handleCorrectLabelShownChange();
                };
                this.devModeBucketInfoShownCheckbox = document.getElementById(this.devModeBucketInfoShownCheckboxId);
                this.devModeBucketInfoShownCheckbox.onchange = () => {
                    this.isBucketInfoShown = this.devModeBucketInfoShownCheckbox.checked;
                    this.devModeBucketInfoContainer.style.display = this.isBucketInfoShown ? 'block' : 'none';
                    this.handleBucketInfoShownChange();
                };
                this.devModeBucketControlsShownCheckbox = document.getElementById(this.devModeBucketControlsShownCheckboxId);
                this.devModeBucketControlsShownCheckbox.onchange = () => {
                    this.isBucketControlsEnabled = this.devModeBucketControlsShownCheckbox.checked;
                    this.handleBucketControlsShownChange();
                };
                this.devModeBucketInfoContainer = document.getElementById(this.devModeBucketInfoContainerId);
                this.devModeAnimationSpeedMultiplierRange = document.getElementById(this.devModeAnimationSpeedMultiplierRangeId);
                this.devModeAnimationSpeedMultiplierValue = document.getElementById(this.devModeAnimationSpeedMultiplierValueId);
                this.devModeAnimationSpeedMultiplierRange.onchange = () => {
                    this.animationSpeedMultiplier = parseFloat(this.devModeAnimationSpeedMultiplierRange.value);
                    if (this.animationSpeedMultiplier < 0.2) {
                        this.animationSpeedMultiplier = 0.2;
                        this.devModeAnimationSpeedMultiplierRange.value = '0.2';
                    }
                    this.devModeAnimationSpeedMultiplierValue.innerText = this.animationSpeedMultiplier.toString();
                    this.handleAnimationSpeedMultiplierChange();
                };
                if (!this.isInDevMode) {
                    this.devModeToggleButtonContainer.style.display = 'none';
                }
                else {
                    this.devModeToggleButtonContainer.style.display = 'block';
                }
                this.animationSpeedMultiplier = parseFloat(this.devModeAnimationSpeedMultiplierRange.value);
            }
            hideDevModeButton() {
                this.devModeToggleButtonContainer.style.display = 'none';
            }
            onEnd() {
                uiController_1.UIController.ShowEnd();
                this.app.unityBridge.SendClose();
            }
        }
        exports.BaseQuiz = BaseQuiz;
    });
    define("survey/survey", ["require", "exports", "ui/uiController", "components/audioController", "analytics/analyticsEvents", "baseQuiz", "utils/jsonUtils"], function (require, exports, uiController_2, audioController_2, analyticsEvents_1, baseQuiz_1, jsonUtils_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.Survey = void 0;
        class Survey extends baseQuiz_1.BaseQuiz {
            constructor(dataURL, unityBridge) {
                super();
                this.handleBucketGenModeChange = () => {
                    console.log('Bucket Gen Mode Changed');
                };
                this.handleCorrectLabelShownChange = () => {
                    console.log('Correct Label Shown Changed');
                };
                this.handleBucketInfoShownChange = () => {
                    console.log('Bucket Info Shown Changed');
                };
                this.handleBucketControlsShownChange = () => {
                    console.log('Bucket Controls Shown Changed');
                };
                this.startSurvey = () => {
                    uiController_2.UIController.ReadyForNext(this.buildNewQuestion());
                };
                this.onQuestionEnd = () => {
                    uiController_2.UIController.SetFeedbackVisibile(false, false);
                    this.currentQuestionIndex += 1;
                    setTimeout(() => {
                        if (this.HasQuestionsLeft()) {
                            uiController_2.UIController.ReadyForNext(this.buildNewQuestion());
                        }
                        else {
                            console.log('There are no questions left.');
                            this.onEnd();
                        }
                    }, 500);
                };
                this.handleAnswerButtonPress = (answer, elapsed) => {
                    analyticsEvents_1.AnalyticsEvents.sendAnswered(this.questionsData[this.currentQuestionIndex], answer, elapsed);
                    uiController_2.UIController.SetFeedbackVisibile(true, true);
                    uiController_2.UIController.AddStar();
                    setTimeout(() => {
                        this.onQuestionEnd();
                    }, 2000);
                };
                this.buildQuestionList = () => {
                    const surveyQuestions = (0, jsonUtils_2.fetchSurveyQuestions)(this.app.dataURL);
                    return surveyQuestions;
                };
                console.log('Survey initialized');
                this.dataURL = dataURL;
                this.unityBridge = unityBridge;
                this.currentQuestionIndex = 0;
                uiController_2.UIController.SetButtonPressAction(this.handleAnswerButtonPress);
                uiController_2.UIController.SetStartAction(this.startSurvey);
            }
            handleAnimationSpeedMultiplierChange() {
                console.log('Animation Speed Multiplier Changed');
            }
            Run(app) {
                return __awaiter(this, void 0, void 0, function* () {
                    this.app = app;
                    this.buildQuestionList().then((result) => {
                        this.questionsData = result;
                        audioController_2.AudioController.PrepareAudioAndImagesForSurvey(this.questionsData, this.app.GetDataURL());
                        this.unityBridge.SendLoaded();
                    });
                });
            }
            HasQuestionsLeft() {
                return this.currentQuestionIndex <= this.questionsData.length - 1;
            }
            buildNewQuestion() {
                var questionData = this.questionsData[this.currentQuestionIndex];
                return questionData;
            }
        }
        exports.Survey = Survey;
    });
    define("components/tNode", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.sortedArrayToIDsBST = exports.TreeNode = void 0;
        class TreeNode {
            constructor(value) {
                this.value = value;
                this.left = null;
                this.right = null;
            }
        }
        exports.TreeNode = TreeNode;
        function sortedArrayToIDsBST(start, end, usedIndices) {
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
        exports.sortedArrayToIDsBST = sortedArrayToIDsBST;
    });
    define("assessment/assessment", ["require", "exports", "ui/uiController", "analytics/analyticsEvents", "baseQuiz", "utils/jsonUtils", "components/tNode", "utils/mathUtils", "components/audioController"], function (require, exports, uiController_3, analyticsEvents_2, baseQuiz_2, jsonUtils_3, tNode_1, mathUtils_3, audioController_3) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.Assessment = void 0;
        var searchStage;
        (function (searchStage) {
            searchStage[searchStage["BinarySearch"] = 0] = "BinarySearch";
            searchStage[searchStage["LinearSearchUp"] = 1] = "LinearSearchUp";
            searchStage[searchStage["LinearSearchDown"] = 2] = "LinearSearchDown";
        })(searchStage || (searchStage = {}));
        var BucketGenMode;
        (function (BucketGenMode) {
            BucketGenMode[BucketGenMode["RandomBST"] = 0] = "RandomBST";
            BucketGenMode[BucketGenMode["LinearArrayBased"] = 1] = "LinearArrayBased";
        })(BucketGenMode || (BucketGenMode = {}));
        class Assessment extends baseQuiz_2.BaseQuiz {
            constructor(dataURL, unityBridge) {
                super();
                this.bucketGenMode = BucketGenMode.RandomBST;
                this.MAX_STARS_COUNT_IN_LINEAR_MODE = 20;
                this.generateDevModeBucketControlsInContainer = (container, clickHandler) => {
                    if (this.isInDevMode && this.bucketGenMode === BucketGenMode.LinearArrayBased) {
                        container.innerHTML = '';
                        for (let i = 0; i < this.currentBucket.items.length; i++) {
                            let item = this.currentBucket.items[i];
                            let itemButton = document.createElement('button');
                            let index = i;
                            itemButton.innerText = item.itemName;
                            itemButton.style.margin = '2px';
                            itemButton.onclick = () => {
                                this.currentLinearTargetIndex = index;
                                this.currentBucket.usedItems = [];
                                console.log('Clicked on item ' + item.itemName + ' at index ' + this.currentLinearTargetIndex);
                                const newQ = this.buildNewQuestion();
                                uiController_3.UIController.getInstance().answersContainer.style.visibility = 'hidden';
                                for (let b in uiController_3.UIController.getInstance().buttons) {
                                    uiController_3.UIController.getInstance().buttons[b].style.visibility = 'hidden';
                                }
                                uiController_3.UIController.getInstance().shown = false;
                                uiController_3.UIController.getInstance().nextQuestion = newQ;
                                uiController_3.UIController.getInstance().questionsContainer.innerHTML = '';
                                uiController_3.UIController.getInstance().questionsContainer.style.display = 'none';
                                uiController_3.UIController.ShowQuestion(newQ);
                                audioController_3.AudioController.PlayAudio(this.buildNewQuestion().promptAudio, uiController_3.UIController.getInstance().showOptions, uiController_3.UIController.ShowAudioAnimation);
                            };
                            container.append(itemButton);
                        }
                        let prevButton = document.createElement('button');
                        prevButton.innerText = 'Prev Bucket';
                        if (this.currentLinearBucketIndex == 0) {
                            prevButton.disabled = true;
                        }
                        prevButton.addEventListener('click', () => {
                            if (this.currentLinearBucketIndex > 0) {
                                this.currentLinearBucketIndex--;
                                this.currentLinearTargetIndex = 0;
                                this.tryMoveBucket(false);
                                uiController_3.UIController.ReadyForNext(this.buildNewQuestion());
                                this.updateBucketInfo();
                            }
                            if (this.currentLinearBucketIndex == 0) {
                                prevButton.disabled = true;
                            }
                        });
                        let nextButton = document.createElement('button');
                        nextButton.innerText = 'Next Bucket';
                        if (this.currentLinearBucketIndex == this.buckets.length - 1) {
                            nextButton.disabled = true;
                        }
                        nextButton.addEventListener('click', () => {
                            if (this.currentLinearBucketIndex < this.buckets.length - 1) {
                                this.currentLinearBucketIndex++;
                                this.currentLinearTargetIndex = 0;
                                this.tryMoveBucket(false);
                                uiController_3.UIController.ReadyForNext(this.buildNewQuestion());
                                this.updateBucketInfo();
                            }
                        });
                        let buttonsContainer = document.createElement('div');
                        buttonsContainer.style.display = 'flex';
                        buttonsContainer.style.flexDirection = 'row';
                        buttonsContainer.style.justifyContent = 'center';
                        buttonsContainer.style.alignItems = 'center';
                        buttonsContainer.appendChild(prevButton);
                        buttonsContainer.appendChild(nextButton);
                        container.appendChild(buttonsContainer);
                    }
                };
                this.updateBucketInfo = () => {
                    if (this.currentBucket != null) {
                        this.devModeBucketInfoContainer.innerHTML = `Bucket: ${this.currentBucket.bucketID}<br/>Correct: ${this.currentBucket.numCorrect}<br/>Tried: ${this.currentBucket.numTried}<br/>Failed: ${this.currentBucket.numConsecutiveWrong}`;
                    }
                };
                this.startAssessment = () => {
                    mathUtils_3.MathUtils.duration = Date.now();
                    mathUtils_3.MathUtils.wrongMove = 0;
                    mathUtils_3.MathUtils.correctMove = 0;
                    uiController_3.UIController.ReadyForNext(this.buildNewQuestion());
                    if (this.isInDevMode) {
                        this.hideDevModeButton();
                    }
                };
                this.buildBuckets = (bucketGenMode) => __awaiter(this, void 0, void 0, function* () {
                    if (this.buckets === undefined || this.buckets.length === 0) {
                        const res = (0, jsonUtils_3.fetchAssessmentBuckets)(this.app.GetDataURL()).then((result) => {
                            this.buckets = result;
                            this.numBuckets = result.length;
                            console.log('buckets: ' + this.buckets);
                            this.bucketArray = Array.from(Array(this.numBuckets), (_, i) => i + 1);
                            console.log('empty array ' + this.bucketArray);
                            let usedIndices = new Set();
                            usedIndices.add(0);
                            let rootOfIDs = (0, tNode_1.sortedArrayToIDsBST)(this.buckets[0].bucketID - 1, this.buckets[this.buckets.length - 1].bucketID, usedIndices);
                            let bucketsRoot = this.convertToBucketBST(rootOfIDs, this.buckets);
                            console.log('Generated the buckets root ----------------------------------------------');
                            console.log(bucketsRoot);
                            this.basalBucket = this.numBuckets + 1;
                            this.ceilingBucket = -1;
                            this.currentNode = bucketsRoot;
                            this.tryMoveBucket(false);
                        });
                        return res;
                    }
                    else {
                        if (bucketGenMode === BucketGenMode.RandomBST) {
                            return new Promise((resolve, reject) => {
                                let usedIndices = new Set();
                                usedIndices.add(0);
                                let rootOfIDs = (0, tNode_1.sortedArrayToIDsBST)(this.buckets[0].bucketID - 1, this.buckets[this.buckets.length - 1].bucketID, usedIndices);
                                let bucketsRoot = this.convertToBucketBST(rootOfIDs, this.buckets);
                                console.log('Generated the buckets root ----------------------------------------------');
                                console.log(bucketsRoot);
                                this.basalBucket = this.numBuckets + 1;
                                this.ceilingBucket = -1;
                                this.currentNode = bucketsRoot;
                                this.tryMoveBucket(false);
                                resolve();
                            });
                        }
                        else if (bucketGenMode === BucketGenMode.LinearArrayBased) {
                            return new Promise((resolve, reject) => {
                                this.currentLinearBucketIndex = 0;
                                this.currentLinearTargetIndex = 0;
                                this.tryMoveBucket(false);
                                resolve();
                            });
                        }
                    }
                });
                this.convertToBucketBST = (node, buckets) => {
                    if (node === null)
                        return node;
                    let bucketId = node.value;
                    node.value = buckets.find((bucket) => bucket.bucketID === bucketId);
                    if (node.left !== null)
                        node.left = this.convertToBucketBST(node.left, buckets);
                    if (node.right !== null)
                        node.right = this.convertToBucketBST(node.right, buckets);
                    return node;
                };
                this.initBucket = (bucket) => {
                    this.currentBucket = bucket;
                    this.currentBucket.usedItems = [];
                    this.currentBucket.numTried = 0;
                    this.currentBucket.numCorrect = 0;
                    this.currentBucket.numConsecutiveWrong = 0;
                    this.currentBucket.tested = true;
                    this.currentBucket.passed = false;
                };
                this.handleAnswerButtonPress = (answer, elapsed) => {
                    if (this.bucketGenMode === BucketGenMode.RandomBST) {
                        analyticsEvents_2.AnalyticsEvents.sendAnswered(this.currentQuestion, answer, elapsed);
                    }
                    this.updateCurrentBucketValuesAfterAnswering(answer);
                    this.updateFeedbackAfterAnswer(answer);
                    setTimeout(() => {
                        console.log('Completed first Timeout');
                        this.onQuestionEnd();
                    }, 2000 * this.animationSpeedMultiplier);
                };
                this.onQuestionEnd = () => {
                    let questionEndTimeout = this.HasQuestionsLeft()
                        ? 500 * this.animationSpeedMultiplier
                        : 4000 * this.animationSpeedMultiplier;
                    const endOperations = () => {
                        uiController_3.UIController.SetFeedbackVisibile(false, false);
                        if (this.bucketGenMode === BucketGenMode.LinearArrayBased &&
                            uiController_3.UIController.getInstance().shownStarsCount < this.MAX_STARS_COUNT_IN_LINEAR_MODE) {
                            uiController_3.UIController.ChangeStarImageAfterAnimation();
                        }
                        else if (this.bucketGenMode === BucketGenMode.RandomBST) {
                            uiController_3.UIController.ChangeStarImageAfterAnimation();
                        }
                        if (this.HasQuestionsLeft()) {
                            if (this.bucketGenMode === BucketGenMode.LinearArrayBased && !this.isBucketControlsEnabled) {
                                if (this.currentLinearTargetIndex < this.buckets[this.currentLinearBucketIndex].items.length) {
                                    this.currentLinearTargetIndex++;
                                    this.currentBucket.usedItems = [];
                                }
                                if (this.currentLinearTargetIndex >= this.buckets[this.currentLinearBucketIndex].items.length &&
                                    this.currentLinearBucketIndex < this.buckets.length) {
                                    this.currentLinearBucketIndex++;
                                    this.currentLinearTargetIndex = 0;
                                    if (this.currentLinearBucketIndex < this.buckets.length) {
                                        this.tryMoveBucket(false);
                                    }
                                    else {
                                        console.log('No questions left');
                                        this.onEnd();
                                        return;
                                    }
                                }
                            }
                            uiController_3.UIController.ReadyForNext(this.buildNewQuestion());
                        }
                        else {
                            console.log('No questions left');
                            this.onEnd();
                        }
                    };
                    const timeoutPromise = new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, questionEndTimeout);
                    });
                    timeoutPromise.then(() => {
                        endOperations();
                        if (this.isInDevMode) {
                            this.updateBucketInfo();
                        }
                    });
                };
                this.buildNewQuestion = () => {
                    if (this.isLinearArrayExhausted()) {
                        return null;
                    }
                    const targetItem = this.selectTargetItem();
                    const foils = this.generateFoils(targetItem);
                    const answerOptions = this.shuffleAnswerOptions([targetItem, ...foils]);
                    const newQuestion = this.createQuestion(targetItem, answerOptions);
                    this.currentQuestion = newQuestion;
                    this.questionNumber += 1;
                    return newQuestion;
                };
                this.isLinearArrayExhausted = () => {
                    return (this.bucketGenMode === BucketGenMode.LinearArrayBased &&
                        this.currentLinearTargetIndex >= this.buckets[this.currentLinearBucketIndex].items.length);
                };
                this.selectTargetItem = () => {
                    let targetItem;
                    if (this.bucketGenMode === BucketGenMode.RandomBST) {
                        targetItem = this.selectRandomUnusedItem();
                    }
                    else if (this.bucketGenMode === BucketGenMode.LinearArrayBased) {
                        targetItem = this.buckets[this.currentLinearBucketIndex].items[this.currentLinearTargetIndex];
                        this.currentBucket.usedItems.push(targetItem);
                    }
                    return targetItem;
                };
                this.selectRandomUnusedItem = () => {
                    let item;
                    do {
                        item = (0, mathUtils_3.randFrom)(this.currentBucket.items);
                    } while (this.currentBucket.usedItems.includes(item));
                    this.currentBucket.usedItems.push(item);
                    return item;
                };
                this.generateFoils = (targetItem) => {
                    let foil1, foil2, foil3;
                    if (this.bucketGenMode === BucketGenMode.RandomBST) {
                        foil1 = this.generateRandomFoil(targetItem);
                        foil2 = this.generateRandomFoil(targetItem, foil1);
                        foil3 = this.generateRandomFoil(targetItem, foil1, foil2);
                    }
                    else if (this.bucketGenMode === BucketGenMode.LinearArrayBased) {
                        foil1 = this.generateLinearFoil(targetItem);
                        foil2 = this.generateLinearFoil(targetItem, foil1);
                        foil3 = this.generateLinearFoil(targetItem, foil1, foil2);
                    }
                    return [foil1, foil2, foil3];
                };
                this.generateRandomFoil = (targetItem, ...existingFoils) => {
                    let foil;
                    do {
                        foil = (0, mathUtils_3.randFrom)(this.currentBucket.items);
                    } while ([targetItem, ...existingFoils].includes(foil));
                    return foil;
                };
                this.generateLinearFoil = (targetItem, ...existingFoils) => {
                    let foil;
                    do {
                        foil = (0, mathUtils_3.randFrom)(this.buckets[this.currentLinearBucketIndex].items);
                    } while ([targetItem, ...existingFoils].includes(foil));
                    return foil;
                };
                this.shuffleAnswerOptions = (options) => {
                    (0, mathUtils_3.shuffleArray)(options);
                    return options;
                };
                this.createQuestion = (targetItem, answerOptions) => {
                    return {
                        qName: `question-${this.questionNumber}-${targetItem.itemName}`,
                        qNumber: this.questionNumber,
                        qTarget: targetItem.itemName,
                        promptText: '',
                        bucket: this.currentBucket.bucketID,
                        promptAudio: targetItem.itemName,
                        correct: targetItem.itemText,
                        answers: answerOptions.map((option) => ({
                            answerName: option.itemName,
                            answerText: option.itemText,
                        })),
                    };
                };
                this.tryMoveBucket = (passed) => {
                    if (this.bucketGenMode === BucketGenMode.RandomBST) {
                        this.tryMoveBucketRandomBST(passed);
                    }
                    else if (this.bucketGenMode === BucketGenMode.LinearArrayBased) {
                        this.tryMoveBucketLinearArrayBased(passed);
                    }
                };
                this.tryMoveBucketRandomBST = (passed) => {
                    const newBucket = this.currentNode.value;
                    if (this.currentBucket != null) {
                        this.currentBucket.passed = passed;
                        analyticsEvents_2.AnalyticsEvents.sendBucket(this.currentBucket, passed);
                    }
                    console.log('new  bucket is ' + newBucket.bucketID);
                    audioController_3.AudioController.PreloadBucket(newBucket, this.app.GetDataURL());
                    this.initBucket(newBucket);
                };
                this.tryMoveBucketLinearArrayBased = (passed) => {
                    const newBucket = this.buckets[this.currentLinearBucketIndex];
                    console.log('New Bucket: ' + newBucket.bucketID);
                    audioController_3.AudioController.PreloadBucket(newBucket, this.app.GetDataURL());
                    this.initBucket(newBucket);
                };
                this.HasQuestionsLeft = () => {
                    if (this.currentBucket.passed)
                        return false;
                    if (this.bucketGenMode === BucketGenMode.LinearArrayBased) {
                        return this.hasLinearQuestionsLeft();
                    }
                    if (this.currentBucket.numCorrect >= 4) {
                        return this.handlePassedBucket();
                    }
                    else if (this.currentBucket.numConsecutiveWrong >= 2 || this.currentBucket.numTried >= 5) {
                        return this.handleFailedBucket();
                    }
                    return true;
                };
                this.hasLinearQuestionsLeft = () => {
                    if (this.currentLinearBucketIndex >= this.buckets.length &&
                        this.currentLinearTargetIndex >= this.buckets[this.currentLinearBucketIndex].items.length) {
                        return false;
                    }
                    else {
                        return true;
                    }
                };
                this.handlePassedBucket = () => {
                    console.log('Passed this bucket ' + this.currentBucket.bucketID);
                    if (this.currentBucket.bucketID >= this.numBuckets) {
                        return this.passHighestBucket();
                    }
                    else {
                        return this.moveUpToNextBucket();
                    }
                };
                this.handleFailedBucket = () => {
                    console.log('Failed this bucket ' + this.currentBucket.bucketID);
                    if (this.currentBucket.bucketID < this.basalBucket) {
                        this.basalBucket = this.currentBucket.bucketID;
                    }
                    if (this.currentBucket.bucketID <= 1) {
                        return this.failLowestBucket();
                    }
                    else {
                        return this.moveDownToPreviousBucket();
                    }
                };
                this.passHighestBucket = () => {
                    console.log('Passed highest bucket');
                    this.currentBucket.passed = true;
                    if (this.bucketGenMode === BucketGenMode.RandomBST) {
                        analyticsEvents_2.AnalyticsEvents.sendBucket(this.currentBucket, true);
                    }
                    uiController_3.UIController.ProgressChest();
                    return false;
                };
                this.moveUpToNextBucket = () => {
                    if (this.currentNode.right != null) {
                        console.log('Moving to right node');
                        if (this.bucketGenMode === BucketGenMode.RandomBST) {
                            this.currentNode = this.currentNode.right;
                        }
                        else {
                            this.currentLinearBucketIndex++;
                        }
                        this.tryMoveBucket(true);
                    }
                    else {
                        console.log('Reached root node');
                        this.currentBucket.passed = true;
                        if (this.bucketGenMode === BucketGenMode.RandomBST) {
                            analyticsEvents_2.AnalyticsEvents.sendBucket(this.currentBucket, true);
                        }
                        uiController_3.UIController.ProgressChest();
                        return false;
                    }
                    return true;
                };
                this.failLowestBucket = () => {
                    console.log('Failed lowest bucket !');
                    this.currentBucket.passed = false;
                    if (this.bucketGenMode === BucketGenMode.RandomBST) {
                        analyticsEvents_2.AnalyticsEvents.sendBucket(this.currentBucket, false);
                    }
                    return false;
                };
                this.moveDownToPreviousBucket = () => {
                    console.log('Moving down bucket !');
                    if (this.currentNode.left != null) {
                        console.log('Moving to left node');
                        if (this.bucketGenMode === BucketGenMode.RandomBST) {
                            this.currentNode = this.currentNode.left;
                        }
                        else {
                            this.currentLinearBucketIndex++;
                        }
                        this.tryMoveBucket(false);
                    }
                    else {
                        console.log('Reached root node !');
                        this.currentBucket.passed = false;
                        if (this.bucketGenMode === BucketGenMode.RandomBST) {
                            analyticsEvents_2.AnalyticsEvents.sendBucket(this.currentBucket, false);
                        }
                        return false;
                    }
                    return true;
                };
                this.dataURL = dataURL;
                this.unityBridge = unityBridge;
                this.questionNumber = 0;
                console.log('app initialized');
                this.setupUIHandlers();
            }
            setupUIHandlers() {
                uiController_3.UIController.SetButtonPressAction(this.handleAnswerButtonPress);
                uiController_3.UIController.SetStartAction(this.startAssessment);
                uiController_3.UIController.SetExternalBucketControlsGenerationHandler(this.generateDevModeBucketControlsInContainer);
            }
            Run(applink) {
                this.app = applink;
                this.buildBuckets(this.bucketGenMode).then((result) => {
                    console.log(this.currentBucket);
                    this.unityBridge.SendLoaded();
                });
            }
            handleBucketGenModeChange(event) {
                this.bucketGenMode = parseInt(this.devModeBucketGenSelect.value);
                this.buildBuckets(this.bucketGenMode).then(() => {
                });
                this.updateBucketInfo();
            }
            handleCorrectLabelShownChange() {
                uiController_3.UIController.getInstance().SetCorrectLabelVisibility(this.isCorrectLabelShown);
            }
            handleAnimationSpeedMultiplierChange() {
                uiController_3.UIController.getInstance().SetAnimationSpeedMultiplier(this.animationSpeedMultiplier);
            }
            handleBucketInfoShownChange() {
                this.updateBucketInfo();
            }
            handleBucketControlsShownChange() {
                uiController_3.UIController.getInstance().SetBucketControlsVisibility(this.isBucketControlsEnabled);
            }
            updateFeedbackAfterAnswer(answer) {
                if (this.bucketGenMode === BucketGenMode.LinearArrayBased &&
                    uiController_3.UIController.getInstance().shownStarsCount < this.MAX_STARS_COUNT_IN_LINEAR_MODE) {
                    uiController_3.UIController.AddStar();
                }
                else if (this.bucketGenMode === BucketGenMode.RandomBST) {
                    uiController_3.UIController.AddStar();
                }
                uiController_3.UIController.SetFeedbackVisibile(true, this.currentQuestion.answers[answer - 1].answerName == this.currentQuestion.correct);
            }
            updateCurrentBucketValuesAfterAnswering(answer) {
                this.currentBucket.numTried += 1;
                if (this.currentQuestion.answers[answer - 1].answerName == this.currentQuestion.correct) {
                    this.currentBucket.numCorrect += 1;
                    this.currentBucket.numConsecutiveWrong = 0;
                    mathUtils_3.MathUtils.correctMove += 1;
                    console.log('Answered correctly');
                }
                else {
                    mathUtils_3.MathUtils.wrongMove += 1;
                    this.currentBucket.numConsecutiveWrong += 1;
                    console.log('Answered incorrectly, ' + this.currentBucket.numConsecutiveWrong);
                }
            }
            onEnd() {
                analyticsEvents_2.AnalyticsEvents.sendFinished(this.buckets, this.basalBucket, this.ceilingBucket);
                uiController_3.UIController.ShowEnd();
                this.app.unityBridge.SendClose();
            }
        }
        exports.Assessment = Assessment;
    });
    define("components/cacheModel", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
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
        exports.default = CacheModel;
    });
    define("App", ["require", "exports", "utils/urlUtils", "survey/survey", "assessment/assessment", "utils/unityBridge", "analytics/analyticsEvents", "utils/jsonUtils", "components/cacheModel", "ui/uiController", "utils/androidBridge"], function (require, exports, urlUtils_3, survey_1, assessment_1, unityBridge_1, analyticsEvents_3, jsonUtils_4, cacheModel_1, uiController_4, androidBridge_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.App = void 0;
        cacheModel_1 = __importDefault(cacheModel_1);
        const appVersion = 'v1.1.3';
        let contentVersion = '';
        let loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('progressBar');
        const broadcastChannel = new BroadcastChannel('as-message-channel');
        window.onDataFromAndroid = function (responseJson) {
            androidBridge_2.AndroidBridge._handleDataFromAndroid(responseJson);
        };
        class App {
            constructor() {
                this.lang = 'english';
                this.unityBridge = new unityBridge_1.UnityBridge();
                console.log('Initializing app...');
                this.dataURL = (0, urlUtils_3.getDataFile)();
                this.cacheModel = new cacheModel_1.default(this.dataURL, this.dataURL, new Set());
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
                // const fapp = (0, app_1.initializeApp)(firebaseConfig);
                // const fanalytics = (0, analytics_3.getAnalytics)(fapp);
                // this.analytics = fanalytics;
                // (0, analytics_3.logEvent)(fanalytics, 'notification_received');
                // (0, analytics_3.logEvent)(fanalytics, 'test initialization event', {});
                // console.log('firebase initialized');
            }
            spinUp() {
                return __awaiter(this, void 0, void 0, function* () {
                    window.addEventListener('load', () => __awaiter(this, void 0, void 0, function* () {
                        console.log('Window Loaded!');
                        console.log('Inside Assessment Survey App');
                        try {
                            const data = yield androidBridge_2.AndroidBridge.requestInstalledAppInfo();
                            jsonUtils_4.GlobalFlags.isRespect = true;
                        }
                        catch (err) {
                            console.error("Error in installedAppInfo promise:", err);
                        }
                        (() => __awaiter(this, void 0, void 0, function* () {
                            yield (0, jsonUtils_4.fetchAppData)(this.dataURL).then((data) => {
                                console.log('Assessment/Survey ' + appVersion + ' initializing!');
                                console.log('App data loaded!');
                                console.log(data);
                                this.cacheModel.setContentFilePath((0, jsonUtils_4.getDataURL)(this.dataURL));
                                console.log('Anuj  :: ' + this.dataURL);
                                uiController_4.UIController.SetFeedbackText(data['feedbackText']);
                                let appType = data['appType'];
                                let assessmentType = data['assessmentType'];
                                if (appType == 'survey') {
                                    this.game = new survey_1.Survey(this.dataURL, this.unityBridge);
                                }
                                else if (appType == 'assessment') {
                                    let buckets = data['buckets'];
                                    for (let i = 0; i < buckets.length; i++) {
                                        for (let j = 0; j < buckets[i].items.length; j++) {
                                            let audioItemURL;
                                            if (data['quizName'].includes('Luganda') ||
                                                data['quizName'].toLowerCase().includes('west african english')) {
                                                audioItemURL =
                                                    '/audio/' + this.dataURL + '/' + buckets[i].items[j].itemName.toLowerCase().trim() + '.mp3';
                                            }
                                            else {
                                                audioItemURL = '/audio/' + this.dataURL + '/' + buckets[i].items[j].itemName.trim() + '.mp3';
                                            }
                                            this.cacheModel.addItemToAudioVisualResources(audioItemURL);
                                        }
                                    }
                                    this.cacheModel.addItemToAudioVisualResources('/audio/' + this.dataURL + '/answer_feedback.mp3');
                                    this.cacheModel.addItemToAudioVisualResources('/audio/Correct.wav');
                                    this.game = new assessment_1.Assessment(this.dataURL, this.unityBridge);
                                }
                                this.game.unityBridge = this.unityBridge;
                                analyticsEvents_3.AnalyticsEvents.setUuid((0, urlUtils_3.getUUID)(), (0, urlUtils_3.getUserSource)());
                                analyticsEvents_3.AnalyticsEvents.linkAnalytics(this.analytics, this.dataURL);
                                analyticsEvents_3.AnalyticsEvents.setAssessmentType(assessmentType);
                                contentVersion = data['contentVersion'];
                                analyticsEvents_3.AnalyticsEvents.sendInit(appVersion, data['contentVersion']);
                                if (this.game) {
                                    this.game.Run(this);
                                }
                            });
                            if (jsonUtils_4.GlobalFlags.isRespect) {
                                console.warn("--------------------------------Respect mode enabled. Simulating fake loading progress--------------------------------");
                                this.simulateFakeCachingProgress(this.lang);
                            }
                            else {
                                console.log("----------------------------------Respect mode disabled. Registering Workbox----------------------------------");
                                yield this.registerServiceWorker(this.game, this.dataURL);
                            }
                        }))();
                    }));
                });
            }
            simulateFakeCachingProgress(lang) {
                const bookName = (0, urlUtils_3.getDataFile)();
                const steps = [25, 50, 75, 100];
                steps.forEach((val, i) => {
                    setTimeout(() => {
                        handleLoadingMessage({
                            data: { progress: val, bookName: bookName }
                        }, val);
                        if (val === 100) {
                            localStorage.setItem(bookName, 'true');
                            loadingScreen.style.display = 'none';
                            uiController_4.UIController.SetContentLoaded(true);
                        }
                    }, i * 700);
                });
            }
            registerServiceWorker(game, dataURL = '') {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('Registering service worker...');
                    if ('serviceWorker' in navigator) {
                        let wb = new workbox_window_1.Workbox('./sw.js', {});
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
                                uiController_4.UIController.SetContentLoaded(true);
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
        exports.App = App;
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
            var _a, _b, _c;
            const lessonId = (0, urlUtils_3.getDataFile)();
            console.log('Lesson ID:', lessonId);
            const bookName = ((_b = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.bookName) ||
                ((_c = event === null || event === void 0 ? void 0 : event.data) === null || _c === void 0 ? void 0 : _c.bookName) ||
                (event === null || event === void 0 ? void 0 : event.bookName) ||
                lessonId;
            if (progressValue < 40 && progressValue >= 10) {
                progressBar.style.width = progressValue + '%';
            }
            else if (progressValue >= 100) {
                progressBar.style.width = 100 + '%';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    uiController_4.UIController.SetContentLoaded(true);
                }, 1500);
                localStorage.setItem(bookName, 'true');
                console.log('Cached book-------------------: ' + bookName);
                readLanguageDataFromCacheAndNotifyAndroidApp(bookName);
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
    });
    //# sourceMappingURL=bundle.js.map
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        if (typeof define.factory !== 'function') {
            return define.factory;
        }
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve("App");
    }
})();