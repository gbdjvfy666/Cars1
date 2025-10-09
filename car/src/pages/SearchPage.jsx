import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAutocomplete } from '../hooks/useAutocomplete'; 
import { SmartSearchInput } from '../components/SmartSearchInput';
import { DropdownFilter } from '../components/DropdownFilter';
import '../components/SmartSearchInput.css';
import '../components/DropdownFilter.css';

const API_BASE_URL = 'http://localhost:4000/api';

const BODY_TYPE_OPTIONS = [
    { label: 'Седан', value: 'Седан' },
    { label: 'Хэтчбек', value: 'Хэтчбек' },
    { label: 'Лифтбек', value: 'Лифтбек' },
    { label: 'Универсал', value: 'Универсал' },
    { label: 'Внедорожник', value: 'Внедорожник' },
    { label: 'Купе', value: 'Купе' },
    { label: 'Минивэн', value: 'Минивэн' },
    { label: 'Пикап', value: 'Пикап' },
    { label: 'Лимузин', value: 'Лимузин' },
    { label: 'Фургон', value: 'Фургон' },
    { label: 'Кабриолет', value: 'Кабриолет' },
    { label: 'Ван', value: 'Ван' },
];
const DRIVETRAIN_OPTIONS = [
    { label: 'Передний', value: 'Передний привод' },
    { label: 'Задний', value: 'Задний привод' },
    { label: 'Полный (4WD)', value: 'Полный привод' },
];
const ENGINE_OPTIONS = [
    { label: 'Бензин/ДВС', value: 'Двигатель внутреннего сгорания' },
    { label: 'Дизель', value: 'Дизельное топливо' },
    { label: 'Гибрид', value: 'Гибрид' },
    { label: 'Электро', value: 'Электро' },
];
const REGION_OPTIONS = [
    { label: 'Китайские', value: 'chinese' },
    { label: 'Европейские', value: 'european' },
    { label: 'Американские', value: 'american' },
    { label: 'Японские', value: 'japanese' },
    { label: 'Корейские', value: 'korean' }
];

const parseQuery = (search) => {
    const params = new URLSearchParams(search);
    const getParam = (key) => {
        const values = params.getAll(key);
        if (values.length === 0) return undefined;
        if (['origin', 'bodyType', 'engineType', 'drivetrain'].includes(key)) return values;
        return values[0];
    }
    const initialFilters = {
        condition: getParam('condition') || 'all',
        origin: getParam('origin') || [],
        bodyType: getParam('bodyType') || [],
        engineType: getParam('engineType') || [],
        drivetrain: getParam('drivetrain') || [],
        priceFrom: Number(getParam('priceFrom')) || 0,
        priceTo: Number(getParam('priceTo')) || 30000000,
        searchTerm: getParam('searchTerm') || '',
    };
    Object.keys(initialFilters).forEach(key => {
        if (['origin', 'bodyType', 'engineType', 'drivetrain'].includes(key) && !Array.isArray(initialFilters[key])) {
            initialFilters[key] = initialFilters[key] ? [initialFilters[key]] : [];
        }
    });
    return initialFilters;
}

// ИЗМЕНЕНИЕ ЗДЕСЬ
const CarCard = ({ car }) => {
    const brandSlug = car.brand ? car.brand.toLowerCase().replace(/ /g, '-') : 'brand';
    const modelSlug = car.model ? car.model.toLowerCase().replace(/ /g, '-') : 'model';

    return (
        <Link to={`/cars/${brandSlug}/${modelSlug}/${car.id}`} style={styles.cardLink}>
            <div style={styles.cardImagePlaceholder}><span style={styles.cardImageText}>Фото {car.brand || 'АВТО'}</span></div>
            <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{car.brand || 'Автомобиль'} {car.model || 'Модель'}</h3>
                <div style={styles.cardPrice}>{(car.price_russia || 0).toLocaleString('ru-RU')} ₽</div>
                <div style={styles.cardInfo}>
                    <span>{car.year || '—'}</span>
                    <span>{car.mileage !== undefined ? (car.mileage > 0 ? `${(car.mileage / 1000).toFixed(0)} тыс. км` : 'Новый') : '—'}</span>
                    <span>{car.engine_type || '—'}</span>
                </div>
            </div>
        </Link>
    );
};

const SearchPage = () => {
    const location = useLocation();
    const [currentFilters, setCurrentFilters] = useState(() => parseQuery(location.search));
    const [appliedFilters, setAppliedFilters] = useState(currentFilters);
    const [displayedCars, setDisplayedCars] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    const [isLoading, setIsLoading] = useState(true);
    const [isAppending, setIsAppending] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const autocomplete = useAutocomplete();

    useEffect(() => {
        setCurrentFilters(prev => ({ ...prev, searchTerm: autocomplete.inputValue }));
    }, [autocomplete.inputValue]);

    const generateSearchQuery = (filters, currentPage) => {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        const append = (key, value) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                if (Array.isArray(value)) value.forEach(v => params.append(key, v));
                else params.set(key, value);
            }
        };
        append('searchTerm', filters.searchTerm);
        if (filters.condition !== 'all') append('condition', filters.condition);
        append('origin', filters.origin);
        append('engine', filters.engineType);
        append('bodyType', filters.bodyType);
        append('drivetrain', filters.drivetrain);
        if (filters.priceFrom > 0) append('priceFrom', filters.priceFrom);
        if (filters.priceTo > 0 && filters.priceTo < 30000000) append('priceTo', filters.priceTo);
        return params.toString();
    };

    const handleSearch = useCallback(async (filters, currentPage = 1) => {
        const isInitialLoad = currentPage === 1;
        if (isInitialLoad) setIsLoading(true); else setIsAppending(true);
        setError(null);
        const queryString = generateSearchQuery(filters, currentPage);
        try {
            const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
            if (!response.ok) throw new Error(`Ошибка поиска: ${response.status}`);
            const data = await response.json();
            if (isInitialLoad) setDisplayedCars(data.cars || []);
            else setDisplayedCars(prev => [...prev, ...(data.cars || [])]);
            setTotalCount(data.totalCount || 0);
        } catch (err) {
            setError(err.message);
            setDisplayedCars([]);
            setTotalCount(0); 
        } finally {
            if (isInitialLoad) setIsLoading(false); else setIsAppending(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        setDisplayedCars([]);
        handleSearch(appliedFilters, 1);
    }, [appliedFilters, handleSearch]);
    
    const handleApplyFilters = () => setAppliedFilters(currentFilters);
    const handleLoadMore = () => { const nextPage = page + 1; setPage(nextPage); handleSearch(appliedFilters, nextPage); };
    const canLoadMore = displayedCars.length < totalCount;

    const handlePriceChange = (e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setCurrentFilters(prev => ({ ...prev, [e.target.name]: Number(val) || 0 })); };
    const handleFilterChange = (key, values) => {
        setCurrentFilters(prev => ({ ...prev, [key]: values }));
    };
    
    const handleResetFilters = () => {
        const initial = parseQuery('');
        setCurrentFilters(initial);
        setAppliedFilters(initial);
        autocomplete.setInputValue(''); 
    };
    
    const formatPrice = p => (p > 0 && p < 30000000) ? p.toLocaleString('ru-RU') : '';

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}>🏠 / Поиск</div>
            <h1 style={styles.pageTitle}>Поиск объявлений</h1>
            <div style={styles.contentWrapper}>
                <div style={styles.sideFilterBar}>
                    <h3 style={styles.filterTitle}>Поиск по марке/модели</h3>
                    <SmartSearchInput {...autocomplete} />
                    <button onClick={handleApplyFilters} style={styles.applyButton}>Применить</button>
                    <hr style={styles.hr} />
                    <DropdownFilter title="Тип кузова" options={BODY_TYPE_OPTIONS} selectedValues={currentFilters.bodyType || []} onFilterChange={(values) => handleFilterChange('bodyType', values)} />
                    <DropdownFilter title="Тип двигателя" options={ENGINE_OPTIONS} selectedValues={currentFilters.engineType || []} onFilterChange={(values) => handleFilterChange('engineType', values)} />
                    <DropdownFilter title="Привод" options={DRIVETRAIN_OPTIONS} selectedValues={currentFilters.drivetrain || []} onFilterChange={(values) => handleFilterChange('drivetrain', values)} />
                    <DropdownFilter title="Регион" options={REGION_OPTIONS} selectedValues={currentFilters.origin || []} onFilterChange={(values) => handleFilterChange('origin', values)} />
                    <hr style={styles.hr} />
                    <h3 style={styles.filterTitle}>Цена, ₽</h3>
                    <div style={styles.priceInputsGroup}>
                        <input name="priceFrom" type="text" value={formatPrice(currentFilters.priceFrom)} onChange={handlePriceChange} style={styles.input} placeholder="От"/>
                        <input name="priceTo" type="text" value={formatPrice(currentFilters.priceTo)} onChange={handlePriceChange} style={styles.input} placeholder="До"/>
                    </div>
                    <button onClick={handleResetFilters} style={{...styles.filterButtonInactive, width: '100%', marginTop: '20px', padding: '10px'}}>Сбросить фильтры</button>
                </div>
                <div style={styles.resultsWrapper}>
                    <div style={styles.resultsHeader}><span style={styles.resultsCount}>{isLoading ? 'Загрузка...' : `Найдено ${totalCount} объявлений`}</span><select style={styles.sortSelect}><option>Сначала новые</option><option>Сначала дешевые</option><option>Сначала дорогие</option></select></div>
                    {error && <div style={{...styles.noResults, color: '#E30016', border: '1px solid #E3001650'}}>❌ Ошибка: {error}</div>}
                    <div style={styles.resultsGrid}>
                        {isLoading ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>Примените фильтры для поиска...</p>
                         : !error && displayedCars.length > 0 ? displayedCars.map(car => <CarCard key={car.id} car={car} />)
                         : !isLoading && !error && <div style={styles.noResults}>😕 Ничего не найдено.<p style={{fontSize: '16px', color: '#888'}}>Попробуйте изменить параметры.</p></div>
                        }
                    </div>
                    <div style={styles.loadMoreContainer}>{!isLoading && canLoadMore && <button onClick={handleLoadMore} disabled={isAppending} style={styles.loadMoreButton}>{isAppending ? 'Загрузка...' : `Показать еще ${Math.min(20, totalCount - displayedCars.length)} авто`}</button>}</div>
                </div>
            </div>
        </div>
    );
};

const tabButton = { padding: '8px 15px', fontSize: '14px', border: '1px solid #d7d8dc', backgroundColor: '#fff', borderRadius: '20px', cursor: 'pointer', color: '#4c4a55', fontWeight: 500, transition: 'all 0.2s' };
const styles = { 
    page: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '1280px', margin: '0 auto', padding: '20px' },
    breadcrumb: { color: '#888', marginBottom: '20px', fontSize: '14px' },
    contentWrapper: { display: 'flex', gap: '32px', alignItems: 'flex-start' },
    applyButton: { width: '100%', padding: '10px', marginTop: '10px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
    sideFilterBar: { flex: '0 0 280px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', position: 'sticky', top: '20px' },
    filterTitle: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '10px', marginTop: '15px' },
    filterButtonInactive: { ...tabButton, backgroundColor: '#fff', borderRadius: '8px', padding: '8px 12px' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
    priceInputsGroup: { display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '10px 12px', border: '1px solid #d7d8dc', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', textAlign: 'center', boxSizing: 'border-box' },
    resultsWrapper: { flex: '1' },
    resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' },
    resultsCount: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
    sortSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #d7d8dc', backgroundColor: '#fff', fontSize: '14px', cursor: 'pointer' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
    loadMoreContainer: { textAlign: 'center', marginTop: '30px' },
    loadMoreButton: { padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
    cardLink: { textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.2s, transform 0.2s' },
    cardImagePlaceholder: { height: '180px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardImageText: { color: '#999', fontSize: '14px' },
    cardBody: { padding: '15px' },
    cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
    cardPrice: { fontSize: '22px', fontWeight: '800', color: '#E30016', marginBottom: '10px' },
    cardInfo: { display: 'flex', flexWrap: 'wrap', gap: '5px 10px', fontSize: '13px', color: '#666' },
    noResults: { gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', fontSize: '20px', color: '#666', backgroundColor: '#fff', borderRadius: '12px', marginTop: '20px', border: '1px solid #eee' }
};

export default SearchPage;