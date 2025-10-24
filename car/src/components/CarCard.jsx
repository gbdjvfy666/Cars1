import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const COLORS = {
    primary: '#E30016', 
    primaryHover: '#C80014', 
    secondary: '#00b33e', 
    cardBackground: '#1c1c1c', 
    listCardBackground: '#252525',
    border: '#3a3a3a', 
    shadow: 'rgba(0, 0, 0, 0.4)',
    textPrimary: '#f0f0f0', 
    textSecondary: '#cccccc', 
    textMuted: '#999999', 
    badgeOrange: '#D27029',
    badgeBlue: '#135BE8',
    softHoverBorder: '#666666', 
    softHoverGlow: 'rgba(255, 255, 255, 0.08)', 
    listButtonBg: '#383838',
    listButtonHoverBg: '#4a4a4a',
};

const slugify = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s/g, '-');
};

const safeJSONParse = (data) => {
    if (typeof data !== 'string') return data || [];
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// ======================= КОМПОНЕНТ-ОБЕРТКА ДЛЯ ЗАГОЛОВКА (ДЛЯ СЕТКИ) =======================
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
const CarCard = ({ car, view = 'grid' }) => {
    const [isCardHovered, setIsCardHovered] = useState(false);

    const handleMouseEnter = () => setIsCardHovered(true);
    const handleMouseLeave = () => setIsCardHovered(false);

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
        img: car.img_src || firstImage || "https://placehold.co/300x200/2c2c2c/aaaaaa?text=Image+N/A" 
    };
    
    const brandSlug = slugify(carData.brand);
    const modelSlug = slugify(carData.model);
    const linkTo = `/cars/${brandSlug}/${modelSlug}/${carData.id}`;

    // ================== РЕНДЕР ВИДА "СПИСОК" (LIST) ==================
    const renderListView = () => (
        <div 
            style={isCardHovered ? styles.listCardHover : styles.listCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link to={linkTo} style={styles.listImageLink}>
                <img 
                    src={carData.img} 
                    alt={carData.name} 
                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/300x200/2c2c2c/aaaaaa?text=Image+N/A"}} 
                    style={styles.listImage} 
                />
                 <div style={styles.listImageOverlay}>
                    <span>Состояние: хорошее</span>
                    <span>Отчёт продавца ↗</span>
                </div>
            </Link>

            <div style={styles.listBody}>
                <div style={styles.listTopSection}>
                    <div style={styles.listMainInfo}>
                        <Link to={linkTo} style={styles.cardLink}>
                            <h3 style={styles.listTitle}>{carData.name} <span style={styles.listYearBadge}>{carData.year}</span></h3>
                        </Link>
                        <p style={styles.listSpecs}>182 л.с.・FWD・CVT・1.5・Бензин・5-местн.</p>
                        <p style={styles.listComplectation}>2022款 1.5T CVT豪华版 <span style={{color: '#aaa', marginLeft: '10px'}}>15 отзывов</span></p>
                    </div>
                    <div style={styles.listSecondaryInfo}>
                        <p style={styles.listSecondaryInfoMain}>{carData.year} г.в.</p>
                        <p>{carData.mileage.toLocaleString('ru-RU')} км</p>
                        <p>1 владелец</p>
                    </div>
                    <div style={styles.listPriceInfo}>
                        <p style={styles.listPrice}>{carData.price_russia.toLocaleString('ru-RU')} ₽</p>
                        <p style={styles.listPriceDisclaimer}>Цена в РФ от Limee Auto</p>
                        <div style={styles.marketPriceBadge}>Рыночная цена ⓘ</div>
                    </div>
                </div>

                <div style={styles.listBottomSection}>
                    <div style={styles.listActions}>
                        <button style={styles.listButtonPrimary}>Позвоните мне</button>
                        <button style={styles.listButtonSecondary}>Хочу заказать</button>
                    </div>
                    <div style={styles.listMeta}>
                        <span>1-й день на рынке</span>
                        <span>Китай - Люйлян</span>
                        <span>id {carData.id}</span>
                    </div>
                    <div style={styles.listToolbar}>
                        <span>➤</span>
                        <span>⇆</span>
                        <span>☆</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // ================== РЕНДЕР ВИДА "СЕТКА" (GRID) ==================
    const renderGridView = () => (
        <Link 
            to={linkTo}
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
                        <div style={{...styles.priceInfo, opacity: isCardHovered ? 0 : 1, pointerEvents: isCardHovered ? 'none' : 'auto'}}>
                            <div style={styles.cardPriceRussiaWrapper}>
                                <div style={styles.cardPriceRussia}>~ {carData.price_russia.toLocaleString('ru-RU')} ₽</div>
                                <div style={styles.cardPriceDisclaimer}>Цена в России (под ключ)</div>
                            </div>
                            <div style={styles.cardPriceChinaWrapper}>
                                <div style={styles.cardPriceChina}>{carData.price_china.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽ в Китае</div>
                            </div>
                        </div>
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

    return view === 'list' ? renderListView() : renderGridView();
};


// ======================= СТИЛИ =======================
const styles = {
    cardLink: { textDecoration: 'none', color: 'inherit' },
    
    // ================== СТИЛИ ДЛЯ GRID VIEW (без изменений) ==================
    card: { border: `1px solid ${COLORS.border}`, borderRadius: '12px', backgroundColor: COLORS.cardBackground, display: 'flex', flexDirection: 'column', boxShadow: `0 4px 10px ${COLORS.shadow}`, transition: 'all 0.2s ease-in-out', overflow: 'hidden', height: '100%' }, 
    cardHover: { border: `1px solid ${COLORS.softHoverBorder}`, borderRadius: '12px', backgroundColor: COLORS.cardBackground, display: 'flex', flexDirection: 'column', boxShadow: `0 8px 20px ${COLORS.shadow}, 0 0 10px ${COLORS.softHoverGlow}`, transform: 'translateY(-2px)', transition: 'all 0.2s ease-in-out', overflow: 'hidden', height: '100%' },
    cardImageContainer: { position: 'relative', width: '100%', paddingTop: '60%', overflow: 'hidden', backgroundColor: '#2c2c2c' }, 
    cardImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },
    mileageBadge: { position: 'absolute', bottom: '0', left: '0', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '6px 12px', fontSize: '12px', textAlign: 'left', lineHeight: 1.4, borderTopRightRadius: '10px', display: 'flex', gap: '15px', fontWeight: '500' },
    mileageItem: { display: 'inline-block' },
    mileageLabel: { fontWeight: '400', color: COLORS.textMuted, marginRight: '3px' }, 
    mileageValue: { fontWeight: '600', color: COLORS.textPrimary }, 
    cardTopRightBadges: { position: 'absolute', top: 0, right: '0', display: 'flex', gap: '1px', zIndex: 2 },
    badge: { width: '35px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '12px', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)', opacity: 0.9 },
    badgeBlue: { backgroundColor: COLORS.badgeBlue, color: COLORS.textPrimary, fontWeight: 700, fontSize: '10px' },
    badgeOrange: { backgroundColor: COLORS.badgeOrange, fontSize: '14px' },
    badgeLightBlue: { backgroundColor: '#4DA7FA', fontSize: '14px' },
    cardBody: { padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative', zIndex: 1 }, 
    cardTitleWrapper: { position: 'relative', marginBottom: '10px', minHeight: '40px' },
    cardTitle: { margin: 0, fontSize: '18px', fontWeight: '700', lineHeight: 1.3, height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis', whiteSpace: 'normal', cursor: 'pointer', transition: 'color 0.2s ease', color: COLORS.textPrimary },
    cardTitleHover: { color: COLORS.primary }, 
    fullTitleTooltip: { position: 'absolute', top: '-15px', left: '-15px', right: '-15px', zIndex: 10, backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, boxShadow: `0 4px 12px ${COLORS.shadow}`, padding: '10px 15px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', lineHeight: 1.3, color: COLORS.primary, pointerEvents: 'none' },
    cardLocationAndId: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '10px' },
    cardLocation: { color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase' }, 
    cardId: { color: COLORS.textMuted, fontSize: '12px' }, 
    cardFooter: { minHeight: '60px', position: 'relative', marginTop: 'auto', paddingTop: '5px' },
    priceInfo: { position: 'absolute', width: '100%', transition: 'opacity 0.2s ease', display: 'flex', flexDirection: 'column' },
    orderInfo: { position: 'absolute', width: '100%', transition: 'opacity 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' },
    cardPriceRussiaWrapper: { display: 'flex', flexDirection: 'column', marginBottom: '4px', lineHeight: 1.1 },
    cardPriceRussia: { fontSize: '22px', fontWeight: '600', lineHeight: 1.1, color: COLORS.textPrimary, }, 
    cardPriceDisclaimer: { fontSize: '12px', color: COLORS.textMuted, lineHeight: 1.2, fontWeight: '500' }, 
    cardPriceChinaWrapper: { fontSize: '13px', color: COLORS.textMuted, fontWeight: '500', marginTop: '5px' }, 
    cardPriceChina: { color: COLORS.textSecondary, fontWeight: '500' },
    orderPriceGroup: { lineHeight: 1.2 },
    cardPriceChinaFull: { fontSize: '22px', fontWeight: '700', lineHeight: 1.2, color: COLORS.textPrimary },
    cardPriceChinaDisclaimerHover: { fontSize: '12px', color: COLORS.textMuted, fontWeight: '400' }, 
    orderButton: { padding: '10px 20px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', pointerEvents: 'auto', transition: 'background-color 0.2s', minWidth: '100px', boxShadow: `0 4px 10px rgba(227, 0, 22, 0.4)` },

    // ================== ОБНОВЛЕННЫЕ СТИЛИ ДЛЯ LIST VIEW ==================
    listCard: {
        width: '100%',
        height: '230px', // ЗАДАЕМ ФИКСИРОВАННУЮ ВЫСОТУ
        display: 'flex',
        backgroundColor: COLORS.listCardBackground,
        borderRadius: '12px',
        border: `1px solid transparent`,
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden',
    },
    listCardHover: {
        width: '100%',
        height: '230px', // ДУБЛИРУЕМ ВЫСОТУ ДЛЯ ХОВЕРА
        display: 'flex',
        backgroundColor: COLORS.listCardBackground,
        borderRadius: '12px',
        border: `1px solid ${COLORS.softHoverBorder}`,
        boxShadow: `0 8px 20px ${COLORS.shadow}, 0 0 10px ${COLORS.softHoverGlow}`,
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden',
    },
    listImageLink: {
        flex: '0 0 280px', 
        position: 'relative',
        cursor: 'pointer',
    },
    listImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    listImageOverlay: {
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        right: '8px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: COLORS.textPrimary,
        padding: '6px 10px',
        borderRadius: '8px',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: '500',
    },
    listBody: {
        flex: 1,
        padding: '12px 20px', // УМЕНЬШАЕМ ВЕРТИКАЛЬНЫЕ ОТСТУПЫ
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    listTopSection: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
    },
    listMainInfo: {
        flex: '1 1 50%',
    },
    listTitle: {
        margin: '0 0 4px 0', // УМЕНЬШАЕМ НИЖНИЙ ОТСТУП
        fontSize: '20px',
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    listYearBadge: {
        display: 'inline-block',
        backgroundColor: COLORS.border,
        color: COLORS.textSecondary,
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        marginLeft: '10px',
        verticalAlign: 'middle',
    },
    listSpecs: { margin: '0 0 8px 0', fontSize: '14px', color: COLORS.textPrimary },
    listComplectation: { margin: '0', fontSize: '13px', color: COLORS.textMuted },
    listSecondaryInfo: { flex: '0 0 120px', textAlign: 'left', fontSize: '14px', color: COLORS.textSecondary, lineHeight: 1.6, paddingLeft: '20px' },
    listSecondaryInfoMain: { fontWeight: '600', color: COLORS.textPrimary },
    listPriceInfo: { flex: '0 0 200px', textAlign: 'right' },
    listPrice: { margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: COLORS.textPrimary },
    listPriceDisclaimer: { fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px' },
    marketPriceBadge: { display: 'inline-block', backgroundColor: 'rgba(0, 179, 62, 0.2)', color: '#00b33e', padding: '5px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(0, 179, 62, 0.4)' },
    listBottomSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px', // УМЕНЬШАЕМ ВЕРХНИЙ ОТСТУП
    },
    listActions: { display: 'flex', gap: '10px' },
    listButtonPrimary: { padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: COLORS.listButtonBg, color: COLORS.textSecondary, fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
    listButtonSecondary: { padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: COLORS.listButtonBg, color: COLORS.textSecondary, fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
    listMeta: { fontSize: '12px', color: COLORS.textMuted, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.5 },
    listToolbar: { display: 'flex', gap: '16px', fontSize: '18px', color: COLORS.textMuted, alignItems: 'center', cursor: 'pointer' },
};

export default CarCard;