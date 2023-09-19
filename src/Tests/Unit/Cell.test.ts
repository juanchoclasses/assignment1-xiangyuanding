import { Cell } from "../../Engine/Cell";
import { ErrorMessages } from "../../Engine/GlobalDefinitions";

describe("Cell", () => {
  describe("constructor", () => {
    it("should create an empty cell", () => {
      const cell = new Cell();
      expect(cell.getFormula()).toEqual([]);
      expect(cell.getValue()).toEqual(0);
      expect(cell.getDisplayString()).toEqual("");
      expect(cell.getDependsOn()).toEqual([]);
    });
  }
  );

  describe("copy constructor", () => {
    it("should copy the cell", () => {
      const cell = new Cell();
      cell.setFormula(["1", "+", "2"]);
      cell.setValue(3);
      cell.setError("");
      cell.setDependsOn(["A1"]);
      const cellCopy = new Cell(cell);
      expect(cellCopy.getFormula()).toEqual(["1", "+", "2"]);
      expect(cellCopy.getValue()).toEqual(3);
      expect(cellCopy.getDisplayString()).toEqual("3");
      expect(cellCopy.getDependsOn()).toEqual(["A1"]);
    });
  }
  );

  describe("The cell label", () => {
    it("should be empty", () => {
      const cell = new Cell();
      expect(cell.getLabel()).toEqual("");
    });

    it("should be set", () => {
      const cell = new Cell();
      cell.setLabel("A1");
      expect(cell.getLabel()).toEqual("A1");
    });
  });

  describe("addDependsOn", () => {
    it("adds a dependency to the dependsOn array", () => {
      let cell = new Cell();
      cell.addDependsOn("B2");

      expect(cell.getDependsOn()).toContain("B2");
    });

    it("does not add a duplicate dependency to the dependsOn array", () => {
      let cell = new Cell();
      cell.addDependsOn("B2");
      cell.addDependsOn("B2");

      expect(cell.getDependsOn()).toEqual(["B2"]);
    });
  });

  describe("removeDependsOn", () => {
    it("removes a dependency from the dependsOn array", () => {
      let cell = new Cell();
      cell.addDependsOn("B2");
      cell.removeDependsOn("B2");

      expect(cell.getDependsOn()).toEqual([]);
    });

    it("does not remove a non-existent dependency from the dependsOn array", () => {
      let cell = new Cell();
      cell.addDependsOn("B2");
      cell.removeDependsOn("C3");

      expect(cell.getDependsOn()).toEqual(["B2"]);
    });
  });


  describe("getFormula", () => {
    it("should return the formula", () => {
      const cell = new Cell();
      expect(cell.getFormula()).toEqual([]);
    });
  }
  );

  describe("setFormula", () => {
    it("should set the formula", () => {
      const cell = new Cell();
      const formula = ["1", "+", "2"];
      cell.setFormula(formula);
      expect(cell.getFormula()).toEqual(formula);
    });
  }
  );

  describe("getValue", () => {
    it("should return the value", () => {
      const cell = new Cell();
      expect(cell.getValue()).toEqual(0);
    });
  }
  );

  describe("setValue", () => {
    it("should set the value", () => {
      const cell = new Cell();
      cell.setValue(1);
      expect(cell.getValue()).toEqual(1);
    });
  }
  );

  describe("getDisplayString", () => {
    it("should return the display string", () => {
      const cell = new Cell();
      expect(cell.getDisplayString()).toEqual("");
    });
  }
  );

  describe("setFormula with error", () => {
    it("should set the formula", () => {
      const cell = new Cell();
      const formula = ["1", "("];
      cell.setFormula(formula);
      cell.setError(ErrorMessages.invalidFormula);
      expect(cell.getDisplayString()).toEqual(ErrorMessages.invalidFormula);
    });
  }
  );

  describe("Static Methods", () => {
    describe(" cellToColumnRow should throw an error if the cell is invalid", () => {
      expect(() => Cell.cellToColumnRow("A")).toThrow();
    });
  });

});

