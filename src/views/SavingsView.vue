<script setup>
import { computed } from 'vue'
import { useExpenseStore } from '../stores/expense.js'
import { getCategoryMap } from '../data/categories.js'

const categoryMap = getCategoryMap()
const store = useExpenseStore()

const savingStats = computed(() => store.categoryStats.filter(item => item.saving > 0))
const maxTotal = computed(() => Math.max(...savingStats.value.map(item => item.expense + item.saving), 1))
</script>

<template>
  <div class="savings-view">
    <header class="page-heading">
      <h2 class="page-title">省钱</h2>
    </header>

    <section class="saving-total glass-card">
      <span>本月已省钱</span>
      <strong>¥{{ store.totalSaving.toFixed(2) }}</strong>
    </section>

    <div v-if="savingStats.length > 0" class="stat-list glass-card">
      <div v-for="item in savingStats" :key="item.category" class="stat-item">
        <div class="stat-icon" :style="{ background: categoryMap[item.category]?.bg || '#eef2fb', color: categoryMap[item.category]?.color || 'var(--accent)' }">
          {{ categoryMap[item.category]?.icon || '¥' }}
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

    <div v-else class="empty glass-card">
      <div class="empty-icon">¥</div>
      <p class="empty-text">还没有省钱记录</p>
      <p class="empty-hint">记录省钱金额后，这里会按类型汇总</p>
    </div>
  </div>
</template>

<style scoped>
.savings-view {
  min-height: 100%;
  padding: 0 22px 24px;
}

.page-heading {
  padding-left: 2px;
  padding-right: 2px;
}

.saving-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 22px 20px;
  border-radius: var(--radius-xl);
  color: var(--green);
}

.saving-total span {
  font-size: 15px;
  font-weight: 800;
}

.saving-total strong {
  font-size: 32px;
  line-height: 1;
  font-weight: 800;
}

.stat-list {
  overflow: hidden;
  border-radius: var(--radius-xl);
}

.stat-item {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 14px;
  padding: 16px 18px;
  animation: fadeInUp 0.35s ease both;
}

.stat-item + .stat-item {
  border-top: 1px solid rgba(137, 151, 196, 0.16);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  font-size: 23px;
  border-radius: 17px;
}

.stat-body {
  min-width: 0;
}

.stat-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
}

.stat-head span:last-child {
  color: var(--danger);
  white-space: nowrap;
}

.bar-row {
  display: grid;
  gap: 6px;
  margin: 10px 0 6px;
}

.bar-track {
  height: 7px;
  border-radius: 999px;
  background: #eef2fb;
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
  color: var(--green);
  font-size: 13px;
  font-weight: 800;
}

.empty {
  text-align: center;
  padding: 54px 20px;
  border-radius: var(--radius-xl);
}

.empty-icon {
  width: 52px;
  height: 52px;
  display: inline-grid;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 50%;
  color: #fff;
  background: #9aa4c1;
  font-size: 26px;
  font-weight: 800;
}

.empty-text {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
}

.empty-hint {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}
</style>
