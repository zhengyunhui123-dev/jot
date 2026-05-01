<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExpenseStore } from '../stores/expense.js'
import AmountKeypad from './AmountKeypad.vue'
import { categories } from '../data/categories.js'

const router = useRouter()
const route = useRoute()
const store = useExpenseStore()

const isEdit = computed(() => !!route.params.id)
const editId = computed(() => isEdit.value ? Number(route.params.id) : null)

const selectedCategory = ref('')
const amount = ref('')
const expectedAmount = ref('')
const paymentMethod = ref(localStorage.getItem('lastPaymentMethod') || 'credit')
const entryMode = ref('expense')
const savingReason = ref('coupon')
const savingStep = ref('expected')
const showSheet = ref(false)

const savingReasons = [
  { key: 'coupon', name: '用了优惠券' },
  { key: 'skip', name: '不买了' },
  { key: 'walk', name: '走路/替代' },
  { key: 'discount', name: '折扣/低价' }
]

// 编辑模式：预填数据
if (isEdit.value) {
  const expense = store.expenses.find(e => e.id === editId.value)
  if (expense) {
    selectedCategory.value = expense.category
    amount.value = String(expense.amount)
    expectedAmount.value = expense.expectedAmount ? String(expense.expectedAmount) : ''
    paymentMethod.value = expense.paymentMethod
    entryMode.value = expense.savingAmount ? 'saving' : 'expense'
    savingReason.value = expense.savingReason || 'coupon'
    savingStep.value = expense.savingAmount ? 'actual' : 'expected'
    showSheet.value = true
  }
}

function selectCategory(cat) {
  selectedCategory.value = cat
  savingStep.value = 'expected'
  showSheet.value = true
}

function setEntryMode(mode) {
  entryMode.value = mode
  savingStep.value = 'expected'
}

function setPaymentMethod(method) {
  paymentMethod.value = method
  localStorage.setItem('lastPaymentMethod', method)
}

function closeSheet() {
  showSheet.value = false
  if (!isEdit.value) {
    selectedCategory.value = ''
    amount.value = ''
    expectedAmount.value = ''
    paymentMethod.value = localStorage.getItem('lastPaymentMethod') || 'credit'
    entryMode.value = 'expense'
    savingReason.value = 'coupon'
    savingStep.value = 'expected'
  }
}

function nextSavingStep() {
  const expected = parseFloat(expectedAmount.value)
  if (Number.isNaN(expected) || expected <= 0) return
  savingStep.value = 'actual'
}

async function save() {
  const num = parseFloat(amount.value)
  const expected = parseFloat(expectedAmount.value)
  const isSaving = entryMode.value === 'saving'
  if (!selectedCategory.value || Number.isNaN(num) || num < 0) return
  if (!isSaving && num <= 0) return
  if (isSaving && (Number.isNaN(expected) || expected <= num)) return
  localStorage.setItem('lastPaymentMethod', paymentMethod.value)

  const today = new Date().toISOString().slice(0, 10)
  const data = {
    category: selectedCategory.value,
    amount: num,
    paymentMethod: paymentMethod.value,
    date: isEdit.value ? store.expenses.find(e => e.id === editId.value)?.date || today : today,
    expectedAmount: isSaving ? expected : null,
    savingAmount: isSaving ? Number((expected - num).toFixed(2)) : 0,
    savingReason: isSaving ? savingReason.value : '',
    note: ''
  }

  if (isEdit.value) {
    await store.updateExpense(editId.value, data)
  } else {
    await store.addExpense(data)
  }
  router.back()
}

async function remove() {
  if (confirm('确定删除这条记录吗？')) {
    await store.deleteExpense(editId.value)
    router.back()
  }
}
</script>

<template>
  <div class="expense-form">
    <div class="form-header">
      <button class="back-btn" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2>{{ isEdit ? '编辑记录' : '记一笔' }}</h2>
      <button v-if="isEdit" class="delete-btn" @click="remove">删除</button>
      <span v-else class="header-spacer"></span>
    </div>

    <div class="type-toggle">
      <button
        class="type-btn"
        :class="{ active: entryMode === 'expense' }"
        @click="setEntryMode('expense')"
      >支出</button>
      <button
        class="type-btn"
        :class="{ active: entryMode === 'saving' }"
        @click="setEntryMode('saving')"
      >省钱</button>
    </div>

    <div class="category-grid">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="cat-item"
        :class="{ selected: selectedCategory === cat.key }"
        @click="selectCategory(cat.key)"
      >
        <span class="cat-icon" :style="{ background: cat.bg }">{{ cat.icon }}</span>
        <span class="cat-name">{{ cat.name }}</span>
      </button>
    </div>

    <!-- 底部弹窗 -->
    <transition name="sheet">
      <div v-if="showSheet" class="sheet-overlay" @click.self="closeSheet">
        <div class="sheet">
          <div class="sheet-header">
            <span class="sheet-title">{{ entryMode === 'saving' ? '记录省钱支出' : '选择支付方式' }}</span>
            <button class="sheet-close" @click="closeSheet">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div v-if="entryMode === 'expense' || savingStep === 'actual'" class="payment-row">
            <button
              class="payment-btn"
              :class="{ active: paymentMethod === 'credit' }"
              @click="setPaymentMethod('credit')"
            >信用卡</button>
            <button
              class="payment-btn"
              :class="{ active: paymentMethod === 'cash' }"
              @click="setPaymentMethod('cash')"
            >现金</button>
          </div>

          <div v-if="entryMode === 'saving'" class="saving-panel">
            <div class="step-row">
              <span class="step-pill" :class="{ active: savingStep === 'expected' }">1 应花多少</span>
              <span class="step-line"></span>
              <span class="step-pill" :class="{ active: savingStep === 'actual' }">2 实际花了</span>
            </div>
            <div v-if="savingStep === 'actual'" class="saving-preview">
              应花 ¥{{ Number(expectedAmount || 0).toFixed(2) }}
            </div>
            <div v-if="savingStep === 'expected'" class="reason-row">
              <button
                v-for="reason in savingReasons"
                :key="reason.key"
                class="reason-btn"
                :class="{ active: savingReason === reason.key }"
                @click="savingReason = reason.key"
              >{{ reason.name }}</button>
            </div>
          </div>

          <div v-if="entryMode === 'saving'" class="actual-label">
            {{ savingStep === 'expected' ? '应花多少' : '实际花了' }}
          </div>

          <AmountKeypad v-if="entryMode === 'saving' && savingStep === 'expected'" v-model="expectedAmount" />
          <AmountKeypad v-else v-model="amount" />

          <div class="sheet-footer">
            <button
              v-if="entryMode === 'saving' && savingStep === 'expected'"
              class="save-btn"
              @click="nextSavingStep"
            >下一步：实际花了</button>
            <button v-else class="save-btn" @click="save">保存</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.expense-form {
  min-height: 100%;
  background: var(--bg-primary);
  position: relative;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.form-header h2 {
  font-size: 17px;
  font-weight: 600;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--text-secondary);
}

.back-btn:active {
  background: var(--bg-tertiary);
}

.delete-btn {
  font-size: 14px;
  padding: 6px 12px;
  color: var(--danger);
  border-radius: 8px;
  font-weight: 500;
}

.header-spacer {
  width: 36px;
}

.type-toggle {
  display: flex;
  gap: 10px;
  padding: 20px 16px 12px;
}

.type-btn {
  flex: 1;
  padding: 7px 22px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.type-btn.active {
  color: #fff;
  background: var(--accent);
  box-shadow: var(--shadow-float);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 8px 16px;
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 4px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.cat-item.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.cat-item:active {
  transform: scale(0.95);
}

.cat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 14px;
}

.cat-name {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.cat-item.selected .cat-name {
  color: var(--accent);
  font-weight: 600;
}

/* 底部弹窗 */
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(44, 24, 16, 0.3);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet {
  width: 100%;
  max-width: 480px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 0 16px 32px;
  box-shadow: 0 -8px 32px rgba(44, 24, 16, 0.15);
  max-height: 75vh;
  overflow-y: auto;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 4px 14px;
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 1;
}

.sheet-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.sheet-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-muted);
  transition: background 0.15s;
}

.sheet-close:active {
  background: var(--bg-tertiary);
}

.payment-row {
  display: flex;
  gap: 10px;
  padding: 0 4px 12px;
}

.payment-btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.payment-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}

.payment-btn:active {
  transform: scale(0.97);
}

.saving-panel {
  margin: 2px 4px 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.actual-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 500;
}

.actual-label {
  padding: 0 20px;
  margin-top: 4px;
}

.step-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

.step-pill.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.step-line {
  flex: 1;
  height: 1px;
  background: rgba(44, 24, 16, 0.08);
}

.saving-preview {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.reason-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.reason-btn {
  padding: 9px 8px;
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.reason-btn.active {
  background: var(--green-light);
  color: var(--green);
  box-shadow: inset 0 0 0 1px rgba(34, 160, 96, 0.25);
}

.sheet-footer {
  padding: 12px 4px 0;
}

.save-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-float);
  transition: all 0.2s ease;
}

.save-btn:active {
  transform: scale(0.98);
}

/* 弹窗动画 */
.sheet-enter-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .sheet {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-leave-active .sheet {
  transition: transform 0.2s ease;
}

.sheet-enter-from {
  opacity: 0;
}
.sheet-enter-from .sheet {
  transform: translateY(100%);
}
.sheet-leave-to {
  opacity: 0;
}
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>
