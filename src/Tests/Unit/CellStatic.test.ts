import Cell from "../../Engine/Cell";

describe("Cell", () => {
  describe("static", () => {
    describe("cellToColumnRow", () => {
      it("should return the column and row", () => {
        const columnRow = Cell.cellToColumnRow("A1");
        expect(columnRow).toEqual([0,0]);
      });
    }
    );

    describe("isvalidCell", () => {
      it("should return true if the cell is valid", () => {
        const valid = Cell.isValidCellLabel("A1");
        expect(valid).toEqual(true);
      });
      it("should return false if the cell is invalid", () => {
        const valid = Cell.isValidCellLabel("A0");
        expect(valid).toEqual(false);
      });
    });

    describe("columnRowToCell", () => {
      it("should return the cell", () => {
        const cell = Cell.columnRowToCell(0, 0);
        expect(cell).toEqual("A1");
      });
    }
    );
  });
});