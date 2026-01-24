<script lang="ts">
  import ScheduleView from '$lib/components/ScheduleView.svelte';
  export let data: any;
</script>

<ScheduleView
  title="MMA"
  basePath="/mma"
  supportsRefresh={false}
  today={data.today}
  tomorrow={data.tomorrow}
  date={data.date}
  notice={data.notice}
  games={data.games}
/>
