// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import ModelPage from './pages/ModelPage';
import CarPage from './pages/CarPage';
import SearchPage from './pages/SearchPage'; // <-- 1. Импортируем

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} /> 
        <Route path="/cars/:brandSlug" element={<BrandPage />} />
        <Route path="/cars/:brandSlug/:modelSlug" element={<ModelPage />} />
        <Route path="/cars/:brandSlug/:modelSlug/:carId" element={<CarPage />} />
      </Routes>
    </Router>
  );
}

export default App;