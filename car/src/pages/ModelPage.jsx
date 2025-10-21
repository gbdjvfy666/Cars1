import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CarCard from '../components/CarCard'; // <-- Импортируем новый компонент

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

// ======================= КОМПОНЕНТ ФИЛЬТРОВ =======================

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
                    <select disabled style={{...styles.select, backgroundColor: COLORS.pageBackground, color: COLORS.textPrimary, fontWeight: '600'}}>
                        <option>{brandName}</option>
                    </select>
                    <select disabled style={{...styles.select, backgroundColor: COLORS.pageBackground, color: COLORS.textPrimary, fontWeight: '600'}}>
                        <option>{modelName}</option>
                    </select>
                    
                    <select name="engineType" value={filters.engineType} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Тип двигателя</option>
                        {engineTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    
                    <div style={styles.inputRangeContainer}>
                        <input name="yearFrom" type="number" value={filters.yearFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Год от" />
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
                        <input name="mileageFrom" type="number" value={filters.mileageFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Пробег от, км" />
                        <input name="mileageTo" type="number" value={filters.mileageTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                
                <div style={styles.filterRowPriceAndButton}>
                    <div style={styles.inputRangeContainerPrice}>
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

// ======================= КОМПОНЕНТЫ TitleHoverWrapper и CarCard УДАЛЕНЫ =======================


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
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '20px'}}>Загрузка...</div>;
    }
    if (error) {
        return <div style={{padding: '50px', color: COLORS.primary, fontSize: '18px', textAlign: 'center'}}>{error}</div>;
    }

    return (
        <div style={styles.page}>
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
};

export default ModelPage;