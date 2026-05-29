import React, { useState, useEffect } from "react";
import { MovieInfo } from "../types";
import {
  Film,
  Clock,
  Calendar,
  Globe,
  Award,
  Users,
  Building2,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  PencilLine,
  Check,
  Copy,
  RotateCcw,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";

interface MovieDetailProps {
  movieNm: string;
  movieInfo: MovieInfo | null;
  loading: boolean;
  error: string | null;
}

export default function MovieDetail({ movieNm, movieInfo, loading, error }: MovieDetailProps) {
  // Helper to format open date (e.g., 20240424 -> 2024년 04월 24일)
  const formatOpenDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
  };

  // Google Search query link helper
  const getGoogleSearchUrl = (title: string, year: string) => {
    const q = encodeURIComponent(`${title} 영화 ${year}`);
    return `https://www.google.com/search?q=${q}`;
  };

  // State for AI Review Generator
  const [isWriting, setIsWriting] = useState(false);
  const [shortComment, setShortComment] = useState("");
  const [generatedReview, setGeneratedReview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReviewError, setAiReviewError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset reviewer state when movie changes
  const movieCdForEffect = movieInfo?.movieCd;
  useEffect(() => {
    setIsWriting(false);
    setShortComment("");
    setGeneratedReview("");
    setAiReviewError(null);
    setCopied(false);
  }, [movieCdForEffect]);

  const handleGenerateReview = async () => {
    if (!shortComment.trim()) return;
    setIsGenerating(true);
    setAiReviewError(null);
    setGeneratedReview("");

    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieNm,
          movieInfo,
          shortComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "상세 감상평 생성 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setGeneratedReview(data.review || "");
    } catch (err: any) {
      console.error(err);
      setAiReviewError(err.message || "상세 감상평을 작성하지 못했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe custom Markdown formatter to ensure elegant structure without package crashes
  const renderFormattedReview = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="mt-4 mb-1 text-xs font-extrabold text-[#E50914] tracking-wider uppercase font-mono">
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="mt-5 mb-2 text-sm font-black text-white uppercase tracking-tight">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.")) {
        return (
          <h4 key={idx} className="mt-4 mb-2 text-xs font-bold text-white border-b border-white/5 pb-1 flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-red-600/20 text-red-500 text-[9px] font-black">{trimmed.substring(0, 2)}</span>
            <span>{trimmed.substring(2).replace(/\*\*/g, "")}</span>
          </h4>
        );
      }

      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="ml-3 list-disc text-[11px] text-zinc-400 leading-relaxed my-1">
            {trimmed.replace(/^[-*]\s*/, "").replace(/\*\*/g, "")}
          </li>
        );
      }

      const parts = trimmed.split("**");
      if (parts.length > 1) {
        return (
          <p key={idx} className="text-[11px] text-zinc-300 leading-relaxed my-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold text-white">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      return (
        <p key={idx} className="text-[11px] text-zinc-300 leading-relaxed my-2">
          {trimmed}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 animate-pulse">
        {/* Placeholder title */}
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="h-8 w-2/3 rounded bg-zinc-800" />
          <div className="h-4 w-1/2 rounded bg-zinc-800" />
        </div>
        <hr className="border-zinc-800" />
        {/* Skeleton grid */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 w-16 rounded bg-zinc-800" />
              <div className="h-5 w-24 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
        <hr className="border-zinc-800" />
        {/* Skeleton lists */}
        <div className="flex flex-col gap-3">
          <div className="h-4 w-1/3 rounded bg-zinc-800" />
          <div className="h-12 w-full rounded bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 w-1/3 rounded bg-zinc-800" />
          <div className="h-20 w-full rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/25">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">영화 정보 조회 실패</h4>
          <p className="mt-1 text-xs text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!movieInfo) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/15 p-6 text-center text-zinc-500">
        <Film className="h-8 w-8 text-zinc-600 animate-pulse" />
        <div className="text-xs">
          <p className="font-semibold text-zinc-400">영화 상세 분석</p>
          <p className="mt-1">좌측 박스오피스 목록에서 영화를 선택하면 상세 영화 정보가 표시됩니다.</p>
        </div>
      </div>
    );
  }

  const {
    movieCd,
    movieNmEn,
    movieNmOg,
    showTm,
    openDt,
    prdtYear,
    genres,
    nations,
    directors,
    actors,
    audits,
    companys,
  } = movieInfo;

  const genresStr = genres.map((g) => g.genreNm).join(", ") || "정보 없음";
  const nationsStr = nations.map((n) => n.nationNm).join(", ") || "정보 없음";
  const watchGrade = audits[0]?.watchGradeNm || "정보 없음";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 rounded-2xl glass p-5 sm:p-6"
      id={`movie-detail-${movieCd}`}
    >
      {/* Title block */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E50914]/10 px-2.5 py-0.5 text-xs font-bold text-[#E50914] ring-1 ring-[#E50914]/20 uppercase font-mono">
          Code {movieCd}
        </div>
        <h2 className="mt-2.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {movieNm}
        </h2>
        {movieNmEn && (
          <p className="mt-1 text-xs font-medium text-zinc-400 sm:text-sm italic">
            {movieNmEn} {movieNmOg ? `(${movieNmOg})` : ""}
          </p>
        )}
      </div>

      <hr className="border-white/5" />

      {/* Main Grid Info */}
      <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5">
            <Calendar className="h-4 w-4 text-[#E50914]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Release Year</p>
            <p className="mt-0.5 font-bold text-zinc-200">
              {formatOpenDate(openDt) || "미개봉"} <span className="text-zinc-500 font-normal">({prdtYear}년)</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5">
            <Clock className="h-4 w-4 text-[#E50914]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Runtime</p>
            <p className="mt-0.5 font-bold text-zinc-200">{showTm ? `${showTm}분` : "정보 없음"}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5">
            <Globe className="h-4 w-4 text-[#E50914]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Country</p>
            <p className="mt-0.5 font-bold text-zinc-200">{nationsStr}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5">
            <Award className="h-4 w-4 text-[#E50914]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Advisory Grade</p>
            <p className="mt-0.5 font-bold text-red-500 text-xs sm:text-sm uppercase tracking-wide">{watchGrade}</p>
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Genre Section */}
      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Genre</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {genres.length > 0 ? (
            genres.map((g) => (
              <span
                key={g.genreNm}
                className="rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              >
                {g.genreNm}
              </span>
            ))
          ) : (
            <span className="text-xs text-zinc-500">정보 없음</span>
          )}
        </div>
      </div>

      {/* Director & Actors */}
      <div className="space-y-4">
        {/* Directors */}
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Directors</p>
          <div className="mt-2 flex flex-col gap-2">
            {directors.length > 0 ? (
              directors.map((d) => (
                <div key={d.peopleNm} className="flex items-center justify-between rounded-lg bg-white/[0.01] p-2.5 border border-white/5">
                  <div className="text-xs font-bold text-zinc-200">{d.peopleNm}</div>
                  {d.peopleNmEn && (
                    <div className="text-[11px] text-zinc-500 italic font-semibold">{d.peopleNmEn}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">지정된 감독 정보 없음</p>
            )}
          </div>
        </div>

        {/* Actors */}
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Featured Cast</p>
          <div className="mt-2 max-h-56 overflow-y-auto pr-1">
            {actors.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {actors.map((a, idx) => (
                  <div
                    key={`${a.peopleNm}-${idx}`}
                    className="rounded-lg border border-white/5 bg-white/[0.01] p-2.5 hover:bg-white/[0.03] transition"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-200">
                      <span>{a.peopleNm}</span>
                      {a.cast && <span className="text-[10px] text-red-400 font-semibold">역 {a.cast}</span>}
                    </div>
                    {a.peopleNmEn && (
                      <p className="mt-0.5 text-[10px] text-zinc-500 font-medium truncate" title={a.peopleNmEn}>
                        {a.peopleNmEn}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">배우 정보 없음</p>
            )}
          </div>
        </div>

        {/* Production/Distribution Companies */}
        {companys.length > 0 && (
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Companies</p>
            <div className="mt-2 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {companys.map((c, idx) => (
                <div
                  key={`${c.companyNm}-${idx}`}
                  className="flex items-center gap-1.5 rounded bg-white/[0.02] px-2 py-1 text-[11px] text-zinc-300 border border-white/5"
                >
                  <Building2 className="h-3 w-3 text-zinc-600" />
                  <span>
                    {c.companyNm} <strong className="text-zinc-500 text-[10px] font-normal">[{c.companyPartNm}]</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="border-white/5 mt-auto" />

      {/* Gemini AI Detailed Review Writer */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#E50914] animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI Detailed Review Generator</h4>
          </div>
          {generatedReview && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:bg-white/10 active:scale-95 transition"
              title="리뷰 복사"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-400 font-bold">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>복사하기</span>
                </>
              )}
            </button>
          )}
        </div>

        {!isWriting ? (
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/5 hover:border-[#E50914]/45 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition group active:scale-[0.99]"
            id="btn-show-review-form"
          >
            <PencilLine className="h-3.5 w-3.5 text-zinc-500 group-hover:text-[#E50914] transition" />
            <span>AI 감상평 쓰기 (영화 평론 생성)</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full h-20 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-zinc-200 outline-none placeholder-zinc-600 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition resize-none leading-relaxed"
              placeholder="예: 주연 배우들의 연기 합이 눈부셨고, 후반부 반전이 가슴을 울렸습니다."
              value={shortComment}
              onChange={(e) => setShortComment(e.target.value)}
              disabled={isGenerating}
              maxLength={200}
            />
            
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>최대 200자 입력</span>
              <span>{shortComment.length}/200</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsWriting(false);
                  setShortComment("");
                  setGeneratedReview("");
                  setAiReviewError(null);
                }}
                disabled={isGenerating}
                className="flex-1 rounded-lg border border-white/5 bg-transparent py-2 text-center text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-white/5 disabled:opacity-40 active:scale-[0.98] transition"
              >
                취소
              </button>
              <button
                onClick={handleGenerateReview}
                disabled={isGenerating || !shortComment.trim()}
                className="flex-[2] flex justify-center items-center gap-1.5 rounded-lg bg-[#E50914] py-2 text-center text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40 active:scale-[0.98] transition shadow-md shadow-[#E50914]/15"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>한줄평 분석 및 평론 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>상세 감상평 생성</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Error Alert */}
        {aiReviewError && (
          <div className="rounded-lg border border-red-500/10 bg-red-500/[0.02] p-3 text-xs text-red-400 leading-relaxed font-semibold">
            {aiReviewError}
          </div>
        )}

        {/* Display Generated Detailed Review */}
        {generatedReview && (
          <div className="mt-2 rounded-lg bg-black/40 border border-white/5 p-4 max-h-72 overflow-y-auto selection:bg-[#E50914]/30 scrollbar-thin">
            <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-white/5">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 font-mono tracking-wider uppercase">Gemini AI REVIEW GENERATED</span>
            </div>
            <div className="space-y-1">
              {renderFormattedReview(generatedReview)}
            </div>
          </div>
        )}
      </div>

      {/* External Search Link */}
      <a
        href={getGoogleSearchUrl(movieNm, prdtYear)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-2.5 text-center text-sm font-black text-white hover:bg-red-700 active:scale-98 transition shadow-lg shadow-red-600/10"
        id={`search-google-${movieCd}`}
      >
        <span>Google에서 영화 정보 더 알아보기</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    </motion.div>
  );
}
