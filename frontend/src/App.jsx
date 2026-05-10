import React, {useCallback, useEffect, useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import api from './api';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('auth/users/me/');
            setUser(res.data);
        } catch (error) {
            console.error("Сессия истекла или токен неверный");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const verifySession = async () => {
            await checkAuth();
        };

        verifySession();
    }, [checkAuth]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        window.location.href = '/';
    };

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
            <div className="d-flex flex-column min-vh-100">
                <Navbar user={user} onLogout={handleLogout}/>
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route
                            path="/login"
                            element={!user ? <LoginPage onLoginSuccess={checkAuth}/> : <Navigate to="/"/>}
                        />
                        <Route
                            path="/register"
                            element={!user ? <RegisterPage/> : <Navigate to="/"/>}
                        />
                        <Route
                            path="/my-bookings"
                            element={user ? <MyBookingsPage/> : <Navigate to="/login"/>}
                        />
                        <Route
                            path="/settings"
                            element={user ? <SettingsPage onUserUpdate={setUser}/> : <Navigate to="/login"/>}
                        />

                        <Route
                            path="/admin"
                            element={user && user.is_staff ? <AdminPage/> : <Navigate to="/"/>}
                        />

                        <Route path="/about" element={<AboutPage/>}/>
                        <Route path="*" element={<Navigate to="/"/>}/>
                    </Routes>
                </main>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;