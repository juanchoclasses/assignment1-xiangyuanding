import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { DocumentTransport, CellTransport } from '../Engine/GlobalDefinitions';


// this will run a bunch of tests against the server.

// the server should be running on theport in PortsGlobal.ts

import * as PortsGlobal from '../PortsGlobal';

const serverPort = PortsGlobal.PortsGlobal.serverPort;

const baseURL = `http://localhost:${serverPort}`;



function cleanFiles() {
    return axios.post(`${baseURL}/documents/reset`)
        .then(response => {
            const result = response.data;
            return result;
        });
}

function getDocuments() {
    return axios.get(`${baseURL}/documents`)
        .then(response => {
            const result = response.data;
            return result;
        });
}

function createDocument(name: string, user: string) {
    // put the user name in the body
    const userName = user;

    return axios.post(`${baseURL}/documents/create/${name}`, { "userName": userName })
        .then(response => {
            const result = response.data;
            return result;
        });
}

function getDocument(name: string) {
    return axios.get(`${baseURL}/documents/${name}`)
        .then(response => {
            const result = response.data;
            return result;
        });
}

function addToken(docName: string, token: string, user: string) {
    // put the user name in the body
    const userName = user;
    return axios.put(`${baseURL}/document/addtoken/${docName}/${token}`, { "userName": userName })
        .then(response => {
            const result = response.data;
            return result;
        });
}

function addCell(docName: string, cell: string, user: string) {
    // put the user name in the body
    const userName = user;
    return axios.put(`${baseURL}/document/addcell/${docName}/${cell}`, { "userName": userName })
        .then(response => {
            const result = response.data;
            return result as DocumentTransport;
        });
}

function requestEditCell(docName: string, cell: string, user: string): Promise<boolean> {
    // put the user name in the body
    const userName = user;
    return axios.put(`${baseURL}/document/cell/edit/${docName}/${cell}`, { "userName": userName })
        .then(response => {
            const result = response.data;
            return result;
        });
}




// this is the main function that runs the tests
async function runTests() {

    cleanFiles();
    // first, create a document
    const testDocument1 = 'xxxtestDocument1';
    const testDocument2 = 'xxxtestDocument2';
    const testDocument3 = 'xxxtestDocument3';

    const user1 = 'juancho';
    const user2 = 'yvonne';
    const user3 = 'jose';


    await createDocument(testDocument1, user1);
    await createDocument(testDocument2, user2);
    await createDocument(testDocument3, user3);

    // first, get the list of documents
    const documents = await getDocuments();
    console.log('documents', documents);

    // ask for a cell in the first document for user1

    const cell1 = 'A1';
    const cell2 = 'B2';

    let resultBoolean = await requestEditCell(testDocument1, cell1, user1);
    if (!resultBoolean) {
        console.log('requestEditCell failed, this should have succeeded');
        return;
    }

    let resultDocument = await addToken(testDocument1, '1', user1);
    let cells = resultDocument.cells;

    let cellA1 = cells[cell1] as CellTransport;
    if (!cellA1) {
        console.log('cellA1 not found, this should have succeeded');
        return;
    }
    if (cellA1.value !== 1) {
        console.log('cellA1 value is not 1, this should have succeeded');
        return;
    }
    if (cellA1.formula.length !== 1) {
        console.log('cellA1 formula length is not 1, this should have succeeded');
        return;
    }
    if (cellA1.formula[0] !== '1') {
        console.log('cellA1 formula is not 1, this should have succeeded');
        return;
    }

    await addToken(testDocument1, '2', user1);
    await addToken(testDocument1, '+', user1);
    await addCell(testDocument1, cell2, user1);

    resultBoolean = await requestEditCell(testDocument1, cell2, user2);
    resultDocument = await addToken(testDocument1, '3', user2) as DocumentTransport;

    cells = resultDocument.cells;
    let cellB2 = cells[cell2] as CellTransport;
    cellA1 = cells[cell1] as CellTransport;

    if (cellA1.value !== 15) {
        console.log('cellA1 value is not 15, this should have succeeded');
        return;
    } else {
        console.log('cellA1 value is 15, this succeeded');
    }

    if (cellB2.value !== 3) {
        console.log('cellB2 value is not 3, this should have succeeded');
        return;
    } else {
        console.log('cellB2 value is 3, this succeeded');
    }

    const testDocument = 'test';

    await requestEditCell(testDocument, 'A1', 'juancho');
    await addToken(testDocument, '+', 'juancho');
    await addToken(testDocument, '1', 'juancho');




}

// call the test runner

runTests();