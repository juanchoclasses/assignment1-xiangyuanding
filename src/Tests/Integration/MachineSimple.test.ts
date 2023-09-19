import SpreadSheetController from "../../Engine/SpreadSheetController";

import { ErrorMessages } from "../../Engine/GlobalDefinitions";

/**
 * The main object of the SpreadSheet
 * 
 * The exported methods are
 * 
 * addToken(token:string):  void
 *   This relies on the TokenProcessor class
 * 
 * getFormulaString(void): string
 *   This relies on the TokenProcessor class
 * 
 * getResultString(void): string
 *    This relies on the Recalc class
 * 
 * 
 */

describe("SpreadSheetController", () => {
  describe("accessControl", () => {
    it("should true if the user asks for access to a cell in the empty sheet", () => {
      const machine = new SpreadSheetController(5, 5);
      const result = machine.requestEditAccess("user1", "A1");
      expect(result).toEqual(true);
    });

    it("should false if the user asks for access to a cell that another user owns", () => {
      const machine = new SpreadSheetController(5, 5);
      const result = machine.requestEditAccess("user1", "A1");
      const result2 = machine.requestEditAccess("user2", "A1");
      expect(result2).toEqual(false);
    });

    it("should return true if the user has released access and another user asks for access", () => {
      const machine = new SpreadSheetController(5, 5);
      const result = machine.requestEditAccess("user1", "A1");
      const result2 = machine.releaseEditAccess("user1");
      const result3 = machine.requestEditAccess("user2", "A1");
      expect(result3).toEqual(true);
    });
  });

  describe("editing the sheet", () => {
    it("should return two formulas for two users editing a sheet", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addToken("7", "user1");

      machine.requestEditAccess("user2", "A2");
      machine.addToken("2", "user2");
      machine.addToken("+", "user2");
      machine.addToken("2", "user2");
      machine.addToken(".", "user2");
      machine.addToken("5", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");

      expect(machine.getFormulaStringForUser("user1")).toEqual("1 + 7");
      expect(machine.getFormulaStringForUser("user2")).toEqual("2 + 2.5");

    });

    it("should ignore requests to update cell from non user", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addToken("7", "user1");

      machine.requestEditAccess("user2", "A1");
      machine.addToken("2", "user2");
      machine.addToken("+", "user2");
      machine.addToken("2", "user2");
      machine.addToken(".", "user2");
      machine.addToken("5", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");
      const user2Formula = machine.getFormulaStringForUser("user2");

      expect(machine.getFormulaStringForUser("user1")).toEqual("1 + 7");
      expect(machine.getFormulaStringForUser("user2")).toEqual("1 + 7");

    });

    it("should add a cell to the user formula", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addToken("7", "user1");

      machine.requestEditAccess("user2", "A2");
      machine.addCell("A1", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");
      const user2Formula = machine.getFormulaStringForUser("user2");
      const user1Result = machine.getResultStringForUser("user1");
      const user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + 7");
      expect(user2Formula).toEqual("A1");
      expect(user1Result).toEqual("8");
      expect(user2Result).toEqual("8");
    });

    it("should not add a cell that could produce a circular reference", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addCell("A2", "user1");

      machine.requestEditAccess("user2", "A2");
      machine.addToken("1", "user2");
      machine.addToken("+", "user2");
      machine.addCell("A1", "user2");

      const user1Formula = machine.getFormulaStringForUser("user1");
      const user2Formula = machine.getFormulaStringForUser("user2");
      const user1Result = machine.getResultStringForUser("user1");
      const user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + A2");
      expect(user2Formula).toEqual("1 +");
      expect(user1Result).toEqual("#ERR");
      expect(user2Result).toEqual("#ERR");
    });

    it("should not add a cell after the offending cell is removed.", () => {
      const machine = new SpreadSheetController(5, 5);
      machine.requestEditAccess("user1", "A1");
      machine.addToken("1", "user1");
      machine.addToken("+", "user1");
      machine.addCell("A2", "user1");

      machine.requestEditAccess("user2", "A2");
      machine.addToken("1", "user2");
      machine.addToken("+", "user2");
      machine.addCell("A1", "user2");

      let user1Formula = machine.getFormulaStringForUser("user1");
      let user2Formula = machine.getFormulaStringForUser("user2");
      let user1Result = machine.getResultStringForUser("user1");
      let user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + A2");
      expect(user2Formula).toEqual("1 +");
      expect(user1Result).toEqual("#ERR");
      expect(user2Result).toEqual("#ERR");

      machine.removeToken("user1");
      machine.addCell("B3", "user1");
      machine.requestEditAccess("user1", "B3");
      machine.addToken("1", "user1");
      machine.addToken("7", "user1");

      machine.addCell("A1", "user2");
      machine.requestEditAccess("user1", "A1");
      user1Formula = machine.getFormulaStringForUser("user1");
      user2Formula = machine.getFormulaStringForUser("user2");
      user1Result = machine.getResultStringForUser("user1");
      user2Result = machine.getResultStringForUser("user2");
      expect(user1Formula).toEqual("1 + B3");
      expect(user2Formula).toEqual("1 + A1");
      expect(user1Result).toEqual("18");
      expect(user2Result).toEqual("19");


    });
  });
});

// describe("Machine", () => {
//   describe("addToken", () => {

//     describe("when the formula is empty", () => {
//       it("should add the token to the formula", () => {
//         const machine = new SpreadSheetController(5, 5);

//         machine.addToken("1");

//         expect(machine.getFormulaString()).toEqual("1");
//         expect(machine.getResultString()).toEqual("1");
//       });
//     });

//     describe("when A1 refers to A2 and A2 refers to A3", () => {
//       it("should return #REF! for A1", () => {
//         const machine = new SpreadSheetController(5, 5);
//         machine.setWorkingCellByLabel("A1");
//         machine.addCell("A2");
//         machine.setWorkingCellByLabel("A2");
//         machine.addCell("A3");
//         machine.setWorkingCellByLabel("A3");
//         machine.setWorkingCellByLabel("A1");

//         expect(machine.getFormulaString()).toEqual("A2");
//         expect(machine.getResultString()).toEqual(ErrorMessages.invalidCell);
//       });
//     });

//     describe("when the formula is not empty", () => {
//       it("should add the token to the formula", () => {
//         const machine = new SpreadSheetController(5, 5);
//         machine.addToken("1");
//         machine.addToken("+");
//         machine.addToken("2");
//         expect(machine.getFormulaString()).toEqual("1 + 2");
//         expect(machine.getResultString()).toEqual("3");
//       });
//     });

//     describe("When the value in A1 is set to B2", () => {
//       describe("and the value of B2 is undefined", () => {
//         it("the value of the display string of A1 should be #REF!", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A1");
//           machine.addCell("B2");
//           expect(machine.getFormulaString()).toEqual("B2");
//           expect(machine.getResultString()).toEqual(ErrorMessages.invalidCell);
//         });
//       });

//       describe("If A1 has the formula B1 + B2 and B1 is undefined and B2 is defined", () => {
//         it("the value of the display string of A1 should be #REF!", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A1");
//           machine.addCell("B1");
//           machine.addToken("+");
//           machine.addCell("B2");
//           machine.setWorkingCellByLabel("B2");
//           machine.addToken("1");
//           machine.setWorkingCellByLabel("A1");
//           expect(machine.getFormulaString()).toEqual("B1 + B2");
//           expect(machine.getResultString()).toEqual(ErrorMessages.invalidCell);
//         });
//       });

//       describe("it can have a forumula A2 + A2", () => {
//         it("The value of the formula should be A2 +A2", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A1");
//           machine.addCell("A2");
//           machine.addToken("+");
//           machine.addCell("A2");
//           expect(machine.getFormulaString()).toEqual("A2 + A2");
//           expect(machine.getResultString()).toEqual(ErrorMessages.invalidCell);
//           machine.setWorkingCellByLabel("A2");
//           machine.addToken("1");
//           expect(machine.getFormulaString()).toEqual("1");
//           expect(machine.getResultString()).toEqual("1");
//           machine.setWorkingCellByLabel("A1");
//           expect(machine.getFormulaString()).toEqual("A2 + A2");
//           expect(machine.getResultString()).toEqual("2");

//         });
//       });

//       describe("and the value of A2 is defined", () => {
//         it("the value of the display string of A1 should be the value of A2", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A1");
//           machine.addCell("A2");
//           machine.setWorkingCellByLabel("A2");
//           machine.addToken("1");
//           machine.setWorkingCellByLabel("A1");
//           expect(machine.getFormulaString()).toEqual("A2");
//           expect(machine.getResultString()).toEqual("1");
//         });
//       });

//       describe("when the sheet is empty and the current cell is A1", () => {
//         it("attempting to add A1 to the formula should result in an empty formula", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A1");
//           machine.addCell("A1");
//           expect(machine.getFormulaString()).toEqual("");
//           expect(machine.getResultString()).toEqual("");
//         });
//       });

//       describe("and the value of B2 is definedt then", () => {
//         it("the value of the display string of 2 should be the value of B2", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A1");
//           machine.addCell("B2");
//           machine.setWorkingCellByLabel("B2");
//           machine.addToken("1");


//           expect(machine.getFormulaString()).toEqual("1");
//           expect(machine.getResultString()).toEqual("1");
//         });
//       });
//     });

//     /**
//      * test the updateCurrentFormula method
//      */


//     describe("When the updateCurrentFormula method is used to set the current cell to B2", () => {
//       describe("and a token 1 is added to the machine", () => {
//         it("the value of the display string of B2 should be 1", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("A2");
//           machine.addToken("1");
//           expect(machine.getFormulaString()).toEqual("1");
//           expect(machine.getResultString()).toEqual("1");
//           let sheetValues: Array<Array<string>> = machine.getSheetDisplayStringsForGUI();
//           expect(sheetValues[1][0]).toEqual("1");
//         });
//       });
//     });




//     describe("when the currentCellCoordinates change", () => {
//       describe("And you then change the coordinates back", () => {
//         it("should result in the same formula being in the tokenProcessor", () => {
//           const machine = new SpreadSheetController(5, 5);
//           machine.setWorkingCellByLabel("B1");
//           machine.addToken("1");
//           machine.addToken("+");
//           machine.addToken("2");

//           machine.setWorkingCellByLabel("A1");
//           machine.addToken("1");
//           machine.addToken("2");
//           machine.setWorkingCellByLabel("B1");

//           expect(machine.getFormulaString()).toEqual("1 + 2");

//           machine.setWorkingCellByLabel("A1");
//           expect(machine.getFormulaString()).toEqual("12");

//         });
//       });
//     });


//     describe("when the formula references another cell", () => {
//       it("should return the value of the other cell", () => {
//         const machine = new SpreadSheetController(5, 5);

//         machine.setWorkingCellByLabel("B1");
//         machine.addToken("22");
//         expect(machine.getFormulaString()).toEqual("22");

//         machine.setWorkingCellByLabel("A1");
//         machine.addToken("B1");

//         expect(machine.getFormulaString()).toEqual("B1");
//         expect(machine.getResultString()).toEqual("22");
//       });
//     });

//     describe("when the token B3 is entered and the current cell is A1 and B3 is empty", () => {
//       it("should return an 0 string", () => {
//         const machine = new SpreadSheetController(5, 5);

//         machine.setWorkingCellByLabel("A1");
//         machine.addToken("B3");
//         expect(machine.getFormulaString()).toEqual("B3");
//         expect(machine.getResultString()).toEqual(ErrorMessages.invalidCell);
//       });
//     });

//     // Simulate a set of entries into the spreadsheet.
//     // A1 = 1
//     // B1 = A1 + 1
//     // C1 = B1 + 1
//     // D1 = C1 + 1

//     describe("when the formula references another cell long formula", () => {
//       it("should return the value of the other cell", () => {
//         const machine = new SpreadSheetController(5, 5);

//         machine.setWorkingCellByLabel("A1");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("B1");
//         machine.addToken("A1");
//         machine.addToken("+");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("C1");
//         machine.addToken("B1");
//         machine.addToken("+");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("D1");
//         machine.addToken("C1");
//         machine.addToken("+");
//         machine.addToken("1");

//         expect(machine.getFormulaString()).toEqual("C1 + 1");
//         expect(machine.getResultString()).toEqual("4");
//       });
//     });
//   });

//   describe("getSheetDisplayStringsForGUI when the original sheet is 2 columns and 4 rows", () => {
//     it("should return the sheet display strings as an arrya of 4 rows and two columns", () => {
//       const machine = new SpreadSheetController(2, 4);
//       let sheetValues: Array<Array<string>> = machine.getSheetDisplayStringsForGUI();
//       expect(sheetValues.length).toEqual(4);
//       expect(sheetValues[0].length).toEqual(2);
//     });

//   });

//   describe("Controller gets JSON and can update sheet from JSON", () => {
//     describe("It should get the string for the sheet", () => {
//       it("should return the sheet as a JSON string", () => {
//         const machine = new SpreadSheetController(2, 2);

//         machine.setWorkingCellByLabel("A1");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("B1");
//         machine.addToken("A1");
//         machine.addToken("+");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("A2");
//         machine.addToken("B1");
//         machine.addToken("+");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("B2");
//         machine.addToken("A2");
//         machine.addToken("+");
//         machine.addToken("1");

//         const sheetJSON: string = machine.sheetToJSON();
//         const expectJSON = '{"columns":2,"rows":2,"cells":{"A1":{"formula":["1"],"value":1,"error":""},"A2":{"formula":["B1","+","1"],"value":3,"error":""},"B1":{"formula":["A1","+","1"],"value":2,"error":""},"B2":{"formula":["A2","+","1"],"value":4,"error":""}}}'

//         expect(expectJSON).toEqual(sheetJSON);

//       });
//     });

//     it("It should create a new spreadsheet from a json string", () => {
//       const expectJSON = '{"columns":2,"rows":2,"cells":{"A1":{"formula":["1"],"value":1,"error":""},"A2":{"formula":["B1","+","1"],"value":3,"error":""},"B1":{"formula":["A1","+","1"],"value":2,"error":""},"B2":{"formula":["A2","+","1"],"value":4,"error":""}}}'
//       const controller = SpreadSheetController.spreadsheetFromJSON(expectJSON);

//       controller.setWorkingCellByLabel("B2");
//       expect(controller.getFormulaString()).toEqual("A2 + 1");
//       expect(controller.getResultString()).toEqual("4");
//     });


//     describe("It should update the sheet from a JSON string", () => {
//       it("should update the sheet from a JSON string", () => {
//         const machine = new SpreadSheetController(2, 2);

//         machine.setWorkingCellByLabel("A1");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("B1");
//         machine.addToken("A1");
//         machine.addToken("+");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("A2");
//         machine.addToken("B1");
//         machine.addToken("+");
//         machine.addToken("1");

//         machine.setWorkingCellByLabel("B2");
//         machine.addToken("A2");
//         machine.addToken("+");
//         machine.addToken("1");


//         // now make a new machine and update it from the JSON string
//         // the result should be the same
//         const sheetJSON: string = machine.sheetToJSON();

//         const machine2 = new SpreadSheetController(2, 2);
//         machine2.updateSheetFromJSON(sheetJSON);

//         machine2.setWorkingCellByLabel("B2");
//         expect(machine2.getFormulaString()).toEqual("A2 + 1");
//         expect(machine2.getResultString()).toEqual("4");

//       });
//     });
//   });

// });



