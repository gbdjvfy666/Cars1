// File: src/pages/SearchPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HorizontalFilterBar from '../components/Search/HorizontalFilterBar';
import PopularBrandsFilter from '../components/Search/PopularBrandsFilter'; 
import Breadcrumbs from '../other/Breadcrumbs';
import CarCard from '../components/CarCard';

const API_BASE_URL = 'http://localhost:4000/api';

// Функция парсинга остается без изменений
const parseQuery = (search) => {
    const params = new URLSearchParams(search);
    const getParam = (key) => {
        const values = params.getAll(key);
        if (values.length === 0) return undefined;
        if (['origin', 'bodyType', 'engineType', 'drivetrain', 'brandSlug'].includes(key)) return values;
        return values[0];
    };

    const getNumber = (key) => {
        const v = getParam(key);
        if (v === undefined || v === null || v === '') return '';
        const n = Number(v);
        return Number.isFinite(n) ? n : '';
    };

    const getBool = (key) => {
        const v = getParam(key);
        return v === 'true' || v === true;
    };

    const initialFilters = {
        condition: getParam('condition') || 'all',
        brandSlug: getParam('brandSlug') || [],
        origin: getParam('origin') || [],
        bodyType: getParam('bodyType') || [],
        engineType: getParam('engineType') || [],
        drivetrain: getParam('drivetrain') || [],
        priceFrom: getParam('priceFrom') !== undefined ? getParam('priceFrom') : '',
        priceTo: getParam('priceTo') !== undefined ? getParam('priceTo') : '',
        searchTerm: getParam('searchTerm') || '',
        // расширенные числовые фильтры
        yearFrom: getNumber('yearFrom'),
        yearTo: getNumber('yearTo'),
        mileageFrom: getNumber('mileageFrom'),
        mileageTo: getNumber('mileageTo'),
        powerFrom: getNumber('powerFrom'),
        powerTo: getNumber('powerTo'),
        displacementFrom: getNumber('displacementFrom'),
        displacementTo: getNumber('displacementTo'),
        // чекбоксы
        withDiscount: getBool('withDiscount'),
        withGift: getBool('withGift'),
        withPromo: getBool('withPromo'),
    };

    // привести мульти-поля к массивам, если они не массивы
    Object.keys(initialFilters).forEach(key => {
        if (['origin', 'bodyType', 'engineType', 'drivetrain', 'brandSlug'].includes(key) && !Array.isArray(initialFilters[key])) {
            initialFilters[key] = initialFilters[key] ? [initialFilters[key]] : [];
        }
    });
    return initialFilters;
}

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [appliedFilters, setAppliedFilters] = useState(() => parseQuery(location.search));
    const [displayedCars, setDisplayedCars] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    const [isLoading, setIsLoading] = useState(true);
    const [isAppending, setIsAppending] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const newFilters = parseQuery(location.search);
        setAppliedFilters(newFilters);
        setPage(1); 
    }, [location.search]);

    // Функция генерации URL остается без изменений
    const generateSearchQuery = (filters, currentPage) => {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        const append = (key, value) => {
            if (value !== null && value !== undefined && value !== '' && value !== false && (!Array.isArray(value) || value.length > 0)) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                     params.append(key, value);
                }
            }
        };
        
        if (filters.condition && filters.condition !== 'all') append('condition', filters.condition);
        append('brandSlug', filters.brandSlug);
        append('bodyType', filters.bodyType);
        append('engineType', filters.engineType);
        append('drivetrain', filters.drivetrain);
        append('origin', filters.origin);
        append('priceFrom', filters.priceFrom);
        append('priceTo', filters.priceTo);
        if (filters.searchTerm) append('searchTerm', filters.searchTerm);
        append('yearFrom', filters.yearFrom);
        append('yearTo', filters.yearTo);
        append('mileageFrom', filters.mileageFrom);
        append('mileageTo', filters.mileageTo);
        append('powerFrom', filters.powerFrom);
        append('powerTo', filters.powerTo);
        append('displacementFrom', filters.displacementFrom);
        append('displacementTo', filters.displacementTo);
        append('withDiscount', filters.withDiscount);
        append('withGift', filters.withGift);
        append('withPromo', filters.withPromo);
        return params.toString();
    };

    // 🚀 ИЗМЕНЕНИЕ: Оборачиваем handleSearch в useCallback, чтобы стабилизировать функцию
    const handleSearch = useCallback(async (filters, currentPage = 1) => {
        const isInitialLoad = currentPage === 1;
        if (isInitialLoad) setIsLoading(true); else setIsAppending(true);
        setError(null);
        
        const queryString = generateSearchQuery(filters, currentPage);
        
        try {
            const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
            if (!response.ok) throw new Error(`Ошибка поиска: ${response.status}`);
            
            const data = await response.json();

            if (isInitialLoad) {
                setDisplayedCars(data.cars || []);
            } else {
                setDisplayedCars(prev => [...prev, ...(data.cars || [])]);
            }
            setTotalCount(data.totalCount || 0);
        } catch (err) {
            setError(err.message);
            setDisplayedCars([]);
            setTotalCount(0); 
        } finally {
            if (isInitialLoad) setIsLoading(false); else setIsAppending(false);
        }
    }, []); // Пустой массив зависимостей, т.к. функция не зависит от пропсов или стейта напрямую

    // Этот useEffect теперь будет работать корректно, т.к. handleSearch стабилен
    useEffect(() => {
        setDisplayedCars([]);
        handleSearch(appliedFilters, 1);
    }, [appliedFilters, handleSearch]);
    
    const handleLoadMore = () => { 
        const nextPage = page + 1; 
        setPage(nextPage); 
        handleSearch(appliedFilters, nextPage); 
    };

    const handleBrandToggle = (brandSlug) => {
        const currentBrands = appliedFilters.brandSlug || [];
        const newBrands = currentBrands.includes(brandSlug)
            ? currentBrands.filter(slug => slug !== brandSlug)
            : [...currentBrands, brandSlug];

        const newFilters = { ...appliedFilters, brandSlug: newBrands, searchTerm: '' };
        
        const queryString = generateSearchQuery(newFilters, 1);
        navigate(`/search?${queryString}`);
    };

    // Построить массив плашек по текущим appliedFilters
    const buildActiveBadges = (filters) => {
        const badges = [];
        const add = (k, v, label) => badges.push({ key: k, value: v, label });

        if (!filters) return badges;
        // массивные фильтры (brandSlug, bodyType, engineType, drivetrain, origin)
        ['brandSlug', 'bodyType', 'engineType', 'drivetrain', 'origin'].forEach(k => {
            const val = filters[k];
            if (Array.isArray(val) && val.length > 0) val.forEach(v => add(k, v, String(v)));
            else if (val && !Array.isArray(val)) add(k, val, String(val));
        });

        // простые скаляры
        if (filters.searchTerm) add('searchTerm', filters.searchTerm, filters.searchTerm);
        if (filters.condition && filters.condition !== 'all') add('condition', filters.condition, filters.condition === 'new' ? 'Новые' : 'С пробегом');

        // диапазоны — создаём отдельные плашки для from/to
        const addRange = (fromKey, toKey, labelFn) => {
            if (filters[fromKey] !== '' && filters[fromKey] !== undefined && filters[fromKey] !== null) {
                add(fromKey, filters[fromKey], labelFn('from', filters[fromKey]));
            }
            if (filters[toKey] !== '' && filters[toKey] !== undefined && filters[toKey] !== null) {
                add(toKey, filters[toKey], labelFn('to', filters[toKey]));
            }
        };
        addRange('priceFrom','priceTo', (dir, v) => dir === 'from' ? `Цена от ${Number(v).toLocaleString('ru-RU')} ₽` : `Цена до ${Number(v).toLocaleString('ru-RU')} ₽`);
        addRange('yearFrom','yearTo', (dir, v) => dir === 'from' ? `Год от ${v}` : `Год до ${v}`);
        addRange('mileageFrom','mileageTo', (dir, v) => dir === 'from' ? `Пробег от ${Number(v).toLocaleString('ru-RU')} км` : `Пробег до ${Number(v).toLocaleString('ru-RU')} км`);
        addRange('powerFrom','powerTo', (dir, v) => dir === 'from' ? `Мощность от ${v} л.с.` : `Мощность до ${v} л.с.`);
        addRange('displacementFrom','displacementTo', (dir, v) => dir === 'from' ? `Объём от ${v}` : `Объём до ${v}`);

        // булевы чекбоксы
        if (filters.withDiscount) add('withDiscount', true, 'Со скидкой');
        if (filters.withGift) add('withGift', true, 'С подарком');
        if (filters.withPromo) add('withPromo', true, 'Акции');

        return badges;
    };

    // Удаление одного фильтра — обновляем filters и навигируем
    const removeFilter = (key, value) => {
        const newFilters = { ...appliedFilters };
        if (Array.isArray(newFilters[key])) {
            newFilters[key] = newFilters[key].filter(v => String(v) !== String(value));
        } else {
            // булевы
            if (typeof newFilters[key] === 'boolean') newFilters[key] = false;
            else newFilters[key] = '';
        }
        // Сформировать query и перейти (generateSearchQuery доступна в этом модуле)
        const qs = generateSearchQuery(newFilters, 1);
        navigate(`/search?${qs}`);
    };

    const activeBadges = buildActiveBadges(appliedFilters);

    const canLoadMore = displayedCars.length < totalCount;
    const breadcrumbItems = [{ label: 'Поиск', to: '/search' }];

    const getResultsContainerStyles = (mode) => {
        if (mode === 'list') {
            return { display: 'flex', flexDirection: 'column', gap: '24px' };
        }
        return styles.resultsGrid;
    };

    return (
        <div style={styles.pageWrapper}> 
            <div style={styles.page}>
                <Breadcrumbs items={breadcrumbItems} />
                <h1 style={styles.pageTitle}>Поиск объявлений</h1>
                
                <HorizontalFilterBar />
                
                {/* Активные фильтры — плашки */}
                {activeBadges.length > 0 && (
                    <div style={styles.activeBadgesContainer}>
                        {activeBadges.map((b, i) => (
                            <div key={`${b.key}-${b.value}-${i}`} style={styles.badge}>
                                <span style={styles.badgeLabel}>{b.label}</span>
                                <button onClick={() => removeFilter(b.key, b.value)} style={styles.badgeClose} aria-label="Удалить фильтр">×</button>
                            </div>
                        ))}
                    </div>
                )}

                <PopularBrandsFilter 
                    selectedBrands={appliedFilters.brandSlug} 
                    onBrandToggle={handleBrandToggle} 
                />

                <div style={styles.resultsWrapper}>
                    <div style={styles.resultsHeader}>
                        <span style={styles.resultsCount}>{isLoading ? 'Загрузка...' : `Найдено ${totalCount} объявлений`}</span>
                        <div style={styles.rightHeaderControls}>
                            <select style={styles.sortSelect}>
                                <option>Сначала новые</option>
                                <option>Сначала дешевые</option>
                                <option>Сначала дорогие</option>
                            </select>
                            <div style={styles.viewSwitcher}>
                                <button onClick={() => setViewMode('grid')} style={{ ...styles.viewButton, ...(viewMode === 'grid' ? styles.activeViewButton : {}) }} title="Сетка">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h6V5H4v6zm0 7h6v-6H4v6zm8-13v6h6V5h-6zm0 13h6v-6h-6v6z"></path></svg>
                                </button>
                                <button onClick={() => setViewMode('list')} style={{ ...styles.viewButton, ...(viewMode === 'list' ? styles.activeViewButton : {}) }} title="Список">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    {error && <div style={{...styles.noResults, color: '#E30016', border: '1px solid #E3001650'}}>❌ Ошибка: {error}</div>}
                    <div style={getResultsContainerStyles(viewMode)}>
                        {isLoading ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>Загрузка объявлений...</p>
                         : !error && displayedCars.length > 0 ? displayedCars.map(car => (
                            <CarCard key={car.id} car={car} view={viewMode} />
                         ))
                         : !isLoading && !error && <div style={styles.noResults}>😕 Ничего не найдено.<p style={{fontSize: '16px', color: '#888'}}>Попробуйте изменить параметры.</p></div>
                        }
                    </div>
                    <div style={styles.loadMoreContainer}>{!isLoading && canLoadMore && <button onClick={handleLoadMore} disabled={isAppending} style={styles.loadMoreButton}>{isAppending ? 'Загрузка...' : `Показать еще ${Math.min(20, totalCount - displayedCars.length)} авто`}</button>}</div>
                </div>
            </div>
        </div>
    );
};

// Стили остаются без изменений
const styles = { 
    pageWrapper: {
        backgroundColor: '#131313',
        backgroundImage: 'radial-gradient(circle at 40% 40%, #2a2a2a 0%, #131313 85%)',
        minHeight: '100vh',
    },
    page: { 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
        maxWidth: '1360px', 
        margin: '0 auto', 
        padding: '20px',
        color: '#f0f0f0',
    },
    pageTitle: { 
        fontSize: '28px', 
        fontWeight: 'bold', 
        margin: '10px 0 20px 0',
        color: '#f0f0f0',
    },
    resultsWrapper: { 
        width: '100%' 
    },
    resultsHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        padding: '0 5px' 
    },
    resultsCount: { 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#f0f0f0' 
    },
    sortSelect: { 
        padding: '8px 12px', 
        borderRadius: '8px', 
        border: '1px solid #444', 
        backgroundColor: '#1c1c1c', 
        color: '#f0f0f0', 
        fontSize: '14px', 
        cursor: 'pointer' 
    },
    resultsGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
        gap: '24px' 
    },
    loadMoreContainer: { 
        textAlign: 'center', 
        marginTop: '30px' 
    },
    loadMoreButton: { 
        padding: '12px 30px', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        backgroundColor: '#E30016', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        transition: 'background-color 0.2s' 
    },
    noResults: { 
        gridColumn: '1 / -1', 
        textAlign: 'center', 
        padding: '50px 0', 
        fontSize: '20px', 
        color: '#ccc', 
        backgroundColor: '#2a2a2a', 
        borderRadius: '12px', 
        marginTop: '20px', 
        border: '1px solid #3a3a3a' 
    },
    rightHeaderControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    viewSwitcher: {
        display: 'flex',
        border: `1px solid #444`,
        borderRadius: '8px',
        overflow: 'hidden',
    },
    viewButton: {
        backgroundColor: '#1c1c1c',
        color: '#888',
        border: 'none',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-in-out',
    },
    activeViewButton: {
        backgroundColor: '#E30016',
        color: '#f0f0f0',
    },
    activeBadgesContainer: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        margin: '10px 0 18px 0',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#222',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '13px',
        border: '1px solid rgba(255,255,255,0.04)',
    },
    badgeLabel: { color: '#ddd' },
    badgeClose: {
        background: 'transparent',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '14px',
        lineHeight: 1,
        padding: 0,
    },
};

export default SearchPage;