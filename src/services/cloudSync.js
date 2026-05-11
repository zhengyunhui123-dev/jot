import { createClient } from '@supabase/supabase-js'
import { getUserId, getUserProfile, setUserDisplayName } from './userIdentity.js'

const STORAGE_MODE_KEY = 'accountbook:storage-mode'
const EXPENSE_TABLE_NAME = 'accountbook_expenses'
const PROFILE_TABLE_NAME = 'accountbook_profiles'
const CLOUD_MODE = 'cloud'
const LOCAL_MODE = 'local'

let supabaseClient = null

function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
}

function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig()
  if (!url || !anonKey) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      global: {
        headers: {
          'x-accountbook-user-id': getUserId()
        }
      }
    })
  }
  return supabaseClient
}

function toCloudRow(expense) {
  return {
    user_id: getUserId(),
    local_id: Number(expense.id),
    date: expense.date,
    category: expense.category,
    amount: Number(expense.amount || 0),
    payment_method: expense.paymentMethod || '',
    expected_amount: expense.expectedAmount ?? null,
    saving_amount: expense.savingAmount ?? 0,
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

export async function syncUserProfileToCloud(profile = getUserProfile()) {
  if (!isCloudStorageEnabled()) return profile
  const client = ensureCloudReady()

  const { data: existing, error: existingError } = await client
    .from(PROFILE_TABLE_NAME)
    .select('display_name')
    .eq('user_id', profile.userId)
    .maybeSingle()
  if (existingError) throw existingError
  if (existing?.display_name) {
    setUserDisplayName(existing.display_name)
    return { ...profile, displayName: existing.display_name }
  }

  const { data, error } = await client
    .from(PROFILE_TABLE_NAME)
    .insert({
      user_id: profile.userId,
      updated_at: new Date().toISOString()
    })
    .select('display_name')
    .single()
  if (error) throw error
  if (data?.display_name) {
    setUserDisplayName(data.display_name)
    return { ...profile, displayName: data.display_name }
  }
  return profile
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
    .eq('user_id', getUserId())
    .eq('local_id', Number(id))
  if (error) throw error
}

export async function deleteAllCloudExpenses() {
  if (!isCloudStorageEnabled()) return
  const client = ensureCloudReady()
  const { error } = await client
    .from(EXPENSE_TABLE_NAME)
    .delete()
    .eq('user_id', getUserId())
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
    .eq('user_id', getUserId())
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(fromCloudRow)
}
