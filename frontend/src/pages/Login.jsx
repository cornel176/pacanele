import React from "react";
import "../style/login.css";

export default function Login() {
  return (
    <div className="login-container">
      <a href="/" className="home-button">Home</a>
      <form className="login-form">
        <h2>Autentificare</h2>
        <input
          type="text"
          placeholder="Nume utilizator"
          required
        />
        <input
          type="password"
          placeholder="Parolă"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
