import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';


// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const ALL_CARS_KEY = 'all';
// Нейтральная заглушка, если логотип не найден
const ICON_PLACEHOLDER = 'https://placehold.co/32x32/e0e0e0/e0e0e0.png'; 

// Хелпер для форматирования чисел
const formatPrice = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // Добавляем пробелы как разделители тысяч
    return value.toLocaleString('ru-RU');
};

// Хелпер для создания URL-адреса (slug) из текста
const slugify = (text) => {
    if (!text) return '';
    // Преобразуем в нижний регистр и заменяем пробелы на дефисы
    return text.toLowerCase().replace(/\s/g, '-');
};

// ======================= МЕЛКИЕ КОМПОНЕНТЫ =======================

const FilterBar = ({ filters, setFilters, cars, models, brandName }) => {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Собираем уникальные значения для выпадающих списков, включая машины, 
    // отфильтрованные по текущему типу (All, New, Used)
    const filteredCarsByType = cars.filter(car => {
        if (filters.type === 'new') return car.mileage === 0 || car.mileage === null;
        if (filters.type === 'used') return car.mileage > 0;
        return true;
    });

    const uniqueValues = (key) => [...new Set(filteredCarsByType.map(car => car[key]).filter(Boolean))].sort();

    const engineTypes = uniqueValues('engine_type'); // Используем engine_type из JSON
    const drivetrains = uniqueValues('drivetrain');

    return (
        <div style={styles.filterBar}>
            {/* Ряд 1: Тип, Популярность, Сброс */}
            <div style={styles.filterRowTop}>
                {/* Кнопки выбора типа машины (Все/Новые/С пробегом) */}
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

                {/* Выбор популярности и Сброс */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select style={{...styles.select, minWidth: '180px'}}><option>по популярности</option></select>
                    <button style={styles.resetButton}>Сбросить ✕</button>
                </div>
            </div>

            {/* Ряд 2: Основные фильтры */}
            <div style={styles.filterRowBottom}>
                <div style={styles.filterInputGroup}>
                    {/* Бренд - не меняется на этой странице */}
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

                {/* Ряд 3: Цена и Кнопка */}
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
    // Вычисляем общее количество машин
    const totalCount = models.reduce((acc, model) => acc + model.count, 0);

    // Добавляем "Все" в начало списка
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


// ======================= КАРТОЧКА МАШИНЫ =======================

const CarCard = ({ car }) => {
    // URL для перехода на детальную страницу в формате: /cars/:brandSlug/:modelSlug/:carId
    const brandSlug = slugify(car.brand);
    const modelSlug = slugify(car.model);
    const carDetailUrl = `/cars/${brandSlug}/${modelSlug}/${car.id}`; 
    
    const isNew = car.mileage === 0 || car.mileage === null;
    const nameDisplay = (car.name_rus || (car.brand || '') + ' ' + (car.model || '') + ' ' + (car.year || '')).trim();

    // Используем первое изображение из массива 'images' для карточки
    const imgSrc = car.images?.[0] || 'https://placehold.co/400x200/cccccc/333333?text=Нет+фото';
    
    // Цена в долларах (для отображения под крупной ценой)
    const priceChinaDisplay = car.price_china && car.price_russia 
        ? `${formatPrice(car.price_china)} $ (под ключ в Китае)`
        : 'Цена в Китае: N/A';

    return (
        <Link to={carDetailUrl} style={styles.cardLink}>
            <div style={styles.card}>
                {/* 1. Изображение */}
                <div style={styles.cardImageContainer}>
                    <img 
                        src={imgSrc} 
                        alt={nameDisplay} 
                        style={styles.cardImage} 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/cccccc/333333?text=Нет+фото'; }}
                    />
                    
                    {/* МЕТКИ: Верхний левый угол */}
                    <div style={styles.badgeTopLeft}>
                        {/* Знак "Новый" или "БУ" */}
                        <div style={{...styles.flagIcon, ...(isNew ? styles.badgeNew : styles.badgeUsed)}}>
                            {isNew ? 'Н' : 'Б/У'}
                        </div> 
                        {/* Другие иконки (добавляем 4WD с другим цветом) */}
                        {car.drivetrain && car.drivetrain.toUpperCase() === '4WD' && 
                            <div style={{...styles.flagIcon, ...styles.badge4WD}}>4WD</div>
                        }
                    </div>

                    {/* МЕТКИ: Верхний правый угол */}
                    <div style={styles.badgeTopRight}>
                        {/* Год */}
                        {car.year && (
                            <span style={styles.badgeYearSmall}>
                                {car.year}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Текстовое тело */}
                <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{nameDisplay}</h3>
                    
                    {/* Метка "В наличии" и ID */}
                    <div style={styles.cardLocationAndId}>
                        <span style={styles.availableText}>В НАЛИЧИИ В КИТАЕ</span> 
                        <span style={styles.idText}>ID: {car.id}</span>
                    </div>

                    {/* ЦЕНА */}
                    <div style={styles.cardPriceBlock}>
                        {/* Цена в рублях (Крупно) */}
                        <div style={styles.priceRussia}>
                            ~ <span style={{fontWeight: 'bold'}}>{formatPrice(car.price_russia)} ₽</span>
                        </div>
                        {/* Цена в долларах (Мелко, внизу) */}
                        <div style={styles.priceChina}>
                            {priceChinaDisplay}
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
    
    const [allCars, setAllCars] = useState([]); // Все машины для данного бренда, полученные с API
    const [brandIconUrl, setBrandIconUrl] = useState(''); // URL иконки бренда (динамический)
    const [brandName, setBrandName] = useState(''); // Отображаемое имя бренда
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        model: modelSlug === ALL_CARS_KEY ? '' : modelSlug || '', 
        type: 'all', // 'all', 'new', 'used'
        engineType: '', yearFrom: '', yearTo: '',
        drivetrain: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '',
        count: 0,
    });
    
    const [displayedCars, setDisplayedCars] = useState([]);

    // ----------------------------------------------------------------
    // ЭФФЕКТ 1: Загрузка данных (машины + бренд) при изменении brandSlug
    // ----------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Запрос данных о БРЕНДЕ для получения img_src и name
                const [brandResponse, carsResponse] = await Promise.all([
                    // Предполагаемый API-маршрут для брендов
                    fetch(`http://localhost:4000/api/brands/${brandSlug}`), 
                    // API-маршрут для машин
                    fetch(`http://localhost:4000/api/cars/${brandSlug}`) 
                ]);
                
                // --- Обработка ответа БРЕНДА ---
                if (brandResponse.ok) {
                    const brandData = await brandResponse.json();
                    
                    // Предполагаем, что brandData содержит img_src и name
                    setBrandIconUrl(brandData.img_src || ICON_PLACEHOLDER);
                    setBrandName(brandData.name || (brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1))); 
                } else {
                    console.error(`Ошибка HTTP при загрузке данных бренда: ${brandResponse.status}`);
                    setBrandIconUrl(ICON_PLACEHOLDER);
                    // Используем заголовок из URL, если API не вернул имя
                    setBrandName(brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)); 
                }

                // --- Обработка ответа МАШИН ---
                if (!carsResponse.ok) {
                    throw new Error(`Ошибка HTTP при загрузке списка машин: ${carsResponse.status}`);
                }

                const carsData = await carsResponse.json();
                
                // Временно исправляем проблему с данными (добавляем brand из brandName)
                const carsWithBrand = carsData.map(car => ({
                    ...car,
                    brand: brandName // Используем имя бренда, полученное выше
                }));
                
                setAllCars(carsWithBrand); // Сохраняем все полученные машины
                
                // Устанавливаем начальный фильтр по модели, если она указана в URL
                setFilters(prev => ({
                    ...prev,
                    model: modelSlug === ALL_CARS_KEY ? '' : modelSlug || '',
                    count: carsData.length, // Начальный подсчет
                }));

            } catch (err) {
                console.error("Общая ошибка загрузки данных:", err);
                setError(`Не удалось загрузить данные для бренда "${brandSlug}". Проверьте, запущен ли бэкенд и корректны ли API-маршруты (/api/brands/:slug и /api/cars/:slug).`);
                setBrandIconUrl(ICON_PLACEHOLDER);
                setBrandName(brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [brandSlug, modelSlug]); // Срабатывает при смене бренда или модели в URL

    // ----------------------------------------------------------------
    // МЕМОИЗАЦИЯ: Группировка моделей (для ModelList)
    // ----------------------------------------------------------------
    const modelsGrouped = useMemo(() => {
        if (allCars.length === 0) return [];
        
        const modelsMap = allCars.reduce((acc, car) => {
            const modelName = car.model || 'Unknown Model'; 
            const modelSlug = car.model ? slugify(car.model) : 'unknown';

            if (!acc[modelSlug]) {
                acc[modelSlug] = { name: modelName, slug: modelSlug, count: 0 };
            }
            acc[modelSlug].count += 1;
            return acc;
        }, {});

        return Object.values(modelsMap).sort((a, b) => b.count - a.count);

    }, [allCars]);

    // ----------------------------------------------------------------
    // ЭФФЕКТ 2: Фильтрация данных при изменении фильтров или allCars
    // ----------------------------------------------------------------
    useEffect(() => {
        if (allCars.length === 0 && !isLoading) {
            setDisplayedCars([]);
            setFilters(prev => ({...prev, count: 0}));
            return;
        }

        let filtered = [...allCars];

        // 1. Фильтр по типу (Все/Новые/С пробегом)
        if (filters.type === 'new') filtered = filtered.filter(c => c.mileage === 0 || c.mileage === null);
        if (filters.type === 'used') filtered = filtered.filter(c => c.mileage > 0);


        // 2. Фильтр по модели (из URL или селектора)
        if (filters.model) filtered = filtered.filter(c => c.model && slugify(c.model) === filters.model);

        // 3. Другие фильтры
        if (filters.engineType) filtered = filtered.filter(c => c.engine_type === filters.engineType); // Используем engine_type
        if (filters.drivetrain) filtered = filtered.filter(c => c.drivetrain === filters.drivetrain); 
        if (filters.yearFrom) filtered = filtered.filter(c => c.year >= parseInt(filters.yearFrom));
        if (filters.yearTo) filtered = filtered.filter(c => c.year <= parseInt(filters.yearTo));
        if (filters.priceFrom) filtered = filtered.filter(c => c.price_russia >= parseInt(filters.priceFrom));
        if (filters.priceTo) filtered = filtered.filter(c => c.price_russia <= parseInt(filters.priceTo));
        if (filters.mileageFrom) filtered = filtered.filter(c => c.mileage >= parseInt(filters.mileageFrom));
        if (filters.mileageTo) filtered = filtered.filter(c => c.mileage <= parseInt(filters.mileageTo));

        setDisplayedCars(filtered);
        setFilters(prev => ({...prev, count: filtered.length}));

    }, [
        filters.model, filters.type, filters.engineType, filters.drivetrain, 
        filters.yearFrom, filters.yearTo, filters.priceFrom, filters.priceTo, 
        filters.mileageFrom, filters.mileageTo, allCars, isLoading
    ]);
    
    // ----------------------------------------------------------------
    // РЕНДЕР: Отображение состояния загрузки/ошибки/данных
    // ----------------------------------------------------------------

    // Форматирование заголовка (например, 'lixiang' -> 'LiXiang' если имя не пришло из БД)
    const displayBrandName = brandName || (brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)); 

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px'}}>
            <span style={{animation: 'spin 1s linear infinite', display: 'inline-block'}}>⚙️</span> Загрузка автомобилей...
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>;
    }

    if (error) {
        return <div style={{padding: '50px', color: '#E30016', fontSize: '18px'}}>
            {error}
        </div>;
    }

    // Главное представление
    return (
        <div style={styles.page}>
            {/* Хедер (шапка) - имитируем по скриншоту */}
            <header style={styles.header}>
                <div style={styles.headerNav}>
                    <a href="#" style={styles.headerLink}>Отзывы</a>
                    <a href="#" style={styles.headerLink}>FAQ</a>
                    <a href="#" style={styles.headerLink}>О компании</a>
                    <a href="#" style={styles.headerLink}>Контакты</a>
                </div>
            </header>

            <div style={styles.contentArea}>
                {/* 1. Хлебные крошки и Заголовок */}
                <div style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadcrumbLink}>🏠</Link> / {displayBrandName}
                </div>
                
                <h1 style={styles.pageTitleContainer}>
                    {/* Иконка бренда, загружаемая по реальному API-запросу */}
                    {brandIconUrl && (
                        <img 
                            src={brandIconUrl} 
                            alt={`${displayBrandName} logo`} 
                            style={styles.brandIcon} 
                            onError={(e) => { e.target.onerror = null; e.target.src = ICON_PLACEHOLDER; }} // Заглушка
                        />
                    )}
                    <span style={styles.pageTitleText}>Купить {displayBrandName}</span>
                </h1>
                
                {/* 2. Список моделей */}
                <ModelList models={modelsGrouped} brandSlug={brandSlug} />
                
                {/* 3. Панель фильтров */}
                <FilterBar 
                    filters={filters} 
                    setFilters={setFilters} 
                    cars={allCars} 
                    models={modelsGrouped}
                    brandName={displayBrandName}
                />
                
                {/* 4. Результаты */}
                <div style={styles.resultsGrid}>
                    {displayedCars.length > 0 ? (
                        displayedCars.map(car => <CarCard key={car.id} car={car} />)
                    ) : (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px', fontSize: '18px', color: '#999'}}>
                            К сожалению, по выбранным фильтрам ({displayBrandName}) машин не найдено.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ======================= СТИЛИ =======================

const styles = {
    // Общие стили и макет страницы
    page: { minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Inter, sans-serif' },
    contentArea: { maxWidth: '1280px', margin: '0 auto', padding: '0 20px 40px 20px', backgroundColor: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.05)' },

    // Хедер
    header: { padding: '15px 0', borderBottom: '1px solid #eee', backgroundColor: '#fff', marginBottom: '20px' },
    headerNav: { maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end', gap: '30px' },
    headerLink: { textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'color 0.2s', ':hover': { color: '#E30016' } },

    // Хлебные крошки
    breadcrumb: { padding: '20px 0 10px 0', color: '#888', fontSize: '14px' },
    breadcrumbLink: { textDecoration: 'none', color: '#888', marginRight: '5px' },

    // Заголовок страницы
    pageTitleContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        backgroundColor: '#fde9eb', // Светло-красный фон
        padding: '15px 20px', 
        borderRadius: '8px', 
        fontSize: '24px', 
        fontWeight: 'normal',
        marginBottom: '25px',
    },
    brandIcon: {
        width: '32px', // Размер логотипа
        height: '32px', // Размер логотипа
        objectFit: 'contain',
        backgroundColor: 'white', // Добавляем белый фон для пустой заглушки
        borderRadius: '4px',
    },
    pageTitleText: { fontSize: '24px', fontWeight: 'bold', color: '#333' },

    // Список моделей (навигация)
    modelListContainer: { 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px 30px', 
        padding: '15px 0 25px 0', 
        borderBottom: '1px solid #eee', 
        marginBottom: '20px' 
    },
    modelItem: { 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '5px', 
        textDecoration: 'none', 
        color: '#333',
        paddingBottom: '5px',
        borderBottom: '2px solid transparent',
        transition: 'border-color 0.2s, color 0.2s',
        ':hover': { borderBottomColor: '#E30016', color: '#E30016' }
    },
    modelName: { fontSize: '14px', fontWeight: '500' },
    modelNameAll: { fontWeight: 'bold' },
    modelCount: { color: '#999', fontSize: '12px', fontWeight: 'normal' },

    // Панель фильтров
    filterBar: { marginBottom: '30px' },
    filterRowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    filterRowBottom: { display: 'flex', flexDirection: 'column', gap: '10px' },
    filterInputGroup: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' },
    filterRowPriceAndButton: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' },
    
    // Кнопки типа машины
    typeButtons: {
        display: 'flex',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #E30016',
    },
    typeButton: {
        padding: '8px 15px',
        backgroundColor: 'white',
        color: '#E30016',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
        flexGrow: 1,
        minWidth: '100px',
    },
    activeTypeButton: {
        backgroundColor: '#E30016',
        color: 'white',
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '14px',
    },

    // Инпуты и селекты
    select: { 
        padding: '8px 12px', 
        borderRadius: '4px', 
        border: '1px solid #ccc', 
        minWidth: '150px', 
        fontSize: '14px',
        flexGrow: 1,
        backgroundColor: 'white'
    },
    inputRangeContainer: { 
        display: 'flex', 
        gap: '1px', 
        flexGrow: 1,
        minWidth: '150px' 
    },
    inputRange: { 
        padding: '8px 12px', 
        border: '1px solid #ccc', 
        fontSize: '14px',
        flex: 1,
    },
    showButton: { 
        padding: '10px 30px', 
        backgroundColor: '#E30016', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        fontWeight: 'bold', 
        fontSize: '16px', 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        minWidth: '200px',
    },
    
    // Сетка результатов
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    
    // Стили для карточки CarCard
    cardLink: { 
        textDecoration: 'none', 
        color: 'inherit',
        display: 'block',
        transition: 'box-shadow 0.3s, transform 0.1s',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        ':hover': {
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
        }
    },
    card: { 
        border: '1px solid #eee', 
        borderRadius: '8px', 
        backgroundColor: '#fff', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column'
    },
    cardImageContainer: {
        position: 'relative',
        height: '200px',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    cardImage: { 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        display: 'block'
    },
    
    // Метки на изображении
    badgeTopRight: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '5px',
    },
    badgeTopLeft: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        display: 'flex',
        gap: '5px',
    },
    flagIcon: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        padding: '3px 6px',
        borderRadius: '4px',
        lineHeight: '1',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        textTransform: 'uppercase'
    },
    badgeNew: { backgroundColor: '#00cc66' }, // Зеленый для Новых
    badgeUsed: { backgroundColor: '#E30016' }, // Красный для Б/У
    badge4WD: { backgroundColor: '#0056b3' }, // Темно-синий для 4WD

    badgePriceChinaSmall: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '3px 6px',
        borderRadius: '4px',
        fontSize: '11px',
    },
    badgeYearSmall: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '3px 6px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
    },

    // Тело карточки
    cardBody: { 
        padding: '15px', 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1 
    },
    cardTitle: { 
        margin: '0 0 8px 0', // Уменьшил нижний отступ
        fontSize: '16px', // Немного увеличил шрифт
        fontWeight: 'bold', 
        lineHeight: '1.3',
        minHeight: '40px',
        color: '#333'
    },
    cardLocationAndId: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        fontSize: '12px',
        fontWeight: '500',
    },
    availableText: {
        color: '#007bff', // Синий
        fontWeight: 'bold',
    },
    idText: {
        color: '#999', // Серый цвет для ID
    },
    cardPriceBlock: {
        marginTop: 'auto', 
        paddingTop: '10px',
        borderTop: '1px solid #eee', // Добавил разделитель
    },
    priceRussia: { 
        fontSize: '22px', // Увеличил для акцента
        fontWeight: 'normal', // Сделаю bold внутренним span'ом для ясности
        color: '#E30016', 
        marginBottom: '2px' 
    },
    priceChina: {
        fontSize: '11px',
        color: '#999',
        fontWeight: 'normal',
    }
};

export default BrandPage;
