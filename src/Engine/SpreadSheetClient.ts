/** this is the class for the front end to prepare the fetch
 * requests to the server for the spreadsheet
 * 
 * it is used by SpreadSheet.tsx
 * 
 * It provides the following calls.
 * 
 * getDocument(name: string, user: string): Promise<Document>
 */

import { DocumentTransport, CellTransport, CellTransportMap, ErrorMessages } from '../Engine/GlobalDefinitions';
import { Cell } from '../Engine/Cell';

import { PortsGlobal } from '../PortsGlobal';



class SpreadSheetClient {
    private _serverPort: number = PortsGlobal.serverPort;
    private _baseURL: string = `http://pencil.local:${this._serverPort}`;
    private _userName: string = 'juancho';
    private _documentName: string = 'test';
    private _document: DocumentTransport;

    constructor(documentName: string, userName: string) {
        this._userName = userName;
        this._documentName = documentName;
        this.getDocument(this._documentName, this._userName);

        this._document = this._initializeBlankDocument();
        this._timedFetch();
    }

    private _initializeBlankDocument(): DocumentTransport {
        const document: DocumentTransport = {
            columns: 5,
            rows: 8,
            formula: 'holding',
            result: 'holding',
            currentCell: 'A1',
            isEditing: false,
            cells: new Map<string, CellTransport>(),
        };
        for (let row = 0; row < document.rows; row++) {
            for (let column = 0; column < document.columns; column++) {
                const cellName = Cell.columnRowToCell(column, row);
                const cell: CellTransport = {
                    formula: [],
                    value: 0,
                    error: ErrorMessages.emptyFormula,
                };
                document.cells.set(cellName, cell);
            }
        }
        return document;
    }
    /**
     * 
     * Every .1 seconds, fetch the document from the server
     */
    private async _timedFetch(): Promise<Response> {
        const url = `${this._baseURL}/documents/${this._documentName}`;
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": this._userName })
        };

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                fetch(url, options)
                    .then(response => {
                        this.getDocument(this._documentName, this._userName);
                        this._timedFetch();
                        resolve(response);
                    })
                    .catch(error => {
                        reject(error);
                    });
            }, 100);
        });
    }

    public get userName(): string {
        return this._userName;
    }

    public set userName(userName: string) {
        this._userName = userName;
    }

    public get documentName(): string {
        return this._documentName;
    }

    public set documentName(documentName: string) {
        this._documentName = documentName;
    }

    public getFormulaString(): string {
        if (!this._document) {
            return '';
        }
        const formula = this._document.formula;
        if (formula) {
            return formula
        }
        return '';
    }

    public getResultString(): string {
        if (!this._document) {
            return '';
        }

        const result = this._document.result;
        if (result) {
            return result;
        }
        return '';
    }

    private _getCellValue(cellTransport: CellTransport): string {
        if (cellTransport.error === '') {
            return cellTransport.value.toString();
        } else if (cellTransport.error === ErrorMessages.emptyFormula) {
            return '';
        } else {
            return cellTransport.error;
        }
    }
    public getSheetDisplayStringsForGUI(): string[][] {
        if (!this._document) {
            return [];
        }
        const columns = this._document.columns;
        const rows = this._document.rows;
        const cells: Map<string, CellTransport> = this._document.cells as Map<string, CellTransport>;
        const sheetDisplayStrings: string[][] = [];
        // create a 2d array of strings that is [row][column]



        for (let row = 0; row < rows; row++) {
            sheetDisplayStrings[row] = [];
            for (let column = 0; column < columns; column++) {
                const cellName = Cell.columnRowToCell(column, row)!;
                const cell = cells.get(cellName) as CellTransport;
                if (cell) {
                    sheetDisplayStrings[row][column] = this._getCellValue(cell);
                } else {
                    sheetDisplayStrings[row][column] = 'xxx';
                }
            }
        }
        return sheetDisplayStrings;
    }

    public getEditStatusString(): string {
        if (!this._document) {
            return 'no document';
        }
        if (this._document.isEditing) {
            return `editing: ${this._document.currentCell}`;
        }
        return `viewing: ${this._document.currentCell}`;
    }

    public getWorkingCellLabel(): string {
        if (!this._document) {
            return '';
        }
        return this._document.currentCell;
    }

    public getEditStatus(): boolean {
        return this._document.isEditing;
    }

    /**
     * ask for permission to edit a cell
     * @param bool 
     * @returns 
     */
    public setEditStatus(isEditing: boolean): void {

        // request edit statut sof the current cell
        let requestEditViewURL = `${this._baseURL}/document/cell/view/${this._documentName}/${this._document.currentCell}`;
        if (isEditing) {
            requestEditViewURL = `${this._baseURL}/document/cell/edit/${this._documentName}/${this._document.currentCell}`;
        }
        console.log(this._userName);
        fetch(requestEditViewURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": this._userName })
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });
    }



    public addToken(token: string): void {
        const requestAddTokenURL = `${this._baseURL}/document/addtoken/${this._documentName}/${token}`;
        fetch(requestAddTokenURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": this._userName })
        })
            .then(response => {

                return response.json() as Promise<DocumentTransport>;
            }
            ).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });
    }

    public addCell(cell: string): void {
        const requestAddCellURL = `${this._baseURL}/document/addcell/${this._documentName}/${cell}`;

        fetch(requestAddCellURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": this._userName })
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }
            ).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });

    }

    public removeToken(): void {
        const requestRemoveTokenURL = `${this._baseURL}/document/removetoken/${this._documentName}`;
        fetch(requestRemoveTokenURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": this._userName })
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }
            ).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });
    }

    public requestViewByLabel(label: string): void {
        const requestViewURL = `${this._baseURL}/document/cell/view/${this._documentName}/${label}`;
        console.log(this._userName);
        fetch(requestViewURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": this._userName })
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });
    }

    public clearFormula(): void {
        return;
    }



    /**
     * get the document from the server
     * 
     * @param name the name of the document
     * @param user the user name
     * 
     * this is client side so we use fetch
     */
    public getDocument(name: string, user: string) {
        // put the user name in the body
        const userName = user;
        const fetchURL = `${this._baseURL}/documents/${name}`;
        fetch(fetchURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": userName })
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }).then((document: DocumentTransport) => {
                this._updateDocument(document);

            });

    }


    private _updateDocument(document: DocumentTransport): void {
        const formula = document.formula;
        const result = document.result;
        const currentCell = document.currentCell;
        const columns = document.columns;
        const rows = document.rows;
        const isEditing = document.isEditing;



        // create the document
        this._document = {
            formula: formula,
            result: result,

            currentCell: currentCell,
            columns: columns,
            rows: rows,
            isEditing: isEditing,
            cells: new Map<string, CellTransport>(),
        };
        // create the cells
        const cells = document.cells as unknown as CellTransportMap;

        for (let cellName in cells) {

            let cellTransport = cells[cellName];
            const [column, row] = Cell.cellToColumnRow(cellName);
            const cell: CellTransport = {
                formula: cellTransport.formula,
                value: cellTransport.value,
                error: cellTransport.error,
            };
            this._document!.cells.set(cellName, cell);
        }

    }

}



export default SpreadSheetClient;