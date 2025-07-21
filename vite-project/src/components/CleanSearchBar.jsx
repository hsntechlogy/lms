import React from "react";

export default function CleanSearchBar() {
  return (
    <div style={{ 
      width: "100%", 
      minHeight: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      background: "white",
      margin: 0,
      padding: 0,
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <input
        type="text"
        placeholder="Search..."
        style={{
          width: "90%",
          maxWidth: "400px",
          padding: "15px",
          fontSize: "16px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          outline: "none",
          background: "white"
        }}
      />
    </div>
  );
} 