import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const COLORS = {
    primary: '#E30016', 
    primaryHover: '#C80014', 
    secondary: '#00b33e', 
    cardBackground: '#1c1c1c', 
    border: '#3a3a3a', 
    shadow: 'rgba(0, 0, 0, 0.4)',
    textPrimary: '#f0f0f0', 
    textSecondary: '#cccccc', 
    textMuted: '#999999', 
    badgeOrange: '#D27029',
    badgeBlue: '#135BE8',
    softHoverBorder: '#666666', 
    softHoverGlow: 'rgba(255, 255, 255, 0.08)', 
};

const slugify = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s/g, '-');
};

// 💡 ХЕЛПЕР ДЛЯ ПАРСИНГА МАССИВА КАРТИНОК ИЗ СТРОКИ
const safeJSONParse = (data) => {
    if (typeof data !== 'string') return data || [];
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};


// ======================= КОМПОНЕНТ-ОБЕРТКА ДЛЯ ЗАГОЛОВКА =======================
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

    // 💡 ЛОГИКА ОПРЕДЕЛЕНИЯ КАРТИНКИ
    const parsedImages = safeJSONParse(car.images);
    const firstImage = (parsedImages && parsedImages.length > 0) ? parsedImages[0] : null;

    const carData = {
        id: car.id || 'N/A',
        brand: car.brand || 'Неизвестно',
        model: car.model || 'Неизвестно',
        name: car.name || `${car.brand} ${car.model}`,
        price_russia: car.price_russia || 0,
        price_china: car.price_china || 0,
        year: car.year || 'N/A',
        mileage: car.mileage || 0,
        // 💡 ИСПРАВЛЕНО: Приоритет: car.img_src > первая_картинка_из_массива > заглушка
        img: car.img_src || firstImage || "https://placehold.co/300x200/2c2c2c/aaaaaa?text=Image+N/A" 
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
                    <img 
                        src={carData.img} 
                        alt={carData.name} 
                        onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/300x200/2c2c2c/aaaaaa?text=Image+N/A"}} 
                        style={styles.cardImage} 
                    />
                    
                    <div style={styles.cardTopRightBadges}>
                        <div style={{...styles.badge, ...styles.badgeBlue}}><span>O<small>км</small></span></div>
                        <div style={{...styles.badge, ...styles.badgeOrange}} title="ТОП"><span>🔥</span></div>
                        <div style={{...styles.badge, ...styles.badgeLightBlue}}><span>4+💺</span></div>
                    </div>
                    
                    {carData.mileage >= 0 && (
                        <div style={styles.mileageBadge}>
                            <div style={styles.mileageItem}><span style={styles.mileageLabel}>Пробег:</span> <span style={styles.mileageValue}>{carData.mileage.toLocaleString('ru-RU')} км</span></div>
                            <div style={styles.mileageItem}><span style={styles.mileageLabel}>Год:</span> <span style={styles.mileageValue}>{carData.year}</span></div>
                        </div>
                    )}
                </div>
                
                <div style={styles.cardBody}>
                    <TitleHoverWrapper carName={carData.name} />
                    
                    <div style={styles.cardLocationAndId}>
                        <span style={styles.cardLocation}>В НАЛИЧИИ В КИТАЕ</span>
                        <span style={styles.cardId}>ID: {carData.id}</span>
                    </div>
                    
                    <div style={styles.cardFooter}>
                        {/* Блок цен: виден по умолчанию */}
                        <div style={{...styles.priceInfo, opacity: isCardHovered ? 0 : 1, pointerEvents: isCardHovered ? 'none' : 'auto'}}>
                            
                            {/* Цена в России (Нейтральная) */}
                            <div style={styles.cardPriceRussiaWrapper}>
                                <div style={styles.cardPriceRussia}>~ {carData.price_russia.toLocaleString('ru-RU')} ₽</div>
                                <div style={styles.cardPriceDisclaimer}>Цена в России (под ключ)</div>
                            </div>
                            
                            {/* Цена в Китае */}
                            <div style={styles.cardPriceChinaWrapper}>
                                <div style={styles.cardPriceChina}>{carData.price_china.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽ в Китае</div>
                            </div>
                        </div>
                        
                        {/* Блок "Заказать": появляется при ховере */}
                        <div style={{...styles.orderInfo, opacity: isCardHovered ? 1 : 0, pointerEvents: isCardHovered ? 'auto' : 'none'}}>
                            <div style={styles.orderPriceGroup}>
                                <div style={styles.cardPriceChinaFull}>{carData.price_china.toLocaleString('ru-RU')} ₽</div>
                                <span style={styles.cardPriceChinaDisclaimerHover}>Цена в Китае</span>
                            </div>
                            <button style={styles.orderButton} onClick={(e) => { e.preventDefault(); console.log(`Заказ ${carData.name}`); }}>
                                Заказать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};


// ======================= СТИЛИ =======================
const styles = {
    cardLink: { 
        textDecoration: 'none', 
        color: 'inherit' 
    },
    card: { 
        border: `1px solid ${COLORS.border}`, 
        borderRadius: '12px', 
        backgroundColor: COLORS.cardBackground, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: `0 4px 10px ${COLORS.shadow}`, 
        transition: 'all 0.2s ease-in-out', 
        overflow: 'hidden',
    }, 
    cardHover: {
        border: `1px solid ${COLORS.softHoverBorder}`, 
        borderRadius: '12px', 
        backgroundColor: COLORS.cardBackground, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: `0 8px 20px ${COLORS.shadow}, 0 0 10px ${COLORS.softHoverGlow}`, 
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out', 
        overflow: 'hidden',
    },
    
    // --- ИЗОБРАЖЕНИЕ ---
    cardImageContainer: { 
        position: 'relative', 
        width: '100%', 
        paddingTop: '60%', 
        overflow: 'hidden',
        backgroundColor: '#2c2c2c',
    }, 
    cardImage: { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    
    // Пробег и Год
    mileageBadge: { 
        position: 'absolute', 
        bottom: '0', 
        left: '0', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        color: 'white', 
        padding: '6px 12px', 
        fontSize: '12px', 
        textAlign: 'left', 
        lineHeight: 1.4, 
        borderTopRightRadius: '10px', 
        display: 'flex',
        gap: '15px',
        fontWeight: '500',
    },
    mileageItem: { display: 'inline-block' },
    mileageLabel: { fontWeight: '400', color: COLORS.textMuted, marginRight: '3px' }, 
    mileageValue: { fontWeight: '600', color: COLORS.textPrimary }, 
    
    // Бейджи сверху справа
    cardTopRightBadges: { 
        position: 'absolute', 
        top: 0, 
        right: '0', 
        display: 'flex', 
        gap: '1px',
        zIndex: 2,
    },
    badge: { 
        width: '35px', 
        height: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white', 
        fontWeight: 600, 
        fontSize: '12px', 
        clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
        opacity: 0.9,
    },
    badgeBlue: { backgroundColor: COLORS.badgeBlue, color: COLORS.textPrimary, fontWeight: 700, fontSize: '10px' },
    badgeOrange: { backgroundColor: COLORS.badgeOrange, fontSize: '14px' },
    badgeLightBlue: { backgroundColor: '#4DA7FA', fontSize: '14px' },

    // --- ТЕЛО КАРТОЧКИ ---
    cardBody: { 
        padding: '15px', 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1, 
        position: 'relative', 
        zIndex: 1,
    }, 
    cardTitleWrapper: { 
        position: 'relative', 
        marginBottom: '10px', 
        minHeight: '40px' 
    },
    cardTitle: { 
        margin: 0, 
        fontSize: '18px', 
        fontWeight: '700', 
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
        backgroundColor: COLORS.cardBackground, 
        border: `1px solid ${COLORS.border}`, 
        boxShadow: `0 4px 12px ${COLORS.shadow}`,
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '700',
        lineHeight: 1.3,
        color: COLORS.primary, 
        pointerEvents: 'none',
    },
    
    // --- ДОПОЛНИТЕЛЬНАЯ ИНФО ---
    cardLocationAndId: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px', 
        fontSize: '13px',
        borderBottom: `1px solid ${COLORS.border}`, 
        paddingBottom: '10px',
    },
    cardLocation: { color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase' }, 
    cardId: { color: COLORS.textMuted, fontSize: '12px' }, 
    
    // --- ФУТЕР И ЦЕНЫ ---
    cardFooter: { minHeight: '60px', position: 'relative', marginTop: 'auto', paddingTop: '5px' },
    priceInfo: { 
        position: 'absolute', 
        width: '100%', 
        transition: 'opacity 0.2s ease', 
        display: 'flex',
        flexDirection: 'column',
    },
    orderInfo: { 
        position: 'absolute', 
        width: '100%', 
        transition: 'opacity 0.2s ease', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pointerEvents: 'none' 
    },

    // Цена в России
    cardPriceRussiaWrapper: { 
        display: 'flex', 
        flexDirection: 'column', 
        marginBottom: '4px', 
        lineHeight: 1.1 
    },
    cardPriceRussia: { 
        fontSize: '22px', 
        fontWeight: '600', 
        lineHeight: 1.1, 
        color: COLORS.textPrimary, 
    }, 
    cardPriceDisclaimer: { 
        fontSize: '12px', 
        color: COLORS.textMuted, 
        lineHeight: 1.2,
        fontWeight: '500',
    }, 
    
    // Цена в Китае
    cardPriceChinaWrapper: { 
        fontSize: '13px', 
        color: COLORS.textMuted, 
        fontWeight: '500',
        marginTop: '5px',
    }, 
    cardPriceChina: { 
        color: COLORS.textSecondary, 
        fontWeight: '500' 
    },

    // Ховер-состояние
    orderPriceGroup: {
        lineHeight: 1.2,
    },
    cardPriceChinaFull: { 
        fontSize: '22px', 
        fontWeight: '700', 
        lineHeight: 1.2, 
        color: COLORS.textPrimary 
    },
    cardPriceChinaDisclaimerHover: { 
        fontSize: '12px', 
        color: COLORS.textMuted, 
        fontWeight: '400' 
    }, 
    orderButton: { 
        padding: '10px 20px', 
        backgroundColor: COLORS.primary, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontWeight: '700', 
        fontSize: '15px', 
        cursor: 'pointer', 
        pointerEvents: 'auto',
        transition: 'background-color 0.2s',
        minWidth: '100px', 
        boxShadow: `0 4px 10px rgba(227, 0, 22, 0.4)`, 
        '&:hover': {
            backgroundColor: COLORS.primaryHover,
        }
    },
};

export default CarCard;