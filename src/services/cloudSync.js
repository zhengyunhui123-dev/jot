import { createClient } from '@supabase/supabase-js'

const STORAGE_MODE_KEY = 'accountbook:storage-mode'
const EXPENSE_TABLE_NAME = 'accountbook_expenses'
const PROFILE_TABLE_NAME = 'accountbook_profiles'
const USER_ID_CACHE_KEY = 'accountbook:cached-uuid'
const OLD_USER_ID_KEY = 'accountbook:user-id'
const CLOUD_MODE = 'cloud'
const LOCAL_MODE = 'local'

let supabaseClient = null
let cachedUserId = null
let authInitialized = false
let migrationDone = false

function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
}

function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig()
  if (!url || !anonKey) return null

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey)
  }
  return supabaseClient
}

// 使用 Supabase 匿名登录，优先恢复 session 避免 user_id 漂移
export async function initAuth() {
  if (authInitialized) return
  const client = getSupabaseClient()
  if (!client) {
    authInitialized = true
    return
  }

  // 第一步：尝试从 Supabase session 存储恢复（正常刷新页面时会命中）
  const { data: sessionData } = await client.auth.getSession()
  if (sessionData.session) {
    cachedUserId = sessionData.session.user.id
    localStorage.setItem(USER_ID_CACHE_KEY, cachedUserId)
    authInitialized = true
    return
  }

  // 第二步：无 session，创建新匿名用户
  const { data, error } = await client.auth.signInAnonymously()
  if (error) throw error
  cachedUserId = data.user.id
  localStorage.setItem(USER_ID_CACHE_KEY, cachedUserId)

  authInitialized = true
}

export function getUserId() {
  return cachedUserId
}

function toCloudRow(expense) {
  return {
    user_id: cachedUserId,
    local_id: Number(expense.id),
    date: expense.date,
    category: expense.category,
    amount: Number(expense.amount || 0),
    payment_method: expense.paymentMethod || '',
    expected_amount: expense.expectedAmount ?? null,
    saving_amount: expense.savingAmount || 0,
    saving_reason: expense.savingReason || '',
    note: expense.note || '',
    created_at: Number(expense.createdAt || Date.now()),
    synced_at: new Date().toISOString(),
    payload: expense
  }
}

function fromCloudRow(row) {
  return {
    ...(row.payload || {}),
    id: Number(row.local_id),
    date: row.date,
    category: row.category,
    amount: Number(row.amount || 0),
    paymentMethod: row.payment_method,
    expectedAmount: row.expected_amount,
    savingAmount: row.saving_amount || 0,
    savingReason: row.saving_reason || '',
    note: row.note || '',
    createdAt: Number(row.created_at || Date.now())
  }
}

function ensureCloudReady() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('请先配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  }
  if (!cachedUserId) {
    throw new Error('认证未就绪，请稍后重试')
  }
  return client
}

export function getStorageMode() {
  return localStorage.getItem(STORAGE_MODE_KEY) === CLOUD_MODE ? CLOUD_MODE : LOCAL_MODE
}

export function isCloudStorageEnabled() {
  return getStorageMode() === CLOUD_MODE
}

export function isCloudConfigured() {
  return Boolean(getSupabaseClient())
}

export function setStorageMode(mode) {
  localStorage.setItem(STORAGE_MODE_KEY, mode === CLOUD_MODE ? CLOUD_MODE : LOCAL_MODE)
}

// 手动绑定 user_id（用于恢复旧账号数据）
export function bindUserId(userId) {
  if (!userId || typeof userId !== 'string') return false
  cachedUserId = userId.trim()
  localStorage.setItem(USER_ID_CACHE_KEY, cachedUserId)
  authInitialized = true
  return true
}

export async function syncUserProfileToCloud() {
  if (!isCloudStorageEnabled()) return null
  const client = ensureCloudReady()

  const { data, error } = await client
    .from(PROFILE_TABLE_NAME)
    .upsert({
      user_id: cachedUserId,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select('display_name')
    .single()
  if (error) throw error
  return data?.display_name || null
}

export async function syncExpenseToCloud(expense) {
  if (!isCloudStorageEnabled()) return
  const client = ensureCloudReady()
  const { error } = await client
    .from(EXPENSE_TABLE_NAME)
    .upsert(toCloudRow(expense), { onConflict: 'user_id,local_id' })
  if (error) throw error
}

export async function deleteExpenseFromCloud(id) {
  if (!isCloudStorageEnabled()) return
  const client = ensureCloudReady()
  const { error } = await client
    .from(EXPENSE_TABLE_NAME)
    .delete()
    .eq('user_id', cachedUserId)
    .eq('local_id', Number(id))
  if (error) throw error
}

export async function deleteAllCloudExpenses() {
  if (!isCloudStorageEnabled()) return
  const client = ensureCloudReady()
  const { error } = await client
    .from(EXPENSE_TABLE_NAME)
    .delete()
    .eq('user_id', cachedUserId)
  if (error) throw error
}

export async function syncAllExpensesToCloud(expenses) {
  const client = ensureCloudReady()
  const rows = expenses.map(toCloudRow)
  if (rows.length === 0) return 0

  const { error } = await client
    .from(EXPENSE_TABLE_NAME)
    .upsert(rows, { onConflict: 'user_id,local_id' })
  if (error) throw error
  return rows.length
}

export async function fetchCloudExpenses() {
  if (!isCloudStorageEnabled()) return []
  const client = ensureCloudReady()
  const { data, error } = await client
    .from(EXPENSE_TABLE_NAME)
    .select('*')
    .eq('user_id', cachedUserId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(fromCloudRow)
}

export async function migrateOldUserId() {
  if (migrationDone) return
  const oldId = localStorage.getItem(OLD_USER_ID_KEY)
  if (!oldId || !cachedUserId || oldId === cachedUserId) {
    migrationDone = true
    return
  }

  const client = ensureCloudReady()

  const { error } = await client.rpc('migrate_accountbook_user', { old_user_id: oldId })
  if (error) throw error

  localStorage.removeItem(OLD_USER_ID_KEY)
  migrationDone = true
}

export async function ensureAuthReady() {
  await initAuth()
  await migrateOldUserId()
}

export function resetMigration() {
  migrationDone = false
}
