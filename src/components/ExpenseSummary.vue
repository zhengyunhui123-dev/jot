<script setup>
import { computed } from 'vue'
import { useExpenseStore } from '../stores/expense.js'

const store = useExpenseStore()

const savingCompareText = computed(() => {
  const diff = store.savingDiff
  if (diff > 0) return `比上月多省 ¥${diff.toFixed(2)} ↑`
  if (diff < 0) return `比上月少省 ¥${Math.abs(diff).toFixed(2)} ↓`
  return '和上月省得一样多'
})

const expensePercent = computed(() => (store.totalExpense > 0 ? 100 : 0))
const ringStyle = computed(() => ({
  '--main-color': store.totalExpense > 0 ? '#8a80f4' : '#8a80f4',
  '--green-stop': store.totalExpense > 0 ? '14%' : '0%'
}))
</script>

<template>
  <section class="summary-card glass-card">
    <div class="saving-block">
      <div class="saving-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 8h13a3 3 0 013 3v7a2 2 0 01-2 2H5a3 3 0 01-3-3V10a2 2 0 012-2Z" />
          <path d="M7 8V6.5A2.5 2.5 0 019.5 4H17" />
          <circle cx="17" cy="14" r="2" />
          <path d="M17 13v2M16 14h2" />
        </svg>
      </div>
      <div>
        <span class="summary-label">本月已省钱</span>
        <strong class="saving-amount">¥{{ store.totalSaving.toFixed(2) }}</strong>
        <small>{{ savingCompareText }}</small>
      </div>
    </div>

    <div class="summary-divider"></div>

    <div class="expense-block">
      <span class="summary-label">本月共支出</span>
      <strong class="expense-amount">¥{{ store.totalExpense.toFixed(2) }}</strong>
    </div>

    <div class="ring" :style="ringStyle">
      <div class="ring-center">
        <span>支出占比</span>
        <strong>{{ expensePercent }}%</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.summary-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 1px minmax(0, 0.92fr) 82px;
  align-items: center;
  gap: 15px;
  min-height: 122px;
  margin: 29px 22px 27px;
  padding: 21px 17px 20px;
  border-radius: 30px;
  animation: fadeInUp 0.4s ease both;
}

.saving-block {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.saving-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  color: var(--green);
  background: linear-gradient(135deg, rgba(40, 164, 99, 0.18), rgba(40, 164, 99, 0.06));
  flex-shrink: 0;
}

.summary-label {
  display: block;
  color: #6d769b;
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 4px;
  white-space: nowrap;
}

.saving-amount,
.expense-amount {
  display: block;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0;
}

.saving-amount {
  color: var(--green);
}

.expense-amount {
  color: var(--text-primary);
}

small {
  display: block;
  color: #9aa4c1;
  font-size: 12px;
  font-weight: 700;
  margin-top: 5px;
  white-space: nowrap;
}

.summary-divider {
  width: 1px;
  height: 49px;
  background: rgba(137, 151, 196, 0.22);
}

.expense-block {
  min-width: 0;
}

.ring {
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    conic-gradient(from 0deg, var(--green) 0 var(--green-stop), var(--main-color) var(--green-stop) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

.ring-center {
  width: 56px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
}

.ring-center span {
  font-size: 11px;
  color: #8a94ba;
  font-weight: 700;
}

.ring-center strong {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.25;
}

@media (max-width: 390px) {
  .summary-card {
    grid-template-columns: 1fr 1px 0.8fr;
    gap: 14px;
  }

  .ring {
    display: none;
  }

  .saving-amount,
  .expense-amount {
    font-size: 23px;
  }
}
</style>
