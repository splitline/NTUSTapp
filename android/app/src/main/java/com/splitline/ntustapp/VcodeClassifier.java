package com.splitline.ntustapp;

import android.graphics.Bitmap;
import android.util.Log;

import java.util.Vector;

public class VcodeClassifier {
	private Vector<VcodeDictEntry> dict;
	private Vector<VcodeDictEntry> numDict;
	public int mscore;
	public Bitmap prevImg;
	private VcodeImageComparator ic;

	public VcodeClassifier() {
		dict = new Vector<>();
		numDict = new Vector<>();
	}

	private int loadEntry(String eqv, String path, Boolean isNum) {
		VcodeDictEntry de;
		int rv;

		de = new VcodeDictEntry();
		de.setEquiv(eqv);

		rv = de.loadImage(path + "VcodeDict/" + eqv + ".png");

		if (rv < 0) {
			Log.d("VcodeOcr[IOQUV07]", "Failed to load dict element " + eqv + "\n");

			return -1;
		}

		de.procImage();
		if (isNum)
			numDict.add(de);
		else
			dict.add(de);

		return 0;
	}

	public void loadDict(String path) {
		int i;

		char[] t1 = new char[1];
		for (i = 'A'; i <= 'Z'; i++) {
			t1[0] = (char) i;
			if ("IOQUV".indexOf(t1[0]) >= 0) {
				continue;
			}
			loadEntry(new String(t1), path, false);
		}

		for (i = '0'; i <= '9'; i++) {
			t1[0] = (char) i;
			if ("07".indexOf(t1[0]) >= 0) {
				continue;
			}
			loadEntry(new String(t1), path, true);
		}
	}

	public String classifyByMinNMatch(Bitmap inp, Boolean isNum) {
		ic = new VcodeImageComparator();
		ic.setImg(inp);

		String res = " ";
		int mmatch = Integer.MAX_VALUE;
		int rv;
		VcodeDictEntry mde = null;
		for (VcodeDictEntry de : (isNum ? numDict : dict)) {
			rv = ic.locateMinNMatch(de.getPL());
			if (rv < mmatch) {
				mmatch = rv;
				res = de.getEquiv();
				mde = de;
			}
		}

		ic.locateMinNMatch(mde.getPL());
		prevImg = ic.pimg;

		return res;
	};

	public String classifyByMinScore(Bitmap inp, Boolean isNum) {
		ic = new VcodeImageComparator();
		ic.setImg(inp);

		String res = " ";
		mscore = Integer.MAX_VALUE;
		int rv;
		VcodeDictEntry mde = null;
		for (VcodeDictEntry de : (isNum ? numDict : dict)) {
			rv = ic.locateMaxScore(de.getPL());
			if (rv < mscore) {
				mscore = rv;
				res = de.getEquiv();
				mde = de;
			}
		}

		ic.locateMaxScore(mde.getPL());
		prevImg = ic.pimg;

		return res;
	}
}
