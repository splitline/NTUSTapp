package com.splitline.ntustapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Point;
import android.util.Log;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Vector;



public class VcodeDictEntry
{
	private Vector<Point> plist;
	private String equiv; // Equivalent character
	private Bitmap img; // The original image
	
	public VcodeDictEntry()
	{
	}
	
	public void setEquiv( String _equiv ) {
		equiv = _equiv;
	}
	
	public String getEquiv()
	{
		return equiv;
	}
	
	public Bitmap getImage()
	{
		return img;
	}
	
	public int loadImage( String fname )
	{
		try {
			BitmapFactory.Options options = new BitmapFactory.Options();
			img = BitmapFactory.decodeFile(fname, options);
		} catch ( Exception e ) {
			return -1;
		}
		
		return 0;
	}
	
	public static Vector<Point> imgToPList( Bitmap bimg )
	{
		Vector<Point> res = new Vector<Point>();
		
		int i, j;
		for ( i = 0; i < bimg.getHeight(); i++ ) {
			for ( j = 0; j < bimg.getWidth(); j++ ) {
				if ( ( bimg.getPixel( j, i ) & 0x000000FF ) == 0 ) {
					res.add( new Point( j, i ) );
				}
			}
		}
		
		return res;
	}
	
	public void procImage()
	{
		plist = imgToPList( img );
	}
	
	public Vector<Point> getPL()
	{
		return plist;
	}
}