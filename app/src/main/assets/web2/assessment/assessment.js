var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UIController } from '../ui/uiController';
import { AnalyticsEvents } from '../analytics/analyticsEvents';
import { BaseQuiz } from '../baseQuiz';
import { fetchAssessmentBuckets } from '../utils/jsonUtils';
import { sortedArrayToIDsBST } from '../components/tNode';
import { randFrom, shuffleArray } from '../utils/mathUtils';
import { AudioController } from '../components/audioController';
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
export class Assessment extends BaseQuiz {
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
                        UIController.getInstance().answersContainer.style.visibility = 'hidden';
                        for (let b in UIController.getInstance().buttons) {
                            UIController.getInstance().buttons[b].style.visibility = 'hidden';
                        }
                        UIController.getInstance().shown = false;
                        UIController.getInstance().nextQuestion = newQ;
                        UIController.getInstance().questionsContainer.innerHTML = '';
                        UIController.getInstance().questionsContainer.style.display = 'none';
                        UIController.ShowQuestion(newQ);
                        AudioController.PlayAudio(this.buildNewQuestion().promptAudio, UIController.getInstance().showOptions, UIController.ShowAudioAnimation);
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
                        UIController.ReadyForNext(this.buildNewQuestion());
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
                        UIController.ReadyForNext(this.buildNewQuestion());
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
            UIController.ReadyForNext(this.buildNewQuestion());
            if (this.isInDevMode) {
                this.hideDevModeButton();
            }
        };
        this.buildBuckets = (bucketGenMode) => __awaiter(this, void 0, void 0, function* () {
            if (this.buckets === undefined || this.buckets.length === 0) {
                const res = fetchAssessmentBuckets(this.app.GetDataURL()).then((result) => {
                    this.buckets = result;
                    this.numBuckets = result.length;
                    console.log('buckets: ' + this.buckets);
                    this.bucketArray = Array.from(Array(this.numBuckets), (_, i) => i + 1);
                    console.log('empty array ' + this.bucketArray);
                    let usedIndices = new Set();
                    usedIndices.add(0);
                    let rootOfIDs = sortedArrayToIDsBST(this.buckets[0].bucketID - 1, this.buckets[this.buckets.length - 1].bucketID, usedIndices);
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
                        let rootOfIDs = sortedArrayToIDsBST(this.buckets[0].bucketID - 1, this.buckets[this.buckets.length - 1].bucketID, usedIndices);
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
                AnalyticsEvents.sendAnswered(this.currentQuestion, answer, elapsed);
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
                UIController.SetFeedbackVisibile(false, false);
                if (this.bucketGenMode === BucketGenMode.LinearArrayBased &&
                    UIController.getInstance().shownStarsCount < this.MAX_STARS_COUNT_IN_LINEAR_MODE) {
                    UIController.ChangeStarImageAfterAnimation();
                }
                else if (this.bucketGenMode === BucketGenMode.RandomBST) {
                    UIController.ChangeStarImageAfterAnimation();
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
                    UIController.ReadyForNext(this.buildNewQuestion());
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
                item = randFrom(this.currentBucket.items);
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
                foil = randFrom(this.currentBucket.items);
            } while ([targetItem, ...existingFoils].includes(foil));
            return foil;
        };
        this.generateLinearFoil = (targetItem, ...existingFoils) => {
            let foil;
            do {
                foil = randFrom(this.buckets[this.currentLinearBucketIndex].items);
            } while ([targetItem, ...existingFoils].includes(foil));
            return foil;
        };
        this.shuffleAnswerOptions = (options) => {
            shuffleArray(options);
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
                AnalyticsEvents.sendBucket(this.currentBucket, passed);
            }
            console.log('new  bucket is ' + newBucket.bucketID);
            AudioController.PreloadBucket(newBucket, this.app.GetDataURL());
            this.initBucket(newBucket);
        };
        this.tryMoveBucketLinearArrayBased = (passed) => {
            const newBucket = this.buckets[this.currentLinearBucketIndex];
            console.log('New Bucket: ' + newBucket.bucketID);
            AudioController.PreloadBucket(newBucket, this.app.GetDataURL());
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
                AnalyticsEvents.sendBucket(this.currentBucket, true);
            }
            UIController.ProgressChest();
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
                    AnalyticsEvents.sendBucket(this.currentBucket, true);
                }
                UIController.ProgressChest();
                return false;
            }
            return true;
        };
        this.failLowestBucket = () => {
            console.log('Failed lowest bucket !');
            this.currentBucket.passed = false;
            if (this.bucketGenMode === BucketGenMode.RandomBST) {
                AnalyticsEvents.sendBucket(this.currentBucket, false);
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
                    AnalyticsEvents.sendBucket(this.currentBucket, false);
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
        UIController.SetButtonPressAction(this.handleAnswerButtonPress);
        UIController.SetStartAction(this.startAssessment);
        UIController.SetExternalBucketControlsGenerationHandler(this.generateDevModeBucketControlsInContainer);
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
        UIController.getInstance().SetCorrectLabelVisibility(this.isCorrectLabelShown);
    }
    handleAnimationSpeedMultiplierChange() {
        UIController.getInstance().SetAnimationSpeedMultiplier(this.animationSpeedMultiplier);
    }
    handleBucketInfoShownChange() {
        this.updateBucketInfo();
    }
    handleBucketControlsShownChange() {
        UIController.getInstance().SetBucketControlsVisibility(this.isBucketControlsEnabled);
    }
    updateFeedbackAfterAnswer(answer) {
        if (this.bucketGenMode === BucketGenMode.LinearArrayBased &&
            UIController.getInstance().shownStarsCount < this.MAX_STARS_COUNT_IN_LINEAR_MODE) {
            UIController.AddStar();
        }
        else if (this.bucketGenMode === BucketGenMode.RandomBST) {
            UIController.AddStar();
        }
        UIController.SetFeedbackVisibile(true, this.currentQuestion.answers[answer - 1].answerName == this.currentQuestion.correct);
    }
    updateCurrentBucketValuesAfterAnswering(answer) {
        this.currentBucket.numTried += 1;
        if (this.currentQuestion.answers[answer - 1].answerName == this.currentQuestion.correct) {
            this.currentBucket.numCorrect += 1;
            this.currentBucket.numConsecutiveWrong = 0;
            console.log('Answered correctly');
        }
        else {
            this.currentBucket.numConsecutiveWrong += 1;
            console.log('Answered incorrectly, ' + this.currentBucket.numConsecutiveWrong);
        }
    }
    onEnd() {
        AnalyticsEvents.sendFinished(this.buckets, this.basalBucket, this.ceilingBucket);
        UIController.ShowEnd();
        this.app.unityBridge.SendClose();
    }
}
//# sourceMappingURL=assessment.js.map