import type { PageServerLoad } from "./$types";
import { PUBLIC_API_BASE_URL } from "$env/static/public";
import { todayUtc, tomorrowUtc, pickDateFromUrl } from "$lib/schedule/date";

function normalizeSport(s: string) {
    return (s ?? '').trim().toLowerCase();
}

function isAllowedSport(s: string) {
    return ['nba', 'football', 'nfl', 'mma'].includes(s);
}

function sortByDatetimeUtc(games: any[]) {
    return [...games].sort((a, b) => {
        const ta = a.datetimeUtc ? Date.parse(a.datetimeUtc) : Number.POSITIVE_INFINITY;
        const tb = b.datetimeUtc ? Date.parse(b.datetimeUtc) : Number.POSITIVE_INFINITY;
        return ta - tb;
    });
}

export const load: PageServerLoad = async ({ fetch, url, params }) => {
    if (!PUBLIC_API_BASE_URL) throw new Error('Missing PUBLIC_API_BASE_URL');

    const today = todayUtc();
    const tomorrow = tomorrowUtc();
    const date = pickDateFromUrl(url);

    const sport = normalizeSport(params.sport);

    if (!isAllowedSport(sport)) {
        return { today, tomorrow, date, sport, notice: `Unsupported Sport: ${sport}!` };
    }

    const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('refresh') === 'true';

    const apiUrl = new URL(`${PUBLIC_API_BASE_URL}/schedule`);
    apiUrl.searchParams.set('sport', sport);
    apiUrl.searchParams.set('date', date);
    if (forceRefresh) apiUrl.searchParams.set('forceRefresh', 'true');

    const res = await fetch(apiUrl.toString(), { headers: { Accept: 'application/json' } });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        
        return { today, tomorrow, date, sport, error: `API error ${res.status}: ${text}`.slice(0, 400) };
    }

    const json = (await res.json()) as any;

    return { 
        today, 
        tomorrow, 
        date: json.date ?? date, 
        sport,
        title: sport.toUpperCase(),
        meta: {
            provider: json.provider,
            cached: json.cached,
            stale: json.stale,
            fetchedAt: json.fetchedAt
        },
        games: sortByDatetimeUtc(json.data ?? [])
    };
};