import React from "react";
import UseForm from "../components/useForm";
import UseSelect from "../components/useSelect";
import "../styles/App.css";

const Chatbot = () => {
  const { formData, handleChange, handleSubmit } = UseForm();

  return (
    <div className="card">
      <div className="image-container">
        <img src="chatbot.png" alt="Example Image" />
      </div>
      {/* <div className="select">
        <UseSelect />
      </div> */}
      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          name="data"
          value={formData.data}
          onChange={handleChange}
        />
        <button className="submit-button" type="submit">
          Ask The Bot
        </button>
      </form>
      {formData.response ? (
        <div className="image-generated">
          {/* <div className="scrollable-text">{formData.response}</div>{" "} */}
          <img src={formData.response} alt="React Image" />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Chatbot;
