import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CarCard from '../components/CarCard'; 
import FilterBar from '../components/FilterBar'; // <-- 💡 ИМПОРТИРУЕМ НОВЫЙ КОМПОНЕНТ

// ======================= КОНСТАНТЫ И ХЕЛПЕРЫ =======================

const API_BASE_URL = 'http://localhost:4000';
const ICON_PLACEHOLDER = 'https://placehold.co/50x50/333333/ffffff?text=Logo';

// 💡 Цвета для темной темы
const COLORS = {
    primary: '#E30016',
    secondary: '#00b33e',
    background: '#1C1C1C', 
    pageBackground: '#131313', 
    border: '#333333', 
    shadow: 'rgba(0, 0, 0, 0.4)', 
    textPrimary: '#F0F0F0', 
    textSecondary: '#CCCCCC',
    textMuted: '#888888',
};

// ======================= КОМПОНЕНТ ФИЛЬТРОВ (УДАЛЕН - теперь в FilterBar.js) =======================
// ... (Этот раздел удален)
// ===================================================================================================


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
                const [brandResponse, carsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/brands/${brandSlug}`), 
                    fetch(`${API_BASE_URL}/api/cars/${brandSlug}`) 
                ]);

                let brandData = {};
                if (brandResponse.ok) {
                    brandData = await brandResponse.json();
                }

                if (!carsResponse.ok) throw new Error(`Ошибка HTTP: ${carsResponse.status}`);
                let allCarsForBrand = await carsResponse.json();

                const modelCars = allCarsForBrand.filter(car => 
                    car.model && car.model.toLowerCase().replace(/\s/g, '-') === modelSlug
                );
                
                if (modelCars.length === 0) {
                    setError(`Для модели ${modelSlug} пока нет предложений.`);
                }
                
                setAllCarsForModel(modelCars);

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
    
    const breadcrumbItems = [
        { label: pageInfo.brandName, to: `/cars/${brandSlug}` },
        { label: pageInfo.modelName, to: `/cars/${brandSlug}/${modelSlug}` }
    ];

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px', color: COLORS.textPrimary, backgroundColor: COLORS.pageBackground}}>Загрузка...</div>;
    }
    if (error) {
        return <div style={{padding: '50px', color: COLORS.primary, fontSize: '18px', textAlign: 'center', backgroundColor: COLORS.pageBackground}}>{error}</div>;
    }

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.pageContent}> 

                <Breadcrumbs items={breadcrumbItems} />

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
                
                {/* 💡 ИСПОЛЬЗУЕМ ВЫНЕСЕННЫЙ КОМПОНЕНТ */}
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

// ======================= СТИЛИ, ОСТАВШИЕСЯ В MODELPAGE =======================
const styles = {
    // 💡 Фон, обертка страницы
    pageWrapper: {
        backgroundColor: COLORS.pageBackground,
        backgroundImage: 'radial-gradient(circle at 40% 40%, #2a2a2a 0%, #131313 85%)', // Эффект "света"
        minHeight: '100vh',
        backgroundAttachment: 'fixed', 
        backgroundRepeat: 'no-repeat',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        color: COLORS.textPrimary,
    },
    pageContent: {
        maxWidth: '1360px', 
        margin: '0 auto', 
        padding: '0 20px 40px 20px', 
    },
    // Стили заголовка
    pageTitleContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        backgroundColor: COLORS.background, 
        border: `1px solid ${COLORS.border}`, 
        padding: '15px 20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        boxShadow: `0 2px 8px ${COLORS.shadow}`,
    },
    brandIcon: { 
        width: '40px', 
        height: '40px', 
        objectFit: 'contain', 
        backgroundColor: '#2A2A2A', 
        borderRadius: '8px' 
    },
    pageTitleText: { 
        fontSize: '32px',
        fontWeight: '700', 
        color: COLORS.textPrimary,
        margin: 0
    },
    // Сетка результатов
    resultsGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
    },
};

export default ModelPage;