import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { todayUtc, tomorrowUtc, pickDateFromUrl } from '$lib/schedule/date';

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

function sortByDateTimeUtc(games: NbaGame[]): NbaGame[] {
    return [...games].sort((a, b) => {
      const ta = a.datetimeUtc ? Date.parse(a.datetimeUtc) : Number.POSITIVE_INFINITY;
      const tb = b.datetimeUtc ? Date.parse(b.datetimeUtc) : Number.POSITIVE_INFINITY;
      return ta - tb;
    });
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  if (!PUBLIC_API_BASE_URL) throw new Error("Missing PUBLIC_API_BASE_URL");

  const today = todayUtc();
  const tomorrow = tomorrowUtc();
  const date = pickDateFromUrl(url);

  const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('refresh') === 'true';
  const apiUrl = new URL(`${PUBLIC_API_BASE_URL}/nba/games`);
  apiUrl.searchParams.set('date', date);
  if (forceRefresh) apiUrl.searchParams.set('forceRefresh', 'true');

  const res = await fetch(apiUrl.toString(), { headers: { Accept: 'applications/json' } });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { today, tomorrow, date, error: `API Error ${res.status}: ${text}`.slice(0, 400) };
  }

  const json = (await res.json()) as ApiResponse;

  return {
    today,
    tomorrow,
    date: json.date,
    meta: { provider: json.provider, cached: json.cached, stale: json.stale, fetchedAt: json.fetchedAt },
    games: sortByDateTimeUtc(json.data)
  };
}