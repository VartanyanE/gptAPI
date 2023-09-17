import React from "react";
import useForm from "./useForm";
import "./App.css";

const App = () => {
  const { formData, handleChange, handleSubmit } = useForm();

  return (
    <div className="card">
      <div className="image-container">
        <img src="teacher.jpg" alt="Example Image" />
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
          Ask The Teacher
        </button>
      </form>
      {formData.response ? (
        <h3 className="post">
          <div className="scrollable-text">{formData.response}</div>{" "}
        </h3>
      ) : (
        ""
      )}
    </div>
  );
};

export default App;
