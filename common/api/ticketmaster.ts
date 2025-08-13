import axios, { AxiosInstance } from 'axios';

export type EventItem = {
  id: string;
  name: string;
  images?: { url: string; width: number; height: number }[];
  dates?: { start?: { localDate?: string; localTime?: string } };
  info?: string;
  pleaseNote?: string;
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
      country?: { name?: string };
      address?: { line1?: string };
      location?: { latitude?: string; longitude?: string };
    }[];
  };
};

export type SearchEventsParams = {
  keyword?: string;
  city?: string;
  page?: number;
  size?: number;
};

export type SearchEventsResponse = {
  page?: { size?: number; totalElements?: number; totalPages?: number; number?: number };
  _embedded?: { events?: EventItem[] };
};

const API_BASE = 'https://app.ticketmaster.com/discovery/v2';

function createClient(): AxiosInstance {
  const instance = axios.create({ baseURL: API_BASE });
  instance.interceptors.request.use((config) => {
    const apiKey =
      process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY ||
      process.env.EXPO_PUBLIC_TM_API_KEY;
    // Ensure apikey query param is always included
    if (apiKey) {
      config.params = { ...(config.params as any), apikey: apiKey };
    }
    return config;
  });
  return instance;
}

const client = createClient();

export async function searchEvents(params: SearchEventsParams): Promise<EventItem[]> {
  const { keyword, city, page = 0, size = 20 } = params;
  const resp = await client.get<SearchEventsResponse>('/events.json', {
    params: { keyword, city, page, size },
  });
  return resp.data._embedded?.events ?? [];
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const resp = await client.get<{ id: string } & EventItem>(`/events/${id}.json`);
  return (resp.data as unknown as EventItem) ?? null;
}


