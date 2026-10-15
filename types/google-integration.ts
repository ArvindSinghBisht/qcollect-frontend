export interface ConnectGoogleRequest {
  authorizationCode: string;
}

export interface GoogleSpreadsheet {
  spreadsheetId: string;
  spreadsheetName: string;
}

export interface SelectSpreadsheetRequest {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
}
