const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** Fetch helper shared by the future backend service methods. */
export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Backend ainda não configurado. Defina VITE_API_URL no arquivo .env.local.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  });

  if (!response.ok) throw new Error(`Falha na API (${response.status}).`);
  if (response.status === 204) return null;
  return response.json();
}
