import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api';
import BookingModal from '../components/BookingModal';
import {
    ArrowCounterclockwise,
    ArrowRight,
    Check2,
    Easel,
    Funnel,
    Layers,
    People,
    Search,
    Tv
} from 'react-bootstrap-icons';

const HomePage = () => {
    const [rooms, setRooms] = useState([]);

    const navigate = useNavigate();
    const filterSectionRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [capacityFilter, setCapacityFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [features, setFeatures] = useState({tv: false, board: false});

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        api.get('rooms/').then(res => {
            setRooms(res.data);
        });
    }, []);

    const filteredRooms = useMemo(() => {
        let result = rooms;
        if (activeCategory !== 'all') result = result.filter(r => r.room_type === activeCategory);
        if (searchTerm) result = result.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
        if (capacityFilter) result = result.filter(r => r.max_capacity >= parseInt(capacityFilter));
        if (levelFilter) result = result.filter(r => r.level.toString() === levelFilter);
        if (features.tv) result = result.filter(r => r.has_tv);
        if (features.board) result = result.filter(r => r.has_whiteboard);
        return result;
    }, [rooms, activeCategory, searchTerm, capacityFilter, levelFilter, features]);

    const scrollToFilters = () => {
        if (filterSectionRef.current) {
            const yOffset = -100;
            const element = filterSectionRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setActiveCategory('all');
        setCapacityFilter('');
        setLevelFilter('');
        setFeatures({tv: false, board: false});
    };

    const isFiltered = searchTerm || capacityFilter || levelFilter || features.tv || features.board;

    return (
        <div className="fade-in">
            <div className="hero-section-modern">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <h1 className="display-3 fw-800 mb-4" style={{letterSpacing: '-2px', lineHeight: '1.1'}}>
                                Бронируйте переговорки <span style={{color: 'var(--primary)'}}>нового поколения</span>
                            </h1>
                            <p className="lead text-muted mb-5 fs-4">
                                MeetSpace – это инструмент для создания продуктивной атмосферы в вашей команде.
                            </p>
                            <div className="d-flex flex-wrap gap-3">
                                <button className="btn btn-primary px-4 py-3 shadow-lg d-flex align-items-center"
                                        onClick={scrollToFilters}>
                                    Найти свободную <ArrowRight className="ms-2"/>
                                </button>
                                <button className="btn btn-link text-dark fw-bold text-decoration-none px-4"
                                        onClick={() => navigate('/about')}>
                                    Как это работает?
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-6 text-center">
                            <img
                                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000"
                                className="img-fluid rounded-4 shadow-2xl" alt="Office"
                                style={{transform: 'perspective(1000px) rotateY(-5deg)', border: '8px solid #fff'}}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div ref={filterSectionRef} className="filter-card mb-5 border-0 shadow-lg p-4 p-md-5">
                    <div className="row g-4">
                        <div
                            className="col-12 d-flex justify-content-between align-items-center border-bottom pb-3 mb-2">
                            <h5 className="fw-bold d-flex align-items-center mb-0">
                                <Funnel className="me-2 text-primary"/> Подбор помещения
                                <span className="ms-3 badge bg-light text-primary border fw-normal py-2 px-3"
                                      style={{borderRadius: '10px', fontSize: '0.8rem'}}>
                                    Найдено: {filteredRooms.length}
                                </span>
                            </h5>
                            {isFiltered && (
                                <button
                                    className="btn btn-link text-primary p-0 text-decoration-none small fw-bold fade-in"
                                    onClick={resetFilters}>
                                    <ArrowCounterclockwise className="me-1"/> Сбросить все
                                </button>
                            )}
                        </div>

                        <div className="col-md-4">
                            <label className="form-label text-muted small fw-bold d-flex align-items-center">
                                НАЗВАНИЕ {searchTerm && <span className="ms-2 badge rounded-circle bg-primary"
                                                              style={{width: '6px', height: '6px', padding: 0}}></span>}
                            </label>
                            <div className="position-relative">
                                <Search
                                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"/>
                                <input type="text" className="search-input-custom" placeholder="Поиск по названию..."
                                       value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="form-label text-muted small fw-bold d-flex align-items-center">
                                        ЭТАЖ {levelFilter && <span className="ms-2 badge rounded-circle bg-primary"
                                                                   style={{
                                                                       width: '6px',
                                                                       height: '6px',
                                                                       padding: 0
                                                                   }}></span>}
                                    </label>
                                    <div className="position-relative">
                                        <Layers
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"/>
                                        <input type="number" className="search-input-custom ps-5" placeholder="№"
                                               value={levelFilter} onChange={e => setLevelFilter(e.target.value)}/>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <label className="form-label text-muted small fw-bold d-flex align-items-center">
                                        МЕСТ ОТ {capacityFilter &&
                                        <span className="ms-2 badge rounded-circle bg-primary"
                                              style={{width: '6px', height: '6px', padding: 0}}></span>}
                                    </label>
                                    <div className="position-relative">
                                        <People
                                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"/>
                                        <input type="number" className="search-input-custom ps-5" placeholder="0"
                                               value={capacityFilter}
                                               onChange={e => setCapacityFilter(e.target.value)}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 d-flex align-items-end pb-1">
                            <div className="d-flex gap-3 p-2 bg-light rounded-4 w-100 justify-content-center border"
                                 style={{height: '52px'}}>
                                <div className="form-check form-switch mb-0 d-flex align-items-center">
                                    <input className="form-check-input me-2" type="checkbox" id="tv"
                                           checked={features.tv}
                                           onChange={e => setFeatures({...features, tv: e.target.checked})}
                                           style={{cursor: 'pointer'}}/>
                                    <label className="form-check-label small fw-bold text-muted" htmlFor="tv"
                                           style={{cursor: 'pointer'}}><Tv className="me-1"/> ТВ</label>
                                </div>
                                <div className="vr opacity-10 my-2"></div>
                                <div className="form-check form-switch mb-0 d-flex align-items-center">
                                    <input className="form-check-input me-2" type="checkbox" id="board"
                                           checked={features.board}
                                           onChange={e => setFeatures({...features, board: e.target.checked})}
                                           style={{cursor: 'pointer'}}/>
                                    <label className="form-check-label small fw-bold text-muted" htmlFor="board"
                                           style={{cursor: 'pointer'}}><Easel className="me-1"/> Доска</label>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 mt-4 text-center">
                            <div className="d-inline-flex gap-2 flex-wrap p-2 bg-light rounded-pill border">
                                {['all', 'conf', 'small', 'open'].map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)}
                                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all border-0 ${activeCategory === cat ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}>
                                        {activeCategory === cat && <Check2 className="me-2"/>}
                                        {cat === 'all' ? 'Все типы' : cat === 'conf' ? 'Конференц-залы' : cat === 'small' ? 'Переговорные' : 'Open Space'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 pb-5 min-vh-50">
                    {filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                            <div key={room.id} className="col-md-6 col-lg-4 fade-in">
                                <div className="card h-100 hover-card border-0 shadow-sm overflow-hidden"
                                     style={{borderRadius: '24px'}}>
                                    <div className="position-relative overflow-hidden">
                                        <img src={room.preview || '/placeholder.jpg'}
                                             className="w-100 transition-transform"
                                             style={{height: '240px', objectFit: 'cover'}} alt={room.title}/>
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <span
                                                className="badge bg-white text-dark shadow-sm py-2 px-3 rounded-pill fw-bold">
                                                👥 {room.max_capacity} мест
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body p-4">
                                        <h4 className="fw-bold mb-1">{room.title}</h4>
                                        <p className="text-muted small mb-4 d-flex align-items-center">
                                            <span
                                                className="me-1 text-primary">📍</span> {room.location} • {room.level} этаж
                                        </p>
                                        <div className="d-flex gap-2 mb-4">
                                            {room.has_tv &&
                                                <span className="badge bg-light text-muted border fw-normal"><Tv
                                                    size={12}/> TV</span>}
                                            {room.has_whiteboard &&
                                                <span className="badge bg-light text-muted border fw-normal"><Easel
                                                    size={12}/> Доска</span>}
                                        </div>
                                        <button className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm"
                                                onClick={() => {
                                                    setSelectedRoom(room);
                                                    setShowModal(true);
                                                }}>
                                            Забронировать
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="bg-white p-5 rounded-5 shadow-sm border border-dashed mx-auto"
                                 style={{maxWidth: '500px'}}>
                                <div className="mb-4 opacity-25">
                                    <Funnel size={60}/>
                                </div>
                                <h4 className="fw-bold text-dark">Ничего не найдено</h4>
                                <p className="text-muted mb-4">Попробуйте изменить параметры поиска или сбросить
                                    активные фильтры.</p>
                                <button className="btn btn-outline-primary px-4 rounded-pill fw-bold"
                                        onClick={resetFilters}>
                                    <ArrowCounterclockwise className="me-2"/> Сбросить фильтры
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedRoom && (
                <BookingModal room={selectedRoom} show={showModal} onClose={() => setShowModal(false)}
                              onBookingSuccess={() => alert('Бронирование успешно создано!')}/>
            )}
        </div>
    );
};

export default HomePage;