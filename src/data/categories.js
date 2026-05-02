export const defaultCategories = [
  { key: 'takeout', icon: '🥡', name: '外卖', bg: '#e8f0ea', color: '#3d7a50' },
  { key: 'dining', icon: '🍜', name: '堂食', bg: '#e4ecf2', color: '#4a6e8a' },
  { key: 'grocery', icon: '🛒', name: '买菜', bg: '#f0e8d4', color: '#b89030' },
  { key: 'transport', icon: '🚇', name: '交通', bg: '#e4eef4', color: '#357ca0' },
  { key: 'car', icon: '🚗', name: '养车', bg: '#f0e6dc', color: '#a06036' },
  { key: 'telecom', icon: '📱', name: '通讯', bg: '#ece4f0', color: '#7a5a8a' },
  { key: 'credit', icon: '💳', name: '还信用卡', bg: '#f0e4e4', color: '#b53a2a' },
  { key: 'study', icon: '📚', name: '学习', bg: '#e0ece8', color: '#2d7a6a' },
  { key: 'fun', icon: '🎮', name: '娱乐', bg: '#f0e8dc', color: '#b06a30' },
  { key: 'badminton', icon: '🏸', name: '羽毛球', bg: '#e4f0e8', color: '#2d8a5a' },
  { key: 'ai', icon: '🤖', name: 'AI', bg: '#e4e8f4', color: '#4a6aaa' },
  { key: 'pet', icon: '🐾', name: '宠物', bg: '#f4ece4', color: '#8a6a4a' }
]

const CUSTOM_CATEGORIES_KEY = 'accountbook_custom_categories'

export function getCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || '[]')
  } catch {
    return []
  }
}

export function addCustomCategory(name) {
  const custom = getCustomCategories()
  const key = 'custom_' + Date.now()
  const colors = [
    { bg: '#f0e8f4', color: '#8a5aaa' },
    { bg: '#e4f0f0', color: '#3a8a8a' },
    { bg: '#f4f0e4', color: '#8a7a3a' },
    { bg: '#e8f4e4', color: '#4a8a3a' },
    { bg: '#f4e4ec', color: '#aa5a7a' },
    { bg: '#e4eaf4', color: '#3a5aaa' }
  ]
  const colorSet = colors[custom.length % colors.length]
  const cat = { key, icon: '📌', name, ...colorSet }
  custom.push(cat)
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(custom))
  return cat
}

export function getAllCategories() {
  return [...defaultCategories, ...getCustomCategories()]
}

export const categories = getAllCategories

export function getCategoryMap() {
  return Object.fromEntries(getAllCategories().map(c => [c.key, c]))
}

export const categoryMap = Object.fromEntries(defaultCategories.map(c => [c.key, c]))

export const savingReasonMap = {
  coupon: '用了优惠券',
  skip: '不买了',
  walk: '走路/替代',
  discount: '折扣/低价'
}
