import React from "react";
import useForm from "./useForm";
import "./App.css";

const App = () => {
  const { formData, handleChange, handleSubmit } = useForm();

  return (
    <div className="card">
      <div className="image-container">
        <img src="ai.png" alt="Example Image" />
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          name="data"
          value={formData.data}
          onChange={handleChange}
        />
        <button className="submit-button" type="submit">
          Ask Jarvis
        </button>
      </form>
      {formData.response ? (
        <h3 className="post">{formData.response}</h3>
      ) : (
        <h3 className="post">GO AHEAD AND ASK ME SOMETHING.</h3>
      )}
    </div>
  );
};

export default App;
