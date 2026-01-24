import type { PageServerLoad } from './$types';
import { todayUtc, tomorrowUtc, pickDateFromUrl } from '$lib/schedule/date';

export const load: PageServerLoad = async ({ url }) => {
  const today = todayUtc();
  const tomorrow = tomorrowUtc();
  const date = pickDateFromUrl(url);

  return {
    today,
    tomorrow,
    date,
    notice: 'Coming soon: MMA provider is not connected yet.',
    games: []
  };
};
