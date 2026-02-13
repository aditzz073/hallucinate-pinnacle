import React from "react";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-[#050508]" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px] animate-float-slow-reverse" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] animate-float-medium" />
      <div className="absolute bottom-1/3 left-1/3 w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[100px] animate-float-medium" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/50 to-[#050508]" />
    </div>
  );
}
