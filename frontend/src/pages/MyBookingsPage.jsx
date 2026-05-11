import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useNavigate} from 'react-router-dom';
import api from '../api';
import {
    ArrowRight,
    CalendarCheck,
    CheckAll,
    CheckCircleFill,
    Clock,
    ExclamationCircleFill,
    ExclamationTriangleFill,
    GeoAlt,
    HourglassSplit,
    JournalText,
    People,
    XCircle
} from 'react-bootstrap-icons';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('active');
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState({show: false, bookingId: null});

    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMyBookings();
    }, []);

    const fetchMyBookings = async () => {
        try {
            const userResponse = await api.get('auth/users/me/');
            const currentUserId = userResponse.data.id;
            const response = await api.get('reservations/');
            const myBookings = response.data.filter(b => b.client === currentUserId);
            const sorted = myBookings.sort((a, b) => new Date(b.start_at) - new Date(a.start_at));
            setBookings(sorted);
        } catch (err) {
            console.error('Ошибка при загрузке бронирований', err);
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = (id) => {
        setCancelModal({show: true, bookingId: id});
    };

    const closeCancelModal = () => {
        setCancelModal({show: false, bookingId: null});
    };

    const confirmCancel = async () => {
        const id = cancelModal.bookingId;
        try {
            await api.patch(`reservations/${id}/`, {status: 'canceled'});

            setBookings(bookings.map(b => b.id === id ? {...b, status: 'canceled'} : b));
            closeCancelModal();
        } catch (err) {
            alert('Не удалось отменить бронирование');
            closeCancelModal();
        }
    };

    const isBookingActive = (b) => {
        const isPast = new Date(b.end_at) < new Date();
        return !isPast && b.status !== 'canceled';
    };

    const filteredBookings = bookings.filter(b => {
        return filter === 'active' ? isBookingActive(b) : !isBookingActive(b);
    });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('ru-RU', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            <div className="container py-5 fade-in">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="p-3 rounded-4 bg-white shadow-sm">
                        <CalendarCheck size={32} className="text-primary"/>
                    </div>
                    <h1 className="fw-800 mb-0">Мои бронирования</h1>
                </div>

                <div className="d-flex gap-2 mb-5 bg-white p-2 rounded-4 shadow-sm d-inline-flex border">
                    <button
                        className={`tab-btn ${filter === 'active' ? 'active' : 'inactive'}`}
                        onClick={() => setFilter('active')}
                    >
                        Активные ({bookings.filter(isBookingActive).length})
                    </button>
                    <button
                        className={`tab-btn ${filter === 'archive' ? 'active' : 'inactive'}`}
                        onClick={() => setFilter('archive')}
                    >
                        Архив ({bookings.filter(b => !isBookingActive(b)).length})
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-5 shadow-sm border border-dashed">
                        <div className="mb-4 opacity-25">
                            {filter === 'active' ? <CalendarCheck size={60}/> : <JournalText size={60}/>}
                        </div>
                        <h4 className="fw-bold text-dark">
                            {filter === 'active' ? 'Активных броней пока нет' : 'История пуста'}
                        </h4>
                        <p className="text-muted mb-4">
                            {filter === 'active'
                                ? 'Самое время запланировать новую встречу!'
                                : 'Здесь будут храниться ваши прошедшие бронирования.'}
                        </p>
                        {filter === 'active' && (
                            <button className="btn btn-primary px-4 py-2" onClick={() => navigate('/')}>
                                Найти переговорку <ArrowRight className="ms-2"/>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-4">
                        {filteredBookings.map(booking => {
                            const isPast = new Date(booking.end_at) < new Date();
                            const isArchived = !isBookingActive(booking);

                            return (
                                <div key={booking.id}
                                     className={`booking-card shadow-sm p-4 overflow-hidden position-relative ${isArchived ? 'opacity-75' : ''}`}>
                                    <div className="row g-4 align-items-center">
                                        <div className="col-lg-2 d-none d-lg-block">
                                            <img
                                                src={booking.room_details?.preview || 'https://via.placeholder.com/150'}
                                                alt={booking.room_details?.title}
                                                className="img-fluid rounded-4 shadow-sm"
                                                style={{height: '120px', width: '100%', objectFit: 'cover'}}
                                            />
                                        </div>

                                        <div className="col-lg-7">
                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                <h3 className={`fw-800 mb-0 ${isArchived ? 'text-muted' : 'text-dark'}`}>
                                                    {booking.room_details?.title}
                                                </h3>

                                                {booking.status === 'canceled' ? (
                                                    <span
                                                        className="status-badge bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2">
                                                        <ExclamationTriangleFill size={14}/> Отменено
                                                    </span>
                                                ) : isPast ? (
                                                    <span
                                                        className="status-badge bg-secondary bg-opacity-10 text-secondary d-flex align-items-center gap-2">
                                                        <CheckAll size={14}/> Завершено
                                                    </span>
                                                ) : booking.status === 'new' ? (
                                                    <span
                                                        className="status-badge bg-warning bg-opacity-10 text-warning d-flex align-items-center gap-2">
                                                        <HourglassSplit size={14}/> Ожидает
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="status-badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-2">
                                                        <CheckCircleFill size={14}/> Подтверждено
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-muted mb-3 d-flex align-items-center gap-2 small">
                                                <GeoAlt className={isArchived ? "text-muted" : "text-primary"}/>
                                                {booking.room_details?.location} • {booking.room_details?.level} этаж
                                            </p>

                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                <div className="info-pill py-1 px-3">
                                                    <Clock className={isArchived ? "text-muted" : "text-primary"}
                                                           size={14}/>
                                                    <span className="small">
                                                        {formatDate(booking.start_at)}, <strong>{formatTime(booking.start_at)} – {formatTime(booking.end_at)}</strong>
                                                    </span>
                                                </div>
                                                <div className="info-pill py-1 px-3">
                                                    <People className={isArchived ? "text-muted" : "text-primary"}
                                                            size={14}/>
                                                    <span className="small">
                                                        до <strong>{booking.room_details?.max_capacity} чел.</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            {booking.note && (
                                                <div className="purpose-block py-2 px-3">
                                                    <div className="fw-semibold text-dark small">{booking.note}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-lg-3 text-lg-end">
                                            {filter === 'active' && (
                                                <button
                                                    className="btn-cancel-soft d-flex align-items-center gap-2 ms-lg-auto"
                                                    onClick={() => openCancelModal(booking.id)}
                                                >
                                                    <XCircle/> Отменить бронь
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {cancelModal.show && createPortal(
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
                        <h3 className="fw-800 mb-3">Отменить бронь?</h3>
                        <p className="text-muted mb-4">
                            Это действие нельзя будет отменить. Вы уверены, что хотите освободить данное время?
                        </p>
                        <div className="d-flex gap-3">
                            <button className="btn btn-light w-100 py-3 fw-bold rounded-4" onClick={closeCancelModal}>
                                Назад
                            </button>
                            <button className="btn btn-danger w-100 py-3 fw-bold rounded-4" onClick={confirmCancel}>
                                Да, отменить
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default MyBookingsPage;