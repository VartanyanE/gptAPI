import React from "react";
import useForm from "./useForm";
import "./App.css";

const App = () => {
  const { formData, handleChange, handleSubmit } = useForm();

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          name="data"
          value={formData.data}
          onChange={handleChange}
        />
        <button className="submit-button" type="submit">
          Submit
        </button>
      </form>
      {formData.response ? <h3 className="post">{formData.response}</h3> : ""}
    </div>
  );
};

export default App;
