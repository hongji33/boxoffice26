import React from "react";
import { Loader2, Clapperboard } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* Spinner */}
        <Loader2 className="h-10 w-10 animate-spin text-[#E50914]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Clapperboard className="h-4 w-4 text-[#E50914]/80" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">영화 데이터 불러오는 중</h3>
        <p className="mt-1 text-xs text-zinc-400">대용량 한국영화 데이터베이스(KOBIS)에서 정보를 실시간으로 조회하고 있습니다.</p>
      </div>
    </div>
  );
}
