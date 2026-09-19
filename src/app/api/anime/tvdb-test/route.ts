import { NextResponse } from "next/server";

import { getTVDBLocalizedMetadata } from "@/lib/anime/providers/tvdb";
import { TVDB_LANGUAGE_CODES } from "@/lib/anime/tvdbLanguages";

export async function GET() {
  const title = {
    romaji: "Sousou no Frieren",

    english: "Frieren: Beyond Journey's End",

    native: "葬送のフリーレン",

    synonyms: ["Frieren", "Sōsō no Furīren", "Sousou no Frieren"],
  };

  const metadata = await getTVDBLocalizedMetadata(title, TVDB_LANGUAGE_CODES);

  return NextResponse.json({
    title,
    metadata,
  });
}
