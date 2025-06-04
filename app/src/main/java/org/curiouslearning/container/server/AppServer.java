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
    private static final String TAG = "AppServer";

    public AppServer(Context context, int port, String baseAssetFolder) {
        super(port);
        this.context = context;
        this.baseAssetFolder = baseAssetFolder;
        try {
            // Verify web assets are accessible
            String[] files = context.getAssets().list(baseAssetFolder);
            if (files != null && files.length > 0) {
                Log.d(TAG, "Found web assets in " + baseAssetFolder + ": " + String.join(", ", files));
            } else {
                Log.e(TAG, "No web assets found in " + baseAssetFolder + " directory!");
            }
        } catch (IOException e) {
            Log.e(TAG, "Error checking web assets", e);
        }
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        if (uri.equals("/")) {
            uri = "/index.html";
        }
        String assetPath = baseAssetFolder + uri;
        Log.d(TAG, "Serving asset: " + assetPath);
        
        try {
            AssetManager assetManager = context.getAssets();
            InputStream is = assetManager.open(assetPath);
            String mime = resolveMimeType(uri);
            Log.d(TAG, "Serving " + assetPath + " with mime type: " + mime);
            return newChunkedResponse(Response.Status.OK, mime, is);
        } catch (IOException e) {
            Log.e(TAG, "Asset not found: " + assetPath, e);
            return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found: " + assetPath);
        } catch (Exception e) {
            Log.e(TAG, "Server error serving " + assetPath, e);
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
        if (path.endsWith(".woff")) return "font/woff";
        if (path.endsWith(".woff2")) return "font/woff2";
        if (path.endsWith(".ttf")) return "font/ttf";
        return "text/plain";
    }
}