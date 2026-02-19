import React from "react";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep black base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Dramatic animated gradient waves */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-cyan-900/30 animate-gradient-shift" />
      </div>
      
      {/* Large dramatic orbs */}
      <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/20 to-cyan-500/15 rounded-full blur-[150px] animate-float-slow" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/18 to-blue-500/15 rounded-full blur-[140px] animate-float-slow-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/12 to-blue-500/10 rounded-full blur-[130px] animate-pulse-orb" />
      
      {/* Accent orbs for extra flair */}
      <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-400/15 rounded-full blur-[100px] animate-float-fast" />
      <div className="absolute bottom-[25%] left-[15%] w-[450px] h-[450px] bg-blue-400/12 rounded-full blur-[110px] animate-float-fast-reverse" />
      
      {/* Glowing grid with stronger visibility */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.4) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(59,130,246,0.4) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Diagonal light beams */}
      <div className="absolute top-0 left-[20%] w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-beam-pulse" />
      <div className="absolute top-0 right-[30%] w-[2px] h-full bg-gradient-to-b from-transparent via-blue-400/15 to-transparent animate-beam-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-0 left-[60%] w-[2px] h-full bg-gradient-to-b from-transparent via-purple-400/12 to-transparent animate-beam-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Spotlight effect from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-radial-t from-blue-500/8 via-cyan-500/4 to-transparent blur-[60px]" />
      
      {/* Dark vignette for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/80" />
      
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-950/20 to-transparent" />
    </div>
  );
}
