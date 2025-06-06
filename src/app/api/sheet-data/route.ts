import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Initialize the Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Google Sheet ID is not configured');
    }

    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:O', // Columns A to O to match all our fields including job source
    });

    const data = response.data.values || [];

    return NextResponse.json({ 
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch sheet data' 
      },
      { status: 500 }
    );
  }
}
