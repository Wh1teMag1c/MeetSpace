import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({username: '', password: '', re_password: ''});
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('../auth/users/', formData);
            alert('Регистрация успешна! Теперь вы можете войти.');
            navigate('/login');
        } catch (err) {
            alert('Ошибка регистрации. Проверьте данные.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h3 className="text-center">Регистрация</h3>
                    <form onSubmit={handleRegister}>
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Логин"
                            onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                        <input
                            type="password"
                            className="form-control mb-2"
                            placeholder="Пароль"
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                        <input
                            type="password"
                            className="form-control mb-3"
                            placeholder="Повторите пароль"
                            onChange={e => setFormData({...formData, re_password: e.target.value})}
                        />
                        <button className="btn btn-success w-100">Создать аккаунт</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;