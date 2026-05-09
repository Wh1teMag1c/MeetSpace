import React from 'react';
import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';

function App() {
    const isAuthenticated = !!localStorage.getItem('access_token');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    return (
        <Router>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
                <div className="container">
                    <Link className="navbar-brand" to="/">MeetSpace</Link>
                    <div className="navbar-nav ms-auto">
                        <Link className="nav-link" to="/">Главная</Link>
                        {isAuthenticated && (
                            <Link className="nav-link" to="/my-bookings">Мои бронирования</Link>
                        )}
                        {!isAuthenticated ? (
                            <>
                                <Link className="nav-link" to="/login">Войти</Link>
                                <Link className="nav-link" to="/register">Регистрация</Link>
                            </>
                        ) : (
                            <button
                                className="btn btn-link nav-link"
                                onClick={handleLogout}
                            >
                                Выйти
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <div className="container">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/my-bookings" element={<MyBookingsPage/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;