import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AiDemoSection from "@/components/landing/AiDemoSection";
import TrustSection from "@/components/landing/TrustSection";
import MembershipSection from "@/components/landing/MembershipSection";
import TwoCardSection from "@/components/landing/TwoCardSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="hl-page">
      <Navbar />
      <main>
        {/* 1. Hero — who, what, why in under 5 seconds */}
        <HeroSection />

        {/* 2. Problem — names the frustration they already feel */}
        <ProblemSection />

        {/* 3. Features — how those problems are solved */}
        <FeaturesSection />

        {/* 4. AI Demo — live proof, the showstopper */}
        <AiDemoSection />

        {/* 5. Trust — the doctor's story and philosophy */}
        <TrustSection />

        {/* 6. Membership — the value proposition with calculator */}
        <MembershipSection />

        {/* 7. Pricing — two paths after desire is built */}
        <TwoCardSection />

        {/* 8. Reviews — social proof before the final push */}
        <ReviewsSection />

        {/* 9. CTA — close */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
