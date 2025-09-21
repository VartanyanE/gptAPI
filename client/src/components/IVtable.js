import React, { useEffect, useState } from "react";
import "../styles/App.css";

export default function IVTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8000/top-iv");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching IV data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>;
  if (!data || data.length === 0)
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        No data available
      </p>
    );

  return (
    <div className="container">
      <h2 className="title">ATM Implied Volatility</h2>

      {data.map((item, i) => {
        const ivPercent = item.iv ? (item.iv * 100).toFixed(2) : null;

        let ivClass = "iv-low";
        if (ivPercent >= 70) ivClass = "iv-high";
        else if (ivPercent >= 40) ivClass = "iv-medium";
        else if (ivPercent >= 20) ivClass = "iv-normal";

        return (
          <div key={i} className="card">
            <div className="card-header">
              <span className="symbol">{item.symbol}</span>
              <span className={`iv ${ivClass}`}>
                {ivPercent ? ivPercent + "%" : "N/A"}
              </span>
            </div>

            <div className="card-details">
              <span className="label">Strike:</span>
              <span className="value">{item.strike}</span>

              <span className="label">Expiry:</span>
              <span className="value">{item.expiry}</span>

              <span className="label">Last Price:</span>
              <span className="value">{item.lastPrice}</span>

              <span className="label">Open Interest:</span>
              <span className="value">{item.openInterest}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
