import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import api from '../api';
import {CheckCircleFill, PersonPlusFill} from 'react-bootstrap-icons';

const RegisterPage = () => {
    const [formData, setFormData] = useState({username: '', email: '', password: '', re_password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(formData.email)) {
            setError('Пожалуйста, введите корректный адрес электронной почты.');
            return;
        }

        if (formData.password !== formData.re_password) {
            setError('Пароли не совпадают.');
            return;
        }

        setLoading(true);
        try {
            await api.post('auth/users/', formData);
            setShowToast(true);

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            if (err.response && err.response.data) {
                const data = err.response.data;
                let errorMessages = [];

                if (data.username) {
                    errorMessages.push('Пользователь с таким логином уже существует.');
                }
                if (data.email) {
                    errorMessages.push('Эта электронная почта уже используется.');
                }
                if (data.password) {
                    errorMessages.push('Пароль слишком простой (минимум 8 символов, не должен совпадать с логином).');
                }
                if (data.non_field_errors) {
                    errorMessages.push(data.non_field_errors.join(' '));
                }

                if (errorMessages.length === 0) {
                    errorMessages = Object.values(data).flat();
                }

                setError(errorMessages.join('\n'));
            } else {
                setError('Ошибка соединения с сервером.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center fade-in position-relative"
             style={{minHeight: '85vh'}}>

            {showToast && (
                <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{zIndex: 9999}}>
                    <div className="bg-white border-0 shadow-lg p-3 d-flex align-items-center gap-3 fade-in"
                         style={{borderRadius: '16px', borderLeft: '5px solid var(--primary)', minWidth: '320px'}}>
                        <CheckCircleFill size={28} className="text-success"/>
                        <div>
                            <div className="fw-bold text-dark text-start">Успешно!</div>
                            <div className="text-muted small text-start">Перенаправляем на страницу входа...</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row justify-content-center w-100">
                <div className="col-md-5 col-lg-4">
                    <div className={`card border-0 login-card p-4 shadow-lg ${showToast ? 'opacity-50' : ''}`}
                         style={{transition: 'opacity 0.3s ease'}}>
                        <div className="card-body">

                            <div className="text-center mb-5">
                                <div className="mb-4 d-inline-block">
                                    <div className="position-relative">
                                        <PersonPlusFill size={52} className="text-dark opacity-75"/>
                                        <span
                                            className="position-absolute bottom-0 end-0 border border-3 border-white rounded-circle"
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                background: 'var(--primary)',
                                                marginBottom: '4px',
                                                marginRight: '-2px'
                                            }}>
                                        </span>
                                    </div>
                                </div>
                                <h3 className="fw-800 mb-2">Регистрация</h3>
                                <p className="text-muted small">Создайте аккаунт для работы в MeetSpace</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger border-0 small text-center mb-4"
                                     style={{borderRadius: '12px', whiteSpace: 'pre-line'}}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRegister}>
                                <fieldset disabled={showToast}>
                                    <div className="mb-3 text-start">
                                        <label className="form-label text-muted small fw-bold mb-2">ЛОГИН</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-light border-0 custom-input"
                                            value={formData.username}
                                            onChange={e => setFormData({...formData, username: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label text-muted small fw-bold mb-2">ЭЛЕКТРОННАЯ
                                            ПОЧТА</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-light border-0 custom-input"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label text-muted small fw-bold mb-2">ПАРОЛЬ</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg bg-light border-0 custom-input"
                                            value={formData.password}
                                            onChange={e => setFormData({...formData, password: e.target.value})}
                                            required minLength={8}
                                        />
                                    </div>
                                    <div className="mb-4 text-start">
                                        <label className="form-label text-muted small fw-bold mb-2">ПОВТОР
                                            ПАРОЛЯ</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg bg-light border-0 custom-input"
                                            value={formData.re_password}
                                            onChange={e => setFormData({...formData, re_password: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-3 fw-bold shadow-sm mb-3 hover-lift"
                                        disabled={loading || showToast}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : 'Создать аккаунт'}
                                    </button>
                                </fieldset>

                                <div className="text-center mt-4">
                                    <span className="text-muted small">Уже есть профиль? </span>
                                    <Link to="/login"
                                          className="text-primary small fw-bold text-decoration-none hover-underline">
                                        Войти
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;