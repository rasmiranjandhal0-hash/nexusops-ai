import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RainText from "@/components/ui/matrix-code";
import { Terminal, Cpu, ShieldCheck, ArrowLeft, Sliders, Sparkles, Layers } from 'lucide-react';

export function RainTextDemo() {
  const [color, setColor] = useState('#00ff00');
  const [speed, setSpeed] = useState(1.0);
  const [characters, setCharacters] = useState('01');
  const [fontSize, setFontSize] = useState(20);
  const [fadeOpacity, setFadeOpacity] = useState(0.1);
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden select-none font-sans">
      {/* 1. Underlying Canvas Matrix Rain Component */}
      <RainText 
        fontSize={fontSize}
        color={color}
        characters={characters}
        fadeOpacity={fadeOpacity}
        speed={speed}
      />

      {/* 2. Primary Hero Header as specified in demo */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center pointer-events-none px-4">
        <div className="relative text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-xs font-mono mb-6 backdrop-blur">
            <Terminal className="w-3.5 h-3.5" />
            <span>PRIVACYGUARD NEURAL THREAT STREAM ACTIVE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 animate-pulse font-mono">
            Matrix Code
          </h1>

          <div 
            className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-500/20 to-green-600/20 blur-xl animate-pulse" 
            style={{ filter: 'blur(28px)' }}
          />

          <p className="mt-4 text-emerald-300/80 text-sm sm:text-base font-mono max-w-md mx-auto drop-shadow">
            Autonomous multi-agent execution pipeline streaming raw operational state.
          </p>
        </div>

        {/* 3. Interactive HUD & Controls */}
        <div className="mt-8 pointer-events-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-semibold backdrop-blur shadow-lg shadow-emerald-950/50 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Command Center</span>
            </Link>

            <button
              onClick={() => setShowControls(!showControls)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-black/60 hover:bg-black/80 border border-emerald-900 text-slate-300 text-xs font-medium backdrop-blur transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showControls ? 'Hide HUD' : 'Customize Stream'}</span>
            </button>
          </div>

          {/* Collapsible Control Panel */}
          {showControls && (
            <div className="bg-black/85 border border-emerald-800/60 rounded-xl p-4 sm:p-5 max-w-lg w-full backdrop-blur-md shadow-2xl space-y-4 text-slate-200">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2.5">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
                  <Cpu className="w-4 h-4" />
                  <span>MATRIX STREAM CONTROLLER</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">shadcn / UI</span>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-slate-400">Color Palette</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Matrix Emerald', val: '#00ff00' },
                    { label: 'Nexus Cyan', val: '#06b6d4' },
                    { label: 'Neon Violet', val: '#a855f7' },
                    { label: 'Amber Alert', val: '#f59e0b' },
                    { label: 'Pure White', val: '#ffffff' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setColor(preset.val)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                        color === preset.val
                          ? 'border-white text-white font-bold bg-white/10'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                      style={{ color: preset.val }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Characters Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-slate-400">Stream Characters</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Binary (01)', val: '01' },
                    { label: 'Hex (0123456789ABCDEF)', val: '0123456789ABCDEF' },
                    { label: 'Katakana / Cyber', val: 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ' },
                    { label: 'PrivacyGuard Tokens', val: 'PRIVACYGUARD_AI_SECURITY_SCANNER' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setCharacters(preset.val)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                        characters === preset.val
                          ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Slider */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Speed Multiplier</span>
                    <span className="text-emerald-400">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Font Size</span>
                    <span className="text-emerald-400">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Verified Unsplash Asset Preview Card */}
              <div className="border border-emerald-950/80 rounded-lg p-2.5 bg-black/60 flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=120&q=80"
                  alt="Neural Terminal"
                  className="w-12 h-12 rounded object-cover border border-emerald-800/60"
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-mono font-semibold text-emerald-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Autonomous Infrastructure</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    Enterprise multi-agent cluster online & verified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RainTextDemo;
