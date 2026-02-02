# Миграция на RTK Query

## ✅ Что сделано:

### 1. Установлены зависимости
```bash
npm install @reduxjs/toolkit react-redux
```

### 2. Создана базовая настройка Redux

- `src/app/store.ts` - Redux store с RTK Query
- `src/app/hooks.ts` - Типизированные хуки
- `src/shared/api/baseApi.ts` - Базовый API slice
- `src/app/App.tsx` - Обернут в Redux Provider

### 3. Созданы API slices

#### Balance API
- `src/entities/balance/api/balanceApiSlice.ts`
- Хуки: `useGetBalanceQuery`, `useLazyGetBalanceQuery`, `useExportBalanceMutation`

#### Dynamics API
- `src/entities/dynamics/api/dynamicsApiSlice.ts`
- Хуки: `useGetDynamicsForStateQuery`, `useLazyGetDynamicsForStateQuery`, `useExportDynamicsMutation`

#### Filter API
- `src/entities/filter/api/filterApiSlice.ts`
- Хуки: `useGetFilterOptionsQuery`, `useLazyGetFilterOptionsQuery`

#### Sankey API
- `src/entities/sankey/api/sankeyApiSlice.ts`
- Хуки: `useGetSankeyQuery`, `useLazyGetSankeyQuery`, `useExportSankeyMutation`

## 📖 Примеры использования:

### До (старый подход):
```typescript
// Старый хук с useState/useEffect
const useBalanceData = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = async (filters) => {
        setIsLoading(true);
        try {
            const response = await fetchBalanceData(filters);
            setData(transformData(response));
        } catch (error) {
            message.error('Ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, loadData };
};
```

### После (RTK Query):
```typescript
// В компоненте - автоматический refetch при изменении filters
const { data, isLoading, error } = useGetBalanceQuery(filters, {
    skip: !filters.zvz_table, // Пропустить если нет обязательных параметров
});

// Или lazy версия для ручного триггера
const [trigger, { data, isLoading }] = useLazyGetBalanceQuery();

useEffect(() => {
    if (filters.zvz_table) {
        trigger(filters);
    }
}, [filters, trigger]);
```

### Пример с мутацией (экспорт):
```typescript
const [exportBalance, { isLoading: isExporting }] = useExportBalanceMutation();

const handleExport = async () => {
    try {
        const blob = await exportBalance(filters).unwrap();
        // Скачать файл
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'balance.xlsx';
        a.click();
    } catch (error) {
        message.error('Ошибка экспорта');
    }
};
```

## 🚀 Преимущества RTK Query:

### 1. Автоматическое кэширование
```typescript
// Первый запрос - реальный fetch
const { data } = useGetBalanceQuery(filters);

// Второй запрос с теми же filters - берется из кэша!
const { data } = useGetBalanceQuery(filters);
```

### 2. Автоматический refetch
```typescript
// При изменении filters автоматически делается новый запрос
const { data } = useGetBalanceQuery(filters);
```

### 3. Управление состоянием из коробки
```typescript
const {
    data,           // Данные
    isLoading,      // Идет загрузка
    isFetching,     // Идет обновление
    isSuccess,      // Успешно загружено
    isError,        // Произошла ошибка
    error,          // Детали ошибки
    refetch         // Ручной refetch
} = useGetBalanceQuery(filters);
```

### 4. Polling
```typescript
// Автоматическое обновление каждые 10 секунд
const { data } = useGetBalanceQuery(filters, {
    pollingInterval: 10000,
});
```

### 5. Prefetching
```typescript
const dispatch = useAppDispatch();

// Предзагрузка данных при hover
const handleMouseEnter = () => {
    dispatch(balanceApi.util.prefetch('getBalance', filters, { force: false }));
};
```

### 6. Оптимистичные обновления
```typescript
const [updateData] = useUpdateDataMutation();

const handleUpdate = async (newData) => {
    // Оптимистичное обновление UI
    dispatch(
        balanceApi.util.updateQueryData('getBalance', filters, (draft) => {
            Object.assign(draft, newData);
        })
    );

    try {
        await updateData(newData).unwrap();
    } catch {
        // Откат при ошибке
        dispatch(balanceApi.util.invalidateTags(['Balance']));
    }
};
```

## 🔄 План миграции компонентов:

### Фаза 1: Создание новых хуков (✅ Сделано)
- [x] balanceApiSlice.ts
- [x] dynamicsApiSlice.ts
- [x] filterApiSlice.ts
- [x] sankeyApiSlice.ts

### Фаза 2: Миграция виджетов
- [ ] Мигрировать `useBalanceData` → использовать `useGetBalanceQuery`
- [ ] Мигрировать `useDynamicsData` → использовать `useGetDynamicsForStateQuery`
- [ ] Мигрировать `useSankeyData` → использовать `useGetSankeyQuery`
- [ ] Мигрировать `useLeftoversData` → использовать dynamics API

### Фаза 3: Миграция features
- [ ] Обновить `FiltersPanel` → использовать `useGetFilterOptionsQuery`
- [ ] Обновить `ExportButtons` → использовать мутации экспорта

### Фаза 4: Удаление старого кода
- [ ] Удалить старые API функции (balanceApi.ts, dynamicsApi.ts и т.д.)
- [ ] Удалить старые хуки (useBalanceData.ts и т.д.)
- [ ] Удалить `shared/api/client.ts` (если больше не используется)

## 🛠 Отладка с Redux DevTools:

1. Установить [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Открыть DevTools в браузере
3. Вкладка Redux → видно все запросы, кэш, мутации

## 📝 Рекомендации:

### Используйте `skip` для условных запросов
```typescript
const { data } = useGetBalanceQuery(filters, {
    skip: !filters.zvz_table || !filters.rss_table,
});
```

### Используйте теги для инвалидации кэша
```typescript
// После создания/обновления данных
const [createData] = useCreateDataMutation();

await createData(newData).unwrap();
// Автоматически инвалидирует все запросы с тегом 'Balance'
```

### Обрабатывайте ошибки
```typescript
const { data, error } = useGetBalanceQuery(filters);

if (error) {
    if ('status' in error) {
        // Ошибка API
        message.error(`Ошибка ${error.status}`);
    } else {
        // Сетевая ошибка
        message.error('Ошибка сети');
    }
}
```

## 🔗 Полезные ссылки:

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query API Reference](https://redux-toolkit.js.org/rtk-query/api/createApi)
- [Best Practices](https://redux-toolkit.js.org/rtk-query/usage/usage-guide)
