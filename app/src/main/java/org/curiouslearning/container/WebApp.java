package org.curiouslearning.container;

import static org.curiouslearning.container.MainActivity.activity_id;
import static org.curiouslearning.container.MainActivity.deepLinkApp;
import static org.curiouslearning.container.MainActivity.isDeepLink;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
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

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;

import org.curiouslearning.container.firebase.AnalyticsUtils;
import org.curiouslearning.container.presentation.base.BaseActivity;
import org.curiouslearning.container.utilities.ConnectionUtils;
import org.curiouslearning.container.utilities.AudioPlayer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class WebApp extends BaseActivity {

    private String title;
    private String appUrl;
    private WebView webView;
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        audioPlayer = new AudioPlayer();
        setContentView(R.layout.activity_web_app);
        getIntentData();
        initViews();
        logAppLaunchEvent();
        loadWebView();
    }

    private void getIntentData() {
        Intent intent = getIntent();
        if (intent != null) {
            urlIndex = intent.getStringExtra("appId");
            title = intent.getStringExtra("title");
            appUrl = deepLinkApp ? getAppURL() : intent.getStringExtra("appUrl");
            language = intent.getStringExtra("language");
            languageInEnglishName = intent.getStringExtra("languageInEnglishName");
            Log.d(TAG, "appUrl : " + appUrl);
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
    public void sendDataToJS(String key, @Nullable JSONObject tempData) {
        try {
            String jsonString;

            if (tempData != null) {
                // tempData is basically to send normal data from java to javascript
                jsonString = tempData.toString();
            } else {
                // otherwise fallback to SharedPreferences if no tempData provided
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
                    XAPIManager xs = new XAPIManager();

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
        public void sendGameLevelInfoToJS() {
            try {
                JSONArray levelInfoArray = new JSONArray();

                // Retrieve xAPI statements
                XAPIManager xs = new XAPIManager();
                List<Map<String, Object>> statements = xs.retrieveXAPIStatements("johndoe01@example.com");
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
        deepLinkApp = false;
        String[] arr = activity_id.split("_");

        for(String parts : arr) {
            Log.d(TAG, "split data : " + parts);
        }

        String appName = arr[0];
        String lessonId = arr[1];

        String appUrldata = getAppUrlByName(appName, lessonId);
        Log.d(TAG, "appUrlData : " + appUrldata);

        return appUrldata;
    }

    private String getAppUrlByName(String appName, String lessonId) {

        if(appName.equals("ftm")) {
            activity_id = lessonId;
            return "https://ibiza-stage-ftm-respect.firebaseapp.com/";
        }
        else if (appName.equals("assessment")) {
            return "http://assessmentdev.curiouscontent.org/?data=" + lessonId;
        }
        else if(appName.equals("storyBook")) {
            return "https://ibiza-stage-story-respect.web.app/?book=" + lessonId;
        }
        return "-1";
    }
}
