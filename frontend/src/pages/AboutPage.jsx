import React, {useEffect} from 'react';
import {BuildingCheck, ClockHistory, Laptop, LightningCharge, People, ShieldCheck} from 'react-bootstrap-icons';

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="fade-in pb-5">
            <div className="bg-white py-5 mb-5 border-bottom">
                <div className="container text-center py-4">
                    <h1 className="fw-800 display-4 mb-3 text-dark">
                        О платформе <span style={{color: 'var(--primary)'}}>MeetSpace</span>
                    </h1>
                    <p className="text-muted lead mx-auto" style={{maxWidth: '750px'}}>
                        Мы создаем экосистему для эффективного взаимодействия. MeetSpace помогает командам находить
                        идеальное место для работы, не отвлекаясь на административные процессы.
                    </p>
                </div>
            </div>

            <div className="container">
                <div className="row g-4 justify-content-center mb-5">
                    {[
                        {icon: <BuildingCheck size={30}/>, val: '50+', label: 'Залов'},
                        {icon: <People size={30}/>, val: '1.5k+', label: 'Пользователей'},
                        {icon: <ClockHistory size={30}/>, val: '24/7', label: 'Доступ'}
                    ].map((stat, i) => (
                        <div key={i} className="col-md-3">
                            <div className="p-4 rounded-4 bg-white text-center shadow-sm border-0 hover-lift">
                                <div className="text-primary mb-3">{stat.icon}</div>
                                <h2 className="fw-bold mb-0">{stat.val}</h2>
                                <small className="text-muted fw-bold">{stat.label}</small>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row mb-5 align-items-center g-5">
                    <div className="col-lg-6">
                        <h2 className="fw-800 mb-4 h1">Как это работает?</h2>
                        {[
                            {
                                step: 1,
                                title: 'Выберите пространство',
                                text: 'Используйте фильтры по категориям и оборудованию.'
                            },
                            {
                                step: 2,
                                title: 'Забронируйте слот',
                                text: 'Мгновенная фиксация времени без лишних согласований.'
                            },
                            {
                                step: 3,
                                title: 'Проведите встречу',
                                text: 'Приходите и работайте – всё уже подготовлено для вас.'
                            }
                        ].map((item, i) => (
                            <div className="d-flex mb-4" key={i}>
                                <div className="me-4 flex-shrink-0">
                                    <span
                                        className="badge rounded-circle d-flex align-items-center justify-content-center fs-5"
                                        style={{width: '52px', height: '52px', background: 'var(--primary)'}}>
                                        {item.step}
                                    </span>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1">{item.title}</h5>
                                    <p className="text-muted mb-0">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-lg-6">
                        <img
                            src="/about-office.jpg"
                            alt="Modern Office"
                            className="img-fluid rounded-4 shadow-lg"
                        />
                    </div>
                </div>

                <div className="py-5">
                    <h2 className="fw-800 text-center mb-5">Почему выбирают нас</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm p-4 hover-lift">
                                <ShieldCheck size={40} className="text-success mb-3"/>
                                <h5 className="fw-bold">Гарантия брони</h5>
                                <p className="text-muted small">Система исключает накладки. Если вы забронировали зал –
                                    он ваш.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm p-4 hover-lift">
                                <Laptop size={40} className="text-primary mb-3"/>
                                <h5 className="fw-bold">Оснащение</h5>
                                <p className="text-muted small">Всегда актуальная информация о наличии ТВ, досок и
                                    проекторов.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm p-4 hover-lift">
                                <LightningCharge size={40} className="text-warning mb-3"/>
                                <h5 className="fw-bold">Скорость</h5>
                                <p className="text-muted small">Интуитивный интерфейс позволяет создать бронь менее чем
                                    за 30 секунд.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;