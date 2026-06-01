import dotenv from "dotenv";

dotenv.config();

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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { movieCd } = req.query;
    if (!movieCd) {
      return res.status(400).json({ error: "movieCd query parameter is required" });
    }

    const apiKey = process.env.KOBIS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "KOBIS_API_KEY environment variable is not configured in Vercel settings" });
    }

    const url = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie info: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in /api/movieinfo:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
