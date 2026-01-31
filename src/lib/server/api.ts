import { error } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { env as publicEnv } from "$env/dynamic/public";
import { env as privateEnv } from "$env/dynamic/private";

function normalizeBaseUrl(raw: string): string {
    let v = raw.trim();

    v = v.replace(/[\\/]+$/g, "").trim();

    if (!/^https?:\/\//i.test(v)) v = `https://${v}`;

    try {
        new URL(v);
    } catch {
        throw error(500, `Invalid API base url: ${raw}`);
    }

    return v;
}

function getBaseUrl(): string {
    const rawPrivate = (privateEnv.API_INTERNAL_BASE_URL ?? "").trim();
    const rawPublic = (publicEnv.PUBLIC_API_BASE_URL ?? "").trim();

    const raw = (dev ? (rawPublic || rawPrivate) : (rawPrivate || rawPublic)).trim();

    if (!raw) throw error(500, "Missing API base URL!");
    return normalizeBaseUrl(raw);
}

export function apiUrl(path: string, params?: Record<string, string | undefined>): string {
    const base = getBaseUrl();
    const p = path.startsWith("/") ? path : `/${path}`;

    const u = new URL(p, `${base}/`);

    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v != null && String(v).trim() !== "") u.searchParams.set(k, String(v));
        }
    }

    return u.toString();
}

export async function apiJson<T>(
    fetchFn: typeof fetch,
    path: string,
    params?: Record<string, string | undefined>
): Promise<T> {
    const url = apiUrl(path, params);
    const res = await fetchFn(url, { headers: { accept: "application/json" } });

    const text = await res.text();
    let body: unknown = null;

    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        body = text;
    }

    if (!res.ok) {
        throw error(res.status, { error: "API request failed", url, status: res.status, body });
    }

    return body as T;
}