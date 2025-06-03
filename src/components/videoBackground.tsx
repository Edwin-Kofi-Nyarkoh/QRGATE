"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const carouselTexts = [
  "Welcome to QRGATE!",
  "Find the best Events here.",
  "Exclusive deals just for you.",
  "Buy ticket now and enjoy amazing offers!",
];

const subTexts = [
  { text: "Quality you can trust.", delay: 1000, opacity: 0.8 },
  { text: "Handpicked Events just for you.", delay: 2000, opacity: 0.6 },
  { text: "Fast ticketing😁 & great service.", delay: 3000, opacity: 0.7 },
  { text: "Your satisfaction, our priority!", delay: 4000, opacity: 0.5 },
];

export default function VideoBackground() {
  const [index, setIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % carouselTexts.length);
    }, 5000); // Change text every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[700px] md:h-[750px] w-full overflow-hidden relative">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
      >
        <source src="https://res.cloudinary.com/dggaqzud0/video/upload/v1748872872/3722010-hd_1920_1080_24fps_kh6jef.mp4" type="video/mp4" />
      </video>

      {/* Fallback Image (only shown if video isn't loaded) */}
      {!videoLoaded && (
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Cloudinary Image */}
          <Image
            src="https://res.cloudinary.com/dggaqzud0/image/upload/v1748873504/istockphoto-1351635103-612x612_it3jxu.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      )}

      {/* Text Carousel Overlay with Dark Background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Motion-animated main text */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
          className="relative text-3xl md:text-5xl font-bold drop-shadow-lg mb-8"
        >
          {carouselTexts[index]}
        </motion.div>

        {/* Additional paragraph texts */}
        {subTexts.map(({ text, delay, opacity }, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity }}
            transition={{ delay: delay / 1000, duration: 1 }}
            className="relative text-lg md:text-xl font-medium mt-3"
          >
            {text}
          </motion.p>
        ))}
      </div>
      
    </div>
  );
}