# Функция экспорта данных

## 📊 Описание

Добавлены кнопки для скачивания данных в формате **XLSX (Excel)** для трех типов таблиц:
- **Sankey** - данные диаграммы Sankey
- **Balance** - данные баланса
- **Dynamics** - данные динамики

## 🏗️ Архитектура (FSD)

### Entities - API для экспорта

#### `entities/sankey/api/exportSankeyApi.ts`
```typescript
export async function exportSankeyData(filters: FilterParams): Promise<Blob>
```
**Эндпоинт**: `GET /api/v1/export/sankey`

#### `entities/balance/api/exportBalanceApi.ts`
```typescript
export async function exportBalanceData(filters: FilterParams): Promise<Blob>
```
**Эндпоинт**: `GET /api/v1/export/balance`

#### `entities/dynamics/api/exportDynamicsApi.ts`
```typescript
export async function exportDynamicsData(filters: FilterParams): Promise<Blob>
```
**Эндпоинт**: `GET /api/v1/export/dynamics`
**Особенность**: Всегда использует `is_leftovers=false`

### Features - Компонент экспорта

#### `features/export/model/useExportData.ts`
Хук для управления экспортом:
```typescript
const {
    isExporting,           // Состояние загрузки ('sankey' | 'balance' | 'dynamics' | null)
    handleExportSankey,    // Экспорт Sankey
    handleExportBalance,   // Экспорт Balance
    handleExportDynamics,  // Экспорт Dynamics
} = useExportData();
```

**Функциональность**:
- Скачивание файла через blob
- Автоматическое именование файлов с датой: `sankey_2025-12-23.json`
- Уведомления об успехе/ошибке
- Состояние загрузки для каждой кнопки

#### `features/export/ui/ExportButtons.tsx`
Компонент с тремя кнопками экспорта

### Pages - Интеграция

#### `pages/dashboard/ui/DashboardPage.tsx`
Кнопки добавлены в верхней части страницы перед фильтрами:
```tsx
<Row style={{ marginBottom: '16px' }}>
    <Col span={24}>
        <div style={{ padding: '12px 16px', background: '#f0f2f5' }}>
            <span>Экспорт данных:</span>
            <ExportButtons filters={currentFilters} />
        </div>
    </Col>
</Row>
```

## 📝 API запросы

### 1. Экспорт Sankey
```
GET /api/v1/export/sankey?
    zvz_table=zvz-25&
    rss_table=rss-25&
    spr_table=spr_new&
    leftovers_table=ost-tt&         ← Добавлено
    sources_mode=in&
    targets_mode=in&
    diameters_mode=in&
    types_mode=in&
    states_mode=in&
    sources=...&
    targets=...&
    diameters=...&
    types=...&
    states=ГДО&                     ← Состояния
    date_from=2025-01-01&           ← Даты
    date_to=2025-12-31
```

### 2. Экспорт Balance
```
GET /api/v1/export/balance?
    zvz_table=zvz-25&
    rss_table=rss-25&
    spr_table=spr_new&
    leftovers_table=ost-tt&         ← Добавлено
    states_mode=in&
    types_mode=in&
    states=ГДО&                     ← Состояния
    types=...&
    date_from=2025-01-01&           ← Даты
    date_to=2025-12-31
```

### 3. Экспорт Dynamics
```
GET /api/v1/export/dynamics?
    zvz_table=zvz-25&
    rss_table=rss-25&
    spr_table=spr_new&
    leftovers_table=ost-tt&         ← Добавлено
    is_leftovers=false&             ← Всегда false
    states_mode=in&
    types_mode=in&
    states=ГДО&                     ← Состояния
    types=...&
    date_from=2025-01-01&           ← Даты
    date_to=2025-12-31
```

## 🎯 Пользовательский сценарий

1. Пользователь заходит на дашборд
2. Видит панель "Экспорт данных" вверху страницы
3. Настраивает фильтры:
   - Выбирает состояния (states)
   - Устанавливает даты (date_from, date_to)
   - Другие фильтры по необходимости
4. Нажимает на одну из кнопок:
   - **Sankey** - скачивает Excel файл с данными диаграммы
   - **Balance** - скачивает Excel файл с данными баланса
   - **Dynamics** - скачивает Excel файл с данными динамики
5. Файл автоматически скачивается с именем типа `sankey_2025-12-23.xlsx`
6. Появляется уведомление "Данные успешно экспортированы в Excel" или ошибка

## 💡 Особенности реализации

### Автоматическое скачивание
```typescript
const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
```

### Именование файлов
Формат: `{type}_{date}.xlsx`
- `sankey_2025-12-23.xlsx`
- `balance_2025-12-23.xlsx`
- `dynamics_2025-12-23.xlsx`

### Состояние загрузки
Каждая кнопка показывает индикатор загрузки независимо:
```typescript
const [isExporting, setIsExporting] = useState<string | null>(null);

// При клике на кнопку
setIsExporting('sankey'); // или 'balance', 'dynamics'

// Кнопка отображает loading
<Button loading={isExporting === 'sankey'}>Sankey</Button>
```

## ✅ Преимущества

1. **FSD архитектура** - четкое разделение ответственности
2. **Переиспользуемость** - API функции можно использовать где угодно
3. **UX** - индикаторы загрузки, уведомления, автоскачивание
4. **Типобезопасность** - все типизировано через TypeScript
5. **Независимость** - каждый экспорт независим от других

## 🚀 Дальнейшие улучшения (опционально)

1. Добавить выбор формата экспорта (XLSX, CSV, JSON)
2. Добавить предпросмотр данных перед скачиванием
3. Добавить возможность выбора полей для экспорта
4. Сохранять историю экспортов
5. Добавить массовый экспорт всех таблиц одной кнопкой
6. Добавить экспорт графика остатков (leftovers) с `is_leftovers=true`
7. Добавить настройку имени файла перед скачиванием

## 📂 Структура файлов

```
src/
├── entities/
│   ├── sankey/
│   │   ├── api/
│   │   │   ├── sankeyApi.ts
│   │   │   └── exportSankeyApi.ts          ← Новый
│   │   └── index.ts                         ← Обновлен
│   ├── balance/
│   │   ├── api/
│   │   │   ├── balanceApi.ts
│   │   │   └── exportBalanceApi.ts         ← Новый
│   │   └── index.ts                         ← Обновлен
│   └── dynamics/
│       ├── api/
│       │   ├── dynamicsApi.ts
│       │   └── exportDynamicsApi.ts        ← Новый
│       └── index.ts                         ← Обновлен
│
├── features/
│   └── export/                              ← Новый
│       ├── model/
│       │   └── useExportData.ts
│       ├── ui/
│       │   ├── ExportButtons.tsx
│       │   └── index.ts
│       └── index.ts
│
└── pages/
    └── dashboard/
        └── ui/
            └── DashboardPage.tsx            ← Обновлен
```

## 🎨 Визуальное оформление

Панель экспорта:
- **Фон**: `#f0f2f5` (светло-серый)
- **Отступы**: `12px 16px`
- **Радиус**: `8px`
- **Кнопки**: Размер `small`, иконка `DownloadOutlined`
- **Расположение**: Вверху страницы перед фильтрами
