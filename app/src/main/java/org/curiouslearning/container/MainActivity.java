package org.curiouslearning.container;

import android.app.Application;
import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import androidx.annotation.RawRes;
import androidx.lifecycle.Observer;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.applinks.AppLinkData;
import com.google.android.material.textfield.TextInputLayout;
import com.google.firebase.FirebaseApp;
import com.google.gson.Gson;
import org.curiouslearning.container.data.model.WebApp;
import org.curiouslearning.container.databinding.ActivityMainBinding;
import org.curiouslearning.container.firebase.AnalyticsUtils;
import org.curiouslearning.container.installreferrer.InstallReferrerManager;
import org.curiouslearning.container.presentation.adapters.WebAppsAdapter;
import org.curiouslearning.container.presentation.base.BaseActivity;
import org.curiouslearning.container.presentation.viewmodals.HomeViewModal;
import org.curiouslearning.container.utilities.AnimationUtil;
import org.curiouslearning.container.utilities.AppUtils;
import org.curiouslearning.container.utilities.CacheUtils;
import org.curiouslearning.container.utilities.AudioPlayer;
import org.curiouslearning.container.utilities.SlackUtils;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import android.util.Log;
import android.content.Intent;
import android.widget.Toast;

public class MainActivity extends BaseActivity {

    public ActivityMainBinding binding;
    public RecyclerView recyclerView;
    public WebAppsAdapter apps;
    public HomeViewModal homeViewModal;
    private SharedPreferences cachedPseudo;
    private Button settingsButton;
    private Dialog dialog;
    private ProgressBar loadingIndicator;
    private static final String SHARED_PREFS_NAME = "appCached";
    private static final String REFERRER_HANDLED_KEY = "isReferrerHandled";
    private static final String UTM_PREFS_NAME = "utmPrefs";
    private static final String LANG_PREFS_NAME = "langPrefs";
    private static final String WEB_APPS_PREFS_NAME = "webAppsPrefs";
    private final String isValidLanguage = "notValidLanguage";
    private SharedPreferences utmPrefs;
    private SharedPreferences prefs;
    private SharedPreferences langPrefs;
    private SharedPreferences webAppsPrefs;
    private Gson gson = new Gson();
    private String selectedLanguage;
    private String manifestVersion;
    private static final String TAG = "MainActivity";
    private AudioPlayer audioPlayer;
    private String appVersion;
    private boolean isReferrerHandled;
    private long initialSlackAlertTime;
    private static final String BASE_ASSET_URL = "file:///android_asset/www/index.html?config=";

    private XAPIManager xapiManager;
    //  private RespectClientManager respectClientManager = new RespectClientManager();
    public static String activity_id = "";
    public static boolean isDeepLink = false;
    public static boolean isRespect = true;
    private org.curiouslearning.container.WebApp webAppBridge; // WebAppBridge is a custom class that you need to implement to handle the communication between the WebView and your app.

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        loadOPDSCatalog("https://feedthemonster.curiouscontent.org/lang/english/feed_the_monster_en.opds.json");
        //      respectClientManager.bindService(this);

        prefs = getSharedPreferences(SHARED_PREFS_NAME, MODE_PRIVATE);
        utmPrefs = getSharedPreferences(UTM_PREFS_NAME, MODE_PRIVATE);
        langPrefs = getSharedPreferences(LANG_PREFS_NAME, MODE_PRIVATE);
        webAppsPrefs = getSharedPreferences(WEB_APPS_PREFS_NAME,MODE_PRIVATE);
        isReferrerHandled = prefs.getBoolean(REFERRER_HANDLED_KEY, false);
        selectedLanguage = prefs.getString("selectedLanguage", "");
        initialSlackAlertTime= AnalyticsUtils.getCurrentEpochTime();
        homeViewModal = new HomeViewModal((Application) getApplicationContext(), this);
        cachePseudoId();

        if(webAppsPrefs.getAll().isEmpty()) {
            storeWebAppsInPrefs();
        }

        if(langPrefs.getAll().isEmpty()) {
            storeJsonLanguagesInPrefs();
        }

        InstallReferrerManager.ReferrerCallback referrerCallback = new InstallReferrerManager.ReferrerCallback() {
            @Override
            public void onReferrerReceived(String deferredLang, String fullURL) {

                if (!selectedLanguage.isEmpty()) {
                    if (isRespect) {
                        loadAppsFromJson(selectedLanguage);
                    } else {
                        loadApps(selectedLanguage);
                    }
                }
                else {
                    Log.d(TAG, "onCreate: No stored language found,Choose Again a language");
                    if (isRespect) {
                        fetchLanguagesFromAssets();
                    } else {
                        showLanguagePopup();
                    }
                }
                if(!isRespect) {
                    String language = deferredLang.trim();

                    if (!isReferrerHandled ) {
                        SharedPreferences.Editor editor = prefs.edit();
                        editor.putBoolean(REFERRER_HANDLED_KEY, true);
                        editor.apply();
                        if((language!=null && language.length()>0) || fullURL.contains("curiousreader://app")) {
                            validLanguage(language, "google", fullURL);
                            String pseudoId = prefs.getString("pseudoId", "");
                            String manifestVrsn = prefs.getString("manifestVersion", "");
                            String lang ="";
                            if(language!=null && language.length()>0)
                                lang =  Character.toUpperCase(language.charAt(0))
                                        + language.substring(1).toLowerCase();
                            selectedLanguage = lang;
                            storeSelectLanguage(lang);
                            AnalyticsUtils.logLanguageSelectEvent(MainActivity.this, "language_selected", pseudoId, language,
                                    manifestVrsn, "true");
                            Log.d(TAG, "Referrer language received: " + language + " " + lang);
                        }else{
                            fetchFacebookDeferredData();
                        }
                    }else {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                if (selectedLanguage.equals("")) {
                                    showLanguagePopup();
                                } else {
                                    if(isRespect) {
                                        loadAppsFromJson(selectedLanguage);
                                    } else {
                                        loadApps(selectedLanguage);
                                    }
                                }
                            }
                        });
                    }
                }
                }
                public void fetchLanguagesFromAssets() {
                    runOnUiThread(() -> showLanguagePopupWithLanguages());
                }

        };

        InstallReferrerManager installReferrerManager = new InstallReferrerManager(getApplicationContext(), referrerCallback);
        installReferrerManager.checkPlayStoreAvailability();
        Intent intent = getIntent();
        if (intent.getData() != null) {
            Log.d(TAG, "deepLink Data : " + intent.getData());

            activity_id = intent.getData().getQueryParameter("activity_id");
            Log.d(TAG, "Lesson id : " + activity_id);

            if(activity_id != null && !activity_id.isEmpty()) {
                isDeepLink = true;
                //extract the language from activity_id and set it in shared preference
                String[] activityIdParts = activity_id.split("_");
                String languageFromDeepLink = "";
                if(activityIdParts.length == 3) {
                    languageFromDeepLink = activityIdParts[1];
                }
                else{
                    Log.e(TAG, "Invalid activity_id Format");
                }

                if(!languageFromDeepLink.isEmpty()){
                    selectedLanguage = languageFromDeepLink;
                }
                storeSelectLanguage(selectedLanguage);
                Toast.makeText(this, "Launching the lesson. Please wait...", Toast.LENGTH_SHORT).show();
            }
            else {
                Toast.makeText(this, "Unable to load the lesson. Please try again.", Toast.LENGTH_SHORT).show();
            }
        }
        audioPlayer = new AudioPlayer();
        FirebaseApp.initializeApp(this);
        FacebookSdk.setAutoInitEnabled(true);
        FacebookSdk.fullyInitialize();
        FacebookSdk.setAdvertiserIDCollectionEnabled(true);
        Log.d(TAG, "onCreate: Initializing MainActivity and FacebookSdk");
        AppEventsLogger.activateApp(getApplication());
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        appVersion = AppUtils.getAppVersionName(this);
        manifestVersion = prefs.getString("manifestVersion", "");
        dialog = new Dialog(this);
        initRecyclerView();
        loadingIndicator = findViewById(R.id.loadingIndicator);
        loadingIndicator.setVisibility(View.GONE);
        Log.d(TAG, "onCreate: Selected language: " + selectedLanguage);
        Log.d(TAG, "onCreate: Manifest version: " + manifestVersion);
        if (manifestVersion != null && manifestVersion != "") {
            homeViewModal.getUpdatedAppManifest(manifestVersion);
        }
        settingsButton = findViewById(R.id.settings);
        settingsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AnimationUtil.scaleButton(view, new Runnable() {
                    @Override
                    public void run() {
                        if(isRespect)
                            showLanguagePopupWithLanguages();
                        else
                            showLanguagePopup();
                    }
                });
            }
        });
    }

    private void fetchFacebookDeferredData(){
        AppLinkData.fetchDeferredAppLinkData(this, new AppLinkData.CompletionHandler() {
            @Override
            public void onDeferredAppLinkDataFetched(AppLinkData appLinkData) {
                String pseudoId = prefs.getString("pseudoId", "");
                String manifestVrsn = prefs.getString("manifestVersion", "");
                if (dialog != null && dialog.isShowing()) {
                    dialog.dismiss();
                    Log.d(TAG, "onDeferredAppLinkDataFetched: dialog is equal to null ");
                }
                Log.d(TAG, "onDeferredAppLinkDataFetched:Facebook AppLinkData: " + appLinkData);
                if (appLinkData != null) {
                    Uri deepLinkUri = appLinkData.getTargetUri();
                    Log.d(TAG, "onDeferredAppLinkDataFetched: DeepLink URI: " + deepLinkUri);
                    String language = ((Uri) deepLinkUri).getQueryParameter("language");
                    String source = ((Uri) deepLinkUri).getQueryParameter("source");
                    String campaign_id = ((Uri) deepLinkUri).getQueryParameter("campaign_id");
                    SharedPreferences.Editor editor = utmPrefs.edit();
                    editor.putString("source", source);
                    editor.putString("campaign_id", campaign_id);
                    editor.apply();
                    validLanguage(language,"facebook", String.valueOf(deepLinkUri));
                    String lang = Character.toUpperCase(language.charAt(0)) + language.substring(1).toLowerCase();
                    Log.d(TAG, "onDeferredAppLinkDataFetched: Language from deep link: " + lang);
                    selectedLanguage = lang;
                    storeSelectLanguage(lang);
                    AnalyticsUtils.storeReferrerParams(MainActivity.this, source, campaign_id);
                    AnalyticsUtils.logLanguageSelectEvent(MainActivity.this, "language_selected", pseudoId, lang,
                            manifestVrsn, "true");
                } else {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if (selectedLanguage.equals("")) {
                                if(isRespect)
                                    showLanguagePopupWithLanguages();
                                else
                                    showLanguagePopup();
                            } else {
                                if(isRespect) {
                                    loadAppsFromJson(selectedLanguage);
                                } else {
                                    loadApps(selectedLanguage);
                                }
                            }

                        }
                    });
                }
            }
        });
    }

    protected void initRecyclerView() {
        recyclerView = findViewById(R.id.recycleView);
        recyclerView.setLayoutManager(
                new GridLayoutManager(getApplicationContext(), 2, GridLayoutManager.HORIZONTAL, false));
        apps = new WebAppsAdapter(this, new ArrayList<>());
        recyclerView.setAdapter(apps);
    }

    private void cachePseudoId() {
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        cachedPseudo = getApplicationContext().getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = cachedPseudo.edit();
        if (!cachedPseudo.contains("pseudoId")) {
            editor.putString("pseudoId",
                    generatePseudoId() + calendar.get(Calendar.YEAR) + (calendar.get(Calendar.MONTH) + 1) +
                            calendar.get(Calendar.DAY_OF_MONTH) + calendar.get(Calendar.HOUR_OF_DAY)
                            + calendar.get(Calendar.MINUTE) + calendar.get(Calendar.SECOND));
            editor.commit();
        }
    }
    public static String convertEpochToDate(long epochTimeMillis) {
        Instant instant = Instant.ofEpochMilli(epochTimeMillis);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a")
                .withZone(ZoneId.systemDefault());
        return formatter.format(instant);
    }

    @Override
    public void onResume() {
        super.onResume();
        recyclerView.setAdapter(apps);
    }

    private String generatePseudoId() {
        SecureRandom random = new SecureRandom();
        String pseudoId = new BigInteger(130, random).toString(32);
        System.out.println(pseudoId);
        return pseudoId;
    }
    private void validLanguage(String deferredLang, String source, String deepLinkUri) {
        String language = deferredLang.trim();
        long currentEpochTime = AnalyticsUtils.getCurrentEpochTime();
        String pseudoId = prefs.getString("pseudoId", "");
        if( language == null || language.length()==0 ){
            SlackUtils.sendMessageToSlack(MainActivity.this, "Language is incorrect or null for " + source + " deferred deep link URL: " + deepLinkUri + " , cr_user_id: " + pseudoId + " , currentTimestamp: " + convertEpochToDate(currentEpochTime) + " , initialSlackAlertTime: " + convertEpochToDate(initialSlackAlertTime));
            if(isRespect)
                showLanguagePopupWithLanguages();
            else
                showLanguagePopup();
            return;
        }
        homeViewModal.getAllLanguagesInEnglish().observe(this, validLanguages -> {
            List<String> lowerCaseLanguages = validLanguages.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
            if (lowerCaseLanguages!=null && lowerCaseLanguages.size() > 0 &&!lowerCaseLanguages.contains(language.toLowerCase().trim())) {
                SlackUtils.sendMessageToSlack(MainActivity.this, "Language is incorrect or null for " + source + " deferred deep link URL: " + deepLinkUri + " , cr_user_id: " + pseudoId + " , currentTimestamp: " + convertEpochToDate(currentEpochTime) + " , initialSlackAlertTime: " + convertEpochToDate(initialSlackAlertTime));
                if(isRespect)
                    showLanguagePopupWithLanguages();
                else
                    showLanguagePopup();
                loadingIndicator.setVisibility(View.GONE);
                selectedLanguage="";
                storeSelectLanguage("");
                return;
            }else if(lowerCaseLanguages !=null && lowerCaseLanguages.size() > 0){
                String lang =  Character.toUpperCase(language.charAt(0))
                        + language.substring(1).toLowerCase();
                if(isRespect) {
                    loadAppsFromJson(lang);
                } else {
                    loadApps(lang);
                }
            }else if(lowerCaseLanguages ==null || lowerCaseLanguages.size() == 0){
                if(isRespect) {
                    loadAppsFromJson(isValidLanguage);
                } else {
                    loadApps(isValidLanguage);
                }
            }
        });
    }


    private void showLanguagePopup() {
        if (!dialog.isShowing()) {
            dialog.setContentView(R.layout.language_popup);

            dialog.setCanceledOnTouchOutside(false);
            dialog.getWindow().setBackgroundDrawable(null);
            ImageView closeButton = dialog.findViewById(R.id.setting_close);
            TextInputLayout textBox = dialog.findViewById(R.id.dropdown_menu);
            AutoCompleteTextView autoCompleteTextView = dialog.findViewById(R.id.autoComplete);
            autoCompleteTextView.setDropDownBackgroundResource(android.R.color.white);
            ArrayAdapter<String> adapter = new ArrayAdapter<String>(dialog.getContext(),
                    android.R.layout.simple_dropdown_item_1line, new ArrayList<String>());
            autoCompleteTextView.setAdapter(adapter);

            homeViewModal.getAllWebApps().observe(this, new Observer<List<WebApp>>() {
                @Override
                public void onChanged(List<WebApp> webApps) {
                    Set<String> distinctLanguages = sortLanguages(webApps);
                    Map<String, String> languagesEnglishNameMap = MapLanguagesEnglishName(webApps);
                    List<String> distinctLanguageList = new ArrayList<>(distinctLanguages);
                    if (!webApps.isEmpty()) {
                        cacheManifestVersion(CacheUtils.manifestVersionNumber);
                    }

                    if (!distinctLanguageList.isEmpty()) {
                        Log.d(TAG, "showLanguagePopup: Distinct languages: " + distinctLanguageList);
                        adapter.clear();
                        adapter.addAll(distinctLanguageList);
                        adapter.notifyDataSetChanged();
                        int standardizedItemHeight = 50;
                        int itemCount = adapter.getCount();
                        int dropdownHeight = standardizedItemHeight * itemCount;
                        int maxHeight = getResources().getDisplayMetrics().heightPixels / 2;
                        int adjustedDropdownHeight = Math.min(dropdownHeight, maxHeight);
                        autoCompleteTextView.setDropDownHeight(adjustedDropdownHeight);

                        selectedLanguage = prefs.getString("selectedLanguage", "");
                        if (!selectedLanguage.isEmpty() && languagesEnglishNameMap.containsValue(selectedLanguage)) {
                            textBox.setHint(languagesEnglishNameMap.get(selectedLanguage));
                        }

                        autoCompleteTextView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                            @Override
                            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                                audioPlayer.play(MainActivity.this, R.raw.sound_button_pressed);
                                selectedLanguage = languagesEnglishNameMap
                                        .get((String) parent.getItemAtPosition(position));
                                String pseudoId = prefs.getString("pseudoId", "");
                                String manifestVrsn = prefs.getString("manifestVersion", "");
                                AnalyticsUtils.logLanguageSelectEvent(view.getContext(), "language_selected", pseudoId,
                                        selectedLanguage, manifestVrsn, "false");
                                dialog.dismiss();
                                if(isRespect) {
                                    loadAppsFromJson(selectedLanguage);
                                } else {
                                    loadApps(selectedLanguage);
                                }
                            }
                        });
                    }
                }
            });

            closeButton.setOnClickListener(new View.OnClickListener() {
                public void onClick(View v) {
                    audioPlayer.play(MainActivity.this, R.raw.sound_button_pressed);
                    AnimationUtil.scaleButton(v, new Runnable() {
                        @Override
                        public void run() {
                            dialog.dismiss();
                        }
                    });

                }

            });
            dialog.show();
        }
    }

    private void showLanguagePopupWithLanguages() {
        if (!dialog.isShowing()) {
            dialog.setContentView(R.layout.language_popup);

            dialog.setCanceledOnTouchOutside(false);
            dialog.getWindow().setBackgroundDrawable(null);
            ImageView closeButton = dialog.findViewById(R.id.setting_close);
            TextInputLayout textBox = dialog.findViewById(R.id.dropdown_menu);
            AutoCompleteTextView autoCompleteTextView = dialog.findViewById(R.id.autoComplete);
            autoCompleteTextView.setDropDownBackgroundResource(android.R.color.white);
            List<String> languageNames = new ArrayList<>();
            Map<String, ?> allEntries = langPrefs.getAll();
            for (Map.Entry<String, ?> entry : allEntries.entrySet()) {
                if (entry.getKey() instanceof String) {
                    languageNames.add((String)entry.getKey());
                }
            }
            ArrayAdapter<String> adapter = new ArrayAdapter<>(dialog.getContext(),
                    android.R.layout.simple_dropdown_item_1line, languageNames);
            autoCompleteTextView.setAdapter(adapter);

            String selectedLangEnglish = prefs.getString("selectedLanguage", "");
            String selectedLangCode = null;
            for (Map.Entry<String, ?> entry : allEntries.entrySet()) {
                if (entry.getValue() instanceof String && entry.getValue().equals(selectedLangEnglish)) {
                    selectedLangCode = entry.getKey();
                    break;
                }
            }
            if (selectedLangCode != null && languageNames.contains(selectedLangCode)) {
                autoCompleteTextView.setText(selectedLangCode, false);
            }

            autoCompleteTextView.setOnItemClickListener((parent, view, position, id) -> {
                audioPlayer.play(MainActivity.this, R.raw.sound_button_pressed);
                selectedLanguage = (String) parent.getItemAtPosition(position);
                String selectedLanguageEnglishName = langPrefs.getString(selectedLanguage,null);
                autoCompleteTextView.setText(selectedLanguage, false);

                dialog.dismiss();
                if(isRespect) {
                    loadAppsFromJson(selectedLanguageEnglishName);
                } else {
                    loadApps(selectedLanguageEnglishName);
                }
            });

        closeButton.setOnClickListener(v -> {
            audioPlayer.play(MainActivity.this, R.raw.sound_button_pressed);
            AnimationUtil.scaleButton(v, dialog::dismiss);
        });

        dialog.show();
    }
    }

    public void storeJsonLanguagesInPrefs() {
        SharedPreferences.Editor editor = langPrefs.edit();
        editor.clear();

        try {
            InputStream inputStream = getAssets().open("languages.json");
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
            reader.close();

            String jsonString = jsonBuilder.toString();
            JSONObject jsonObject = new JSONObject(jsonString);
            JSONArray webAppsArray = jsonObject.getJSONArray("web_apps");

            if(editor != null) {
                for (int i = 0; i < webAppsArray.length(); i++) {
                    JSONObject appObject = webAppsArray.getJSONObject(i);
                    String language = appObject.getString("language");
                    String langCode = appObject.getString("langCode");
                    editor.putString(language, langCode);
                }
            }

            editor.apply();
            Log.i(TAG, "Languages stored in SharedPreferences successfully.");

        } catch (Exception e) {
            Log.e(TAG, "Error reading and storing languages in SharedPreferences", e);
            editor.clear().apply();
        }
    }

    public void storeWebAppsInPrefs() {
        SharedPreferences.Editor editor = webAppsPrefs.edit();
        editor.clear();
        try {

            InputStream inputStream = getAssets().open("languages.json");
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuilder.append(line);
            }
            reader.close();

            JSONObject jsonObject = new JSONObject(jsonBuilder.toString());
            JSONArray webAppsArray = jsonObject.getJSONArray("web_apps");

            for (int i = 0; i < webAppsArray.length(); i++) {
                JSONObject appObject = webAppsArray.getJSONObject(i);
                WebApp webApp = new WebApp();
                webApp.setAppId(appObject.getInt("appId"));
                webApp.setTitle(appObject.getString("title"));
                webApp.setLanguage(appObject.getString("language"));
                webApp.setAppUrl(appObject.getString("appUrl"));
                webApp.setAppIconUrl(appObject.getString("appIconUrl"));
                webApp.setLanguageInEnglishName(appObject.getString("languageInEnglishName"));
                webApp.setLangCode(appObject.getString("langCode"));

                String key = "webapp_" + webApp.getAppId();
                String jsonString = gson.toJson(webApp);
                editor.putString(key, jsonString);
                editor.apply();
            }

        } catch (Exception e) {
            Log.e(TAG, "Error reading and storing web apps in SharedPreferences", e);
            editor.clear().apply();
        }
    }

    private Map<String, String> MapLanguagesEnglishName(List<WebApp> webApps) {
        Map<String, String> languagesEnglishNameMap = new TreeMap<>();
        for (WebApp webApp : webApps) {
            String languageInEnglishName = webApp.getLanguageInEnglishName();
            String languageInLocalName = webApp.getLanguage();
            if (languageInEnglishName != null && languageInLocalName != null) {
                languagesEnglishNameMap.put(languageInLocalName, languageInEnglishName);
                languagesEnglishNameMap.put(languageInEnglishName, languageInLocalName);
            }
        }
        return languagesEnglishNameMap;
    }

    private Set<String> sortLanguages(List<WebApp> webApps) {
        Map<String, List<String>> dialectGroups = new TreeMap<>();
        Map<String, String> languages = new TreeMap<>();
        for (WebApp webApp : webApps) {
            String languageInEnglishName = webApp.getLanguageInEnglishName();
            String languageInLocaName = webApp.getLanguage();
            languages.put(languageInEnglishName, languageInLocaName);
        }
        for (WebApp webApp : webApps) {
            String languageInEnglishName = webApp.getLanguageInEnglishName();
            String languageInLocalName = webApp.getLanguage();
            String[] parts = extractBaseLanguageAndDialect(languageInLocalName, languageInEnglishName);
            String baseLanguage = parts[0];  // The root language (e.g., "English", "Portuguese")
            String dialect = parts[1];       // The dialect (e.g., "US", "Brazilian")
            if(baseLanguage.contains("Kreyòl")){
                dialectGroups.putIfAbsent("Creole"+baseLanguage, new ArrayList<>());
                dialectGroups.get("Creole"+baseLanguage).add(dialect);
            }else {
                dialectGroups.putIfAbsent(baseLanguage, new ArrayList<>());
                dialectGroups.get(baseLanguage).add(dialect);
            }
        }

        List<String> sortedLanguages = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : dialectGroups.entrySet()) {
            String baseLanguage = entry.getKey();
            List<String> dialects = entry.getValue();
            Collections.sort(dialects);
            for (String dialect : dialects) {
                if(languages.get(baseLanguage) == null || !languages.get(baseLanguage).equals(dialect)) {
                    if (baseLanguage.contains("Creole"))
                        sortedLanguages.add(baseLanguage.substring(6) + " - " + dialect);
                    else
                        sortedLanguages.add(baseLanguage+ " - " + dialect);
                }
                else
                    sortedLanguages.add(dialect);
            }
        }

        return new LinkedHashSet<>(sortedLanguages);
    }

    private String[] extractBaseLanguageAndDialect(String languageInLocalName, String languageInEnglishName) {
        String baseLanguage = languageInEnglishName;
        String dialect = "";

        if (languageInLocalName.contains(" - ")) {
            String[] parts = languageInLocalName.split(" - ");
            baseLanguage = parts[0].trim();
            dialect = parts[1].trim();
        } else {
            baseLanguage = languageInEnglishName;
            dialect = languageInLocalName;
        }
        return new String[]{baseLanguage, dialect};
    }


    public void loadApps(String selectedlanguage) {
        Log.d(TAG, "loadApps: Loading apps for language: " + selectedLanguage);
        loadingIndicator.setVisibility(View.VISIBLE);
        final String language = selectedlanguage;
        homeViewModal.getSelectedlanguageWebApps(selectedlanguage).observe(this, new Observer<List<WebApp>>() {
            @Override
            public void onChanged(List<WebApp> webApps) {
                loadingIndicator.setVisibility(View.GONE);
                if (!webApps.isEmpty()) {
                    apps.webApps = webApps;
                    apps.notifyDataSetChanged();
                    storeSelectLanguage(language);
                } else {
                    if (!prefs.getString("selectedLanguage", "").equals("") && language.equals("")) {
                        if(isRespect)
                            showLanguagePopupWithLanguages();
                        else
                            showLanguagePopup();
                    }
                    if (manifestVersion.equals("")) {
                        if(!selectedlanguage.equals(isValidLanguage))
                            loadingIndicator.setVisibility(View.VISIBLE);
                        homeViewModal.getAllWebApps();
                    }
                }
            }
        });
    }

    public void loadAppsFromJson(String selectedlanguage) {
        Log.d(TAG, "loadAppsFromJson: Loading apps for language: " + selectedlanguage);
        loadingIndicator.setVisibility(View.VISIBLE);

        new Thread(() -> {
            try {

                List<WebApp> filteredApps = new ArrayList<>();
                for (String key : webAppsPrefs.getAll().keySet()) {
                    if (key.startsWith("webapp_")) {
                        String jsonString = webAppsPrefs.getString(key, null);
                        if (jsonString != null) {
                            WebApp webApp = gson.fromJson(jsonString, WebApp.class);

                            String langCode = webApp.getLangCode() != null ?
                            webApp.getLangCode().toLowerCase() : "";

                            if(langCode.equals(selectedlanguage.toLowerCase())) {
                                filteredApps.add(webApp);
                            }
                        }
                    }
                }

                runOnUiThread(() -> {
                    loadingIndicator.setVisibility(View.GONE);
                    if (!filteredApps.isEmpty()) {
                        apps.webApps = filteredApps;
                        apps.notifyDataSetChanged();
                        storeSelectLanguage(selectedlanguage);
                    } else {
                        Log.d(TAG, "loadAppsFromJson: No apps found for the selected language.");
                        if (isRespect) {
                            showLanguagePopupWithLanguages();
                        } else {
                            showLanguagePopup();
                        }
                    }
                });

            } catch (Exception e) {
                Log.e(TAG, "Error loading apps from JSON", e);
                runOnUiThread(() -> loadingIndicator.setVisibility(View.GONE));
            }
        }).start();
    }

    private void storeSelectLanguage(String language) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("selectedLanguage", language);
        editor.apply();
        Log.d(TAG, "storeSelectLanguage: Stored selected language: " + language);
    }

    private void cacheManifestVersion(String versionNumber) {
        if (versionNumber != null && versionNumber != "") {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("manifestVersion", versionNumber);
            editor.apply();
            Log.d(TAG, "cacheManifestVersion: Cached manifest version: " + versionNumber);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);

        // Handle the new intent
        if (intent.getData() != null) {
            Log.d(TAG, "onNewIntent: deepLink Data : " + intent.getData());

            activity_id = intent.getData().getQueryParameter("activity_id");
            Log.d(TAG, "onNewIntent: Lesson id : " + activity_id);

            if(!Objects.equals(activity_id, "")) {
                isDeepLink = true;
                loadApps(selectedLanguage);
            }
            else {
                Toast.makeText(this, "Unable to load the lesson. Please try again.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void loadOPDSCatalog(String opdsUrl) {
        new Thread(() -> {
            try {
                Log.d("OPDS", "Starting OPDS fetch...");

                JSONObject catalogJson;
                if (opdsUrl.startsWith("http") || opdsUrl.startsWith("https")) {
                    Log.d("OPDS", "Fetching OPDS catalog from URL: " + opdsUrl);
                    catalogJson = readJsonFromHttp(opdsUrl);
                } else {
                    int resId = getResources().getIdentifier(opdsUrl, "raw", getPackageName());
                    String rawJsonStr = readRawResource(resId);
                    catalogJson = new JSONObject(rawJsonStr);
                }

                JSONArray groups = catalogJson.getJSONArray("groups");
                JSONObject group = groups.getJSONObject(0);
                JSONArray publications = group.getJSONArray("publications");
                JSONObject publication = publications.getJSONObject(0);
                JSONArray links = publication.getJSONArray("links");
                String courseUrl = links.getJSONObject(0).getString("href");

                Log.d("OPDS", "Parsed course URL: " + courseUrl);

                runOnUiThread(() -> {
                    WebView webView = findViewById(R.id.web_app);
                    if (webView != null) {
                        String finalUrl = BASE_ASSET_URL + courseUrl;
                        Log.d("OPDS", "Loading game with config URL: " + finalUrl);

                        webView.setWebViewClient(new WebViewClient() {
                            private boolean isDataLoaded = false;

                            @Override
                            public void onPageFinished(WebView view, String url) {
                                Log.d("WebView", "Page finished loading: " + url);
                                if (!isDataLoaded) {
                                    isDataLoaded = true;
                                    loadFtmDataToWebView();
                                }
                            }

                            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                                Log.e("WebView", "Error loading page: " + error.getDescription());
                            }
                        });

                        webView.loadUrl(finalUrl);
                    } else {
                        Log.e("WebView", "WebView is null. Check layout XML.");
                    }
                });

            } catch (Exception e) {
                Log.e("OPDS", "Error while loading OPDS catalog", e);
            }
        }).start();
    }

    private String readRawResource(@RawRes int resId) {
        try (InputStream is = getResources().openRawResource(resId);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            return builder.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "{}";
        }
    }

    private JSONObject readJsonFromHttp(String urlString) throws IOException, JSONException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            return new JSONObject(builder.toString());
        } catch (JSONException e) {
            throw new RuntimeException(e);
        } finally {
            conn.disconnect();
        }
    }

    public void loadFtmDataToWebView() {
        try {
            // Read OPDS Catalog JSON from raw
            String opdsJsonStr = readRawResource(R.raw.feed_the_monster_english_opds);
            JSONObject opdsJson = new JSONObject(opdsJsonStr);

            JSONArray publications = opdsJson.getJSONArray("groups")
                .getJSONObject(0)
                .getJSONArray("publications");

            JSONObject publication = publications.getJSONObject(0);
            JSONObject metadata = publication.getJSONObject("metadata");

            // Extract lesson filename from link
            String lessonFilename = publication
                .getJSONArray("links")
                .getJSONObject(0)
                .getString("href")
                .replace("lang/english/", "")
                .replace(".json", "");

            int lessonResId = getResources().getIdentifier(lessonFilename, "raw", getPackageName());
            String lessonJsonStr = readRawResource(lessonResId);
            JSONObject lessonJson = new JSONObject(lessonJsonStr);

            // Merge metadata fields into lesson JSON
            lessonJson.put("title", metadata.optString("title"));
            lessonJson.put("identifier", metadata.optString("identifier"));
            lessonJson.put("Language", metadata.optString("language"));
            lessonJson.put("RightToLeft", metadata.optBoolean("RightToLeft"));
            lessonJson.put("FeedbackTexts", metadata.optJSONArray("feedbackTexts"));
            lessonJson.put("FeedbackAudios", metadata.optJSONArray("feedbackAudios"));
            lessonJson.put("OtherAudios", metadata.optJSONObject("otherAudios"));
            lessonJson.put("majversion", metadata.optInt("majversion"));
            lessonJson.put("minversion", metadata.optInt("minversion"));
            lessonJson.put("langname", metadata.optString("langname"));

            publication.getJSONArray("links")
                .getJSONObject(0)
                .put("lessonData", lessonJson);

            // Now send the full OPDS JSON (modified) to Web App
            webAppBridge.sendDataToJS("FTM_OPDS_DATA", opdsJson);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}