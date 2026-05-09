import React, {useState} from 'react';
import api from '../api';

const BookingModal = ({room, show, onClose, onBookingSuccess}) => {
    const [formData, setFormData] = useState({
        start_at: '',
        end_at: '',
        note: ''
    });
    const [error, setError] = useState('');

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('reservations/', {
                room: room.id,
                start_at: formData.start_at,
                end_at: formData.end_at,
                note: formData.note
            });
            onBookingSuccess();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.non_field_errors?.[0] || 'Ошибка при бронировании';
            setError(msg);
        }
    };

    return (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Забронировать: {room.title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label">Начало</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    required
                                    onChange={e => setFormData({...formData, start_at: e.target.value})}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Конец</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    required
                                    onChange={e => setFormData({...formData, end_at: e.target.value})}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Цель встречи</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    onChange={e => setFormData({...formData, note: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                            <button type="submit" className="btn btn-primary">Подтвердить</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;