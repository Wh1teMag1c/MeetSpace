import React, {useEffect, useState} from 'react';
import api from '../api';

const HomePage = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        api.get('rooms/')
            .then(response => setRooms(response.data))
            .catch(error => console.error('Ошибка при загрузке комнат:', error));
    }, []);

    return (
        <div className="container">
            <h2 className="mb-4">Доступные переговорные</h2>
            <div className="row">
                {rooms.map(room => (
                    <div key={room.id} className="col-md-4 mb-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{room.title}</h5>
                                <p className="card-text text-muted">{room.location}</p>
                                <p className="badge bg-primary">Мест: {room.max_capacity}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;