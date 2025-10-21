import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CarCard from '../components/CarCard'; // Импортируем вынесенный компонент

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const ALL_CARS_KEY = 'all';
const ICON_PLACEHOLDER = 'https://placehold.co/50x50/333333/ffffff?text=Logo';

const COLORS = {
    primary: '#E30016',     // Красный акцент
    secondary: '#00b33e',   // Зеленый для "В наличии"
    background: '#FFFFFF',
    pageBackground: '#F7F7F7', // Светлый фон страницы
    border: '#EAEAEA',      // Светло-серый для границ
    shadow: 'rgba(0, 0, 0, 0.05)', // Легкая тень
    textPrimary: '#1A1A1A', // Глубокий черный
    textSecondary: '#555555', // Серый текст
    textMuted: '#999999',   // Бледный текст/идентификаторы
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

    const handleReset = () => {
         setFilters(prev => ({
            ...prev,
            model: '', type: 'all', engineType: '', yearFrom: '', yearTo: '',
            drivetrain: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '',
        }));
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
                    {/* Бренд - неактивен */}
                    <select disabled style={{...styles.select, backgroundColor: COLORS.pageBackground, color: COLORS.textPrimary, fontWeight: '600'}}>
                        <option>{brandName}</option>
                    </select>
                    
                    {/* Модель */}
                    <select name="model" value={filters.model} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Модель</option>
                        {models.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
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

const ModelList = ({ models, brandSlug }) => {
    const totalCount = models.reduce((acc, model) => acc + model.count, 0);
    const allModels = [
        { name: 'Все модели', slug: ALL_CARS_KEY, count: totalCount, isAll: true },
        ...models
    ];

    return (
        <div style={styles.modelListContainer}>
            {allModels.map(model => (
                <Link 
                    to={model.isAll ? `/cars/${brandSlug}` : `/cars/${brandSlug}/${model.slug}`} 
                    key={model.slug} 
                    style={{
                        ...styles.modelItem,
                        ...(model.isAll && useParams().modelSlug !== ALL_CARS_KEY && !useParams().modelSlug) 
                            ? styles.modelItemActive 
                            : (useParams().modelSlug === model.slug ? styles.modelItemActive : {})
                    }}
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

    const breadcrumbItems = [
        { label: displayBrandName, to: `/cars/${brandSlug}` }
    ];

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px'}}>Загрузка...</div>;
    }
    if (error) {
        return <div style={{padding: '50px', color: COLORS.primary, fontSize: '18px'}}>{error}</div>;
    }

    return (
        <div style={styles.page}>
            <div style={styles.pageContent}> 
                <Breadcrumbs items={breadcrumbItems} />
                
                <h1 style={styles.pageTitleContainer}>
                    {brandIconUrl && (
                        <img 
                            src={brandIconUrl} 
                            alt={`${displayBrandName} logo`} 
                            style={styles.brandIcon} 
                            onError={(e) => { e.target.onerror = null; e.target.src = ICON_PLACEHOLDER; }}
                        />
                    )}
                    <span style={styles.pageTitleText}> {displayBrandName}</span>
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
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px', fontSize: '18px', color: COLORS.textMuted}}>
                            К сожалению, по выбранным фильтрам машин не найдено.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ======================= НОВЫЕ СТИЛИ (ОБНОВЛЕНЫ) =======================
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
    pageTitleContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        backgroundColor: COLORS.background,
        border: `1px solid ${COLORS.border}`,
        padding: '15px 20px', 
        borderRadius: '8px', 
        marginBottom: '25px',
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
    modelListContainer: { 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px 30px', 
        padding: '15px 0 25px 0', 
        borderBottom: `1px solid ${COLORS.border}`, 
        marginBottom: '30px' 
    },
    modelItem: { 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '5px', 
        textDecoration: 'none', 
        color: COLORS.textSecondary, 
        paddingBottom: '5px', 
        borderBottom: `2px solid transparent`,
        transition: 'color 0.2s, border-bottom 0.2s',
    },
    modelItemActive: {
        color: COLORS.primary,
        borderBottom: `2px solid ${COLORS.primary}`,
        fontWeight: '600',
    },
    modelName: { 
        fontSize: '16px', 
        fontWeight: '500',
        color: 'inherit',
    },
    modelNameAll: { 
        fontWeight: '700' 
    },
    modelCount: { 
        color: COLORS.textMuted, 
        fontSize: '12px', 
        fontWeight: '400' 
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
};

export default BrandPage;