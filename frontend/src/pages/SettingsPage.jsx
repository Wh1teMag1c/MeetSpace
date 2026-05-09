import React, {useEffect, useState} from 'react';
import {Envelope, Person, PersonBadge, Save, ShieldLock} from 'react-bootstrap-icons';
import api from '../api';

const SettingsPage = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    const [profileForm, setProfileForm] = useState({first_name: '', last_name: '', email: ''});
    const [passwordForm, setPasswordForm] = useState({current_password: '', new_password: '', re_new_password: ''});

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchUserData = async () => {
            try {
                const res = await api.get('auth/users/me/');
                setUser(res.data);
                setProfileForm({
                    first_name: res.data.first_name || '',
                    last_name: res.data.last_name || '',
                    email: res.data.email || ''
                });
            } catch (error) {
                console.error("Ошибка загрузки профиля. Проверьте URL в Django и токены.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.patch('auth/users/me/', profileForm);
            alert('Профиль успешно обновлен!');
        } catch {
            alert('Ошибка при сохранении данных. Возможно, email уже занят.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.re_new_password) {
            alert('Новые пароли не совпадают!');
            return;
        }
        try {
            await api.post('auth/users/set_password/', passwordForm);
            alert('Пароль успешно изменен!');
            setPasswordForm({current_password: '', new_password: '', re_new_password: ''});
        } catch (err) {
            alert('Ошибка. Проверьте правильность текущего пароля.');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-5 fade-in">
            <div className="d-flex align-items-center gap-3 mb-5">
                <div className="p-3 rounded-4 bg-white shadow-sm">
                    <PersonBadge size={32} className="text-primary"/>
                </div>
                <h1 className="fw-800 mb-0">Настройки аккаунта</h1>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                        <div className="nav flex-column nav-pills gap-2">
                            <button
                                className={`nav-link rounded-3 text-start fw-bold d-flex align-items-center gap-3 py-3 px-4 border-0 transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-muted hover-light'}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <Person size={20}/> Личные данные
                            </button>
                            <button
                                className={`nav-link rounded-3 text-start fw-bold d-flex align-items-center gap-3 py-3 px-4 border-0 transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-muted hover-light'}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <ShieldLock size={20}/> Безопасность
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white login-card">
                        {activeTab === 'profile' ? (
                            <form onSubmit={handleProfileUpdate}>
                                <div className="mb-5 border-bottom pb-3">
                                    <h4 className="fw-bold mb-1">Профиль сотрудника</h4>
                                    <p className="text-muted small mb-0">Обновите вашу контактную информацию</p>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2">ЛОГИН (ID)</label>
                                    <input className="form-control bg-light border-0 custom-input"
                                           value={user?.username} disabled/>
                                    <div className="form-text mt-2" style={{fontSize: '0.75rem'}}>Идентификатор изменить
                                        нельзя
                                    </div>
                                </div>

                                <div className="row mb-4 g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold mb-2">ИМЯ</label>
                                        <input
                                            className="form-control bg-light border-0 custom-input"
                                            value={profileForm.first_name}
                                            onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small fw-bold mb-2">ФАМИЛИЯ</label>
                                        <input
                                            className="form-control bg-light border-0 custom-input"
                                            value={profileForm.last_name}
                                            onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className="form-label text-muted small fw-bold mb-2">ЭЛЕКТРОННАЯ
                                        ПОЧТА</label>
                                    <div className="position-relative">
                                        <Envelope
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"/>
                                        <input
                                            type="email"
                                            className="form-control bg-light border-0 custom-input ps-5"
                                            value={profileForm.email}
                                            onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary px-5 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center">
                                    <Save className="me-2"/> Сохранить изменения
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordChange}>
                                <div className="mb-5 border-bottom pb-3">
                                    <h4 className="fw-bold mb-1">Защита аккаунта</h4>
                                    <p className="text-muted small mb-0">Регулярная смена пароля повышает безопасность
                                        данных</p>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2">ТЕКУЩИЙ ПАРОЛЬ</label>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0 custom-input"
                                        required
                                        onChange={e => setPasswordForm({
                                            ...passwordForm,
                                            current_password: e.target.value
                                        })}
                                        value={passwordForm.current_password}
                                    />
                                </div>

                                <hr className="my-5 opacity-10"/>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2">НОВЫЙ ПАРОЛЬ</label>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0 custom-input"
                                        required
                                        onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                        value={passwordForm.new_password}
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className="form-label text-muted small fw-bold mb-2">ПОВТОРИТЕ НОВЫЙ
                                        ПАРОЛЬ</label>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0 custom-input"
                                        required
                                        onChange={e => setPasswordForm({
                                            ...passwordForm,
                                            re_new_password: e.target.value
                                        })}
                                        value={passwordForm.re_new_password}
                                    />
                                </div>

                                <button className="btn btn-primary px-5 py-3 fw-bold rounded-3 shadow-sm">
                                    Изменить пароль
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;