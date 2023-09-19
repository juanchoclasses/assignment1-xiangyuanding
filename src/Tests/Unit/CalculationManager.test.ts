/**
 * RecalcDependency.ts
 */
import CalculationManager from "../../Engine/CalculationManager";
import SheetMemory from "../../Engine/SheetMemory";
import Cell from "../../Engine/Cell";
import { get } from "http";
import e from "cors";

let testMemory: SheetMemory;
let calculationManager: CalculationManager;
beforeEach(() => {
  testMemory = new SheetMemory(3, 3);
  calculationManager = new CalculationManager();

  const cellA1 = new Cell();
  cellA1.setFormula(["A2"]);
  cellA1.setValue(1);
  cellA1.setError("");
  cellA1.setDependsOn(["A2"]);

  testMemory.setWorkingCellByCoordinates(0, 0);
  testMemory.setCurrentCell(cellA1);


  const cellA2 = new Cell();
  cellA2.setFormula(["2"]);
  cellA2.setValue(2);
  cellA2.setError("");
  cellA2.setDependsOn([]);
  testMemory.setWorkingCellByCoordinates(0, 1);
  testMemory.setCurrentCell(cellA2);

  const cellA3 = new Cell();
  cellA3.setFormula(["A1"]);
  cellA3.setValue(3);
  cellA3.setError("");
  cellA3.setDependsOn(["A1", "A2"]);
  testMemory.setWorkingCellByCoordinates(0, 2);
  testMemory.setCurrentCell(cellA3);
}
);

describe("RecalcDependency", () => {

  describe("okToAddNewDependency when the same dependency is added  ", () => {
    it("The okToAdd flag should be set to true", () => {
      let testMemory: SheetMemory = new SheetMemory(3, 3);
      let cellA1: Cell = new Cell();
      cellA1.setFormula(["A2"]);
      cellA1.setValue(0);
      cellA1.setError("");
      testMemory.setWorkingCellByCoordinates(0, 0);
      testMemory.setCurrentCell(cellA1);
      calculationManager.updateDependencies(testMemory);
      let okToAdd = calculationManager.okToAddNewDependency("A1", "A2", testMemory);

      expect(okToAdd).toEqual(true);



      let cellA2: Cell = new Cell();
      cellA2.setFormula(["A3"]);
      cellA2.setValue(0);
      cellA2.setError("");
      testMemory.setWorkingCellByCoordinates(0, 1);
      testMemory.setCurrentCell(cellA2);
      calculationManager.updateDependencies(testMemory);
      okToAdd = calculationManager.okToAddNewDependency("A2", "A3", testMemory);

      expect(okToAdd).toEqual(true);


      let cellA3: Cell = new Cell();
      cellA3.setFormula([]);
      cellA3.setValue(0);
      cellA3.setError("");
      testMemory.setWorkingCellByCoordinates(0, 2);
      testMemory.setCurrentCell(cellA3);
      calculationManager.updateDependencies(testMemory);
      okToAdd = calculationManager.okToAddNewDependency("A3", "A1", testMemory);

      expect(okToAdd).toEqual(false);



    });
  });

  describe("WORKING updateComputationOrder", () => {
    it("should update the computationOrder to be in the correct order", () => {

      const computationOrder = calculationManager.updateComputationOrder(testMemory);
      let lastCell = computationOrder[computationOrder.length - 1];
      let penultimateCell = computationOrder[computationOrder.length - 2];

      expect(lastCell).toEqual("A3");
      expect(penultimateCell).toEqual("A1");
    });
  });






  describe("attempting to add a circular dependency", () => {
    it("should return false", () => {
      let testMemory: SheetMemory = new SheetMemory(5, 5);
      let A1Cell = new Cell();
      A1Cell.setFormula(["B1", "+", "C1"]);
      A1Cell.setValue(0);
      A1Cell.setError("");
      testMemory.setWorkingCellByCoordinates(0, 0);
      testMemory.setCurrentCell(A1Cell);

      // B1 is D1 + D2
      let B1Cell = new Cell();
      B1Cell.setFormula(["D1", "+", "D2"]);
      B1Cell.setValue(0);
      B1Cell.setError("");
      testMemory.setWorkingCellByCoordinates(1, 0);
      testMemory.setCurrentCell(B1Cell);

      // C1 is A2 + A3
      let C1Cell = new Cell();
      C1Cell.setFormula(["A2", "+", "A3"]);
      C1Cell.setValue(0);
      C1Cell.setError("");
      testMemory.setWorkingCellByCoordinates(2, 0);
      testMemory.setCurrentCell(C1Cell);

      // now we want to add a circular dependency by adding A1 to D1
      let calculationManager = new CalculationManager();
      calculationManager.updateDependencies(testMemory);

      let okToAdd = calculationManager.okToAddNewDependency("D1", "A1", testMemory);
      expect(okToAdd).toEqual(false);
    });
  });




  describe("FORWARD add a chain A1 depends on A2, A2 depends on B1, B1 depends on B2", () => {
    it("should add the new dependency to the cell", () => {
      let testMemoryInt: SheetMemory = new SheetMemory(2, 2);
      let A1Cell = new Cell();
      A1Cell.setFormula(["A2"]);
      A1Cell.setValue(0);
      A1Cell.setError("");

      testMemoryInt.setWorkingCellByCoordinates(0, 0);
      testMemoryInt.setCurrentCell(A1Cell);
      let okToAdd = calculationManager.okToAddNewDependency("A1", "A2", testMemoryInt);
      expect(okToAdd).toEqual(true);

      let A2Cell = new Cell();
      A2Cell.setFormula(["B1"]);
      A2Cell.setValue(0);
      A2Cell.setError("");


      testMemoryInt.setWorkingCellByCoordinates(0, 1);
      testMemoryInt.setCurrentCell(A2Cell);
      okToAdd = calculationManager.okToAddNewDependency("A2", "B1", testMemoryInt);
      expect(okToAdd).toEqual(true);

      let B1Cell = new Cell();
      B1Cell.setFormula(["B2"]);
      B1Cell.setValue(0);
      B1Cell.setError("");


      testMemoryInt.setWorkingCellByCoordinates(1, 0);
      testMemoryInt.setCurrentCell(B1Cell);
      okToAdd = calculationManager.okToAddNewDependency("B1", "B2", testMemoryInt);
      expect(okToAdd).toEqual(true);

      let B2Cell = new Cell();
      B2Cell.setFormula(["2"]);
      B2Cell.setValue(2);
      B2Cell.setError("");


      calculationManager.updateDependencies(testMemoryInt);

      let resultingA1Cell = testMemoryInt.getCellByLabel("A1");
      let resultingA2Cell = testMemoryInt.getCellByLabel("A2");
      let resultingB1Cell = testMemoryInt.getCellByLabel("B1");

      expect(resultingA1Cell.getDependsOn()).toEqual(["A2"]);
      expect(resultingA2Cell.getDependsOn()).toEqual(["B1"]);
      expect(resultingB1Cell.getDependsOn()).toEqual(["B2"]);

    });
  });
  describe("A 3 by 3 sheet with the first cell being a sum of all the other cells", () => {
    it("should result in a dependsOn array of all the other cells", () => {
      let testMemory: SheetMemory = new SheetMemory(3, 3);
      let cellA1: Cell = new Cell();
      cellA1.setFormula(["A2", "+", "A3", "+", "B1", "+", "B2", "+", "B3", "+", "C1", "+", "C2", "+", "C3"]);
      cellA1.setValue(0);
      cellA1.setError("");
      testMemory.setWorkingCellByCoordinates(0, 0);
      testMemory.setCurrentCell(cellA1);



      calculationManager.updateDependencies(testMemory);
      const A1DependsOn = testMemory.getCellByLabel("A1").getDependsOn();
      let A1DependsOnSet = new Set(A1DependsOn);
      let expectedSet = new Set(["A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]);
      expect(A1DependsOnSet).toEqual(expectedSet);
    });
  });

  describe("A 3 by 3 sheet with all the cells (exept for the first one) to contain the formula A1", () => {
    it("should result in each other cell having A1 in their dependsOn array", () => {
      let testMemory: SheetMemory = new SheetMemory(3, 3);
      let cellA1: Cell = new Cell();
      cellA1.setFormula([]);
      cellA1.setValue(0);
      cellA1.setError("");
      testMemory.setWorkingCellByCoordinates(0, 0);
      testMemory.setCurrentCell(cellA1);

      let cellOther: Cell = new Cell();
      cellOther.setFormula(["A1"]);
      cellOther.setValue(0);
      cellOther.setError("");

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === 0 && j === 0) {
            continue;
          }
          testMemory.setWorkingCellByCoordinates(i, j);
          testMemory.setCurrentCell(cellOther);
        }
      }
      calculationManager.updateDependencies(testMemory);

      const A1DependsOn = testMemory.getCellByLabel("A1").getDependsOn();
      expect(A1DependsOn).toEqual([]);

      const A2DependsOn = testMemory.getCellByLabel("A2").getDependsOn();
      expect(A2DependsOn).toEqual(["A1"]);

      const A3DependsOn = testMemory.getCellByLabel("A3").getDependsOn();
      expect(A3DependsOn).toEqual(["A1"]);

      const B1DependsOn = testMemory.getCellByLabel("B1").getDependsOn();
      expect(B1DependsOn).toEqual(["A1"]);

      const B2DependsOn = testMemory.getCellByLabel("B2").getDependsOn();
      expect(B2DependsOn).toEqual(["A1"]);

      const B3DependsOn = testMemory.getCellByLabel("B3").getDependsOn();
      expect(B3DependsOn).toEqual(["A1"]);

      const C1DependsOn = testMemory.getCellByLabel("C1").getDependsOn();
      expect(C1DependsOn).toEqual(["A1"]);

      const C2DependsOn = testMemory.getCellByLabel("C2").getDependsOn();
      expect(C2DependsOn).toEqual(["A1"]);

      const C3DependsOn = testMemory.getCellByLabel("C3").getDependsOn();
      expect(C3DependsOn).toEqual(["A1"]);

    });

    describe("A 3 by 3 sheet with all of the cells being in a chain in reverse order", () => {
      let testMemory: SheetMemory = new SheetMemory(3, 3);
      calculationManager = new CalculationManager();
      let cellC3: Cell = new Cell();
      cellC3.setFormula(["C2", "+", "1"]);
      testMemory.setWorkingCellByLabel("C3");
      testMemory.setCurrentCell(cellC3);

      let cellC2: Cell = new Cell();
      cellC2.setFormula(["C1", "+", "1"]);
      testMemory.setWorkingCellByLabel("C2");
      testMemory.setCurrentCell(cellC2);

      let cellC1: Cell = new Cell();
      cellC1.setFormula(["B3", "+", "1"]);
      testMemory.setWorkingCellByLabel("C1");
      testMemory.setCurrentCell(cellC1);


      let cellB3: Cell = new Cell();
      cellB3.setFormula(["B2", "+", "1"]);
      testMemory.setWorkingCellByLabel("B3");
      testMemory.setCurrentCell(cellB3);

      let cellB2: Cell = new Cell();
      cellB2.setFormula(["B1", "+", "1"]);
      testMemory.setWorkingCellByLabel("B2");
      testMemory.setCurrentCell(cellB2);

      let cellB1: Cell = new Cell();
      cellB1.setFormula(["A3", "+", "1"]);
      testMemory.setWorkingCellByLabel("B1");
      testMemory.setCurrentCell(cellB1);

      let cellA3: Cell = new Cell();
      cellA3.setFormula(["A2", "+", "1"]);
      testMemory.setWorkingCellByLabel("A3");
      testMemory.setCurrentCell(cellA3);

      let cellA2: Cell = new Cell();
      cellA2.setFormula(["A1", "+", "1"]);
      testMemory.setWorkingCellByLabel("A2");
      testMemory.setCurrentCell(cellA2);

      let cellA1: Cell = new Cell();
      cellA1.setFormula(["45"]);
      testMemory.setWorkingCellByLabel("A1");
      testMemory.setCurrentCell(cellA1);

      calculationManager.updateDependencies(testMemory);
      calculationManager.updateComputationOrder(testMemory);

      let C3DependsOn = new Set(testMemory.getCellByLabel("C3").getDependsOn());
      let expectedSet = new Set(["C2"]);
      expect(C3DependsOn).toEqual(expectedSet);

      let C2DependsOn = new Set(testMemory.getCellByLabel("C2").getDependsOn());
      expectedSet = new Set(["C1"]);
      expect(C2DependsOn).toEqual(expectedSet);

      let C1DependsOn = new Set(testMemory.getCellByLabel("C1").getDependsOn());
      expectedSet = new Set(["B3"]);
      expect(C1DependsOn).toEqual(expectedSet);

      let B3DependsOn = new Set(testMemory.getCellByLabel("B3").getDependsOn());
      expectedSet = new Set(["B2"]);
      expect(B3DependsOn).toEqual(expectedSet);

      let B2DependsOn = new Set(testMemory.getCellByLabel("B2").getDependsOn());
      expectedSet = new Set(["B1"]);
      expect(B2DependsOn).toEqual(expectedSet);

      let B1DependsOn = new Set(testMemory.getCellByLabel("B1").getDependsOn());
      expectedSet = new Set(["A3"]);
      expect(B1DependsOn).toEqual(expectedSet);

      let A3DependsOn = new Set(testMemory.getCellByLabel("A3").getDependsOn());
      expectedSet = new Set(["A2"]);
      expect(A3DependsOn).toEqual(expectedSet);

      let A2DependsOn = new Set(testMemory.getCellByLabel("A2").getDependsOn());
      expectedSet = new Set(["A1"]);
      expect(A2DependsOn).toEqual(expectedSet);



      let expectedComputation = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];
      let actualComputation = calculationManager.updateComputationOrder(testMemory);
      expect(actualComputation).toEqual(expectedComputation);

    });


  });


});

