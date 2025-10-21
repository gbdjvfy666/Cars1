// Breadcrumbs.js
import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';

import HomeIcon from '../assets/icons/home.svg?react'; 

const COLORS = {
    primary: '#E30016',
    textPrimary: '#1A1A1A', // <-- Наш глубокий черный цвет
    textSecondary: '#555555',
    textMuted: '#999999',
};

// Стили не меняем
const styles = {
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: COLORS.textMuted,
        padding: '20px 0 10px 0',
        fontSize: '14px',
    },
    breadcrumbLink: {
        textDecoration: 'none',
        color: COLORS.textSecondary,
        fontWeight: '500',
        transition: 'color 0.2s, fill 0.2s',
        display: 'flex',
        alignItems: 'center',
    },
    breadcrumbActive: {
        color: COLORS.textPrimary,
        fontWeight: 600,
    },
    separator: {
        color: COLORS.textMuted,
    },
    homeIcon: {
        width: '18px',
        height: '18px',
        transition: 'fill 0.2s',
    }
};


const Breadcrumbs = ({ items }) => {
    const [isHomeHovered, setIsHomeHovered] = useState(false);

    // Вносим изменение здесь
    const dynamicHomeIconStyle = {
        ...styles.homeIcon,
        // По умолчанию цвет теперь черный (textPrimary), при наведении - красный (primary)
        fill: isHomeHovered ? COLORS.primary : COLORS.textPrimary,
    };

    return (
        <div style={styles.breadcrumb}>
            <Link 
                to="/" 
                style={styles.breadcrumbLink}
                onMouseEnter={() => setIsHomeHovered(true)}
                onMouseLeave={() => setIsHomeHovered(false)}
            >
                <HomeIcon style={dynamicHomeIconStyle} />
            </Link>
            
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <span style={styles.separator}>/</span>
                    {index < items.length - 1 ? (
                        <Link to={item.to} style={styles.breadcrumbLink}>
                            {item.label}
                        </Link>
                    ) : (
                        <span style={styles.breadcrumbActive}>{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;