import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
// import Bio from "./pages/Bio";
// import Projects from "./pages/Projects";
// import Contact from "./pages/Contact/index";
function App() {
  useEffect(() => {}, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
