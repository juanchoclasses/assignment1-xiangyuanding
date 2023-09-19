import React from "react";
import "./Button.css";

/**
 * Button component
 */


interface ButtonProps {
  text: string;
  isDigit: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  dataTestId: string; // add a data-testid prop
} // interface ButtonProps

const Button: React.FC<ButtonProps> = ({ text, isDigit, onClick, className, dataTestId }) => {

  return (
    <button
      className={className}
      onClick={onClick}
      data-testid={dataTestId}
      data-is-digit={isDigit}
    >
      {text}
    </button>
  );
};

export default Button;

