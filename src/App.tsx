import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import BoxOfficeList from "./components/BoxOfficeList";
import MovieDetail from "./components/MovieDetail";
import LoadingOverlay from "./components/LoadingOverlay";
import { DailyBoxOffice, MovieInfo } from "./types";
import { Film, Info, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  // Helper to compute yesterday's date in YYYY-MM-DD format
  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const yesterdayStr = getYesterdayDateString();

  // State Management
  const [selectedDate, setSelectedDate] = useState<string>(yesterdayStr);
  const [boxOfficeList, setBoxOfficeList] = useState<DailyBoxOffice[]>([]);
  const [loadingBoxOffice, setLoadingBoxOffice] = useState<boolean>(true);
  const [errorBoxOffice, setErrorBoxOffice] = useState<string | null>(null);

  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [selectedMovieNm, setSelectedMovieNm] = useState<string>("");
  const [movieDetail, setMovieDetail] = useState<MovieInfo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Helper: Format date from YYYY-MM-DD to YYYYMMDD
  const formatToKobisDate = (dateStr: string) => {
    return dateStr.replace(/-/g, "");
  };

  // Fetch Box Office Lists
  const fetchBoxOffice = async (date: string) => {
    setLoadingBoxOffice(true);
    setErrorBoxOffice(null);
    setBoxOfficeList([]);
    setSelectedMovieCd(null);
    setMovieDetail(null);

    const formattedDate = formatToKobisDate(date);
    try {
      const response = await fetch(`/api/boxoffice?targetDt=${formattedDate}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `서버 에러 (${response.status})`);
      }
      
      const data = await response.json();
      const list = data.boxOfficeResult?.dailyBoxOfficeList || [];
      setBoxOfficeList(list);

      // Auto-select #1 ranked movie on successful fetch
      if (list.length > 0) {
        setSelectedMovieCd(list[0].movieCd);
        setSelectedMovieNm(list[0].movieNm);
      }
    } catch (err: any) {
      console.error(err);
      setErrorBoxOffice(err.message || "데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoadingBoxOffice(false);
    }
  };

  // Fetch Movie Details
  const fetchMovieDetail = async (movieCd: string) => {
    setLoadingDetail(true);
    setErrorDetail(null);
    setMovieDetail(null);

    try {
      const response = await fetch(`/api/movieinfo?movieCd=${movieCd}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `서버 에러 (${response.status})`);
      }

      const data = await response.json();
      const detail = data.movieInfoResult?.movieInfo || null;
      setMovieDetail(detail);
    } catch (err: any) {
      console.error(err);
      setErrorDetail(err.message || "영화 상세 정보를 가져오는데 실패했습니다.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Trigger Box Office Fetch when Date changes
  useEffect(() => {
    fetchBoxOffice(selectedDate);
  }, [selectedDate]);

  // Trigger Detail Fetch when MovieCd changes
  useEffect(() => {
    if (selectedMovieCd) {
      fetchMovieDetail(selectedMovieCd);
    } else {
      setMovieDetail(null);
    }
  }, [selectedMovieCd]);

  const handleSelectMovie = (movieCd: string, movieNm: string) => {
    setSelectedMovieCd(movieCd);
    setSelectedMovieNm(movieNm);

    // Smooth scroll to details on small devices
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const detailEl = document.getElementById("movie-details-section");
        if (detailEl) {
          detailEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-zinc-100 font-sans antialiased selection:bg-[#E50914]/20 selection:text-[#E50914]">
      {/* Header and Filter */}
      <Header
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
        maxDate={yesterdayStr}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Box Office List (5 Columns) */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 uppercase">
                  <Film className="h-4 w-4 text-[#E50914]" />
                  박스오피스 순위
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">상위 10개 실시간 영진위 집계 리스트</p>
              </div>

              {/* Retry Button */}
              <button
                onClick={() => fetchBoxOffice(selectedDate)}
                disabled={loadingBoxOffice}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition active:scale-95 disabled:opacity-40"
                id="btn-refresh-box-office"
                title="새로고침"
              >
                <RefreshCw className={`h-3 w-3 ${loadingBoxOffice ? "animate-spin" : ""}`} />
                <span>새로고침</span>
              </button>
            </div>

            {loadingBoxOffice ? (
              <LoadingOverlay />
            ) : errorBoxOffice ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">데이터 로드 불가</h3>
                  <p className="mt-1 text-xs text-zinc-400 max-w-sm">{errorBoxOffice}</p>
                </div>
                <button
                  onClick={() => fetchBoxOffice(selectedDate)}
                  className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition"
                >
                  다시 시도하기
                </button>
              </div>
            ) : (
              <BoxOfficeList
                list={boxOfficeList}
                selectedMovieCd={selectedMovieCd}
                onSelectMovie={handleSelectMovie}
              />
            )}
          </section>

          {/* RIGHT: Selected Movie Details (7 Columns) */}
          <section
            id="movie-details-section"
            className="lg:col-span-7 flex flex-col gap-5 scroll-mt-20"
          >
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 uppercase">
                <Info className="h-4 w-4 text-[#E50914]" />
                선택 영화 상세 분석
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">선택한 영화에 대한 상세 스태프, 배우 및 개봉국 정보</p>
            </div>

            <MovieDetail
              movieNm={selectedMovieNm}
              movieInfo={movieDetail}
              loading={loadingDetail}
              error={errorDetail}
            />
          </section>

        </div>
      </main>

      {/* Humble Elegant Footer Footer */}
      <footer className="border-t border-white/5 bg-[#0F1115] py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Kobis Boxoffice. DATA SOURCE: KOREAN FILM COUNCIL (KOBIS)</p>
          <div className="flex gap-4 text-[11px] text-zinc-500 font-mono">
            <span>SECURE_KEY: ******4D92</span>
            <span className="text-zinc-800">|</span>
            <span>SYSTEM_UPTIME: 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
