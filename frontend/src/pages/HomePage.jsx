import React, {useEffect, useState} from 'react';
import api from '../api';
import BookingModal from '../components/BookingModal';
import {useNavigate} from 'react-router-dom';

const HomePage = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('access_token');

    const fetchRooms = () => {
        api.get('rooms/')
            .then(response => setRooms(response.data))
            .catch(error => console.error('Ошибка загрузки:', error));
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleBookClick = (room) => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            setSelectedRoom(room);
            setShowModal(true);
        }
    };

    return (
        <div className="container">
            <h2 className="mb-4">Доступные переговорные</h2>
            <div className="row">
                {rooms.map(room => (
                    <div key={room.id} className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            {room.preview ? (
                                <img
                                    src={room.preview}
                                    className="card-img-top"
                                    alt={room.title}
                                    style={{height: '200px', objectFit: 'cover'}}
                                />
                            ) : (
                                <div
                                    className="bg-secondary text-white d-flex align-items-center justify-content-center"
                                    style={{height: '200px'}}
                                >
                                    <span>Нет фото</span>
                                </div>
                            )}

                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{room.title}</h5>
                                <p className="card-text text-muted small mb-2">
                                    {room.location} (Этаж {room.level})
                                </p>
                                <p className="card-text flex-grow-1">
                                    {room.info && room.info.substring(0, 100)}...
                                </p>
                                <div className="mt-auto">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="badge bg-info text-dark">Мест: {room.max_capacity}</span>
                                        <span className="text-primary fw-bold">{room.room_type}</span>
                                    </div>
                                    <button
                                        className="btn btn-outline-primary w-100"
                                        onClick={() => handleBookClick(room)}
                                    >
                                        Забронировать
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRoom && (
                <BookingModal
                    room={selectedRoom}
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onBookingSuccess={() => {
                        alert('Бронирование успешно создано!');
                        fetchRooms();
                    }}
                />
            )}
        </div>
    );
};

export default HomePage;