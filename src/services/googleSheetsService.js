import path from "path";
import { google } from "googleapis";
import dotenv from 'dotenv';

dotenv.config();

const sheetId = process.env.GOOGLE_SHEET_ID;

const sheets = google.sheets('v4');

async function addRowToSheet(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
        auth,
    };

    try {
        const response = await sheets.spreadsheets.values.append(request);
        return response;
    } catch (error) {
        console.error(error);
    }

}

const appendToSheet = async (data) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'src/credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        const spreadsheetId = sheetId;

        await addRowToSheet(authClient, spreadsheetId, data);
        return "Data saved"

    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;