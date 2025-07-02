<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-container">
        <div class="header-content">
          <div class="header-left">
            <h1 class="app-title">AI Assistant</h1>
          </div>
          
          <div class="header-right">
            <button class="header-btn" title="Поширити">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.18875 15.0116 5.37498 15.0343 5.55783L8.96572 9.22501C8.48706 8.48484 7.70405 8 6.8 8C5.14315 8 3.8 9.34315 3.8 11C3.8 12.6569 5.14315 14 6.8 14C7.70405 14 8.48706 13.5152 8.96572 12.775L15.0343 16.4422C15.0116 16.625 15 16.8112 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.096 14 16.3129 14.4848 15.8343 15.225L9.76572 11.5578C9.78845 11.375 9.8 11.1888 9.8 11C9.8 10.8112 9.78845 10.625 9.76572 10.4422L15.8343 6.77499C16.3129 7.51516 17.096 8 18 8Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="header-btn" title="Меню">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="19" cy="12" r="1" fill="currentColor"/>
                <circle cx="5" cy="12" r="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-header {
  background-color: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 100%;
  margin: 0 auto;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  min-height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.header-btn:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

.app-main {
  flex: 1;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity var(--transition);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: var(--space-3);
  }
  
  .app-title {
    font-size: var(--font-size-base);
  }
}
</style>
