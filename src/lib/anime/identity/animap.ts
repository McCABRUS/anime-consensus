const ANIMAP_ENDPOINT = "https://animap.id";

type AniMapResponse = {
  mal_id?: number;
  tvdb_id?: number[];
};

export async function getTVDBIdsByMalId(malId: number): Promise<number[]> {
  try {
    const response = await fetch(`${ANIMAP_ENDPOINT}/api/map/${malId}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.error("[AniMap] Mapping request failed.", {
        malId,
        status: response.status,
        statusText: response.statusText,
      });

      return [];
    }

    const payload = (await response.json()) as AniMapResponse;

    if (!Array.isArray(payload.tvdb_id)) {
      console.warn("[AniMap] Mapping did not include a TVDB ID array.", {
        malId,
      });

      return [];
    }

    return payload.tvdb_id.filter(
      (id): id is number =>
        typeof id === "number" && Number.isInteger(id) && id > 0,
    );
  } catch (error) {
    console.error("[AniMap] Mapping request threw an error.", {
      malId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return [];
  }
}
