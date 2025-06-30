import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { EventsSection } from "@/components/home/events-section";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { AppLoadingPage } from "@/components/ui/loading";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <EventsSection />
      <StatsSection />
      <TestimonialsSection />
    </div>
  );
}
