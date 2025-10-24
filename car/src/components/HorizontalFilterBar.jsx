// File: src/components/HorizontalFilterBar.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutocomplete } from '../hooks/useAutocomplete'; 
import { useFilterState } from '../hooks/useFilterState'; 
import { SmartSearchInput } from '../components/SmartSearchInput';

// ====================================================================
// КОНСТАНТЫ И ОПЦИИ
// ====================================================================
const BODY_TYPE_OPTIONS = [ { label: 'Тип кузова', value: ''}, { label: 'Седан', value: 'Седан' }, { label: 'Хэтчбек', value: 'Хэтчбек' }, { label: 'Лифтбек', value: 'Лифтбек' }, { label: 'Универсал', value: 'Универсал' }, { label: 'Внедорожник', value: 'Внедорожник' }, { label: 'Купе', value: 'Купе' }, { label: 'Минивэн', value: 'Минивэн' }];
const DRIVETRAIN_OPTIONS = [ { label: 'Привод', value: '' }, { label: 'Передний', value: 'Передний привод' }, { label: 'Задний', value: 'Задний привод' }, { label: 'Полный (4WD)', value: 'Полный привод' }];
const ENGINE_OPTIONS = [ { label: 'Двигатель', value: '' }, { label: 'Бензин', value: 'Двигатель внутреннего сгорания' }, { label: 'Дизель', value: 'Дизельное топливо' }, { label: 'Гибрид', value: 'Гибрид' }, { label: 'Электро', value: 'Электро' }];
const REGION_OPTIONS = [ { label: 'Регион', value: '' }, { label: 'Китайские', value: 'chinese' }, { label: 'Европейские', value: 'european' }, { label: 'Американские', value: 'american' }, { label: 'Японские', value: 'japanese' }, { label: 'Корейские', value: 'korean' }];

// ====================================================================
// УЛУЧШЕННЫЕ CSS СТИЛИ В СТИЛЕ "LUMINOUS"
// ====================================================================
const HorizontalBarStyles = `
@font-face { font-family: "Aeonik Pro Regular"; src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot"); src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot?#iefix") format("embedded-opentype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff2") format("woff2"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff") format("woff"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.ttf") format("truetype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.svg#Aeonik Pro Regular") format("svg"); }

.luminous-horizontal-bar { 
    position: relative; 
    width: 100%;
    margin-bottom: 40px;
    background: radial-gradient(circle at 50% 0%, #3a3a3a 0%, #1a1a1a 64%); 
    box-shadow: inset 0 1rem 0.2rem -1rem #fff0, inset 0 -1rem 0.2rem -1rem #0000, 0 0 0 1px #fff3, 0 4px 4px 0 #0004, 0 0 0 1px #333; 
    border-radius: 1.8rem; 
    padding: 1.5rem; 
    box-sizing: border-box; 
    font-family: "Aeonik Pro Regular", sans-serif;
}

.luminous-horizontal-bar::before { 
    content: ""; display: block; --offset: 1rem; width: calc(100% + 2 * var(--offset)); height: calc(100% + 2 * var(--offset)); position: absolute; left: calc(-1 * var(--offset)); top: calc(-1 * var(--offset)); margin: auto; box-shadow: inset 0 0 0px 0.06rem #fff2; border-radius: 2.6rem; --ax: 4rem; clip-path: polygon( var(--ax) 0, 0 0, 0 var(--ax), var(--ax) var(--ax), var(--ax) calc(100% - var(--ax)), 0 calc(100% - var(--ax)), 0 100%, var(--ax) 100%, var(--ax) calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) 100%, 100% 100%, 100% calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) var(--ax), 100% var(--ax), 100% 0, calc(100% - var(--ax)) 0, calc(100% - var(--ax)) var(--ax), var(--ax) var(--ax) ); transition: all 0.4s ease-in-out; pointer-events: none;
}

.filter-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    color: #fff;
}

.filter-tabs {
    display: flex;
    gap: 0.5rem;
    background-color: #2c2c2c;
    border-radius: 1.25rem;
    padding: 4px;
    border: 1px solid #fff3;
}

.filter-tab {
    flex: 1; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: transparent; color: #ccc; border: none; border-radius: 1rem; cursor: pointer; transition: all 0.2s ease-in-out; text-align: center; white-space: nowrap;
}
.filter-tab:hover { background-color: rgba(255,255,255,0.1); }
.filter-tab.active { background-color: #E30016; color: #fff; font-weight: bold; box-shadow: 0 2px 8px rgba(227, 0, 22, 0.3); }

.filter-select, .filter-input {
    width: 100%; padding: 0.7rem; background-color: #2c2c2c; color: #fff; border: 1px solid #fff3; border-radius: 0.5rem; font-family: inherit; font-size: 0.9rem; box-sizing: border-box;
}

.filter-select { appearance: none; cursor: pointer; }

/* Flex-grow позволяет элементам занимать доступное место */
.filter-item { flex: 1 1 150px; /* Базовая ширина 150px, может расти и сжиматься */ }
.filter-search-input { flex: 2 1 250px; /* Поиску даем больше места */ }
.filter-actions { display: flex; gap: 1rem; align-items: center; }

.filter-submit { padding: 0.7rem 1.5rem; font-size: 0.9rem; font-weight: bold; background-color: #E30016; color: #fff; border: none; border-radius: 0.5rem; cursor: pointer; transition: background-color 0.2s; }
.filter-submit:hover { background-color: #c40013; }

.filter-reset { background: none; border: none; color: #aaa; cursor: pointer; font-size: 0.8rem; text-decoration: none; transition: color 0.2s; }
.filter-reset:hover { color: #fff; text-decoration: underline; }
`;

// ====================================================================
// ОБНОВЛЕННЫЙ КОМПОНЕНТ HorizontalFilterBar
// ====================================================================

const HorizontalFilterBar = () => {
    const navigate = useNavigate();
    const autocomplete = useAutocomplete(); 
    const {
        currentFilters,
        handleFilterChange,
        handlePriceChange,
        handleResetFilters,
        handleApplyFilters,
    } = useFilterState(autocomplete);

    useEffect(() => {
        const styleElement = document.createElement('style');
        if (!document.getElementById('horizontal-bar-styles')) {
            styleElement.id = 'horizontal-bar-styles';
            styleElement.innerHTML = HorizontalBarStyles;
            document.head.appendChild(styleElement);
        }
    }, []);

    const handleFinalSearch = () => {
        handleApplyFilters();
        const params = new URLSearchParams();
        const append = (key, value) => {
            if (value !== null && value !== undefined && value !== 'all' && !(Array.isArray(value) && value.length === 0) && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                    params.append(key, value);
                }
            }
        };
        
        if (currentFilters.condition && currentFilters.condition !== 'all') append('condition', currentFilters.condition);
        append('bodyType', currentFilters.bodyType);
        append('engineType', currentFilters.engineType); 
        append('drivetrain', currentFilters.drivetrain);
        if (currentFilters.origin && currentFilters.origin !== '') append('origin', currentFilters.origin); 
        
        if (currentFilters.priceFrom !== '' && !isNaN(Number(currentFilters.priceFrom))) {
            append('priceFrom', Number(currentFilters.priceFrom));
        }
        if (currentFilters.priceTo !== '' && !isNaN(Number(currentFilters.priceTo))) {
            append('priceTo', Number(currentFilters.priceTo));
        }

        if (autocomplete.inputValue) params.append('searchTerm', autocomplete.inputValue);

        navigate(`/search?${params.toString()}`);
    };

    const getTabClassName = (tabName) => {
        return `filter-tab ${currentFilters.condition === tabName ? 'active' : ''}`;
    };

    return (
        <div className="luminous-horizontal-bar">
            <div className="filter-controls">
                
                <div className="filter-tabs">
                    <button className={getTabClassName('all')} onClick={() => handleFilterChange('condition', 'all')}>Все</button>
                    <button className={getTabClassName('new')} onClick={() => handleFilterChange('condition', 'new')}>Новые</button>
                    <button className={getTabClassName('used')} onClick={() => handleFilterChange('condition', 'used')}>С пробегом</button>
                </div>
                
                <div className="filter-item filter-search-input">
                    <SmartSearchInput 
                        {...autocomplete} 
                        placeholder="Марка, модель..."
                    />
                </div>

                <div className="filter-item">
                    <select value={currentFilters.bodyType} onChange={(e) => handleFilterChange('bodyType', e.target.value)} className="filter-select">
                        {BODY_TYPE_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                
                <div className="filter-item">
                    <select value={currentFilters.engineType} onChange={(e) => handleFilterChange('engineType', e.target.value)} className="filter-select">
                        {ENGINE_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                
                {/* --- ВОЗВРАЩЕННЫЕ КНОПКИ --- */}
                <div className="filter-item">
                    <select value={currentFilters.drivetrain || ''} onChange={(e) => handleFilterChange('drivetrain', e.target.value)} className="filter-select">
                        {DRIVETRAIN_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="filter-item">
                    <select value={currentFilters.origin || ''} onChange={(e) => handleFilterChange('origin', e.target.value)} className="filter-select">
                        {REGION_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                {/* --------------------------- */}
                
                <div className="filter-item">
                    <input name="priceFrom" type="number" placeholder="Цена от, ₽" value={currentFilters.priceFrom} onChange={handlePriceChange} className="filter-input"/>
                </div>
                
                <div className="filter-item">
                    <input name="priceTo" type="number" placeholder="Цена до, ₽" value={currentFilters.priceTo} onChange={handlePriceChange} className="filter-input"/>
                </div>
                
                <div className="filter-actions">
                    <button 
                        className="filter-submit" 
                        onClick={handleFinalSearch}
                    >
                        Показать
                    </button>
                    <button onClick={handleResetFilters} className="filter-reset">Сбросить</button>
                </div>
            </div>
        </div>
    );
};

export default HorizontalFilterBar;