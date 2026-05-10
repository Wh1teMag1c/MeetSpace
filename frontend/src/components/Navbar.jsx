import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {BoxArrowRight, GearFill, JournalBookmarkFill, List, PersonCircle, ShieldLockFill} from 'react-bootstrap-icons';

const Navbar = ({user, onLogout}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <nav className="navbar navbar-expand-lg navbar-custom sticky-top shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-3" to="/">
                    <span style={{color: 'var(--primary)'}} className="me-2">●</span> MeetSpace
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNav">
                    <List size={30}/>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item">
                            <Link className="nav-link nav-link-custom px-3" to="/">Главная</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-custom px-3" to="/about">О сервисе</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center" ref={dropdownRef}>
                        {!user ? (
                            <Link className="btn btn-primary shadow-sm px-4" to="/login">Войти</Link>
                        ) : (
                            <div className="dropdown">
                                <div
                                    className="d-flex align-items-center gap-2 p-1 px-3 rounded-pill bg-light border shadow-sm transition-all hover-lift"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <div className="text-end d-none d-sm-block">
                                        <div className="fw-bold small">{user.username}</div>
                                    </div>

                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="rounded-circle object-fit-cover border border-white shadow-sm"
                                            style={{width: '32px', height: '32px'}}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/32?text=👤';
                                            }}
                                        />
                                    ) : (
                                        <PersonCircle size={32} className="text-primary"/>
                                    )}
                                </div>

                                <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 p-2 ${isOpen ? 'show' : ''}`}
                                    style={{borderRadius: '16px', minWidth: '220px', position: 'absolute'}}>

                                    {user.is_staff && (
                                        <>
                                            <li>
                                                <Link className="dropdown-item rounded-3 py-2 fw-bold" to="/admin"
                                                      onClick={() => setIsOpen(false)}
                                                      style={{color: '#6610f2'}}>
                                                    <ShieldLockFill className="me-2"/> Админ-панель
                                                </Link>
                                            </li>
                                            <li>
                                                <hr className="dropdown-divider opacity-10"/>
                                            </li>
                                        </>
                                    )}

                                    <li>
                                        <Link className="dropdown-item rounded-3 py-2" to="/my-bookings"
                                              onClick={() => setIsOpen(false)}>
                                            <JournalBookmarkFill className="me-2 text-primary"/> Мои брони
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item rounded-3 py-2" to="/settings"
                                              onClick={() => setIsOpen(false)}>
                                            <GearFill className="me-2 text-primary"/> Настройки
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider opacity-10"/>
                                    </li>
                                    <li>
                                        <button className="dropdown-item rounded-3 py-2 text-danger fw-bold"
                                                onClick={() => {
                                                    onLogout();
                                                    setIsOpen(false);
                                                }}>
                                            <BoxArrowRight className="me-2"/> Выйти
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;