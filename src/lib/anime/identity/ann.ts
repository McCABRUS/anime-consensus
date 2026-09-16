const ANIMAP_ENDPOINT = "https://animap.id/api/map";

type AniMapResponse = {
  mal_id?: number;
  ann_id?: number[];
};

export async function getAnnIdByMalId(malId: number): Promise<string | null> {
  const response = await fetch(`${ANIMAP_ENDPOINT}/${malId}`, {
    headers: {
      Accept: "application/json",
    },

    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AniMapResponse;

  if (!Array.isArray(payload.ann_id)) {
    return null;
  }

  if (payload.ann_id.length !== 1) {
    return null;
  }

  const annId = payload.ann_id[0];

  if (typeof annId !== "number" || !Number.isInteger(annId) || annId <= 0) {
    return null;
  }

  return String(annId);
}
