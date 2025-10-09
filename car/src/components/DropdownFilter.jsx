import React, { useState, useEffect, useRef } from 'react';
import './DropdownFilter.css';

export const DropdownFilter = ({ title, options, selectedValues, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggle = (value) => {
        const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onFilterChange(newSelectedValues);
    };

    const handleReset = (e) => {
        e.stopPropagation();
        onFilterChange([]);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const getButtonLabel = () => {
        if (selectedValues.length === 0) {
            return title;
        }
        if (selectedValues.length === 1) {
            const selectedOption = options.find(opt => opt.value === selectedValues[0]);
            return selectedOption ? selectedOption.label : title;
        }
        const firstSelected = options.find(opt => opt.value === selectedValues[0]);
        return `${firstSelected ? firstSelected.label : ''}, ... (${selectedValues.length})`;
    };

    return (
        <div className="dropdown-filter" ref={dropdownRef}>
            <button className={`dropdown-button ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>{getButtonLabel()}</span>
                <span className="dropdown-arrow">▼</span>
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-item reset" onClick={handleReset}>
                        <span className="checkbox">✖</span> Любой
                    </div>
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`dropdown-item ${selectedValues.includes(option.value) ? 'selected' : ''}`}
                            onClick={() => handleToggle(option.value)}
                        >
                            <span className="checkbox">✓</span>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};