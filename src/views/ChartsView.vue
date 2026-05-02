<script setup>
import { ref, computed } from 'vue'
import { useExpenseStore } from '../stores/expense.js'
import { getCategoryMap } from '../data/categories.js'

const store = useExpenseStore()
const categoryMap = getCategoryMap()
const rankType = ref('expense')

const rankings = computed(() => {
  const map = {}
  store.monthExpenses.forEach(e => {
    if (!map[e.category]) {
      map[e.category] = { category: e.category, expense: 0, saving: 0, count: 0 }
    }
    map[e.category].expense += e.amount
    map[e.category].saving += e.savingAmount || 0
    map[e.category].count++
  })
  const list = Object.values(map)
  if (rankType.value === 'expense') {
    list.sort((a, b) => b.expense - a.expense)
  } else {
    list.sort((a, b) => b.saving - a.saving)
  }
  return list
})

const maxAmount = computed(() => {
  if (rankings.value.length === 0) return 1
  const key = rankType.value === 'expense' ? 'expense' : 'saving'
  return Math.max(...rankings.value.map(item => item[key]), 1)
})

const totalExpense = computed(() => store.monthExpenses.reduce((s, e) => s + e.amount, 0))
const totalSaving = computed(() => store.monthExpenses.reduce((s, e) => s + (e.savingAmount || 0), 0))
</script>

<template>
  <div class="charts-view">
    <h2 class="page-title">排行榜</h2>

    <div class="toggle-row">
      <button
        class="toggle-btn"
        :class="{ active: rankType === 'expense' }"
        @click="rankType = 'expense'"
      >支出排行</button>
      <button
        class="toggle-btn"
        :class="{ active: rankType === 'saving' }"
        @click="rankType = 'saving'"
      >省钱排行</button>
    </div>

    <div class="summary-bar">
      <div class="summary-item" v-if="rankType === 'expense'">
        <span class="summary-label">本月总支出</span>
        <span class="summary-value">¥{{ totalExpense.toFixed(2) }}</span>
      </div>
      <div class="summary-item" v-else>
        <span class="summary-label">本月总省钱</span>
        <span class="summary-value green">¥{{ totalSaving.toFixed(2) }}</span>
      </div>
    </div>

    <div v-if="rankings.length > 0" class="rank-list">
      <div
        v-for="(item, index) in rankings"
        :key="item.category"
        class="rank-item"
        :style="{ animationDelay: index * 0.05 + 's' }"
      >
        <div class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</div>
        <div class="rank-icon" :style="{ background: categoryMap[item.category]?.bg || '#eee' }">
          {{ categoryMap[item.category]?.icon || '💰' }}
        </div>
        <div class="rank-body">
          <div class="rank-head">
            <span class="rank-name">{{ categoryMap[item.category]?.name || item.category }}</span>
            <span class="rank-amount">
              ¥{{ (rankType === 'expense' ? item.expense : item.saving).toFixed(2) }}
            </span>
          </div>
          <div class="rank-bar-track">
            <div
              class="rank-bar-fill"
              :class="rankType"
              :style="{ width: `${(rankType === 'expense' ? item.expense : item.saving) / maxAmount * 100}%` }"
            ></div>
          </div>
          <div class="rank-meta">
            <span>{{ item.count }}笔</span>
            <span v-if="rankType === 'expense' && item.saving > 0" class="meta-saving">
              省 ¥{{ item.saving.toFixed(2) }}
            </span>
            <span v-if="rankType === 'saving' && item.expense > 0" class="meta-expense">
              支出 ¥{{ item.expense.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">🏆</div>
      <p class="empty-text">暂无数据</p>
      <p class="empty-hint">添加记账记录后查看排行榜</p>
    </div>
  </div>
</template>

<style scoped>
.charts-view {
  padding: 20px 16px;
}

.page-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.toggle-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.toggle-btn.active {
  color: #fff;
  background: var(--accent);
  box-shadow: var(--shadow-float);
}

.summary-bar {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.3s ease both;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.summary-value {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-value.green {
  color: var(--green);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.35s ease both;
}

.rank-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  border-radius: 8px;
  flex-shrink: 0;
}

.rank-num.top {
  color: #fff;
  background: var(--accent);
}

.rank-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 12px;
  flex-shrink: 0;
}

.rank-body {
  flex: 1;
  min-width: 0;
}

.rank-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.rank-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.rank-amount {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.rank-bar-track {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.rank-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.rank-bar-fill.expense {
  background: var(--danger);
}

.rank-bar-fill.saving {
  background: var(--green);
}

.rank-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
}

.meta-saving {
  color: var(--green);
  font-weight: 500;
}

.meta-expense {
  color: var(--danger);
  font-weight: 500;
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
