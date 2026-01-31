export const SPORTS = ["nba", "nfl", "football", "cbb", "cfb", "mma"] as const;
export type Sport = typeof SPORTS[number];

export type TeamRef = { id: string | number; name: string; abbr?: string | null };
export type Score = { home: number | null; away: number | null };

export type UnifiedGame = {
    id: string | number;
    sport: Sport;
    date: string;
    datetimeUtc: string | null;
    status: string | null;
    home: TeamRef;
    away: TeamRef;
    score: Score;
};

export type ScheduleResponse = {
    sport: Sport;
    date: string;
    provider: string;
    cached: boolean;
    stale: boolean;
    fetchedAt: string;
    data: UnifiedGame[];
};