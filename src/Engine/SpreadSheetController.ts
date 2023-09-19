import SheetMemory from "./SheetMemory"
import FormulaEvaluator from "./FormulaEvaluator"
import CalculationManager from "./CalculationManager"
import FormulaBuilder from "./FormulaBuilder";
import Cell from "./Cell";
import { ContributingUser } from "./ContributingUser";

/**
 *  The main controller of the SpreadSheet
 * 
 * functions exported are
 * 
 * addToken(token:string):  void
 * addCell(cell:string): void
 * removeToken(): void
 * clearFormula(): void
 * getFormulaString(): string
 * getResultString(): string
 * setWorkingCellByLabel(label:string): void
 * getWorkingCellLabel(): string
 * setWorkingCellByCoordinates(column:number, row:number): void
 * getSheetDisplayStringsForGUI(): string[][]
 * getEditStatus(): boolean
 * setEditStatus(bool:boolean): void
 * getEditStatusString(): string
 * 
 * 
 *
 */
export class SpreadSheetController {
  /** The memory for the sheet */
  private _memory: SheetMemory;

  /** the local storage for the document */


  /** The current cell */
  private _currentWorkingRow = 0;
  private _currentWorkingColumn = 0;

  /** the users who are editing this sheet */

  private _contributingUsers: Map<string, ContributingUser> = new Map<string, ContributingUser>();
  private _cellsBeingEdited: Map<string, string> = new Map<string, string>();


  /**
   * The components that the SpreadSheetEngine uses to manage the sheet
   * 
   */

  // The formula evaluator, this is used to evaluate the formula for the current cell
  // it is only called for a cell when all cells it depends on have been evaluated
  private _formulaEvaluator: FormulaEvaluator;

  // The formula builder, this is used to build the formula for the current cell
  // it is used when the user is editing the formula for the current cell
  private _formulaBuilder: FormulaBuilder;

  // The current cell is being edited
  private _cellIsBeingEdited: boolean;;

  // The dependency manager, this is used to manage the dependencies between cells
  // The main job of this is to compute the order in which the cells should be evaluated
  private _calculationManager: CalculationManager;

  /**
   * constructor
   * */
  constructor(columns: number, rows: number) {
    this._memory = new SheetMemory(columns, rows);
    this._formulaEvaluator = new FormulaEvaluator(this._memory);
    this._calculationManager = new CalculationManager();
    this._formulaBuilder = new FormulaBuilder();
    this._cellIsBeingEdited = false;
  }

  requestViewAccess(user: string, cellLabel: string) {
    // if the user is not in the list of users then we will add them with an unasigned cell
    let userData: ContributingUser;
    // if it does not exist them make and give view access
    if (!this._contributingUsers.has(user)) {
      let userData = new ContributingUser(cellLabel)
      userData.isEditing = false;
      this._contributingUsers.set(user, userData);
      userData.formulaBuilder.setFormula(this._memory.getCellByLabel(cellLabel).getFormula());
      return;
    }

    // Get the user since we know the user is there.
    userData = this._contributingUsers.get(user)!;
    if (!userData) {
      throw new Error("user not found");
    }
    // if the user is editing/viewing this cell then there is nothing to do
    let currentCellLabel = this._contributingUsers.get(user)?.cellLabel;
    if (currentCellLabel === cellLabel) {
      userData.isEditing = false;
      // if this cell was being edited by the user then free it up
      if (this._cellsBeingEdited.has(cellLabel)) {
        this._cellsBeingEdited.delete(cellLabel);
      }
      // clean up the cell being edited
      return;
    }

    // if the user is editing a cell then free that one up
    if (userData.cellLabel !== '') {
      if (this._cellsBeingEdited.has(userData.cellLabel)) {
        this._cellsBeingEdited.delete(userData.cellLabel);
      }
    }
    // set the cell that the user is viewing
    userData.cellLabel = cellLabel;
    userData.formulaBuilder.setFormula(this._memory.getCellByLabel(cellLabel).getFormula());

    // update the user data 
    this._contributingUsers.set(user, userData);

  }



  requestEditAccess(user: string, cellLabel: string): boolean {
    // if the user is not an editor then we will first add them as a viewer
    // this will release previous cell that they were editing
    let userData = this._contributingUsers.get(user);

    if (userData?.cellLabel !== cellLabel) {
      this.requestViewAccess(user, cellLabel);
    }

    // if the cell is being edited by the user then return true
    if (this._cellsBeingEdited.has(cellLabel) && this._cellsBeingEdited.get(cellLabel) === user) {
      return true;
    }

    // if the cell is being edited by another user return false
    const userEditingThisCell = this._cellsBeingEdited.get(cellLabel);
    if (userEditingThisCell && userEditingThisCell !== user) {
      return false;
    }


    if (this._cellsBeingEdited.has(cellLabel) && this._cellsBeingEdited.get(cellLabel) !== user) {
      return false;
    }

    // if the user is editing another cell then free that one up
    if (this._contributingUsers.has(user)) {
      const userData = this._contributingUsers.get(user);
      if (!userData) {
        throw new Error("user not found");
      }

      if (userData.cellLabel !== '' && userData.cellLabel !== cellLabel) {
        this._cellsBeingEdited.delete(userData.cellLabel);
      }
    }

    // now we know we can assign the ownership of the cell to the user
    this._cellsBeingEdited.set(cellLabel, user);
    const userEditing = this._contributingUsers.get(user);

    // lets make sure the user can edit the cell and the formulaBUilder is up to date
    if (userEditing) {

      userEditing.isEditing = true;
    } else {
      throw new Error("user not found");
    }
    return true;


  }



  releaseEditAccess(user: string): void {
    // if the user is not in the list of users then there is nothing to do
    if (!this._contributingUsers.has(user)) {
      return;
    }

    // if the user is editing a cell then free that one up
    const editingCell = this._contributingUsers.get(user)?.cellLabel;
    if (editingCell) {
      if (this._cellsBeingEdited.has(editingCell)) {
        this._cellsBeingEdited.delete(editingCell);
      }
    }

    // remove the user from the list of users
    this._contributingUsers.delete(user);
  }


  /**  
   *  add token to current formula, this is not a cell and thus no dependency updating is needed
   * 
   * @param token:string
   * 
   * if the token is a valid cell label add it to the formula
   * 
   * 
   */
  addToken(token: string, user: string): void {


    const userData = this._contributingUsers.get(user)!;
    if (!userData.isEditing) {
      return;
    }


    userData.formulaBuilder.addToken(token);
    let cellBeingEdited = this._contributingUsers.get(user)?.cellLabel;

    // this should not empty but just in case throw error
    if (cellBeingEdited) {
      let cell = this._memory.getCellByLabel(cellBeingEdited);
      cell.setFormula(userData.formulaBuilder.getFormula());
      this._memory.setCellByLabel(cellBeingEdited, cell);
    } else {
      throw new Error("cell not found");
    }
    this._calculationManager.evaluateSheet(this._memory);
  }

  /**  
   *  add cell reference to current formula
   * 
   * @param cell:string
   * returns true if the token was added to the formula
   * returns false if a circular dependency is detected.
   * 
   * Assuming that the dependents have been updated
   * we will look at the dependsOn array for the cell being inserted
   * if the current cell is in the dependsOn array then we have a circular referenceoutloo
   */
  addCell(cellReference: string, user: string): void {

    // is the user editing a cell
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return;
    }
    if (userEditing.cellLabel === '') {
      return;
    }

    // if the cell being edited is the same as the cell being inserted then do nothing
    if (cellReference === userEditing.cellLabel) {
      return;
    }



    let currentCell: Cell = this._memory.getCellByLabel(userEditing.cellLabel)
    let currentLabel = userEditing.cellLabel;

    // Check to see if we would be introducing a circular dependency
    // this function will update the dependency for the cell being inserted
    let okToAdd = this._calculationManager.okToAddNewDependency(currentLabel, cellReference, this._memory);

    // We have checked to see if this new token introduces a circular dependency
    // if it does not then we can add the token to the formula
    if (okToAdd) {
      this.addToken(cellReference, user);
    }
  }



  /**
   * 
   * remove the last token from the current formula
   * 
   */


  removeToken(user: string): void {
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return;
    }
    if (userEditing.cellLabel === '') {
      return;
    }

    userEditing.formulaBuilder.removeToken();
    let cellBeingEdited = this._contributingUsers.get(user)?.cellLabel;

    // this should not empty but just in case throw error
    if (cellBeingEdited) {
      let cell = this._memory.getCellByLabel(cellBeingEdited);
      cell.setFormula(userEditing.formulaBuilder.getFormula());
      this._memory.setCellByLabel(cellBeingEdited, cell);
    } else {
      throw new Error("cell not found");
    }
    this._calculationManager.evaluateSheet(this._memory);
  }

  /**
   * 
   * clear the current formula
   * 
   */
  clearFormula(user: string): void {
    if (!this._contributingUsers.has(user)) {
      return;
    }
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return;
    }
    if (userEditing.cellLabel === '') {
      return;
    }

    userEditing.formulaBuilder.setFormula([]);
    let cellBeingEdited = this._contributingUsers.get(user)?.cellLabel;

    // this should not empty but just in case throw error
    if (cellBeingEdited) {
      let cell = this._memory.getCellByLabel(cellBeingEdited);
      cell.setFormula(userEditing.formulaBuilder.getFormula());
      this._memory.setCellByLabel(cellBeingEdited, cell);
    }
    this._calculationManager.evaluateSheet(this._memory);
  }

  /**
   *  Get the formula as a string
   *  
   * @returns the formula as a string
   * 
   * */
  getFormulaString(): string {
    return this._formulaBuilder.getFormulaString();
  }

  /**
   * 
   * get the formula string for the user.  
   * 
   * The formula string is the cell that the user is editing or watching
   * 
   * @param user:string
   * 
   * @returns the formula as a string
   */
  getFormulaStringForUser(user: string): string {
    const userData = this._contributingUsers.get(user);
    if (!userData) {
      return '';
    }
    // get the data from the cell, it is the authority
    const cell = this._memory.getCellByLabel(userData.cellLabel);
    // update the formulaBuilder (if this is a watcher then it updates from the cell)
    userData.formulaBuilder.setFormula(cell.getFormula());
    const formula = userData.formulaBuilder.getFormulaString();
    return formula;
  }


  /** 
   * Get the formula as a value (formatted to a string)
   *  
   * @returns the formula as a value:string 
   * 
   * */
  getResultString(): string {
    let currentWorkingCell = this._memory.getCurrentCell();
    let displayString = currentWorkingCell.getDisplayString();

    return displayString;
  }

  /**
   * Get the result string for the user
   * 
   * @param user:string
   * 
   * @returns the formula as a value:string
   */
  getResultStringForUser(user: string): string {
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return '';
    }
    let cell = this._memory.getCellByLabel(userEditing.cellLabel);
    let displayString = cell.getDisplayString();

    return displayString;
  }

  /** 
   * set the working cell by label
   * 
   * @param label:string
   * 
   * 
   */
  setWorkingCellByLabel(label: string): void {
    const [column, row] = Cell.cellToColumnRow(label);
    this.setWorkingCellByCoordinates(column, row);
  }


  /**
   * get the current cell label
   * 
   * @returns the current cell label
   * 
   */
  getWorkingCellLabel(user: string): string {
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return '';
    }
    return userEditing.cellLabel;

  }

  /**
   * Set the working cell
   * 
   * @param row:number ß
   * @param column:number
   * 
   * save the formula that is in the formulaBuilder to the current cell
   * 
   * copy the formula from the new cell into the formulaBuilder
   * 
   * */
  setWorkingCellByCoordinates(column: number, row: number): void {
    // if the cell is the same as the current cell do nothing
    if (column === this._currentWorkingColumn && row === this._currentWorkingRow) return;

    // get the current formula from the formula builder
    let currentFormula = this._formulaBuilder.getFormula();
    this._memory.setCurrentCellFormula(currentFormula);

    // get the formula from the new cell
    this._memory.setWorkingCellByCoordinates(column, row);
    currentFormula = this._memory.getCurrentCellFormula();
    this._formulaBuilder.setFormula(currentFormula);

    this._currentWorkingColumn = column;
    this._currentWorkingRow = row;

    this._memory.setWorkingCellByCoordinates(column, row);

  }

  /**
    * Get the Sheet Display Values
    * the GUI needs the data to be in row major order
    * 
    * @returns string[][]
    */
  public getSheetDisplayStringsForGUI(): string[][] {
    this._calculationManager.updateComputationOrder(this._memory);
    this._calculationManager.evaluateSheet(this._memory);

    let memoryDisplayValues = this._memory.getSheetDisplayStrings();
    let guiDisplayValues: string[][] = [];
    let inputRows = memoryDisplayValues.length;
    let inputColumns = memoryDisplayValues[0].length;

    for (let outputRow = 0; outputRow < inputColumns; outputRow++) {
      guiDisplayValues[outputRow] = [];
      for (let outputColumn = 0; outputColumn < inputRows; outputColumn++) {
        guiDisplayValues[outputRow][outputColumn] = memoryDisplayValues[outputColumn][outputRow];
      }
    }


    return guiDisplayValues;

  }




  /**
   * The edit status of the machine specifies what happens when a cell is clicked
   * 
   * @returns boolean
   * 
   * */
  public getEditStatus(user: string): boolean {

    if (!this._contributingUsers.has(user)) {
      return false;
    }
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return false;
    }
    let cellBeingEditedLabel = userEditing.cellLabel;
    if (cellBeingEditedLabel === '') {
      return false;
    }
    return true;
  }



  /**
   * Get the edit status string
   *  
   * @returns string
   * 
   * */
  public getEditStatusString(user: string): string {
    if (!this._contributingUsers.has(user)) {
      return "browsing";
    }
    const userEditing = this._contributingUsers.get(user);
    if (!userEditing) {
      return "browsing";
    }

    if (userEditing.cellLabel === '') {
      return "browsing";
    }

    return "editing: " + userEditing.cellLabel;
  }


  public documentContainer(user: string): any {
    // get the current formula for the cell of this user
    let container = this._memory.sheetContainer();

    // for the purposes of this simple demo we will add the user if they are not present

    if (!this._contributingUsers.has(user)) {
      this.requestViewAccess(user, 'A1');
    }

    let userData = this._contributingUsers.get(user)!;
    let cellFocused = userData.cellLabel;
    container.currentCell = cellFocused;
    container.formula = this.getFormulaStringForUser(user);
    container.result = this.getResultStringForUser(user);
    container.isEditing = userData.isEditing;
    return container;
  }

  public sheetToJSON(): string {
    return this._memory.sheetToJSON();
  }

  public updateSheetFromJSON(json: string): void {
    this._memory.updateSheetFromJSON(json);
  }

  static spreadsheetFromJSON(json: string): SpreadSheetController {
    let sheetObject = JSON.parse(json);
    let columns = sheetObject.columns;
    let rows = sheetObject.rows;
    let spreadsheet = new SpreadSheetController(columns, rows);
    spreadsheet.updateSheetFromJSON(json);

    return spreadsheet;
  }
}

export default SpreadSheetController;