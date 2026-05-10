import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {
    CalendarCheck,
    CheckAll,
    CheckCircleFill,
    DoorOpen,
    Easel,
    ExclamationCircleFill,
    ExclamationTriangleFill,
    HourglassSplit,
    PencilSquare,
    People,
    PersonBadge,
    PlusCircle,
    Projector,
    ShieldLockFill,
    Trash,
    Tv,
    XCircle
} from 'react-bootstrap-icons';
import api from '../api';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [loading, setLoading] = useState(true);

    const [bookings, setBookings] = useState([]);
    const [bookingFilter, setBookingFilter] = useState('pending');

    const [rooms, setRooms] = useState([]);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomPreviewFile, setRoomPreviewFile] = useState(null);
    const [roomForm, setRoomForm] = useState({
        title: '', room_type: 'small', location: '', level: 1, max_capacity: 4,
        has_tv: false, has_whiteboard: false, has_projector: false, is_active: true, info: ''
    });
    const fileInputRef = useRef(null);

    const [deleteModal, setDeleteModal] = useState({show: false, roomId: null, roomTitle: ''});

    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('regular');

    const fetchAllBookings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('reservations/');
            const sorted = res.data.sort((a, b) => new Date(b.start_at) - new Date(a.start_at));
            setBookings(sorted);
        } catch (error) {
            console.error("Ошибка при загрузке бронирований", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('rooms/');
            setRooms(res.data);
        } catch (error) {
            console.error("Ошибка при загрузке комнат", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('auth/users/');
            setUsers(res.data);
        } catch (error) {
            console.error("Ошибка при загрузке пользователей", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (activeTab === 'bookings') fetchAllBookings();
        if (activeTab === 'rooms') fetchRooms();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, fetchAllBookings, fetchRooms, fetchUsers]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`reservations/${id}/`, {status: newStatus});
            setBookings(bookings.map(b => b.id === id ? {...b, status: newStatus} : b));
        } catch (error) {
            alert('Ошибка при обновлении статуса');
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});

    const filteredBookings = bookings.filter(b => {
        const isPast = new Date(b.end_at) < new Date();
        if (bookingFilter === 'pending') return b.status === 'new' && !isPast;
        return true;
    });

    const filteredUsers = users.filter(u => {
        if (userFilter === 'admin') return u.is_staff;
        if (userFilter === 'regular') return !u.is_staff;
        return true;
    });

    const openAddRoomModal = () => {
        setCurrentRoom(null);
        setRoomForm({
            title: '', room_type: 'small', location: '', level: 1, max_capacity: 4,
            has_tv: false, has_whiteboard: false, has_projector: false, is_active: true, info: ''
        });
        setRoomPreviewFile(null);
        setShowRoomModal(true);
    };

    const openEditRoomModal = (room) => {
        setCurrentRoom(room);
        setRoomForm({
            title: room.title, room_type: room.room_type, location: room.location,
            level: room.level, max_capacity: room.max_capacity, has_tv: room.has_tv,
            has_whiteboard: room.has_whiteboard, has_projector: room.has_projector,
            is_active: room.is_active, info: room.info
        });
        setRoomPreviewFile(null);
        setShowRoomModal(true);
    };

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(roomForm).forEach(key => formData.append(key, roomForm[key]));
        if (roomPreviewFile) formData.append('preview', roomPreviewFile);

        try {
            if (currentRoom) {
                await api.patch(`rooms/${currentRoom.id}/`, formData, {headers: {'Content-Type': 'multipart/form-data'}});
            } else {
                await api.post('rooms/', formData, {headers: {'Content-Type': 'multipart/form-data'}});
            }
            setShowRoomModal(false);
            fetchRooms();
        } catch (error) {
            alert('Ошибка при сохранении комнаты.');
        }
    };

    const confirmDeleteRoom = async () => {
        const id = deleteModal.roomId;
        try {
            await api.delete(`rooms/${id}/`);
            setRooms(rooms.filter(r => r.id !== id));
            setDeleteModal({show: false, roomId: null, roomTitle: ''});
        } catch (error) {
            alert('Не удалось удалить комнату. Проверьте, нет ли в ней активных бронирований.');
            setDeleteModal({show: false, roomId: null, roomTitle: ''});
        }
    };

    return (
        <div className="container py-5 fade-in position-relative">

            {deleteModal.show && createPortal(
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{background: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, backdropFilter: 'blur(8px)'}}>
                    <div className="bg-white p-4 p-md-5 shadow-lg text-center mx-3"
                         style={{
                             borderRadius: '28px',
                             maxWidth: '450px',
                             width: '100%',
                             animation: 'fadeIn 0.3s ease'
                         }}>
                        <div className="mb-4">
                            <ExclamationCircleFill size={60} className="text-danger opacity-75"/>
                        </div>
                        <h3 className="fw-800 mb-3">Удалить комнату?</h3>
                        <p className="text-muted mb-4">
                            Вы собираетесь удалить <strong>{deleteModal.roomTitle}</strong>.
                            Это действие нельзя будет отменить, и все данные о помещении исчезнут.
                        </p>
                        <div className="d-flex gap-3">
                            <button className="btn btn-light w-100 py-3 fw-bold rounded-4"
                                    onClick={() => setDeleteModal({show: false, roomId: null, roomTitle: ''})}>
                                Назад
                            </button>
                            <button className="btn btn-danger w-100 py-3 fw-bold rounded-4" onClick={confirmDeleteRoom}>
                                Да, удалить
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showRoomModal && createPortal(
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        zIndex: 3000,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(8px)',
                        overflowY: 'auto'
                    }}
                    onMouseDown={() => setShowRoomModal(false)}>

                    <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg fade-in my-5"
                         style={{maxWidth: '600px', width: '90%'}}
                         onMouseDown={e => e.stopPropagation()}>

                        <h4 className="fw-bold mb-4 text-dark">{currentRoom ? 'Редактировать комнату' : 'Новая комната'}</h4>

                        <form onSubmit={handleRoomSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">НАЗВАНИЕ</label>
                                <input type="text" className="form-control bg-light border-0 custom-input" required
                                       value={roomForm.title}
                                       onChange={e => setRoomForm({...roomForm, title: e.target.value})}/>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">ТИП</label>
                                    <select className="form-select bg-light border-0 custom-input"
                                            value={roomForm.room_type}
                                            onChange={e => setRoomForm({...roomForm, room_type: e.target.value})}>
                                        <option value="conf">Конференц-зал</option>
                                        <option value="small">Переговорная</option>
                                        <option value="open">Open Space</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">ВМЕСТИМОСТЬ (ЧЕЛ)</label>
                                    <input type="number" className="form-control bg-light border-0 custom-input"
                                           required min="1"
                                           value={roomForm.max_capacity}
                                           onChange={e => setRoomForm({...roomForm, max_capacity: e.target.value})}/>
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-muted">РАСПОЛОЖЕНИЕ</label>
                                    <input type="text" className="form-control bg-light border-0 custom-input" required
                                           value={roomForm.location}
                                           onChange={e => setRoomForm({...roomForm, location: e.target.value})}/>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted">ЭТАЖ</label>
                                    <input type="number" className="form-control bg-light border-0 custom-input"
                                           required
                                           value={roomForm.level}
                                           onChange={e => setRoomForm({...roomForm, level: e.target.value})}/>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-4 mb-4 p-3 bg-light rounded-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="tv"
                                           checked={roomForm.has_tv}
                                           onChange={e => setRoomForm({...roomForm, has_tv: e.target.checked})}/>
                                    <label className="form-check-label small fw-bold text-muted" htmlFor="tv">ТВ /
                                        Экран</label>
                                </div>
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="board"
                                           checked={roomForm.has_whiteboard} onChange={e => setRoomForm({
                                        ...roomForm,
                                        has_whiteboard: e.target.checked
                                    })}/>
                                    <label className="form-check-label small fw-bold text-muted"
                                           htmlFor="board">Доска</label>
                                </div>
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="proj"
                                           checked={roomForm.has_projector}
                                           onChange={e => setRoomForm({...roomForm, has_projector: e.target.checked})}/>
                                    <label className="form-check-label small fw-bold text-muted"
                                           htmlFor="proj">Проектор</label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                                    <input className="form-check-input m-0 shadow-sm" type="checkbox" id="active"
                                           role="switch"
                                           checked={roomForm.is_active}
                                           onChange={e => setRoomForm({...roomForm, is_active: e.target.checked})}
                                           style={{width: '40px', height: '20px', cursor: 'pointer'}}/>
                                    <label className="form-check-label fw-bold text-dark" htmlFor="active"
                                           style={{cursor: 'pointer', paddingTop: '2px'}}>
                                        Доступна для бронирования
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">ФОТОГРАФИЯ (ОПЦИОНАЛЬНО)</label>
                                <input type="file" ref={fileInputRef}
                                       className="form-control bg-light border-0 custom-input" accept="image/*"
                                       onChange={e => setRoomPreviewFile(e.target.files[0])}/>
                            </div>

                            <div className="d-flex gap-3 mt-5">
                                <button type="button" className="btn btn-light w-50 py-3 fw-bold rounded-pill"
                                        onClick={() => setShowRoomModal(false)}>Отмена
                                </button>
                                <button type="submit"
                                        className="btn btn-primary w-50 py-3 fw-bold rounded-pill shadow-sm">Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <div className="d-flex align-items-center gap-3 mb-5">
                <div className="p-3 rounded-4 shadow-sm text-white" style={{background: '#6610f2'}}>
                    <ShieldLockFill size={32}/>
                </div>
                <div>
                    <h1 className="fw-800 mb-0">Панель администратора</h1>
                    <p className="text-muted mb-0">Управление ресурсами платформы</p>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-3">
                    <div className="card border-0 shadow-sm p-3 rounded-4 bg-white sticky-top" style={{top: '100px'}}>
                        <div className="nav flex-column nav-pills gap-2">
                            <button
                                className={`nav-link rounded-3 text-start fw-bold d-flex align-items-center gap-3 py-3 px-3 border-0 transition-all ${activeTab === 'bookings' ? 'text-white shadow-sm' : 'bg-transparent text-muted hover-light'}`}
                                style={{background: activeTab === 'bookings' ? '#6610f2' : ''}}
                                onClick={() => setActiveTab('bookings')}
                            >
                                <CalendarCheck size={20}/> Бронирования
                            </button>
                            <button
                                className={`nav-link rounded-3 text-start fw-bold d-flex align-items-center gap-3 py-3 px-3 border-0 transition-all ${activeTab === 'rooms' ? 'text-white shadow-sm' : 'bg-transparent text-muted hover-light'}`}
                                style={{background: activeTab === 'rooms' ? '#6610f2' : ''}}
                                onClick={() => setActiveTab('rooms')}
                            >
                                <DoorOpen size={20}/> Переговорные
                            </button>
                            <button
                                className={`nav-link rounded-3 text-start fw-bold d-flex align-items-center gap-3 py-3 px-3 border-0 transition-all ${activeTab === 'users' ? 'text-white shadow-sm' : 'bg-transparent text-muted hover-light'}`}
                                style={{background: activeTab === 'users' ? '#6610f2' : ''}}
                                onClick={() => setActiveTab('users')}
                            >
                                <People size={20}/> Пользователи
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-9">

                    {activeTab === 'bookings' && (
                        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white fade-in">
                            <h4 className="fw-bold mb-4 text-dark">Управление бронированиями</h4>

                            <div className="d-flex gap-2 mb-4 bg-light p-2 rounded-4 d-inline-flex border">
                                <button
                                    className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${bookingFilter === 'pending' ? 'btn-white bg-white shadow-sm text-dark' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setBookingFilter('pending')}
                                >
                                    Ожидают
                                    ({bookings.filter(b => b.status === 'new' && new Date(b.end_at) > new Date()).length})
                                </button>
                                <button
                                    className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${bookingFilter === 'all' ? 'btn-white bg-white shadow-sm text-dark' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setBookingFilter('all')}
                                >
                                    Все записи
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                    <CalendarCheck size={40} className="text-muted opacity-50 mb-3"/>
                                    <h5 className="fw-bold text-dark">Здесь пока пусто</h5>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {filteredBookings.map(booking => {
                                        const isPast = new Date(booking.end_at) < new Date();
                                        return (
                                            <div key={booking.id}
                                                 className={`p-4 rounded-4 border bg-white shadow-sm d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center transition-all ${isPast ? 'opacity-75' : 'hover-border-primary'}`}>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <h5 className={`fw-bold mb-0 ${isPast ? 'text-muted' : 'text-dark'}`}>{booking.room_details?.title}</h5>
                                                        {booking.status === 'canceled' ? (
                                                            <span
                                                                className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill"><ExclamationTriangleFill/> Отменено</span>
                                                        ) : isPast ? (
                                                            <span
                                                                className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill"><CheckAll/> Завершено</span>
                                                        ) : booking.status === 'new' ? (
                                                            <span
                                                                className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill"><HourglassSplit/> Ожидает</span>
                                                        ) : (
                                                            <span
                                                                className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill"><CheckCircleFill/> Подтверждено</span>
                                                        )}
                                                    </div>
                                                    <div className="text-muted small mb-2">
                                                        <strong
                                                            className={isPast ? "text-muted" : "text-dark"}>{booking.client_info?.first_name} {booking.client_info?.last_name}</strong> (@{booking.client_info?.username})
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-3 small">
                                                        <span
                                                            className="bg-light px-2 py-1 rounded text-muted">📅 {formatDate(booking.start_at)}</span>
                                                        <span
                                                            className="bg-light px-2 py-1 rounded text-muted">⏰ {formatTime(booking.start_at)} - {formatTime(booking.end_at)}</span>
                                                    </div>
                                                </div>
                                                {booking.status === 'new' && !isPast && (
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-outline-danger rounded-pill px-3 py-2 fw-bold text-nowrap"
                                                            onClick={() => handleUpdateStatus(booking.id, 'canceled')}>
                                                            <XCircle className="me-1"/> Отклонить
                                                        </button>
                                                        <button
                                                            className="btn btn-success rounded-pill px-3 py-2 fw-bold text-nowrap shadow-sm"
                                                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>
                                                            <CheckCircleFill className="me-1"/> Подтвердить
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'rooms' && (
                        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold text-dark mb-0">Фонд переговорных</h4>
                                <button
                                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift"
                                    onClick={openAddRoomModal}>
                                    <PlusCircle/> Добавить
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : rooms.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                    <DoorOpen size={40} className="text-muted opacity-50 mb-3"/>
                                    <h5 className="fw-bold text-dark">Комнат пока нет</h5>
                                </div>
                            ) : (
                                <div className="row g-4">
                                    {rooms.map(room => (
                                        <div key={room.id} className="col-md-6">
                                            <div
                                                className={`card h-100 border rounded-4 overflow-hidden shadow-sm transition-all hover-border-primary ${!room.is_active ? 'opacity-75 bg-light' : ''}`}>
                                                <div className="position-relative" style={{height: '160px'}}>
                                                    <img
                                                        src={room.preview || 'https://placehold.co/400x200?text=Нет+фото'}
                                                        alt={room.title} className="w-100 h-100 object-fit-cover"/>
                                                    {!room.is_active && (
                                                        <div
                                                            className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                                                            <span
                                                                className="badge bg-danger fs-6 rounded-pill px-3 py-2">Скрыта / Неактивна</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="card-body p-4 text-start">
                                                    <div
                                                        className="d-flex justify-content-between align-items-start mb-2">
                                                        <h5 className="fw-bold mb-0 text-dark">{room.title}</h5>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-light btn-sm rounded-circle p-2 text-primary hover-lift"
                                                                onClick={() => openEditRoomModal(room)}>
                                                                <PencilSquare size={16}/>
                                                            </button>
                                                            <button
                                                                className="btn btn-light btn-sm rounded-circle p-2 text-danger hover-lift"
                                                                onClick={() => setDeleteModal({
                                                                    show: true,
                                                                    roomId: room.id,
                                                                    roomTitle: room.title
                                                                })}>
                                                                <Trash size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted small mb-3">📍 {room.location} • {room.level} этаж</p>
                                                    <div className="d-flex flex-wrap gap-2 mb-0">
                                                        <span
                                                            className="badge bg-light text-dark border fw-normal"><People
                                                            size={12}/> {room.max_capacity} мест</span>
                                                        {room.has_tv && <span
                                                            className="badge bg-light text-muted border fw-normal"><Tv
                                                            size={12}/></span>}
                                                        {room.has_whiteboard && <span
                                                            className="badge bg-light text-muted border fw-normal"><Easel
                                                            size={12}/></span>}
                                                        {room.has_projector && <span
                                                            className="badge bg-light text-muted border fw-normal"><Projector
                                                            size={12}/></span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white fade-in">
                            <h4 className="fw-bold text-dark mb-4">Пользователи платформы</h4>
                            <div className="d-flex gap-2 mb-4 bg-light p-2 rounded-4 d-inline-flex border">
                                <button
                                    className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${userFilter === 'regular' ? 'btn-white bg-white shadow-sm text-dark' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setUserFilter('regular')}>
                                    Обычные пользователи ({users.filter(u => !u.is_staff).length})
                                </button>
                                <button
                                    className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${userFilter === 'admin' ? 'btn-white bg-white shadow-sm text-dark' : 'btn-light text-muted border-0'}`}
                                    onClick={() => setUserFilter('admin')}>
                                    Администраторы ({users.filter(u => u.is_staff).length})
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                    <People size={40} className="text-muted opacity-50 mb-3"/>
                                    <h5 className="fw-bold text-dark">В этой категории нет пользователей</h5>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle border-top border-bottom">
                                        <thead className="table-light text-muted small">
                                        <tr>
                                            <th className="fw-bold py-3 px-4 rounded-start">ПОЛЬЗОВАТЕЛЬ</th>
                                            <th className="fw-bold py-3">КОНТАКТЫ</th>
                                            <th className="fw-bold py-3 text-center rounded-end">СТАТУС</th>
                                        </tr>
                                        </thead>
                                        <tbody className="border-top-0">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="transition-all hover-light">
                                                <td className="py-3 px-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        {u.avatar ? (
                                                            <img src={u.avatar} alt="Avatar"
                                                                 className="rounded-circle object-fit-cover shadow-sm border border-white"
                                                                 style={{width: '45px', height: '45px'}}/>
                                                        ) : (
                                                            <div
                                                                className="rounded-circle bg-light border d-flex justify-content-center align-items-center"
                                                                style={{width: '45px', height: '45px'}}>
                                                                <PersonBadge size={20} className="text-muted"/>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div
                                                                className="fw-bold text-dark">{u.first_name || 'Без имени'} {u.last_name || ''}</div>
                                                            <div className="text-muted small">@{u.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="small text-dark">{u.email}</div>
                                                    <div className="small text-muted">{u.phone || '—'}</div>
                                                </td>
                                                <td className="py-3 text-center">
                                                    {u.is_staff ? (
                                                        <span className="badge rounded-pill fw-normal px-3 py-2"
                                                              style={{
                                                                  background: 'rgba(102, 16, 242, 0.1)',
                                                                  color: '#6610f2',
                                                                  border: '1px solid rgba(102, 16, 242, 0.2)'
                                                              }}>
                                                                <ShieldLockFill className="me-1"/> Админ
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="badge bg-light text-muted border rounded-pill fw-normal px-3 py-2">
                                                            Пользователь
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;