import { calculateConsensus } from "./consensus";

import type { AnimeRating } from "./types";

const ratings: AnimeRating[] = [
  {
    provider: "myanimelist",
    value: 9.25,
    scale: 10,
    normalizedValue: 9.25,
    voteCount: null,
    fetchedAt: "2026-09-15T00:00:00.000Z",
  },
  {
    provider: "anilist",
    value: 91,
    scale: 100,
    normalizedValue: 9.1,
    voteCount: null,
    fetchedAt: "2026-09-15T00:00:00.000Z",
  },
  {
    provider: "kitsu",
    value: 88.81,
    scale: 100,
    normalizedValue: 8.881,
    voteCount: null,
    fetchedAt: "2026-09-15T00:00:00.000Z",
  },
];

const result = calculateConsensus(ratings);

console.log(result);
