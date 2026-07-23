import {lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {MantineProvider} from '@mantine/core';
import {DatesProvider} from '@mantine/dates';
import {Notifications} from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import 'dayjs/locale/ru';
import './index.css';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router';
import UploadingPage from '@/pages/UploadingPage/UploadingPage';
import {HomePage} from '@/pages/HomePage';
import {MainPage} from '@/pages/MainPage';
import {mantineTheme} from '@/shared/lib/mantineTheme';

// App грузим лениво — там Plotly (~3MB), который не нужен на странице загрузки
const App = lazy(() => import('@/app/App'));
const CalculatePage = lazy(() => import('@/pages/calculate/ui/CalculatePageMantine'));

const PageFallback = (
    <div
        role="status"
        aria-label="Загрузка страницы..."
        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}
    >
        Загрузка...
    </div>
);

createRoot(document.getElementById('root')!).render(
    <MantineProvider theme={mantineTheme} defaultColorScheme="light">
        <DatesProvider settings={{locale: 'ru'}}>
            <Notifications position="top-right" />
            <BrowserRouter>
                <Suspense fallback={PageFallback}>
                    <Routes>
                        {/* Главная — выбор действия: рассчитать отчёт или загрузить данные */}
                        <Route path='/' element={<HomePage />} />
                        {/* Расчёт отчёта — выбор типа отчёта и параметров */}
                        <Route path='/calculate' element={<CalculatePage />} />
                        {/* Загрузка данных — сначала выбор оборудования, затем загрузка */}
                        <Route path='/upload-select' element={<MainPage />} />
                        <Route path='/upload' element={<UploadingPage />} />
                        {/* Старые пути — редиректим на главную */}
                        <Route path='/uploading' element={<Navigate to='/' replace />} />
                        <Route path='/result' element={<Navigate to='/calculate' replace />} />
                        <Route path='/main' element={<App />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </DatesProvider>
    </MantineProvider>,
);
