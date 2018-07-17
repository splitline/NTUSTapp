package com.splitline.ntustapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;
import java.util.HashMap;

public class VcodeOcrModule extends ReactContextBaseJavaModule  {

	private static final String REACT_CLASS = "VcodeOcr";
	private final ReactApplicationContext reactContext;
	private String DATA_PATH;

	public VcodeOcrModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;
		this.DATA_PATH = reactContext.getFilesDir().toString() + File.separator;
//		if (!this.DATA_PATH.contains(reactContext.getPackageName()))
//			this.DATA_PATH += reactContext.getPackageName() + File.separator;
	}

	@Override
	public String getName() {
		return REACT_CLASS;
	}

	@Override
	public Map<String, Object> getConstants() {
		final Map<String, Object> constants = new HashMap<>();
		// Example: constants.put(Str, Obj);
		return constants;
	}

	@ReactMethod
	public void recognize(String path, Promise promise) {
		prepareAll();
		Log.d(REACT_CLASS, "Start ocr images");
		try {
			BitmapFactory.Options options = new BitmapFactory.Options();
			Bitmap bitmap = BitmapFactory.decodeFile(path, options);
			String result = extractText(bitmap);
			Log.d(REACT_CLASS, result);
			promise.resolve(result);

		} catch (Exception e) {
			Log.e(REACT_CLASS, e.getMessage());
			promise.reject("An error occurred", e.getMessage());
		}
	}

	private String extractText(Bitmap bitmap) {
		VcodeOcr.initClassifier(DATA_PATH);
		int rv;
		int i, j;
		VcodeOcr ocr = new VcodeOcr();
		ocr.setImage(bitmap);
		ocr.normalize();
		ocr.partition();
		ocr.classify();
		Log.d(REACT_CLASS, "classify done");
		return ocr.ptRes;
	}

	private void prepareAll() {
		Log.d(REACT_CLASS, "Preparing OCR enviroment");

		try {
			prepareDirectory(DATA_PATH + "VcodeDict");
		} catch (Exception e) {
			e.printStackTrace();
		}

		copyOcrDataFiles("VcodeDict");
	}

	private void prepareDirectory(String path) {
		File dir = new File(path);
		if (!dir.exists()) {
			if (!dir.mkdirs()) {
				Log.e(REACT_CLASS, "ERROR: Creation of directory " + path
						+ " failed, check permission to write to external storage.");
			}
		} else {
			Log.i(REACT_CLASS, "Created directory " + path);
		}
	}

	private void copyOcrDataFiles(String path) {
		try {
			String fileList[] = reactContext.getAssets().list(path);

			for (String fileName : fileList) {

				String pathToDataFile = DATA_PATH + path + "/" + fileName;
				if (!(new File(pathToDataFile)).exists()) {

					InputStream in = reactContext.getAssets().open(path + "/" + fileName);

					OutputStream out = new FileOutputStream(pathToDataFile);

					byte[] buf = new byte[1024];
					int len;

					while ((len = in.read(buf)) > 0)
						out.write(buf, 0, len);

					in.close();
					out.close();

					Log.d(REACT_CLASS, "Copied " + fileName + " to VcodeOcr");
				}
			}
		} catch (IOException e) {
			Log.e(REACT_CLASS, "Unable to copy files to VcodeOcr " + e.toString());
		}
	}

};
