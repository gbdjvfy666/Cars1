import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../other/Button'; 
import { useAutocomplete } from '../hooks/useAutocomplete'; 
import { useFilterState } from '../hooks/useFilterState'; 
import { SmartSearchInput } from '../other/SmartSearchInput';

// ====================================================================
// КОНСТАНТЫ ДЛЯ ФИЛЬТРОВ
// ====================================================================

const BODY_TYPE_OPTIONS = [ { label: 'Тип кузова', value: ''}, { label: 'Седан', value: 'Седан' }, { label: 'Хэтчбек', value: 'Хэтчбек' }, { label: 'Лифтбек', value: 'Лифтбек' }, { label: 'Универсал', value: 'Универсал' }, { label: 'Внедорожник', value: 'Внедорожник' }, { label: 'Купе', value: 'Купе' }, { label: 'Минивэн', value: 'Минивэн' }];
const DRIVETRAIN_OPTIONS = [ { label: 'Привод', value: '' }, { label: 'Передний', value: 'Передний привод' }, { label: 'Задний', value: 'Задний привод' }, { label: 'Полный (4WD)', value: 'Полный привод' }];
const ENGINE_OPTIONS = [ { label: 'Двигатель', value: '' }, { label: 'Бензин', value: 'Двигатель внутреннего сгорания' }, { label: 'Дизель', value: 'Дизельное топливо' }, { label: 'Гибрид', value: 'Гибрид' }, { label: 'Электро', value: 'Электро' }];
const REGION_OPTIONS = [ 
    { label: 'Регион', value: '' }, 
    { label: 'Китайские', value: 'chinese' },
    { label: 'Европейские', value: 'european' },
    { label: 'Американские', value: 'american' },
    { label: 'Японские', value: 'japanese' },
    { label: 'Корейские', value: 'korean' }
];

// ====================================================================
// ОБНОВЛЕННЫЕ CSS СТИЛИ КОМПОНЕНТА
// ====================================================================
const LuminousCardStyles = `
/* ... (ваш @font-face код остается здесь, он не меняется) ... */
@font-face { font-family: "Aeonik Pro Regular"; src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot"); src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot?#iefix") format("embedded-opentype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff2") format("woff2"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff") format("woff"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.ttf") format("truetype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.svg#Aeonik Pro Regular") format("svg"); }

.luminous-card { 
    position: relative; 
    background: radial-gradient(circle at 50% 0%, #3a3a3a 0%, #1a1a1a 64%); 
    box-shadow: inset 0 1.01rem 0.2rem -1rem #fff0, inset 0 -1.01rem 0.2rem -1rem #0000, 0 -1.02rem 0.2rem -1rem #fff0, 0 1rem 0.2rem -1rem #0000, 0 0 0 1px #fff3, 0 4px 4px 0 #0004, 0 0 0 1px #333; 
    width: 24rem; /* РАСШИРЕННАЯ ШИРИНА */
    height: auto; 
    min-height: 28rem; /* УВЕЛИЧЕННАЯ МИН. ВЫСОТА */
    border-radius: 1.8rem; 
    color: #fff; 
    padding: 1.5rem; 
    display: flex; 
    flex-direction: column; 
    justify-content: space-between; 
    transition: all 0.4s ease-in-out, transform 0.4s ease-out; 
    font-family: "Aeonik Pro Regular", sans-serif; 
    font-size: clamp(10px, min(2vw, 3vh), 24px); 
    box-sizing: border-box; 
}

.luminous-card::before { content: ""; display: block; --offset: 1rem; width: calc(100% + 2 * var(--offset)); height: calc(100% + 2 * var(--offset)); position: absolute; left: calc(-1 * var(--offset)); top: calc(-1 * var(--offset)); margin: auto; box-shadow: inset 0 0 0px 0.06rem #fff2; border-radius: 2.6rem; --ax: 4rem; clip-path: polygon( var(--ax) 0, 0 0, 0 var(--ax), var(--ax) var(--ax), var(--ax) calc(100% - var(--ax)), 0 calc(100% - var(--ax)), 0 100%, var(--ax) 100%, var(--ax) calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) 100%, 100% 100%, 100% calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) var(--ax), 100% var(--ax), 100% 0, calc(100% - var(--ax)) 0, calc(100% - var(--ax)) var(--ax), var(--ax) var(--ax) ); transition: all 0.4s ease-in-out; }
.luminous-card:hover { transform: translateY(-0.2rem); }
.luminous-card:hover::before { --offset: 0.5rem; --ax: 8rem; border-radius: 2.2rem; box-shadow: inset 0 0 0 0.08rem #fff1; }

.luminous-card__tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; width: 100%; }
.luminous-card__tab { flex: 1; padding: 0.5rem 1rem; font-size: 0.9rem; border: 1px solid #fff3; background-color: transparent; color: #ccc; border-radius: 1.25rem; cursor: pointer; transition: all 0.2s ease-in-out; text-align: center; }
.luminous-card__tab:hover { background-color: #fff1; border-color: #fff5; }
.luminous-card__tab--active { background-color: #E30016; color: #fff; border-color: #E30016; font-weight: bold; }

/* НОВЫЙ СТИЛЬ: Контейнер поиска */
.luminous-card__search-container {
    margin-bottom: 1.5rem;
    position: relative;
    /* Стиль для SmartSearchInput, если он не стилизован отдельно */
    /* width: 100%; */
}

/* Стили для сетки фильтров */
.luminous-card__filters { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.luminous-card__select-wrapper { position: relative; }
.luminous-card__select { width: 100%; padding: 0.7rem; background-color: #2c2c2c; color: #fff; border: 1px solid #fff3; border-radius: 0.5rem; appearance: none; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
.luminous-card__select-wrapper::after { content: '▼'; position: absolute; top: 50%; transform: translateY(-50%); right: 0.8rem; font-size: 0.7rem; color: #aaa; pointer-events: none; }

/* Стили для полей ввода цены */
.luminous-card__price-input { 
    width: 100%; 
    padding: 0.7rem; 
    background-color: #2c2c2c; 
    color: #fff; 
    border: 1px solid #fff3; 
    border-radius: 0.5rem; 
    font-family: inherit; 
    font-size: 0.9rem; 
    box-sizing: border-box; 
    line-height: normal;
}

/* Стили для футера */
.luminous-card__footer { display: flex; flex-direction: column; align-items: center; margin-top: auto; padding-top: 1rem; }
.luminous-card__reset-button { 
    background: none; 
    border: none; 
    box-shadow: none; 
    color: #aaa; 
    cursor: pointer; 
    padding: 0; 
    margin-bottom: 0.3rem; 
    font-size: 0.7rem; 
    text-decoration: none; 
    transition: color 0.2s; 
}
.luminous-card__reset-button:hover { color: #fff; text-decoration: underline; }

.luminous-card__submit-button { width: 100%; margin-top: 0; padding: 1rem; font-size: 1rem; font-weight: bold; background-color: #E30016; color: #fff; border-radius: 0.5rem; box-shadow: none; transition: background-color 0.2s; }
.luminous-card__submit-button:hover { box-shadow: none; background-color: #c40013; }
`;

// ====================================================================
// ФУНКЦИОНАЛЬНЫЙ КОМПОНЕНТ LuminousCard С ИНТЕГРАЦИЕЙ useFilterState
// ====================================================================

const LuminousCard = () => {
    const navigate = useNavigate();
    
    // 1. Инициализируем useAutocomplete
    const autocomplete = useAutocomplete(); 
    
    // 2. Инициализируем useFilterState, получая методы и состояние
    const {
        currentFilters,
        handleFilterChange,
        handlePriceChange,
        handleResetFilters,
        handleApplyFilters,
    } = useFilterState(autocomplete); // Передаем autocomplete
    
    // Функция для форматирования цены
    const formatPrice = p => {
        if (p === '' || p === null || p === undefined) return '';
        const n = Number(p);
        if (!isFinite(n)) return '';
        if (n === 0) return '0';
        if (n > 0 && n < 30000000) return n.toLocaleString('ru-RU');
        return '';
    };

    // Эффект для встраивания стилей
    useEffect(() => {
        const styleElement = document.createElement('style');
        if (!document.getElementById('luminous-card-styles')) {
            styleElement.id = 'luminous-card-styles';
            styleElement.innerHTML = LuminousCardStyles;
            document.head.appendChild(styleElement);
        }
    }, []);

    // Логика перехода на страницу поиска после применения фильтров
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
        
        // Маппинг фильтров к параметрам URL
        if (currentFilters.condition && currentFilters.condition !== 'all') append('condition', currentFilters.condition);
        append('bodyType', currentFilters.bodyType);
        append('engineType', currentFilters.engineType); 
        append('drivetrain', currentFilters.drivetrain);
        if (currentFilters.origin && currentFilters.origin !== '') append('origin', currentFilters.origin); 
        
        // Отправляем priceFrom только если это непустая строка и число (включая 0)
        if (currentFilters.priceFrom !== '' && currentFilters.priceFrom !== null && currentFilters.priceFrom !== undefined && !isNaN(Number(currentFilters.priceFrom))) {
            append('priceFrom', Number(currentFilters.priceFrom));
        }
        // Отправляем priceTo только если непустое и число
        if (currentFilters.priceTo !== '' && currentFilters.priceTo !== null && currentFilters.priceTo !== undefined && !isNaN(Number(currentFilters.priceTo))) {
            append('priceTo', Number(currentFilters.priceTo));
        }

        if (autocomplete.inputValue) params.append('searchTerm', autocomplete.inputValue);

        navigate(`/search?${params.toString()}`);
    };

    const getTabClassName = (tabName) => {
        return `luminous-card__tab ${currentFilters.condition === tabName ? 'luminous-card__tab--active' : ''}`;
    };

    return (
        <div className="luminous-card">
            <div className="luminous-card__header">
                <div className="luminous-card__tabs">
                    <button className={getTabClassName('all')} onClick={() => handleFilterChange('condition', 'all')}>Все</button>
                    <button className={getTabClassName('new')} onClick={() => handleFilterChange('condition', 'new')}>Новые</button>
                    <button className={getTabClassName('used')} onClick={() => handleFilterChange('condition', 'used')}>С пробегом</button>
                </div>
            </div>

            {/* ИНТЕГРАЦИЯ ПОИСКОВОГО ИНПУТА с использованием спреда {...autocomplete} */}
            <div className="luminous-card__search-container">
                <SmartSearchInput 
                    {...autocomplete} 
                    placeholder="Марка, модель, название..."
                />
            </div>
            {/* ----------------------------------- */}

            <div className="luminous-card__body">
                <div className="luminous-card__filters">
                    {/* --- Ряд 1 --- */}
                    <div className="luminous-card__select-wrapper">
                        <select value={currentFilters.bodyType} onChange={(e) => handleFilterChange('bodyType', e.target.value)} className="luminous-card__select">
                            {BODY_TYPE_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="luminous-card__select-wrapper">
                        <select value={currentFilters.engineType} onChange={(e) => handleFilterChange('engineType', e.target.value)} className="luminous-card__select">
                            {ENGINE_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* --- Ряд 2 --- */}
                    <div className="luminous-card__select-wrapper">
                        <select value={currentFilters.drivetrain || ''} onChange={(e) => handleFilterChange('drivetrain', e.target.value)} className="luminous-card__select">
                            {DRIVETRAIN_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="luminous-card__select-wrapper">
                        <select value={currentFilters.origin || ''} onChange={(e) => handleFilterChange('origin', e.target.value)} className="luminous-card__select">
                            {REGION_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    
                    {/* --- Ряд 3 (Цена) --- */}
                    <input 
                        name="priceFrom"
                        type="text" 
                        placeholder="Цена от, ₽" 
                        value={formatPrice(currentFilters.priceFrom)}
                        onChange={handlePriceChange}
                        className="luminous-card__price-input"
                    />
                    <input 
                        name="priceTo"
                        type="text" 
                        placeholder="Цена до, ₽" 
                        value={formatPrice(currentFilters.priceTo)}
                        onChange={handlePriceChange}
                        className="luminous-card__price-input"
                    />
                </div>
            </div>

            <div className="luminous-card__footer">
                <button onClick={handleResetFilters} className="luminous-card__reset-button">Сбросить</button>
                
                <Button 
                    className="luminous-card__submit-button" 
                    onClick={handleFinalSearch}
                >
                    Подобрать
                </Button>
            </div>
        </div>
    );
};

export default LuminousCard;