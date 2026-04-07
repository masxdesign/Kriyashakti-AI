const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://kriyashakti-ai.masxdesign.com'

/**
 * @param {string} wish
 * @returns {Promise<{ wish: string, data: Array<{ wish: string, options: string[], visualizations: string[] }> }>}
 */
export async function processWish(wish) {
  const response = await fetch(`${API_BASE}/api/process-wish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wish }),
  })

  const json = await response.json()

  if (!response.ok || json.error) {
    throw new Error(json.error ?? 'Something went wrong. Please try again.')
  }

  return json
}
