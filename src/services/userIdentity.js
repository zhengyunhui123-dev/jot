const USER_ID_KEY = 'accountbook:user-id'
const USER_NAME_KEY = 'accountbook:user-name'
const DEFAULT_USER_NAME = 'momo'

function createUserId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `ab_${crypto.randomUUID()}`
  }

  return `ab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = createUserId()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

export function getUserProfile() {
  let displayName = localStorage.getItem(USER_NAME_KEY)
  if (!displayName) {
    displayName = DEFAULT_USER_NAME
    localStorage.setItem(USER_NAME_KEY, displayName)
  }

  return {
    userId: getUserId(),
    displayName
  }
}

export function setUserDisplayName(displayName) {
  if (!displayName) return
  localStorage.setItem(USER_NAME_KEY, displayName)
}

export function copyUserId() {
  const userId = getUserId()
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(userId)
  }

  const input = document.createElement('input')
  input.value = userId
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  return Promise.resolve()
}
