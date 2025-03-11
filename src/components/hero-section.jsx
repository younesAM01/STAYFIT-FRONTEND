"use client";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const videos = [
    require("../../public/vid1.mp4"),
    require("../../public/vid2.mp4"),
    require("../../public/vid3.mp4"),
  ];

  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const videoElement = document.getElementById("hero-video");

    videoElement.addEventListener("ended", () => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    });

    return () => {
      videoElement.removeEventListener("ended", () => {
        setCurrentVideo((prev) => (prev + 1) % videos.length);
      });
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        id="hero-video"
        src={videos[currentVideo]}
        autoPlay
        muted
        className="w-full h-full object-cover z-[-100]"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
          Transform Your Game
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl">
          Expert coaching to take your skills to the next level
        </p>
        {/* <button className="bg-[#7fff00]  hover:bg-[#6ad500f5] text-black font-bold py-3 px-8 rounded-full 
                    transition duration-300 transform hover:scale-105">
                    Start Training Now
                </button> */}
        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#c2fe02] px-4 py-1 text-md font-medium text-black backdrop-blur-3xl">
            Start Training Now
          </span>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
