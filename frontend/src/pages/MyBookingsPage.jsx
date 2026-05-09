import React, {useEffect, useState} from 'react';
import api from '../api';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const response = await api.get('reservations/');
                setBookings(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке бронирований');
            }
        };

        fetchMyBookings();
    }, []);

    const handleCancel = async (id) => {
        if (window.confirm('Вы уверены, что хотите отменить это бронирование?')) {
            try {
                await api.delete(`reservations/${id}/`);
                setBookings(bookings.filter(b => b.id !== id));
            } catch (err) {
                alert('Не удалось отменить бронирование');
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Мои бронирования</h2>
            {bookings.length === 0 ? (
                <div className="alert alert-info">У вас пока нет активных бронирований.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover shadow-sm">
                        <thead className="table-dark">
                        <tr>
                            <th>Комната</th>
                            <th>Дата и время</th>
                            <th>Статус</th>
                            <th>Цель</th>
                            <th>Действие</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.room_details?.title}</td>
                                <td>
                                    {new Date(booking.start_at).toLocaleString()} — <br/>
                                    {new Date(booking.end_at).toLocaleString()}
                                </td>
                                <td>
                    <span className={`badge ${booking.status === 'new' ? 'bg-warning' : 'bg-success'}`}>
                      {booking.status}
                    </span>
                                </td>
                                <td>{booking.note}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleCancel(booking.id)}
                                    >
                                        Отменить
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;