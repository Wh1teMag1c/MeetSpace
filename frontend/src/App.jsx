import React, {useEffect, useState, useCallback} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import api from './api';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// 1. Импортируем наши новые красивые компоненты
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 2. Импортируем страницы
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Функция для проверки авторизации и получения данных пользователя
    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                // Запрос к Djoser для получения профиля текущего пользователя
                const res = await api.get('../auth/users/me/');
                setUser(res.data);
            } catch (error) {
                console.error("Сессия истекла или токен неверный");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        // Перенаправляем на главную и обновляем страницу для чистоты состояния
        window.location.href = '/';
    };

    // Пока идет проверка пользователя, показываем аккуратный спиннер
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    return (
        <Router>
            {/* Обертка для того, чтобы футер всегда был внизу (Flexbox) */}
            <div className="d-flex flex-column min-vh-100">

                {/* ХЕДЕР: Передаем данные пользователя для отображения ника и аватарки */}
                <Navbar user={user} onLogout={handleLogout}/>

                {/* КОНТЕНТ: Основная часть страницы */}
                <main className="flex-grow-1">
                    <Routes>
                        {/* Главная страница с фильтрами и списком комнат */}
                        <Route path="/" element={<HomePage/>}/>

                        {/* Авторизация: если юзер уже вошел, не пускаем его на страницу входа */}
                        <Route
                            path="/login"
                            element={!user ? <LoginPage onLoginSuccess={checkAuth}/> : <Navigate to="/"/>}
                        />
                        <Route
                            path="/register"
                            element={!user ? <RegisterPage/> : <Navigate to="/"/>}
                        />

                        {/* Защищенные маршруты: только для авторизованных */}
                        <Route
                            path="/my-bookings"
                            element={user ? <MyBookingsPage/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/settings"
                            element={user ? <SettingsPage/> : <Navigate to="/login"/>}
                        />

                        {/* Обычные информационные страницы */}
                        <Route path="/about" element={<AboutPage/>}/>

                        {/* 404: если страница не найдена, кидаем на главную */}
                        <Route path="*" element={<Navigate to="/"/>}/>
                    </Routes>
                </main>

                {/* ФУТЕР: Теперь он отдельный и контрастный */}
                <Footer/>
            </div>
        </Router>
    );
}

export default App;