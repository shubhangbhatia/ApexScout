import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { X, Activity, TrendingUp, DollarSign, Clock } from 'lucide-react';

function PlayerModal({ playerId, onClose, onPlayerClick }) {
  const [details, setDetails] = useState(null);
  const [similarPlayers, setSimilarPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fallbackImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/player/${playerId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setDetails(data.data);
        
        // Fetch similar alternatives
        try {
          const simResponse = await fetch(`http://127.0.0.1:8000/api/player/${playerId}/similar`);
          if (simResponse.ok) {
            const simData = await simResponse.json();
            setSimilarPlayers(simData.data);
          }
        } catch (e) {
          console.error("Failed to fetch similar players", e);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (playerId) fetchDetails();
  }, [playerId]);

  if (!playerId) return null;

  const growthMultiplier = details ? (details.potential / details.overall) : 1;
  const radarData = details ? [
    { subject: 'PAC', current: details.pace, predicted: Math.min(99, Math.round(details.pace * growthMultiplier)) },
    { subject: 'SHO', current: details.shooting, predicted: Math.min(99, Math.round(details.shooting * growthMultiplier)) },
    { subject: 'PAS', current: details.passing, predicted: Math.min(99, Math.round(details.passing * growthMultiplier)) },
    { subject: 'DEF', current: details.defending, predicted: Math.min(99, Math.round(details.defending * growthMultiplier)) },
    { subject: 'PHY', current: details.physical, predicted: Math.min(99, Math.round(details.physical * growthMultiplier)) },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose}
      ></motion.div>

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-black border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 sm:p-10 transform transition-all custom-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full w-10 h-10 flex items-center justify-center transition-all hover:rotate-90 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && (
          <div className="py-32 flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-mono animate-pulse">Decrypting Athlete Data...</p>
          </div>
        )}

        {error && (
          <div className="py-32 text-center text-red-400 text-sm font-medium">
            System Error: {error}
          </div>
        )}

        {details && (
          <div className="relative">
            {/* Decorative Header Background */}
            <div className="absolute top-[-40px] left-[-40px] right-[-40px] h-40 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none rounded-t-3xl"></div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-zinc-800/60 pb-8 mb-8 relative z-10">
              <div className="relative shrink-0">
                 <div className="absolute inset-0 blur-2xl bg-emerald-500/20"></div>
                 <img 
                  src={details.photo_url || fallbackImage} 
                  alt={details.name} 
                  className="w-40 sm:w-56 h-auto object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] relative z-10"
                  onError={(e) => e.target.src = fallbackImage}
                />
              </div>
              <div className="text-center sm:text-left mt-4 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-bebas tracking-wide">
                    {details.name}
                  </h2>
                  <span className="inline-block self-center sm:self-auto bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-black text-sm tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    {details.overall} OVR
                  </span>
                </div>
                <p className="text-zinc-300 font-medium text-sm sm:text-base tracking-wide uppercase flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <span className="bg-zinc-800 px-2 py-1 rounded text-emerald-400 font-bold">{details.position}</span> 
                  <span>•</span> 
                  <span>{details.club || 'Free Agent'}</span> 
                  <span>•</span> 
                  <span>{details.age} Years Old</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatBox icon={<Activity />} label="Potential Range" value={`${Math.max(details.overall, details.potential - 2)}-${details.potential + 2}`} color="text-emerald-400" />
              <StatBox icon={<DollarSign />} label="Est. Value" value={`€${(details.value / 1000000).toFixed(1)}M`} color="text-emerald-400" />
              <StatBox icon={<DollarSign />} label="Est. Wage" value={`€${(details.wage / 1000).toFixed(1)}K`} color="text-emerald-400" />
              <StatBox icon={<Clock />} label="Peak Horizon" value={details.seasons_to_peak === 0 ? "Peak Reached" : `${details.seasons_to_peak} Seasons`} color="text-emerald-400" />
            </div>

            <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800/60 p-6 shadow-inner">
               <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm uppercase tracking-widest text-zinc-300 font-bold font-bebas">Attribute Growth Projection</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'Inter' }}
                    />
                    <Radar name="Current Base" dataKey="current" stroke="#ffffff" fill="#ffffff" fillOpacity={0.2} />
                    <Radar name="Projected Peak" dataKey="predicted" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-zinc-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white opacity-60"></div> Current Base</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500 opacity-60"></div> Projected Peak</div>
              </div>
            </div>
            
            {/* PlayStyles Panel */}
            {details.playstyles && (
              <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800/60 p-6 shadow-inner mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm uppercase tracking-widest text-zinc-300 font-bold font-bebas">PlayStyles</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {details.playstyles.split(',').map(ps => {
                    const style = ps.replace(/[\[\]']/g, '').trim();
                    if (!style || style === 'None') return null;
                    const isPlus = style.includes('+');
                    return (
                      <span key={style} className={`px-3 py-1.5 rounded-full text-xs font-bold ${isPlus ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'}`}>
                        {style}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Similar Alternatives */}
            {similarPlayers.length > 0 && (
              <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800/60 p-6 shadow-inner mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm uppercase tracking-widest text-zinc-300 font-bold font-bebas">Similar Alternatives</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarPlayers.map(p => (
                    <div 
                      key={p.player_id} 
                      onClick={() => onPlayerClick(p.player_id)}
                      className="bg-black/50 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors group"
                    >
                      <img 
                        src={p.photo_url || fallbackImage} 
                        alt={p.name} 
                        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" 
                        onError={(e) => e.target.src = fallbackImage} 
                      />
                      <div>
                        <h4 className="text-white font-bold text-sm leading-tight">{p.name}</h4>
                        <span className="text-emerald-400 text-xs font-black">{p.overall} OVR</span>
                        <p className="text-zinc-500 text-[10px] uppercase">{p.club}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 text-center hover:bg-zinc-800/60 transition-colors shadow-inner flex flex-col items-center">
      <div className="mb-2 text-zinc-500">{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>
      <span className="block text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">{label}</span>
      <span className={`text-xl font-black font-bebas ${color}`}>{value}</span>
    </div>
  );
}

export default PlayerModal;
