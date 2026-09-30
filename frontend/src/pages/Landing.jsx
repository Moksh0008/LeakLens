// Landing.jsx — the public product page (pre-login).
// Composes isolated section components from components/landing/.
// No data fetching, no auth — pure presentation.
//
// Background: the BI network illustration sits behind the whole page as a
// barely-there watermark (fixed, cover, low opacity) so sections stay
// perfectly readable — the dark base color still does the heavy lifting.

import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProblemSection from "../components/landing/ProblemSection";
import HowItWorks from "../components/landing/HowItWorks";
import IntelligenceSection from "../components/landing/IntelligenceSection";
import ManagementInsights from "../components/landing/ManagementInsights";
import InvestigationPreview from "../components/landing/InvestigationPreview";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import bgImage from "../assets/LeakLens-BI.png";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-background text-text-primary">
      {/* Watermark background layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.16,
        }}
      />
      {/* Slight bottom shade so the watermark fades before the footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-background to-transparent"
      />

      <Navbar />
      <main className="relative z-10">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <IntelligenceSection />
        <ManagementInsights />
        <InvestigationPreview />
        <FinalCTA />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
