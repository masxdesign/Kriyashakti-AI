const lsOverride =
  import.meta.env.DEV &&
  typeof localStorage !== 'undefined' &&
  localStorage.getItem('VITE_MODE_OVERRIDE')

export const MODE = lsOverride || import.meta.env.VITE_MODE || 'generic'
export const isKriya = MODE === 'kriyashakti'
