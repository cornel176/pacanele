// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
    </Routes>
  );
}

export default App;
