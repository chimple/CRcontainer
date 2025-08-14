package org.curiouslearning.container.server;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;
import android.widget.Toast;
import android.os.Handler;
import android.os.Looper;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;

public class AppServer extends NanoHTTPD {
    private final Context context;
    private final String baseAssetFolder;
    private final String subAppName;
    private final String TAG = "AppServer";
    private boolean isOpenAPK = false;

    public AppServer(Context context, int port, String baseAssetFolder) {
        this(context, port, baseAssetFolder, "unknown");
    }

    public AppServer(Context context, int port, String baseAssetFolder, String subAppName) {
        super(port);
        this.context = context;
        this.baseAssetFolder = baseAssetFolder;
        this.subAppName = subAppName;
        try {
            context.getAssets().open(baseAssetFolder + "/bundle.js").close();
            android.util.Log.d("LocalWebServer", "bundle.js is accessible in " + baseAssetFolder + "!");
        } catch (Exception e) {
            android.util.Log.e("LocalWebServer", "bundle.js is NOT accessible in " + baseAssetFolder + "!", e);
        }
    }

@Override
public Response serve(IHTTPSession session) {
    String uri = session.getUri();
    Log.d(TAG, "Requested asset-----------" + uri);
    if (uri.equals("/")) {
        uri = "/index.html";
    }
    String assetPath = baseAssetFolder + uri;
    Log.d(TAG, "Requested asset: " + assetPath);

    // Always try baseAssetFolder first
    try {
        AssetManager assetManager = context.getAssets();
        InputStream is = assetManager.open(assetPath);
        String mime = resolveMimeType(uri);
        return newChunkedResponse(Response.Status.OK, mime, is);
    } catch (IOException e) {
        // Now check lessonAsset or storage based on isOpenAPK value
        if (isOpenAPK) {
            String lessonAssetPath = "lessonAsset" + uri;
            Log.d(TAG, "isOpenAPK true, checking lessonAsset: " + lessonAssetPath);
            showToast("Checking lessonAsset");
            try {
                AssetManager assetManager = context.getAssets();
                InputStream is = assetManager.open(lessonAssetPath);
                String mime = resolveMimeType(uri);
                return newChunkedResponse(Response.Status.OK, mime, is);
            } catch (IOException e2) {
                Log.e(TAG, "Asset not found in lessonAsset: " + lessonAssetPath, e2);
                showToast("File not found in lessonAsset:");
                return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
            }
        } else {
            Log.d(TAG, "isOpenAPK false, checking storage for subapp: " + subAppName);
            showToast("Checking Storage for " + subAppName);
            if (uri.contains("/lang/")) {
                uri = uri.replaceFirst("/lang/", "/");
            }
            uri = "/" + subAppName + uri;

            return serveFromStorage(uri);
        }
    } catch (Exception e) {
        Log.e(TAG, "Server error: " + assetPath, e);
        return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "500 Internal Server Error");
    }
}
    private Response serveFromStorage(String uri) {
        File storageFile = new File(context.getExternalFilesDir(null), uri); // adjust as needed
        Log.d(TAG, "Trying storage: " + storageFile.getAbsolutePath());
        if (storageFile.exists() && storageFile.isFile()) {
            try {
                FileInputStream fis = new FileInputStream(storageFile);
                String mime = resolveMimeType(uri);
                Log.d(TAG, "Serving file from storage: " + storageFile.getAbsolutePath());
                return newChunkedResponse(Response.Status.OK, mime, fis);
            } catch (IOException e3) {
                Log.e(TAG, "Error reading file from storage: " + storageFile.getAbsolutePath(), e3);
            }
        } else {
            Log.e(TAG, "File not found in storage: " + storageFile.getAbsolutePath());
            showToast("File not found in storage");
        }
        return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
    }

    private void showToast(final String message) {
        //Toast is for testing purpose
        new Handler(Looper.getMainLooper()).post(() ->
                Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        );
    }
    private String resolveMimeType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".svg")) return "image/svg+xml";
        return "text/plain";
    }
}