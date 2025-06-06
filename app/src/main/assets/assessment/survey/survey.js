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
import { AudioController } from '../components/audioController';
import { AnalyticsEvents } from '../analytics/analyticsEvents';
import { BaseQuiz } from '../baseQuiz';
import { fetchSurveyQuestions } from '../utils/jsonUtils';
export class Survey extends BaseQuiz {
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
            UIController.ReadyForNext(this.buildNewQuestion());
        };
        this.onQuestionEnd = () => {
            UIController.SetFeedbackVisibile(false, false);
            this.currentQuestionIndex += 1;
            setTimeout(() => {
                if (this.HasQuestionsLeft()) {
                    UIController.ReadyForNext(this.buildNewQuestion());
                }
                else {
                    console.log('There are no questions left.');
                    this.onEnd();
                }
            }, 500);
        };
        this.handleAnswerButtonPress = (answer, elapsed) => {
            AnalyticsEvents.sendAnswered(this.questionsData[this.currentQuestionIndex], answer, elapsed);
            UIController.SetFeedbackVisibile(true, true);
            UIController.AddStar();
            setTimeout(() => {
                this.onQuestionEnd();
            }, 2000);
        };
        this.buildQuestionList = () => {
            const surveyQuestions = fetchSurveyQuestions(this.app.dataURL);
            return surveyQuestions;
        };
        console.log('Survey initialized');
        this.dataURL = dataURL;
        this.unityBridge = unityBridge;
        this.currentQuestionIndex = 0;
        UIController.SetButtonPressAction(this.handleAnswerButtonPress);
        UIController.SetStartAction(this.startSurvey);
    }
    handleAnimationSpeedMultiplierChange() {
        console.log('Animation Speed Multiplier Changed');
    }
    Run(app) {
        return __awaiter(this, void 0, void 0, function* () {
            this.app = app;
            this.buildQuestionList().then((result) => {
                this.questionsData = result;
                AudioController.PrepareAudioAndImagesForSurvey(this.questionsData, this.app.GetDataURL());
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
//# sourceMappingURL=survey.js.map