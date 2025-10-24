import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './index.css';
import Navbar from './other/Navbar';

// Основные пользовательские страницы
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import ModelPage from './pages/ModelPage';
import CarPage from './pages/CarPage';
import SearchPage from './pages/SearchPage';

import AdminDashboardPage from './pages/AdminDashboardPage'; 
import AdminEditCarPage from './components/AdminEditCarPage';
import PlainWhiteNavbar from './other/PlainWhiteNavbar';

function App() {
  return (
    <Router>
      <Navbar /> 
      <PlainWhiteNavbar />
      
      {/* [ИЗМЕНЕНИЕ]: Добавляем overflowX: 'hidden' для надежности */}
      <div className="min-h-screen bg-gray-50" style={{ width: '100%', overflowX: 'hidden' }}>
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} /> 
          <Route path="/cars/:brandSlug" element={<BrandPage />} />
          <Route path="/cars/:brandSlug/:modelSlug" element={<ModelPage />} />
          <Route path="/cars/:brandSlug/:modelSlug/:carId" element={<CarPage />} />
          
          <Route 
              path="/admin" 
              element={<AdminDashboardPage />} 
          />

          <Route 
              path="/admin/car/:id/edit" 
              element={<AdminEditCarPage />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;