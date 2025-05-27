import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1';

// This is the API route that will handle form submissions
export async function POST(request: Request) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const body = await request.json();

    // Get the current date and time for submission tracking
    const submissionDate = new Date().toISOString();

    // Prepare the row data in the correct order matching the sheet columns
    const rowData = [
      body.jobNumber,
      body.customerName,
      body.jobName,
      body.jobLocation,
      body.salesPerson,
      body.jobSize,
      body.quantity,
      body.jobCategory,
      body.jobBookedDate,
      body.jobStatus,
      body.deliveryDate,
      body.deliveryDetails,
      body.remark || '',
      submissionDate // Track when the entry was submitted
    ];

    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:N`, // Updated to include all columns
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Job entry submitted successfully!',
      data: response.data 
    });
  } catch (error) {
    console.error('Error submitting job entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit job entry',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to check if the API is working
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Form submission API is working' 
  });
}
