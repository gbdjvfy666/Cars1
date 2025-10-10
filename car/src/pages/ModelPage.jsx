import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const API_BASE_URL = 'http://localhost:4000';
const ICON_PLACEHOLDER = 'https://placehold.co/50x50/333333/ffffff?text=Logo';

const COLORS = {
    primary: '#E30016',
    secondary: '#00b33e',
    background: '#FFFFFF',
    pageBackground: '#F7F7F7',
    border: '#EAEAEA',
    shadow: 'rgba(0, 0, 0, 0.05)',
    textPrimary: '#1A1A1A',
    textSecondary: '#555555',
    textMuted: '#999999',
};

// ======================= КОМПОНЕНТ ФИЛЬТРОВ (Адаптирован под ModelPage) =======================

const FilterBar = ({ filters, setFilters, carsOfModel, brandName, modelName }) => {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
         setFilters(prev => ({
            ...prev,
            type: 'all', engineType: '', yearFrom: '', yearTo: '',
            drivetrain: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '',
        }));
    };
    
    // Вычисляем доступные опции только из машин текущей модели
    const uniqueValues = (key) => [...new Set(carsOfModel.map(car => car[key]).filter(Boolean))].sort();
    const engineTypes = uniqueValues('engine_type');
    const drivetrains = uniqueValues('drivetrain');

    return (
        <div style={styles.filterBar}>
            <div style={styles.filterRowTop}>
                <div style={styles.typeButtons}>
                    {['all', 'new', 'used'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilters(prev => ({ ...prev, type: type }))}
                            style={{ ...styles.typeButton, ...(filters.type === type ? styles.activeTypeButton : {}) }}
                        >
                            {type === 'all' ? 'Все' : type === 'new' ? 'Новые' : 'С пробегом'}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select style={{...styles.select, minWidth: '180px'}}><option>Сортировать: по популярности</option></select>
                    <button onClick={handleReset} style={styles.resetButton}>Сбросить ✕</button>
                </div>
            </div>
            <div style={styles.filterRowBottom}>
                <div style={styles.filterInputGroup}>
                    {/* Бренд и Модель - неактивны, так как мы на странице модели */}
                    <select disabled style={{...styles.select, backgroundColor: COLORS.pageBackground, color: COLORS.textPrimary, fontWeight: '600'}}>
                        <option>{brandName}</option>
                    </select>
                    <select disabled style={{...styles.select, backgroundColor: COLORS.pageBackground, color: COLORS.textPrimary, fontWeight: '600'}}>
                        <option>{modelName}</option>
                    </select>
                    
                    {/* Тип двигателя */}
                    <select name="engineType" value={filters.engineType} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Тип двигателя</option>
                        {engineTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    
                    {/* Год */}
                    <div style={styles.inputRangeContainer}>
                        <input name="yearFrom" type="number" value={filters.yearFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Год от" />
                        <input name="yearTo" type="number" value={filters.yearTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                
                <div style={styles.filterInputGroup}>
                    <select style={styles.select}><option>Тип кузова</option></select>
                    <select style={styles.select}><option>Коробка</option></select>
                    <select style={styles.select}><option>Опции</option></select>
                    
                    {/* Привод */}
                    <select name="drivetrain" value={filters.drivetrain} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Привод</option>
                        {drivetrains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    
                    {/* Пробег */}
                    <div style={styles.inputRangeContainer}>
                        <input name="mileageFrom" type="number" value={filters.mileageFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Пробег от, км" />
                        <input name="mileageTo" type="number" value={filters.mileageTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                
                <div style={styles.filterRowPriceAndButton}>
                    <div style={styles.inputRangeContainerPrice}>
                         {/* Цена */}
                        <input name="priceFrom" type="number" value={filters.priceFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Цена от, ₽" />
                        <input name="priceTo" type="number" value={filters.priceTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                    <button style={styles.showButton}>
                        Показать ({filters.count})
                    </button>
                </div>
            </div>
        </div>
    );
};

// ======================= КОМПОНЕНТ-ОБЕРТКА ДЛЯ ЗАГОЛОВКА =======================
const TitleHoverWrapper = ({ carName }) => {
    const [isHovered, setIsHovered] = useState(false); 
    return (
        <div style={styles.cardTitleWrapper} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <h3 style={{...styles.cardTitle, ...(isHovered ? styles.cardTitleHover : {})}}>{carName}</h3>
            {isHovered && <div style={styles.fullTitleTooltip}>{carName}</div>}
        </div>
    );
};

// ======================= КОМПОНЕНТ КАРТОЧКИ АВТО =======================
const CarCard = ({ car }) => {
    const [isCardHovered, setIsCardHovered] = useState(false);
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
    const brandSlug = car.brand_slug || car.brand.toLowerCase().replace(/\s+/g, '-');
    const modelSlug = car.model_slug || car.model.toLowerCase().replace(/\s+/g, '-');

    return (
        <Link to={`/cars/${brandSlug}/${modelSlug}/${carData.id}`} style={styles.cardLink} onMouseEnter={() => setIsCardHovered(true)} onMouseLeave={() => setIsCardHovered(false)}>
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


// ======================= ОСНОВНОЙ КОМПОНЕНТ =======================
const ModelPage = () => {
    const { brandSlug, modelSlug } = useParams();
    
    const [allCarsForModel, setAllCarsForModel] = useState([]);
    const [pageInfo, setPageInfo] = useState({ brandName: '', modelName: '', brandIcon: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        type: 'all', engineType: '', yearFrom: '', yearTo: '',
        drivetrain: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '',
        count: 0,
    });
    
    const [displayedCars, setDisplayedCars] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Загружаем одновременно данные бренда и все машины бренда
                const [brandResponse, carsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/brands/${brandSlug}`), 
                    fetch(`${API_BASE_URL}/api/cars/${brandSlug}`) 
                ]);

                // Обработка данных бренда
                let brandData = {};
                if (brandResponse.ok) {
                    brandData = await brandResponse.json();
                }

                // Обработка машин
                if (!carsResponse.ok) throw new Error(`Ошибка HTTP: ${carsResponse.status}`);
                let allCarsForBrand = await carsResponse.json();

                // Фильтруем машины, чтобы оставить только нужную модель
                const modelCars = allCarsForBrand.filter(car => 
                    car.model && car.model.toLowerCase().replace(/\s/g, '-') === modelSlug
                );
                
                if (modelCars.length === 0) {
                    setError(`Для модели ${modelSlug} пока нет предложений.`);
                }
                
                setAllCarsForModel(modelCars);

                // Устанавливаем информацию о странице
                setPageInfo({
                    brandName: brandData.name || brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
                    modelName: modelCars.length > 0 ? modelCars[0].model : modelSlug,
                    brandIcon: brandData.img_src || ICON_PLACEHOLDER,
                });

            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError(`Не удалось загрузить данные для ${brandSlug}/${modelSlug}.`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [brandSlug, modelSlug]);


    // Эффект для фильтрации машин при изменении фильтров
    useEffect(() => {
        if (isLoading) return;

        let filtered = [...allCarsForModel];

        if (filters.type === 'new') filtered = filtered.filter(c => c.mileage === 0 || c.mileage < 1000);
        if (filters.type === 'used') filtered = filtered.filter(c => c.mileage >= 1000);
        
        if (filters.engineType) filtered = filtered.filter(c => c.engine_type === filters.engineType);
        if (filters.drivetrain) filtered = filtered.filter(c => c.drivetrain === filters.drivetrain); 
        
        if (filters.yearFrom) filtered = filtered.filter(c => c.year >= parseInt(filters.yearFrom, 10));
        if (filters.yearTo) filtered = filtered.filter(c => c.year <= parseInt(filters.yearTo, 10));
        
        if (filters.priceFrom) filtered = filtered.filter(c => c.price_russia >= parseInt(filters.priceFrom, 10));
        if (filters.priceTo) filtered = filtered.filter(c => c.price_russia <= parseInt(filters.priceTo, 10));

        if (filters.mileageFrom) filtered = filtered.filter(c => c.mileage >= parseInt(filters.mileageFrom, 10));
        if (filters.mileageTo) filtered = filtered.filter(c => c.mileage <= parseInt(filters.mileageTo, 10));

        setDisplayedCars(filtered);
        setFilters(prev => ({...prev, count: filtered.length}));
    }, [filters.type, filters.engineType, filters.drivetrain, 
        filters.yearFrom, filters.yearTo, filters.priceFrom, filters.priceTo, 
        filters.mileageFrom, filters.mileageTo, allCarsForModel, isLoading]);
    
    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px'}}>Загрузка...</div>;
    }
    if (error) {
        return <div style={{padding: '50px', color: COLORS.primary, fontSize: '18px', textAlign: 'center'}}>{error}</div>;
    }

    return (
        <div style={styles.page}>
            <div style={styles.pageContent}> 
                <div style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadcrumbLink}>🏠</Link> 
                    <span style={{color: COLORS.textMuted}}>/</span> 
                    <Link to={`/cars/${brandSlug}`} style={styles.breadcrumbLink}>{pageInfo.brandName}</Link>
                    <span style={{color: COLORS.textMuted}}>/</span>
                    <span style={{color: COLORS.textPrimary, fontWeight: 600}}>{pageInfo.modelName}</span>
                </div>

                <h1 style={styles.pageTitleContainer}>
                    {pageInfo.brandIcon && (
                        <img 
                            src={pageInfo.brandIcon} 
                            alt={`${pageInfo.brandName} logo`} 
                            style={styles.brandIcon} 
                            onError={(e) => { e.target.onerror = null; e.target.src = ICON_PLACEHOLDER; }}
                        />
                    )}
                    <span style={styles.pageTitleText}>{pageInfo.brandName} {pageInfo.modelName}</span>
                </h1>
                
                {/* Компонент фильтров, такой же как на BrandPage */}
                <FilterBar 
                    filters={filters} 
                    setFilters={setFilters} 
                    carsOfModel={allCarsForModel}
                    brandName={pageInfo.brandName}
                    modelName={pageInfo.modelName}
                />
                
                <div style={styles.resultsGrid}>
                    {displayedCars.length > 0 ? (
                        displayedCars.map(car => <CarCard key={car.id} car={car} />)
                    ) : (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px', fontSize: '18px', color: COLORS.textMuted}}>
                            К сожалению, по выбранным фильтрам машин не найдено.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ======================= СТИЛИ (СКОПИРОВАНЫ ИЗ BRANDPAGE) =======================
const styles = {
    page: { 
        minHeight: '100vh', 
        backgroundColor: COLORS.pageBackground, 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        color: COLORS.textPrimary,
    },
    pageContent: {
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 20px 40px 20px', 
    },
    breadcrumb: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        color: COLORS.textMuted, 
        padding: '20px 0 10px 0', 
        fontSize: '14px' 
    },
    breadcrumbLink: { 
        textDecoration: 'none', 
        color: COLORS.textSecondary, 
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    pageTitleContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        backgroundColor: COLORS.background,
        border: `1px solid ${COLORS.border}`,
        padding: '15px 20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        boxShadow: `0 2px 4px ${COLORS.shadow}`,
    },
    brandIcon: { 
        width: '40px', 
        height: '40px', 
        objectFit: 'contain', 
        backgroundColor: COLORS.pageBackground, 
        borderRadius: '8px' 
    },
    pageTitleText: { 
        fontSize: '32px',
        fontWeight: '700', 
        color: COLORS.textPrimary,
        margin: 0
    },
    filterBar: { 
        marginBottom: '40px',
        padding: '25px', 
        backgroundColor: COLORS.background,
        borderRadius: '8px',
        border: `1px solid ${COLORS.border}`,
    },
    filterRowTop: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${COLORS.border}`
    },
    typeButtons: { 
        display: 'flex', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        border: `1px solid ${COLORS.primary}` 
    },
    typeButton: { 
        padding: '10px 20px', 
        backgroundColor: COLORS.background, 
        color: COLORS.primary, 
        border: 'none', 
        cursor: 'pointer', 
        fontWeight: '500', 
        flexGrow: 1, 
        minWidth: '120px',
        fontSize: '15px',
    },
    activeTypeButton: { 
        backgroundColor: COLORS.primary, 
        color: COLORS.background, 
        fontWeight: '600' 
    },
    resetButton: { 
        backgroundColor: 'transparent', 
        border: 'none', 
        color: COLORS.textMuted, 
        cursor: 'pointer', 
        fontSize: '15px',
        fontWeight: '500',
    },
    filterRowBottom: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px' 
    },
    filterInputGroup: { 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px', 
    },
    select: { 
        padding: '10px 15px', 
        borderRadius: '6px', 
        border: `1px solid ${COLORS.border}`, 
        minWidth: '180px', 
        fontSize: '15px', 
        flexGrow: 1, 
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
    },
    inputRangeContainer: { 
        display: 'flex', 
        gap: '0', 
        flexGrow: 1, 
        minWidth: '180px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        overflow: 'hidden',
    },
    inputRangeContainerPrice: {
        display: 'flex', 
        gap: '0', 
        flexGrow: 1, 
        minWidth: '240px',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        overflow: 'hidden',
    },
    inputRange: { 
        padding: '10px 15px', 
        border: 'none', 
        fontSize: '15px', 
        flex: 1,
        backgroundColor: COLORS.background,
    },
    filterRowPriceAndButton: { 
        display: 'flex', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: '20px' 
    },
    showButton: { 
        padding: '10px 30px', 
        backgroundColor: COLORS.primary, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontWeight: '600', 
        fontSize: '16px', 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    resultsGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
    },
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
    cardPriceRussiaWrapper: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', lineHeight: 1.1 },
    cardPriceRussia: { fontSize: '20px', fontWeight: '700', lineHeight: 1.1, color: COLORS.textPrimary }, 
    cardPriceDisclaimer: { fontSize: '11px', color: COLORS.textMuted, lineHeight: 1.2, paddingTop: '3px' }, 
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
    },
};

export default ModelPage;