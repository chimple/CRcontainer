import { UIController } from './ui/uiController';
export class BaseQuiz {
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
        UIController.ShowEnd();
        this.app.unityBridge.SendClose();
    }
}
//# sourceMappingURL=baseQuiz.js.map