import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import UploadingPage from '@/pages/UploadingPage/UploadingPage';

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
    <BrowserRouter>
        <Suspense fallback={PageFallback}>
            <Routes>
                <Route path='/' element={<UploadingPage />} />
                <Route path='/main' element={<App />} />
            </Routes>
        </Suspense>
    </BrowserRouter>,
);
