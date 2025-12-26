import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/shared/api/baseApi';

export const store = configureStore({
    reducer: {
        // Добавляем RTK Query reducer
        [baseApi.reducerPath]: baseApi.reducer,
    },
    // Добавляем RTK Query middleware для кэширования, инвалидации и polling
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
