import { getCaseIndependentLangList } from '../utils/jsonUtils';
export class AudioController {
    constructor() {
        this.imageToCache = [];
        this.wavToCache = [];
        this.allAudios = {};
        this.allImages = {};
        this.dataURL = '';
        this.correctSoundPath = 'dist/audio/Correct.wav';
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
        if (getCaseIndependentLangList().includes(AudioController.getInstance().dataURL.split('-')[0])) {
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
AudioController.instance = null;
//# sourceMappingURL=audioController.js.map