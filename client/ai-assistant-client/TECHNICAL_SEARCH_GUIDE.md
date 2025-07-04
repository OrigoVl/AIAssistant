# 🔍 Технічний пошук - Посібник для Frontend

## Огляд

Компонент `DocSearch` було оновлено для підтримки **валідації технічних запитів**. Тепер система автоматично відфільтровує нетехнічні запити та надає корисні підказки користувачам.

## 🎯 Нові функції

### 1. Валідація технічних запитів
- ✅ **Технічні запити** (Vue.js, Node.js, TypeScript, GrapesJS) - оброблятимуться
- ❌ **Нетехнічні запити** (їжа, погода, розваги) - будуть відхилені
- ⚠️ **Попередження** - зрозумілі повідомлення з порадами

### 2. Розширені фільтри
- **Вибір технології**: Vue.js, Node.js, TypeScript, GrapesJS
- **Тип пошуку**: Загальний, Документація, Проблеми, API, Troubleshooting

### 3. Покращений UX
- **Візуальні індикатори** - червона рамка для нетехнічних запитів
- **Поради та пропозиції** - конкретні рекомендації для покращення
- **Приклади запитів** - готові технічні запити для демонстрації

## 📋 Приклади використання

### ✅ Технічні запити (працюють)
```
vue component lifecycle
async await в node.js
typescript interface error
grapesjs блоки
API методи
error handling
```

### ❌ Нетехнічні запити (відхиляються)
```
як зварити борщ?
погода завтра
де купити хліб?
фільми для перегляду
```

## 🛠️ Технічні деталі

### Структура відповіді
```typescript
interface CodeSearchResult {
  results: SearchResultWithDetails[]
  totalFound: number
  executionTimeMs: number
  technologiesSearched: string[]
  strategiesUsed: string[]
  recommendations?: string
  warning?: string          // Попередження для нетехнічних запитів
  isTechnical: boolean     // Чи є запит технічним
  suggestions?: string[]   // Поради для покращення
}
```

### GraphQL запити
```graphql
# Основний кодовий пошук
query SearchCode($query: String!, $technologies: [String!]) {
  searchCode(query: $query, technologies: $technologies) {
    isTechnical
    warning
    suggestions
    results {
      document { id title content technology }
      score
    }
  }
}

# Валідація запиту
query ValidateQuery($query: String!) {
  validateQuery(query: $query) {
    isTechnical
    warning
    suggestions
  }
}
```

## 🎨 Візуальні елементи

### Попередження для нетехнічних запитів
```vue
<!-- Автоматично показується для нетехнічних запитів -->
<div class="warning-message card">
  <div class="warning-content">
    <div class="warning-icon">⚠️</div>
    <div class="warning-text">
      <h4>Попередження</h4>
      <div class="suggestions">
        <h5>💡 Поради:</h5>
        <ul>
          <li>Задайте питання про Vue.js, Node.js, TypeScript</li>
          <li>Використовуйте технічні терміни</li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

### Індикатор помилки в полі вводу
```vue
<!-- Червона рамка для нетехнічних запитів -->
<input 
  v-model="searchQuery"
  class="search-input"
  :class="{ 'input-error': showWarning && !isTechnical }"
  placeholder="Введіть технічний запит..."
/>
```

## 📱 Responsive дизайн

- **Мобільні пристрої**: Фільтри стають вертикальними
- **Планшети**: Збережена горизонтальна структура
- **Десктоп**: Повний функціонал

## 🔧 Налаштування

### Додавання нових технічних термінів
```typescript
// server/src/search/code-search.service.ts
const technicalKeywords = [
  'новий_технічний_термін',
  // ... інші терміни
];
```

### Додавання нових стоп-слів
```typescript
const nonTechnicalKeywords = [
  'новий_нетехнічний_термін',
  // ... інші терміни
];
```

## 🚀 Тестування

### Розгорнути локально
```bash
# Backend
cd server
npm run dev

# Frontend
cd client/ai-assistant-client
npm run dev
```

### Перевірити валідацію
1. Введіть "як зварити борщ?" - має показати попередження
2. Введіть "vue component lifecycle" - має показати результати
3. Спробуйте різні фільтри та типи пошуку

## 🎯 Майбутні покращення

- [ ] Додати автокомплетування технічних термінів
- [ ] Розширити список підтримуваних технологій
- [ ] Додати збереження історії пошуку
- [ ] Покращити алгоритм валідації

## 📞 Підтримка

Якщо у вас виникли питання або пропозиції щодо покращення технічного пошуку, будь ласка, створіть issue в репозиторії.

---

**Примітка**: Система працює виключно з технічними запитами. Це забезпечує високу релевантність результатів і кращий користувацький досвід для розробників. 