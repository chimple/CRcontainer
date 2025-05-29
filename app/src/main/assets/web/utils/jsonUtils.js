var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getDataFile } from './urlUtils';
export const GlobalFlags = {
    isRespect: true,
};
export function fetchAppData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (GlobalFlags.isRespect) {
            const lessonId = getDataFile();
            const furl = `/data/${lessonId}.json`;
            return fetch(furl).then((response) => response.json());
        }
        return loadData(url).then((data) => data);
    });
}
export function fetchAppType(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return loadData(url).then((data) => {
            return data['appType'];
        });
    });
}
export function fetchFeedback(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return loadData(url).then((data) => {
            return data['feedbackText'];
        });
    });
}
export function fetchSurveyQuestions(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return loadData(url).then((data) => {
            return data['questions'];
        });
    });
}
export function fetchAssessmentBuckets(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return loadData(url).then((data) => {
            return data['buckets'];
        });
    });
}
export function getDataURL(url) {
    return '/data/' + url + '.json';
}
export function getCaseIndependentLangList() {
    return ['luganda'];
}
function loadData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var furl = getDataURL(url);
        return fetch(furl).then((response) => response.json());
    });
}
//# sourceMappingURL=jsonUtils.js.map