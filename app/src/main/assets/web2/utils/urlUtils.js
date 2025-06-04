export function getAppType() {
    const pathParams = getPathName();
    const appType = pathParams.get('appType');
    return appType;
}
export function getUUID() {
    const pathParams = getPathName();
    var nuuid = pathParams.get('cr_user_id');
    if (nuuid == undefined) {
        console.log('no uuid provided');
        nuuid = 'WebUserNoID';
    }
    return nuuid;
}
export function getUserSource() {
    const pathParams = getPathName();
    var nuuid = pathParams.get('userSource');
    if (nuuid == undefined) {
        console.log('no user source provided');
        nuuid = 'WebUserNoSource';
    }
    return nuuid;
}
export function getDataFile() {
    const pathParams = getPathName();
    var data = pathParams.get('data');
    if (data == undefined) {
        console.log('default data file');
        data = 'zulu-lettersounds';
    }
    return data;
}
function getPathName() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams;
}
//# sourceMappingURL=urlUtils.js.map