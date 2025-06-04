import { logEvent } from 'firebase/analytics';
export class AnalyticsEvents {
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
        logEvent(AnalyticsEvents.gana, 'opened', {});
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
        logEvent(AnalyticsEvents.gana, 'user_location', {
            user: AnalyticsEvents.uuid,
            lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
            app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
            latlong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
        });
        console.log('INITIALIZED EVENT SENT');
        console.log('App Language: ' + AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL));
        console.log('App Type: ' + AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL));
        console.log('App Version: ' + AnalyticsEvents.appVersion);
        console.log('Content Version: ' + AnalyticsEvents.contentVersion);
        logEvent(AnalyticsEvents.gana, 'initialized', {
            type: 'initialized',
            clUserId: AnalyticsEvents.uuid,
            userSource: AnalyticsEvents.userSource,
            latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
            appVersion: AnalyticsEvents.appVersion,
            contentVersion: AnalyticsEvents.contentVersion,
            app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
            lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
        });
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
        logEvent(AnalyticsEvents.gana, 'answered', {
            type: 'answered',
            clUserId: AnalyticsEvents.uuid,
            userSource: AnalyticsEvents.userSource,
            latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
            app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
            lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
            dt: elapsed,
            question_number: theQ.qNumber,
            target: theQ.qTarget,
            question: theQ.promptText,
            selected_answer: ans.answerName,
            iscorrect: iscorrect,
            options: opts,
            bucket: bucket,
            appVersion: AnalyticsEvents.appVersion,
            contentVersion: AnalyticsEvents.contentVersion,
        });
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
        logEvent(AnalyticsEvents.gana, 'bucketCompleted', {
            type: 'bucketCompleted',
            clUserId: AnalyticsEvents.uuid,
            userSource: AnalyticsEvents.userSource,
            latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
            app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
            lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
            bucketNumber: bn,
            numberTriedInBucket: btried,
            numberCorrectInBucket: bcorrect,
            passedBucket: passed,
            appVersion: AnalyticsEvents.appVersion,
            contentVersion: AnalyticsEvents.contentVersion,
        });
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
        AnalyticsEvents.sendDataToThirdParty(score, AnalyticsEvents.uuid);
        if (window.parent) {
            window.parent.postMessage({
                type: 'assessment_completed',
                score: score,
            }, 'https://synapse.curiouscontent.org/');
        }
        logEvent(AnalyticsEvents.gana, 'completed', {
            type: 'completed',
            clUserId: AnalyticsEvents.uuid,
            userSource: AnalyticsEvents.userSource,
            app: AnalyticsEvents.getAppTypeFromDataURL(AnalyticsEvents.dataURL),
            lang: AnalyticsEvents.getAppLanguageFromDataURL(AnalyticsEvents.dataURL),
            latLong: AnalyticsEvents.joinLatLong(AnalyticsEvents.clat, AnalyticsEvents.clon),
            score: score,
            maxScore: maxScore,
            basalBucket: basalBucketID,
            ceilingBucket: ceilingBucketID,
            appVersion: AnalyticsEvents.appVersion,
            contentVersion: AnalyticsEvents.contentVersion,
        });
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
//# sourceMappingURL=analyticsEvents.js.map