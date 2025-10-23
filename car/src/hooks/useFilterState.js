import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Константы фильтров из SearchPage
const API_BASE_URL = 'http://localhost:4000/api';

// Функция для парсинга параметров из URL (перенесена из SearchPage)
const parseQuery = (search) => {
    const params = new URLSearchParams(search);
    const getParam = (key) => {
        const values = params.getAll(key);
        if (values.length === 0) return undefined;
        // Для однозначных селектов возвращаем первый элемент (скаляр)
        if (['origin', 'bodyType', 'engineType', 'drivetrain'].includes(key)) return values[0];
        return values[0];
    }
    const initialFilters = {
        condition: getParam('condition') || 'all',
        // теперь скаляры (пустая строка по умолчанию)
        origin: getParam('origin') || '',
        bodyType: getParam('bodyType') || '',
        engineType: getParam('engineType') || '',
        drivetrain: getParam('drivetrain') || '',
        // Устанавливаем пустые строки по умолчанию — чтобы инпут показывал плейсхолдер
        priceFrom: getParam('priceFrom') !== undefined ? (getParam('priceFrom') === '' ? '' : Number(getParam('priceFrom'))) : '',
        priceTo: getParam('priceTo') !== undefined ? (getParam('priceTo') === '' ? '' : Number(getParam('priceTo'))) : '',
        searchTerm: getParam('searchTerm') || '',
    };
    
    return initialFilters;
}

// ====================================================================
// НОВЫЙ ХУК useFilterState
// ====================================================================

export const useFilterState = (autocomplete) => {
    const location = useLocation();
    
    // Состояния для фильтров и результатов поиска
    const [currentFilters, setCurrentFilters] = useState(() => parseQuery(location.search));
    const [appliedFilters, setAppliedFilters] = useState(currentFilters);
    const [displayedCars, setDisplayedCars] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    const [isLoading, setIsLoading] = useState(true);
    const [isAppending, setIsAppending] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    // Синхронизация searchTerm с autocomplete
    useEffect(() => {
        // Проверяем, что autocomplete существует, прежде чем обращаться к его свойствам
        if (autocomplete) {
            setCurrentFilters(prev => ({ ...prev, searchTerm: autocomplete.inputValue }));
        }
    }, [autocomplete ? autocomplete.inputValue : null]); // Зависимость с проверкой

    // Логика формирования строки запроса (перенесена из SearchPage)
    const generateSearchQuery = useCallback((filters, currentPage) => {
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

        // Формирование параметров
        append('searchTerm', filters.searchTerm);
        if (filters.condition && filters.condition !== 'all') { append('condition', filters.condition); }
        // сейчас эти поля скалярные — ок
        append('origin', filters.origin);
        append('engineType', filters.engineType);
        append('bodyType', filters.bodyType);
        append('drivetrain', filters.drivetrain);
        
        // Отправляем priceFrom даже если 0 (и игнорируем пустую строку)
        if (filters.priceFrom !== undefined && filters.priceFrom !== null && filters.priceFrom !== '' && !isNaN(Number(filters.priceFrom)) && Number(filters.priceFrom) >= 0) {
            append('priceFrom', Number(filters.priceFrom));
        }
        if (filters.priceTo !== undefined && filters.priceTo !== null && filters.priceTo !== '' && !isNaN(Number(filters.priceTo)) && Number(filters.priceTo) < 30000000) {
            append('priceTo', Number(filters.priceTo));
        }

        return params.toString();
    }, []);

    // Логика загрузки данных (перенесена из SearchPage)
    const handleSearch = useCallback(async (filters, currentPage = 1) => {
        const isInitialLoad = currentPage === 1;
        if (isInitialLoad) setIsLoading(true); else setIsAppending(true);
        setError(null);
        
        const queryString = generateSearchQuery(filters, currentPage);
        
        try {
            const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
            if (!response.ok) throw new Error(`Ошибка поиска: ${response.status} (${response.statusText})`);
            const data = await response.json();
            
            if (isInitialLoad) setDisplayedCars(data.cars || []);
            else setDisplayedCars(prev => [...prev, ...(data.cars || [])]);
            
            setTotalCount(data.totalCount || 0);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(err.message);
            if (isInitialLoad) setDisplayedCars([]);
            if (isInitialLoad) setTotalCount(0);
        } finally {
            if (isInitialLoad) setIsLoading(false); else setIsAppending(false);
        }
    }, [generateSearchQuery]);

    // Эффект для запуска поиска при изменении appliedFilters
    useEffect(() => {
        setPage(1);
        setDisplayedCars([]);
        handleSearch(appliedFilters, 1);
    }, [appliedFilters, handleSearch]);
    
    // Методы управления фильтрами
    const handleFilterChange = (key, value) => {
        setCurrentFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const handlePriceChange = (e) => { 
        const raw = e.target.value.replace(/[^0-9]/g, ''); 
        // позволяем временную пустую строку при удалении ввода, иначе число
        setCurrentFilters(prev => ({ ...prev, [e.target.name]: raw === '' ? '' : Number(raw) })); 
    };

    const handleApplyFilters = () => {
        setAppliedFilters(currentFilters);
    };
    
    const handleResetFilters = () => {
        const initial = parseQuery('');
        setCurrentFilters(initial);
        setAppliedFilters(initial);
        // Сброс поля ввода поиска, если передан autocomplete
        if (autocomplete) {
            autocomplete.setInputValue(''); 
        }
    };
    
    const handleLoadMore = () => { 
        const nextPage = page + 1; 
        setPage(nextPage); 
        handleSearch(appliedFilters, nextPage); 
    };
    
    const canLoadMore = displayedCars.length < totalCount;
    
    return {
        currentFilters,
        appliedFilters,
        displayedCars,
        totalCount,
        isLoading,
        isAppending,
        error,
        handleFilterChange,
        handlePriceChange,
        handleApplyFilters,
        handleResetFilters,
        handleLoadMore,
        canLoadMore,
    };
};