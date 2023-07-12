// import React, { useState } from "react";
// import axios from "axios";
// import "./App.css";

// function App() {
//   const [textInput, setTextInput] = useState("");
//   const [data, setData] = useState("");
//   const [answer, setAnswer] = useState([]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setData(textInput);
//     makePost();
//     // Perform any desired actions with the submitted text
//   };

//   const payload = {
//     question: data,
//   };

//   const makePost = () => {
//     axios
//       .post("http://localhost:8000/chatbot", payload)
//       .then((response) => {
//         // Handle the response data
//         console.log(response.data);
//         setAnswer(response.data.bot);
//       })
//       .catch((error) => {
//         // Handle any errors
//         console.error(error);
//       });
//   };

//   const handleChange = (e) => {
//     setTextInput(e.target.value);
//   };

//   return (
//     <div>
//       <h1></h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={textInput}
//           onChange={handleChange}
//           placeholder="Enter your text"
//         />
//         <button type="submit">Submit</button>
//       </form>
//       <h1>
//         {/* {answer.map((fruit, index) => (
//           <li key={index}>{fruit}</li>
//         ))} */}
//       </h1>
//     </div>
//   );
// }

// export default App;

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
      {formData.response ? (
        <h1 className="post">{formData.response.bot}</h1>
      ) : (
        ""
      )}
    </div>
  );
};

export default App;
