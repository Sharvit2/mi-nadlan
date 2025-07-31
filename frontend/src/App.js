import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import SaleProperties from './pages/SaleProperties';
import RentProperties from './pages/RentProperties';
import PropertyDetail from './pages/PropertyDetail';
import AgentLogin from './pages/AgentLogin';
import AgentDashboard from './pages/AgentDashboard';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sale" element={<SaleProperties />} />
            <Route path="/rent" element={<RentProperties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/agent-login" element={<AgentLogin />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;