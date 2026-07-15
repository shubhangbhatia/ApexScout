import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { X, Trash2, Activity, DollarSign, TrendingUp, Clock } from 'lucide-react';

function CompareModal({ playerIds, onClose, onClear }) {
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/player/${playerIds[0]}`),
          fetch(`http://127.0.0.1:8000/api/player/${playerIds[1]}`)
        ]);
        
        if (!res1.ok || !res2.ok) throw new Error('Failed to fetch comparison data');
        
        const data1 = await res1.json();
        const data2 = await res2.json();
        
        setP1(data1.data);
        setP2(data2.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (playerIds && playerIds.length === 2) fetchDetails();
  }, [playerIds]);

  if (!playerIds || playerIds.length !== 2) return null;

  const radarData = (p1 && p2) ? [
    { subject: 'PAC', p1: p1.pace, p2: p2.pace },
    { subject: 'SHO', p1: p1.shooting, p2: p2.shooting },
    { subject: 'PAS', p1: p1.passing, p2: p2.passing },
    { subject: 'DEF', p1: p1.defending, p2: p2.defending },
    { subject: 'PHY', p1: p1.physical, p2: p2.physical },
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
        className="relative bg-black border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 sm:p-10 transform transition-all custom-scrollbar flex flex-col"
      >
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <button 
            onClick={onClear}
            className="text-red-400 hover:text-white bg-red-950/50 hover:bg-red-900/80 border border-red-900/50 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            title="Clear Comparison"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full w-10 h-10 flex items-center justify-center transition-all hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="py-32 flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-mono animate-pulse">Running Head-to-Head Analytics...</p>
          </div>
        )}

        {error && (
          <div className="py-32 text-center text-red-400 text-sm font-medium">
            System Error: {error}
          </div>
        )}

        {p1 && p2 && (
          <div className="relative">
            {/* Header: Two Players side-by-side */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-stretch gap-8 mb-12 border-b border-zinc-800/60 pb-8">
              
              {/* Player 1 */}
              <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
                <div className="relative mb-4">
                  <div className="absolute inset-0 blur-2xl bg-emerald-500/10"></div>
                  <img src={p1.photo_url || fallbackImage} alt={p1.name} className="w-32 h-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] relative z-10" onError={(e) => e.target.src = fallbackImage} />
                </div>
                <h2 className="text-3xl font-black text-emerald-400 font-bebas tracking-wide mb-2">{p1.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-zinc-800 px-2 py-1 rounded text-white text-xs font-bold uppercase">{p1.position}</span>
                  <span className="text-zinc-400 text-sm uppercase font-bold">{p1.club} • {p1.age}yo</span>
                </div>
                <div className="text-white font-black text-xl">
                  {p1.overall} <span className="text-zinc-500 text-sm">OVR</span>
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-zinc-700 font-black text-5xl italic font-bebas tracking-wider">VS</span>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center md:items-end flex-1 text-center md:text-right">
                <div className="relative mb-4">
                  <div className="absolute inset-0 blur-2xl bg-white/10"></div>
                  <img src={p2.photo_url || fallbackImage} alt={p2.name} className="w-32 h-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] relative z-10" onError={(e) => e.target.src = fallbackImage} />
                </div>
                <h2 className="text-3xl font-black text-white font-bebas tracking-wide mb-2">{p2.name}</h2>
                <div className="flex flex-row-reverse md:flex-row items-center justify-center md:justify-end gap-2 mb-2 w-full">
                  <span className="text-zinc-400 text-sm uppercase font-bold text-center md:text-right">{p2.club} • {p2.age}yo</span>
                  <span className="bg-zinc-800 px-2 py-1 rounded text-white text-xs font-bold uppercase shrink-0">{p2.position}</span>
                </div>
                <div className="text-white font-black text-xl">
                  {p2.overall} <span className="text-zinc-500 text-sm">OVR</span>
                </div>
              </div>

            </div>

            {/* Radar Chart & Stats */}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Chart */}
              <div className="flex-1 w-full bg-zinc-950/50 rounded-2xl border border-zinc-800/60 p-6 shadow-inner min-h-[400px] flex flex-col justify-center relative">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'Inter' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#a1a1aa' }} />
                    <Radar name={p1.name} dataKey="p1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Radar name={p2.name} dataKey="p2" stroke="#ffffff" fill="#ffffff" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Side-by-side stats */}
              <div className="w-full lg:w-[40%] flex flex-col gap-3">
                <StatCompare label="Potential" val1={p1.potential} val2={p2.potential} />
                <StatCompare label="Est. Value" val1={`€${(p1.value/1000000).toFixed(1)}M`} val2={`€${(p2.value/1000000).toFixed(1)}M`} isCurrency />
                <StatCompare label="Est. Wage" val1={`€${(p1.wage/1000).toFixed(1)}K`} val2={`€${(p2.wage/1000).toFixed(1)}K`} isCurrency />
                <StatCompare label="Growth" val1={`+${p1.growth_expected}`} val2={`+${p2.growth_expected}`} />
                <StatCompare label="Time to Peak" val1={`${p1.seasons_to_peak}y`} val2={`${p2.seasons_to_peak}y`} reverse />
              </div>

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCompare({ label, val1, val2, isCurrency, reverse }) {
  // Determine winner for simple numeric comparison if possible
  let v1 = parseFloat(String(val1).replace(/[^0-9.-]+/g,""));
  let v2 = parseFloat(String(val2).replace(/[^0-9.-]+/g,""));
  
  let w1 = false;
  let w2 = false;

  if (!isNaN(v1) && !isNaN(v2) && v1 !== v2) {
    if (reverse) {
      w1 = v1 < v2;
      w2 = v2 < v1;
    } else {
      w1 = v1 > v2;
      w2 = v2 > v1;
    }
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex justify-between items-center text-center">
      <div className={`flex-1 font-black text-xl font-bebas ${w1 ? 'text-emerald-400' : 'text-zinc-400'}`}>
        {val1}
      </div>
      <div className="flex-1 text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2">
        {label}
      </div>
      <div className={`flex-1 font-black text-xl font-bebas ${w2 ? 'text-white' : 'text-zinc-400'}`}>
        {val2}
      </div>
    </div>
  );
}

export default CompareModal;
