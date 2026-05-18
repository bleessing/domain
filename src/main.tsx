import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import './index.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router';
import UploadingPage from '@/pages/UploadingPage/UploadingPage';
import { MainPage } from '@/pages/MainPage';
import { antdTheme } from '@/shared/lib/theme';

// App грузим лениво — там Plotly (~3MB), который не нужен на странице загрузки
const App = lazy(() => import('@/app/App'));

const PageFallback = (
    <div
        role="status"
        aria-label="Загрузка страницы..."
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
        Загрузка...
    </div>
);

createRoot(document.getElementById('root')!).render(
    <ConfigProvider theme={antdTheme} locale={ruRU}>
        <BrowserRouter>
            <Suspense fallback={PageFallback}>
                <Routes>
                    <Route path='/' element={<MainPage />} />
                    <Route path='/upload' element={<UploadingPage />} />
                    {/* Старый путь без выбора оборудования — редиректим на главную */}
                    <Route path='/uploading' element={<Navigate to='/' replace />} />
                    <Route path='/main' element={<App />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    </ConfigProvider>,
);
