package org.curiouslearning.container.server;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;

public class AppServer extends NanoHTTPD {
    private final Context context;
    private final String baseAssetFolder;
    private final String TAG = "AppServer";

    public AppServer(Context context, int port, String baseAssetFolder) {
        super(port);
        this.context = context;
        this.baseAssetFolder = baseAssetFolder;

        try {
            context.getAssets().open(baseAssetFolder + "/bundle.js").close();
            android.util.Log.d("LocalWebServer", "bundle.js is accessible in " + baseAssetFolder + "!");
        } catch (Exception e) {
            android.util.Log.e("LocalWebServer", "bundle.js is NOT accessible in " + baseAssetFolder + "!", e);
        }
//        Log.d(TAG, "rootDirectory is "+ )
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        android.util.Log.d("LocalWebServer", "Requested asset-----------" + uri);
        if (uri.equals("/")) {
            uri = "/index.html";
        }
        String assetPath = baseAssetFolder + uri;
        android.util.Log.d("LocalWebServer", "Requested asset: " + assetPath);
        try {
            android.util.Log.d("LocalWebServer", "Requested asset-----------");
            AssetManager assetManager = context.getAssets();
            InputStream is = assetManager.open(assetPath);
            String mime = resolveMimeType(uri);
            return newChunkedResponse(Response.Status.OK, mime, is);
        } catch (IOException e) {
            // Try lessonAsset in assets
            String lessonAssetPath = "lessonAsset" + uri;
            android.util.Log.d("LocalWebServer",
                    "Asset not found in baseAssetFolder, trying lessonAsset: " + lessonAssetPath);
            try {
                AssetManager assetManager = context.getAssets();
                InputStream is = assetManager.open(lessonAssetPath);
                String mime = resolveMimeType(uri);
                return newChunkedResponse(Response.Status.OK, mime, is);
            } catch (IOException e2) {
                // Try file system (external files dir)
//                java.io.File storageFile = new java.io.File(context.getExternalFilesDir(null),"assessment" + uri);
                java.io.File storageFile = new java.io.File(context.getExternalFilesDir(null), uri);//adjust as needed
                android.util.Log.d("LocalWebServer",
                        "Asset not found in lessonAsset, trying storage: " + storageFile.getAbsolutePath());
                if (storageFile.exists() && storageFile.isFile()) {
                    try {
                        java.io.FileInputStream fis = new java.io.FileInputStream(storageFile);
                        String mime = resolveMimeType(uri);
                        return newChunkedResponse(Response.Status.OK, mime, fis);
                    } catch (IOException e3) {
                        android.util.Log.e("LocalWebServer",
                                "Error reading file from storage: " + storageFile.getAbsolutePath(), e3);
                    }
                }
                android.util.Log.e("LocalWebServer", "Asset not found anywhere: " + lessonAssetPath, e2);
                return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
            }
        } catch (Exception e) {
            android.util.Log.e("LocalWebServer", "Server error: " + assetPath, e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "500 Internal Server Error");
        }
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