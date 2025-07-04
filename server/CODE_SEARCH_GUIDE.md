# 🔍 Посібник з кодового пошуку

Цей документ описує як використовувати спеціалізований кодовий пошук, який обмежує результати виключно технологіями коду: **Vue.js**, **Node.js**, **TypeScript** та **GrapesJS**.

## 📋 Зміст
1. [Огляд функціоналу](#огляд-функціоналу)
2. [GraphQL запити](#graphql-запити)
3. [Практичні приклади](#практичні-приклади)
4. [Стратегії пошуку](#стратегії-пошуку)
5. [Інтеграція у frontend](#інтеграція-у-frontend)

## 🎯 Огляд функціоналу

### Підтримувані технології
- **Vue.js** (`vue`) - Progressive JavaScript framework
- **Node.js** (`node`) - JavaScript runtime environment
- **TypeScript** (`typescript`) - Typed superset of JavaScript
- **GrapesJS** (`grapesjs`) - Web Builder Framework

### Типи пошуку
- **Загальний кодовий пошук** - по всіх технологіях
- **По конкретній технології** - обмеження до однієї технології
- **Тільки документація** - пошук в офіційній документації
- **Тільки issues** - пошук проблем і вирішень
- **API пошук** - спеціалізований пошук методів і функцій
- **Troubleshooting** - пошук помилок і вирішень

## 🔧 GraphQL запити

### 0. Валідація технічного запиту

```graphql
query ValidateQuery($query: String!) {
  validateQuery(query: $query) {
    isTechnical
    warning
    suggestions
  }
}
```

**Змінні:**
```json
{
  "query": "як зварити борщ?"
}
```

**Результат для нетехнічного запиту:**
```json
{
  "data": {
    "validateQuery": {
      "isTechnical": false,
      "warning": "🤖 Цей сервіс працює тільки з технічними запитами про програмування. Ваш запит здається нетехнічним.",
      "suggestions": [
        "Задайте питання про Vue.js, Node.js, TypeScript або GrapesJS",
        "Приклади: \"як створити компонент у Vue\", \"async/await в Node.js\", \"типи в TypeScript\"",
        "Якщо у вас технічна проблема, опишіть її детальніше"
      ]
    }
  }
}
```

### 1. Загальний кодовий пошук

```graphql
query SearchCode($query: String!, $technologies: [String!], $limit: Int) {
  searchCode(query: $query, technologies: $technologies, limit: $limit) {
    results {
      document {
        id
        title
        content
        technology
        type
        source
      }
      score
      matchType
      matchDetails
    }
    totalFound
    executionTimeMs
    technologiesSearched
    strategiesUsed
    recommendations
  }
}
```

**Змінні:**
```json
{
  "query": "component lifecycle",
  "technologies": ["vue", "typescript"],
  "limit": 10
}
```

### 2. Пошук по конкретній технології

```graphql
query SearchByTechnology($technology: String!, $query: String!, $limit: Int) {
  searchByTechnology(technology: $technology, query: $query, limit: $limit) {
    results {
      document {
        title
        content
        technology
      }
      score
      matchType
    }
    totalFound
    recommendations
  }
}
```

**Змінні:**
```json
{
  "technology": "vue",
  "query": "computed properties",
  "limit": 5
}
```

### 3. Пошук тільки документації

```graphql
query SearchCodeDocumentation($query: String!, $technologies: [String!]) {
  searchCodeDocumentation(query: $query, technologies: $technologies) {
    results {
      document {
        title
        technology
        type
        source
      }
      score
    }
    strategiesUsed
    recommendations
  }
}
```

### 4. Пошук проблем (Issues)

```graphql
query SearchCodeIssues($query: String!, $technologies: [String!]) {
  searchCodeIssues(query: $query, technologies: $technologies) {
    results {
      document {
        title
        content
        technology
        type
      }
      score
      matchType
    }
    totalFound
  }
}
```

### 5. API пошук

```graphql
query SearchAPI($query: String!, $technologies: [String!]) {
  searchAPI(query: $query, technologies: $technologies) {
    results {
      document {
        title
        content
        technology
      }
      score
    }
    recommendations
  }
}
```

### 6. Troubleshooting пошук

```graphql
query SearchTroubleshooting($query: String!, $technologies: [String!]) {
  searchTroubleshooting(query: $query, technologies: $technologies) {
    results {
      document {
        title
        content
        technology
        type
      }
      score
      matchType
    }
    strategiesUsed
  }
}
```

### 7. Отримання підтримуваних технологій

```graphql
query GetCodeTechnologies {
  getCodeTechnologies {
    value
    label
    description
  }
}
```

### 8. Рекомендації для запиту

```graphql
query GetCodeSearchRecommendations($query: String!) {
  getCodeSearchRecommendations(query: $query)
}
```

## 💡 Практичні приклади

### Приклад 0: Обробка нетехнічних запитів

```graphql
query SearchCodeWithValidation($query: String!) {
  searchCode(query: $query) {
    isTechnical
    warning
    suggestions
    results {
      document {
        title
        content
        technology
      }
      score
    }
    totalFound
    recommendations
  }
}
```

**Змінні для нетехнічного запиту:**
```json
{
  "query": "як зварити борщ?"
}
```

**Результат:**
```json
{
  "data": {
    "searchCode": {
      "isTechnical": false,
      "warning": "🤖 Цей сервіс працює тільки з технічними запитами про програмування. Ваш запит здається нетехнічним.",
      "suggestions": [
        "Задайте питання про Vue.js, Node.js, TypeScript або GrapesJS",
        "Приклади: \"як створити компонент у Vue\", \"async/await в Node.js\", \"типи в TypeScript\"",
        "Якщо у вас технічна проблема, опишіть її детальніше"
      ],
      "results": [],
      "totalFound": 0,
      "recommendations": null
    }
  }
}
```

### Приклад 1: Пошук Vue.js компонентів

```graphql
query {
  searchByTechnology(technology: "vue", query: "component props validation") {
    results {
      document {
        title
        content
        source
      }
      score
    }
    recommendations
  }
}
```

### Приклад 2: Пошук TypeScript помилок

```graphql
query {
  searchTroubleshooting(query: "typescript compilation error", technologies: ["typescript"]) {
    results {
      document {
        title
        technology
        type
      }
      score
      matchType
    }
    strategiesUsed
  }
}
```

### Приклад 3: Пошук Node.js API

```graphql
query {
  searchAPI(query: "fs readFile async", technologies: ["node"]) {
    results {
      document {
        title
        content
        source
      }
      score
    }
  }
}
```

### Приклад 4: Багатотехнологічний пошук

```graphql
query {
  searchCode(query: "async await patterns", technologies: ["node", "typescript"]) {
    results {
      document {
        title
        technology
        type
      }
      score
    }
    technologiesSearched
    strategiesUsed
  }
}
```

### Приклад 5: Форсований пошук (пропуск валідації)

Якщо ви впевнені, що ваш запит технічний, але система його не розпізнає, можете використати опцію `skipTechnicalValidation`:

```graphql
query ForceSearch($query: String!) {
  searchCode(query: $query, skipTechnicalValidation: true) {
    isTechnical
    warning
    results {
      document {
        title
        content
        technology
      }
      score
    }
    totalFound
  }
}
```

**Увага:** Цю опцію слід використовувати обережно, тільки якщо ви впевнені, що запит стосується програмування.

## 🎯 Стратегії пошуку

Система автоматично обирає оптимальні стратегії на основі запиту:

### Для коротких запитів (< 10 символів):
- `lexical` - точний пошук ключових слів
- `fuzzy` - нечіткий пошук для похибок

### Для довгих запитів (> 20 символів):
- `fulltext` - повнотекстовий пошук PostgreSQL
- `bm25` - алгоритм ранжування BM25

### Для запитів з помилками:
- `rule_based` - пошук на основі правил
- `ngram` - пошук часткових збігів

### Для API запитів:
- `bm25` - найкраще ранжування
- `lexical` - точний пошук термінів

### За замовчуванням:
- `bm25` + `rule_based`

## 🖥️ Інтеграція у frontend

### Основні принципи інтеграції

1. **Використання GraphQL запитів** - всі запити виконуються через GraphQL API
2. **Валідація запитів** - перевірка технічності запиту перед відправкою
3. **Обробка попереджень** - відображення повідомлень про нетехнічні запити
4. **Візуальні індикатори** - підсвічування стану валідації
5. **Responsive дизайн** - адаптація під різні пристрої

### Ключові функції для реалізації

1. **Валідація запитів**:
   - Дебаунсинг валідації (500мс)
   - Блокування нетехнічних запитів
   - Відображення попереджень і порад

2. **Обробка результатів**:
   - Парсинг GraphQL відповідей
   - Відображення результатів пошуку
   - Обробка помилок

3. **Візуальна індикація**:
   - Червона рамка для нетехнічних запитів
   - Попередження вгорі екрану
   - Динамічні placeholder'и

4. **Responsive поведінка**:
   - Адаптація для мобільних пристроїв
   - Вертикальне розташування попереджень
   - Компактні елементи управління

## 🚫 Валідація технічних запитів

### Що було додано?

**Система валідації технічних запитів** автоматично перевіряє чи стосується ваш запит програмування і кодування. Це запобігає нетехнічним запитам та надає корисні поради.

### Як це працює?

1. **Технічні ключові слова**: Система розпізнає понад 50 технічних термінів
2. **Нетехнічні стоп-слова**: Визначає понад 80 нетехнічних тем (їжа, побут, здоров'я, тощо)
3. **Патерни запитів**: Розпізнає типові структури технічних питань
4. **Контекстний аналіз**: Враховує загальний контекст запиту

### Приклади валідації

**✅ Технічні запити (будуть оброблені):**
- "vue component lifecycle"
- "typescript interface error"
- "node express middleware"
- "async await в JavaScript"
- "помилка компіляції TypeScript"

**❌ Нетехнічні запити (будуть відхилені):**
- "як зварити борщ?"
- "погода завтра"
- "де купити хліб"
- "фільми для перегляду"
- "рецепт млинців"

**⚠️ Сумнівні запити (попередження):**
- Короткі запити (< 2 символів)
- Загальні терміни без технічного контексту

### Структура відповіді

Всі запити до кодового пошуку тепер повертають:

```typescript
interface CodeSearchResult {
  results: SearchResult[];        // Результати пошуку
  isTechnical: boolean;          // Чи технічний запит
  warning?: string;              // Попередження (якщо є)
  suggestions?: string[];        // Поради для покращення
  totalFound: number;           // Кількість результатів
  executionTimeMs: number;      // Час виконання
  technologiesSearched: string[]; // Технології в яких шукали
  strategiesUsed: string[];     // Використані стратегії
  recommendations?: string;     // Рекомендації для запиту
}
```

### Налаштування

**Додавання нових технічних термінів:**
```typescript
// В файлі code-search.service.ts
const technicalKeywords = [
  // Додайте ваші терміни тут
  'новий_технічний_термін'
];
```

**Додавання нових стоп-слів:**
```typescript
const nonTechnicalKeywords = [
  // Додайте нетехнічні слова тут
  'новий_нетехнічний_термін'
];
```

**Пропуск валідації (для особливих випадків):**
```graphql
query {
  searchCode(query: "спірний_запит", skipTechnicalValidation: true) {
    # Валідація буде пропущена
  }
}
```

### Переваги

- 🛡️ **Захист від спаму**: Відфільтровує нерелевантні запити
- 💡 **Корисні поради**: Допомагає користувачам сформулювати кращі запити  
- 🚀 **Кращий UX**: Зрозумілі повідомлення замість порожніх результатів
- ⚡ **Швидкість**: Валідація працює миттєво без запитів до БД
- 🎯 **Точність**: Фокус тільки на технічному контенті

**💡 Порада:** Використовуйте специфічні терміни та згадуйте технологію в запиті для кращих результатів! 