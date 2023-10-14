import React, { useState, useEffect } from "react";
import "../styles/App.css";
import axios from "axios";
import Select from "react-select";

const UseSelect = () => {
  // Define the state to manage the selected option
  const [selectedOption, setSelectedOption] = useState(""); // Set a default option

  const options = [
    {
      value:
        "Answer every question like an elementary school teacher.  Use clear and precise language.  Include as much information as possible",
      label: "Elementary School Teacher",
      assistant: "Hello, how can I help you today?",
      userMessage: "Please answer the following question: ",
    },
    {
      value: "Configurando el traductor al español.",
      label: "Spanish Translator",
      assistant: "Hola, ¿cómo puedo ayudarte hoy?",
      userMessage: "Please translate the following text to Spanish: ",
    },
    {
      value: "Fetching the weather forecast",
      label: "Weather Forecast",
      assistant: "Hello! How can I assist you with the weather",
      userMessage: "Look up the weather forecast for:",
    },
    {
      value:
        "I want you to act as a travel guide. I will write you my location and you will suggest a place to visit near my location. In some cases, I will also give you the type of places I will visit. You will also suggest me places of similar type that are close to my first location. My first suggestion request is ",
      label: "Travel Guide",
      assistant: "",
      userMessage: "Please suggest three places to visit near my location: ",
    },
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
