package org.curiouslearning.container.utilities;

import android.content.Context;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.http.GET;
import retrofit2.http.Url;

public class FetchAsset {

    private final Context context;
    private final String zipBaseUrl;
    private final Handler mainHandler;
    private final LessonApiService apiService;

    private static final String TAG = "FetchAssets";

    public interface LessonCallBack {
        void onSucccess(File lessonFolder);
        void onFalure(Exception e);
    }

    public interface LessonApiService {
        @GET
        Call<ResponseBody> downloadLesson(@Url String url);
    }

    public FetchAsset(Context context, String zipBaseUrl) {
        this.context = context;
        this.zipBaseUrl = zipBaseUrl;
        this.mainHandler = new Handler(Looper.getMainLooper());

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(zipBaseUrl)
                .build();
        apiService = retrofit.create(LessonApiService.class);
    }

    public void downloadAssets(String lessonId, LessonCallBack callback) {
        Log.d(TAG, "Starting asset download for lessonId: " + lessonId);
        // Determine asset folder based on zipBaseUrl
        File baseDir = context.getExternalFilesDir(null);
        String subDir = "";
        if (zipBaseUrl.contains("assessment")) {
            subDir = "assessment";
        } else if (zipBaseUrl.contains("story")) {
            subDir = "story";
        } else if (zipBaseUrl.contains("ftm")) {
            subDir = "ftm";
        }
        File assetFolder = new File(baseDir, subDir);
        assetFolder = new File(assetFolder, lessonId);

        if (assetFolder.exists() && assetFolder.list().length > 0) {
            Log.d(TAG, "Assets already exist for lessonId: " + lessonId);
            File finalAssetFolder = assetFolder;
            mainHandler.post(() -> callback.onSucccess(finalAssetFolder));
            return;
        }

        if (!ConnectionUtils.getInstance().isInternetConnected(context)) {
            Log.e(TAG, "No internet connection available");
            mainHandler.post(() -> callback.onFalure(new IOException("No internet connection")));
            return;
        }

        String zipUrl = zipBaseUrl + lessonId + ".zip";
        Log.d(TAG, "Downloading assets from URL: " + zipUrl);

        File finalAssetFolder1 = assetFolder;
        apiService.downloadLesson(zipUrl).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (!response.isSuccessful()) {
                    Log.e(TAG, "Download failed with HTTP code: " + response.code());
                    mainHandler.post(() -> callback.onFalure(new IOException("Download Failed " + response.code())));
                    return;
                }

                try {
                    Log.d(TAG, "Download successful, creating temp zip file");
                    File tempZipFile = new File(context.getCacheDir(), lessonId + ".zip");

                    try (FileOutputStream fos = new FileOutputStream(tempZipFile)) {
                        fos.write(response.body().bytes());
                    }

                    Log.d(TAG, "Unzipping assets to: " + finalAssetFolder1.getAbsolutePath());
                    unzipLesson(tempZipFile, finalAssetFolder1);
                    tempZipFile.delete();

                    Log.d(TAG, "Asset download and extraction completed successfully");
                    Log.d(TAG, "Final asset folder: " + finalAssetFolder1.getAbsolutePath());
                    mainHandler.post(() -> callback.onSucccess(finalAssetFolder1));
                } catch (Exception e) {
                    Log.e(TAG, "Error while downloading or unzipping", e);
                    deleteFolder(finalAssetFolder1);
                    mainHandler.post(() -> callback.onFalure(e));
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Log.e(TAG, "Download failed", t);
                mainHandler.post(() -> callback.onFalure(new IOException("Download failed", t)));
            }
        });
    }

    private void unzipLesson(File zipFile, File destinationFolder) throws IOException {
        if (!destinationFolder.exists()) {
            destinationFolder.mkdirs();
        }

        try (ZipInputStream zis = new ZipInputStream(new java.io.FileInputStream(zipFile))) {
            ZipEntry entry;
            byte[] buffer = new byte[8192];

            while ((entry = zis.getNextEntry()) != null) {
                String entryName = entry.getName();
                String topLevelPrefix = destinationFolder.getName() + "/";
                if (entryName.startsWith(topLevelPrefix)) {
                    entryName = entryName.substring(topLevelPrefix.length());
                }

                if (entryName.isEmpty()) {
                    zis.closeEntry();
                    continue;
                }

                File newFile = new File(destinationFolder, entryName);

                if (entry.isDirectory()) {
                    newFile.mkdirs();
                    zis.closeEntry();
                    continue;
                }

                File parent = new File(newFile.getParent());
                if (!parent.exists()) {
                    parent.mkdirs();
                }

                try (FileOutputStream fos = new FileOutputStream(newFile)) {
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                }

                zis.closeEntry();
            }
        }
    }

    private void deleteFolder(File folder) {
        if (folder.exists()) {
            File[] files = folder.listFiles();

            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteFolder(file);
                    } else {
                        file.delete();
                    }
                }
            }
            folder.delete();
        }
    }
}
