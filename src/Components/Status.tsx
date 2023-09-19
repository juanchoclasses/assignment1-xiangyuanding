import React from "react";

/**
 * The status component is a simple component that displays the status of the calculator.
 * 
 * The status is determined by a string that is passed in as a prop.
 */

interface StatusProps {
  statusString: string;
} // interface StatusProps

const Status: React.FC<StatusProps> = ({ statusString }) => {
  return (
    <div className="status">
      <span data-testid="StatusComponent">{statusString}</span>
    </div>
  );
}

export default Status;