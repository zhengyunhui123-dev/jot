export const defaultCategories = [
  { key: 'takeout', icon: '🛍️', name: '外卖', bg: '#e9f6ee', color: '#28a463' },
  { key: 'dining', icon: '🍜', name: '堂食', bg: '#eaf0ff', color: '#5d73ff' },
  { key: 'grocery', icon: '🛒', name: '买菜', bg: '#fff4d8', color: '#ffb42e' },
  { key: 'transport', icon: '🚇', name: '交通', bg: '#e8f5fb', color: '#2f91bd' },
  { key: 'car', icon: '🚗', name: '养车', bg: '#fff0e5', color: '#dd7a3c' },
  { key: 'telecom', icon: '📱', name: '通讯', bg: '#efe9ff', color: '#7358d9' },
  { key: 'credit', icon: '💳', name: '还信用卡', bg: '#ffe9ed', color: '#ef334c' },
  { key: 'study', icon: '📚', name: '学习', bg: '#e5f6f4', color: '#1aa5a5' },
  { key: 'fun', icon: '🎮', name: '娱乐', bg: '#ffefe8', color: '#ff7b54' },
  { key: 'badminton', icon: '🏸', name: '羽毛球', bg: '#edf8e9', color: '#48a84c' },
  { key: 'ai', icon: '✨', name: 'AI', bg: '#edf0ff', color: '#5d73ff' },
  { key: 'pet', icon: '🐾', name: '宠物', bg: '#fff0ea', color: '#a46a4d' }
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
    { bg: '#f1eaff', color: '#7358d9' },
    { bg: '#e8f8f8', color: '#1aa5a5' },
    { bg: '#fff5dc', color: '#c7901f' },
    { bg: '#ecf8e8', color: '#48a84c' },
    { bg: '#ffeaf2', color: '#d75986' },
    { bg: '#eaf0ff', color: '#5d73ff' }
  ]
  const colorSet = colors[custom.length % colors.length]
  const cat = { key, icon: '🏷️', name, ...colorSet }
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
