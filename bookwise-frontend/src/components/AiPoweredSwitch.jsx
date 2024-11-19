// AiPoweredSwitch.jsx
import React from "react";
import Switch from "react-switch";
import { showToast } from "../toastConfig";

function AiPoweredSwitch({ aiPowered, setAiPowered }) {
  // Function to handle changes in the switch state
  const handleChange = (checked) => {
    setAiPowered(checked); // Update the aiPowered state

    // Display a toast notification based on the switch state
    if (checked) {
      showToast("success", "AI powered suggestions enabled!");
    } else {
      showToast("info", "AI powered suggestions disabled!");
    }
  };

  // Render the switch component with label
  return (
    <div className="flex items-center">
      <Switch
        checked={aiPowered} // Set the initial state of the switch
        onChange={handleChange} // Call handleChange function when the switch state changes
        onColor="#86d3ff" // Color of the switch when it's on
        onHandleColor="#2693e6" // Color of the handle when the switch is on
        handleDiameter={30} // Diameter of the switch handle
        uncheckedIcon={false} // Hide the default unchecked icon
        checkedIcon={false} // Hide the default checked icon
        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)" // Box shadow for the switch
        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)" // Box shadow when the switch is active
        height={20} // Height of the switch
        width={48} // Width of the switch
        className="react-switch" // Custom class name for the switch
        id="material-switch" // ID for the switch
      />
      <label htmlFor="material-switch" className="ml-2">
        AI POWERED
      </label>
    </div>
  );
}

export default AiPoweredSwitch;
