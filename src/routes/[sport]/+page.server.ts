import type { PageServerLoad } from "./$types";
import { todayUtc, tomorrowUtc, pickDateFromUrl } from "$lib/schedule/date";
import { apiJson } from "$lib/server/api";

type ScheduleResponse = {
    sport: string;
    date: string;
    provider: string;
    cached: boolean;
    stale: boolean;
    fetchedAt: string;
    data: unknown[];
};

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
    const today = todayUtc();
    const tomorrow = tomorrowUtc();
    const date = pickDateFromUrl(url);

    const sport = normalizeSport(params.sport);

    if (!isAllowedSport(sport)) {
        return { today, tomorrow, date, sport, notice: `Unsupported Sport: ${sport}!` };
    }

    const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('refresh') === 'true';

    let json: ScheduleResponse;
    try {
        json = await apiJson<ScheduleResponse>(fetch, '/schedule', { sport, date, forceRefresh: forceRefresh ? "true" : undefined });
    } catch (e: any) {
        const msg = typeof e?.body === "string" ? e.body : e?.message ?? "Unknown Error!";
        return { today, tomorrow, date, sport, error: `API error: ${msg}`.slice(0, 400) };
    }

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
        games: sortByDatetimeUtc((json.data ?? []) as any[])
    };
};