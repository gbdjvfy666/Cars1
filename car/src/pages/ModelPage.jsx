import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Базовый URL вашего бэкенд-сервера
const API_BASE_URL = 'http://localhost:4000';

// ======================= ФУНКЦИЯ ДЛЯ СБОРА ДОСТУПНЫХ ФИЛЬТРОВ =======================
const getAvailableFilters = (cars) => {
    const filters = {
        year: new Set(),
        engine_volume: new Set(),
        drivetrain: new Set(),
    };

    cars.forEach(car => {
        // Год: напрямую из данных (number -> string)
        if (car.year) filters.year.add(String(car.year));
        
        // Объем, л: используем engine_type и группируем
        const engineVolume = parseFloat(car.engine_type);
        if (engineVolume > 0) {
             if (engineVolume < 1.6) filters.engine_volume.add('до 1.6'); 
             if (engineVolume >= 1.6 && engineVolume < 2.0) filters.engine_volume.add('1.6 - 2.0');
             if (engineVolume >= 2.0 && engineVolume <= 2.5) filters.engine_volume.add('2.0 - 2.5');
             if (engineVolume > 2.5) filters.engine_volume.add('более 2.5');
        }
        
        // Привод: напрямую из данных (drivetrain)
        if (car.drivetrain) filters.drivetrain.add(car.drivetrain);
    });

    return {
        // Год: сортируем по убыванию
        year: Array.from(filters.year).sort((a, b) => parseInt(b) - parseInt(a)),
        // Объем: оставляем порядок по умолчанию или задаем статический порядок (см. ниже)
        engine_volume: Array.from(filters.engine_volume), 
        // Привод: сортируем по алфавиту
        drivetrain: Array.from(filters.drivetrain).sort(),
    };
};

// ======================= КОМПОНЕНТ ФИЛЬТРОВ =======================
const FilterBlock = ({ filters, onFilterChange, availableOptions }) => {
    const handleCheckboxChange = (group, value) => {
        const currentValues = filters[group] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(group, newValues);
    };

    // Статические опции для Объем, л и Привод для поддержания порядка
    const allEngineVolumeOptions = ['до 1.6', '1.6 - 2.0', '2.0 - 2.5', 'более 2.5'];
    const allDrivetrainOptions = ['4WD', 'RWD', 'FWD']; // Добавьте другие типы, если они есть в БД
    
    // Статические данные для Стоимости (для демонстрации)
    const priceOptions = [
        'до 1 млн', '1-2 млн', '2-3 млн', '3-4 млн', '4-5 млн', '5+ млн'
    ];

    // Функция для рендеринга чекбоксов
    const renderCheckboxes = (group, staticOptions) => {
        // Уникальные опции, доступные в данных, полученные из getAvailableFilters
        const activeOptions = availableOptions[group] || [];
        
        // Используем статические опции для порядка, но проверяем их доступность
        const optionsToRender = group === 'year' 
            ? activeOptions // Для года используем только доступные опции (потому что их много)
            : staticOptions; // Для остальных используем статический набор

        return (
            <div style={styles.checkboxWrapper}>
                {optionsToRender.map(value => {
                    const isAvailable = activeOptions.includes(value);
                    const isChecked = (filters[group] || []).includes(value);

                    return (
                        <label 
                            key={value} 
                            style={{ 
                                ...styles.checkboxLabel, 
                                opacity: isAvailable || isChecked ? 1 : 0.6,
                                color: isAvailable || isChecked ? '#333' : '#777', 
                                cursor: isAvailable ? 'pointer' : 'default',
                            }}
                        >
                            <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => isAvailable && handleCheckboxChange(group, value)} 
                                disabled={!isAvailable && !isChecked} // Отключаем, если недоступно И не выбрано
                                style={{ pointerEvents: isAvailable ? 'auto' : 'none', opacity: isAvailable || isChecked ? 1 : 0.4 }}
                            /> 
                            {value}
                        </label>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={styles.filterBlock}>
            {/* Год (динамический) */}
            <div style={styles.filterGroup}>
                <span style={styles.filterTitle}>Год</span>
                {renderCheckboxes('year')}
            </div>
            
            {/* Объем, л (динамический) */}
            <div style={styles.filterGroup}>
                <span style={styles.filterTitle}>Объем, л</span>
                {renderCheckboxes('engine_volume', allEngineVolumeOptions)}
            </div>
            
            {/* Привод (динамический) */}
            <div style={styles.filterGroup}>
                <span style={styles.filterTitle}>Привод</span>
                {renderCheckboxes('drivetrain', allDrivetrainOptions)}
            </div>
            
            {/* Стоимость (статическая) */}
            <div style={styles.filterGroup}>
                <span style={styles.filterTitle}>Стоимость</span>
                <div style={{...styles.checkboxWrapper, gridTemplateColumns: '1fr 1fr' }}>
                    {priceOptions.map(price => (
                        <label key={price} style={styles.checkboxLabel}>
                            <input type="checkbox" /> {price}
                        </label>
                    ))}
                </div>
            </div>
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
            {/* Оригинальный заголовок: обрезан */}
            <h3 
                style={{
                    ...styles.cardTitle,
                    ...(isHovered ? styles.cardTitleHover : {}), 
                }}
            >
                {carName}
            </h3>
            
            {/* ВСПЛЫВАЮЩИЙ ЭЛЕМЕНТ: Абсолютное позиционирование для избежания сдвигов. */}
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

    // Подготовка данных, убедимся, что все поля есть
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

    // Генерируем слагами для Link, если они не предоставлены
    const brandSlug = car.brand_slug || carData.brand.toLowerCase().replace(/\s+/g, '-');
    const modelSlug = car.model_slug || carData.model.toLowerCase().replace(/\s+/g, '-');

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
                    
                    {/* Иконки и бейджи (статическая демонстрация) */}
                    <div style={styles.cardBottomLeftIcons}><div style={styles.iconWrapper}><span style={styles.starIcon}>⭐</span></div></div>
                    <div style={styles.cardTopRightBadges}><div style={{...styles.badge, ...styles.badgeBlue}}><span>O<small>km</small></span></div><div style={{...styles.badge, ...styles.badgeOrange}} title="ТОП 3"><span>🏆</span></div><div style={{...styles.badge, ...styles.badgeLightBlue}}><span>4+💺</span></div></div>
                    
                    {/* КАРТОЧКА ПРОБЕГА: В ПРАВОМ НИЖНЕМ УГЛУ. */}
                    {carData.mileage >= 0 && (
                        <div style={styles.mileageBadge}>
                            <div><span style={styles.mileageLabel}>Пробег:</span> <span style={styles.mileageValue}>{carData.mileage.toLocaleString('ru-RU')} км</span></div>
                            <div><span style={styles.mileageLabel}>Год:</span> <span style={styles.mileageValue}>{carData.year}</span></div>
                        </div>
                    )}
                </div>
                <div style={styles.cardBody}>
                    {/* Заголовок с подсказкой */}
                    <TitleHoverWrapper carName={carData.name} />
                    
                    <div style={styles.cardLocationAndId}><span style={styles.cardLocation}>В НАЛИЧИИ В КИТАЕ</span><span style={styles.cardId}>ID: {carData.id}</span></div>
                    
                    <div style={styles.cardFooter}>
                        {/* Информация о цене */}
                        <div style={{...styles.priceInfo, opacity: isCardHovered ? 0 : 1, pointerEvents: isCardHovered ? 'none' : 'auto'}}>
                            <div style={styles.cardPriceRussiaWrapper}>
                                <div style={styles.cardPriceRussia}>~ {carData.price_russia.toLocaleString('ru-RU')} ₽</div>
                                <div style={styles.cardPriceDisclaimer}>цена в России<br/>(под ключ)</div>
                            </div>
                            <div style={styles.cardPriceChinaWrapper}>
                                <div style={styles.cardPriceChina}>{carData.price_china.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽ в Китае</div>
                            </div>
                        </div>
                        
                        {/* Кнопка "Заказать" (показывается при наведении) */}
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


// ======================= ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ МОДЕЛИ =======================
const ModelPage = () => {
    const { brandSlug, modelSlug } = useParams();
    
    // Используем modelName и brandName из carData, чтобы быть уверенными, что они есть
    const [pageInfo, setPageInfo] = useState({ brandName: brandSlug.toUpperCase(), modelName: modelSlug.toUpperCase() });
    const [allCarsForModel, setAllCarsForModel] = useState([]);
    const [displayedCars, setDisplayedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [availableFilters, setAvailableFilters] = useState({ year: [], engine_volume: [], drivetrain: [] });

    // Стейт для хранения логотипа и баннера
    const [brandLogo, setBrandLogo] = useState("");
    const [headerImages, setHeaderImages] = useState([]);


    const handleFilterChange = (group, values) => {
        setFilters(prev => ({ ...prev, [group]: values }));
    };


    // -----------------------------------------------------------
    // ЭФФЕКТ 1: Загрузка всех данных с бэкенда при смене URL
    // -----------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Загрузка всех машин по BrandSlug
                const carsResponse = await fetch(`${API_BASE_URL}/api/cars/${brandSlug}`);
                if (!carsResponse.ok) throw new Error("Failed to fetch cars");
                let cars = await carsResponse.json();

                // 2. Фильтруем по ModelSlug, так как API возвращает все машины бренда
                cars = cars.filter(car => car.model && car.model.toLowerCase() === modelSlug.toLowerCase());

                if (cars.length === 0) {
                    console.log(`Модель '${modelSlug}' не найдена или нет данных.`);
                    setAllCarsForModel([]);
                    setLoading(false);
                    return;
                }
                
                // 3. Загрузка информации о бренде (для названия и логотипа)
                const brandResponse = await fetch(`${API_BASE_URL}/api/brands/${brandSlug}`);
                if (!brandResponse.ok) throw new Error("Failed to fetch brand info");
                const brandInfo = await brandResponse.json();

                // 4. Обновление PageInfo, логотипов и изображений
                setPageInfo({
                    brandName: brandInfo.name || brandSlug.toUpperCase(),
                    modelName: cars[0].model || modelSlug.toUpperCase(),
                });
                
                // Используем mock-данные для headerImages, так как API их не предоставляет
                setBrandLogo(brandInfo.img_src || "https://placehold.co/50x50/333333/ffffff?text=Logo");
                setHeaderImages(["https://i.ibb.co/bzzx45G/l7-1.png", "https://i.ibb.co/Y0dmyhJ/l7-2.png"]); // Mock images

                // 5. Установка данных и доступных фильтров
                setAllCarsForModel(cars);
                setAvailableFilters(getAvailableFilters(cars));

            } catch (err) {
                console.error("Ошибка при загрузке данных с API:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [brandSlug, modelSlug]);


    // -----------------------------------------------------------
    // ЭФФЕКТ 2: Применение фильтрации
    // -----------------------------------------------------------
    useEffect(() => {
        let cars = [...allCarsForModel];
        
        // 1. Фильтр по Году
        if (filters.year && filters.year.length > 0) {
            cars = cars.filter(c => filters.year.includes(String(c.year)));
        }

        // 2. Фильтр по Объем, л
        if (filters.engine_volume && filters.engine_volume.length > 0) {
            cars = cars.filter(c => {
                const volume = parseFloat(c.engine_type); 
                if (isNaN(volume)) return false; 
                
                let matches = false;
                if (filters.engine_volume.includes('до 1.6') && volume < 1.6) matches = true;
                if (filters.engine_volume.includes('1.6 - 2.0') && volume >= 1.6 && volume < 2.0) matches = true;
                if (filters.engine_volume.includes('2.0 - 2.5') && volume >= 2.0 && volume <= 2.5) matches = true;
                if (filters.engine_volume.includes('более 2.5') && volume > 2.5) matches = true;
                
                return matches;
            });
        }

        // 3. Фильтр по Приводу
        if (filters.drivetrain && filters.drivetrain.length > 0) {
            cars = cars.filter(c => filters.drivetrain.includes(c.drivetrain));
        }

        // To-Do: Реализовать фильтрацию по Стоимости (price)

        setDisplayedCars(cars);
    }, [filters, allCarsForModel]);

    if (loading) return <div style={styles.centeredMessage}>Загрузка данных с сервера...</div>;

    if (allCarsForModel.length === 0) return <div style={styles.centeredMessage}>Извините, для модели **{pageInfo.modelName}** пока нет предложений.</div>;


    // Расчеты для вкладок
    const countAll = allCarsForModel.length;
    const countNew = allCarsForModel.filter(c => c.mileage < 1000).length;
    const countUsed = countAll - countNew;

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadcrumbLink}>🏠</Link> / 
                <Link to={`/cars/${brandSlug}`} style={styles.breadcrumbLink}>{pageInfo.brandName.toUpperCase()}</Link> / 
                {pageInfo.modelName.toUpperCase()}
            </div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Купить {pageInfo.brandName} {pageInfo.modelName}</h1>
                <div style={styles.headerImages}>
                    {headerImages[0] && <img src={headerImages[0]} alt="Header 1" style={styles.headerImage} />}
                    {headerImages[1] && <img src={headerImages[1]} alt="Header 2" style={styles.headerImage} />}
                </div>
            </div>
            
            <FilterBlock filters={filters} onFilterChange={handleFilterChange} availableOptions={availableFilters} />
            
            <div style={styles.tabsContainer}>
                <div style={styles.tabs}>
                    <button onClick={() => {}} style={styles.activeTab}>Все ({displayedCars.length} из {countAll})</button>
                    <button onClick={() => {}} style={styles.tab}>Новые ({countNew})</button>
                    <button onClick={() => {}} style={styles.tab}>С пробегом ({countUsed})</button>
                </div>
                <button style={styles.compareButton}>❤️ Сравнить все комплектации</button>
            </div>
            
            <div style={styles.resultsGrid}>
                {displayedCars.length > 0 ? (
                    displayedCars.map(car => <CarCard key={car.id} car={car} />)
                ) : (
                    <div style={{gridColumn: 'span 4', textAlign: 'center', padding: '50px'}}>
                        Нет автомобилей, соответствующих выбранным фильтрам.
                    </div>
                )}
            </div>
        </div>
    );
};

// ======================= СТИЛИ =======================
const styles = {
    page: { maxWidth: '1280px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#fff', color: '#333' },
    centeredMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '24px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', color: '#888', marginBottom: '20px', fontSize: '14px' },
    breadcrumbLink: { textDecoration: 'none', color: '#555' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    pageTitle: { fontSize: '28px', fontWeight: 'bold' },
    headerImages: { display: 'flex', gap: '10px' },
    headerImage: { width: '150px', height: '100px', objectFit: 'cover', borderRadius: '12px' },
    filterBlock: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '12px', marginBottom: '30px' },
    filterGroup: {},
    filterTitle: { fontWeight: '500', marginBottom: '10px', display: 'block' },
    checkboxWrapper: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    checkboxLabel: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '5px', 
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    tabsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    tabs: { display: 'flex', gap: '10px' },
    tab: { padding: '8px 16px', fontSize: '14px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', borderRadius: '20px', cursor: 'pointer', color: '#555' },
    activeTab: { padding: '8px 16px', fontSize: '14px', border: '1px solid #E30016', backgroundColor: '#E30016', color: 'white', borderRadius: '20px', cursor: 'pointer' },
    compareButton: { color: '#E30016', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
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
        padding: '5px 10px 5px 10px', 
        fontSize: '11px', 
        textAlign: 'left', 
        lineHeight: 1.4, 
        borderTopLeftRadius: '10px',
        borderBottomRightRadius: '0', 
        borderBottomLeftRadius: '0',
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
        whiteSpace: 'normal',
        wordBreak: 'break-word', 
        color: '#E30016', 
        pointerEvents: 'none',
        width: 'auto',
    },
    cardLocationAndId: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px' },
    cardLocation: { color: '#00b33e', fontWeight: 'bold', textTransform: 'uppercase' },
    cardId: { color: '#838790' },
    cardFooter: { minHeight: '42px', position: 'relative', marginTop: 'auto' }, 
    priceInfo: { position: 'absolute', width: '100%', opacity: 1, transition: 'opacity 0.2s ease', pointerEvents: 'none' },
    cardPriceRussiaWrapper: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', lineHeight: 1.1 },
    cardPriceRussia: { fontSize: '18px', fontWeight: '600', lineHeight: 1.1 },
    cardPriceDisclaimer: { fontSize: '10px', color: '#999ea6', lineHeight: 1.2, paddingTop: '3px' },
    cardPriceChinaWrapper: { fontSize: '10px', color: '#999ea6' },
    orderInfo: { position: 'absolute', width: '100%', opacity: 0, transition: 'opacity 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' },
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
        transition: 'background-color 0.2s, color 0.2s, border 0.2s',
        '&:hover': { backgroundColor: 'white', color: '#E30016', border: '1px solid #E30016' }
    },
};

export default ModelPage;
