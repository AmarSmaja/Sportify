import type { Sport, UnifiedGame } from "./types";
import { fetchNbaGamesByDate, type BalldontlieGame } from "../balldontlie";

const ESPN_BASE_URL = process.env.ESPN_BASE_URL ?? "https://site.api.espn.com/apis/site/v2";
const ESPN_TIMEOUT_MS = Number(process.env.ESPN_TIMEOUT_MS ?? 12_000);

const FOOTBALL_LEAGUES = (process.env.FOOTBALL_LEAGUES ?? "eng.1").split(",").map((s) => s.trim()).filter(Boolean);
const CFB_GROUPS = (process.env.CFB_GROUPS ?? "80").split(",").map((s) => s.trim()).filter(Boolean);
const CBB_GROUPS = (process.env.CBB_GROUPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

type SportConfig = {
    provider: string;
    fetchByDate: (dateYYYYMMDD: string) => Promise<any[]>;
    map: (raw: any, sport: Sport, dateYYYYMMDD: string) => UnifiedGame;
}

function yyyymmddFromIsoDate(isoYYYYMMDD: string): string {
    return isoYYYYMMDD.replaceAll("-", "");
}

function isoFromYyyymmdd(dateYYYYMMDD: string): string {
    return `${dateYYYYMMDD.slice(0, 4)}-${dateYYYYMMDD.slice(4, 6)}-${dateYYYYMMDD.slice(6, 8)}`;
}

function asIsoOrNull(v: any): string | null {
    if (v == null) return null;
    const s = String(v).trim();
    return s ? s : null;
}

function toIntOrNull(v: any): number | null {
    if (v == null) return null;
    const n = Number(String(v).trim());

    return Number.isFinite(n) ? n : null;
}

async function fetchJson(url: string): Promise<any> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ESPN_TIMEOUT_MS);

    try {
        const res = await fetch(url, { headers: { accept: "application/json", "user-agent": "sportify/1.0" }, signal: ctrl.signal });

        const text = await res.text();
        if (!res.ok) throw new Error(`ESPN HTTP ${res.status}: ${text.slice(0, 300)}`);

        try {
            return JSON.parse(text);
        } catch {
            throw new Error(`ESPN invalid JSON: ${text.slice(0, 300)}`);
        }
    } finally {
        clearTimeout(t);
    }
}

async function fetchEspnScoreboard(pathAfterSports: string, dateYYYYMMDD: string, extraParams?: Record<string, string>): Promise<any[]> {
    const params = new URLSearchParams();
    params.set("dates", dateYYYYMMDD);
    if (extraParams) {
        for (const [k, v] of Object.entries(extraParams)) params.set(k, v);
    }

    const url = `${ESPN_BASE_URL}/sports/${pathAfterSports}/scoreboard?${params.toString()}`;
    const json = await fetchJson(url);

    const events = Array.isArray(json?.events) ? json.events : [];
    
    return events;
}

function pickCompetition(evt: any): any | null {
    const comps = evt?.competitions;
    if (Array.isArray(comps) && comps.length) return comps[0];
    
    return null;
}

function pickCompetitors(comp: any): any[] {
    const arr = comp?.competitors;

    return Array.isArray(arr) ? arr : [];
}

function extractSide(c: any): { id: string | number; name: string; abbr?: string | null } {
    const team = c?.team;
    if (team) {
        const id = team.id ?? team.uid ?? "team";
        const name = team.displayName ?? team.name ?? team.shortDisplayName ?? "Team";
        const abbr = team.abbreviation ?? null;
        return { id, name, abbr };
    }

    const athlete = c?.athlete;
    if (athlete) {
        const id = athlete.id ?? athlete.uid ?? "athlete";
        const name = athlete.displayName ?? athlete.fullName ?? "Fighter";
        return { id, name, abbr: null };
    }

    return { id: c?.id ?? "side", name: c?.displayName ?? "Side", abbr: null };
}

function mapEspnEventToUnified(evt: any, sport: Sport, dateYYYYMMDD: string): UnifiedGame {
    const comp = pickCompetition(evt);
    const competitors = comp ? pickCompetitors(comp) : [];

    const homeC = competitors.find((x) => x?.homeAway === "home") ?? competitors[0] ?? null;
    const awayC = competitors.find((x) => x?.homeAway === "away") ?? competitors[1] ?? null;

    const datetimeUtc = asIsoOrNull(evt?.date ?? comp?.date);
    const status =  asIsoOrNull(comp?.status?.type?.description) ?? asIsoOrNull(comp?.status?.type?.shortDetail) ?? asIsoOrNull(comp?.status?.type?.name) ?? null;

    const home = homeC ? extractSide(homeC) : { id: "home", name: "Home", abbr: null };
    const away = awayC ? extractSide(awayC) : { id: "away", name: "Away", abbr: null };

    const homeScore = homeC ? toIntOrNull(homeC?.score) : null;
    const awayScore = awayC ? toIntOrNull(awayC?.score) : null;

    const id = evt?.id ?? comp?.id ?? `${sport}-${dateYYYYMMDD}-${home.id}-${away.id}`;

    return {
        id,
        sport,
        date: isoFromYyyymmdd(dateYYYYMMDD),
        datetimeUtc,
        status,
        home,
        away,
        score: { home: homeScore, away: awayScore }
    };
}

function mapBalldontlieNbaGame(g: BalldontlieGame, dateYYYYMMDD: string): UnifiedGame {
    return {
        id: g.id,
        sport: "nba",
        date: isoFromYyyymmdd(dateYYYYMMDD),
        datetimeUtc: asIsoOrNull((g as any).datetime ?? (g as any).date ?? null),
        status: (g as any).status ?? null,
        home: {
            id: g.home_team?.id,
            name: g.home_team?.full_name ?? "Home",
            abbr: g.home_team?.abbreviation ?? null
        },
        away: {
            id: g.visitor_team?.id,
            name: g.visitor_team?.full_name ?? "Away",
            abbr: g.visitor_team?.abbreviation ?? null
        },
        score: {
            home: Number.isFinite((g as any).home_team_score) ? (g as any).home_team_score : null,
            away: Number.isFinite((g as any).visitor_team_score) ? (g as any).visitor_team_score : null
        }
    };
}

export const SPORT_CONFIG: Record<Sport, SportConfig> = {
    nba: {
        provider: "balldontlie",
        fetchByDate: async (dateYYYYMMDD) => {
        const iso = isoFromYyyymmdd(dateYYYYMMDD);
        const games = await fetchNbaGamesByDate(iso);
        return games as any[];
        },
        map: (raw, sport, dateYYYYMMDD) => mapBalldontlieNbaGame(raw as BalldontlieGame, dateYYYYMMDD)
    },

    nfl: {
        provider: "espn",
        fetchByDate: async (dateYYYYMMDD) => {
        return fetchEspnScoreboard("football/nfl", dateYYYYMMDD);
        },
        map: (raw, sport, dateYYYYMMDD) => mapEspnEventToUnified(raw, sport, dateYYYYMMDD)
    },

    cfb: {
        provider: "espn",
        fetchByDate: async (dateYYYYMMDD) => {
        const all: any[] = [];
        const seen = new Set<string>();

        if (!CFB_GROUPS.length) {
            const evts = await fetchEspnScoreboard("football/college-football", dateYYYYMMDD);
            for (const e of evts) {
            const id = String(e?.id ?? "");
            if (!id || seen.has(id)) continue;
            seen.add(id);
            all.push(e);
            }
            return all;
        }

        for (const grp of CFB_GROUPS) {
            const evts = await fetchEspnScoreboard("football/college-football", dateYYYYMMDD, { groups: grp });
            for (const e of evts) {
            const id = String(e?.id ?? "");
            if (!id || seen.has(id)) continue;
            seen.add(id);
            all.push(e);
            }
        }

        return all;
        },
        map: (raw, sport, dateYYYYMMDD) => mapEspnEventToUnified(raw, sport, dateYYYYMMDD),
    },

    cbb: {
        provider: "espn",
        fetchByDate: async (dateYYYYMMDD) => {
        const all: any[] = [];
        const seen = new Set<string>();

        if (!CBB_GROUPS.length) {
            const evts = await fetchEspnScoreboard("basketball/mens-college-basketball", dateYYYYMMDD);
            for (const e of evts) {
            const id = String(e?.id ?? "");
            if (!id || seen.has(id)) continue;
            seen.add(id);
            all.push(e);
            }
            return all;
        }

        for (const grp of CBB_GROUPS) {
            const evts = await fetchEspnScoreboard("basketball/mens-college-basketball", dateYYYYMMDD, { groups: grp });
            for (const e of evts) {
            const id = String(e?.id ?? "");
            if (!id || seen.has(id)) continue;
            seen.add(id);
            all.push(e);
            }
        }

        return all;
        },
        map: (raw, sport, dateYYYYMMDD) => mapEspnEventToUnified(raw, sport, dateYYYYMMDD)
    },

    football: {
        provider: "espn",
        fetchByDate: async (dateYYYYMMDD) => {
        const leagues = FOOTBALL_LEAGUES.length ? FOOTBALL_LEAGUES : ["eng.1"];
        const all: any[] = [];
        const seen = new Set<string>();

        for (const league of leagues) {
            const evts = await fetchEspnScoreboard(`soccer/${league}`, dateYYYYMMDD);
            for (const e of evts) {
            const id = String(e?.id ?? "");
            if (!id || seen.has(id)) continue;
            seen.add(id);
            if (!e.league) e.league = { name: league };
            all.push(e);
            }
        }

        return all;
        },
        map: (raw, sport, dateYYYYMMDD) => mapEspnEventToUnified(raw, sport, dateYYYYMMDD),
    },

    mma: {
        provider: "espn",
        fetchByDate: async (dateYYYYMMDD) => {
        return fetchEspnScoreboard("mma/ufc", dateYYYYMMDD);
        },
        map: (raw, sport, dateYYYYMMDD) => mapEspnEventToUnified(raw, sport, dateYYYYMMDD)
    }
    };