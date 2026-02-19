import React from "react";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep black base with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020204] via-[#050508] to-[#030306]" />
      
      {/* Animated gradient mesh overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-cyan-950/20" />
      </div>
      
      {/* Floating orbs - Enhanced with more layers */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] animate-float-slow-reverse" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[100px] animate-float-medium" />
      <div className="absolute bottom-1/3 left-1/3 w-[450px] h-[450px] bg-blue-600/7 rounded-full blur-[110px] animate-float-medium-reverse" />
      
      {/* Additional accent orbs for depth */}
      <div className="absolute top-[10%] right-[15%] w-[250px] h-[250px] bg-cyan-400/5 rounded-full blur-[80px] animate-float-fast" />
      <div className="absolute bottom-[15%] left-[10%] w-[280px] h-[280px] bg-blue-400/5 rounded-full blur-[90px] animate-float-fast-reverse" />
      
      {/* Subtle scanline effect for tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.015] animate-scanline"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
      
      {/* Enhanced grid pattern with perspective */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Diagonal light streaks for dynamism */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-pulse-slow" />
      <div className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/8 to-transparent animate-pulse-slower" style={{ animationDelay: '1s' }} />
      
      {/* Radial vignette for depth and focus */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#020204]" />
      
      {/* Top-to-bottom gradient overlay for layering */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/40 to-[#020204]" />
      
      {/* Subtle noise texture for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}
