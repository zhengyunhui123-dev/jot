import { getUserId } from './cloudSync.js'

const USER_NAME_KEY = 'accountbook:user-name'
const DEFAULT_USER_NAME = 'momo'

export { getUserId }

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
  if (!userId) return Promise.resolve()
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
