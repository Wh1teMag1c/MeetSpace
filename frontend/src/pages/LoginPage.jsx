import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import api from '../api';
import {ShieldLockFill} from 'react-bootstrap-icons';

const LoginPage = ({onLoginSuccess}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('../auth/jwt/create/', {username, password});
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            if (onLoginSuccess) {
                await onLoginSuccess();
            }
            navigate('/');
        } catch (err) {
            setError('Неверные данные для входа. Пожалуйста, проверьте логин и пароль.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center fade-in" style={{minHeight: '80vh'}}>
            <div className="row justify-content-center w-100">
                <div className="col-md-5 col-lg-4">
                    <div className="card border-0 login-card p-4 shadow-lg">
                        <div className="card-body">
                            <div className="text-center mb-5">
                                <div className="mb-4 d-inline-block">
                                    <div className="position-relative">
                                        <ShieldLockFill size={52} className="text-dark opacity-75"/>
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
                                <h3 className="fw-800 mb-2">Авторизация</h3>
                                <p className="text-muted small">Введите данные для доступа к системе</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger border-0 small text-center mb-4"
                                     style={{borderRadius: '12px'}}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2">ЛОГИН</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg bg-light border-0 custom-input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className="form-label text-muted small fw-bold mb-2">ПАРОЛЬ</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg bg-light border-0 custom-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3 fw-bold shadow-sm mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : 'Войти в систему'}
                                </button>

                                <div className="text-center mt-4">
                                    <span className="text-muted small">Впервые здесь? </span>
                                    <Link to="/register"
                                          className="text-primary small fw-bold text-decoration-none hover-underline">
                                        Создать профиль
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

export default LoginPage;