<script setup>
import { computed } from 'vue'
import { useExpenseStore } from '../stores/expense.js'
import { categoryMap } from '../data/categories.js'

const store = useExpenseStore()

const maxTotal = computed(() => {
  return Math.max(...store.categoryStats.map(item => item.expense + item.saving), 1)
})
</script>

<template>
  <div class="savings-view">
    <h2 class="page-title">省钱明细</h2>

    <div class="saving-total">
      <span>本月已省钱</span>
      <strong>¥{{ store.totalSaving.toFixed(2) }}</strong>
    </div>

    <div v-if="store.categoryStats.length > 0" class="stat-list">
      <div v-for="item in store.categoryStats" :key="item.category" class="stat-item">
        <div class="stat-icon" :style="{ background: categoryMap[item.category]?.bg || '#eee' }">
          {{ categoryMap[item.category]?.icon || '💰' }}
        </div>
        <div class="stat-body">
          <div class="stat-head">
            <span>{{ categoryMap[item.category]?.name || item.category }}</span>
            <span>支出 ¥{{ item.expense.toFixed(2) }}</span>
          </div>
          <div class="bar-row">
            <div class="bar-track expense">
              <span :style="{ width: `${Math.max(item.expense / maxTotal * 100, item.expense ? 6 : 0)}%` }"></span>
            </div>
            <div class="bar-track saving">
              <span :style="{ width: `${Math.max(item.saving / maxTotal * 100, item.saving ? 6 : 0)}%` }"></span>
            </div>
          </div>
          <div class="saving-line">省钱 ¥{{ item.saving.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">💡</div>
      <p class="empty-text">还没有本月记录</p>
      <p class="empty-hint">记录支出或省钱后，这里会按类型汇总</p>
    </div>
  </div>
</template>

<style scoped>
.savings-view {
  padding: 20px 16px;
}

.page-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.saving-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--green-light);
  color: var(--green);
  box-shadow: var(--shadow-sm);
}

.saving-total span {
  font-size: 13px;
  font-weight: 500;
}

.saving-total strong {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  line-height: 1;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  gap: 12px;
  padding: 13px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.35s ease both;
}

.stat-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-body {
  flex: 1;
  min-width: 0;
}

.stat-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.stat-head span:last-child {
  color: var(--danger);
  white-space: nowrap;
}

.bar-row {
  display: grid;
  gap: 5px;
  margin: 8px 0 5px;
}

.bar-track {
  height: 6px;
  border-radius: 999px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.bar-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.bar-track.expense span {
  background: var(--danger);
}

.bar-track.saving span {
  background: var(--green);
}

.saving-line {
  font-size: 12px;
  color: var(--green);
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
