<script setup>
import { ref, onMounted } from 'vue'
import { useExpenseStore } from '../stores/expense.js'
import db from '../db/index.js'

const store = useExpenseStore()
const storageSize = ref('计算中...')
const totalRecords = ref(0)

async function calcStorageSize() {
  try {
    const data = await db.expenses.toArray()
    totalRecords.value = data.length
    const json = JSON.stringify(data)
    const bytes = new Blob([json]).size
    if (bytes < 1024) {
      storageSize.value = bytes + ' B'
    } else if (bytes < 1024 * 1024) {
      storageSize.value = (bytes / 1024).toFixed(1) + ' KB'
    } else {
      storageSize.value = (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
  } catch {
    storageSize.value = '计算失败'
  }
}

onMounted(calcStorageSize)

async function exportData() {
  try {
    const data = await db.expenses.toArray()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `记账本备份_${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('导出失败')
  }
}

async function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const imported = JSON.parse(text)
      if (!Array.isArray(imported)) {
        alert('文件格式不正确')
        return
      }

      const existing = await db.expenses.toArray()
      const existingIds = new Set(existing.map(e => e.id))
      const duplicates = imported.filter(item => existingIds.has(item.id))

      if (duplicates.length > 0) {
        const confirmed = confirm(
          `发现 ${duplicates.length} 条与现有数据重复的记录，确定要导入吗？\n\n重复数据将被覆盖。`
        )
        if (!confirmed) return
      } else {
        const confirmed = confirm(`确定要导入 ${imported.length} 条记录吗？`)
        if (!confirmed) return
      }

      await db.expenses.bulkPut(imported)
      await store.loadExpenses()
      await calcStorageSize()
      alert(`成功导入 ${imported.length} 条记录`)
    } catch {
      alert('导入失败，请检查文件格式')
    }
  }
  input.click()
}

async function clearAll() {
  if (confirm('确定清除所有记账数据吗？此操作不可恢复。')) {
    await db.expenses.clear()
    store.expenses = []
    await calcStorageSize()
    alert('数据已清除')
  }
}
</script>

<template>
  <div class="profile-view">
    <h2 class="page-title">我的</h2>

    <div class="section">
      <div class="section-title">数据存储</div>
      <div class="storage-card">
        <div class="storage-row">
          <span class="storage-label">存储大小</span>
          <span class="storage-value">{{ storageSize }}</span>
        </div>
        <div class="storage-row">
          <span class="storage-label">记录条数</span>
          <span class="storage-value">{{ totalRecords }} 条</span>
        </div>
        <div class="storage-hint">
          数据保存在浏览器本地存储中（IndexedDB），清除浏览器数据会导致丢失。建议定期导出备份。
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">数据备份</div>
      <button class="action-btn" @click="exportData">
        <div class="action-left">
          <span class="action-icon export-icon">📤</span>
          <div>
            <span class="action-name">数据导出</span>
            <span class="action-desc">导出所有记账数据到本地文件</span>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <button class="action-btn" @click="importData">
        <div class="action-left">
          <span class="action-icon import-icon">📥</span>
          <div>
            <span class="action-name">数据导入</span>
            <span class="action-desc">从备份文件恢复记账数据</span>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="section">
      <button class="danger-btn" @click="clearAll">
        <span>清除所有数据</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding: 20px 16px;
}

.page-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.section {
  margin-bottom: 20px;
  animation: fadeInUp 0.4s ease both;
}

.section:nth-child(2) {
  animation-delay: 0.05s;
}

.section:nth-child(3) {
  animation-delay: 0.1s;
}

.section:nth-child(4) {
  animation-delay: 0.15s;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 10px;
  padding-left: 2px;
}

.storage-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.storage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.storage-row + .storage-row {
  border-top: 1px solid var(--bg-tertiary);
}

.storage-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.storage-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Noto Serif SC', serif;
}

.storage-hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.action-btn {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.action-btn + .action-btn {
  margin-top: 10px;
}

.action-btn:active {
  background: var(--bg-tertiary);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-icon {
  font-size: 22px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.export-icon {
  background: #e4ecf2;
}

.import-icon {
  background: #e8f0ea;
}

.action-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: left;
}

.action-desc {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
  text-align: left;
}

.action-btn > svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.danger-btn {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg-card);
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.danger-btn:active {
  background: var(--danger-light);
}
</style>
