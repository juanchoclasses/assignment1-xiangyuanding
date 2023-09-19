import React from "react";

// a component that will render a single cell.
// the cell has a value and a label
// the cell has a class name
// the cell has a click handler
// the cell has a style
// the cell has a value
// the cell has a label



interface CellProps {
  value: string;
  label: string;
  className: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style: React.CSSProperties;
} // interface CellProps

function Cell({ value, label, className, onClick, style }: CellProps) {
  return (
    <button className={className} onClick={onClick} style={style} value={value}>
      {label}
    </button>
  );
} // Cell

export default Cell;