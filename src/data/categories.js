export const defaultCategories = [
  { key: 'takeout', icon: '🛍️', name: '外卖', bg: 'linear-gradient(135deg, #e4f5ea, #f1faf4)', color: '#28a463' },
  { key: 'dining', icon: '🍜', name: '堂食', bg: 'linear-gradient(135deg, #eef1ff, #f8f9ff)', color: '#5d73ff' },
  { key: 'grocery', icon: '🛒', name: '买菜', bg: 'linear-gradient(135deg, #fff4d5, #fff9e8)', color: '#ffb42e' },
  { key: 'retail', icon: '🏬', name: '零售', bg: 'linear-gradient(135deg, #eaf0ff, #f8faff)', color: '#5d73ff' },
  { key: 'transport', icon: '🚃', name: '交通', bg: 'linear-gradient(135deg, #eaf8fc, #f5fbfe)', color: '#2f91bd' },
  { key: 'car', icon: '🚙', name: '养车', bg: 'linear-gradient(135deg, #fff0e7, #fff8f2)', color: '#dd7a3c' },
  { key: 'telecom', icon: '', name: '通讯', bg: 'linear-gradient(135deg, #efe5ff, #f8f1ff)', color: '#7358d9', iconType: 'telecom' },
  { key: 'credit', icon: '💳', name: '还信用卡', bg: 'linear-gradient(135deg, #fbe9ec, #fff5f7)', color: '#ef334c' },
  { key: 'study', icon: '📚', name: '学习', bg: 'linear-gradient(135deg, #e8f5f1, #f5fbf9)', color: '#1aa5a5' },
  { key: 'fun', icon: '🎮', name: '娱乐', bg: 'linear-gradient(135deg, #fff0e9, #fff8f4)', color: '#ff7b54' },
  { key: 'badminton', icon: '🏸', name: '羽毛球', bg: 'linear-gradient(135deg, #edf7e8, #f8fcf3)', color: '#48a84c' },
  { key: 'ai', icon: '✨', name: 'AI', bg: 'linear-gradient(135deg, #eef1ff, #f9faff)', color: '#5d73ff' },
  { key: 'pet', icon: '🐾', name: '宠物', bg: 'linear-gradient(135deg, #fff0e9, #fff8f4)', color: '#a46a4d' }
]

const CUSTOM_CATEGORIES_KEY = 'accountbook_custom_categories'
const RETAIL_CATEGORY_KEY = 'retail'
const RETAIL_CATEGORY_NAME = '零售'

export function getCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || '[]')
  } catch {
    return []
  }
}

export function addCustomCategory(name) {
  const normalizedName = name.trim()
  const existingDefault = defaultCategories.find(cat => cat.name === normalizedName)
  if (existingDefault) return existingDefault

  const custom = getCustomCategories()
  const existingCustom = custom.find(cat => cat.name === normalizedName)
  if (existingCustom) return existingCustom

  const key = 'custom_' + Date.now()
  const colors = [
    { bg: 'linear-gradient(135deg, #f1eaff, #fbf8ff)', color: '#7358d9' },
    { bg: 'linear-gradient(135deg, #e8f8f8, #f7ffff)', color: '#1aa5a5' },
    { bg: 'linear-gradient(135deg, #fff5dc, #fffaf0)', color: '#c7901f' },
    { bg: 'linear-gradient(135deg, #ecf8e8, #f8fff6)', color: '#48a84c' },
    { bg: 'linear-gradient(135deg, #ffeaf2, #fff7fb)', color: '#d75986' },
    { bg: 'linear-gradient(135deg, #eaf0ff, #f8faff)', color: '#5d73ff' }
  ]
  const colorSet = colors[custom.length % colors.length]
  const cat = { key, icon: '🏷️', name: normalizedName, ...colorSet }
  custom.push(cat)
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(custom))
  return cat
}

export function getRetailAliasKeys() {
  return getCustomCategories()
    .filter(cat => cat.name === RETAIL_CATEGORY_NAME)
    .map(cat => cat.key)
}

export function getCanonicalCategoryKey(key) {
  if (key === RETAIL_CATEGORY_KEY) return key
  return getRetailAliasKeys().includes(key) ? RETAIL_CATEGORY_KEY : key
}

export function getAllCategories() {
  const retailAliases = new Set(getRetailAliasKeys())
  return [
    ...defaultCategories,
    ...getCustomCategories().filter(cat => !retailAliases.has(cat.key))
  ]
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
