
type ButtonElement = React.MouseEvent<HTMLButtonElement>;
/**
 * The interface for the calculator button
 * @interface Button
 * @property {string} text - The text to display on the button
 * @property {() => void} onClick - The function to call when the button is clicked
 */
interface Button {
  text: string;
  isDigint: boolean;
  onClick: (button: ButtonElement) => void;
}




/** 
 * A structure for a token
 * The token will be ether a numeric string or an operator string or a cell reference string
 */
type TokenType = string;

/**
 * A structure for a formula
 * A formula is a list of tokens
 */
type FormulaType = Token[];



interface SheetType {
  [key: string]: CellType;
}

// Define the interface for the JSON document
interface CalcSheetDocument {
  numberOfColumns: number;
  numberOfRows: number;
  formulas: string[][][];
}
