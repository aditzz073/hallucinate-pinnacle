import React from "react";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep black base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Animated gradient mesh that covers entire screen */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-cyan-900/40 animate-gradient-shift" />
      </div>
      
      {/* Evenly distributed orbs across ALL areas */}
      
      {/* Top Left */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/25 to-cyan-500/20 rounded-full blur-[120px] animate-float-slow" />
      
      {/* Top Right */}
      <div className="absolute top-[15%] right-[10%] w-[550px] h-[550px] bg-gradient-to-br from-cyan-500/22 to-blue-500/18 rounded-full blur-[110px] animate-float-slow-reverse" />
      
      {/* Center Left */}
      <div className="absolute top-[45%] left-[5%] w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-blue-500/16 rounded-full blur-[100px] animate-float-medium" />
      
      {/* Center Right */}
      <div className="absolute top-[50%] right-[8%] w-[520px] h-[520px] bg-gradient-to-br from-blue-500/20 to-purple-500/16 rounded-full blur-[105px] animate-float-medium-reverse" />
      
      {/* Bottom Left */}
      <div className="absolute bottom-[10%] left-[12%] w-[580px] h-[580px] bg-gradient-to-br from-cyan-500/23 to-blue-500/19 rounded-full blur-[115px] animate-float-fast" />
      
      {/* Bottom Right */}
      <div className="absolute bottom-[12%] right-[15%] w-[560px] h-[560px] bg-gradient-to-br from-blue-500/21 to-cyan-500/17 rounded-full blur-[108px] animate-float-fast-reverse" />
      
      {/* Center pulsing orb for dynamic feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-cyan-400/15 to-blue-500/12 rounded-full blur-[130px] animate-pulse-orb" />
      
      {/* Additional floating accent orbs for coverage */}
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-cyan-400/18 rounded-full blur-[90px] animate-float-fast" />
      <div className="absolute bottom-[35%] right-[35%] w-[420px] h-[420px] bg-blue-400/16 rounded-full blur-[95px] animate-float-fast-reverse" />
      
      {/* Enhanced grid - more visible */}
      <div 
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.5) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Multiple diagonal light beams evenly spaced */}
      <div className="absolute top-0 left-[15%] w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent animate-beam-pulse" />
      <div className="absolute top-0 left-[35%] w-[2px] h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-beam-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-0 left-[55%] w-[2px] h-full bg-gradient-to-b from-transparent via-purple-400/18 to-transparent animate-beam-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-0 right-[25%] w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-400/22 to-transparent animate-beam-pulse" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-0 right-[10%] w-[2px] h-full bg-gradient-to-b from-transparent via-blue-400/19 to-transparent animate-beam-pulse" style={{ animationDelay: '3.5s' }} />
      
      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
    </div>
  );
}
