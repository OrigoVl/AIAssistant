<template>
  <div 
    ref="chatContainer"
    class="messages-container"
  >
    <!-- Empty State -->
    <div v-if="!hasMessages" class="empty-state">
      <h2>Як можу допомогти з {{ currentTechnology?.label }}?</h2>
    </div>

    <!-- Messages -->
    <div 
      v-for="message in messages" 
      :key="message.id" 
      class="message-group fade-in"
    >
      <!-- User Question -->
      <div class="user-message">
        <div class="message-content">
          <!-- User Image if exists -->
          <div v-if="message.imageUrl" class="message-image">
            <img :src="getImageUrl(message.imageUrl)" alt="User uploaded image" />
          </div>
          {{ message.question }}
        </div>
      </div>

      <!-- AI Answer -->
      <div class="assistant-message">
        <div class="assistant-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="message-content">
          <!-- Loading State -->
          <div v-if="isMessageLoading(message)" class="loading">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <!-- Image Description -->
          <div v-if="message.imageDescription" class="image-description">
            <strong>Опис зображення:</strong> {{ message.imageDescription }}
          </div>
          
          <!-- Extracted Text -->
          <div v-if="message.extractedText" class="extracted-text">
            <strong>Витягнутий текст:</strong>
            <pre>{{ message.extractedText }}</pre>
          </div>
          
          <!-- Answer Content -->
          <div 
            v-if="message.answer" 
            class="message-text"
            v-html="renderMarkdown(message.answer)"
          />
          
          <!-- Sources -->
          <div v-if="message.answer && message.sources.length > 0" class="sources">
            <div class="sources-title">Джерела:</div>
            <div class="sources-list">
              <a
                v-for="(source, idx) in message.sources"
                :key="idx"
                :href="source.source"
                target="_blank"
                rel="noopener noreferrer"
                class="source-link"
              >
                {{ idx + 1 }}. {{ getSourceDomain(source.source) }}
              </a>
            </div>
          </div>
          
          <!-- Message Actions -->
          <div v-if="message.answer && !isMessageLoading(message)" class="message-actions">
            <button class="action-btn" title="Копіювати" @click="copyMessage(message.answer)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import type { ChatMessage, Technology } from '@/types'

interface Props {
  messages: ChatMessage[]
  hasMessages: boolean
  currentTechnology?: Technology
  isMessageLoading: (message: ChatMessage) => boolean
}

interface Emits {
  (e: 'scroll-to-bottom'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const chatContainer = ref<HTMLElement>()

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

// Watch for new messages and auto-scroll
watch(() => props.messages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

function scrollToBottom(): void {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  
  let decoded = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  const rendered = md.render(decoded)
  return rendered
}

function getSourceDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function getImageUrl(imagePath: string): string {
  // Convert server path to URL
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `http://localhost:4000/uploads/${imagePath.split('/').pop()}`
}

async function copyMessage(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  margin: 0;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* User Message */
.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-message .message-content {
  max-width: 70%;
  padding: var(--space-4);
  background-color: var(--color-message-user);
  color: var(--color-text);
  border-radius: var(--radius-2xl);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

/* Assistant Message */
.assistant-message {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.assistant-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--color-accent);
  color: var(--color-background);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assistant-message .message-content {
  flex: 1;
  color: var(--color-text);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

/* Loading */
.loading {
  padding: var(--space-2) 0;
}

.typing-indicator {
  display: flex;
  gap: var(--space-1);
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: var(--color-text-muted);
  border-radius: var(--radius-full);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* Sources */
.sources {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.sources-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.source-link {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

/* Message Actions */
.message-actions {
  margin-top: var(--space-3);
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius-base);
  padding: var(--space-1);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
}

/* Image Display in Messages */
.message-image {
  margin-bottom: var(--space-2);
}

.message-image img {
  max-width: 300px;
  max-height: 200px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.image-description {
  background-color: var(--color-surface-variant);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  border-left: 4px solid var(--color-accent);
}

.extracted-text {
  background-color: var(--color-code-bg);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  border-left: 4px solid var(--color-accent);
}

.extracted-text pre {
  color: var(--color-text);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  margin: 0;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .messages-container {
    padding: var(--space-4) var(--space-3);
    gap: var(--space-4);
  }
  
  .user-message .message-content {
    max-width: 85%;
  }
  
  .empty-state h2 {
    font-size: var(--font-size-xl);
  }
}
</style> 