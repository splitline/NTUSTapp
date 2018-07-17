package com.splitline.ntustapp;

import android.graphics.Bitmap;
import android.graphics.Point;

import java.util.Vector;



public class VcodeImageComparator
{
	public Bitmap img;
	public Bitmap pimg;
	public int mcnt;
	public int ncnt;
	public int rcnt;
	public int mpcnt; // Maximum possible match
	public int mpscr; // Maximum possible score
	
	public int mmatch;
	public int mscr;
	
	public int box;
	public int boy;
	
	public VcodeImageComparator()
	{
	};
	
	public void setImg( Bitmap _img )
	{
		img = _img;
	};
	
	public static Bitmap cloneImage( Bitmap _img )
	{
		Bitmap nimg = Bitmap.createBitmap( _img.getWidth(), _img.getHeight(), Bitmap.Config.ARGB_8888 );
		
		int i, j;
		for ( i = 0; i < _img.getHeight(); i++ ) {
			for ( j = 0; j < _img.getWidth(); j++ ) {
				nimg.setPixel( j, i, _img.getPixel( j, i ) );
			}
		}
		
		return nimg;
	};
	
	static public int cappedGetRGB( Bitmap img, int x, int y )
	{
		if ( x < 0 || x >= (img.getWidth()) ) {
			return 0xFFFFFFFF;
		}
		
		if ( y < 0 || y >= (img.getHeight()) ) {
			return 0xFFFFFFFF;
		}
		
		return img.getPixel( x, y );
	};
	
	public void analysePatternPos( Vector<Point> blk, int ox, int oy )
	{
		Bitmap nimg = cloneImage( img );
		
		int _mcount = 0; // Matches
		int _ncount = 0; // Doesn't not matches
		
		for ( Point p : blk ) {
			if ( ( ( cappedGetRGB( nimg, p.x + ox, p.y + oy ) ) & 0x000000FF ) == 0 ) {
				// Black tile, match
				_mcount++;
				nimg.setPixel( p.x + ox, p.y + oy, 0xFFFFFFFF );
			} else {
				_ncount++;
			}
		}
		
		int _rcount = 0; // Remaining count
		int i, j;
		for ( i = 0; i < nimg.getHeight(); i++ ) {
			for ( j = 0; j < nimg.getWidth(); j++ ) {
				if ( ( ( cappedGetRGB( nimg, j, i ) ) & 0x000000FF ) == 0 ) {
					_rcount++;
				}
			}
		}
		
		mcnt = _mcount;
		ncnt = _ncount;
		rcnt = _rcount;
		
		mpcnt = mcnt+ncnt;
		
		pimg = nimg;
	}
	
	public int locateMinNMatch( Vector<Point> blk )
	{
		box = boy = 0;
		int max = Integer.MIN_VALUE;
		int i, j;
		for ( i = -3; i < 4; i++ ) {
			for ( j = -3; j < 4; j++ ) {
				analysePatternPos( blk, j, i );
				if ( mcnt > max ) {
					max = mcnt;
					box = j;
					boy = i;
				}
			}
		}
		
		analysePatternPos( blk, box, boy );
		
		mmatch = max;
		
		return (mpcnt-max);
	};
	
	public int getScore()
	{
		int res;
		
		res = 0;
		res += mcnt*2;
		res -= ncnt*2;
		res -= rcnt;
		
		mpscr = mpcnt*2;
		
		return res;
	};
	
	public int locateMaxScore( Vector<Point> blk )
	{
		
		box = boy = 0;
		int max = Integer.MIN_VALUE;
		int i, j;
		int scr;
		for ( i = -3; i < 4; i++ ) {
			for ( j = -3; j < 4; j++ ) {
				analysePatternPos( blk, j, i );
				scr = getScore();
				if ( scr > max ) {
					max = scr;
					box = j;
					boy = i;
				}
			}
		}
		
		analysePatternPos( blk, box, boy );
		
		mscr = max;
		
		return (mpscr-max);
	}
}
