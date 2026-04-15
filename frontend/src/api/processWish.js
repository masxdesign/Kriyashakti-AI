const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://kriyashakti-ai.masxdesign.com'

import { MODE } from '@/lib/mode.js'

/**
 * @param {string} wish
 * @returns {Promise<{ wish: string, data: Array<{ wish: string, options: string[], visualizations: null }> }>}
 */
export async function processWish(wish) {
  const response = await fetch(`${API_BASE}/api/process-wish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wish, mode: MODE }),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok || json.error) {
    throw new Error(json.error ?? 'Something went wrong. Please try again.')
  }

  return json
}

/**
 * @param {string} option
 * @param {string|null} visualization
 * @returns {Promise<string>}
 */
export async function generateAffirmation(option, visualization) {
  const response = await fetch(`${API_BASE}/api/generate-affirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option, visualization, mode: MODE }),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok || json.error) {
    throw new Error(json.error ?? 'Something went wrong. Please try again.')
  }

  return json.affirmation
}

/**
 * @param {string} option
 * @returns {Promise<string>}
 */
export async function generateVisualization(option) {
  const response = await fetch(`${API_BASE}/api/generate-visualizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option, mode: MODE }),
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok || json.error) {
    throw new Error(json.error ?? 'Something went wrong. Please try again.')
  }

  return json.visualization
}
