// File: src/components/FilterBar.js

import React, { useEffect } from 'react';

// ======================= КОНСТАНТЫ =======================
const COLORS = {
    primary: '#E30016', 
    secondary: '#00b33e', 
    background: '#FFFFFF',
    pageBackground: '#F7F7F7', 
    border: '#EAEAEA', 
    shadow: 'rgba(0, 0, 0, 0.05)', 
    textPrimary: '#1A1A1A', 
    textSecondary: '#555555', 
    textMuted: '#999999', 
    luminousBackground: '#1a1a1a', 
    luminousInput: '#2c2c2c',      
    luminousBorder: '#fff3',       
    luminousText: '#fff',          
    luminousMutedText: '#aaa',     
};

// ======================= CSS-СТИЛИ Luminous =======================
const LuminousFilterBarStyles = `
@font-face { font-family: "Aeonik Pro Regular"; src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot"); src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot?#iefix") format("embedded-opentype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff2") format("woff2"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff") format("woff"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.ttf") format("truetype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.svg#Aeonik Pro Regular") format("svg"); }

.luminous-filter-bar { 
    position: relative; 
    background: radial-gradient(circle at 50% 0%, #3a3a3a 0%, #1a1a1a 64%); 
    box-shadow: inset 0 1.01rem 0.2rem -1rem #fff0, inset 0 -1.01rem 0.2rem -1rem #0000, 0 -1.02rem 0.2rem -1rem #fff0, 0 1rem 0.2rem -1rem #0000, 0 0 0 1px #fff3, 0 4px 4px 0 #0004, 0 0 0 1px #333; 
    width: 100%;
    border-radius: 1.8rem; 
    color: #fff; 
    padding: 25px;
    box-sizing: border-box; 
    font-family: "Aeonik Pro Regular", sans-serif; 
    transition: all 0.4s ease-in-out; 
    margin-bottom: 40px;
}

.luminous-filter-bar::before { 
    content: ""; 
    display: block; 
    --offset: 1rem; 
    width: calc(100% + 2 * var(--offset)); 
    height: calc(100% + 2 * var(--offset)); 
    position: absolute; 
    left: calc(-1 * var(--offset)); 
    top: calc(-1 * var(--offset)); 
    margin: auto; 
    box-shadow: inset 0 0 0px 0.06rem #fff2; 
    border-radius: 2.6rem; 
    --ax: 4rem; 
    clip-path: polygon( var(--ax) 0, 0 0, 0 var(--ax), var(--ax) var(--ax), var(--ax) calc(100% - var(--ax)), 0 calc(100% - var(--ax)), 0 100%, var(--ax) 100%, var(--ax) calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) 100%, 100% 100%, 100% calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) var(--ax), 100% var(--ax), 100% 0, calc(100% - var(--ax)) 0, calc(100% - var(--ax)) var(--ax), var(--ax) var(--ax) ); 
    transition: all 0.4s ease-in-out; 
    pointer-events: none; 
    z-index: 1; 
}

.luminous-filter-bar:hover { 
    transform: translateY(-0.1rem); 
}
.luminous-filter-bar:hover::before { 
    --offset: 0.5rem; 
    --ax: 8rem; 
    border-radius: 2.2rem; 
    box-shadow: inset 0 0 0 0.08rem #fff1; 
}

.luminous-filter-bar > div:first-child {
    padding: 0;
}
`;

// ======================= СТИЛИ ДЛЯ ВНУТРЕННЕГО КОНТЕНТА =======================
const styles = {
    filterBarContent: {
        position: 'relative', 
        zIndex: 2, 
        width: '100%',
        height: '100%',
    },
    filterRowTop: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${COLORS.luminousInput}`
    },
    typeButtons: { 
        display: 'flex', 
        borderRadius: '1.25rem', 
        overflow: 'hidden', 
        border: `1px solid ${COLORS.luminousBorder}`
    },
    typeButton: { 
        padding: '0.5rem 1rem', 
        backgroundColor: 'transparent', 
        color: COLORS.luminousMutedText, 
        border: 'none', 
        cursor: 'pointer', 
        fontWeight: '500', 
        flexGrow: 1, 
        minWidth: '120px',
        fontSize: '15px',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
    },
    activeTypeButton: { 
        backgroundColor: COLORS.primary, 
        color: COLORS.background, 
        fontWeight: 'bold', 
    },
    resetButton: { 
        backgroundColor: 'transparent', 
        border: 'none', 
        color: COLORS.luminousMutedText, 
        cursor: 'pointer', 
        fontSize: '15px',
        fontWeight: '500',
        transition: 'color 0.2s',
        padding: '5px',
        outline: 'none',
    },
    filterRowBottom: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px' 
    },
    filterInputGroup: { 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px', 
    },
    select: { 
        padding: '10px 15px', 
        borderRadius: '0.5rem', 
        border: `1px solid ${COLORS.luminousBorder}`, 
        minWidth: '180px', 
        fontSize: '15px', 
        flexGrow: 1, 
        backgroundColor: COLORS.luminousInput, 
        color: COLORS.luminousText, 
        appearance: 'none', 
        cursor: 'pointer',
        outline: 'none',
    },
    inputRangeContainer: { 
        display: 'flex', 
        gap: '0', 
        flexGrow: 1, 
        minWidth: '180px',
        border: `1px solid ${COLORS.luminousBorder}`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
    },
    inputRangeContainerPrice: {
        display: 'flex', 
        gap: '0', 
        flexGrow: 1, 
        minWidth: '240px',
        border: `1px solid ${COLORS.luminousBorder}`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
    },
    inputRange: { 
        padding: '10px 15px', 
        border: 'none', 
        fontSize: '15px', 
        flex: 1,
        backgroundColor: COLORS.luminousInput, 
        color: COLORS.luminousText, 
        outline: 'none',
    },
    filterRowPriceAndButton: { 
        display: 'flex', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: '20px' 
    },
    showButton: { 
        padding: '10px 30px', 
        backgroundColor: COLORS.primary, 
        color: 'white', 
        border: 'none', 
        borderRadius: '0.5rem', 
        fontWeight: '600', 
        fontSize: '16px', 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        boxShadow: 'none', 
        height: '42px', 
        outline: 'none',
    },
    // 👇 НОВЫЕ СТИЛИ ДЛЯ ПЕРЕКЛЮЧАТЕЛЯ ВИДА
    viewSwitcher: {
        display: 'flex',
        border: `1px solid ${COLORS.luminousBorder}`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
    },
    viewButton: {
        backgroundColor: COLORS.luminousInput,
        color: COLORS.luminousMutedText,
        border: 'none',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-in-out',
    },
    activeViewButton: {
        backgroundColor: COLORS.primary,
        color: COLORS.luminousText,
    },
};

// ======================= ВНУТРЕННИЙ БАЗОВЫЙ КОМПОНЕНТ ФИЛЬТРОВ =======================

const BaseFilterBar = ({ 
    filters, 
    setFilters, 
    cars = [], 
    models = [], 
    brandName,
    // 👇 НОВЫЕ ПРОПСЫ
    viewMode,
    onViewChange
}) => {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
         setFilters(prev => ({
             ...prev,
             model: '', type: 'all', engineType: '', yearFrom: '', yearTo: '',
             drivetrain: '', mileageFrom: '', mileageTo: '', priceFrom: '', priceTo: '',
         }));
    };

    const filteredCarsByType = cars.filter(car => {
        if (filters.type === 'new') return car.mileage === 0 || car.mileage === null;
        if (filters.type === 'used') return car.mileage > 0;
        return true;
    });

    const uniqueValues = (key) => [...new Set(filteredCarsByType.map(car => car[key]).filter(Boolean))].sort();
    const engineTypes = uniqueValues('engine_type');
    const drivetrains = uniqueValues('drivetrain');

    return (
        <div style={styles.filterBarContent}> 
            <div style={styles.filterRowTop}>
                <div style={styles.typeButtons}>
                    {['all', 'new', 'used'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilters(prev => ({ ...prev, type: type }))}
                            style={{ ...styles.typeButton, ...(filters.type === type ? styles.activeTypeButton : {}) }}
                        >
                            {type === 'all' ? 'Все' : type === 'new' ? 'Новые' : 'С пробегом'}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <select style={{...styles.select, minWidth: '180px'}}><option>Сортировать: по популярности</option></select>
                    
                    {/* 👇 НАЧАЛО НОВОГО БЛОКА: ПЕРЕКЛЮЧАТЕЛЬ ВИДА */}
                    <div style={styles.viewSwitcher}>
                        <button 
                            onClick={() => onViewChange('grid')} 
                            style={{ ...styles.viewButton, ...(viewMode === 'grid' ? styles.activeViewButton : {}) }}
                            title="Сетка"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h6V5H4v6zm0 7h6v-6H4v6zm8-13v6h6V5h-6zm0 13h6v-6h-6v6z"></path></svg>
                        </button>
                        <button 
                            onClick={() => onViewChange('list')} 
                            style={{ ...styles.viewButton, ...(viewMode === 'list' ? styles.activeViewButton : {}) }}
                            title="Список"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"></path></svg>
                        </button>
                    </div>
                    {/* 👆 КОНЕЦ НОВОГО БЛОКА */}
                    
                    <button onClick={handleReset} style={styles.resetButton}>Сбросить ✕</button>
                </div>
            </div>
            <div style={styles.filterRowBottom}>
                <div style={styles.filterInputGroup}>
                    <select disabled style={{...styles.select, backgroundColor: COLORS.luminousInput, color: COLORS.luminousText, fontWeight: '600'}}>
                        <option>{brandName}</option>
                    </select>
                    <select name="model" value={filters.model} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Модель</option>
                        {models.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
                    </select>
                    <select name="engineType" value={filters.engineType} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Тип двигателя</option>
                        {engineTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <div style={styles.inputRangeContainer}>
                        <input name="yearFrom" type="number" value={filters.yearFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Год от" />
                        <input name="yearTo" type="number" value={filters.yearTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                <div style={styles.filterInputGroup}>
                    <select style={styles.select}><option>Тип кузова</option></select>
                    <select style={styles.select}><option>Коробка</option></select>
                    <select style={styles.select}><option>Опции</option></select>
                    <select name="drivetrain" value={filters.drivetrain} onChange={handleFilterChange} style={styles.select}>
                        <option value="">Привод</option>
                        {drivetrains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div style={styles.inputRangeContainer}>
                        <input name="mileageFrom" type="number" value={filters.mileageFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Пробег от, км" />
                        <input name="mileageTo" type="number" value={filters.mileageTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                </div>
                <div style={styles.filterRowPriceAndButton}>
                    <div style={styles.inputRangeContainerPrice}>
                        <input name="priceFrom" type="number" value={filters.priceFrom} onChange={handleFilterChange} style={{...styles.inputRange, borderRight: 'none'}} placeholder="Цена от, ₽" />
                        <input name="priceTo" type="number" value={filters.priceTo} onChange={handleFilterChange} style={styles.inputRange} placeholder="До" />
                    </div>
                    <button style={styles.showButton}>
                        Показать ({filters.count})
                    </button>
                </div>
            </div>
        </div>
    );
};

// ======================= ЭКСПОРТИРУЕМЫЙ КОМПОНЕНТ-ОБЕРТКА =======================
const FilterBar = (props) => {
    useEffect(() => {
        const styleElement = document.createElement('style');
        if (!document.getElementById('luminous-filterbar-styles')) {
            styleElement.id = 'luminous-filterbar-styles';
            styleElement.innerHTML = LuminousFilterBarStyles;
            document.head.appendChild(styleElement);
        }
    }, []);

    return (
        <div className="luminous-filter-bar">
            <BaseFilterBar {...props} />
        </div>
    );
};

export default FilterBar;