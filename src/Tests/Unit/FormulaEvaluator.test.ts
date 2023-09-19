// Unit tests for Recalc.ts
//
// Path: src/Tests/Unit/Recalc.test.ts
// Compare this snippet from src/Engine/Recalc.ts:
//
// // Recalc.ts
// export class Recalc {
//   private machine: Machine;
//   private errorOccured: boolean = false;

import { FormulaEvaluator } from "../../Engine/FormulaEvaluator";
import SheetMemory from "../../Engine/SheetMemory";
import Cell from "../../Engine/Cell";
import { ErrorMessages } from "../../Engine/GlobalDefinitions";


let testMemory: SheetMemory;
let recalc: FormulaEvaluator;


beforeEach(() => {
  testMemory = new SheetMemory(5, 5);
  recalc = new FormulaEvaluator(testMemory);


  const cellA1 = new Cell();
  cellA1.setFormula(["1"]);
  cellA1.setValue(1);
  cellA1.setError("");
  testMemory.setWorkingCellByCoordinates(0, 0);
  testMemory.setCurrentCell(cellA1);

  const cellA2 = new Cell();
  cellA2.setFormula(["2"]);
  cellA2.setValue(2);
  cellA2.setError("");
  testMemory.setWorkingCellByCoordinates(0, 1);
  testMemory.setCurrentCell(cellA2);

  const cellA3 = new Cell();
  cellA3.setFormula(["3"]);
  cellA3.setValue(3);
  cellA3.setError("");
  testMemory.setWorkingCellByCoordinates(0, 2);
  testMemory.setCurrentCell(cellA3);
});

describe("FormulaEvaluator", () => {
  describe("update", () => {
    describe("when the contains a single number", () => {
      it("returns the number", () => {
        const formula: FormulaType = ["1"];
        const memory = new SheetMemory(5, 5);

        recalc.evaluate(formula)
        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(1);
        expect(error).toEqual("");
      });
    });

    describe("when the formula is ( 8 )", () => {
      it("returns the number", () => {
        const formula: FormulaType = ["(", "8", ")"];
        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(8);
        expect(error).toEqual("");
      });
    });


    describe("when the formula contains two tokens, number, operator", () => {
      it("returns the number", () => {
        const formula: FormulaType = ["1", "+"];

        recalc.evaluate(formula);
        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(1);
        expect(error).toEqual(ErrorMessages.invalidFormula);
      });
    });

    describe("when the formula contains three tokens, number, operator, number", () => {
      describe("when the operator is +", () => {
        it("returns the sum of the numbers", () => {
          const formula: FormulaType = ["1", "+", "2"];
          const memory = new SheetMemory(5, 5);
          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;

          expect(result).toEqual(3);
          expect(error).toEqual("");
        });
      });

      describe("when the operator is -", () => {
        it("returns the difference of the numbers", () => {
          const formula: FormulaType = ["1", "-", "2"];
          const memory = new SheetMemory(5, 5);
          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;

          expect(result).toEqual(3);
          expect(error).toEqual("");
        });
      });



      describe("when the operator is *", () => {
        it("returns the product of the numbers", () => {
          const formula: FormulaType = ["1", "*", "2"];
          const memory = new SheetMemory(5, 5);
          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;

          expect(result).toEqual(3);
          expect(error).toEqual("");
        });
      });


      describe("when the operator is /", () => {
        describe("when the divisor is not zero", () => {
          it("returns the quotient of the numbers", () => {
            const formula: FormulaType = ["1", "/", "2"];

            recalc.evaluate(formula);

            let result = recalc.result;
            let error = recalc.error;

            expect(result).toEqual(0.5);
            expect(error).toEqual("");
          });
        });

        describe("when the divisor is zero", () => {
          it("returns an error", () => {
            const formula: FormulaType = ["1", "/", "0"];

            recalc.evaluate(formula);

            let result = recalc.result;
            let error = recalc.error;

            expect(result).toEqual(Infinity);
            expect(error).toEqual("#DIV/0!");
          });
        });
      });
    });

    describe(" The formula is ( )", () => {
      it("returns a syntax error", () => {
        const formula: FormulaType = ["(", ")"];
        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(0);
        expect(error).toEqual(ErrorMessages.missingParentheses);
      });
    });

    describe("when the formula contains 8 ( ", () => {
      it("returns a syntax error", () => {
        const formula: FormulaType = ["8", "("];
        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;


        expect(result).toEqual(8);
        expect(error).toEqual(ErrorMessages.invalidFormula);
      });
    });

    describe("when the formula contains five tokens, number, operator, number, operator, number", () => {
      describe("when the operators are +, +", () => {
        it("returns the sum of all three numbers", () => {
          const formula: FormulaType = ["1", "+", "2", "+", "3"];

          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;
          expect(result).toEqual(6);
          expect(error).toEqual("");
        });
      });

      describe("when the operators are +, -", () => {
        it("returns the sum of the first two numbers minus the third number", () => {
          const formula: FormulaType = ["1", "+", "2", "-", "3"];
          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;

          expect(result).toEqual(0);
          expect(error).toEqual("");
        });
      });

      describe("when the operators are +, *", () => {
        it("returns the product of the second and third number added to the first number", () => {
          const formula: FormulaType = ["1", "+", "2", "*", "3"];
          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;

          expect(result).toEqual(7);
          expect(error).toEqual("");

        });
      });


      describe("when the operators are +, /", () => {
        it("returns the quotient of the second and third number added to the first number", () => {

          const formula: FormulaType = ["1", "+", "10", "/", "5"];
          recalc.evaluate(formula);

          let result = recalc.result;
          let error = recalc.error;

          expect(result).toEqual(3);
          expect(error).toEqual("");

        });
      });
    });

    describe("when the formula contains four tokens, number, operator, number, operator", () => {
      it("returns the result of the first three tokens", () => {
        const formula: FormulaType = ["1", "+", "2", "+"];
        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(3);
        expect(error).toEqual(ErrorMessages.invalidFormula);
      }
      );
    }
    );
    describe("when the formula A1 + A1", () => {

      it("returns the number", () => {
        const formula = ["A1", "+", "A1"];

        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;
        expect(result).toEqual(2);
        expect(error).toEqual("");
      });
    });

    describe("when the formula A1 + A2", () => {
      it("returns the number", () => {
        const formula = ["A1", "+", "A2"];

        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(3);
        expect(error).toEqual("");

      });
    });

    describe("when the formula A1 + A2 + 50", () => {

      it("returns the number", () => {


        const formula = ["A1", "+", "A2", "+", "50"];

        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(53);
        expect(error).toEqual("");
      });
    });

    describe("when the formula is 1 * ) ", () => {
      it("returns the number", () => {
        const formula = ["1", "+", "+"];

        recalc.evaluate(formula);

        let result = recalc.result;
        let error = recalc.error;

        expect(result).toEqual(1);
        expect(error).toEqual(ErrorMessages.invalidFormula);
      });
    });

  });
});
