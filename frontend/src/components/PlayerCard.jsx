import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, DollarSign, Activity, Scale, ChevronDown } from 'lucide-react';

function PlayerCard({ player, onOpenModal, shortlists, toggleShortlist, isCompared, toggleCompare, index }) {
  const [showShortlistMenu, setShowShortlistMenu] = useState(false);
  const playerShortlists = Object.keys(shortlists).filter(listName => shortlists[listName].includes(player.player_id));
  const isFavorite = playerShortlists.length > 0;
  const costMillions = (player.value / 1_000_000).toFixed(1);
  const wageK = (player.wage / 1000).toFixed(1);
  
  const minPot = Math.max(player.overall, player.potential - 2);
  const maxPot = player.potential + 2;
  const potDisplay = minPot === maxPot ? maxPot : `${minPot}-${maxPot}`;
  
  // Dynamic styling based on potential tier
  let tierColors = {
    border: "border-zinc-800/80",
    glow: "group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]",
    text: "text-white",
    accent: "text-emerald-500",
    bg: "bg-black/80"
  };

  if (player.potential >= 90) {
    tierColors = {
      border: "border-yellow-500/50",
      glow: "group-hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]",
      text: "text-yellow-100",
      accent: "text-yellow-500",
      bg: "bg-black/90"
    };
  } else if (player.potential >= 85) {
    tierColors = {
      border: "border-emerald-400/50",
      glow: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]",
      text: "text-emerald-100",
      accent: "text-emerald-400",
      bg: "bg-black/90"
    };
  }

  const fallbackImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden border pt-12 ${tierColors.border} ${tierColors.glow} ${tierColors.bg}`}
      onClick={() => onOpenModal(player.player_id)}
    >
      {/* Compare Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleCompare(player.player_id);
        }}
        className="absolute top-4 left-4 z-10 transition-transform hover:scale-125 p-2 rounded-full hover:bg-zinc-800/50 backdrop-blur-sm"
        title="Compare Player"
      >
        <Scale className={`w-5 h-5 ${isCompared ? 'text-emerald-400' : 'text-zinc-500'}`} />
      </button>

      {/* Position Badge (Centered) */}
      <span className={`bg-zinc-950/80 ${tierColors.accent} text-[10px] font-black px-3 py-1.5 rounded-md border border-zinc-800 shadow-inner absolute top-4 left-1/2 -translate-x-1/2 z-10 uppercase tracking-widest`}>
        {player.position}
      </span>

      {/* Favorite Button & Popover */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowShortlistMenu(!showShortlistMenu);
          }}
          className="transition-transform hover:scale-125 p-2 rounded-full hover:bg-zinc-800/50 backdrop-blur-sm"
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-500'}`} />
        </button>

        {showShortlistMenu && (
          <div className="absolute top-10 right-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-48 overflow-hidden z-30" onClick={e => e.stopPropagation()}>
            <div className="px-3 py-2 bg-zinc-950/50 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Add to Shortlist
            </div>
            <div className="max-h-40 overflow-y-auto custom-scrollbar">
              {Object.keys(shortlists).map(listName => {
                const inList = shortlists[listName].includes(player.player_id);
                return (
                  <button 
                    key={listName}
                    onClick={() => toggleShortlist(player.player_id, listName)}
                    className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-zinc-800 flex justify-between items-center transition-colors"
                  >
                    <span className={inList ? 'text-emerald-400' : 'text-zinc-300'}>{listName}</span>
                    {inList && <span className="text-emerald-400">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for Popover */}
      {showShortlistMenu && (
        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowShortlistMenu(false); }}></div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-start mb-6 pr-8">
          <div className="flex gap-4 items-center">
            <div className="relative shrink-0">
              <div className={`absolute inset-0 blur-md bg-gradient-to-tr from-transparent to-${tierColors.accent.split('-')[1]}-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <img 
                src={player.photo_url || fallbackImage} 
                alt={player.name} 
                className="w-20 sm:w-24 h-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => e.target.src = fallbackImage}
              />
            </div>
            <div>
              <h3 className={`font-black text-lg leading-tight font-bebas tracking-wide ${tierColors.text}`}>{player.name}</h3>
              <p className="text-xs text-zinc-400 font-medium mt-1 tracking-wider uppercase">{player.club || 'Free Agent'} • {player.age}yo</p>
              
              {/* SM and WF Stars */}
              {(player.skill_moves || player.weak_foot) && (
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">SM</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 ${i < player.skill_moves ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">WF</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 ${i < player.weak_foot ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/50 shadow-inner group-hover:border-zinc-700/50 transition-colors">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3 h-3 text-zinc-500" />
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold">OVR ➔ POT</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-sm font-black text-white">{player.overall}</span>
              <span className={`text-xs font-bold mb-0.5 ${tierColors.accent}`}>➔ {potDisplay}</span>
            </div>
            
            {/* Visual Bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div className={`h-full ${player.potential >= 85 ? 'bg-gradient-to-r from-emerald-500 to-yellow-400' : 'bg-emerald-500'}`} style={{ width: `${(player.potential / 99) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/50 shadow-inner group-hover:border-zinc-700/50 transition-colors">
             <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3 h-3 text-zinc-500" />
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Growth</span>
            </div>
            <span className={`text-sm font-black ${tierColors.accent}`}>+{player.growth_expected} <span className="text-xs font-medium text-zinc-400">PTS</span></span>
            
            {/* Visual Bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(player.growth_expected / 15) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {player.contract_years_left <= 1 && (
        <div className="flex justify-center mb-1">
          <span className="inline-block bg-rose-500/10 text-rose-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-rose-500/20 shadow-inner">
            Pre-Contract Eligible
          </span>
        </div>
      )}

      <div className="flex justify-between items-center border-t border-zinc-800/60 pt-4 mt-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-zinc-500" />
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Est. Value</span>
          </div>
          <span className="text-lg font-black text-white font-bebas">€{costMillions}M</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Est. Wage</span>
          <span className={`text-sm font-black tracking-wider ${tierColors.accent}`}>€{wageK}K</span>
        </div>
      </div>
    </motion.div>
  );
}

export default PlayerCard;
