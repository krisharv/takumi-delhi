'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';
import SystemOverlay from '@/components/SystemOverlay';
import Hero from '@/components/Hero';
import About from '@/components/About';
import EventDetails from '@/components/EventDetails';
import Schedule from '@/components/Schedule';
import Organizers from '@/components/Organizers';
import Leaderboard from '@/components/Leaderboard';
import Voting from '@/components/Voting';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Sponsors from '@/components/Sponsors';

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <CustomCursor />
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <main className="relative">
          <SystemOverlay />
          <Hero />
          <About />
          <EventDetails />
          <Schedule />
          <Organizers />
          <Sponsors /> 
          
          
          <FAQ />
          <Contact />
          <Footer />
        </main>
      )}
    </>
  );
}
