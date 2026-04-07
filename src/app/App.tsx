import './App.css';
import { Provider } from 'react-redux';
import { DashboardPage } from '@/pages/dashboard';
import { store } from './store';

function App() {
    return (
        <Provider store={store}>
            <main>
                <DashboardPage />
            </main>
        </Provider>
    );
}

export default App;
