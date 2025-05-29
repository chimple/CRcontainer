package org.curiouslearning.container.server;

import android.content.Context;
import android.content.res.AssetManager;

import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;

public class AppServer extends NanoHTTPD {
    private final Context context;

    public AppServer(Context context, int port) {
        super(port);
        this.context = context;
        try {
            context.getAssets().open("web/bundle.js").close();
            android.util.Log.d("LocalWebServer", "bundle.js is accessible!");
        } catch (Exception e) {
            android.util.Log.e("LocalWebServer", "bundle.js is NOT accessible!", e);
        }
    }

    // @Override
    // public Response serve(IHTTPSession session) {
    //     String uri = session.getUri();
    //     if (uri.equals("/")) {
    //         uri = "/index.html";
    //     }
    //     // Remove leading slash for AssetManager
    //     String assetPath = "web" + uri;
    //     android.util.Log.d("LocalWebServer", "Requested asset: " + assetPath);
    //     try {
    //         AssetManager assetManager = context.getAssets();
    //         InputStream is = assetManager.open(assetPath);
    //         String mime = resolveMimeType(uri);
    //         return newChunkedResponse(Response.Status.OK, mime, is);
    //     } catch (IOException e) {
    //         android.util.Log.e("LocalWebServer", "Asset not found: " + assetPath);
    //         return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
    //     }
    // }

    @Override
public Response serve(IHTTPSession session) {
    String uri = session.getUri();
    if (uri.equals("/")) {
        uri = "/index.html";
    }
    String assetPath = "web" + uri;
    android.util.Log.d("LocalWebServer", "Requested asset: " + assetPath);
    try {
        AssetManager assetManager = context.getAssets();
        InputStream is = assetManager.open(assetPath);
        String mime = resolveMimeType(uri);
        return newChunkedResponse(Response.Status.OK, mime, is);
    } catch (IOException e) {
        android.util.Log.e("LocalWebServer", "Asset not found: " + assetPath, e);
        return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
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