<script lang="ts">
    import ScheduleView from "$lib/components/ScheduleView.svelte";

    export let data: any;

    const titleMap: Record<string, string> = {
        nba: 'NBA',
        football: 'Football',
        nfl: 'NFL',
        mma: 'MMA'
    };

    const title = titleMap[data.sport] ?? data.title ?? 'Schedule';
</script>

<ScheduleView
  title={title}
  basePath={`/${data.sport}`}
  supportsRefresh={data.sport === 'nba'}
  today={data.today}
  tomorrow={data.tomorrow}
  date={data.date}
  meta={data.meta}
  games={data.games}
  error={data.error}
  notice={data.notice}
/>
