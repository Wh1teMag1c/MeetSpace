import React, {useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {
    Camera,
    Check2Circle,
    Envelope,
    ExclamationTriangleFill,
    Person,
    PersonBadge,
    Save,
    ShieldLock,
    Telephone
} from 'react-bootstrap-icons';
import api from '../api';

const SettingsPage = ({onUserUpdate}) => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    const [profileForm, setProfileForm] = useState({first_name: '', last_name: '', phone: '', avatar: ''});
    const [passwordForm, setPasswordForm] = useState({current_password: '', new_password: '', re_new_password: ''});

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [tempAvatarUrl, setTempAvatarUrl] = useState('');

    const [toast, setToast] = useState({show: false, message: '', type: 'success'});

    const showToast = (message, type = 'success') => {
        setToast({show: true, message, type});
        setTimeout(() => {
            setToast({show: false, message: '', type: 'success'});
        }, 4000);
    };

    const fetchUserData = useCallback(async () => {
        try {
            const res = await api.get('auth/users/me/');
            setUser(res.data);
            setProfileForm({
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                phone: res.data.phone || '',
                avatar: res.data.avatar || ''
            });
        } catch (error) {
            showToast('Не удалось загрузить данные профиля', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchUserData();
    }, [fetchUserData]);

    const validatePhone = (phoneStr) => {
        if (!phoneStr) return true;
        const validCharsRegex = /^[0-9+\-()\s]*$/;
        if (!validCharsRegex.test(phoneStr)) return false;
        const digitsOnly = phoneStr.replace(/\D/g, '');
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    };

    const handleSaveAvatarUrl = async () => {
        try {
            const res = await api.patch('auth/users/me/', {avatar: tempAvatarUrl});
            setUser(res.data);
            setProfileForm({...profileForm, avatar: tempAvatarUrl});
            if (onUserUpdate) onUserUpdate(res.data);
            setShowAvatarModal(false);
            showToast('Фото профиля успешно обновлено!', 'success');
        } catch (err) {
            showToast('Ошибка при обновлении фото.', 'error');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (profileForm.phone && !validatePhone(profileForm.phone)) {
            showToast('Некорректный формат телефона', 'error');
            return;
        }

        try {
            const res = await api.patch('auth/users/me/', profileForm);
            setUser(res.data);
            if (onUserUpdate) onUserUpdate(res.data);
            showToast('Профиль успешно обновлен!', 'success');
        } catch (err) {
            showToast('Ошибка при сохранении профиля.', 'error');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.re_new_password) {
            showToast('Новые пароли не совпадают!', 'error');
            return;
        }
        try {
            await api.post('auth/users/set_password/', passwordForm);
            showToast('Пароль успешно изменен!', 'success');
            setPasswordForm({current_password: '', new_password: '', re_new_password: ''});
        } catch (err) {
            if (err.response && err.response.data) {
                const errorMessages = Object.values(err.response.data).flat().join('\n');
                showToast(errorMessages || 'Ошибка. Проверьте правильность паролей.', 'error');
            } else {
                showToast('Ошибка соединения с сервером', 'error');
            }
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-5 fade-in position-relative">

            {toast.show && createPortal(
                <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{zIndex: 9999}}>
                    <div className="bg-white border-0 shadow-lg p-3 d-flex align-items-center gap-3 fade-in"
                         style={{
                             borderRadius: '16px',
                             borderLeft: `5px solid ${toast.type === 'success' ? '#10b981' : '#f87171'}`,
                             minWidth: '320px'
                         }}>
                        {toast.type === 'success'
                            ? <Check2Circle size={28} className="text-success"/>
                            : <ExclamationTriangleFill size={28} className="text-danger"/>
                        }
                        <div className="text-start">
                            <div className="fw-bold text-dark">{toast.type === 'success' ? 'Успешно!' : 'Ошибка'}</div>
                            <div className="text-muted small" style={{whiteSpace: 'pre-line'}}>{toast.message}</div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showAvatarModal && createPortal(
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{zIndex: 3000, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)'}}
                    onClick={() => setShowAvatarModal(false)}>

                    <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg fade-in text-center"
                         style={{maxWidth: '450px', width: '90%'}}
                         onClick={e => e.stopPropagation()}>

                        <h4 className="fw-bold mb-3 text-dark">Изменить фото</h4>
                        <p className="text-muted small mb-4">
                            Вставьте прямую ссылку на изображение (URL). Вы сразу увидите предпросмотр ниже.
                        </p>

                        <div className="mb-4">
                            {tempAvatarUrl ? (
                                <img
                                    src={tempAvatarUrl}
                                    alt="Preview"
                                    className="rounded-circle object-fit-cover shadow-sm border border-3 border-white"
                                    style={{width: '120px', height: '120px'}}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/120?text=Ошибка+загрузки';
                                    }}
                                />
                            ) : (
                                <div
                                    className="mx-auto rounded-circle bg-light d-flex justify-content-center align-items-center border"
                                    style={{width: '120px', height: '120px'}}>
                                    <PersonBadge size={40} className="text-muted opacity-50"/>
                                </div>
                            )}
                        </div>

                        <div className="mb-4 text-start">
                            <label className="form-label small fw-bold text-muted text-uppercase mb-2">URL
                                изображения</label>
                            <input
                                type="url"
                                className="form-control bg-light border-0 custom-input"
                                placeholder="https://..."
                                value={tempAvatarUrl}
                                onChange={e => setTempAvatarUrl(e.target.value)}
                            />
                        </div>

                        <div className="d-flex gap-3">
                            <button className="btn btn-light w-50 py-3 fw-bold rounded-pill"
                                    onClick={() => setShowAvatarModal(false)}>Отмена
                            </button>
                            <button className="btn btn-primary w-50 py-3 fw-bold rounded-pill shadow-sm"
                                    onClick={handleSaveAvatarUrl}>Применить
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="d-flex align-items-center gap-4 mb-5">
                <div className="position-relative">
                    {profileForm.avatar ? (
                        <img src={profileForm.avatar} alt="Avatar"
                             className="rounded-circle object-fit-cover shadow-sm border border-2 border-white"
                             style={{width: '80px', height: '80px'}}
                             onError={(e) => {
                                 e.target.src = 'https://via.placeholder.com/80?text=Нет+фото';
                             }}
                        />
                    ) : (
                        <div
                            className="p-3 rounded-circle bg-white shadow-sm border border-light d-flex justify-content-center align-items-center"
                            style={{width: '80px', height: '80px'}}>
                            <PersonBadge size={32} className="text-primary"/>
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="fw-800 mb-1">Настройки аккаунта</h1>
                    <p className="text-muted mb-0">{user?.first_name || user?.username}</p>
                </div>
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
                            <form onSubmit={handleProfileUpdate} className="fade-in">
                                <div
                                    className="mb-5 border-bottom pb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div>
                                        <h4 className="fw-bold mb-1 text-dark">Профиль пользователя</h4>
                                        <p className="text-muted small mb-0">Обновите вашу контактную информацию</p>
                                    </div>

                                    <div>
                                        <button type="button"
                                                className="btn btn-outline-primary rounded-pill btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-2 transition-all hover-lift"
                                                onClick={() => {
                                                    setTempAvatarUrl(profileForm.avatar);
                                                    setShowAvatarModal(true);
                                                }}>
                                            <Camera/> Ссылка на фото
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2 text-uppercase">Логин
                                        (ID)</label>
                                    <input className="form-control bg-light border-0 custom-input opacity-75"
                                           value={user?.username || ''} disabled/>
                                </div>

                                <div className="row mb-4 g-3">
                                    <div className="col-md-6">
                                        <label
                                            className="form-label text-muted small fw-bold mb-2 text-uppercase">Имя</label>
                                        <input
                                            className="form-control bg-light border-0 custom-input"
                                            value={profileForm.first_name}
                                            onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label
                                            className="form-label text-muted small fw-bold mb-2 text-uppercase">Фамилия</label>
                                        <input
                                            className="form-control bg-light border-0 custom-input"
                                            value={profileForm.last_name}
                                            onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2 text-uppercase">Электронная
                                        почта</label>
                                    <div className="position-relative">
                                        <Envelope
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"/>
                                        <input
                                            type="email"
                                            className="form-control bg-light border-0 custom-input ps-5 opacity-75"
                                            value={user?.email || ''}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="col-12 mt-0 mb-4">
                                    <div className="form-text" style={{fontSize: '0.75rem'}}>Логин и Email привязаны к
                                        вашему аккаунту и не подлежат изменению.
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label
                                        className="form-label text-muted small fw-bold mb-2 text-uppercase">Телефон</label>
                                    <div className="position-relative">
                                        <Telephone
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"/>
                                        <input
                                            type="tel"
                                            className="form-control bg-light border-0 custom-input ps-5"
                                            placeholder="+7 (999) 000-00-00"
                                            value={profileForm.phone}
                                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button type="submit"
                                        className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center hover-lift">
                                    <Save className="me-2"/> Сохранить изменения
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="fade-in">
                                <div className="mb-5 border-bottom pb-3">
                                    <h4 className="fw-bold mb-1 text-dark">Защита аккаунта</h4>
                                    <p className="text-muted small mb-0">Регулярная смена пароля повышает безопасность
                                        данных</p>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2 text-uppercase">Текущий
                                        пароль</label>
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

                                <div className="position-relative my-5">
                                    <hr className="opacity-10"/>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold mb-2 text-uppercase">Новый
                                        пароль</label>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-0 custom-input"
                                        required minLength={8}
                                        onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                        value={passwordForm.new_password}
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className="form-label text-muted small fw-bold mb-2 text-uppercase">Повторите
                                        новый пароль</label>
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

                                <button type="submit"
                                        className="btn btn-danger px-5 py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center hover-lift">
                                    <ShieldLock className="me-2"/> Изменить пароль
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