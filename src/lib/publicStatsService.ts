export interface PublicStats {
  happyCustomers: number;
  vehiclesProtected: number;
  citiesCovered: number;
  googleRating: number;
  installCount: number;
}

const defaultStats: PublicStats = {
  happyCustomers: 0,
  vehiclesProtected: 0,
  citiesCovered: 0,
  googleRating: 0,
  installCount: 0,
};

const getApiBaseUrl = () => {
  const base = import.meta.env.VITE_PAYMENT_API_BASE_URL;
  return typeof base === "string" ? base.replace(/\/$/, "") : "";
};

export const getPublicStats = async (): Promise<PublicStats> => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return defaultStats;

  try {
    const res = await fetch(`${baseUrl}/getPublicStats`, {
      method: "GET",
    });

    if (!res.ok) return defaultStats;

    const data = (await res.json()) as Partial<PublicStats>;
    return {
      happyCustomers: Number(data.happyCustomers || 0),
      vehiclesProtected: Number(data.vehiclesProtected || 0),
      citiesCovered: Number(data.citiesCovered || 0),
      googleRating: Number(data.googleRating || 0),
      installCount: Number(data.installCount || 0),
    };
  } catch {
    return defaultStats;
  }
};
