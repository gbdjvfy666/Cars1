import React from 'react';
import './SmartSearchInput.css';

export const SmartSearchInput = ({
    inputValue,
    handleInputChange,
    handleKeyDown,
    suggestions,
    isDropdownVisible,
    handleSuggestionClick,
    isLoading,
    error,
    activeIndex,
    searchContainerRef
}) => {
    return (
        <div className="search-container" ref={searchContainerRef}>
            <input
                type="text"
                className="search-input"
                placeholder="Начните вводить марку или модель..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
            {isDropdownVisible && (
                <ul className="suggestions-dropdown">
                    {isLoading ? (
                        <li className="suggestion-item info">Загрузка...</li>
                    ) : error ? (
                        <li className="suggestion-item error">{error}</li>
                    ) : suggestions.length === 0 && !isLoading ? (
                        <li className="suggestion-item info">Ничего не найдено</li>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.value + index}
                                className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};