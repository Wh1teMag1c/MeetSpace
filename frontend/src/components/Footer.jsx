import React from 'react';
import {Link} from 'react-router-dom';
import {Envelope, GeoAlt, Telephone} from 'react-bootstrap-icons';

const Footer = () => {
    return (
        <footer className="footer bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary border-opacity-10">
            <div className="container">
                <div className="row g-4">

                    <div className="col-lg-4 col-md-12 text-center text-lg-start">
                        <h5 className="fw-bold mb-3" style={{color: 'var(--primary)'}}>🏢 MeetSpace</h5>
                        <p className="text-white-50 small pe-lg-4">
                            Единая система бронирования рабочих пространств.
                            Планируйте встречи эффективно, управляйте ресурсами офиса
                            и создавайте комфортную среду для работы команды.
                        </p>
                    </div>

                    <div className="col-lg-4 col-md-6 d-flex justify-content-lg-center justify-content-center">
                        <div className="text-start">
                            <h6 className="fw-bold text-uppercase small spacing-1 mb-3">Навигация</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <Link to="/" className="hover-primary d-flex align-items-center">
                                        Главная
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/about" className="hover-primary d-flex align-items-center">
                                        О сервисе
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link to="/my-bookings" className="hover-primary d-flex align-items-center">
                                        Мои брони
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6 d-flex justify-content-lg-end justify-content-center">
                        <div className="text-start" style={{maxWidth: '300px'}}>
                            <h6 className="fw-bold text-uppercase small spacing-1 mb-3">Контакты</h6>
                            <ul className="list-unstyled text-white-50 small">
                                <li className="mb-3 d-flex align-items-start">
                                    <GeoAlt className="me-3 mt-1 flex-shrink-0" style={{color: 'var(--primary)'}}/>
                                    <span>Москва, Пресненская наб., 12<br/>Башня Федерация, 22 этаж</span>
                                </li>
                                <li className="mb-3 d-flex align-items-center">
                                    <Envelope className="me-3 flex-shrink-0" style={{color: 'var(--primary)'}}/>
                                    <a href="mailto:info@meetspace.ru" className="text-decoration-none text-white-50">
                                        info@meetspace.ru
                                    </a>
                                </li>
                                <li className="mb-0 d-flex align-items-center">
                                    <Telephone className="me-3 flex-shrink-0" style={{color: 'var(--primary)'}}/>
                                    <a href="tel:+74951234567" className="text-decoration-none text-white-50">
                                        +7 (495) 123–45–67
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                <hr className="border-secondary opacity-10 my-4"/>

                <div className="text-center text-white-50 small">
                    &copy; {new Date().getFullYear()} MeetSpace
                </div>
            </div>
        </footer>
    );
};

export default Footer;