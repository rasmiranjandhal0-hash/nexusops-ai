import React, { useState } from 'react';

export default function DeskLamp({ isOn, onToggle, isFocused, mode = 'gold' }) {
  const [pulling, setPulling] = useState(false);

  const isGold = mode === 'gold';
  const glowColor = isGold ? '#f59e0b' : '#38bdf8';
  const lightColor = isGold ? '#fef3c7' : '#e0f2fe';

  const handlePullCord = () => {
    setPulling(true);
    setTimeout(() => {
      onToggle();
      setPulling(false);
    }, 250);
  };

  // Generate 20 floating dust particles with deterministic staggered positions
  const particles = [
    { top: '35%', left: '30%', delay: '0.2s', dur: '4.5s', size: '2.5px' },
    { top: '45%', left: '42%', delay: '1.4s', dur: '6s', size: '3px' },
    { top: '55%', left: '50%', delay: '0.8s', dur: '5.2s', size: '2px' },
    { top: '65%', left: '60%', delay: '2.1s', dur: '4.8s', size: '2.5px' },
    { top: '40%', left: '65%', delay: '1.7s', dur: '5.5s', size: '3.5px' },
    { top: '50%', left: '75%', delay: '0.5s', dur: '6.2s', size: '2px' },
    { top: '60%', left: '38%', delay: '2.8s', dur: '5.8s', size: '3px' },
    { top: '70%', left: '52%', delay: '1.2s', dur: '4.2s', size: '2.5px' },
    { top: '48%', left: '68%', delay: '3.2s', dur: '5.0s', size: '2px' },
    { top: '58%', left: '80%', delay: '2.4s', dur: '6.5s', size: '3px' },
    { top: '75%', left: '70%', delay: '0.9s', dur: '4.6s', size: '2.5px' },
    { top: '38%', left: '48%', delay: '2.0s', dur: '5.4s', size: '3px' },
  ];

  return (
    <div className="relative w-full h-[380px] sm:h-[500px] lg:h-[620px] flex items-center justify-center select-none">
      {/* 1. Volumetric Conical Light Beam (Visible when Lamp is ON) */}
      <div
        className={`absolute top-[90px] sm:top-[125px] lg:top-[150px] left-[45%] sm:left-[48%] lg:left-[50%] w-[380px] sm:w-[650px] lg:w-[950px] h-[320px] sm:h-[460px] lg:h-[580px] pointer-events-none transition-all duration-700 ease-out origin-top-left ${
          isOn
            ? isFocused
              ? isGold
                ? 'opacity-85 scale-100 light-beam-cone-gold'
                : 'opacity-85 scale-100 light-beam-cone-cyan'
              : isGold
              ? 'opacity-65 scale-95 light-beam-cone-gold'
              : 'opacity-65 scale-95 light-beam-cone-cyan'
            : 'opacity-0 scale-90'
        }`}
      >
        {/* Floating golden/cyan dust particles within the beam */}
        {isOn &&
          particles.map((p, idx) => (
            <div
              key={idx}
              className="absolute rounded-full particle-float pointer-events-none"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: lightColor,
                boxShadow: `0 0 8px ${glowColor}`,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}
      </div>

      {/* 2. Soft Ambient Desktop Glow Pool */}
      <div
        className={`absolute bottom-6 sm:bottom-12 left-1/4 w-[320px] sm:w-[480px] lg:w-[600px] h-20 sm:h-28 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isOn
            ? isFocused
              ? isGold
                ? 'opacity-40 bg-amber-500'
                : 'opacity-40 bg-sky-400'
              : isGold
              ? 'opacity-25 bg-amber-500'
              : 'opacity-25 bg-sky-400'
            : 'opacity-0'
        }`}
      />

      {/* 3. The Detailed Animated Desk Lamp SVG */}
      <svg
        viewBox="0 0 340 500"
        className="w-[240px] sm:w-[320px] lg:w-[380px] h-auto drop-shadow-2xl relative z-20 overflow-visible"
      >
        <defs>
          {/* Metallic Gradients */}
          <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>

          <linearGradient id="brassMetallic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="35%" stopColor="#fef3c7" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="shadeInteriorGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="shadeInteriorCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Radial Bulb Bloom Filter */}
          <filter id="bulbBloom" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Lamp Base --- */}
        {/* Base shadow */}
        <ellipse cx="100" cy="470" rx="70" ry="14" fill="#000000" opacity="0.65" />
        {/* Tier 1 base plinth */}
        <ellipse cx="100" cy="460" rx="60" ry="12" fill="url(#metalDark)" stroke="#4b5563" strokeWidth="1.5" />
        {/* Tier 2 base tier */}
        <path d="M 50 460 C 50 442, 150 442, 150 460 Z" fill="url(#brassMetallic)" />
        <ellipse cx="100" cy="445" rx="42" ry="7" fill="url(#metalDark)" stroke="#6b7280" strokeWidth="1" />

        {/* Base Articulation Pivot Joint */}
        <circle cx="100" cy="435" r="11" fill="url(#brassMetallic)" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="100" cy="435" r="4" fill="#1f2937" />

        {/* --- Lower Armature (Dual Rods) --- */}
        <line x1="97" y1="432" x2="135" y2="295" stroke="url(#metalDark)" strokeWidth="6" strokeLinecap="round" />
        <line x1="104" y1="434" x2="142" y2="297" stroke="url(#brassMetallic)" strokeWidth="4" strokeLinecap="round" />
        {/* Tension Spring */}
        <path
          d="M 102 415 Q 115 385 110 355 T 120 325"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Elbow Joint (Articulation) */}
        <circle cx="138" cy="295" r="13" fill="url(#brassMetallic)" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="138" cy="295" r="5" fill="#111827" />

        {/* --- Upper Armature (Extending toward the card) --- */}
        <line x1="138" y1="292" x2="218" y2="185" stroke="url(#metalDark)" strokeWidth="6" strokeLinecap="round" />
        <line x1="142" y1="296" x2="222" y2="189" stroke="url(#brassMetallic)" strokeWidth="3" strokeLinecap="round" />

        {/* Shade Neck Swivel Joint */}
        <circle cx="220" cy="186" r="10" fill="url(#brassMetallic)" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="220" cy="186" r="4" fill="#1f2937" />

        {/* --- Lampshade Shell (Tilted 35deg downwards & right) --- */}
        <g transform="rotate(28, 220, 186)">
          {/* Socket Dome */}
          <path d="M 205 186 L 235 186 L 232 172 L 208 172 Z" fill="url(#metalDark)" stroke="#4b5563" />
          {/* Conical Lampshade Body */}
          <path
            d="M 198 186 L 242 186 L 272 250 L 168 250 Z"
            fill="url(#metalDark)"
            stroke="#4b5563"
            strokeWidth="1.5"
          />
          {/* Brass Lip Ring */}
          <ellipse
            cx="220"
            cy="250"
            rx="52"
            ry="14"
            fill={isOn ? (isGold ? 'url(#shadeInteriorGold)' : 'url(#shadeInteriorCyan)') : '#1f2937'}
            stroke="url(#brassMetallic)"
            strokeWidth="3"
          />

          {/* Incandescent Light Bulb */}
          <g>
            {/* Ambient bulb glow halo when ON */}
            {isOn && (
              <circle
                cx="220"
                cy="250"
                r={isFocused ? 28 : 22}
                fill={lightColor}
                filter="url(#bulbBloom)"
                className="transition-all duration-300"
              />
            )}
            {/* Physical Glass Bulb */}
            <circle
              cx="220"
              cy="248"
              r="14"
              fill={isOn ? lightColor : '#4b5563'}
              stroke={isOn ? glowColor : '#374151'}
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />
            {/* Filament */}
            {isOn && (
              <path
                d="M 215 248 Q 220 242 225 248"
                fill="none"
                stroke={isGold ? '#b45309' : '#0284c7'}
                strokeWidth="1.5"
              />
            )}
          </g>

          {/* Interactive Pull String Cord */}
          <g
            className={`cursor-pointer group transition-transform ${pulling ? 'animate-cord-pull' : ''}`}
            onClick={handlePullCord}
          >
            {/* Cord line */}
            <line
              x1="248"
              y1="230"
              x2="252"
              y2={pulling ? '335' : '310'}
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="group-hover:stroke-amber-300 transition-colors"
            />
            {/* Brass Pull Bead / Bell */}
            <circle
              cx="252"
              cy={pulling ? '338' : '313'}
              r="5.5"
              fill="url(#brassMetallic)"
              stroke="#78350f"
              strokeWidth="1"
              filter={isOn ? 'url(#softGlow)' : undefined}
              className="group-hover:scale-125 transition-transform"
            />
            <title>Click pull cord to toggle lamp</title>
          </g>
        </g>
      </svg>
    </div>
  );
}
