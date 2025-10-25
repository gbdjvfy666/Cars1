import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Константы фильтров
const API_BASE_URL = 'http://localhost:4000/api';

// ====================================================================
// Вспомогательные функции для парсинга URL
// ====================================================================

/**
 * Извлекает скалярный параметр из URLSearchParams.
 * @param {URLSearchParams} params
 * @param {string} key
 * @returns {string | undefined}
 */
const getParam = (params, key) => {
    const values = params.getAll(key);
    if (values.length === 0) return undefined;
    // Для всех скалярных параметров возвращаем первый элемент 
    return values[0]; 
};

/**
 * Парсит числовой параметр из URL, возвращая число или пустую строку.
 * @param {URLSearchParams} params
 * @param {string} key
 * @returns {number | string}
 */
const getNumericParam = (params, key) => {
    const val = getParam(params, key);
    // Возвращаем пустую строку, если undefined/null/пустая строка, иначе число
    const numberVal = val !== undefined && val !== null && val !== '' ? Number(val) : '';
    // Дополнительная проверка на Infinity, если число слишком большое
    return isFinite(numberVal) ? numberVal : '';
};

/**
 * Парсит булевы параметры (чекбоксы) из URL.
 * @param {URLSearchParams} params
 * @param {string} key
 * @returns {boolean}
 */
const getBooleanParam = (params, key) => {
    return getParam(params, key) === 'true';
};

/**
 * Функция для парсинга всех параметров из URL
 * @param {string} search - строка location.search
 * @returns {Object} initialFilters
 */
const parseQuery = (search) => {
    const params = new URLSearchParams(search);

    const getAllParam = (key) => {
        const values = params.getAll(key);
        return values && values.length > 0 ? values : [];
    };

    const initialFilters = {
        // --- Основные фильтры (скалярные значения) ---
        condition: getParam(params, 'condition') || 'all',
        origin: getParam(params, 'origin') || '',
        // brandSlug как массив (может быть несколько)
        brandSlug: getAllParam('brandSlug'),
        bodyType: getParam(params, 'bodyType') || '',
        engineType: getParam(params, 'engineType') || '', // Исправлена опечатка sengineType -> engineType
        drivetrain: getParam(params, 'drivetrain') || '',
        searchTerm: getParam(params, 'searchTerm') || '',
        
        // Диапазоны цены
        priceFrom: getNumericParam(params, 'priceFrom'),
        priceTo: getNumericParam(params, 'priceTo'),

        // --- Расширенные диапазоны (числа) ---
        yearFrom: getNumericParam(params, 'yearFrom'),
        yearTo: getNumericParam(params, 'yearTo'),
        mileageFrom: getNumericParam(params, 'mileageFrom'),
        mileageTo: getNumericParam(params, 'mileageTo'),
        displacementFrom: getNumericParam(params, 'displacementFrom'),
        displacementTo: getNumericParam(params, 'displacementTo'),
        powerFrom: getNumericParam(params, 'powerFrom'),
        powerTo: getNumericParam(params, 'powerTo'),

        // --- Чекбоксы (булевы) ---
        withDiscount: getBooleanParam(params, 'withDiscount'),
        withGift: getBooleanParam(params, 'withGift'),
        withPromo: getBooleanParam(params, 'withPromo'),
    };
    
    return initialFilters;
};

// ====================================================================
// ХУК useFilterState
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
        if (autocomplete) {
            // Обновляем текущие фильтры при изменении ввода в SmartSearchInput
            setCurrentFilters(prev => ({ ...prev, searchTerm: autocomplete.inputValue }));
        }
    }, [autocomplete ? autocomplete.inputValue : null]);

    // Логика формирования строки запроса
    const generateSearchQuery = useCallback((filters, currentPage) => {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        
        /**
         * Вспомогательная функция для добавления параметра. 
         * Игнорирует: undefined, null, '', false.
         */
        const append = (key, value) => {
            // Игнорируем: undefined, null, пустую строку, а также boolean false
            if (value !== undefined && value !== null && value !== '' && value !== false) {
                    // Для булевых значений (true) передаем строку 'true'
                const finalValue = typeof value === 'boolean' ? String(value) : value;
                
                if (Array.isArray(finalValue)) {
                    finalValue.forEach(v => params.append(key, v));
                } else {
                    params.set(key, finalValue);
                }
            }
        };

        // --- Основные фильтры ---
        append('searchTerm', filters.searchTerm);
        if (filters.condition && filters.condition !== 'all') { append('condition', filters.condition); }
        append('origin', filters.origin);
        append('engineType', filters.engineType);
        append('bodyType', filters.bodyType);
        append('drivetrain', filters.drivetrain);
        // Передаём brandSlug (массив) в query, если есть
        append('brandSlug', filters.brandSlug);

        // Диапазоны цены
        append('priceFrom', filters.priceFrom);
        append('priceTo', filters.priceTo);

        // --- Расширенные диапазоны ---
        append('yearFrom', filters.yearFrom);
        append('yearTo', filters.yearTo);
        append('mileageFrom', filters.mileageFrom);
        append('mileageTo', filters.mileageTo);
        append('displacementFrom', filters.displacementFrom);
        append('displacementTo', filters.displacementTo);
        append('powerFrom', filters.powerFrom);
        append('powerTo', filters.powerTo);
        
        // --- Чекбоксы ---
        append('withDiscount', filters.withDiscount);
        append('withGift', filters.withGift);
        append('withPromo', filters.withPromo);
        
        return params.toString();
    }, []);

    // Логика загрузки данных
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
        // Мы запускаем поиск только при изменении appliedFilters, который меняется 
        // при клике на "Показать" в фильтрах или при изменении URL.
        setPage(1);
        setDisplayedCars([]);
        handleSearch(appliedFilters, 1);
    }, [appliedFilters, handleSearch]);
    
    // ====================================================================
    // Методы управления фильтрами
    // ====================================================================

    const handleFilterChange = (key, value) => {
        setCurrentFilters(prev => ({ ...prev, [key]: value }));
    };
    
    /**
     * Обрабатывает ввод числовых полей и чекбоксов.
     */
    const handlePriceChange = useCallback((e) => { 
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            // Для чекбоксов используем булево значение
            setCurrentFilters(prev => ({ ...prev, [name]: checked }));
        } else {
            // Для числовых полей: разрешаем цифры и точку
            const raw = value.replace(/[^0-9.]/g, ''); 
            
            // 🐛 ИСПРАВЛЕНИЕ ОШИБКИ 500: Ограничиваем длину ввода
            const isRangeField = name.includes('From') || name.includes('To');
            // Устанавливаем разумные лимиты для предотвращения переполнения
            const maxLength = (name.includes('mileage') || name.includes('price')) ? 15 : 6; 
            const truncatedRaw = raw.slice(0, maxLength); 
            
            // Если поле пустое или содержит только точку, то пустая строка. Иначе - число.
            const newValue = truncatedRaw === '' || truncatedRaw === '.' ? '' : Number(truncatedRaw);
            
            // Если Number вернул Infinity (слишком большое число), возвращаем пустую строку
            const finalValue = isFinite(newValue) && newValue !== 0 ? newValue : (truncatedRaw === '' ? '' : truncatedRaw);

            setCurrentFilters(prev => ({ ...prev, [name]: finalValue })); 
        }
    }, []);

    const handleApplyFilters = () => {
        // Применяем текущее состояние фильтров к состоянию, которое триггерит поиск
        setAppliedFilters(currentFilters);
    };
    
    const handleResetFilters = () => {
        const initial = parseQuery(''); // Получаем чистые начальные фильтры
        setCurrentFilters(initial);
        setAppliedFilters(initial);
        // Сброс поля ввода поиска
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