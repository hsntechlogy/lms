import React from "react";

export default function SearchComponent() {
  return (
    <div style={{ 
      width: "100%", 
      height: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      background: "#f9f9f9" 
    }}>
      <div style={{
        width: "90%",
        maxWidth: "400px",
        background: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <input
          type="text"
          placeholder="Search..."
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            outline: "none"
          }}
        />
      </div>
    </div>
  );
} 