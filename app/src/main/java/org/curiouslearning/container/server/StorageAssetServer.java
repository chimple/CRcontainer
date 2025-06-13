package org.curiouslearning.container.server;

import android.util.Log;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import fi.iki.elonen.NanoHTTPD;

public class StorageAssetServer extends NanoHTTPD {
    private final File rootDir;

    public StorageAssetServer(int port, File rootDirectory) {
        super(port);
        this.rootDir = rootDirectory;
        Log.d("StorageAssetServer", "Initialized with rootDir: " + rootDir.getAbsolutePath());
        // List all files at startup
        File[] files = rootDir.listFiles();
        if (files != null) {
            for (File f : files) {
                Log.d("StorageAssetServer", "Available at startup: " + f.getAbsolutePath());
            }
        } else {
            Log.d("StorageAssetServer", "No files found at startup in: " + rootDir.getAbsolutePath());
        }
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri(); // e.g. "/french-lettersounds.json" or "/s.mp3"
        Log.d("StorageAssetServer", "Received request for URI: " + uri);
        File fileToServe = new File(rootDir, uri);
        Log.d("StorageAssetServer", "Resolved file path: " + fileToServe.getAbsolutePath());

        if (!fileToServe.exists() || fileToServe.isDirectory()) {
            Log.w("StorageAssetServer", "File not found: " + fileToServe.getAbsolutePath());
            // List files in rootDir for debugging
            File[] files = rootDir.listFiles();
            if (files != null) {
                for (File f : files) {
                    Log.d("StorageAssetServer", "File in rootDir: " + f.getName());
                }
            }
            return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "File not found");
        }
        try {
            FileInputStream fis = new FileInputStream(fileToServe);
            Log.d("StorageAssetServer", "Serving file: " + fileToServe.getAbsolutePath());
            return newChunkedResponse(Response.Status.OK, getMimeTypeForFile(uri), fis);
        } catch (IOException e) {
            Log.e("StorageAssetServer", "Error reading file: " + fileToServe.getAbsolutePath(), e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Error reading file");
        }
    }
}