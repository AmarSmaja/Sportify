<script lang="ts">
  export let data: {
    date: string;
    meta?: { provider: string; cached: boolean; stale: boolean; fetchedAt: string };
    games?: {
      id: number;
      datetimeUtc: string | null;
      status: string | null;
      home: { name: string; abbr: string };
      away: { name: string; abbr: string };
      score: { home: number; away: number };
    }[];
    error?: string;
  };

  function formatLocal(iso: string | null) {
    if (!iso) return 'TBD';
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }
</script>

<main style="max-width: 900px; margin: 0 auto; padding: 24px;">
  <h1>NBA — {data.date}</h1>

  <form method="GET" style="margin: 16px 0; display: flex; gap: 8px; align-items: center;">
    <label for="date">Date</label>
    <input id="date" name="date" type="date" value={data.date} />
    <button type="submit">Load</button>
  </form>

  {#if data.error}
    <p style="color: crimson;">{data.error}</p>
  {:else if !data.games}
    <p>Loading…</p>
  {:else if data.games.length === 0}
    <p>No games for this date.</p>
  {:else}
    <ul style="list-style: none; padding: 0; margin: 16px 0; display: grid; gap: 10px;">
      {#each data.games as g}
        <li style="border: 1px solid #ddd; border-radius: 10px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <div>
              <div style="font-weight: 600;">
                {g.away.abbr} @ {g.home.abbr}
              </div>
              <div style="opacity: 0.8;">{g.away.name} @ {g.home.name}</div>
              <div style="opacity: 0.8;">{g.status ?? 'scheduled'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600;">{formatLocal(g.datetimeUtc)}</div>
              <div style="opacity: 0.8;">{g.score.away} - {g.score.home}</div>
            </div>
          </div>
        </li>
      {/each}
    </ul>

    {#if data.meta}
      <p style="opacity: 0.7; font-size: 12px;">
        provider: {data.meta.provider} · cached: {data.meta.cached ? 'yes' : 'no'} ·
        stale: {data.meta.stale ? 'yes' : 'no'} · fetchedAt: {data.meta.fetchedAt}
      </p>
    {/if}
  {/if}
</main>