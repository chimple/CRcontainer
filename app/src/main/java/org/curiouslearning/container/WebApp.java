package org.curiouslearning.container;
import static org.curiouslearning.container.MainActivity.activity_id;
import org.curiouslearning.container.server.AppServer;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
//import android.content.res.AssetManager;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;

import org.curiouslearning.container.firebase.AnalyticsUtils;
import org.curiouslearning.container.presentation.base.BaseActivity;
import org.curiouslearning.container.utilities.AppUtils;
import org.curiouslearning.container.utilities.ConnectionUtils;
import org.curiouslearning.container.utilities.AudioPlayer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WebApp extends BaseActivity {

    private String title;
    private String appUrl;
    private WebView webView;
    private AppServer localWebServer;
    private SharedPreferences sharedPref;
    private SharedPreferences utmPrefs;
    private String urlIndex;
    private String language;
    private String languageInEnglishName;
    private String pseudoId;
    private boolean isDataCached;
    private String source;
    private String campaignId;

    private static final String SHARED_PREFS_NAME = "appCached";
    private static final String UTM_PREFS_NAME = "utmPrefs";
    private AudioPlayer audioPlayer;
    private static final String TAG = "WebApp";

    private static String lesonId = "";
    private String assetFolder = "web";

    // @Override
    // protected void onCreate(Bundle savedInstanceState) {
    //     super.onCreate(savedInstanceState);
    //     audioPlayer = new AudioPlayer();
    //     setContentView(R.layout.activity_web_app);
    //     getIntentData();
    //     if(appUrl.equals("-1")) {
    //         activity_id = "";
    //         Toast.makeText(this, "Activity ID is Invalid!", Toast.LENGTH_SHORT).show();
    //         finish();
    //     }
    //     initViews();
    //     logAppLaunchEvent();
    //     loadWebView();
    // }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        audioPlayer = new AudioPlayer();
        setContentView(R.layout.activity_web_app);
        getIntentData();
        
        Log.d(TAG, "onCreate: appUrl = " + appUrl);
        
        if(appUrl.equals("-1")) {
            activity_id = "";
            Toast.makeText(this, "Activity ID is Invalid!", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        
        initViews();
        logAppLaunchEvent();

        // Start local server for FTM
        if (appUrl.startsWith("http://localhost:8080")) {
            try {
                Log.d(TAG, "Starting local server on port 8080");
                localWebServer = new AppServer(this, 8080, "web");
                localWebServer.start();
                Log.d(TAG, "Local server started successfully");
            } catch (IOException e) {
                Log.e(TAG, "Failed to start local server", e);
                Toast.makeText(this, "Failed to start local server", Toast.LENGTH_SHORT).show();
            }
        }

        // Load the WebView
        webView = findViewById(R.id.web_app);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView error: " + description);
                Toast.makeText(WebApp.this, "Error loading content: " + description, Toast.LENGTH_SHORT).show();
            }
        });
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        Log.d(TAG, "Loading URL in WebView: " + appUrl);
        webView.loadUrl(appUrl);
    }

    private void getIntentData() {
    Intent intent = getIntent();
    if (intent != null) {
        urlIndex = intent.getStringExtra("appId");
        title = intent.getStringExtra("title");
        appUrl = "http://localhost:8080/index.html";
        language = intent.getStringExtra("language");
        languageInEnglishName = intent.getStringExtra("languageInEnglishName");
        String folder = intent.getStringExtra("assetFolder");
        if (folder != null) assetFolder = folder;
        Log.d(TAG, "appUrl : " + appUrl + ", assetFolder: " + assetFolder);
    }
}

    private void initViews() {
        sharedPref = getApplicationContext().getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE);
        utmPrefs = getApplicationContext().getSharedPreferences(UTM_PREFS_NAME, Context.MODE_PRIVATE);
        isDataCached = sharedPref.getBoolean(String.valueOf(urlIndex), false);
        pseudoId = sharedPref.getString("pseudoId", "");
        source = utmPrefs.getString("source", "");
        campaignId = utmPrefs.getString("campaign_id", "");
        ImageView goBack = findViewById(R.id.button2);
        goBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                logAppExitEvent();
                activity_id = "";
                audioPlayer.play(WebApp.this, R.raw.sound_button_pressed);
                finish();
            }
        });
    }

    private void loadWebView() {
        if (!isInternetConnected(getApplicationContext()) && !isDataCached) {
            showPrompt("Please Connect to the Network");
            return;
        }

        webView = findViewById(R.id.web_app);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setWebViewClient(new WebViewClient());
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().getDomStorageEnabled();
        webView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        if (appUrl.contains("feedthemonster")) {
            System.out
                    .println(">> url source and campaign params added to the subapp url " + source + " " + campaignId);
            if (source != null && !source.isEmpty()) {
                appUrl = addSourceToUrl(appUrl);
            }
            if (campaignId != null && !campaignId.isEmpty()) {
                appUrl = addCampaignIdToUrl(appUrl);
            }
        }
        webView.loadUrl(addCrUserIdToUrl(appUrl));
        System.out.println("subapp url : " + appUrl);
        webView.setWebChromeClient(new WebChromeClient() {
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WebView", consoleMessage.message());
                return true;
            }
        });
    }

    private String addCrUserIdToUrl(String appUrl) {
        Uri originalUri = Uri.parse(appUrl);
        String separator = (originalUri.getQuery() == null) ? "?" : "&";
        String modifiedUrl = originalUri.toString() + separator + "cr_user_id=" + pseudoId;
        return modifiedUrl;
    }

    private String addSourceToUrl(String appUrl) {
        Uri originalUri = Uri.parse(appUrl);
        String separator = (originalUri.getQuery() == null) ? "?" : "&";
        String modifiedUrl = originalUri.toString() + separator + "source=" + source;
        return modifiedUrl;
    }

    private String addCampaignIdToUrl(String appUrl) {
        Uri originalUri = Uri.parse(appUrl);
        String separator = (originalUri.getQuery() == null) ? "?" : "&";
        String modifiedUrl = originalUri.toString() + separator + "campaign_id=" + campaignId;
        return modifiedUrl;
    }

    private boolean isInternetConnected(Context context) {
        return ConnectionUtils.getInstance().isInternetConnected(context);
    }

    private void showPrompt(String message) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setMessage(message)
                .setCancelable(false)
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        finish();
                    }
                });
        AlertDialog alert = builder.create();
        alert.show();
    }

    private String encodeFileToBase64(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] bytes = new byte[(int) file.length()];
            int read = fis.read(bytes);
            if (read != bytes.length) {
                throw new IOException("Could not read entire file");
            }
            return Base64.encodeToString(bytes, Base64.NO_WRAP);
        }
    }

    public JSONObject convertMapToJson(Map<String, Object> tempMap) throws JSONException, IOException {
        JSONObject tempData = new JSONObject();

        for (Map.Entry<String, Object> entry : tempMap.entrySet()) {
            Object value = entry.getValue();

            if (value instanceof File) {
                File file = (File) value;
                String base64Data = encodeFileToBase64(file);
                tempData.put(entry.getKey(), base64Data);
            } else {
                tempData.put(entry.getKey(), value);
            }
        }

        return tempData;
    }


 /****** Please don't remove any of the commented code and imports ****************/
    private File createTempFileFromAssets(String assetFileName) throws IOException {
        AssetManager assetManager = this.getAssets();
        InputStream inputStream = assetManager.open(assetFileName);

        File outFile = new File(this.getCacheDir(), assetFileName);
        OutputStream outputStream = Files.newOutputStream(outFile.toPath());

        byte[] buffer = new byte[1024];
        int read;
        while ((read = inputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, read);
        }

        inputStream.close();
        outputStream.flush();
        outputStream.close();

        return outFile;
    }

    private boolean isAssetFile(String filename) {
        try {
            String[] assetFiles = this.getAssets().list("");
            for (String name : assetFiles) {
                if (name.equals(filename)) {
                    return true;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    public JSONObject convertMapToJsonWithAssets(Map<String, Object> tempMap) throws JSONException, IOException {
        JSONObject tempData = new JSONObject();
        AssetManager assetManager = this.getAssets();

        for (Map.Entry<String, Object> entry : tempMap.entrySet()) {
            Object value = entry.getValue();

            if (value instanceof File) {
                File file = (File) value;
                String base64Data = encodeFileToBase64(file);
                tempData.put(entry.getKey(), base64Data);

            } else if (value instanceof String && isAssetFile((String) value)) {
                // If it's a string that refers to an asset file
                String assetFileName = (String) value;
                InputStream inputStream = assetManager.open(assetFileName);
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                byte[] buffer = new byte[1024];
                int read;
                while ((read = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, read);
                }

                inputStream.close();
                byte[] bytes = outputStream.toByteArray();
                String base64Data = Base64.encodeToString(bytes, Base64.NO_WRAP);

                tempData.put(entry.getKey(), base64Data);

            } else {
                tempData.put(entry.getKey(), value);
            }
        }

        return tempData;
    }


    public void sendDataToJSBase64(String key, @Nullable Map<String, Object> tempMap, @Nullable String assetFileName) {
        try {
            String jsonString;

            if (assetFileName != null && !assetFileName.isEmpty()) {
                if (isAssetFile(assetFileName)) {
                    // If asset file exists, create temp file and encode
                    File zipFile = createTempFileFromAssets(assetFileName);
                    String encodedZip = encodeFileToBase64(zipFile);

                    JSONObject successJson = new JSONObject();
                    successJson.put("status", "success");
                    successJson.put("fileName", assetFileName);
                    successJson.put("base64Data", encodedZip);

                    jsonString = successJson.toString();
                } else {
                    // If asset file does not exist
                    JSONObject errorJson = new JSONObject();
                    errorJson.put("status", "error");
                    errorJson.put("errorCode", 404);
                    errorJson.put("message", "File not found in assets: " + assetFileName);

                    jsonString = errorJson.toString();
                }
            } else {
                Map<String, Object> mockData = new HashMap<>();
                mockData.put("file1", new File("/path/to/some/file.txt"));
                File zipFile = createTempFileFromAssets("sample.zip"); // your sample.zip
                String encodedZip = encodeFileToBase64(zipFile);
                mockData.put("zipAsset", encodedZip);
                mockData.put("simpleText", "Hello world");

                Log.d("WebView", "Received Request from Js" + key + "--->" + mockData);

                if (tempMap != null) {
                    JSONObject tempData = convertMapToJsonWithAssets(mockData);
                    jsonString = tempData.toString();
                } else {
                    jsonString = sharedPref.getString(key, "{}");
                }
            }

            final String jsCode = "window.onDataFromAndroid(" + JSONObject.quote(jsonString) + ")";
            webView.post(() -> webView.evaluateJavascript(jsCode, null));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void sendDataToJS(String key, @Nullable JSONObject tempMap) {
        try {
            String jsonString;

            if (tempMap != null) {
                // please don't remove
//                JSONObject tempData = convertMapToJson(tempMap);
                jsonString = tempMap.toString();
            } else {
                jsonString = sharedPref.getString(key, "{}");
            }

            final String jsCode = "window.onDataFromAndroid(" + JSONObject.quote(jsonString) + ")";
            webView.post(() -> webView.evaluateJavascript(jsCode, null));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class WebAppInterface {
        private Context mContext;

        WebAppInterface(Context context) {
            mContext = context;
        }

        @JavascriptInterface
        public void cachedStatus(boolean dataCachedStatus) {
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putBoolean(String.valueOf(urlIndex), dataCachedStatus);
            editor.commit();

            if (!isInternetConnected(getApplicationContext()) && dataCachedStatus) {
                showPrompt("Please Connect to the Network");
            }
        }

        @JavascriptInterface
        public void setContainerAppOrientation(String orientationType) {
            Log.d("WebView", "Orientation value received from webapp " + appUrl + "--->" + orientationType);

            if (orientationType != null && !orientationType.isEmpty()) {
                setAppOrientation(orientationType);
            } else {
                Log.e("WebView", "Invalid orientation value received from webapp " + appUrl);
            }
        }

        @JavascriptInterface
        public String getLessonId() {
            Log.d("getlessonID", activity_id);
            String lesson_id = activity_id;
            activity_id = "";
            return lesson_id;
        }
        @JavascriptInterface
        public void sendDataToContainer(String key, String payload) {
            Log.d(TAG, "Received gamePlayData from webapp " + appUrl + "--->" + payload);

            try {
                JSONObject gameData = new JSONObject(payload);
                Log.d(TAG, "JSON GAME DATA " + appUrl + "---> " + gameData);

                // Check if this is gameData and process it
                if(key.equals("gameData")) {  // Use equals() instead of == for string comparison
                    XAPIManager xs = new XAPIManager(getApplicationContext());

                    // Extract values from the JSONObject
                    String crUserId = gameData.optString("cr_user_id", "");
                    String ftmLanguage = gameData.optString("ftm_language", "");
                    String successOrFailure = gameData.optString("success_or_failure", "");
                    int rightMoves = gameData.optInt("right_moves", 0);
                    int wrongMoves = gameData.optInt("wrong_moves", 0);
                    String levelNumber = gameData.optString("level_number", "-1");
                    double duration = gameData.optDouble("duration", 0.0);
                    int score = gameData.optInt("score", 0);

                    // Now use these extracted values
                    xs.sendXAPIStatement(
                            "johndoe01@example.com",
                            "John Doe 01",
                            "http://adlnet.gov/expapi/verbs/completed",
                            (successOrFailure.equals("success")) ? "completed" : successOrFailure,
                            levelNumber,
                            levelNumber,
                            levelNumber,
                            "course-456",
                            "class-789",
                            "school-101",
                            "assignment-202",
                            "chapter-303",
                            score,
                            rightMoves,
                            wrongMoves
                    );

                }


            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        @JavascriptInterface
        public void requestDataFromContainer(String key, @Nullable JSONObject tempData) {
            ((WebApp) mContext).sendDataToJS(key, tempData);
        }

        @JavascriptInterface
        public void sendInstalledAppInfoToJS() {
//            Log.d(TAG, "Inside sendInstalledAppInfoToJS method");

            boolean isAppInstalled = false;
            try {
                isAppInstalled = AppUtils.isPackageInstalled(mContext);
            } catch (Exception e) {
                Log.e(TAG, "Error checking if the app is installed", e);
            }

            JSONObject installedAppInfoData = new JSONObject();
            try {
                installedAppInfoData.put("type", "installedAppInfo");
                installedAppInfoData.put("isAppInstalled", isAppInstalled);
            } catch (JSONException e) {
                Log.e(TAG, "Error creating JSON data for app installation info", e);
            }

            try {
                ((WebApp) mContext).sendDataToJS("installedAppInfo", installedAppInfoData);
            } catch (Exception e) {
                Log.e(TAG, "Error sending installedAppInfoData to JS", e);
            }
        }

        @JavascriptInterface
        public void sendGameLevelInfoToJS() {
            try {
                JSONArray levelInfoArray = new JSONArray();

                // Retrieve xAPI statements
                XAPIManager xs = new XAPIManager(getApplicationContext());
                String selectedLanguage = sharedPref.getString("selectedLanguage", "");
                String selectedLanguageURI = "http://example.com/language/" + selectedLanguage;
                List<Map<String, Object>> statements = xs.retrieveXAPIStatements("johndoe01@example.com", selectedLanguageURI);
                Log.d(TAG, "Successfully retrieved xAPI statements");

                for (Map<String, Object> statement : statements) {
                    try {
                        JSONObject levelData = new JSONObject();

                        // Extract level number from object.id
                        int levelNumber = -1;
                        Map<String, Object> object = (Map<String, Object>) statement.get("object");
                        if (object != null) {
                            Object idObj = object.get("id");
                            String objectId = null;

                            if (idObj instanceof java.net.URI) {
                                objectId = idObj.toString();
                            } else if (idObj instanceof String) {
                                objectId = (String) idObj;
                            } else if (idObj != null) {
                                objectId = idObj.toString();
                            }

                            if (objectId != null && objectId.contains("activities:")) {
                                String[] parts = objectId.split("activities:");
                                if (parts.length > 1) {
                                    try {
                                        levelNumber = Integer.parseInt(parts[1]);
                                    } catch (NumberFormatException e) {
                                        Log.w(TAG, "Failed to parse level number: " + parts[1], e);
                                    }
                                }
                            }
                        }

                        // Extract score from result
                        double rawScore = 0;
                        Map<String, Object> result = (Map<String, Object>) statement.get("result");
                        if (result != null) {
                            Map<String, Object> score = (Map<String, Object>) result.get("score");
                            if (score != null && score.get("raw") != null) {
                                rawScore = ((Number) score.get("raw")).doubleValue();
                            }
                        }

                        // Calculate star count
                        int starCount = calculateStarCount((int) rawScore);

                        // Populate level data with only essential fields
                        levelData.put("levelName", "Level " + levelNumber); // Adjust as needed
                        levelData.put("levelNumber", levelNumber);
                        levelData.put("score", (int) rawScore);
                        levelData.put("starCount", starCount);

                        //need to put language as well

                        // Add to the array
                        levelInfoArray.put(levelData);

                    } catch (Exception e) {
                        Log.w(TAG, "Error processing statement", e);
                    }
                }

                // Package and send to JS
                JSONObject dataToSend = new JSONObject();
                dataToSend.put("type", "gameLevelInfo");
                dataToSend.put("data", levelInfoArray);

                ((WebApp) mContext).sendDataToJS("gameLevelInfo", dataToSend);
                Log.d(TAG, "Sent game level info to JS: " + dataToSend.toString());

            } catch (JSONException e) {
                Log.e(TAG, "Error creating game level info", e);
            }
        }

        @JavascriptInterface
        public String getAssetPath(String filePath) {
            // Use internal storage path instead of external storage
            return getFilesDir().getAbsolutePath() + "/" + filePath;
        }
    }

    public void setAppOrientation(String orientationType) {
        int currentOrientation = getRequestedOrientation();
        if (orientationType.equalsIgnoreCase("portrait")
                && (currentOrientation != ActivityInfo.SCREEN_ORIENTATION_PORTRAIT)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            Log.d("WebView", "Orientation Changed to Portarit for webApp ---> " + title);
        } else if (orientationType.equalsIgnoreCase("landscape")
                && (currentOrientation != ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            Log.d("WebView", "Orientation Changed to Landscape for webApp ---> " + title);
        }
    }

    // log firebase Event
    public void logAppLaunchEvent() {
        AnalyticsUtils.logEvent(this, "app_launch", title, appUrl, pseudoId, languageInEnglishName);

    }

    public void logAppExitEvent() {
        AnalyticsUtils.logEvent(this, "app_exit", title, appUrl, pseudoId, languageInEnglishName);
    }

    public static int calculateStarCount(int score) {
        if (score >= 25 && score <= 50) {
            return 1;
        } else if (score > 50 && score <= 75) {
            return 2;
        } else if (score > 75 && score <= 100) {
            return 3;
        } else {
            return 0;
        }
    }

    private String getAppURL() {
        String[] activityIdParts = activity_id.split("_");
        Log.d(TAG, "Activity ID parts: " + String.join(", ", activityIdParts));

        //activity_id example:  ftm_hi_1
        if(activityIdParts.length == 3){
            String appName = activityIdParts[0];
            String lessonId = activityIdParts[2];
            Log.d(TAG, "App name: " + appName + ", Lesson ID: " + lessonId);
            return getAppUrlByName(appName, lessonId);
        }
        else{
            Log.e(TAG, "Invalid activity_id format: " + activity_id);
            return "-1";
        }
    }

    private String getAppUrlByName(String appName, String lessonId) {
        if (appName.equals("ftm")) {
            // Use local server URL
            Log.d(TAG, "Using local server URL for FTM app");
            activity_id = lessonId;
            return "http://localhost:8080/index.html";
        }
        else if(appName.equals("storyBook")) {
            return "https://ibiza-stage-story-respect.web.app/?book=" + lessonId;
        }
        Log.e(TAG, "Invalid app name: " + appName);
        return "-1";
    }

    @Override
    protected void onDestroy() {
        if (localWebServer != null) {
            localWebServer.stop();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        activity_id = "";
        super.onBackPressed();
    }

    private void copyAssetsToInternalStorage() {
        try {
            AssetManager assetManager = getAssets();
            String[] files = assetManager.list("");
            
            for (String file : files) {
                // Create directories if they don't exist
                File destFile = new File(getFilesDir(), file);
                if (!destFile.exists()) {
                    if (file.contains("/")) {
                        // Create parent directories
                        destFile.getParentFile().mkdirs();
                    }
                    
                    // Copy file from assets to internal storage
                    InputStream in = assetManager.open(file);
                    OutputStream out = Files.newOutputStream(destFile.toPath());
                    
                    byte[] buffer = new byte[1024];
                    int read;
                    while ((read = in.read(buffer)) != -1) {
                        out.write(buffer, 0, read);
                    }
                    
                    in.close();
                    out.flush();
                    out.close();
                }
            }
        } catch (IOException e) {
            Log.e(TAG, "Error copying assets to internal storage", e);
        }
    }

}
