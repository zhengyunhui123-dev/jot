<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <nav class="bottom-nav">
    <div class="nav-group">
      <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path d="M9 14l2 2 4-4" />
        </svg>
        <span class="nav-label">记账</span>
      </router-link>
      <router-link to="/charts" class="nav-item" :class="{ active: route.path === '/charts' }">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <span class="nav-label">图表</span>
      </router-link>
    </div>

    <button class="nav-add" @click="router.push('/add')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>

    <div class="nav-group">
      <router-link to="/savings" class="nav-item" :class="{ active: route.path === '/savings' }">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3v18" />
          <path d="M7 7.5c0-2.1 2-3.5 5-3.5s5 1.4 5 3.5c0 4-10 2.6-10 6.8C7 16.6 9 18 12 18s5-1.4 5-3.5" />
        </svg>
        <span class="nav-label">省钱</span>
      </router-link>
      <router-link to="/profile" class="nav-item" :class="{ active: route.path === '/profile' }">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="nav-label">我的</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--bg-secondary);
  border-top: 1px solid rgba(26, 26, 46, 0.06);
  z-index: 100;
  padding-left: 16px;
  padding-right: 16px;
}

.nav-group {
  display: flex;
  flex: 1;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.2s ease;
  padding: 8px 12px;
  flex: 1;
  position: relative;
}

.nav-item.active {
  color: var(--accent);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  top: -1px;
  width: 20px;
  height: 2.5px;
  background: var(--accent);
  border-radius: 2px;
}

.nav-svg {
  width: 22px;
  height: 22px;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}

.nav-add {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  box-shadow: var(--shadow-float);
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.nav-add svg {
  width: 22px;
  height: 22px;
}

.nav-add:active {
  transform: scale(0.9);
  box-shadow: 0 2px 8px rgba(240, 160, 48, 0.3);
}
</style>
