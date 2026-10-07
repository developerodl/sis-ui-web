import React from "react";

const ExternalStaffDashboard: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <h2>External Staff Dashboard</h2>

      <p>
        Welcome to the External Staff module.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h3>Question Configuration</h3>
          <p>Configure questions and marks.</p>
        </div>

        <div
          style={{
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h3>Answer Sheet Upload</h3>
          <p>Upload student answer sheets.</p>
        </div>

        <div
          style={{
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h3>Evaluation</h3>
          <p>Evaluate student answer sheets.</p>
        </div>
      </div>
    </div>
  );
};

export default ExternalStaffDashboard;