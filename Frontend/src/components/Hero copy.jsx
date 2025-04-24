import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";

const media = [assets.hero11, assets.hero22, assets.herov]; // Images and video

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
      setIsVideo(media[(currentIndex + 1) % media.length].endsWith(".mp4"));
    }, 8000); // Change media every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {media.map((item, index) =>
          item.endsWith(".mp4") ? (
            <video
              key={index}
              src={item}
              autoPlay
              loop
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <img
              key={index}
              src={item}
              alt={`Property ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          )
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center sm:items-start justify-center h-full text-white px-6 sm:px-12 lg:px-24">
        <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
          Find Your Dream Home
        </h1>
        <p className="text-sm sm:text-lg text-gray-200 mt-4 max-w-lg">
          Explore a wide range of premium properties with exclusive deals.
        </p>
        <div className="flex gap-4 mt-6">
          <button className="bg-white text-black py-2 px-6 text-sm font-medium uppercase hover:bg-gray-300 transition-all">
            View Listings
          </button>
          <button className="bg-transparent border border-white py-2 px-6 text-sm font-medium uppercase hover:bg-white hover:text-black transition-all">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
