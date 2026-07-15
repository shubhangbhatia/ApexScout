import React from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, User, Shield, Target, DollarSign, TrendingUp, Activity } from 'lucide-react';

function Sidebar({ filters, setFilters, onSearch }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <motion.aside 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full lg:w-[380px] bg-zinc-950/80 p-8 border-b lg:border-b-0 lg:border-r border-zinc-800/60 backdrop-blur-2xl flex flex-col justify-between shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20"
    >
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 font-bebas">ApexScout</h1>
        </div>
        <p className="text-zinc-400 text-xs mb-10 tracking-widest uppercase font-semibold">Pro Analytics Terminal</p>

        <div className="space-y-8">
          
          {/* Player Name */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 mb-3">
              <User className="w-3 h-3" /> Target Identifier
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="name" 
                value={filters.name} 
                onChange={handleChange}
                placeholder="e.g. Lamine Yamal"
                className="w-full glass-input rounded-xl p-3.5 pl-10 text-sm text-white placeholder-zinc-500 font-medium"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 mb-3">
              <Shield className="w-3 h-3" /> Tactical Role
            </label>
            <div className="relative">
              <select 
                name="position" 
                value={filters.position} 
                onChange={handleChange}
                className="w-full glass-input rounded-xl p-3.5 pl-10 text-sm text-white appearance-none cursor-pointer font-medium"
              >
                <option value="">Any Position</option>
                <option value="ST">Striker (ST)</option>
                <option value="CF">Center Forward (CF)</option>
                <option value="RW">Right Winger (RW)</option>
                <option value="LW">Left Winger (LW)</option>
                <option value="CAM">Attacking Mid (CAM)</option>
                <option value="CM">Central Mid (CM)</option>
                <option value="RM">Right Mid (RM)</option>
                <option value="LM">Left Mid (LM)</option>
                <option value="CDM">Defensive Mid (CDM)</option>
                <option value="CB">Center Back (CB)</option>
                <option value="RB">Right Back (RB)</option>
                <option value="LB">Left Back (LB)</option>
                <option value="RWB">Right Wing Back (RWB)</option>
                <option value="LWB">Left Wing Back (LWB)</option>
                <option value="GK">Goalkeeper (GK)</option>
              </select>
              <Target className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Ranges */}
          <div className="space-y-6">
            
            {/* Max Value */}
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <DollarSign className="w-3 h-3" /> Max Value
                </label>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700 font-mono shadow-inner">
                  €{(filters.max_price / 1000000).toFixed(1)}M
                </span>
              </div>
              <input 
                type="range" name="max_price" 
                min="100000" max="150000000" step="1000000" 
                value={filters.max_price} onChange={handleChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Max Wage */}
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <DollarSign className="w-3 h-3" /> Max Wage
                </label>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700 font-mono shadow-inner">
                  €{(filters.max_wage / 1000).toFixed(1)}K
                </span>
              </div>
              <input 
                type="range" name="max_wage" 
                min="500" max="300000" step="1000" 
                value={filters.max_wage} onChange={handleChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Max Age */}
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <Activity className="w-3 h-3" /> Max Age
                </label>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700 font-mono shadow-inner">
                  {filters.max_age} yrs
                </span>
              </div>
              <input 
                type="range" name="max_age" 
                min="15" max="45" step="1" 
                value={filters.max_age} onChange={handleChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Min Potential */}
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <TrendingUp className="w-3 h-3" /> Min Potential
                </label>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700 font-mono shadow-inner">
                  {filters.min_potential}
                </span>
              </div>
              <input 
                type="range" name="min_potential" 
                min="70" max="95" step="1" 
                value={filters.min_potential} onChange={handleChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Min Skill Moves */}
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <TrendingUp className="w-3 h-3" /> Min Skill Moves
                </label>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700 font-mono shadow-inner">
                  {filters.min_skill_moves}
                </span>
              </div>
              <input 
                type="range" name="min_skill_moves" 
                min="1" max="5" step="1" 
                value={filters.min_skill_moves} onChange={handleChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Min Weak Foot */}
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <TrendingUp className="w-3 h-3" /> Min Weak Foot
                </label>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700 font-mono shadow-inner">
                  {filters.min_weak_foot}
                </span>
              </div>
              <input 
                type="range" name="min_weak_foot" 
                min="1" max="5" step="1" 
                value={filters.min_weak_foot} onChange={handleChange}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Pre-Contract Eligible Only */}
            <label className="flex items-center gap-3 cursor-pointer group mt-2">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-zinc-700 bg-zinc-900 group-hover:border-emerald-500 transition-colors">
                <input 
                  type="checkbox" name="pre_contract_only"
                  checked={filters.pre_contract_only} onChange={handleChange}
                  className="absolute opacity-0 cursor-pointer w-full h-full"
                />
                {filters.pre_contract_only && (
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors">
                Pre-Contract Eligible (≤1 Yr)
              </span>
            </label>
          </div>

          {/* Sort By */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 mb-3">
              <SlidersHorizontal className="w-3 h-3" /> Sort Algorithm
            </label>
            <div className="relative">
              <select 
                name="sort_by" 
                value={filters.sort_by} 
                onChange={handleChange}
                className="w-full glass-input rounded-xl p-3.5 text-sm text-white appearance-none cursor-pointer font-medium"
              >
                <option value="potential">Highest Potential Peak</option>
                <option value="overall">Current OVR Rating</option>
                <option value="growth_expected">Max Expected Growth</option>
                <option value="value">Lowest Transfer Value</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSearch}
        className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer text-xs flex justify-center items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Run Global Query
      </motion.button>
    </motion.aside>
  );
}

export default Sidebar;
