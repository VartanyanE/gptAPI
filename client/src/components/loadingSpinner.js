import React, { useState, useEffect } from "react";
import "../styles/App.css"; // Import your CSS file

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  //   useEffect(() => {
  //     // Simulate an API call with a setTimeout
  //     setTimeout(() => {
  //       // Replace this with your data-fetching logic
  //       setData('Fetched data');
  //       setIsLoading(false);
  //     }, 2000); // Simulate a 2-second delay
  //   }, []);

  return (
    <div>
      {isLoading ? <div className="loading-spinner"></div> : <div></div>}
    </div>
  );
};

export default LoadingSpinner;
