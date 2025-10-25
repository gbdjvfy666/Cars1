import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../other/Breadcrumbs';
import CarCard from '../components/CarCard';
import FilterBar from '../components/FilterBar';

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const ALL_CARS_KEY = 'all';
const ICON_PLACEHOLDER = 'https://placehold.co/50x50/333333/ffffff?text=Logo';

const COLORS = {
    primary: '#E30016',
    secondary: '#00b33e',
    background: '#242424',
    pageBackground: '#131313',
    border: '#444444',
    shadow: 'rgba(0, 0, 0, 0.3)',
    textPrimary: '#f0f0f0',
    textSecondary: '#bbbbbb',
    textMuted: '#888888',
};

const slugify = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s/g, '-');
};

// ======================= МЕЛКИЕ КОМПОНЕНТЫ =======================
const ModelList = ({ models, brandSlug }) => {
    const totalCount = models.reduce((acc, model) => acc + model.count, 0);
    const allModels = [
        { name: 'Все модели', slug: ALL_CARS_KEY, count: totalCount, isAll: true },
        ...models
    ];
    const { modelSlug: activeModelSlug } = useParams();

    return (
        <div style={styles.modelListContainer}>
            {allModels.map(model => {
                const isActive = (!activeModelSlug && model.isAll) || activeModelSlug === model.slug;
                return (
                    <Link 
                        to={model.isAll ? `/cars/${brandSlug}` : `/cars/${brandSlug}/${model.slug}`} 
                        key={model.slug} 
                        style={{
                            ...styles.modelItem,
                            ...(isActive ? styles.modelItemActive : {})
                        }}
                    >
                        <span style={{...styles.modelName, ...(model.isAll ? styles.modelNameAll : {})}}>
                            {model.name}
                        </span>
                        <span style={styles.modelCount}>
                            {model.count}
                        </span>
                    </Link>
                );
            })}
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

    // [ИЗМЕНЕНИЕ 1/4]: Добавляем состояние для управления видом отображения
    const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'list'

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

    // [ИЗМЕНЕНИЕ 2/4]: Функция для динамической стилизации контейнера с карточками
    const getResultsContainerStyles = (mode) => {
        if (mode === 'list') {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            };
        }
        // 'grid'
        return styles.resultsGrid; // Возвращаем стили из основного объекта
    };

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px', color: COLORS.textPrimary}}>Загрузка...</div>;
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
                    // [ИЗМЕНЕНИЕ 3/4]: Передаем состояние и функцию для его изменения в FilterBar
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                />
                
                {/* [ИЗМЕНЕНИЕ 4/4]: Контейнер с результатами теперь использует динамические стили */}
                <div style={getResultsContainerStyles(viewMode)}>
                    {displayedCars.length > 0 ? (
                        displayedCars.map(car => 
                            <CarCard 
                                key={car.id} 
                                car={car} 
                                view={viewMode} // <-- Передаем проп view в каждую карточку!
                            />)
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

// ... (стили остаются такими же)
const styles = {
    page: { 
        minHeight: '100vh', 
        backgroundColor: COLORS.pageBackground, 
        backgroundImage: 'radial-gradient(circle at 70% 20%, #2a2a2a 0%, #131313 64%)',
        backgroundAttachment: 'fixed', 
        backgroundRepeat: 'no-repeat',
        padding: '40px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        color: COLORS.textPrimary,
    },
    pageContent: {
        maxWidth: '1360px', 
        margin: '0 auto', 
        padding: '0 20px 40px 20px', 
        paddingBottom: '40px',
        paddingTop: '0', 
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
        backgroundColor: '#333333',
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
        color: 'white',
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
        color: COLORS.textPrimary,
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