/**
 *  This is the CalculationManager class
 * it is responsible for managing the calculation of the cells in the sheet
 * 
 * it exports the following functions
 * okToAddNewDependency(currentCellLabel: string, newDependsOnCell: string, sheetMemory: SheetMemory): boolean
 * updateDependencies(sheetMemory: SheetMemory): void
 * updateComputationOrder(sheetMemory: SheetMemory): string[]
 * 
 */

import SheetMemory from "./SheetMemory";
import Cell from "./Cell";
import FormulaBuilder from "./FormulaBuilder";
import FormulaEvaluator from "./FormulaEvaluator";



export default class CalculationManager {



    // Update the dependency graph of the sheet
    // get the computation order
    // compute the cells in the computation order
    // update the cells in the sheet memory
    public evaluateSheet(sheetMemory: SheetMemory): void {
        // update the dependencies in the sheet
        this.updateDependencies(sheetMemory);

        // compute the computation order for the sheet.
        let computationOrder = this.updateComputationOrder(sheetMemory);

        // create a new FormulaEvaluator
        let calculator = new FormulaEvaluator(sheetMemory);

        // compute the cells in the computation order
        for (let cellLabel of computationOrder) {
            let currentCell = sheetMemory.getCellByLabel(cellLabel);
            let formula = currentCell.getFormula();

            calculator.evaluate(formula);

            let value = calculator.result
            let error = calculator.error;

            // update the cell in the sheet memory
            currentCell.setError(error);
            currentCell.setValue(value);
            sheetMemory.setCellByLabel(cellLabel, currentCell);
        }
    }



    /**
     *  checck to see if it is ok to add a cell to the formula in the current cell.
     * 
     * @param {string} currentCellLabel - The label of the cell
     * @param {sheetMemory} SheetMemory - The sheet memory
     * 
     * 
     * This assumes that there is no circular dependency in the current sheet and thus if 
     * when we expand the depends on list then we will not find a circular dependency
     * if we do find a circular dependency then we return false.
     * */
    public okToAddNewDependency(currentCellLabel: string, newDependsOnCell: string, sheetMemory: SheetMemory): boolean {
        // get the current cell
        let currentCell = sheetMemory.getCellByLabel(currentCellLabel);
        console.log("currentCell", currentCellLabel)
        console.log("newDependsOnCell", newDependsOnCell)

        // the dependsOn list for the current cell is up to because we update it everyt time we render
        const dependsOn: string[] = currentCell.getDependsOn();
        const testDependsOn: string[] = [...dependsOn];

        testDependsOn.push(newDependsOnCell);

        // We could have a formula that looks like A1 + A1 so we have already
        // checked for a dependency for this cell and we are done
        if (dependsOn.includes(newDependsOnCell)) {
            return true;
        }

        function checkForIfCircular(cellLabel: string, dependsOn: string[]): boolean {
            if (dependsOn.includes(cellLabel)) {
                return true;
            }

            for (let i = 0; i < dependsOn.length; i++) {
                let currentDependency = dependsOn[i];
                let currentCell = sheetMemory.getCellByLabel(currentDependency);
                let currentCellDependsOn = currentCell.getDependsOn();
                if (checkForIfCircular(cellLabel, currentCellDependsOn)) {
                    return true;
                }
            }

            return false;
        }

        // now we check to see if the new dependency introduces a circular dependency
        for (let i = 0; i < testDependsOn.length; i++) {
            let currentDependency = testDependsOn[i];
            let currentCell = sheetMemory.getCellByLabel(currentDependency);
            let currentCellDependsOn = currentCell.getDependsOn();
            if (checkForIfCircular(currentCellLabel, currentCellDependsOn)) {
                return false;
            }
        }
        return true;
    }



    /**
     * update the dependencies for all cells in the sheet
     * @param {sheetMemory} SheetMemory - The sheet memory
     * @returns {void}
     * 
     * This function will update the dependencies for all cells in the sheet
     * there are no circular dependencies in the sheet so  we just need to 
     * */
    public updateDependencies(sheetMemory: SheetMemory) {
        for (let column = 0; column < sheetMemory.getNumColumns(); column++) {
            for (let row = 0; row < sheetMemory.getNumRows(); row++) {
                const cellLabel = Cell.columnRowToCell(column, row);

                let currentCell = sheetMemory.getCellByLabel(cellLabel);
                let currentFormula = currentCell.getFormula();

                // always read the top dependencies from the formula
                let currentDependsOn = FormulaBuilder.getCellReferences(currentFormula);
                currentCell.setDependsOn(currentDependsOn);

                // update the cell in the sheet memory
                sheetMemory.setCellByLabel(cellLabel, currentCell);
            }
        }
    }


    /**
     * get the computation order for the sheet
     * @param {sheetMemory} SheetMemory - The sheet memory
     * @returns {string[]} - The computation order
     * 
     * We partition the cells into two sets, the independent cells and the dependent cells
     * 
     * the independent cells are the cells that do not depend on any other cells
     * 
     * we populate the computation order with the independent cells
     * then we use topological sort to add the dependent cells to the computation order
     * 
     * */
    public updateComputationOrder(sheetMemory: SheetMemory): string[] {
        let resultingComputationOrder: string[] = [];
        let independentCells: string[] = [];
        let cellsToBeProcessed: string[] = [];


        // first split the cells into independent and dependent cells (cellsToBeProcessed)
        for (let column = 0; column < sheetMemory.getNumColumns(); column++) {
            for (let row = 0; row < sheetMemory.getNumRows(); row++) {
                let currentLabel = Cell.columnRowToCell(column, row);
                const currentCell = sheetMemory.getCellByLabel(currentLabel);

                if (currentCell.getDependsOn().length === 0) {
                    independentCells.push(currentLabel);
                }
                else {
                    cellsToBeProcessed.push(currentLabel);
                }
            }
        }

        // now add the independent cells to the computation order
        resultingComputationOrder = [...independentCells];

        function visit(cell: string): void {
            let currentCell = sheetMemory.getCellByLabel(cell);
            let currentCellDependsOn = currentCell.getDependsOn();

            for (let i = 0; i < currentCellDependsOn.length; i++) {
                let currentDependency = currentCellDependsOn[i];
                if (cellsToBeProcessed.indexOf(currentDependency) !== -1) {
                    visit(currentDependency);
                }
            }

            // add the cell to the resultingComputationOrder
            if (resultingComputationOrder.indexOf(cell) === -1) {
                resultingComputationOrder.push(cell);
            }
        }

        for (let i = 0; i < cellsToBeProcessed.length; i++) {
            let currentCell = cellsToBeProcessed[i];
            visit(currentCell);
        }
        return resultingComputationOrder;
    }


}




