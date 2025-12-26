
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/app/App'
import { BrowserRouter, Route, Routes } from "react-router";
import UploadingPage from "@/pages/UploadingPage/UploadingPage";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path={'/'} element={<UploadingPage/>}/>
            <Route path={'/main'} element={<App/>}/>
            <Route path={'/upload'} element={<UploadingPage/>}/>
            <Route/>
        </Routes>
    </BrowserRouter>
    ,
)
