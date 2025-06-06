package org.curiouslearning.container.server;

import android.content.Context;
import android.content.res.AssetManager;

import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;

public class AppServer extends NanoHTTPD {
    private final Context context;
    private final String baseAssetFolder;

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
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
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
            // If not found in baseAssetFolder, try lessonAsset
            String lessonAssetPath = "lessonAsset" + uri;
            android.util.Log.d("LocalWebServer", "Asset not found in baseAssetFolder, trying lessonAsset: " + lessonAssetPath);
            try {
                AssetManager assetManager = context.getAssets();
                InputStream is = assetManager.open(lessonAssetPath);
                String mime = resolveMimeType(uri);
                return newChunkedResponse(Response.Status.OK, mime, is);
            } catch (IOException e2) {
                android.util.Log.e("LocalWebServer", "Asset not found in lessonAsset either: " + lessonAssetPath, e2);
                return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
            }
        } catch (Exception e) {
            android.util.Log.e("LocalWebServer", "Server error: " + assetPath, e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "500 Internal Server Error");
        }
    }

    // @Override
    // public Response serve(IHTTPSession session) {
    //     String uri = session.getUri();
    //     if (uri.equals("/")) {
    //         uri = "/index.html";
    //     }
    //     String assetPath = baseAssetFolder + uri;
    //     android.util.Log.d("LocalWebServer", "Requested asset: " + assetPath);
    //     try {
    //         AssetManager assetManager = context.getAssets();
    //         InputStream is = assetManager.open(assetPath);
    //         String mime = resolveMimeType(uri);
    //         return newChunkedResponse(Response.Status.OK, mime, is);
    //     } catch (IOException e) {
    //         android.util.Log.e("LocalWebServer", "Asset not found: " + assetPath, e);
    //         return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
    //     } catch (Exception e) {
    //         android.util.Log.e("LocalWebServer", "Server error: " + assetPath, e);
    //         return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "500 Internal Server Error");
    //     }
    // }

//     @Override
// public Response serve(IHTTPSession session) {
//     String uri = session.getUri();
//     if (uri.equals("/")) {
//         uri = "/index.html";
//     }

//     // Serve audio and data from external storage
//     if (uri.startsWith("/audio/") || uri.startsWith("/data/")) {
//         String externalBase = "/storage/emulated/0/MyAppAssets"; // or wherever your files are
//         java.io.File file = new java.io.File(externalBase + uri);
//         if (file.exists()) {
//             try {
//                 java.io.FileInputStream fis = new java.io.FileInputStream(file);
//                 String mime = resolveMimeType(uri);
//                 return newChunkedResponse(Response.Status.OK, mime, fis);
//             } catch (Exception e) {
//                 android.util.Log.e("LocalWebServer", "Error serving external file: " + file.getAbsolutePath(), e);
//                 return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "500 Internal Server Error");
//             }
//         } else {
//             android.util.Log.e("LocalWebServer", "External file not found: " + file.getAbsolutePath());
//             return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
//         }
//     }

//     // Serve everything else from assets
//     String assetPath = baseAssetFolder + uri;
//     android.util.Log.d("LocalWebServer", "Requested asset: " + assetPath);
//     try {
//         AssetManager assetManager = context.getAssets();
//         InputStream is = assetManager.open(assetPath);
//         String mime = resolveMimeType(uri);
//         return newChunkedResponse(Response.Status.OK, mime, is);
//     } catch (IOException e) {
//         android.util.Log.e("LocalWebServer", "Asset not found: " + assetPath, e);
//         return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
//     } catch (Exception e) {
//         android.util.Log.e("LocalWebServer", "Server error: " + assetPath, e);
//         return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "500 Internal Server Error");
//     }
// }

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