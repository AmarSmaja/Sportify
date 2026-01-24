<script lang="ts">
  import ScheduleView from '$lib/components/ScheduleView.svelte';

  export let data: {
    today: string;
    tomorrow: string;
    date: string;
    meta?: { provider: string; cached: boolean; stale: boolean; fetchedAt: string };
    games?: any[];
    error?: string;
  };
</script>

<ScheduleView
  title="NBA"
  basePath="/nba"
  supportsRefresh={true}
  today={data.today}
  tomorrow={data.tomorrow}
  date={data.date}
  meta={data.meta}
  games={data.games}
  error={data.error}
/>
