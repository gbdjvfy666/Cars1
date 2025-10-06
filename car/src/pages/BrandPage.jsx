import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../data'; // Наша "база данных"

// ======================= МЕЛКИЕ КОМПОНЕНТЫ =======================

const FilterBar = ({ filters, setFilters, cars }) => {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const models = [...new Set(cars.map(car => car.model))];
    const engineTypes = [...new Set(cars.map(car => car.engineType))];
    const drivetrains = [...new Set(cars.map(car => car.drivetrain))];

    return (
        <div style={styles.filterBar}>
            <select name="model" value={filters.model} onChange={handleFilterChange} style={styles.select}><option value="">Модель</option>{models.map(m => <option key={m} value={m}>{m}</option>)}</select>
            <select name="engineType" value={filters.engineType} onChange={handleFilterChange} style={styles.select}><option value="">Тип двигателя</option>{engineTypes.map(e => <option key={e} value={e}>{e}</option>)}</select>
            <input name="yearFrom" value={filters.yearFrom} onChange={handleFilterChange} style={styles.input} placeholder="Год от" />
            <input name="yearTo" value={filters.yearTo} onChange={handleFilterChange} style={styles.input} placeholder="До" />
            <select style={styles.select}><option>Тип кузова</option></select>
            <select style={styles.select}><option>Коробка</option></select>
            <select style={styles.select}><option>Опции</option></select>
            <select name="drivetrain" value={filters.drivetrain} onChange={handleFilterChange} style={styles.select}><option value="">Привод</option>{drivetrains.map(d => <option key={d} value={d}>{d}</option>)}</select>
            <input name="mileageFrom" value={filters.mileageFrom} onChange={handleFilterChange} style={styles.input} placeholder="Пробег от, км" />
            <input name="mileageTo" value={filters.mileageTo} onChange={handleFilterChange} style={styles.input} placeholder="До" />
            <input name="priceFrom" value={filters.priceFrom} onChange={handleFilterChange} style={{...styles.input, gridColumn: 'span 2'}} placeholder="Цена от, ₽" />
            <input name="priceTo" value={filters.priceTo} onChange={handleFilterChange} style={{...styles.input, gridColumn: 'span 2'}} placeholder="До" />
            <button style={styles.showButton}>Показать ({filters.count})</button>
        </div>
    );
};

const ModelList = ({ models, brandSlug }) => (
    <div style={styles.modelList}>
        {models.map(model => (
            <Link to={`/cars/${brandSlug}/${model.slug}`} key={model.name} style={styles.modelItem}>
                <span style={styles.modelName}>{model.name}</span>
                <span style={styles.modelCount}>{model.count}</span>
            </Link>
        ))}
    </div>
);

const CarCard = ({ car }) => (
    <div style={styles.card}>
        <img src={car.img} alt={car.name} style={styles.cardImage} />
        <div style={styles.cardBody}>
            <h3 style={styles.cardTitle}>{car.name}</h3>
            <div style={styles.cardInfo}>Пробег: {car.mileage.toLocaleString()} км</div>
            <div style={styles.cardInfo}>Год: {car.year}</div>
            <div style={styles.cardPrice}>~ {car.price.toLocaleString()} ₽</div>
            <div style={styles.cardLocation}>В НАЛИЧИИ В КИТАЕ</div>
        </div>
    </div>
);

// ======================= ОСНОВНОЙ КОМПОНЕНТ =======================

const BrandPage = () => {
    const { brandSlug } = useParams();
    
    // Получаем данные внутри компонента, чтобы они были актуальны при каждом рендере
    const brandData = db[brandSlug]; 

    const [filters, setFilters] = useState({
        model: '', engineType: '', yearFrom: '', yearTo: '',
        drivetrain: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '',
        count: 0,
    });
    
    const [displayedCars, setDisplayedCars] = useState([]);

    // Эффект №1: Реагирует только на смену страницы (brandSlug)
    // Его задача - сбросить фильтры и показать все машины для новой марки
    useEffect(() => {
        if (brandData) {
            // Сбрасываем фильтры при переходе на страницу другой марки
            setFilters({ model: '', engineType: '', drivetrain: '', yearFrom: '', yearTo: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '', count: brandData.cars.length });
            setDisplayedCars(brandData.cars);
        }
    }, [brandSlug]); // <--- ЗАВИСИМОСТЬ ТОЛЬКО ОТ brandSlug

    // Эффект №2: Реагирует на изменение фильтров
    // Его задача - применять фильтрацию к текущему списку машин
    useEffect(() => {
        if (!brandData) return;

        let filtered = brandData.cars;

        if (filters.model) filtered = filtered.filter(c => c.model === filters.model);
        if (filters.engineType) filtered = filtered.filter(c => c.engineType === filters.engineType);
        if (filters.drivetrain) filtered = filtered.filter(c => c.drivetrain === filters.drivetrain);
        if (filters.yearFrom) filtered = filtered.filter(c => c.year >= parseInt(filters.yearFrom));
        if (filters.yearTo) filtered = filtered.filter(c => c.year <= parseInt(filters.yearTo));
        if (filters.priceFrom) filtered = filtered.filter(c => c.price >= parseInt(filters.priceFrom));
        if (filters.priceTo) filtered = filtered.filter(c => c.price <= parseInt(filters.priceTo));
        if (filters.mileageFrom) filtered = filtered.filter(c => c.mileage >= parseInt(filters.mileageFrom));
        if (filters.mileageTo) filtered = filtered.filter(c => c.mileage <= parseInt(filters.mileageTo));

        setDisplayedCars(filtered);
        setFilters(prev => ({...prev, count: filtered.length}));
    }, [filters.model, filters.engineType, filters.drivetrain, filters.yearFrom, filters.yearTo, filters.priceFrom, filters.priceTo, filters.mileageFrom, filters.mileageTo, brandSlug]);


    if (!brandData) {
        return <div style={{padding: '50px'}}>Марка "{brandSlug}" не найдена. Добавьте ее в data.js</div>;
    }

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadcrumbLink}>🏠</Link> / {brandData.brandName.toUpperCase()}
            </div>
            
            <h1 style={styles.pageTitle}>
                <span style={styles.titleIcon}>📄</span> Купить {brandData.brandName}
            </h1>

            <ModelList models={brandData.models} brandSlug={brandSlug} />
            
            <FilterBar filters={filters} setFilters={setFilters} cars={brandData.cars} />
            
            <div style={styles.resultsGrid}>
                {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
        </div>
    );
};

const styles = {
    page: { maxWidth: '1280px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#fff', color: '#333' },
    breadcrumb: { color: '#888', marginBottom: '20px' },
    breadcrumbLink: { textDecoration: 'none', color: '#555', marginRight: '5px' },
    pageTitle: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#FFF0F1', padding: '15px', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold' },
    titleIcon: { fontSize: '28px' },
    modelList: { display: 'flex', flexWrap: 'wrap', gap: '10px 40px', padding: '20px 0', borderBottom: '1px solid #eee', marginBottom: '20px' },
    modelItem: { display: 'flex', alignItems: 'baseline', gap: '8px', textDecoration: 'none', color: '#555', borderBottom: '2px dotted #ddd', flexGrow: 1, minWidth: '150px' },
    modelName: { color: '#E30016', fontWeight: 'bold' },
    modelCount: { color: '#999', fontSize: '12px', marginLeft: 'auto' },
    filterBar: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' },
    select: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc' },
    showButton: { padding: '10px', gridColumn: 'span 2', backgroundColor: '#E30016', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafafa' },
    cardImage: { width: '100%', height: '200px', objectFit: 'cover' },
    cardBody: { padding: '15px' },
    cardTitle: { margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' },
    cardInfo: { fontSize: '14px', color: '#666', marginBottom: '5px' },
    cardPrice: { fontSize: '20px', fontWeight: 'bold', margin: '15px 0' },
    cardLocation: { fontSize: '12px', color: '#007bff', fontWeight: '500' },
};

export default BrandPage;