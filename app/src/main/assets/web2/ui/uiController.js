import { AudioController } from '../components/audioController';
import { shuffleArray } from '../utils/mathUtils';
import { getDataFile } from '../utils/urlUtils';
export class UIController {
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
        shuffleArray(this.stars);
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
            if (localStorage.getItem(getDataFile()) && UIController.getInstance().contentLoaded) {
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
                            const tmpimg = AudioController.GetImage(curAnswer.answerImg);
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
                AudioController.PlayCorrect();
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
                AudioController.PlayAudio(newQ.promptAudio, UIController.getInstance().showOptions, UIController.ShowAudioAnimation);
            });
        }
        else {
            UIController.getInstance().playButton.innerHTML =
                "<button id='nextqButton'><img class=audio-button width='100px' height='100px' src='/img/SoundButton_Idle.png' type='image/svg+xml'> </img></button>";
            var nextQuestionButton = document.getElementById('nextqButton');
            nextQuestionButton.addEventListener('click', function () {
                UIController.ShowQuestion();
                AudioController.PlayAudio(newQ.promptAudio, UIController.getInstance().showOptions, UIController.ShowAudioAnimation);
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
                    AudioController.PlayAudio(newQuestion.promptAudio, undefined, UIController.ShowAudioAnimation);
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
                    AudioController.PlayAudio(newQuestion.promptAudio, undefined, UIController.ShowAudioAnimation);
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
            var tmpimg = AudioController.GetImage(newQuestion.promptImg);
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
            AudioController.PlayDing();
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
UIController.instance = null;
//# sourceMappingURL=uiController.js.map