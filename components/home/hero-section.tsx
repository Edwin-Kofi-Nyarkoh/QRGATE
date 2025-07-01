"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const slides = [
  {
    image: "/hero-bg-1.jpg",
    headline: "Buy & Sell Tickets Effortlessly",
    sub: "The best solution for event organizers and attendees.",
  },
  {
    image: "/hero-bg-2.jpg",
    headline: "Discover Amazing Events",
    sub: "Find concerts, workshops, meetups, and more near you.",
  },
  {
    image: "/hero-bg-4.jpg",
    headline: "Secure & Fast Checkout",
    sub: "Enjoy seamless and secure ticketing with QRGates.",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme } = useTheme();

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const goToSlide = (idx: number) => setCurrentSlide(idx);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section
      className="relative h-svh bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
      style={
        {
          // Optionally use theme variables for background overlay
          // e.g., background: `var(--hero-gradient-bg, ...)` if defined
        }
      }
    >
      {/* Carousel Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={idx !== currentSlide}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${slide.image}')`,
              filter: theme === "dark" ? "brightness(0.7)" : "brightness(0.85)",
              transition: "filter 0.3s",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center text-center text-white">
        <div className="max-w-4xl px-4">
          <p className="text-sm uppercase tracking-wider mb-4 opacity-90">
            THE BEST SOLUTION FOR
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg animate-fade-in">
            {slides[currentSlide].headline}
          </h1>
          <p className="text-lg md:text-2xl mb-8 opacity-90 animate-fade-in delay-100">
            {slides[currentSlide].sub}
          </p>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 border border-white/20"
              aria-label="Previous slide"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 border border-white/20"
              aria-label="Next slide"
              onClick={nextSlide}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                  idx === currentSlide
                    ? "bg-white shadow-lg scale-110"
                    : "bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
