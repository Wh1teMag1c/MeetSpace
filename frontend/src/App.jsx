import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => <div className="container mt-5"><h1>Список переговорных комнат</h1></div>;
const LoginPage = () => <div className="container mt-5"><h1>Вход в систему</h1></div>;

function App() {
    return (
        <Router>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
                <div className="container">
                    <a className="navbar-brand" href="/">MeetSpace</a>
                    <div className="navbar-nav">
                        <a className="nav-link" href="/">Главная</a>
                        <a className="nav-link" href="/login">Войти</a>
                    </div>
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;