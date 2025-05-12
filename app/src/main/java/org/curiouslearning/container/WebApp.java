package org.curiouslearning.container;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
//import android.content.res.AssetManager;
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

import org.json.JSONException;
import org.json.JSONObject;

//import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
//import java.io.InputStream;
//import java.io.OutputStream;
//import java.nio.file.Files;
//import java.util.HashMap;
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
            appUrl = "https://ibiza-stage-ftm-respect.firebaseapp.com/";
            language = intent.getStringExtra("language");
            languageInEnglishName = intent.getStringExtra("languageInEnglishName");
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


 /****** Please don't remove any of the commented code and imports ****************/
//    private File createTempFileFromAssets(String assetFileName) throws IOException {
//        AssetManager assetManager = this.getAssets();
//        InputStream inputStream = assetManager.open(assetFileName);
//
//        File outFile = new File(this.getCacheDir(), assetFileName);
//        OutputStream outputStream = Files.newOutputStream(outFile.toPath());
//
//        byte[] buffer = new byte[1024];
//        int read;
//        while ((read = inputStream.read(buffer)) != -1) {
//            outputStream.write(buffer, 0, read);
//        }
//
//        inputStream.close();
//        outputStream.flush();
//        outputStream.close();
//
//        return outFile;
//    }
//
//    private boolean isAssetFile(String filename) {
//        try {
//            String[] assetFiles = this.getAssets().list("");
//            for (String name : assetFiles) {
//                if (name.equals(filename)) {
//                    return true;
//                }
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        return false;
//    }
//
//    public JSONObject convertMapToJsonWithAssets(Map<String, Object> tempMap) throws JSONException, IOException {
//        JSONObject tempData = new JSONObject();
//        AssetManager assetManager = this.getAssets();
//
//        for (Map.Entry<String, Object> entry : tempMap.entrySet()) {
//            Object value = entry.getValue();
//
//            if (value instanceof File) {
//                File file = (File) value;
//                String base64Data = encodeFileToBase64(file);
//                tempData.put(entry.getKey(), base64Data);
//
//            } else if (value instanceof String && isAssetFile((String) value)) {
//                // If it's a string that refers to an asset file
//                String assetFileName = (String) value;
//                InputStream inputStream = assetManager.open(assetFileName);
//                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
//
//                byte[] buffer = new byte[1024];
//                int read;
//                while ((read = inputStream.read(buffer)) != -1) {
//                    outputStream.write(buffer, 0, read);
//                }
//
//                inputStream.close();
//                byte[] bytes = outputStream.toByteArray();
//                String base64Data = Base64.encodeToString(bytes, Base64.NO_WRAP);
//
//                tempData.put(entry.getKey(), base64Data);
//
//            } else {
//                tempData.put(entry.getKey(), value);
//            }
//        }
//
//        return tempData;
//    }
//
//
//    public void sendDataToJS(String key, @Nullable Map<String, Object> tempMap, @Nullable String assetFileName) {
//        try {
//            String jsonString;
//
//            if (assetFileName != null && !assetFileName.isEmpty()) {
//                if (isAssetFile(assetFileName)) {
//                    // If asset file exists, create temp file and encode
//                    File zipFile = createTempFileFromAssets(assetFileName);
//                    String encodedZip = encodeFileToBase64(zipFile);
//
//                    JSONObject successJson = new JSONObject();
//                    successJson.put("status", "success");
//                    successJson.put("fileName", assetFileName);
//                    successJson.put("base64Data", encodedZip);
//
//                    jsonString = successJson.toString();
//                } else {
//                    // If asset file does not exist
//                    JSONObject errorJson = new JSONObject();
//                    errorJson.put("status", "error");
//                    errorJson.put("errorCode", 404);
//                    errorJson.put("message", "File not found in assets: " + assetFileName);
//
//                    jsonString = errorJson.toString();
//                }
//            } else {
//                Map<String, Object> mockData = new HashMap<>();
//                mockData.put("file1", new File("/path/to/some/file.txt"));
//                File zipFile = createTempFileFromAssets("sample.zip"); // your sample.zip
//                String encodedZip = encodeFileToBase64(zipFile);
//                mockData.put("zipAsset", encodedZip);
//                mockData.put("simpleText", "Hello world");
//
//                Log.d("WebView", "Received Request from Js" + key + "--->" + mockData);
//
//                if (tempMap != null) {
//                    JSONObject tempData = convertMapToJsonWithAssets(mockData);
//                    jsonString = tempData.toString();
//                } else {
//                    jsonString = sharedPref.getString(key, "{}");
//                }
//            }
//
//            final String jsCode = "window.onDataFromAndroid(" + JSONObject.quote(jsonString) + ")";
//            webView.post(() -> webView.evaluateJavascript(jsCode, null));
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
    public void sendDataToJS(String key, @Nullable Map<String, Object> tempMap) {
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
        public void requestDataFromContainer(String key, @Nullable Map<String, Object> tempData) {
            ((WebApp) mContext).sendDataToJS(key, tempData);
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
}
