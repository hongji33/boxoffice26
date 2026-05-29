import React from "react";
import { Clapperboard, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface HeaderProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  maxDate: string;
}

export default function Header({ selectedDate, onChangeDate, maxDate }: HeaderProps) {
  // Navigation days
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    onChangeDate(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    if (selectedDate === maxDate) return;
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    onChangeDate(`${year}-${month}-${day}`);
  };

  const formatKoreanDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0F1115]/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20">
            <Clapperboard className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl uppercase">
              Kobis <span className="text-[#E50914]">Boxoffice</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">REAL-TIME THEATER INSIGHTS</p>
          </div>
        </div>

        {/* Date Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Back 1 day */}
          <button
            onClick={handlePrevDay}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
            title="이전날"
            id="btn-prev-day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Date Picker Input Group */}
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 text-zinc-400">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              value={selectedDate}
              max={maxDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="h-10 w-44 rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm font-bold text-white outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition"
              id="date-picker-input"
            />
          </div>

          {/* Forward 1 day */}
          <button
            onClick={handleNextDay}
            disabled={selectedDate === maxDate}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
              selectedDate === maxDate
                ? "opacity-20 cursor-not-allowed border-white/5 bg-transparent text-zinc-600"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white active:scale-95"
            }`}
            title="다음날"
            id="btn-next-day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Korean friendly display */}
          <div className="hidden lg:block ml-2 text-sm font-bold text-zinc-300 pl-3 border-l border-white/10">
            {formatKoreanDate(selectedDate)}
          </div>
        </div>
      </div>
    </header>
  );
}
