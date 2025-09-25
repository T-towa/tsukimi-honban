import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TsukiutaGenerator from './TsukiutaGenerator';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TsukiutaGenerator />} />
          <Route path="/tsukiuta" element={<TsukiutaGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;