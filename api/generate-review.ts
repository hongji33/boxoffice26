import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const rawApiKey = process.env.GEMINI_API_KEY || "";
const cleanApiKey = rawApiKey.includes(" ") ? rawApiKey.split(" ")[0].trim() : rawApiKey.trim();

const ai = new GoogleGenAI({
  apiKey: cleanApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { movieNm, movieInfo, shortComment } = req.body;
    if (!movieNm || !shortComment) {
      return res.status(400).json({ error: "movieNm and shortComment are required properties" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured in Vercel settings" });
    }

    const genres = movieInfo?.genres?.map((g: any) => g.genreNm).join(", ") || "정보 없음";
    const nations = movieInfo?.nations?.map((n: any) => n.nationNm).join(", ") || "정보 없음";
    const directors = movieInfo?.directors?.map((d: any) => d.peopleNm).join(", ") || "정보 없음";
    const actors = movieInfo?.actors?.slice(0, 8).map((a: any) => a.peopleNm).join(", ") || "정보 없음";
    const prdtYear = movieInfo?.prdtYear || "정보 없음";
    const showTm = movieInfo?.showTm || "정보 없음";

    const prompt = `당신은 최고의 영화 평론가이자 전문 에디터입니다.
영화 "${movieNm}"의 상세 정보와 사용자가 입력한 짧은 감상평을 바탕으로, 깊이 있고 몰입감 넘치는 상세 감상평(영화 리뷰)을 한국어로 작성해 주세요.

[영화 정보]
- 영화 제목: ${movieNm}
- 제작년도: ${prdtYear}년
- 상영시간: ${showTm}분
- 제작 국가: ${nations}
- 장르: ${genres}
- 감독: ${directors}
- 배우: ${actors}

[사용자의 한줄평 / 키워드]
"${shortComment}"

상세 감상평은 다음의 구성을 갖추어 읽기 쉽고 매력 넘치는 영화 에세이 스타일로 작성해 주십시오:
1. **매력적인 에세이 제목** (영화의 핵심 톤을 영리하게 관통하는 참신한 제목)
2. **시선과 분위기** (이 영화가 가진 고유한 개성과 연출 스타일, 배우진들의 연기 인상에 대한 전문적인 분석)
3. **심층 해석 (감상의 확장)** (사용자가 제공한 한줄평/키워드 "${shortComment}"를 적극적으로 확대 해석하고 가치를 덧붙이며 전하는 리뷰)
4. **평론가 총평 및 한줄 별점** (예: ★★★★☆ 4.5 / 5.0)

문단마다 줄바꿈을 적절히 사용하여 모바일 및 데스크톱 브라우저에서 읽기 쉽고 세련되게 작성하십시오. 답변에 "네 작성해 드리겠습니다" 같은 불필요한 서론/결문은 모두 빼고 오직 리뷰 본문 마크다운만 바로 출력합니다.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
    } catch (firstError: any) {
      console.warn("First attempt with gemini-3.5-flash failed, trying fallback gemini-flash-latest...", firstError);
      try {
        response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
        });
      } catch (secondError: any) {
        console.warn("Second attempt with gemini-flash-latest failed, trying fallback gemini-3.1-flash-lite...", secondError);
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
        });
      }
    }

    res.status(200).json({ review: response.text });
  } catch (error: any) {
    console.error("Error in /api/generate-review:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
