import React from 'react';
import ThreeScene from '../components/ThreeScene';
import DesignCard from '../components/DesignCard';
import HeroSection from '../components/HeroSection';

import SearchPanelUI from '../components/SearchPanelUI';
import '../index.css';
export default function Home() {
  return (
    <div>
        <HeroSection />

        <SearchPanelUI/>
        <DesignCard />
        <ThreeScene />
    </div>
  );
}