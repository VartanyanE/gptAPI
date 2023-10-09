import React, { useState, useEffect } from "react";
import "./App.css";

const UseSelect = () => {
  // Define the state to manage the selected option
  const [selectedOption, setSelectedOption] = useState({
    option1:
      "You have been an elementary school teacher for 5 years.  Answer every question like you are talking to a 4th grade student. Try to include as much information as possible.",
  }); // Set a default option

  // Handle the change event when the user selects a different option
  const handleSelectChange = async (event) => {
    setSelectedOption(event.target.value);
    console.log(selectedOption);
  };

  useEffect(() => {
    // This function will be called whenever selectedOption changes
    console.log(`Selected option changed to: ${selectedOption}`);

    // You can perform additional actions here based on the new selectedOption value
  }, [selectedOption]);

  return (
    <div className="select-container">
      <select
        className="custom-select"
        id="selectOption"
        value={selectedOption}
        onChange={handleSelectChange}
      >
        <option value="You have been an elementary school teacher for 5 years.  Answer every question like you are talking to a 4th grade student. Try to include as much information as possible.">
          Option 1
        </option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
    </div>
  );
};

export default UseSelect;
