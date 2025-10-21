import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Переиспользуем наш универсальный компонент DropdownFilter
import { DropdownFilter } from '../components/DropdownFilter';
import '../components/DropdownFilter.css'; // Убедитесь, что стили импортированы

// ====================================================================
// КОНСТАНТЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================================================================

const API_BASE_URL = 'http://localhost:4000/api';
const INITIAL_VISIBLE_COUNT = { chinese: 11, european: 5, american: 5, japanese: 5, korean: 4 };
const ICON_PLACEHOLDER = 'https://placehold.co/32x32/f0f0f0/ccc.png?text=...';

// Опции для наших новых дропдаунов
const BODY_TYPE_OPTIONS = [ { label: 'Седан', value: 'Седан' }, { label: 'Хэтчбек', value: 'Хэтчбек' }, { label: 'Лифтбек', value: 'Лифтбек' }, { label: 'Универсал', value: 'Универсал' }, { label: 'Внедорожник', value: 'Внедорожник' }, { label: 'Купе', value: 'Купе' }, { label: 'Минивэн', value: 'Минивэн' }, { label: 'Пикап', value: 'Пикап' }, { label: 'Лимузин', value: 'Лимузин' }, { label: 'Фургон', value: 'Фургон' }, { label: 'Кабриолет', value: 'Кабриолет' }, { label: 'Ван', value: 'Ван' }];
const DRIVETRAIN_OPTIONS = [ { label: 'Передний', value: 'Передний привод' }, { label: 'Задний', value: 'Задний привод' }, { label: 'Полный (4WD)', value: 'Полный привод' }];
const ENGINE_OPTIONS = [ { label: 'Бензин', value: 'Двигатель внутреннего сгорания' }, { label: 'Дизель', value: 'Дизельное топливо' }, { label: 'Гибрид', value: 'Гибрид' }, { label: 'Электро', value: 'Электро' }];
const PRICE_RANGE_OPTIONS = [ {label: 'До 3 млн ₽', value: '0-3000000'}, {label: '3-6 млн ₽', value: '3000000-6000000'}, {label: 'От 6 млн ₽', value: '6000000-'}];

// Начальное состояние для фильтров в боковой панели
const INITIAL_SIDEBAR_FILTERS = {
    condition: 'all', // all, new, used
    bodyType: [],
    priceFrom: '',
    priceTo: '',
    drivetrain: [],
    engine: [],
};

// ====================================================================
// МАЛЕНЬКИЕ КОМПОНЕНТЫ ДЛЯ ГЛАВНОГО КОНТЕНТА
// ====================================================================

const BrandItem = ({ slug, imgSrc, name, count }) => (
    <Link to={`/cars/${slug}`} style={styles.brandLink}>
        <div style={styles.brandInner}><img src={imgSrc || ICON_PLACEHOLDER} alt={name} style={styles.brandLogo} onError={(e) => { e.currentTarget.src = ICON_PLACEHOLDER; }} /> <div style={styles.brandName}>{name}</div></div>
        <div style={styles.brandCount}>{count}</div>
    </Link>
);

const BrandSection = ({ sectionKey, title, brands, isExpanded, onToggle }) => {
    const initialCount = INITIAL_VISIBLE_COUNT[sectionKey] || brands.length;
    const canBeExpanded = brands.length > initialCount;
    const displayedBrands = isExpanded ? brands : brands.slice(0, initialCount);
    
    return (
        <div style={styles.brandSectionWrapper(sectionKey)}>
            <div style={styles.sectionTitle}>{title.toUpperCase()}</div>
            <div style={styles.brandGrid(sectionKey)}>
                {displayedBrands.map(brand => <BrandItem key={brand.slug} {...brand} />)}
                {canBeExpanded && (<button onClick={() => onToggle(sectionKey)} style={styles.showAllButton}><span style={styles.showAllText}>{isExpanded ? 'Скрыть' : 'Показать все'}</span> <svg width="19" height="19" viewBox="0 0 19 19" fill="currentColor" style={{...styles.showAllIcon, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}}><path d="M5.675 6.5L9.5 10.2085L13.325 6.5L14.5 7.6417L9.5 12.5L4.5 7.6417L5.675 6.5Z" /></svg></button>)}
            </div>
        </div>
    );
};

// ====================================================================
// ПРОФЕССИОНАЛЬНЫЙ КОМПОНЕНТ БОКОВОЙ ПАНЕЛИ (SIDEBAR)
// ====================================================================

const Sidebar = () => {
    const [filters, setFilters] = useState(INITIAL_SIDEBAR_FILTERS);
    const navigate = useNavigate();

    const handleFilterChange = (key, values) => {
        setFilters(prev => ({ ...prev, [key]: values }));
    };
    
    // Специальный обработчик для диапазона цен (одиночный выбор)
    const handlePriceChange = (values) => {
        const value = values[0] || ''; // Берем только первый элемент или пустую строку
        const [from, to] = value.split('-');
        setFilters(prev => ({...prev, priceFrom: from || '', priceTo: to || ''}));
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        const append = (key, value) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                if (Array.isArray(value)) value.forEach(v => params.append(key, v));
                else params.set(key, value);
            }
        };

        if (filters.condition !== 'all') append('condition', filters.condition);
        append('bodyType', filters.bodyType);
        append('engine', filters.engine);
        append('drivetrain', filters.drivetrain);
        append('priceFrom', filters.priceFrom);
        append('priceTo', filters.priceTo);

        navigate(`/search?${params.toString()}`);
    };
    
    return (
        <div style={styles.sidebar}>
            <h2 style={styles.sidebarTitle}>Быстрый подбор</h2>
            <div style={styles.tabs}><button onClick={() => handleFilterChange('condition', 'all')} style={filters.condition === 'all' ? styles.activeTab : styles.tab}>Все</button> <button onClick={() => handleFilterChange('condition', 'new')} style={filters.condition === 'new' ? styles.activeTab : styles.tab}>Новые</button> <button onClick={() => handleFilterChange('condition', 'used')} style={filters.condition === 'used' ? styles.activeTab : styles.tab}>С пробегом</button></div>
            <hr style={styles.hr} />
            <DropdownFilter title="Тип кузова" options={BODY_TYPE_OPTIONS} selectedValues={filters.bodyType} onFilterChange={(values) => handleFilterChange('bodyType', values)} />
            <DropdownFilter title="Тип двигателя" options={ENGINE_OPTIONS} selectedValues={filters.engine} onFilterChange={(values) => handleFilterChange('engine', values)} />
            <DropdownFilter title="Привод" options={DRIVETRAIN_OPTIONS} selectedValues={filters.drivetrain} onFilterChange={(values) => handleFilterChange('drivetrain', values)} />
            <DropdownFilter title="Цена" options={PRICE_RANGE_OPTIONS} selectedValues={[`${filters.priceFrom}-${filters.priceTo}`]} onFilterChange={handlePriceChange} />
            <button onClick={handleSearch} style={styles.submitButton}>🔍 Подобрать</button>
            {/* Статистику можно добавить позже */}
        </div>
    );
};

// ====================================================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ (ПЕРЕИМЕНОВАН В HomePage)
// ====================================================================

function HomePage() {
    const [expandedSections, setExpandedSections] = useState({});
    const [carData, setCarData] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/brands`);
                if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
                const data = await response.json();
                setCarData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []); 

    const handleToggleSection = (sectionKey) => {
        setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };
    
    // Логика отображения
    const totalCars = loading || error ? 0 : Object.values(carData).reduce((sum, group) => sum + group.brands.reduce((brandSum, brand) => brandSum + brand.count, 0), 0);
    const displayData = loading || error ? [] : Object.entries(carData).filter(([, value]) => value.brands.length > 0);

    return (
        <div style={styles.container}>
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.mainTitle}>Автомобили из Китая в <span style={{color: '#E30016'}}>1 клик</span></h1>
                    <span style={styles.subHeader}>Найдено {totalCars.toLocaleString('ru-RU')} объявлений</span>
                </div>
                {loading && <div style={{textAlign: 'center', padding: '50px 0', fontSize: '18px'}}>Загрузка марок...</div>}
                {error && <div style={{textAlign: 'center', padding: '50px 0', color: 'red'}}>Ошибка: {error}</div>}
                {!loading && !error && (
                    <div style={styles.allBrandsContainer}>
                        {displayData.map(([key, value]) => (
                            <BrandSection key={key} sectionKey={key} title={value.title} brands={value.brands} isExpanded={!!expandedSections[key]} onToggle={handleToggleSection} />
                        ))}
                    </div>
                )}
            </div>
            <Sidebar />
        </div>
    );
}

// ====================================================================
// СТИЛИ 
// ====================================================================
const styles = {
    container: { display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '1280px', margin: '40px auto', padding: '0 24px', gap: '32px', alignItems: 'flex-start' },
    mainContent: { flex: '1 1 67%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
    mainTitle: { fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#000', lineHeight: 1.2 },
    subHeader: { color: '#E30016', fontSize: '12px', fontWeight: 'bold', textAlign: 'right', lineHeight: '1.2', maxWidth: '120px' },
    allBrandsContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' },
    brandSectionWrapper: (key) => ({ gridColumn: key === 'chinese' ? '1 / -1' : 'auto', marginBottom: '40px' }),
    sectionTitle: { fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500 },
    brandGrid: (key) => ({ display: 'grid', gridTemplateColumns: key === 'chinese' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '16px 32px' }),
    brandLink: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', transition: 'background-color 0.2s', padding: '5px 0' },
    brandInner: { display: 'flex', alignItems: 'center', gap: '12px' },
    brandLogo: { width: '32px', height: '32px', objectFit: 'contain' },
    brandName: { fontSize: '14px', fontWeight: 500, color: '#333' },
    brandCount: { fontSize: '14px', color: '#999' },
    showAllButton: { background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#6f737d', transition: 'color 0.2s', marginTop: '8px' },
    showAllText: { fontSize: '14px', fontWeight: 500, marginRight: '4px' },
    showAllIcon: { transition: 'transform 0.3s ease-in-out' },
    
    sidebar: { flex: '0 0 280px', backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '12px', border: '1px solid #eee', height: 'fit-content', position: 'sticky', top: '40px' },
    sidebarTitle: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#000' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
    tab: { flex: 1, padding: '8px 15px', fontSize: '14px', border: '1px solid #d7d8dc', backgroundColor: '#fff', borderRadius: '20px', cursor: 'pointer', color: '#4c4a55', fontWeight: 500, transition: 'all 0.2s' },
    activeTab: { flex: 1, padding: '8px 15px', fontSize: '14px', border: '1px solid #E30016', backgroundColor: '#E30016', color: '#fff', borderRadius: '20px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
    submitButton: { width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', textDecoration: 'none', textAlign: 'center', display: 'block' },
};

export default HomePage;