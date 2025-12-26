# Логика работы графика остатков (LeftoversChart)

## 📊 Описание

График остатков отображает **только накопительный баланс** с флагом `is_leftovers = true`:

- **Отображаемые данные**: "Накопительный баланс"
- **Заголовок графика**: "Накопительный баланс"
- **Описание**: Показывает накопительный баланс с учетом остатков
- **Флаг API**: Всегда `is_leftovers=true`

## 🔧 Реализация

### 1. Компонент LeftoversChart

```typescript
// src/widgets/leftovers-chart/ui/LeftoversChart.tsx

interface LeftoversChartProps {
    data: DynamicsResponse;
    title?: string;
}

// Фильтруем только серии с "накопительный баланс" (is_leftovers=true)
const balanceSeries = data.series.filter(series =>
    series.name.toLowerCase().includes('накопительный баланс')
);
```

### 2. DashboardPage

```typescript
// Всегда используем is_leftovers: true для графика остатков
const handleApplyFilters = async () => {
    const leftoverFilters = {
        ...currentFilters,
        is_leftovers: true, // ← Всегда true
    };

    await Promise.all([
        sankeyWidget.loadData(currentFilters),
        balanceWidget.loadData(currentFilters),
        dynamicsWidget.loadData(currentFilters),
        leftoversWidget.loadData(leftoverFilters),
    ]);
};
```

### 3. Рендеринг компонента

```typescript
<LeftoversChart
    data={leftoversWidget.data}
    title={`Накопительный баланс${currentFilters.states ? ` (${currentFilters.states.join(', ')})` : ''}`}
/>
```

## 📝 API запрос

График остатков **всегда** использует `is_leftovers=true`:

```
GET /api/v1/dynamics?
    zvz_table=zvz-25&
    rss_table=rss-25&
    spr_table=spr_new&
    leftovers_table=ost-tt&
    is_leftovers=true&         ← Всегда true
    states=ГДО&
    states_mode=in&
    types_mode=in
```

**Ожидаемые данные в ответе:**
- Серии с ключом: **"накопительный баланс"**

## 🎯 Пользовательский сценарий

1. Пользователь нажимает кнопку **"Обновить диаграмму"**
2. Отправляется запрос с `is_leftovers=true` для графика остатков
3. График отображает данные с ключом **"накопительный баланс"**
4. Заголовок графика: **"Накопительный баланс"**

## 🔍 Обработка ошибок

Если в ответе API нет данных с ключом "накопительный баланс":

```typescript
if (balanceSeries.length === 0) {
    return (
        <div>
            <p>Нет данных "накопительный баланс" для отображения</p>
        </div>
    );
}
```

## ✅ Преимущества решения

1. **Простота** - один режим, одна цель
2. **Понятность** - всегда показывает накопительный баланс
3. **Case-insensitive поиск** - устойчивость к разным регистрам ключей
4. **Четкая ответственность** - график остатков работает только с `is_leftovers=true`

## 🎨 Стилизация

График использует кастомные цвета:
- **Линия**: `#FCDD6B` (желтый)
- **Маркеры**: `#A3A2E6` (светло-фиолетовый)

## 🚀 Дальнейшие улучшения (опционально)

1. Добавить индикатор загрузки
2. Экспорт данных в CSV/Excel
3. Настройка цветов через настройки
4. Zoom и pan для детального просмотра
