import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SCENARIO_PRESETS } from '../utils/scenarioPresets';

export default function ScenarioPresetBar({ onSelectPreset }) {
  return (
    <div className="p-4 sm:p-5 rounded-lg bg-slate-900/60 border border-slate-800/80 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
            1-Click Autonomous Scenario Presets
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Instant evaluator test scenarios for Gemini 2.5 Flash
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SCENARIO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="p-3 rounded bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span className="text-cyan-400 font-medium truncate mr-1">{preset.tag}</span>
                <span
                  className={`px-1 py-0.2 rounded font-semibold ${
                    preset.urgency === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {preset.urgency}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2">
                {preset.title}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400">
              <span>Populate Form</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
