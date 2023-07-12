import { useState } from "react";
import axios from "./axios";
import "./App.css";

const useForm = () => {
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
      const response = await axios.post("/chatbot", payload);
      setFormData({ ...formData, response: response.data });
    } catch (error) {
      console.error(error);
    }
  };
  console.log(formData.response);
  return { formData, handleChange, handleSubmit };
};

export default useForm;
