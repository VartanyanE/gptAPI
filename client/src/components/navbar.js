import React, { useState } from "react";
import { Link } from "react-router-dom"; // If using React Router
import "../styles/navbar.css"; // Import your custom CSS file for styling

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo"></Link>
        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <ul className="navbar-items">
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={toggleNavbar}>
                Image Generator
              </Link>
            </li>
            <li className="navbar-item">
              <Link
                to="/chatbot"
                className="navbar-link"
                onClick={toggleNavbar}
              >
                Chatbot
              </Link>
            </li>
            <li className="navbar-item">
              <Link
                to="/services"
                className="navbar-link"
                onClick={toggleNavbar}
              ></Link>
            </li>
            <li className="navbar-item">
              <Link
                to="/contact"
                className="navbar-link"
                onClick={toggleNavbar}
              ></Link>
            </li>
          </ul>
        </div>
        <div className="navbar-toggle" onClick={toggleNavbar}>
          <div className={`bar ${isOpen ? "toggle" : ""}`}></div>
          <div className={`bar ${isOpen ? "toggle" : ""}`}></div>
          <div className={`bar ${isOpen ? "toggle" : ""}`}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
