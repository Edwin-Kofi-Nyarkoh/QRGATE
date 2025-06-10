'use client';

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const services = [
  "Event ticketing made easy",
  "Fast & Secure QR code verification",
  "Instant email confirmation",
  "User-friendly interface",
];

const testimonials = [
  {
    name: "Edwin Kofi Nyarkoh",
    role: "Lead Developer & Project Admin",
    message: "Building this project was an incredible experience. The QR system is seamless!",
    image: "https://res.cloudinary.com/dggaqzud0/image/upload/v1748873504/istockphoto-1351635103-612x612_it3jxu.jpg"
  },
  {
    name: "Arnold Ocansey",
    role: "Frontend Developer",
    message: "We’re proud of how intuitive and secure the platform turned out.",
    image: "https://res.cloudinary.com/dggaqzud0/image/upload/v1748873504/istockphoto-1351635103-612x612_it3jxu.jpg"
  },
  {
    name: "Francis Mensah",
    role: "UI Designer",
    message: "The interface is not only functional but also visually stunning.",
    image: "https://res.cloudinary.com/dggaqzud0/image/upload/v1748873504/istockphoto-1351635103-612x612_it3jxu.jpg"
  },
  {
    name: "James Hunkpor",
    role: "Customer",
    message: "I buy all my tickets from this websites, at my comfort zone",
    image: "https://res.cloudinary.com/dggaqzud0/image/upload/v1748873504/istockphoto-1351635103-612x612_it3jxu.jpg"
  }
];
export default function Services() {
  const [canPlay, setCanPlay] = useState(false); // ✅ fixed closing parenthesis

  return (
    <>
      <div className="flex justify-center items-center text-2xl font-semibold">
        <p>use OUR SOFTWARE</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center w-full p-6 gap-8 relative px-6 md:px-16">
        {/* Left: Video */}
        <div className="w-full md:w-1/2 h-[450px] relative flex items-center justify-center">
          {/* Fallback Image if video isn't ready */}
          {!canPlay && (
            <Image
              src="https://res.cloudinary.com/dggaqzud0/image/upload/v1748873504/istockphoto-1351635103-612x612_it3jxu.jpg"
              alt="Fallback Background"
              fill
              className="object-cover rounded-xl z-10"
              priority
            />
          )}

          {/* Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className={`rounded-xl shadow-lg w-full h-full object-cover ${
              !canPlay ? "invisible" : "z-20"
            }`}
            onCanPlay={() => setCanPlay(true)}
          >
            <source
              src="https://res.cloudinary.com/dggaqzud0/video/upload/video_2025-02-05_13-07-37_9_rqd2fs.mp4?_s=vp-2.5.0"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Right: Text List */}
        <div className="w-full dark:bg-gray-900 p-4 rounded-2xl md:w-1/2 space-y-4">
        <div className="mt-0">
          <h2 className="text-xl font-bold mb-2">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-white">
            {services.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
        {/* Testimonials Carousel */}
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-4">What Our Team Says</h3>
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true}}
            pagination={{ clickable: true }}
            className="w-full"
          >
            {testimonials.map((t, idx) => (
              <SwiperSlide key={idx}>
                <div className="p-4 border rounded-lg h-[200px] shadow-md text-center">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={80}
                    height={100}
                    className="mx-auto rounded-full mb-2"
                  />
                  <h4 className="text-lg font-bold">{t.name}</h4>
                  <p className="text-sm text-gay-500">{t.role}</p>
                  <p className="mt-2 text-gay-700">{t.message}</p>
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-pagination mt-8 !static" />
          </Swiper>
        </div>
        </div>
      </div>
    </>
  );
}
