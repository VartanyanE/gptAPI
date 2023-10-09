import { useState } from "react";
import axios from "./axios";
import "./App.css";

const UseForm = () => {
  const [formData, setFormData] = useState([{ data: "", response: "" }]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        question: formData.data,
      };
      console.log(formData.data);
      const response = await axios.post("/chatbot", payload);
      setFormData({ ...formData, response: response.data });
    } catch (error) {
      console.error(error);
    }
  };

  return { formData, handleChange, handleSubmit };
};

export default UseForm;
