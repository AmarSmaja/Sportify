<script lang="ts">
    export type Team = { id?: number; name: string; abbr: string };
    export type Game = {
        id: number | string;
        datetimeUtc: string | null;
        status: string | null;
        home: Team;
        away: Team;
        score: { home: number; away: number };
    };

    export type Meta = {
        provider?: string;
        cached?: boolean;
        stale?: boolean;
        fetchedAt?: string;
    };

    export let title: string;
    export let basePath: string;
    export let today: string;
    export let tomorrow: string;
    export let date: string;

    export let games: Game[] | undefined = undefined;
    export let meta: Meta | undefined = undefined;

    export let error: string | undefined = undefined;
    export let notice: string | undefined = undefined;

    export let supportsRefresh: boolean = false;

    function formatLocal(iso: string | null) {
        if (!iso) return 'TDB';
        const d = new Date(iso);
        return new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
    }

    function normalizeStatus(s: string | null) {
        const v = (s ?? '').toLowerCase();
        if (!v) return { label: 'Scheduled', kind: 'scheduled' as const };
        if (v.includes('final')) return { label: 'Final', kind: 'final' as const };
        if (v.includes('in progress') || v.includes('halftime') || v.includes('end')) { return { label: 'Live', kind: 'live' as const }; }

        return { label: s ?? 'Scheduled', kind: 'scheduled' as const };
    }

    function showScore(status: string | null) {
        const v = (status ?? '').toLowerCase();

        return v.includes('final') || v.includes('in progress') || v.includes('halftime') || v.includes('end');
    }

    function hrefWithDate(d: string) {
        return `${basePath}?date=${encodeURIComponent(d)}`;
    }
</script>
<section class="top">
  <div class="titleRow">
    <h1 class="h1">{title}</h1>
    <div class="sub">Local time • {date}</div>
  </div>

  <div class="controls">
    <div class="quick">
      <a class="btn" href={hrefWithDate(today)} aria-current={date === today ? 'date' : undefined}>Today</a>
      <a class="btn" href={hrefWithDate(tomorrow)} aria-current={date === tomorrow ? 'date' : undefined}>Tomorrow</a>
    </div>

    <form method="GET" action={basePath} class="dateForm">
      <label class="label" for="date">Date</label>
      <input id="date" name="date" type="date" value={date} class="input" />
      <button class="btn primary" type="submit">Load</button>

      {#if supportsRefresh}
        <a class="btn ghost" href={`${hrefWithDate(date)}&refresh=1`} title="Force refresh (bypasses cache)">
          Refresh
        </a>
      {/if}
    </form>
  </div>
</section>

{#if error}
  <div class="error">{error}</div>
{:else if notice}
  <div class="notice">{notice}</div>
{:else if !games}
  <div class="muted">Loading…</div>
{:else if games.length === 0}
  <div class="muted">No events for this date.</div>
{:else}
  <ul class="list">
    {#each games as g (g.id)}
      {@const st = normalizeStatus(g.status)}
      <li class="card">
        <div class="left">
          <div class="matchup">
            <span class="abbr">{g.away.abbr}</span>
            <span class="at">@</span>
            <span class="abbr">{g.home.abbr}</span>
          </div>
          <div class="names">{g.away.name} @ {g.home.name}</div>

          <div class="metaRow">
            <span class={`badge ${st.kind}`}>{st.label}</span>
          </div>
        </div>

        <div class="right">
          <div class="time">{formatLocal(g.datetimeUtc)}</div>
          <div class="score">
            {#if showScore(g.status)}
              {g.score.away} – {g.score.home}
            {:else}
              —
            {/if}
          </div>
        </div>
      </li>
    {/each}
  </ul>

  {#if meta}
    <div class="footerMeta">
      {#if meta.provider}provider: {meta.provider}{/if}
      {#if meta.cached !== undefined} · cached: {meta.cached ? 'yes' : 'no'}{/if}
      {#if meta.stale !== undefined} · stale: {meta.stale ? 'yes' : 'no'}{/if}
      {#if meta.fetchedAt} · fetchedAt: {meta.fetchedAt}{/if}
    </div>
  {/if}
{/if}

<style>
  .top { margin-bottom: 14px; }
  .titleRow { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .h1 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
  .sub { opacity: 0.75; font-size: 13px; }

  .controls { display: flex; gap: 12px; justify-content: space-between; flex-wrap: wrap; margin-top: 12px; }
  .quick { display: inline-flex; gap: 8px; flex-wrap: wrap; }

  .dateForm { display: inline-flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .label { opacity: 0.8; font-size: 13px; }
  .input { padding: 8px 10px; border: 1px solid #ddd; border-radius: 10px; }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    text-decoration: none;
    color: #111;
    background: white;
    font-weight: 600;
    font-size: 13px;
  }
  .btn:hover { background: #fafafa; border-color: #cfcfcf; }
  .btn.primary { background: #111; color: white; border-color: #111; }
  .btn.primary:hover { background: #000; }
  .btn.ghost { background: transparent; }

  a[aria-current="date"] { background: #111; color: white; border-color: #111; }

  .list { list-style: none; padding: 0; margin: 12px 0 0 0; display: grid; gap: 10px; }
  .card {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #e5e5e5;
    border-radius: 14px;
    padding: 12px;
    background: white;
  }

  .left { min-width: 0; }
  .matchup { font-weight: 800; font-size: 16px; }
  .abbr { letter-spacing: 0.02em; }
  .at { opacity: 0.6; margin: 0 6px; }
  .names { opacity: 0.8; margin-top: 2px; }

  .metaRow { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
  .badge {
    display: inline-flex;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
    border: 1px solid #ddd;
    background: #fafafa;
    font-weight: 700;
  }
  .badge.live { border-color: #111; }
  .badge.final { border-color: #111; }

  .right { text-align: right; min-width: 120px; }
  .time { font-weight: 800; }
  .score { opacity: 0.85; margin-top: 4px; font-weight: 700; }

  .muted { opacity: 0.8; margin-top: 14px; }
  .notice { margin-top: 14px; padding: 10px; border: 1px solid #ddd; background: #fafafa; border-radius: 12px; }
  .error { margin-top: 14px; padding: 10px; border: 1px solid #f1c1c1; background: #fff5f5; border-radius: 12px; }
  .footerMeta { opacity: 0.7; font-size: 12px; margin-top: 10px; }
</style>