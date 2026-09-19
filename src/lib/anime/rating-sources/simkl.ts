import type { CanonicalAnime } from "../types";
import { createRating } from "../ratings";

import type { RatingSource } from "./types";

const SIMKL_API_BASE = "https://api.simkl.com";
const SIMKL_APP_NAME = "Anime Consensus";
const SIMKL_APP_VERSION = "0.1.0";

type SimklAnimeResponse = {
  id?: number;
  slug?: string;

  ids?: {
    simkl?: number | string;
    mal?: number | string;
  };

  ratings?: {
    simkl?: {
      rating?: number | null;
      votes?: number | null;
    } | null;
  } | null;
};

function getSimklApiParams(clientId: string) {
  return new URLSearchParams({
    client_id: clientId,
    "app-name": SIMKL_APP_NAME,
    "app-version": SIMKL_APP_VERSION,
  });
}

async function resolveSimklIdByMalId(
  malId: number,
  clientId: string,
): Promise<number | null> {
  const params = getSimklApiParams(clientId);

  params.set("mal", String(malId));
  params.set("type", "anime");
  params.set("to", "simkl");

  const url = `${SIMKL_API_BASE}/redirect?${params.toString()}`;

  console.info("[Simkl] Resolving Simkl ID.", {
    malId,
    url: `${SIMKL_API_BASE}/redirect?mal=${malId}&type=anime&to=simkl`,
  });

  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      Accept: "application/json",
      "User-Agent": `${SIMKL_APP_NAME}/${SIMKL_APP_VERSION}`,
      "simkl-api-key": clientId,
    },
    next: {
      revalidate: 3600,
    },
  });

  const location = response.headers.get("location");

  if (!location) {
    const body = await response.text();

    console.warn("[Simkl] Could not resolve Simkl ID.", {
      malId,
      status: response.status,
      statusText: response.statusText,
      body: body.slice(0, 500),
    });

    return null;
  }

  const normalizedLocation = location.startsWith("//")
    ? `https:${location}`
    : location;

  const match = normalizedLocation.match(/\/anime\/(\d+)(?:\/|$|\?)/);

  if (!match) {
    console.warn("[Simkl] Redirect did not contain an anime ID.", {
      malId,
      location: normalizedLocation,
    });

    return null;
  }

  const simklId = Number(match[1]);

  if (!Number.isInteger(simklId) || simklId <= 0) {
    console.warn("[Simkl] Invalid Simkl ID resolved.", {
      malId,
      simklId,
      location: normalizedLocation,
    });

    return null;
  }

  console.info("[Simkl] Simkl ID resolved.", {
    malId,
    simklId,
  });

  return simklId;
}

export const simklRatingSource: RatingSource = {
  provider: "simkl",

  async getRating(anime: CanonicalAnime) {
    const malId = anime.ids.mal;
    const clientId = process.env.SIMKL_CLIENT_ID;
    console.info("[Simkl] Client ID check.", {
      configured: Boolean(clientId),
      prefix: clientId ? `${clientId.slice(0, 6)}...` : null,
    });

    if (malId === null) {
      console.warn("[Simkl] No MAL ID available.");
      return null;
    }

    if (!clientId) {
      console.warn("[Simkl] SIMKL_CLIENT_ID is not configured.");
      return null;
    }

    const simklId = await resolveSimklIdByMalId(malId, clientId);

    if (!simklId) {
      return null;
    }

    const params = getSimklApiParams(clientId);

    const url = `${SIMKL_API_BASE}/anime/${simklId}?${params.toString()}`;

    console.info("[Simkl] Requesting anime details.", {
      malId,
      simklId,
      url: `${SIMKL_API_BASE}/anime/${simklId}`,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": `${SIMKL_APP_NAME}/${SIMKL_APP_VERSION}`,
        "simkl-api-key": clientId,
      },
      next: {
        revalidate: 1800,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.warn("[Simkl] Anime details request failed.", {
        malId,
        simklId,
        status: response.status,
        statusText: response.statusText,
        body: responseText.slice(0, 500),
      });

      return null;
    }

    let payload: SimklAnimeResponse;

    try {
      payload = JSON.parse(responseText) as SimklAnimeResponse;
    } catch {
      console.warn("[Simkl] Invalid JSON response.", {
        malId,
        simklId,
        body: responseText.slice(0, 500),
      });

      return null;
    }

    const score = payload.ratings?.simkl?.rating ?? null;
    const votes = payload.ratings?.simkl?.votes ?? null;

    console.info("[Simkl] Rating response received.", {
      malId,
      simklId,
      rating: score,
      votes,
    });

    if (typeof score !== "number" || !Number.isFinite(score)) {
      console.warn("[Simkl] No valid rating returned.", {
        malId,
        simklId,
      });

      return null;
    }

    const voteCount =
      typeof votes === "number" && Number.isFinite(votes) && votes > 0
        ? votes
        : null;

    const rating = createRating("simkl", score, 10, voteCount);

    if (!rating) {
      return null;
    }

    return {
      ...rating,
      sourceUrl: `https://simkl.com/anime/${simklId}`,
    };
  },
};
