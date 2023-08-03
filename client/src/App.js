import React from "react";
import useForm from "./useForm";
import "./App.css";

const App = () => {
  const { formData, handleChange, handleSubmit } = useForm();

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="data"
          value={formData.data}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
      {formData.response ? <h3 className="post">{formData.response}</h3> : ""}
    </div>
  );
};

export default App;
