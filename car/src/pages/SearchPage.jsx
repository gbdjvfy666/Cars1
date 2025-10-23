import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import LuminousCard from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import CarCard from '../components/CarCard';

const API_BASE_URL = 'http://localhost:4000/api';

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
        // по умолчанию пустые строки — чтобы инпуты показывали плейсхолдер
        priceFrom: getParam('priceFrom') !== undefined ? getParam('priceFrom') : '',
        priceTo: getParam('priceTo') !== undefined ? getParam('priceTo') : '',
        searchTerm: getParam('searchTerm') || '',
    };
    Object.keys(initialFilters).forEach(key => {
        if (['origin', 'bodyType', 'engineType', 'drivetrain'].includes(key) && !Array.isArray(initialFilters[key])) {
            initialFilters[key] = initialFilters[key] ? [initialFilters[key]] : [];
        }
    });
    return initialFilters;
}

const SearchPage = () => {
    const location = useLocation();
    
    const [appliedFilters, setAppliedFilters] = useState(() => parseQuery(location.search));
    const [displayedCars, setDisplayedCars] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    const [isLoading, setIsLoading] = useState(true);
    const [isAppending, setIsAppending] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    
    // Обновление примененных фильтров при изменении URL (вызванном LuminousCard)
    useEffect(() => {
        const newFilters = parseQuery(location.search);
        setAppliedFilters(newFilters);
        setPage(1); 
    }, [location.search]);

    const generateSearchQuery = (filters, currentPage) => {
        const params = new URLSearchParams();
        params.set('page', currentPage);

        const append = (key, value) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            }
        };

        append('searchTerm', filters.searchTerm);
        if (filters.condition !== 'all') {
            append('condition', filters.condition);
        }
        append('origin', filters.origin);
        append('engineType', filters.engineType);
        append('bodyType', filters.bodyType);
        append('drivetrain', filters.drivetrain);
        
        // заменяем условные проверки на явную проверку непустой строки и валидности числа
        if (filters.priceFrom !== '' && filters.priceFrom !== undefined && filters.priceFrom !== null && !isNaN(Number(filters.priceFrom))) { 
            append('priceFrom', filters.priceFrom);
        }
        if (filters.priceTo !== '' && filters.priceTo !== undefined && filters.priceTo !== null && !isNaN(Number(filters.priceTo))) { 
            append('priceTo', filters.priceTo);
        }

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
        setDisplayedCars([]);
        handleSearch(appliedFilters, 1);
    }, [appliedFilters, handleSearch]);
    
    const handleLoadMore = () => { 
        const nextPage = page + 1; 
        setPage(nextPage); 
        handleSearch(appliedFilters, nextPage); 
    };
    const canLoadMore = displayedCars.length < totalCount;

    const breadcrumbItems = [{ label: 'Поиск', to: '/search' }];

    return (

        <div style={styles.pageWrapper}> 
            <div style={styles.page}>
                <Breadcrumbs items={breadcrumbItems} />
                <h1 style={styles.pageTitle}>Поиск объявлений</h1>
                <div style={styles.contentWrapper}>
                    
                    <div style={styles.sideFilterBar}>
                        {/* 💡 ПРЕДПОЛАГАЕМ, ЧТО LuminousCard ИМПОРТИРУЕТСЯ ИЗ КОМПОНЕНТОВ (../components/LuminousCard) */}
                        <LuminousCard /> 
                    </div>

                    <div style={styles.resultsWrapper}>
                        <div style={styles.resultsHeader}>
                            <span style={styles.resultsCount}>{isLoading ? 'Загрузка...' : `Найдено ${totalCount} объявлений`}</span>
                            <select style={styles.sortSelect}><option>Сначала новые</option><option>Сначала дешевые</option><option>Сначала дорогие</option></select>
                        </div>
                        {error && <div style={{...styles.noResults, color: '#E30016', border: '1px solid #E3001650'}}>❌ Ошибка: {error}</div>}
                        <div style={styles.resultsGrid}>
                            {isLoading ? <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>Загрузка объявлений...</p>
                             : !error && displayedCars.length > 0 ? displayedCars.map(car => <CarCard key={car.id} car={car} />)
                             : !isLoading && !error && <div style={styles.noResults}>😕 Ничего не найдено.<p style={{fontSize: '16px', color: '#888'}}>Попробуйте изменить параметры.</p></div>
                            }
                        </div>
                        <div style={styles.loadMoreContainer}>{!isLoading && canLoadMore && <button onClick={handleLoadMore} disabled={isAppending} style={styles.loadMoreButton}>{isAppending ? 'Загрузка...' : `Показать еще ${Math.min(20, totalCount - displayedCars.length)} авто`}</button>}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const tabButton = { padding: '8px 15px', fontSize: '14px', border: '1px solid #d7d8dc', backgroundColor: '#fff', borderRadius: '20px', cursor: 'pointer', color: '#4c4a55', fontWeight: 500, transition: 'all 0.2s' };

const styles = { 
    // 💡 НОВЫЙ СТИЛЬ: Обертка страницы с темным градиентным фоном
pageWrapper: {
        backgroundColor: '#131313',
        backgroundImage: 'radial-gradient(circle at 40% 40%, #2a2a2a 0%, #131313 85%)',
        minHeight: '100vh',
        
        // ==============================================
        // !!! НОВЫЕ СВОЙСТВА ДЛЯ СТАТИЧНОГО ФОНА !!!
        backgroundAttachment: 'fixed', 
        backgroundRepeat: 'no-repeat',
        // ==============================================
    },
    // 💡 СТИЛЬ: Основной контейнер. Используем 1360px.
    page: { 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
        maxWidth: '1360px', 
        margin: '0 auto', 
        padding: '20px',
        color: '#f0f0f0', // Общий светлый цвет текста
    },
    // 💡 СТИЛЬ: Заголовок страницы
    pageTitle: { 
        fontSize: '28px', 
        fontWeight: 'bold', 
        margin: '10px 0 20px 0',
        color: '#f0f0f0', // Светлый цвет заголовка
    },
    contentWrapper: { display: 'flex', gap: '32px', alignItems: 'flex-start' },
    applyButton: { width: '100%', padding: '10px', marginTop: '10px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
    // 💡 ИЗМЕНЕНИЕ 1: Уменьшаем ширину фильтра для освобождения места
    sideFilterBar: { flex: '0 0 24rem', width: '24rem', position: 'sticky', top: '20px', padding: '0', backgroundColor: 'transparent', border: 'none' },     filterTitle: { fontSize: '16px', fontWeight: '600', color: '#f0f0f0', marginBottom: '10px', marginTop: '15px' },
    filterButtonInactive: { ...tabButton, backgroundColor: '#fff', borderRadius: '8px', padding: '8px 12px' },
    hr: { border: 'none', borderTop: '1px solid #333', margin: '20px 0' }, // Более темный разделитель
    priceInputsGroup: { display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '10px 12px', border: '1px solid #444', backgroundColor: '#1c1c1c', color: '#f0f0f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', textAlign: 'center', boxSizing: 'border-box' },
    resultsWrapper: { flex: '1' },
    resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' },
    resultsCount: { fontSize: '18px', fontWeight: 'bold', color: '#f0f0f0' },
    sortSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1c1c1c', color: '#f0f0f0', fontSize: '14px', cursor: 'pointer' }, // Обновлены стили для select
    // 💡 ИЗМЕНЕНИЕ 2: Оптимизируем минимальную ширину карточки, чтобы гарантировать 3 колонки.
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }, // minmax(280px) -> minmax(260px) для большей гибкости
    loadMoreContainer: { textAlign: 'center', marginTop: '30px' },
    loadMoreButton: { padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
    noResults: { gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', fontSize: '20px', color: '#ccc', backgroundColor: '#2a2a2a', borderRadius: '12px', marginTop: '20px', border: '1px solid #3a3a3a' }
};

export default SearchPage;