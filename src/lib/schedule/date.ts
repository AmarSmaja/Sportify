export function isValidDateParam(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function toUtcDateString(d: Date): string {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
}

export function todayUtc(): string {
    return toUtcDateString(new Date());
}

export function tomorrowUtc(): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    
    return toUtcDateString(d);
}

export function pickDateFromUrl(url: URL): string {
    const qDate = url.searchParams.get('date');
    const today = todayUtc();
    if (qDate && isValidDateParam(qDate)) return qDate;

    return today;
}