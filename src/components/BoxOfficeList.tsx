import React from "react";
import { DailyBoxOffice } from "../types";
import { TrendingUp, TrendingDown, Minus, Sparkles, Flame, Eye } from "lucide-react";
import { motion } from "motion/react";

interface BoxOfficeListProps {
  list: DailyBoxOffice[];
  selectedMovieCd: string | null;
  onSelectMovie: (movieCd: string, movieNm: string) => void;
}

export default function BoxOfficeList({ list, selectedMovieCd, onSelectMovie }: BoxOfficeListProps) {
  const formatNumber = (numStr: string, suffix = "") => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return numStr;
    return num.toLocaleString("ko-KR") + suffix;
  };

  const renderRankChange = (item: DailyBoxOffice) => {
    if (item.rankOldAndNew === "NEW") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-[#FFD700]/10 px-1.5 py-0.5 text-[10px] font-black uppercase status-new animate-pulse ring-1 ring-[#FFD700]/10">
          <Sparkles className="h-3 w-3" /> New
        </span>
      );
    }

    const inten = parseInt(item.rankInten, 10);
    if (isNaN(inten) || inten === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
          <Minus className="h-3.5 w-3.5" /> 유지
        </span>
      );
    }

    if (inten > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold status-up">
          <TrendingUp className="h-3.5 w-3.5" /> {inten}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold status-down">
        <TrendingDown className="h-3.5 w-3.5" /> {Math.abs(inten)}
      </span>
    );
  };

  if (list.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01] p-8 text-center text-zinc-500">
        <p className="text-sm font-medium">해당 날짜의 박스오피스 리스트가 없습니다.</p>
      </div>
    );
  }

  // Animation variants for entering list
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
      id="box-office-list-container"
    >
      {list.map((item) => {
        const isSelected = item.movieCd === selectedMovieCd;
        return (
          <motion.div
            key={item.movieCd}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectMovie(item.movieCd, item.movieNm)}
            className={`group rank-card relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all duration-250 ${
              isSelected
                ? "border-[#E50914] bg-[#E50914]/[0.04] ring-1 ring-[#E50914] shadow-lg shadow-[#E50914]/5"
                : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
            }`}
            id={`movie-card-${item.movieCd}`}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              {/* Rank & Change Badge */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg font-black italic shadow-inner select-none ${
                    isSelected
                      ? "bg-[#E50914] text-white"
                      : "bg-white/5 text-zinc-100"
                  }`}
                >
                  {item.rank}
                </div>
                {renderRankChange(item)}
              </div>

              {/* Share of Sales Badge */}
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Sales Share
              </div>
            </div>

            {/* Movie Title & Open Date */}
            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-red-500 transition pr-6 line-clamp-1">
                {item.movieNm}
              </h3>
              <p className="mt-0.5 text-[11px] text-zinc-500 font-medium">개봉일: {item.openDt || "정보 없음"}</p>
            </div>

            {/* Sales Share Progress Bar */}
            <div className="mt-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>매출 점유율</span>
                <span className="font-bold text-white">{item.salesShare}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-[#E50914]" : "bg-zinc-600"}`} 
                  style={{ width: `${item.salesShare}%` }}
                ></div>
              </div>
            </div>

            {/* Audience Stats footer */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Eye className="h-3.5 w-3.5 text-zinc-600" />
                <span className="text-[11px]">
                  일일 <strong className="font-bold text-zinc-200">{formatNumber(item.audiCnt, "명")}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Flame className="h-3.5 w-3.5 text-[#E50914]/70" />
                <span className="text-[11px]">
                  누적 <strong className="font-bold text-red-100/90">{formatNumber(item.audiAcc, "명")}</strong>
                </span>
              </div>
            </div>

            {/* Selected glow indicator */}
            {isSelected && (
              <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#E50914] animate-pulse" />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
