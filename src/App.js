import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TsukiutaGenerator from './TsukiutaGenerator';
import ChallengesExperience from './components/web/ChallengesExperience';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TsukiutaGenerator />} />
          <Route path="/tsukiuta" element={<TsukiutaGenerator />} />
          <Route path="/challenges" element={<ChallengesExperience />} />
          <Route path="/experience" element={<ChallengesExperience />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;