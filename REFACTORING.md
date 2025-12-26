# Рефакторинг под FSD (Feature-Sliced Design)

## 📋 Выполненные изменения

### Новая структура проекта

```
src/
├── app/                          # Слой приложения
│   ├── App.tsx                   # Корневой компонент
│   └── App.css
│
├── pages/                        # Слой страниц
│   ├── dashboard/                # Главный дашборд
│   │   └── ui/DashboardPage.tsx  # Композиция виджетов
│   └── uploading/                # Страница загрузки
│
├── widgets/                      # Самодостаточные блоки UI
│   ├── sankey-diagram/
│   │   ├── ui/SankeyDiagram.tsx
│   │   ├── model/useSankeyData.ts    # Хук управления данными
│   │   └── index.ts
│   ├── balance-table/
│   │   ├── ui/BalanceTable.tsx
│   │   ├── ui/BalanceChart.tsx
│   │   ├── model/useBalanceData.ts
│   │   └── index.ts
│   ├── dynamics-chart/
│   │   ├── ui/DynamicsChart.tsx
│   │   ├── model/useDynamicsData.ts
│   │   └── index.ts
│   └── leftovers-chart/
│       ├── ui/LeftoversChart.tsx
│       ├── model/useLeftoversData.ts
│       └── index.ts
│
├── features/                     # Бизнес-фичи
│   └── filters/
│       ├── ui/FiltersPanel.tsx
│       └── index.ts
│
├── entities/                     # Бизнес-сущности
│   ├── sankey/
│   │   ├── api/sankeyApi.ts
│   │   ├── model/types.ts
│   │   ├── lib/transformer.ts
│   │   └── index.ts
│   ├── balance/
│   │   ├── api/balanceApi.ts
│   │   ├── model/types.ts
│   │   └── index.ts
│   ├── dynamics/
│   │   ├── api/dynamicsApi.ts
│   │   ├── model/types.ts
│   │   └── index.ts
│   ├── leftovers/
│   │   ├── api/leftoversApi.ts
│   │   ├── model/types.ts
│   │   └── index.ts
│   └── filter/
│       ├── api/filterApi.ts
│       ├── model/types.ts
│       └── index.ts
│
└── shared/                       # Переиспользуемый код
    ├── api/client.ts             # Базовый HTTP клиент
    └── lib/constants.ts          # Константы
```

## 🎯 Основные улучшения

### 1. **Разделение ответственности**
- **До**: Вся логика в App.tsx (450+ строк)
- **После**: Каждый виджет управляет своим состоянием через хуки

### 2. **API разделен по сущностям**
- **До**: sankeyApi.ts содержал все API запросы
- **После**: Каждая сущность имеет свой API модуль:
  - `entities/sankey/api/sankeyApi.ts`
  - `entities/balance/api/balanceApi.ts`
  - `entities/dynamics/api/dynamicsApi.ts`
  - `entities/leftovers/api/leftoversApi.ts`

### 3. **Хуки для управления состоянием**
Каждый виджет имеет свой хук:
- `useSankeyData()` - управление данными Sankey диаграммы
- `useBalanceData()` - управление данными таблицы баланса
- `useDynamicsData()` - управление данными графика динамики (всегда `is_leftovers: false`)
- `useLeftoversData()` - управление данными графика остатков (с переключателем)

### 4. **Импорты через алиас @**
```typescript
// До
import { fetchSankeyData } from '../../shared/api/sankeyApi';

// После
import { fetchSankeyData } from '@/entities/sankey';
```

### 5. **Типизация**
Типы живут рядом с сущностями:
- `entities/sankey/model/types.ts`
- `entities/balance/model/types.ts`
- и т.д.

## 🔥 Ключевые особенности реализации

### Разделение запросов для динамики и остатков

**Для графика динамики (DynamicsChart):**
```typescript
// useDynamicsData.ts
const dynamicsFilters = {
    ...filters,
    is_leftovers: false, // ВСЕГДА false
};
```

**Для графика баланса остатков (LeftoversChart):**
```typescript
// useLeftoversData.ts - использует значение из переключателя
await fetchLeftoversForState(filters, state);
```

### Композиция в DashboardPage

```typescript
const sankeyWidget = useSankeyData();
const balanceWidget = useBalanceData();
const dynamicsWidget = useDynamicsData();
const leftoversWidget = useLeftoversData();

// Загрузка данных
await Promise.all([
    sankeyWidget.loadData(currentFilters),
    balanceWidget.loadData(currentFilters),
    dynamicsWidget.loadData(currentFilters),
    leftoversWidget.loadData(leftoverFilters),
]);
```

## 📦 Что было удалено

- `src/App.tsx` (старый) → перенесен в `pages/dashboard/ui/DashboardPage.tsx`
- `src/shared/api/sankeyApi.ts` → разделен на отдельные API в entities
- `src/shared/utils/sankeyTransformer.ts` → перенесен в `entities/sankey/lib/transformer.ts`
- `src/types/sankey.ts` → перенесен в `entities/sankey/model/types.ts`
- Старые папки виджетов (`widgets/sankey`, `widgets/balance`, и т.д.)

## 🚀 Преимущества новой архитектуры

1. **Масштабируемость** - легко добавлять новые виджеты и сущности
2. **Переиспользуемость** - каждый модуль независим
3. **Тестируемость** - хуки и API легко тестировать изолированно
4. **Читаемость** - четкая структура и разделение ответственности
5. **Типобезопасность** - типы рядом с сущностями

## ⚙️ Конфигурация

### vite.config.ts
```typescript
resolve: {
    alias: {
        '@': path.resolve(__dirname, './src'),
    },
}
```

### tsconfig.app.json
```json
{
    "baseUrl": ".",
    "paths": {
        "@/*": ["./src/*"]
    }
}
```

## 📝 Следующие шаги (опционально)

1. Добавить unit тесты для хуков
2. Создать storybook для виджетов
3. Добавить feature-toggles через shared/config
4. Внедрить state management (если понадобится)
