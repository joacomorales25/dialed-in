const BASE = 'http://localhost:8000/api'

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const r = await fetch(`${BASE}${path}`, opts)
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}`)
  if (r.status === 204) return null
  return r.json()
}

// Coffees
export const getCoffees     = ()         => request('GET',    '/coffees/')
export const createCoffee   = (data)     => request('POST',   '/coffees/', data)
export const deleteCoffee   = (id)       => request('DELETE', `/coffees/${id}`)

// Shots
export const getShots       = (coffeeId) =>
  request('GET', `/shots/${coffeeId != null ? `?coffee_id=${coffeeId}` : ''}`)
export const createShot     = (data)     => request('POST',   '/shots/', data)
export const deleteShot     = (id)       => request('DELETE', `/shots/${id}`)

// Recipes
export const getRecipes     = ()         => request('GET',    '/recipes/')
export const createRecipe   = (data)     => request('POST',   '/recipes/', data)
export const likeRecipe     = (id)       => request('POST',   `/recipes/${id}/like`)
export const deleteRecipe   = (id)       => request('DELETE', `/recipes/${id}`)

// Profile
export const getProfile     = ()         => request('GET',    '/profile/')
export const updateProfile  = (data)     => request('PUT',    '/profile/', data)

// Settings
export const getSettings    = ()         => request('GET',    '/settings/')
export const updateSettings = (data)     => request('PUT',    '/settings/', data)
