import type { PageServerLoad } from "../$types";
import { PUBLIC_API_BASE_URL } from '$env/static/public';

type NbaGame = {
  id: number;
  date: string;
  datetimeUtc: string | null;
  status: string | null;
  home: { id: number; name: string; abbr: string };
  away: { id: number; name: string; abbr: string };
  score: { home: number; away: number };
};

type ApiResponse = {
  date: string;
  provider: string;
  cached: boolean;
  stale: boolean;
  fetchedAt: string;
  data: NbaGame[];
};

function todayUtc(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  const base = PUBLIC_API_BASE_URL;
  if (!base) throw new Error('Missing PUBLIC_API_BASE_URL');

  const date = url.searchParams.get('date') ?? todayUtc();

  const res = await fetch(`${base}/nba/games?date=${encodeURIComponent(date)}`, {
    headers: { Accept: 'application/json' }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { date, error: `API error ${res.status}: ${text}`.slice(0, 300) };
  }

  const json = (await res.json()) as ApiResponse;

  return {
    date: json.date,
    meta: {
      provider: json.provider,
      cached: json.cached,
      stale: json.stale,
      fetchedAt: json.fetchedAt
    },
    games: json.data
  };
};