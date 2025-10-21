import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ, НУЖНЫЕ ДЛЯ КАРТОЧКИ =======================

const COLORS = {
    primary: '#E30016',
    secondary: '#00b33e',
    background: '#FFFFFF',
    border: '#EAEAEA',
    shadow: 'rgba(0, 0, 0, 0.05)',
    textPrimary: '#1A1A1A',
    textSecondary: '#555555',
    textMuted: '#999999',
};

const slugify = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s/g, '-');
};


// ======================= КОМПОНЕНТ-ОБЕРТКА ДЛЯ ЗАГОЛОВКА (зависимость CarCard) =======================
const TitleHoverWrapper = ({ carName }) => {
    const [isHovered, setIsHovered] = useState(false); 

    return (
        <div 
            style={styles.cardTitleWrapper}
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)} 
        >
            <h3 
                style={{
                    ...styles.cardTitle,
                    ...(isHovered ? styles.cardTitleHover : {}), 
                }}
            >
                {carName}
            </h3>
            {isHovered && (
                <div style={styles.fullTitleTooltip}>
                    {carName}
                </div>
            )}
        </div>
    );
};


// ======================= ОСНОВНОЙ КОМПОНЕНТ КАРТОЧКИ АВТО =======================
const CarCard = ({ car }) => {
    const [isCardHovered, setIsCardHovered] = useState(false);

    const handleMouseEnter = () => setIsCardHovered(true);
    const handleMouseLeave = () => setIsCardHovered(false);

    const carData = {
        id: car.id || 'N/A',
        brand: car.brand || 'Неизвестно',
        model: car.model || 'Неизвестно',
        name: car.name || `${car.brand} ${car.model}`,
        price_russia: car.price_russia || 0,
        price_china: car.price_china || 0,
        year: car.year || 'N/A',
        mileage: car.mileage || 0,
        img: car.img_src || "https://placehold.co/300x200/F0F0F0/888888?text=Image+N/A" 
    };
    
    const brandSlug = slugify(carData.brand);
    const modelSlug = slugify(carData.model);

    return (
        <Link 
            to={`/cars/${brandSlug}/${modelSlug}/${carData.id}`} 
            style={styles.cardLink}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={isCardHovered ? styles.cardHover : styles.card}> 
                <div style={styles.cardImageContainer}>
                    <img src={carData.img} alt={carData.name} onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/300x200/F0F0F0/888888?text=Image+N/A"}} style={styles.cardImage} />
                    
                    <div style={styles.cardBottomLeftIcons}><div style={styles.iconWrapper}><span style={styles.starIcon}>⭐</span></div></div>
                    <div style={styles.cardTopRightBadges}><div style={{...styles.badge, ...styles.badgeBlue}}><span>O<small>km</small></span></div><div style={{...styles.badge, ...styles.badgeOrange}} title="ТОП 3"><span>🏆</span></div><div style={{...styles.badge, ...styles.badgeLightBlue}}><span>4+💺</span></div></div>
                    
                    {carData.mileage >= 0 && (
                        <div style={styles.mileageBadge}>
                            <div><span style={styles.mileageLabel}>Пробег:</span> <span style={styles.mileageValue}>{carData.mileage.toLocaleString('ru-RU')} км</span></div>
                            <div><span style={styles.mileageLabel}>Год:</span> <span style={styles.mileageValue}>{carData.year}</span></div>
                        </div>
                    )}
                </div>
                <div style={styles.cardBody}>
                    <TitleHoverWrapper carName={carData.name} />
                    
                    <div style={styles.cardLocationAndId}><span style={styles.cardLocation}>В НАЛИЧИИ В КИТАЕ</span><span style={styles.cardId}>ID: {carData.id}</span></div>
                    
                    <div style={styles.cardFooter}>
                        <div style={{...styles.priceInfo, opacity: isCardHovered ? 0 : 1, pointerEvents: isCardHovered ? 'none' : 'auto'}}>
                            <div style={styles.cardPriceRussiaWrapper}>
                                <div style={styles.cardPriceRussia}>~ {carData.price_russia.toLocaleString('ru-RU')} ₽</div>
                                <div style={styles.cardPriceDisclaimer}>цена в России<br/>(под ключ)</div>
                            </div>
                            <div style={styles.cardPriceChinaWrapper}>
                                <div style={styles.cardPriceChina}>{carData.price_china.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽ в Китае</div>
                            </div>
                        </div>
                        
                        <div style={{...styles.orderInfo, opacity: isCardHovered ? 1 : 0, pointerEvents: isCardHovered ? 'auto' : 'none'}}>
                            <div style={styles.cardPriceChinaFull}>{carData.price_china.toLocaleString('ru-RU')} ₽ <br/><span style={styles.cardPriceChinaDisclaimerHover}>Цена в Китае</span></div>
                            <button style={styles.orderButton} onClick={(e) => { e.preventDefault(); console.log(`Заказ ${carData.name}`); }}>Заказать</button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};


// ======================= СТИЛИ, ОТНОСЯЩИЕСЯ К КАРТОЧКЕ =======================
const styles = {
    cardLink: { 
        textDecoration: 'none', 
        color: 'inherit' 
    },
    card: { 
        border: `1px solid ${COLORS.border}`, 
        borderRadius: '12px', 
        backgroundColor: COLORS.background, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: `0 4px 12px ${COLORS.shadow}`, 
        transition: 'box-shadow 0.2s', 
        overflow: 'hidden',
    }, 
    cardHover: {
        border: `1px solid ${COLORS.border}`, 
        borderRadius: '12px', 
        backgroundColor: COLORS.background, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
        transition: 'box-shadow 0.2s', 
        overflow: 'hidden',
    },
    cardImageContainer: { position: 'relative', width: '100%', paddingTop: '66%', overflow: 'hidden' }, 
    cardImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    cardBottomLeftIcons: { position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '5px' },
    iconWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    starIcon: { fontSize: '14px' },
    cardTopRightBadges: { position: 'absolute', top: 0, right: '0', display: 'flex', gap: '1px' },
    badge: { width: '35px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '11px', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' },
    badgeBlue: { backgroundColor: '#135BE8' },
    badgeOrange: { backgroundColor: '#D27029', fontSize: '14px' },
    badgeLightBlue: { backgroundColor: '#4DA7FA', fontSize: '14px' },
    mileageLabel: { fontWeight: '500' }, 
    mileageValue: { fontWeight: '400' }, 
    mileageBadge: { 
        position: 'absolute', 
        bottom: '0', 
        right: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        color: 'white', 
        padding: '6px 12px', 
        fontSize: '11px', 
        textAlign: 'left', 
        lineHeight: 1.4, 
        borderTopLeftRadius: '10px',
    },
    cardBody: { padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative', zIndex: 1 }, 
    cardTitleWrapper: { position: 'relative', marginBottom: '12px', minHeight: '40px' },
    cardTitle: { 
        margin: 0, 
        fontSize: '17px', 
        fontWeight: '600', 
        lineHeight: 1.3, 
        height: '2.6em', 
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal',
        cursor: 'pointer',
        transition: 'color 0.2s ease', 
        color: COLORS.textPrimary, 
    },
    cardTitleHover: { color: COLORS.primary }, 
    fullTitleTooltip: {
        position: 'absolute',
        top: '-15px', 
        left: '-15px', 
        right: '-15px', 
        zIndex: 10, 
        backgroundColor: COLORS.background, 
        border: `1px solid ${COLORS.border}`, 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '17px',
        fontWeight: '600',
        lineHeight: 1.3,
        color: COLORS.primary, 
        pointerEvents: 'none',
    },
    cardLocationAndId: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '13px' },
    cardLocation: { color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase' }, 
    cardId: { color: COLORS.textMuted }, 
    cardFooter: { minHeight: '55px', position: 'relative', marginTop: 'auto' },
    priceInfo: { position: 'absolute', width: '100%', transition: 'opacity 0.2s ease', pointerEvents: 'none' },
    orderInfo: { position: 'absolute', width: '100%', transition: 'opacity 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' },
    cardPriceRussiaWrapper: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', lineHeight: 1.1 },
    cardPriceRussia: { fontSize: '20px', fontWeight: '700', lineHeight: 1.1, color: COLORS.textPrimary }, 
    cardPriceDisclaimer: { fontSize: '11px', color: COLORS.textMuted, lineHeight: 1.2 }, 
    cardPriceChinaWrapper: { fontSize: '12px', color: COLORS.textMuted, fontWeight: '500' }, 
    cardPriceChina: { color: COLORS.textSecondary, fontWeight: '500' },
    cardPriceChinaFull: { fontSize: '20px', fontWeight: '500', lineHeight: 1.2, color: COLORS.textPrimary },
    cardPriceChinaDisclaimerHover: { fontSize: '11px', color: COLORS.textMuted, fontWeight: '400' }, 
    orderButton: { 
        padding: '8px 18px', 
        backgroundColor: COLORS.primary, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontWeight: '600', 
        fontSize: '15px', 
        cursor: 'pointer', 
        pointerEvents: 'auto',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#C80014',
        }
    },
};

export default CarCard;