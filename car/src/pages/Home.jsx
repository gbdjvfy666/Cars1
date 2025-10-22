import React from 'react';
import ThreeScene from '../components/ThreeScene';
import DesignCard from '../components/DesignCard';
import HeroSection from '../components/HeroSection';
import PortholeUI from '../components/PortholeUI';
import '../index.css';
export default function Home() {
  return (
    <div>
        <HeroSection />
        <div className="porthole-section">
            <PortholeUI />
        </div>
        <DesignCard />
        <ThreeScene />
    </div>
  );
}