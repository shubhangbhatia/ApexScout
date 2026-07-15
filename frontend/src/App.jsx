import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, AlertCircle, LayoutGrid } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PlayerCard from './components/PlayerCard';
import PlayerModal from './components/PlayerModal';
import CompareModal from './components/CompareModal';
import Pagination from './components/Pagination';

function App() {
  const initialFilters = {
    name: '',
    position: '',
    max_price: 20000000,
    max_wage: 50000,
    max_age: 35,
    min_potential: 80,
    min_skill_moves: 1,
    min_weak_foot: 1,
    pre_contract_only: false,
    sort_by: 'potential',
    limit: 12,
    offset: 0
  };
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [shortlists, setShortlists] = useState(() => {
    const saved = localStorage.getItem('apex_scout_shortlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return { "Default": parsed };
        return parsed;
      } catch (e) {
        return { "Default": [] };
      }
    }
    return { "Default": [], "Summer Targets": [], "Youth Academy": [] };
  });
  
  const [activeShortlist, setActiveShortlist] = useState("Default");

  useEffect(() => {
    localStorage.setItem('apex_scout_shortlists', JSON.stringify(shortlists));
  }, [shortlists]);

  const toggleShortlist = (playerId, listName) => {
    setShortlists(prev => {
      const list = prev[listName] || [];
      if (list.includes(playerId)) {
        return { ...prev, [listName]: list.filter(id => id !== playerId) };
      } else {
        return { ...prev, [listName]: [...list, playerId] };
      }
    });
  };

  const toggleCompare = (id) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return [prev[1], id];
    });
  };

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (appliedFilters.name) queryParams.append('name', appliedFilters.name);
      if (appliedFilters.position) queryParams.append('position', appliedFilters.position);
      queryParams.append('max_price', appliedFilters.max_price);
      queryParams.append('max_wage', appliedFilters.max_wage);
      queryParams.append('max_age', appliedFilters.max_age);
      queryParams.append('min_potential', appliedFilters.min_potential);
      queryParams.append('min_skill_moves', appliedFilters.min_skill_moves);
      queryParams.append('min_weak_foot', appliedFilters.min_weak_foot);
      if (appliedFilters.pre_contract_only) queryParams.append('pre_contract_only', 'true');
      queryParams.append('sort_by', appliedFilters.sort_by);
      queryParams.append('limit', appliedFilters.limit);
      queryParams.append('offset', appliedFilters.offset);

      const response = await fetch(`http://127.0.0.1:8000/api/scout?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to connect to the scout engine.');
      
      const data = await response.json();
      if (data.status === 'success') {
        setPlayers(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || 'Data stream corrupted.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSearch = () => {
    const updated = { ...filters, offset: 0 };
    setFilters(updated);
    setAppliedFilters(updated);
  };

  const handlePageChange = (newOffset) => {
    const updated = { ...filters, offset: newOffset };
    setFilters(updated);
    setAppliedFilters(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative">
      <Sidebar 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={handleSearch} 
      />

      <main className="flex-1 p-6 lg:p-10 xl:p-12 w-full max-w-[1600px] mx-auto z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 pb-6 border-b border-zinc-800/60"
        >
          <div>
            <div className="flex items-center gap-3 mb-2 text-emerald-400">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-widest uppercase font-bebas">Live Feed</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white font-bebas">
              Scouted Targets 
            </h2>
            <p className="text-slate-400 mt-2 text-sm max-w-xl mb-4">
              Analyzing global database parameters.
            </p>
            <div className="flex flex-wrap gap-2">
               {Object.keys(shortlists).map(listName => (
                  <div key={listName} className="flex rounded-full overflow-hidden border border-zinc-800">
                    <button 
                      onClick={() => setActiveShortlist(listName)}
                      className={`px-3 py-1 text-xs font-bold transition-colors ${activeShortlist === listName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {listName} ({shortlists[listName].length})
                    </button>
                    {Object.keys(shortlists).length > 1 && (
                      <button 
                        onClick={() => {
                          if (window.confirm(`Delete shortlist "${listName}"?`)) {
                            setShortlists(prev => {
                              const newLists = { ...prev };
                              delete newLists[listName];
                              return newLists;
                            });
                            if (activeShortlist === listName) setActiveShortlist("Default");
                          }
                        }}
                        className="px-2 py-1 bg-zinc-900 text-zinc-600 hover:bg-red-500/20 hover:text-red-400 transition-colors border-l border-zinc-800"
                      >
                        ×
                      </button>
                    )}
                  </div>
               ))}
               <button 
                 onClick={() => {
                   const name = prompt("Enter new shortlist name:");
                   if (name && !shortlists[name]) {
                     setShortlists(prev => ({ ...prev, [name]: [] }));
                     setActiveShortlist(name);
                   }
                 }}
                 className="px-3 py-1 rounded-full text-xs font-bold border bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300 transition-colors"
               >
                 + New List
               </button>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800/60 backdrop-blur-md">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-mono text-zinc-300">
              {pagination ? `${pagination.total_records.toLocaleString()} Records` : 'Initializing...'}
            </span>
          </div>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="flex items-start gap-4 p-4 rounded-xl bg-red-950/40 border border-red-900/50 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-400">System Error</h4>
                  <p className="text-sm text-red-300/80 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="relative min-h-[500px]">
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20 rounded-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <p className="text-xs text-emerald-400 uppercase tracking-widest font-mono animate-pulse">Running Analytics...</p>
              </div>
            </motion.div>
          )}

          {!loading && players.length === 0 && !error && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-slate-500"
            >
              <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No profiles match the current parameters.</p>
            </motion.div>
          )}

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {players.map((player, index) => (
                <PlayerCard 
                  key={player.player_id} 
                  player={player} 
                  index={index}
                  shortlists={shortlists}
                  toggleShortlist={toggleShortlist}
                  isCompared={compareList.includes(player.player_id)}
                  toggleCompare={toggleCompare}
                  onOpenModal={setSelectedPlayerId}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="mt-12">
            <Pagination 
              pagination={pagination} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedPlayerId && (
          <PlayerModal 
            playerId={selectedPlayerId} 
            onClose={() => setSelectedPlayerId(null)} 
            onPlayerClick={setSelectedPlayerId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => compareList.length === 2 ? setShowCompareModal(true) : null}
              disabled={compareList.length < 2}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-2xl transition-all ${compareList.length === 2 ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer scale-100 hover:scale-105' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
              {compareList.length === 2 ? 'Compare Selected (2/2)' : 'Select 1 More to Compare (1/2)'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompareModal && compareList.length === 2 && (
          <CompareModal 
            playerIds={compareList} 
            onClose={() => setShowCompareModal(false)} 
            onClear={() => {
              setShowCompareModal(false);
              setCompareList([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
