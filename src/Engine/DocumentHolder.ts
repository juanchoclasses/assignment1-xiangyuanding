/**
 * Hold a number of spreadsheets in memory.
 * Each spreadsheet is a type of SpreadSheetController
 * The DocumentHolder exposes the methods of the SpreadSheetController
 * 
 * The document holder is called by a server to manage the documents
 * 
 * It provides a named access to controllers for these functions
 * 
 * addToken(token:string):  void
 * addCell(cell:string): void
 * removeToken(): void
 * clearFormula(): void
 * getFormulaString(): string
 * getResultString(): string
 * setWorkingCellByLabel(label:string): void
 * getWorkingCellLabel(): string
 * setWorkingCellByCoordinates(column:number, row:number): void
 * getSheetDisplayStringsForGUI(): string[][]
 * getEditStatus(): boolean
 * setEditStatus(bool:boolean): void
 * getEditStatusString(): string
 * 
 */
import * as fs from 'fs';
import * as path from 'path';
import { SpreadSheetController } from "./SpreadSheetController";


export class DocumentHolder {
    private _documents: Map<string, SpreadSheetController>;
    // the document folder defaults to a folder called documents in the current directory
    // this can be changed by calling setDocumentFolder
    private _documentFolder: string;

    constructor(documentDirectory: string = 'documents') {
        this._documents = new Map<string, SpreadSheetController>();

        const rootPath = path.join(__dirname, '..', '..');

        this._documentFolder = path.join(rootPath, documentDirectory);
        this._initializeDocumentDirectory();
        this._loadDocuments();
    }

    private _initializeDocumentDirectory(): void {
        if (!fs.existsSync(this._documentFolder)) {
            fs.mkdirSync(this._documentFolder, { recursive: true });
        }
    }

    /** clean out all the files in the directory that start with xxx
     *  to be used in testing
     */
    private _cleanFiles(): void {
        const files = fs.readdirSync(this._documentFolder);
        // delete all files that start with xxx
        files.forEach(file => {
            if (file.startsWith('xxx')) {
                fs.unlinkSync(path.join(this._documentFolder, file));
            }
        });
    }

    private _loadDocuments(): void {
        const files = fs.readdirSync(this._documentFolder);
        files.forEach(file => {
            console.log(file)
            const documentPath = path.join(this._documentFolder, file);
            const documentJSON = fs.readFileSync(documentPath, 'utf8');

            // create a new controller
            const controller = SpreadSheetController.spreadsheetFromJSON(documentJSON)
            // add the controller to the map this assumes all files are .json
            this._documents.set(file.slice(0, -5), controller);

        }
        );
    }

    private _checkForNewDocuments(): void {
        const files = fs.readdirSync(this._documentFolder);
        // if the file is not in the map, add it
        files.forEach(file => {
            if (!this._documents.has(file.slice(0, -5))) {
                const documentPath = path.join(this._documentFolder, file);
                const documentJSON = fs.readFileSync(documentPath, 'utf8');

                // create a new controller
                const controller = SpreadSheetController.spreadsheetFromJSON(documentJSON)
                // add the controller to the map this assumes all files are .json
                this._documents.set(file.slice(0, -5), controller);
                console.log('added document', file.slice(0, -5));
            }
        }
        );
    }



    private _saveDocument(name: string): void {
        let document = this._documents.get(name);
        if (document) {
            let documentJSON = document.sheetToJSON();
            const documentPath = path.join(this._documentFolder, name + '.json');
            fs.writeFileSync(documentPath, documentJSON);
        }
    }

    /**
     * a function for development for the tests.
     */
    public reset(): void {
        this._documents = new Map<string, SpreadSheetController>();
        this._initializeDocumentDirectory();
        this._cleanFiles();
        this._loadDocuments();
    }

    public getDocumentNames(): string[] {
        this._checkForNewDocuments();
        const documentNames = Array.from(this._documents.keys());
        return documentNames;
    }

    public createDocument(name: string, columns: number, rows: number, user: string): boolean {
        if (this._documents.has(name)) {
            return false
        }
        let document = new SpreadSheetController(columns, rows);
        this._documents.set(name, document);
        this._saveDocument(name);
        // by default the first cell is the cell a new document looks at
        this.requestViewAccess(name, 'A1', user);
        return true;
    }

    public getDocumentJSON(name: string, userName: string): string {
        let document = this._documents.get(name);
        if (document) {
            // get the json string for the controler
            const documentContainer = document.documentContainer(userName);
            // convert to JSON
            const documentJSON = JSON.stringify(documentContainer);
            return documentJSON;
        }
        throw new Error('Document not found');
    }
    public requestViewAccess(docName: string, cellLabel: string, user: string) {
        let document = this._documents.get(docName);
        if (!document) {
            return false;
        }
        document.requestViewAccess(user, cellLabel);
        return true;
    }

    public requestEditAccess(docName: string, cellLabel: string, user: string): boolean {
        let document = this._documents.get(docName);
        if (!document) {
            return false;
        }
        return document.requestEditAccess(user, cellLabel);
    }

    public addToken(docName: string, token: string, user: string,): any {
        let document = this._documents.get(docName);
        if (document) {
            document.addToken(token, user);
            this._saveDocument(docName);
            // get the json string for the controler
            const documentJSON = this.getDocumentJSON(docName, user);
            return documentJSON;
        }
        throw new Error('Document not found');

    }

    public addCell(docName: string, cell: string, user: string): string {
        let document = this._documents.get(docName);
        if (document) {
            document.addCell(cell, user);
            this._saveDocument(docName);
            // get the json string for the controler
            const documentJSON = this.getDocumentJSON(docName, user);
            return documentJSON;
        }
        throw new Error('Document not found');
    }

    public removeToken(docName: string, user: string): string {
        let document = this._documents.get(docName);
        if (document) {
            document.removeToken(user);
            this._saveDocument(docName);
            // get the json string for the controler
            const documentJSON = this.getDocumentJSON(docName, user);
            return documentJSON;
        }
        throw new Error('Document not found');
    }

    public clearFormula(docName: string, user: string): string {
        let document = this._documents.get(docName);
        if (document) {
            document.clearFormula(user);
            this._saveDocument(docName);
            // get the json string for the controler
            const documentJSON = this.getDocumentJSON(docName, user);
            return documentJSON;
        }
        throw new Error('Document not found');
    }

    public getFormulaString(name: string, user: string): string {
        let document = this._documents.get(name);
        if (document) {
            const formulaString = document.getFormulaStringForUser(user);
            return formulaString;
        }
        throw new Error('Document not found');
    }

    public getResultString(name: string, user: string): string {
        let document = this._documents.get(name);
        if (document) {
            const resultString = document.getResultStringForUser(user);
            return resultString;
        }
        throw new Error('Document not found');
    }

    public getWorkingCellLabel(name: string, user: string): string {
        let document = this._documents.get(name);
        if (document) {
            const workingCellLabel = document.getWorkingCellLabel(user);
            return workingCellLabel;
        }
        throw new Error('Document not found');
    }

    // TODO detemine if needed
    public setWorkingCellByLabel(name: string, label: string): string {
        let document = this._documents.get(name);
        if (document) {
            document.setWorkingCellByLabel(label);
            this._saveDocument(name);
            // get the json string for the controler
            const documentJSON = document.sheetToJSON();
            return documentJSON;
        }
        throw new Error('Document not found');
    }

    // TODO determine if needed
    public getEditStatus(name: string, user: string): boolean {
        let document = this._documents.get(name);
        if (document) {
            const editStatus = document.getEditStatus(user);
            return editStatus;
        }
        throw new Error('Document not found');
    }


    // TODO determine if needed
    public getEditStatusString(name: string, user: string): string {
        let document = this._documents.get(name);
        if (document) {
            const editStatusString = document.getEditStatusString(user);
            return editStatusString;
        }
        throw new Error('Document not found');
    }




}

