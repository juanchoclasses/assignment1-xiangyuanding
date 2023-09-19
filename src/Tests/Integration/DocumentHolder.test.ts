import fs from 'fs';
import path from 'path';

import { DocumentHolder } from '../../Engine/DocumentHolder';

const documentTestPath = 'testDocuments';
const documentTestPathFull = path.join(__dirname, '..', '..', '..', documentTestPath);
beforeAll(() => {
    // remove the test documents folder if it exists
    if (fs.existsSync(documentTestPathFull)) {
        fs.rmdirSync(documentTestPathFull, { recursive: true });
    }

});




describe('DocumentHolder', () => {
    describe('constructor', () => {
        it('should create a document holder', () => {
            const documentHolder = new DocumentHolder(documentTestPath);
            // the document should be in the right folder

            const result = fs.existsSync(documentTestPathFull);

            expect(fs.existsSync(documentTestPathFull)).toBeTruthy();

        });
    });


    describe('createDocument', () => {
        it('should create a document', () => {
            const sheetTestName = 'test' + 1
            const userName = 'testUser';
            const documentHolder = new DocumentHolder(documentTestPath);
            documentHolder.createDocument('test1', 2, 2, userName);


            expect(documentHolder).toBeDefined();
        });
    });

    describe('getDocument', () => {
        it('should get a document', () => {
            const sheetTestName = 'test' + 2
            const userName = 'testUser';
            const documentHolder = new DocumentHolder(documentTestPath);
            documentHolder.createDocument(sheetTestName, 2, 2, userName);

            documentHolder.requestViewAccess(sheetTestName, 'A1', userName);
            const documentJSON = documentHolder.getDocumentJSON(sheetTestName, 'testUser');
            // unpack the JSON
            const document = JSON.parse(documentJSON);

            expect(document).toBeDefined();
            expect(document.columns).toEqual(2);
            expect(document.rows).toEqual(2);
            expect(document.cells).toBeDefined();
            expect(document.cells["A1"]).toBeDefined();
            expect(document.cells["A1"].formula).toEqual([]);
            expect(document.cells["A1"].value).toEqual(0);
            expect(document.cells["A1"].error).toEqual("#EMPTY!");
        });
    });

    describe('accessing a document', () => {
        describe('Formula Editing', () => {
            it('should add a token to the current formula', () => {
                const sheetTestName = 'test' + 3
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);



                const accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);

                const documentJSON = documentHolder.addToken(sheetTestName, '1', userName,);

                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["A1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be 1
                expect(formula).toEqual(["1"]);
            });

            it('should add a second token to the current formula', () => {
                const sheetTestName = 'test' + 4
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                const accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);
                documentHolder.addToken(sheetTestName, '1', userName);
                const documentJSON = documentHolder.addToken(sheetTestName, '+', userName);

                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["A1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be 1
                expect(formula).toEqual(["1", "+"]);
            });

            it('should not add a cell that references to itself', () => {
                const sheetTestName = 'test' + 5
                const documentHolder = new DocumentHolder(documentTestPath);

                const userName = 'testUser';

                const accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                const documentJSON = documentHolder.addCell(sheetTestName, 'A1', userName);


                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["A1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be 1
                expect(formula).toEqual([]);
            });

            it('should add a cell that references another cell', () => {
                const sheetTestName = 'test' + 6
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);



                const accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);


                const documentJSON = documentHolder.addCell(sheetTestName, 'A2', userName);

                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["A1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be ["A2"] and the error "#REF!"
                expect(formula).toEqual(["A2"]);

                const error = cell.error;
                expect(error).toEqual("#REF!");

            });

            it('should be able to edit A1 and A2', () => {
                const sheetTestName = 'test' + 7
                const documentHolder = new DocumentHolder(documentTestPath);
                const userName = 'testUser';
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);


                documentHolder.addCell(sheetTestName, 'A2', userName);
                accessOK = documentHolder.requestEditAccess(sheetTestName, 'A2', userName);
                const documentJSON = documentHolder.addToken(sheetTestName, '1', userName);

                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cellA1 = document.cells["A1"]
                // get the formula from the cell
                const formula = cellA1.formula;
                // the formula should be ["A2"] and the error "" and the value 1
                expect(formula).toEqual(["A2"]);

                const error = cellA1.error;
                expect(error).toEqual("");

                const value = cellA1.value;
                expect(value).toEqual(1);

                const cellA2 = document.cells["A2"]

                const formulaA2 = cellA2.formula;
                // the formula should be ["1"] and the error "" and the value 1
                expect(formulaA2).toEqual(["1"]);

                const errorA2 = cellA2.error;
                expect(errorA2).toEqual("");

                const valueA2 = cellA2.value;
                expect(valueA2).toEqual(1);
            });


            it('should remove a token from the formula', () => {
                const sheetTestName = 'test' + 8
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);


                const documentJSON = documentHolder.addCell(sheetTestName, 'A2', userName);

                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["A1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be ["A2"] and the error "#REF!"
                expect(formula).toEqual(["A2"]);

                const error = cell.error;
                expect(error).toEqual("#REF!");

                const documentJSON2 = documentHolder.removeToken(sheetTestName, userName);

                // unpack the JSON
                const document2 = JSON.parse(documentJSON2);

                // get the cell A1 from the cells
                const cell2 = document2.cells["A1"]
                // get the formula from the cell
                const formula2 = cell2.formula;
                // the formula should be [] and the error "#EMPTY!"
                expect(formula2).toEqual([]);

                const error2 = cell2.error;
                expect(error2).toEqual("#EMPTY!");

            });

            it('should not add a cell that makes a loop', () => {
                const sheetTestName = 'test' + 9
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);


                documentHolder.addCell(sheetTestName, 'A2', userName);
                accessOK = documentHolder.requestEditAccess(sheetTestName, 'A2', userName);
                documentHolder.addCell(sheetTestName, 'B1', userName);
                accessOK = documentHolder.requestEditAccess(sheetTestName, 'B1', userName);

                const documentJSON = documentHolder.addCell(sheetTestName, 'A1', userName);



                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["B1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be [""] and the error "#EMPTY!"
                expect(formula).toEqual([]);

                const error = cell.error;
                expect(error).toEqual("#EMPTY!");

            });

            it('should clear the formula', () => {
                const sheetTestName = 'test' + 10
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);


                documentHolder.addCell(sheetTestName, 'A2', userName);
                const documentJSON = documentHolder.addToken(sheetTestName, '+', userName);

                // unpack the JSON
                const document = JSON.parse(documentJSON);

                // get the cell A1 from the cells
                const cell = document.cells["A1"]
                // get the formula from the cell
                const formula = cell.formula;
                // the formula should be ["A2"] and the error "#REF!"
                expect(formula).toEqual(["A2", "+"]);

                const documentJSON2 = documentHolder.clearFormula(sheetTestName, userName);

                // unpack the JSON
                const document2 = JSON.parse(documentJSON2);

                // get the cell A1 from the cells
                const cell2 = document2.cells["A1"]
                // get the formula from the cell
                const formula2 = cell2.formula;

                // the formula should be [] and the error "#EMPTY!"
                expect(formula2).toEqual([]);

                const error = cell2.error;
                expect(error).toEqual("#EMPTY!");

            });

            it('should return the FormulaString for the controler', () => {
                const sheetTestName = 'test' + 11
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);

                documentHolder.addToken(sheetTestName, '2', userName);
                documentHolder.addToken(sheetTestName, '+', userName);
                const documentJSON = documentHolder.addToken(sheetTestName, '2', userName);

                const formulaString = documentHolder.getFormulaString(sheetTestName, userName);

                expect(formulaString).toEqual("2 + 2");

                const resultString = documentHolder.getResultString(sheetTestName, userName);

                expect(resultString).toEqual("4");
            });

            it('should return the working cell label when it is set to A2', () => {
                const sheetTestName = 'test' + 12
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);


                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A2', userName);

                documentHolder.addToken(sheetTestName, '2', userName);
                documentHolder.addToken(sheetTestName, '+', userName);
                const documentJSON = documentHolder.addToken(sheetTestName, '2', userName);

                const label = documentHolder.getWorkingCellLabel(sheetTestName, userName);


                expect(label).toEqual("A2");

                const formulaString = documentHolder.getFormulaString(sheetTestName, userName);

                expect(formulaString).toEqual("2 + 2");

                const resultString = documentHolder.getResultString(sheetTestName, userName);

                expect(resultString).toEqual("4");


            });

            it('should return edit status true it is set', () => {
                const sheetTestName = 'test' + 13
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);


                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A2', userName);

                documentHolder.setWorkingCellByLabel(sheetTestName, 'A2');
                documentHolder.addToken(sheetTestName, '2', userName);


                const editStatus = documentHolder.getEditStatus(sheetTestName, userName);

                expect(editStatus).toBeTruthy();

                const editStatusString = documentHolder.getEditStatusString(sheetTestName, userName);

                expect(editStatusString).toEqual("editing: A2");

            });

            it('should return the formula string for the selected cell even if it cannot edit', () => {
                const sheetTestName = 'test' + 14
                const userName = 'testUser';
                const documentHolder = new DocumentHolder(documentTestPath);
                let result = documentHolder.createDocument(sheetTestName, 2, 2, userName);

                const otherUserName = 'otherUser';
                let accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', userName);
                documentHolder.addToken(sheetTestName, '2', userName);
                documentHolder.addToken(sheetTestName, '+', userName);
                documentHolder.addToken(sheetTestName, '2', userName);

                accessOK = documentHolder.requestEditAccess(sheetTestName, 'A1', otherUserName);
                const resultString = documentHolder.getResultString(sheetTestName, otherUserName);
                expect(resultString).toEqual("4");

                documentHolder.addToken(sheetTestName, '+', otherUserName);
                const formulaString = documentHolder.getFormulaString(sheetTestName, otherUserName);
                expect(formulaString).toEqual("2 + 2");


            });
        });
    });

});