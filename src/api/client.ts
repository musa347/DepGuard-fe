const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error (${response.status}): ${body || response.statusText}`);
  }

  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}
