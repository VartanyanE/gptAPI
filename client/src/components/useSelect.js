import React, { useState, useEffect } from "react";
import "../styles/App.css";
import axios from "axios";
import UseForm from "./useForm";
import Select from "react-select";

const UseSelect = () => {
  // Define the state to manage the selected option
  const [selectedOption, setSelectedOption] = useState(""); // Set a default option

  // Handle the change event when the user selects a different option
  // const handleSelectChange = async (event) => {
  //   setSelectedOption(event.target.value);
  //   console.log(selectedOption);
  //   const payload = {
  //     message: selectedOption,
  //   };
  //   const response = await axios.post("/message", payload);
  // };

  // useEffect(() => {}, [selectedOption]);
  const options = [
    {
      value:
        "Answer every question like an elementary school teacher.  Use clear and precise language.  Include as much information as possible",
      label: "Elementary School Teacher",
    },
    {
      value:
        "You have been a Spanish translator for 10 years. Translate the entire user input into Spanish.",
      label: "Spanish Translator",
    },
    { value: "jazz", label: "Jazz" },
    { value: "orchestra", label: "Orchestra" },
  ];

  const handleChange = async (selectedOption) => {
    setSelectedOption(selectedOption);
    const payload = {
      message: selectedOption,
    };
    const response = await axios.post("/message", payload);

    console.log(`Option selected:`, selectedOption);
  };

  return (
    <div className="select-container">
      <Select
        className="custom-select"
        options={options}
        onChange={handleChange}
        autoFocus={true}
      />
    </div>
  );
};

export default UseSelect;
