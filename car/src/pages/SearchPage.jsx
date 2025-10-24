import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import HorizontalFilterBar from '../components/HorizontalFilterBar'; // <-- [ИЗМЕНЕНИЕ 1/4]: Импортируем новый компонент
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
    const [viewMode, setViewMode] = useState('grid');

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
        if (filters.condition !== 'all') append('condition', filters.condition);
        append('origin', filters.origin);
        append('engineType', filters.engineType);
        append('bodyType', filters.bodyType);
        append('drivetrain', filters.drivetrain);
        if (filters.priceFrom !== '' && !isNaN(Number(filters.priceFrom))) append('priceFrom', filters.priceFrom);
        if (filters.priceTo !== '' && !isNaN(Number(filters.priceTo))) append('priceTo', filters.priceTo);
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
                
                {/* [ИЗМЕНЕНИЕ 2/4]: Вставляем новый компонент фильтра здесь */}
                <HorizontalFilterBar />

                {/* [ИЗМЕНЕНИЕ 3/4]: Структура из двух колонок удалена, `resultsWrapper` становится основным контейнером */}
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
                                <button 
                                    onClick={() => setViewMode('grid')} 
                                    style={{ ...styles.viewButton, ...(viewMode === 'grid' ? styles.activeViewButton : {}) }}
                                    title="Сетка"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h6V5H4v6zm0 7h6v-6H4v6zm8-13v6h6V5h-6zm0 13h6v-6h-6v6z"></path></svg>
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')} 
                                    style={{ ...styles.viewButton, ...(viewMode === 'list' ? styles.activeViewButton : {}) }}
                                    title="Список"
                                >
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
    // [ИЗМЕНЕНИЕ 4/4]: Ненужные стили удалены или упрощены
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
};

export default SearchPage;