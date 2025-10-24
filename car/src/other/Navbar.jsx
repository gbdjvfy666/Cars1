import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    // Эффект для встраивания стилей
    React.useEffect(() => {
        const styleElement = document.createElement('style');
        if (!document.getElementById('luminous-navbar-styles')) {
            styleElement.id = 'luminous-navbar-styles';
            styleElement.innerHTML = `
                /* ======================================================= */
                /* ✅ КОРРЕКТИРОВКА: ВОЗВРАЩЕН padding-top для body */
                /* ======================================================= */
                body {
                    /* ВОЗВРАЩЕН отступ, чтобы контент начинался ПОД навбаром */
                    padding-top: 70px;
                    margin: 0;
                }
                
                .luminous-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    
                    /* Возвращен оригинальный полупрозрачный фон */
                    background-color: rgba(20, 20, 20, 0.95); 
                    
                    backdrop-filter: blur(10px);
                    box-shadow: 
                        0 4px 20px rgba(0, 0, 0, 0.4),
                        0 1px 0 0 rgba(227, 0, 22, 0.2);
                }

                .luminous-navbar::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 1px;
                    background: #E30016;
                    opacity: 0.2;
                }

                .nav-link {
                    position: relative;
                    transition: all 0.3s ease;
                    padding: 4px 0;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #E30016;
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                    transform-origin: right;
                    box-shadow: 0 0 10px rgba(227, 0, 22, 0.5);
                }

                .nav-link:hover {
                    color: #fff;
                }

                .nav-link:hover::after {
                    transform: scaleX(1);
                    transform-origin: left;
                }

                .nav-link.active {
                    color: #fff;
                }

                .nav-link.active::after {
                    transform: scaleX(1);
                }

                .logo {
                    position: relative;
                    font-family: 'Aeonik Pro', sans-serif;
                    padding-right: 24px;
                }

                .logo::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    right: 0;
                    width: 6px;
                    height: 6px;
                    background: #E30016;
                    border-radius: 50%;
                    transform: translateY(-50%);
                    box-shadow: 0 0 10px rgba(227, 0, 22, 0.7);
                }
            `;
            document.head.appendChild(styleElement);
        }
    }, []);

    return (
        <header className="luminous-navbar">
            <div style={styles.container}>
                <Link to="/" style={styles.logo} className="logo">
                    NSBH
                </Link>

                <nav style={styles.nav}>
                    <Link
                        key="/"
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        style={styles.link}
                    >
                        Главная
                    </Link>
                    <Link
                        key="/search"
                        to="/search"
                        className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                        style={styles.link}
                    >
                        Поиск
                    </Link>
                    <Link
                        key="/about"
                        to="/about"
                        className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                        style={styles.link}
                    >
                        О нас
                    </Link>
                    <Link
                        key="/admin"
                        to="/admin"
                        className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                        style={styles.link}
                    >
                        Админка
                    </Link>
                </nav>
            </div>
        </header>
    );
};

const styles = {
    container: {
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
    },
    logo: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#fff',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
        padding: '0 20px',
    },
    nav: {
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
    },
    link: {
        color: '#bbb',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
    },
};

export default Navbar;
