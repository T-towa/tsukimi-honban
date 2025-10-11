import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TsukiutaGenerator from './TsukiutaGenerator';
import Survey from './components/web/Survey';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TsukiutaGenerator />} />
          <Route path="/tsukiuta" element={<TsukiutaGenerator />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/questionnaire" element={<Survey />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;