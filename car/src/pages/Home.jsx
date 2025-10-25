import React from 'react';

import DesignCard from '../components/Home/DesignCard';
import HeroSection from '../components/Home/HeroSection';
import Recommendations from '../components/Home/Recommendations';

import '../index.css';
export default function Home() {
  return (
    <div>
        <HeroSection />
        <Recommendations />
        <DesignCard />

    </div>
  );
}