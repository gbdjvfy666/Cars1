import { useState, useCallback, useEffect, useRef } from 'react';

const API_BASE_URL = 'http://localhost:4000/api';

export const useAutocomplete = () => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debounceTimeoutRef = useRef(null);

    const fetchSuggestions = useCallback(async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            setDropdownVisible(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/suggestions?query=${query}`);
            if (!response.ok) {
                throw new Error('Сетевая ошибка');
            }
            const data = await response.json();
            setSuggestions(data);
            setDropdownVisible(data.length > 0);
        } catch (err) {
            setError('Не удалось загрузить подсказки');
            setSuggestions([]);
            setDropdownVisible(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        setActiveIndex(-1);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        if (value.trim().length < 2) {
            setSuggestions([]);
            setDropdownVisible(false);
            setIsLoading(false);
            return;
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 400);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion.label);
        setSuggestions([]);
        setDropdownVisible(false);
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((prevIndex) => prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0);
        } 
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1);
        } 
        else if (event.key === 'Enter' && activeIndex > -1) {
            event.preventDefault();
            handleSuggestionClick(suggestions[activeIndex]);
        }
        else if (event.key === 'Escape') {
            setDropdownVisible(false);
        }
    };

    const searchContainerRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return {
        inputValue,
        setInputValue,
        suggestions,
        isDropdownVisible,
        isLoading,
        error,
        activeIndex,
        handleInputChange,
        handleSuggestionClick,
        handleKeyDown,
        searchContainerRef,
    };
};