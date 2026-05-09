import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import api from '../api';
import {
    CalendarEvent,
    CameraVideo,
    Check2Circle,
    Clock,
    Easel,
    GeoAlt,
    InfoCircle,
    People,
    Projector,
    X
} from 'react-bootstrap-icons';

const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 21; i++) {
        const hour = i < 10 ? `0${i}` : i;
        slots.push(`${hour}:00`);
        if (i !== 21) slots.push(`${hour}:30`);
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

const BookingModal = ({room, show, onClose, onBookingSuccess}) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [note, setNote] = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && room) {
            fetchBusySlots();
        }
    }, [show, room, date]);

    const fetchBusySlots = async () => {
        try {
            const res = await api.get(`rooms/${room.id}/bookings/?date=${date}`);
            setBusySlots(res.data);
        } catch (error) {
            console.error("Ошибка загрузки расписания");
        }
    };

    const isTimeBusy = (timeStr) => {
        const checkTime = new Date(`${date}T${timeStr}`);
        return busySlots.some(slot => {
            const start = new Date(slot.start_at);
            const end = new Date(slot.end_at);
            return checkTime >= start && checkTime < end;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('reservations/', {
                room: room.id,
                start_at: `${date}T${startTime}`,
                end_at: `${date}T${endTime}`,
                note: note
            });
            onBookingSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка при бронировании');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const getMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    return createPortal(
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{zIndex: 2000, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)'}}
             onClick={onClose}>

            <div className="bg-white shadow-2xl fade-in overflow-hidden position-relative"
                 style={{borderRadius: '28px', maxWidth: '900px', width: '95%', maxHeight: '90vh'}}
                 onClick={e => e.stopPropagation()}>

                <div className="p-4 border-bottom d-flex justify-content-between align-items-start bg-light">
                    <div>
                        <h3 className="fw-800 mb-1 text-dark">{room.title}</h3>
                        <div className="text-muted small d-flex align-items-center">
                            <GeoAlt className="me-1 text-primary"/> {room.location} • {room.level} этаж
                        </div>
                    </div>
                    <button className="btn btn-light rounded-circle p-2" onClick={onClose}>
                        <X size={24}/>
                    </button>
                </div>

                <div className="row g-0">
                    <div className="col-lg-7 p-4 border-end"
                         style={{overflowY: 'auto', maxHeight: 'calc(90vh - 100px)'}}>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Дата
                                    встречи</label>
                                <div className="position-relative">
                                    <CalendarEvent
                                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary"/>
                                    <input type="date" className="form-control custom-input ps-5" required
                                           value={date} onChange={e => setDate(e.target.value)}
                                           min={new Date().toISOString().split('T')[0]}/>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-3">Визуальное
                                    расписание</label>
                                <div className="d-flex border rounded-3 overflow-hidden bg-light"
                                     style={{height: '45px'}}>
                                    {Array.from({length: 13}).map((_, i) => {
                                        const hour = i + 8;
                                        const hStr = hour < 10 ? `0${hour}` : hour;
                                        const busy1 = isTimeBusy(`${hStr}:00:00`);
                                        const busy2 = isTimeBusy(`${hStr}:30:00`);

                                        const selStart = getMinutes(startTime);
                                        const selEnd = getMinutes(endTime);
                                        const mins1 = hour * 60;
                                        const mins2 = hour * 60 + 30;

                                        const getColor = (busy, inSel) => {
                                            if (inSel && busy) return '#f87171'; // Конфликт
                                            if (inSel) return 'var(--primary)'; // Ваш выбор
                                            if (busy) return '#e2e8f0'; // Занято
                                            return 'transparent';
                                        };

                                        return (
                                            <div key={hour} className="flex-grow-1 border-end position-relative">
                                                <div className="text-center bg-white border-bottom"
                                                     style={{fontSize: '0.6rem', color: '#94a3b8'}}>{hStr}</div>
                                                <div className="d-flex h-100">
                                                    <div className="flex-grow-1"
                                                         style={{background: getColor(busy1, mins1 >= selStart && mins1 < selEnd)}}></div>
                                                    <div className="flex-grow-1 border-start border-dotted"
                                                         style={{background: getColor(busy2, mins2 >= selStart && mins2 < selEnd)}}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="d-flex gap-3 mt-2 justify-content-center small text-muted"
                                     style={{fontSize: '0.7rem'}}>
                                    <div className="d-flex align-items-center gap-1"><span className="border rounded"
                                                                                           style={{
                                                                                               width: 10,
                                                                                               height: 10
                                                                                           }}></span> Свободно
                                    </div>
                                    <div className="d-flex align-items-center gap-1"><span className="rounded" style={{
                                        width: 10,
                                        height: 10,
                                        background: 'var(--primary)'
                                    }}></span> Выбрано
                                    </div>
                                    <div className="d-flex align-items-center gap-1"><span className="rounded" style={{
                                        width: 10,
                                        height: 10,
                                        background: '#e2e8f0'
                                    }}></span> Занято
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-muted">Начало</label>
                                    <select className="form-select custom-input" value={startTime}
                                            onChange={e => setStartTime(e.target.value)}>
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-muted">Конец</label>
                                    <select className="form-select custom-input" value={endTime}
                                            onChange={e => setEndTime(e.target.value)}>
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Цель
                                    встречи</label>
                                <textarea className="form-control custom-input" rows="2"
                                          placeholder="Например: Обсуждение квартальных отчетов"
                                          value={note} onChange={e => setNote(e.target.value)}/>
                            </div>

                            <button type="submit"
                                    className="btn btn-primary w-100 py-3 rounded-pill shadow-lg d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <><Check2Circle
                                    size={20}/> Подтвердить бронь</>}
                            </button>
                        </form>
                    </div>

                    <div className="col-lg-5 bg-light p-4 d-none d-lg-block">
                        <img src={room.preview || '/placeholder.jpg'} className="w-100 rounded-4 shadow-sm mb-4"
                             style={{height: '200px', objectFit: 'cover'}} alt={room.title}/>

                        <div className="bg-white p-3 rounded-4 shadow-sm mb-4 border">
                            <h6 className="fw-bold mb-3 d-flex align-items-center"><InfoCircle
                                className="me-2 text-primary"/> Оснащение</h6>
                            <div className="row g-3">
                                <div
                                    className={`col-6 small d-flex align-items-center gap-2 ${room.has_tv ? '' : 'opacity-25'}`}>
                                    <CameraVideo className="text-primary"/> ТВ / Видео
                                </div>
                                <div
                                    className={`col-6 small d-flex align-items-center gap-2 ${room.has_whiteboard ? '' : 'opacity-25'}`}>
                                    <Easel className="text-primary"/> Доска
                                </div>
                                <div
                                    className={`col-6 small d-flex align-items-center gap-2 ${room.room_type === 'conf' ? '' : 'opacity-25'}`}>
                                    <Projector className="text-primary"/> Проектор
                                </div>
                                <div className="col-6 small d-flex align-items-center gap-2">
                                    <People className="text-primary"/> до {room.max_capacity} чел.
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-info border-0 shadow-sm rounded-4 small mb-0">
                            <Clock className="me-2"/> Бронирование доступно с 08:00 до 21:00. Шаг выбора – 30 минут.
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BookingModal;