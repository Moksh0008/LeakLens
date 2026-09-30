// Landing.jsx — the public product page (pre-login).
// Composes isolated section components from components/landing/.
// No data fetching, no auth — pure presentation.

import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProblemSection from "../components/landing/ProblemSection";
import HowItWorks from "../components/landing/HowItWorks";
import IntelligenceSection from "../components/landing/IntelligenceSection";
import ManagementInsights from "../components/landing/ManagementInsights";
import InvestigationPreview from "../components/landing/InvestigationPreview";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <IntelligenceSection />
        <ManagementInsights />
        <InvestigationPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
