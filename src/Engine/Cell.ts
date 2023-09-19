/**
 * Cell class
 * @class Cell
 * @classdesc Cell class
 * @export Cell
 * @module src/Engine/Cell
 * 
 * 
 */
import { ErrorMessages } from "./GlobalDefinitions";
export class Cell {
  // private members

  // the formula for the cell expressed as a string of tokens
  // this is built by the formula builder in response to the user editing the formula
  // in the react app
  private _formula: string[] = [];


  // the value of the cell
  private _value: number = 0;

  // the error message for the cell (if any)
  private _error: string = "";

  // the display string for the cell, it is either the value or an error message
  private _displayString: string = "";

  // the cells that the cell depends on (extracted from the formula)
  private _dependsOn: string[] = [];

  // the label of the cell (A1, B2, etc.)
  private _label: string = "";


  /**
   * constructor
   * @constructor

   * 
   * @returns {void}
   * 
   * */
  constructor(cell?: Cell) {
    if (cell) {
      // copy constructor logic
      this._formula = [...cell._formula];
      this._value = cell._value;
      this._error = cell._error.slice();
      this._displayString = cell._displayString.slice();
      this._dependsOn = [...cell._dependsOn];

    } else {
      // default constructor logic
      this._formula = [];
      this._value = 0;
      this._error = ErrorMessages.emptyFormula;
      this._displayString = "";
      this._dependsOn = [];

    }
  }

  /** 
   * get the formula of the cell
   * @returns {string[]} The formula of the cell
   *  
   * */
  getFormula(): string[] {
    return this._formula;
  }

  /**
   * set the formula of the cell
   * @param {string[]} formula - The formula of the cell
   * @returns {void}
   *  
   * */
  setFormula(formula: string[]): void {
    this._formula = [...formula];
  }

  /**
   * set the error message for the cell
   * @param {string} error - The error message for the cell
   */
  setError(error: string): void {
    this._error = error;
  }

  /**
   * 
   * @returns the error message for the cell
   */
  getError(): string {
    return this._error;
  }


  /**
   * get the value of the cell
   * @returns {number} The value of the cell
   *  
   * */
  getValue(): number {
    return this._value;
  }

  /**
   * set the value of the cell
   * @param {number} value - The value of the cell
   * @returns {void}
   * 
   * */
  setValue(value: number): void {
    this._value = value;
  }

  /**
   * get the display string of the cell
   * @returns {string} The display string of the cell
   *  
   * */
  getDisplayString(): string {
    // successful evaluation has occurred
    if (this._error === "" && this._formula.length > 0) {
      return this._value.toString();
    }

    // Check to see if cell is empty
    if (this._formula.length === 0) {
      return "";
    }

    // unsuccessful evaluation has occurred
    // return the error message
    return this._error;
  }


  /**
   * get the label of the cell
   * @returns {string} The label of the cell
   */
  getLabel(): string {
    return this._label;
  }

  /**
   * set the label of the cell
   * @param {string} label - The label of the cell
   * @returns {void}
   * 
   * */
  setLabel(label: string): void {
    this._label = label;
  }
  // There is no setDisplayString method because the display string is calculated
  // from the value and the error message

  /** 
   * add depends on cell to the dependsOn array
   */
  public addDependsOn(cell: string): void {
    // check to see if the cell is already a dependency
    if (this._dependsOn.indexOf(cell) === -1) {
      this._dependsOn.push(cell);
    }
  }

  /**
   * remove depends on cell from the dependsOn array
   * @param {string} cell - The cell that the cell depends on
   */
  public removeDependsOn(cell: string): void {
    const index = this._dependsOn.indexOf(cell);
    if (index > -1) {
      this._dependsOn.splice(index, 1);
    }
  }

  /**
   * get the cells that the cell depends on
   * @returns {string[]} The cells that the cell depends on
   *  
   * */
  getDependsOn(): string[] {
    return this._dependsOn;
  }

  /**
   * set the cells that the cell depends on
   * @param {string[]} dependsOn - The cells that the cell depends on
   * @returns {void}
   *  
   * */
  setDependsOn(dependsOn: string[]): void {
    this._dependsOn = dependsOn;
  }




  //** static methods. */


  /**
   * check if the cell name is valid
   * @param {string} cell - The cell name
   * @returns {boolean} true if the cell name is valid, false otherwise
   *  
   * */
  public static isValidCellLabel(cell: string): boolean {
    let regex = /^[A-Z][1-9][0-9]?$/;
    return regex.test(cell);
  }

  static convertFromBase26ToBase10(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result *= 26;
      result += column.charCodeAt(i) - 65;
    }
    return result;
  }


  /**
   * 
   * @param column 
   * @returns the column name in base 26 represented with A=0 and Z=25
   */
  public static columnNumberToName(column: number): string {
    /**
  * 65 is the ASCII code for A
  * 26 is the number of letters in the alphabet
  * 
  * we use do while loop to make sure that the loop runs at least once
  */
    let temp = column;
    let result = "";
    do {
      let remainder = temp % 26;
      temp = Math.floor(temp / 26);
      result = String.fromCharCode(remainder + 65) + result;
    } while (temp > 0);
    return result;
  }

  /**
   * 
   * @param row
   * @returns the row name in base 10 represented with 0=0 and 9=9
   * 
   * The labels for the cells are 1 based so we add 1 to the row number
   * 
   */
  public static rowNumberToName(row: number): string {
    return (row + 1).toString();
  }

  /**
   * return the column and row for a cell 
   * @param {string} cell - The cell name
   * @returns {number[]} The column and row for a cell
   * 
   * */
  public static cellToColumnRow(label: string): number[] {
    // Split the label into the column and row
    // The column is the first characters of the label (the letters)
    // The row is the last characters of the label (the numbers)


    const labelREGEX = (/^([A-Z]+)([0-9]+)$/);
    const matches = label.match(labelREGEX);

    if (matches === null) {
      throw new Error("Invalid cell name");
    }
    const column = Cell.convertFromBase26ToBase10(matches[1]);
    const row = parseInt(matches[2]) - 1;

    return [column, row];
  }

  /**
   * return the label for a cell
   * @param {number} column - The column for a cell
   * @param {number} row - The row for a cell
   * @returns {string} The label for a cell
   * 
   */
  public static columnRowToCell(column: number, row: number): string {
    // Convert the column to base 26
    // Convert the row to a string
    // Concatenate the column and row
    // Return the result

    let columnString = Cell.columnNumberToName(column);

    /**
     * the label for the cell starts at row 1, but the memory location is 0
     * so we add 1 to the row
     * an concatanate the row to the result
     */
    let rowString = Cell.rowNumberToName(row);

    let result = columnString + rowString;
    return result;
  }


}

export default Cell;