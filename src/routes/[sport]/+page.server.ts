import type { PageServerLoad } from "./$types";
import { todayUtc, tomorrowUtc, pickDateFromUrl } from "$lib/schedule/date";
import { apiJson } from "$lib/server/api";
import { SPORTS, type Sport, type ScheduleResponse, type UnifiedGame } from "$lib/schedule/types";

function normalizeSport(s: string): string {
    return (s ?? "").trim().toLowerCase();
}

function isSport(s: string): s is Sport {
    return (SPORTS as readonly string[]).includes(s);
}

function sortByDatetimeUtc(games: UnifiedGame[]) {
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

    const sportRaw = normalizeSport(params.sport);

    if (!isSport(sportRaw)) {
        return { today, tomorrow, date, sport: sportRaw, notice: `Unsupported sport: ${sportRaw}!` };
    }

    const sport: Sport = sportRaw;

    const forceRefresh = url.searchParams.get("refresh") === "1" || url.searchParams.get("refresh") === "true";
    let json: ScheduleResponse;

    try {
        json = await apiJson<ScheduleResponse>(fetch, "/schedule", { sport, date, forceRefresh: forceRefresh ? "true" : undefined });
    } catch (e: any) {
        const msg = typeof e?.body === "string" ? e.body : e?.message ?? "Unknown error!";
        return { today, tomorrow, date, sport, error: `API error: ${msg}`.slice(0, 400) };
    }

    const games = Array.isArray(json.data) ? (json.data as UnifiedGame[]): [];

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
        games: sortByDatetimeUtc(games)
    };
};