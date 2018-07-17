package com.splitline.ntustapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Point;
import android.util.Log;

import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Deque;
import java.util.LinkedList;
import java.util.Vector;

public class VcodeOcr {

	public Bitmap bimg;
	public Vector<Bitmap> lblk;
	public String ptRes; // Plain Text Result
	public int threshold;
	public int rscore;
	public static final int initial_threshold = 25;

	public VcodeOcr() {
		lblk = new Vector<Bitmap>();
		threshold = initial_threshold;
		ptRes = "";
	}

	public void loadImage(String path) {
		try {
			BitmapFactory.Options options = new BitmapFactory.Options();
			Bitmap bitmap = BitmapFactory.decodeFile(path, options);
			bimg = bitmap;
		} catch (Exception e) {
			Log.e("VcodeOcr: loadImage", e.getMessage());
		}
	}

	public void setThreshold(int _t) {
		threshold = _t;
	}

	public void setImage(Bitmap _img) {
		bimg = _img;
	}

	static public int cappedGetRGB(Bitmap img, int x, int y) {
		if (x < 0 || x >= img.getWidth()) {
			return 0xFFFFFFFF;
		}

		if (y < 0 || y >= img.getHeight()) {
			return 0xFFFFFFFF;
		}

		return img.getPixel(x, y);
	}

	static public int countNonWhite(Bitmap img, int x, int y) {
		int count = 0;

		if ((cappedGetRGB(img, x + 1, y) & 0x00FFFFFF) == 0x00FFFFFF)
			count += 2;
		if ((cappedGetRGB(img, x, y + 1) & 0x00FFFFFF) == 0x00FFFFFF)
			count += 2;
		if ((cappedGetRGB(img, x - 1, y) & 0x00FFFFFF) == 0x00FFFFFF)
			count += 2;
		if ((cappedGetRGB(img, x, y - 1) & 0x00FFFFFF) == 0x00FFFFFF)
			count += 2;

		if ((cappedGetRGB(img, x + 1, y + 1) & 0x00FFFFFF) == 0x00FFFFFF)
			count++;
		if ((cappedGetRGB(img, x - 1, y + 1) & 0x00FFFFFF) == 0x00FFFFFF)
			count++;
		if ((cappedGetRGB(img, x + 1, y - 1) & 0x00FFFFFF) == 0x00FFFFFF)
			count++;
		if ((cappedGetRGB(img, x - 1, y - 1) & 0x00FFFFFF) == 0x00FFFFFF)
			count++;

		return count;
	}

	public void clearIsolatedPixel() {
		Bitmap nimg = Bitmap.createBitmap(bimg.getWidth(), bimg.getHeight(), Bitmap.Config.ARGB_8888);
		int i, j;
		for (i = 0; i < bimg.getHeight(); i++) {
			for (j = 0; j < bimg.getWidth(); j++) {
				if (countNonWhite(bimg, j,  i) >= 10) {
					// cover by non white tile
					nimg.setPixel(j, i, 0xFFFFFFFF);
				} else {
					nimg.setPixel( j, i, bimg.getPixel(j, i));
				}
			}
		}

		bimg = nimg;
	}

	public static Bitmap convertToAlpha(Bitmap img) {
		Bitmap nimg = Bitmap.createBitmap(img.getWidth(), img.getHeight(), Bitmap.Config.ARGB_8888);
		int i, j;
		int R, G, B;
		int Avg;
		int p;
		for (i = 0; i < img.getHeight(); i++) {
			for (j = 0; j < img.getWidth(); j++) {
				p = img.getPixel(j, i);
				R = p & 0x000000FF;
				G = (p & 0x0000FF00) >> 8;
				B = (p & 0x00FF0000) >> 16;
				Avg = (R + G + B) / 3;
				if (Avg < 0)
					Avg = 0;
				if (Avg > 0x000000FF)
					Avg = 0x000000FF;
				Avg = Avg & 0x000000FF;
				p = 0xFF000000 | Avg | Avg << 8 | Avg << 16;
				nimg.setPixel(j, i, p);
			}
		}

		return nimg;
	}

	public static int getR(Bitmap img, int x, int y) {
		int p;
		p = img.getPixel(x, y);
		return (p & 0x000000FF);
	}

	public static Bitmap nonlinearImgMapping(Bitmap img) {
		int nthres = 253;
		Bitmap nimg = Bitmap.createBitmap(img.getWidth(), img.getHeight(), Bitmap.Config.ARGB_8888);
		int i, j;
		int R;
		for (i = 0; i < img.getHeight(); i++) {
			for (j = 0; j < img.getWidth(); j++) {
				R = getR(img, j,  i);
				if (R > nthres) {
					R = 255;
				} else {
					R = 0;
				}
				nimg.setPixel( j, i, 0xFF000000 | R | R << 8 | R << 16);
			}
		}

		return nimg;
	}

	public static Bitmap renderBlock(Collection<Point> blk, int minX, int maxX, int minY, int maxY) {
		Bitmap nimg = Bitmap.createBitmap((maxX - minX + 1), (maxY - minY + 1), Bitmap.Config.ARGB_8888);

		int i, j;
		for (i = 0; i < nimg.getHeight(); i++) {
			for (j = 0; j < nimg.getWidth(); j++) {
				nimg.setPixel(j, i , 0xFFFFFFFF);
			}
		}

		for (Point p : blk) {
			nimg.setPixel(p.x - minX, p.y - minY , 0xFF000000);
		}

		return nimg;
	}

	public void BFSonPoint(int sx, int sy) {
		Deque<Point> q = new LinkedList<Point>();
		Deque<Point> res = new ArrayDeque<Point>();

		q.addLast(new Point(sx, sy));
		bimg.setPixel(sx, sy, 0xFFFFFFFF);

		Point p;
		int x, y;
		int minX, maxX, minY, maxY;
		minX = minY = Integer.MAX_VALUE;
		maxX = maxY = Integer.MIN_VALUE;

		while (true) {
			if (q.size() == 0) {
				// We're done
				break;
			}
			p = q.removeFirst();

			x = p.x;
			y = p.y;

			bimg.setPixel(x, y, 0xFFFFFFFF);

			if (x - 1 >= 0) {
				if ((bimg.getPixel(x - 1, y) & 0x000000FF) == 0) {
					// Black tile, we can add it
					q.addLast(new Point(x - 1, y));
					bimg.setPixel(x - 1, y, 0xFFFFFFFF);
				}
			}

			if (x + 1 < bimg.getWidth()) {
				if ((bimg.getPixel(x + 1, y) & 0x000000FF) == 0) {
					// Black tile, we can add it
					q.addLast(new Point(x + 1, y));
					bimg.setPixel(x + 1, y, 0xFFFFFFFF);
				}
			}

			if (y - 1 >= 0) {
				if ((bimg.getPixel(x, y - 1) & 0x000000FF) == 0) {
					// Black tile, we can add it
					q.addLast(new Point(x, y - 1));
					bimg.setPixel(x, y - 1, 0xFFFFFFFF);
				}
			}

			if (y + 1 < bimg.getHeight()) {
				if ((bimg.getPixel(x, y + 1) & 0x000000FF) == 0) {
					// Black tile, we can add it
					q.addLast(new Point(x, y + 1));
					bimg.setPixel(x, y + 1, 0xFFFFFFFF);
				}
			}

			if (x < minX)
				minX = x;
			if (x > maxX)
				maxX = x;
			if (y < minY)
				minY = y;
			if (y > maxY)
				maxY = y;

			res.addLast(new Point(x, y));
		}

		if (res.size() >= 5){
			lblk.add(renderBlock(res, minX, maxX, minY, maxY));
		}

	}

	public void normalize() {
		clearIsolatedPixel();
		bimg = convertToAlpha(bimg);
		bimg = nonlinearImgMapping(bimg);
	}

	public void partition() {
		int i, j;

		for (j = 0; j < bimg.getWidth(); j++) {
			for (i = 0; i < bimg.getHeight(); i++) {
				if ((bimg.getPixel(j , i) & 0x000000FF) == 0) {
					// Black tile, init BFS
					BFSonPoint(j, i );
				}
			}
		}

	}

	static private VcodeClassifier ccl;

	static public void initClassifier(String path) {
		ccl = new VcodeClassifier();
		ccl.loadDict(path);
	}

	public void classify() {
		int rv;
		String srv;

		rscore = 0;
		StringBuilder res = new StringBuilder();
		for (Bitmap img : lblk) {
			srv = ccl.classifyByMinScore(img);
			rv = ccl.mscore;
			if (rv > threshold) {
				// That's some problem
				rscore += rv;
				srv = ccl.classifyByMinNMatch(img);
				res.append(srv);
				VcodeOcr cc = new VcodeOcr();
				cc.setImage(ccl.prevImg);
				cc.setThreshold(initial_threshold * 2);
				cc.normalize();
				cc.partition();
				cc.classify();
				res.append(cc.ptRes);
				rscore += cc.rscore;
			} else {
				res.append(srv);
				rscore += rv;
			}
		}

		ptRes = res.toString();

	}
}
