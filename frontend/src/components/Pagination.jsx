import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total_records === 0) return null;

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total_records / pagination.limit);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-4 shadow-xl">
      <span className="text-sm text-zinc-400 font-medium mb-4 sm:mb-0">
        Showing <strong className="text-white font-bebas">{pagination.offset + 1}</strong> to <strong className="text-white font-bebas">{Math.min(pagination.offset + pagination.limit, pagination.total_records)}</strong> of <strong className="text-emerald-400 font-bebas">{pagination.total_records.toLocaleString()}</strong> profiles
      </span>
      
      <div className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={pagination.offset === 0}
          onClick={() => onPageChange(pagination.offset - pagination.limit)}
          className="p-2 text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 transition shadow-inner border border-zinc-700/50"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div className="px-4 py-2 text-sm font-bold text-white font-bebas">
          <span className="text-zinc-400 font-medium mr-1">Page</span>
          {currentPage} <span className="text-zinc-500 font-medium mx-1">of</span> {totalPages}
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!pagination.has_more}
          onClick={() => onPageChange(pagination.offset + pagination.limit)}
          className="p-2 text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 transition shadow-inner border border-zinc-700/50"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default Pagination;
