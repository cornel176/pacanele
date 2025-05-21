import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Slot from "./pages/SlotMachine";
import Dice from "./pages/DiceRoll";
import CoinFlip from "./pages/CoinFlip";
import Login from "./pages/Login"; // adăugat

export default function App() {
  const [balance, setBalance] = useState(1000);

  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          color: "inherit",
          fontFamily: "inherit",
          padding: 0,
          margin: 0,
          position: "relative",
        }}
      >
        {/* Balanță */}
        <div
          style={{
            position: "fixed",
            top: 30,
            right: 20,
            backgroundColor: "gold",
            padding: "8px 16px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            fontWeight: "bold",
            zIndex: 1000,
            color: "black",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          💰 Bani: {balance} MDL
          <button
            onClick={() => setBalance((prev) => prev + 100)}
            style={{
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              fontWeight: "bold",
              cursor: "pointer",
              lineHeight: "1",
            }}
            title="Adaugă 100 MDL"
          >
            ＋
          </button>
        </div>

        {/* Rute */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/slot" element={<Slot balance={balance} setBalance={setBalance} />} />
          <Route path="/dice" element={<Dice balance={balance} setBalance={setBalance} />} />
          <Route path="/coin" element={<CoinFlip balance={balance} setBalance={setBalance} />} />
          <Route path="/login" element={<Login />} /> {/* Adăugat */}
        </Routes>
      </div>
    </Router>
  );
}
