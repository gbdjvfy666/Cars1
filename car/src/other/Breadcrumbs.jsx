// Breadcrumbs.js
import React, { useState } from 'react'; 
import { Link } from 'react-router-dom';

import HomeIcon from '../assets/icons/home.svg?react'; 

// ======================= 1. ОБНОВЛЕННАЯ ЦВЕТОВАЯ ПАЛИТРА ДЛЯ ТЕМНОЙ ТЕМЫ =======================
const COLORS = {
    primary: '#E30016', // Красный акцент остается
    textPrimary: '#F0F0F0', // <-- Активный элемент (СВЕТЛЫЙ)
    textSecondary: '#CCCCCC', // <-- Неактивная ссылка (СВЕТЛЫЙ СЕРЫЙ)
    textMuted: '#777777', // <-- Разделитель и Общий цвет (СЕРЫЙ СЛЕГКА ТЕМНЕЕ)
};

// ======================= 2. СТИЛИ =======================
const styles = {
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: COLORS.textMuted, // Цвет общего контейнера теперь серый
        padding: '20px 0 10px 0',
        fontSize: '14px',
    },
    breadcrumbLink: {
        textDecoration: 'none',
        // 💡 Цвет ссылки по умолчанию - СВЕТЛЫЙ СЕРЫЙ
        color: COLORS.textSecondary, 
        fontWeight: '500',
        transition: 'color 0.2s, fill 0.2s',
        display: 'flex',
        alignItems: 'center',
        // 💡 Эффект ховера: при наведении цвет ссылки становится ОСНОВНЫМ СВЕТЛЫМ или КРАСНЫМ
        '&:hover': {
            color: COLORS.textPrimary,
        }
    },
    breadcrumbActive: {
        // 💡 Цвет активного элемента - СВЕТЛЫЙ
        color: COLORS.textPrimary,
        fontWeight: 600,
    },
    separator: {
        // 💡 Цвет разделителя - СВЕТЛО СЕРЫЙ
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
    const [hoveredLink, setHoveredLink] = useState(null);

    const dynamicHomeIconStyle = {
        ...styles.homeIcon,
        // 💡 Иконка по умолчанию - СВЕТЛЫЙ СЕРЫЙ, при наведении - КРАСНЫЙ
        fill: isHomeHovered ? COLORS.primary : COLORS.textSecondary,
    };

    return (
        <div style={styles.breadcrumb}>
            <Link 
                to="/" 
                style={{
                    ...styles.breadcrumbLink,
                    // Добавляем hover-эффект для текста ссылки
                    color: isHomeHovered ? COLORS.primary : COLORS.textSecondary
                }}
                onMouseEnter={() => setIsHomeHovered(true)}
                onMouseLeave={() => setIsHomeHovered(false)}
            >
                <HomeIcon style={dynamicHomeIconStyle} />
            </Link>
            
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <span style={styles.separator}>/</span>
                    {index < items.length - 1 ? (
                        <Link 
                            to={item.to} 
                            style={{
                                ...styles.breadcrumbLink,
                                // 💡 Эффект ховера для текста ссылки
                                color: hoveredLink === index ? COLORS.primary : styles.breadcrumbLink.color 
                            }}
                            onMouseEnter={() => setHoveredLink(index)}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        // Активный элемент всегда СВЕТЛЫЙ
                        <span style={styles.breadcrumbActive}>{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;