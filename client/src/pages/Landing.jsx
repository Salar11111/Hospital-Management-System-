import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import TrustBar from '../components/landing/TrustBar';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import CtaBand from '../components/landing/CtaBand';
import LandingFooter from '../components/landing/LandingFooter';

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNav />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CtaBand />
      </main>
      <LandingFooter />
    </div>
  );
}

export default Landing;
