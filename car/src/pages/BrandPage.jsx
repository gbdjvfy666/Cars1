import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const ALL_CARS_KEY = 'all';
const ICON_PLACEHOLDER = 'https://placehold.co/32x32/e0e0e0/e0e0e0.png';

const formatPrice = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString('ru-RU');
};

const slugify = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s/g, '-');
};

// ======================= МЕЛКИЕ КОМПОНЕНТЫ =======================

const FilterBar = ({ filters, setFilters, cars, models, brandName }) => {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredCarsByType = cars.filter(car => {
        if (filters.type === 'new') return car.mileage === 0 || car.mileage === null;
        if (filters.type === 'used') return car.mileage > 0;
        return true;
    });

    const uniqueValues = (key) => [...new Set(filteredCarsByType.map(car => car[key]).filter(Boolean))].sort();
    const engineTypes = uniqueValues('engine_type');
    const drivetrains = uniqueValues('drivetrain');

    return (
        <div style={styles.filterBar}>
            {/* ... (код FilterBar остается без изменений) ... */}
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
                    <select style={{...styles.select, minWidth: '180px'}}><option>по популярности</option></select>
                    <button style={styles.resetButton}>Сбросить ✕</button>
                </div>
            </div>
            <div style={styles.filterRowBottom}>
                <div style={styles.filterInputGroup}>
                    <select disabled style={{...styles.select, backgroundColor: '#f9f9f9'}}>
                        <option value={brandName}>{brandName}</option>
                    </select>
                    <select name="model" value={filters.model} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Модель</option>
                        {models.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
                    </select>
                    <select name="engineType" value={filters.engineType} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Тип двигателя</option>
                        {engineTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <div style={styles.inputRangeContainer}>
                        <input name="yearFrom" type="number" value={filters.yearFrom} onChange={handleFilterChange} style={styles.inputRange} placeholder="Год от" />
                        <input name="yearTo" type="number" value={filters.yearTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                <div style={styles.filterInputGroup}>
                    <select style={styles.select}><option>Тип кузова</option></select>
                    <select style={styles.select}><option>Коробка</option></select>
                    <select style={styles.select}><option>Опции</option></select>
                    <select name="drivetrain" value={filters.drivetrain} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Привод</option>
                        {drivetrains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div style={styles.inputRangeContainer}>
                        <input name="mileageFrom" type="number" value={filters.mileageFrom} onChange={handleFilterChange} style={styles.inputRange} placeholder="Пробег от, км" />
                        <input name="mileageTo" type="number" value={filters.mileageTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                <div style={styles.filterRowPriceAndButton}>
                    <div style={styles.inputRangeContainer}>
                        <input name="priceFrom" type="number" value={filters.priceFrom} onChange={handleFilterChange} style={styles.inputRange} placeholder="Цена от, ₽" />
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

const ModelList = ({ models, brandSlug }) => {
    const totalCount = models.reduce((acc, model) => acc + model.count, 0);
    const allModels = [
        { name: 'Все', slug: ALL_CARS_KEY, count: totalCount, isAll: true },
        ...models
    ];

    return (
        <div style={styles.modelListContainer}>
            {allModels.map(model => (
                <Link 
                    to={`/cars/${brandSlug}/${model.slug}`} 
                    key={model.slug} 
                    style={styles.modelItem}
                >
                    <span style={{...styles.modelName, ...(model.isAll ? styles.modelNameAll : {})}}>
                        {model.name}
                    </span>
                    <span style={styles.modelCount}>
                        {model.count}
                    </span>
                </Link>
            ))}
        </div>
    );
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

// ======================= КОМПОНЕНТ КАРТОЧКИ АВТО =======================
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
        img: car.img_src || "https://placehold.co/300x200/4DA7FA/ffffff?text=Car+Image" 
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
            <div style={styles.card}>
                <div style={styles.cardImageContainer}>
                    <img src={carData.img} alt={carData.name} onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/300x200/DDDDDD/666666?text=No+Image"}} style={styles.cardImage} />
                    <div style={styles.cardBottomLeftIcons}><div style={styles.iconWrapper}><span style={styles.starIcon}>⭐</span></div></div>
                    <div style={styles.cardTopRightBadges}><div style={{...styles.badge, ...styles.badgeBlue}}><span>O<small>km</small></span></div><div style={{...styles.badge, ...styles.badgeOrange}} title="ТОП 3"><span>🏆</span></div><div style={{...styles.badge, ...styles.badgeLightBlue}}><span>4+💺</span></div></div>
                    
                    {/* ИЗМЕНЕНИЕ ЗДЕСЬ: Показываем блок только если пробег БОЛЬШЕ 0 */}
                    {carData.mileage > 0 && (
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
                            <div style={styles.cardPriceChinaFull}>{carData.price_china.toLocaleString('ru-RU')} ₽ <br/><span style={{fontSize: '10px'}}>Цена в Китае</span></div>
                            <button style={styles.orderButton} onClick={(e) => { e.preventDefault(); console.log(`Заказ ${carData.name}`); }}>Заказать</button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};


// ======================= ОСНОВНОЙ КОМПОНЕНТ =======================
const BrandPage = () => {
    const { brandSlug, modelSlug } = useParams(); 
    
    const [allCars, setAllCars] = useState([]);
    const [brandIconUrl, setBrandIconUrl] = useState('');
    const [brandName, setBrandName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        model: modelSlug === ALL_CARS_KEY ? '' : modelSlug || '', 
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
                const [brandResponse, carsResponse] = await Promise.all([
                    fetch(`http://localhost:4000/api/brands/${brandSlug}`), 
                    fetch(`http://localhost:4000/api/cars/${brandSlug}`) 
                ]);
                
                let currentBrandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
                if (brandResponse.ok) {
                    const brandData = await brandResponse.json();
                    setBrandIconUrl(brandData.img_src || ICON_PLACEHOLDER);
                    setBrandName(brandData.name || currentBrandName);
                    currentBrandName = brandData.name || currentBrandName;
                } else {
                    console.error(`Ошибка HTTP при загрузке данных бренда: ${brandResponse.status}`);
                    setBrandIconUrl(ICON_PLACEHOLDER);
                    setBrandName(currentBrandName); 
                }

                if (!carsResponse.ok) {
                    throw new Error(`Ошибка HTTP при загрузке списка машин: ${carsResponse.status}`);
                }
                const carsData = await carsResponse.json();
                
                const carsWithBrand = carsData.map(car => ({
                    ...car,
                    brand: car.brand || currentBrandName 
                }));
                
                setAllCars(carsWithBrand);
                
                setFilters(prev => ({
                    ...prev,
                    model: modelSlug === ALL_CARS_KEY ? '' : modelSlug || '',
                    count: carsData.length,
                }));

            } catch (err) {
                console.error("Общая ошибка загрузки данных:", err);
                setError(`Не удалось загрузить данные для бренда "${brandSlug}".`);
                setBrandIconUrl(ICON_PLACEHOLDER);
                setBrandName(brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [brandSlug, modelSlug]);

    const modelsGrouped = useMemo(() => {
        if (allCars.length === 0) return [];
        const modelsMap = allCars.reduce((acc, car) => {
            const modelName = car.model || 'Unknown Model'; 
            const modelSlugValue = car.model ? slugify(car.model) : 'unknown';

            if (!acc[modelSlugValue]) {
                acc[modelSlugValue] = { name: modelName, slug: modelSlugValue, count: 0 };
            }
            acc[modelSlugValue].count += 1;
            return acc;
        }, {});
        return Object.values(modelsMap).sort((a, b) => b.count - a.count);
    }, [allCars]);

    useEffect(() => {
        if (isLoading) return;
        let filtered = [...allCars];

        if (filters.type === 'new') filtered = filtered.filter(c => c.mileage === 0 || c.mileage === null);
        if (filters.type === 'used') filtered = filtered.filter(c => c.mileage > 0);
        if (filters.model) filtered = filtered.filter(c => c.model && slugify(c.model) === filters.model);
        if (filters.engineType) filtered = filtered.filter(c => c.engine_type === filters.engineType);
        if (filters.drivetrain) filtered = filtered.filter(c => c.drivetrain === filters.drivetrain); 
        if (filters.yearFrom) filtered = filtered.filter(c => c.year >= parseInt(filters.yearFrom));
        if (filters.yearTo) filtered = filtered.filter(c => c.year <= parseInt(filters.yearTo));
        if (filters.priceFrom) filtered = filtered.filter(c => c.price_russia >= parseInt(filters.priceFrom));
        if (filters.priceTo) filtered = filtered.filter(c => c.price_russia <= parseInt(filters.priceTo));
        if (filters.mileageFrom) filtered = filtered.filter(c => c.mileage >= parseInt(filters.mileageFrom));
        if (filters.mileageTo) filtered = filtered.filter(c => c.mileage <= parseInt(filters.mileageTo));

        setDisplayedCars(filtered);
        setFilters(prev => ({...prev, count: filtered.length}));
    }, [filters.model, filters.type, filters.engineType, filters.drivetrain, 
        filters.yearFrom, filters.yearTo, filters.priceFrom, filters.priceTo, 
        filters.mileageFrom, filters.mileageTo, allCars, isLoading]);
    
    const displayBrandName = brandName || (brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)); 

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px'}}>Загрузка...</div>;
    }
    if (error) {
        return <div style={{padding: '50px', color: '#E30016', fontSize: '18px'}}>{error}</div>;
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerNav}>
                    <a href="#" style={{...styles.headerLink}}>Отзывы</a>
                    <a href="#" style={{...styles.headerLink}}>FAQ</a>
                    <a href="#" style={{...styles.headerLink}}>О компании</a>
                    <a href="#" style={{...styles.headerLink}}>Контакты</a>
                </div>
            </header>
            <div style={styles.contentArea}>
                <div style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadcrumbLink}>🏠</Link> / {displayBrandName}
                </div>
                <h1 style={styles.pageTitleContainer}>
                    {brandIconUrl && (
                        <img 
                            src={brandIconUrl} 
                            alt={`${displayBrandName} logo`} 
                            style={styles.brandIcon} 
                            onError={(e) => { e.target.onerror = null; e.target.src = ICON_PLACEHOLDER; }}
                        />
                    )}
                    <span style={styles.pageTitleText}>Купить {displayBrandName}</span>
                </h1>
                <ModelList models={modelsGrouped} brandSlug={brandSlug} />
                <FilterBar 
                    filters={filters} 
                    setFilters={setFilters} 
                    cars={allCars} 
                    models={modelsGrouped}
                    brandName={displayBrandName}
                />
                <div style={styles.resultsGrid}>
                    {displayedCars.length > 0 ? (
                        displayedCars.map(car => <CarCard key={car.id} car={car} />)
                    ) : (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px', fontSize: '18px', color: '#999'}}>
                            К сожалению, по выбранным фильтрам машин не найдено.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ======================= СТИЛИ =======================
const styles = {
    // Общие стили страницы
    page: { minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Inter, sans-serif' },
    contentArea: { maxWidth: '1280px', margin: '0 auto', padding: '0 20px 40px 20px', backgroundColor: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.05)' },
    header: { padding: '15px 0', borderBottom: '1px solid #eee', backgroundColor: '#fff', marginBottom: '20px' },
    headerNav: { maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end', gap: '30px' },
    headerLink: { textDecoration: 'none', color: '#333', fontSize: '14px' },
    breadcrumb: { padding: '20px 0 10px 0', color: '#888', fontSize: '14px' },
    breadcrumbLink: { textDecoration: 'none', color: '#888', marginRight: '5px' },
    pageTitleContainer: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fde9eb', padding: '15px 20px', borderRadius: '8px', fontSize: '24px', fontWeight: 'normal', marginBottom: '25px' },
    brandIcon: { width: '32px', height: '32px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px' },
    pageTitleText: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
    
    // Список моделей
    modelListContainer: { display: 'flex', flexWrap: 'wrap', gap: '15px 30px', padding: '15px 0 25px 0', borderBottom: '1px solid #eee', marginBottom: '20px' },
    modelItem: { display: 'flex', alignItems: 'flex-end', gap: '5px', textDecoration: 'none', color: '#333', paddingBottom: '5px', borderBottom: '2px solid transparent' },
    modelName: { fontSize: '14px', fontWeight: '500' },
    modelNameAll: { fontWeight: 'bold' },
    modelCount: { color: '#999', fontSize: '12px', fontWeight: 'normal' },

    // Фильтры
    filterBar: { marginBottom: '30px' },
    filterRowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    typeButtons: { display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #E30016' },
    typeButton: { padding: '8px 15px', backgroundColor: 'white', color: '#E30016', border: 'none', cursor: 'pointer', fontWeight: '500', flexGrow: 1, minWidth: '100px' },
    activeTypeButton: { backgroundColor: '#E30016', color: 'white', fontWeight: 'bold' },
    resetButton: { backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' },
    filterRowBottom: { display: 'flex', flexDirection: 'column', gap: '10px' },
    filterInputGroup: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' },
    select: { padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px', fontSize: '14px', flexGrow: 1, backgroundColor: 'white' },
    inputRangeContainer: { display: 'flex', gap: '1px', flexGrow: 1, minWidth: '150px' },
    inputRange: { padding: '8px 12px', border: '1px solid #ccc', fontSize: '14px', flex: 1 },
    filterRowPriceAndButton: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' },
    showButton: { padding: '10px 30px', backgroundColor: '#E30016', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
    
    // Сетка результатов
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    
    // СТИЛИ ДЛЯ КАРТОЧКИ
    cardLink: { textDecoration: 'none', color: 'inherit' },
    card: { border: '1px solid #f0f0f0', borderRadius: '10px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'none' }, 
    cardImageContainer: { position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' },
    cardImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    cardBottomLeftIcons: { position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '5px' },
    iconWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    starIcon: { fontSize: '14px' },
    cardTopRightBadges: { position: 'absolute', top: 0, right: '11px', display: 'flex', gap: '1px' },
    badge: { width: '28px', height: '27px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '10px', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' },
    badgeBlue: { backgroundColor: '#135BE8' },
    badgeOrange: { backgroundColor: '#D27029', fontSize: '14px' },
    badgeLightBlue: { backgroundColor: '#4DA7FA', fontSize: '14px' },
    mileageLabel: { fontWeight: '600' }, 
    mileageValue: { fontWeight: '300' }, 
    mileageBadge: { 
        position: 'absolute', 
        bottom: '0', 
        right: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        color: 'white', 
        padding: '5px 10px', 
        fontSize: '11px', 
        textAlign: 'left', 
        lineHeight: 1.4, 
        borderTopLeftRadius: '10px',
    },
    cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative', zIndex: 1 }, 
    cardTitleWrapper: { position: 'relative', marginBottom: '12px', minHeight: '40px' },
    cardTitle: { 
        margin: 0, 
        fontSize: '16px', 
        fontWeight: '500', 
        lineHeight: 1.25, 
        height: '2.5em', 
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal',
        cursor: 'pointer',
        transition: 'color 0.2s ease', 
        color: '#333', 
    },
    cardTitleHover: { color: '#E30016' },
    fullTitleTooltip: {
        position: 'absolute',
        top: '-9px', 
        left: '-13px', 
        right: '-13px', 
        zIndex: 10, 
        backgroundColor: 'white',
        border: '1px solid #ddd',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        lineHeight: 1.25,
        pointerEvents: 'none',
    },
    cardLocationAndId: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px' },
    cardLocation: { color: '#00b33e', fontWeight: 'bold', textTransform: 'uppercase' },
    cardId: { color: '#838790' },
    cardFooter: { minHeight: '42px', position: 'relative', marginTop: 'auto' }, 
    priceInfo: { position: 'absolute', width: '100%', opacity: 1, transition: 'opacity 0.2s ease' },
    cardPriceRussiaWrapper: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', lineHeight: 1.1 },
    cardPriceRussia: { fontSize: '18px', fontWeight: '600', lineHeight: 1.1 },
    cardPriceDisclaimer: { fontSize: '10px', color: '#999ea6', lineHeight: 1.2, paddingTop: '3px' },
    cardPriceChinaWrapper: { fontSize: '10px', color: '#999ea6' },
    orderInfo: { position: 'absolute', width: '100%', opacity: 0, transition: 'opacity 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardPriceChinaFull: { fontSize: '18px', fontWeight: 'normal', lineHeight: 1.1 },
    orderButton: { 
        padding: '4px 16px', 
        backgroundColor: '#E30016', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        fontWeight: '600', 
        fontSize: '14px', 
        cursor: 'pointer', 
        pointerEvents: 'auto',
    },
};

export default BrandPage;