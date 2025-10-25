// File: src/components/HorizontalFilterBar.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { useFilterState } from '../../hooks/useFilterState';
import { SmartSearchInput } from '../../other/SmartSearchInput';

// ====================================================================
// КОНСТАНТЫ И ОПЦИИ (без изменений)
// ====================================================================
const BODY_TYPE_OPTIONS = [ { label: 'Тип кузова', value: ''}, { label: 'Седан', value: 'Седан' }, { label: 'Хэтчбек', value: 'Хэтчбек' }, { label: 'Лифтбек', value: 'Лифтбек' }, { label: 'Универсал', value: 'Универсал' }, { label: 'Внедорожник', value: 'Внедорожник' }, { label: 'Купе', value: 'Купе' }, { label: 'Минивэн', value: 'Минивэн' }];
const DRIVETRAIN_OPTIONS = [ { label: 'Привод', value: '' }, { label: 'Передний', value: 'Передний привод' }, { label: 'Задний', value: 'Задний привод' }, { label: 'Полный (4WD)', value: 'Полный привод' }];
const ENGINE_OPTIONS = [ { label: 'Двигатель', value: '' }, { label: 'Бензин', value: 'Двигатель внутреннего сгорания' }, { label: 'Дизель', value: 'Дизельное топливо' }, { label: 'Гибрид', value: 'Гибрид' }, { label: 'Электро', value: 'Электро' }];
const REGION_OPTIONS = [ { label: 'Регион', value: '' }, { label: 'Китайские', value: 'chinese' }, { label: 'Европейские', value: 'european' }, { label: 'Американские', value: 'american' }, { label: 'Японские', value: 'japanese' }, { label: 'Корейские', value: 'korean' }];

// ====================================================================
// ОБНОВЛЕННЫЕ CSS СТИЛИ
// ====================================================================
const HorizontalBarStyles = `
/* ... (основные стили без изменений) ... */
@font-face { font-family: "Aeonik Pro Regular"; src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot"); src: url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.eot?#iefix") format("embedded-opentype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff2") format("woff2"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.woff") format("woff"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.ttf") format("truetype"), url("https://db.onlinewebfonts.com/t/12ff62164c9778917bddb93c6379cf47.svg#Aeonik Pro Regular") format("svg"); }
.luminous-horizontal-bar { position: relative; width: 100%; margin-bottom: 40px; background: radial-gradient(circle at 50% 0%, #3a3a3a 0%, #1a1a1a 64%); box-shadow: inset 0 1rem 0.2rem -1rem #fff0, inset 0 -1rem 0.2rem -1rem #0000, 0 0 0 1px #fff3, 0 4px 4px 0 #0004, 0 0 0 1px #333; border-radius: 1.8rem; padding: 1.5rem; box-sizing: border-box; font-family: "Aeonik Pro Regular", sans-serif; transition: padding-bottom 0.3s ease-in-out; }
.luminous-horizontal-bar::before { content: ""; display: block; --offset: 1rem; width: calc(100% + 2 * var(--offset)); height: calc(100% + 2 * var(--offset)); position: absolute; left: calc(-1 * var(--offset)); top: calc(-1 * var(--offset)); margin: auto; box-shadow: inset 0 0 0px 0.06rem #fff2; border-radius: 2.6rem; --ax: 4rem; clip-path: polygon( var(--ax) 0, 0 0, 0 var(--ax), var(--ax) var(--ax), var(--ax) calc(100% - var(--ax)), 0 calc(100% - var(--ax)), 0 100%, var(--ax) 100%, var(--ax) calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) 100%, 100% 100%, 100% calc(100% - var(--ax)), calc(100% - var(--ax)) calc(100% - var(--ax)), calc(100% - var(--ax)) var(--ax), 100% var(--ax), 100% 0, calc(100% - var(--ax)) 0, calc(100% - var(--ax)) var(--ax), var(--ax) var(--ax) ); transition: all 0.4s ease-in-out; pointer-events: none; }
.filter-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; color: #fff; }
.filter-tabs { display: flex; gap: 0.5rem; background-color: #2c2c2c; border-radius: 1.25rem; padding: 4px; border: 1px solid #fff3; }
.filter-tab { flex: 1; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: transparent; color: #ccc; border: none; border-radius: 1rem; cursor: pointer; transition: all 0.2s ease-in-out; text-align: center; white-space: nowrap; }
.filter-tab:hover { background-color: rgba(255,255,255,0.1); }
.filter-tab.active { background-color: #E30016; color: #fff; font-weight: bold; box-shadow: 0 2px 8px rgba(227, 0, 22, 0.3); }
.filter-select, .filter-input { width: 100%; padding: 0.7rem; background-color: #2c2c2c; color: #fff; border: 1px solid #fff3; border-radius: 0.5rem; font-family: inherit; font-size: 0.9rem; box-sizing: border-box; }
.filter-select { appearance: none; cursor: pointer; }
.filter-item { flex: 1 1 150px; }
.filter-search-input { flex: 2 1 250px; }
.filter-actions { display: flex; gap: 1rem; align-items: center; }
.filter-submit { padding: 0.7rem 1.5rem; font-size: 0.9rem; font-weight: bold; background-color: #E30016; color: #fff; border: none; border-radius: 0.5rem; cursor: pointer; transition: background-color 0.2s; }
.filter-submit:hover { background-color: #c40013; }
.filter-reset { background: none; border: none; color: #aaa; cursor: pointer; font-size: 0.8rem; text-decoration: none; transition: color 0.2s; }
.filter-reset:hover { color: #fff; text-decoration: underline; }
.expanded-filters { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem 1.5rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #444; animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.8rem; color: #aaa; margin-bottom: 0.25rem; }
.input-range { display: flex; gap: 0.5rem; }
.special-offers { grid-column: 1 / -1; display: flex; flex-direction: row; align-items: center; gap: 1.5rem; }
.checkbox-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.checkbox-item input { cursor: pointer; }
.expand-button-container { display: flex; justify-content: center; margin-top: 1.5rem; }
.expand-button { background: none; border: 1px solid #555; color: #ccc; padding: 0.5rem 1.25rem; border-radius: 2rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; transition: all 0.2s ease-in-out; }
.expand-button:hover { background-color: #333; border-color: #777; color: #fff; }
.expand-button svg { transition: transform 0.3s ease-in-out; }
.input-with-prefix { position: relative; width: 100%; }
.input-with-prefix::before { content: attr(data-prefix); position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: #888; font-size: 0.9rem; pointer-events: none; }
.input-with-prefix .filter-input { padding-left: 2.2rem !important; }

/* === НОВЫЕ СТИЛИ ДЛЯ УДАЛЕНИЯ СТРЕЛОК У ЧИСЛОВЫХ ПОЛЕЙ === */
/* Для Chrome, Safari, Edge, Opera */
.filter-input[type="number"]::-webkit-outer-spin-button,
.filter-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Для Firefox */
.filter-input[type="number"] {
  -moz-appearance: textfield;
}
`;

// ====================================================================
// КОМПОНЕНТ HorizontalFilterBar (JSX БЕЗ ИЗМЕНЕНИЙ)
// ====================================================================

const HorizontalFilterBar = () => {
     const navigate = useNavigate();
     const location = useLocation();
     const autocomplete = useAutocomplete();
     const {
         currentFilters,
         handleFilterChange,
         handlePriceChange,
         handleResetFilters,
         handleApplyFilters,
     } = useFilterState(autocomplete);

     const [isExpanded, setIsExpanded] = useState(false);
     const rootRef = useRef(null);

     useEffect(() => {
         const styleElement = document.createElement('style');
         if (!document.getElementById('horizontal-bar-styles')) {
             styleElement.id = 'horizontal-bar-styles';
             styleElement.innerHTML = HorizontalBarStyles;
             document.head.appendChild(styleElement);
         }
     }, []);

     const handleFinalSearch = () => {
         // Составляем окончательный набор фильтров, беря значения из DOM (гарантированно включает разворачиваемые поля)
         const newFilters = { ...currentFilters };
         // Если в URL есть brandSlug — подмешиваем его (не теряем выбранные бренды)
         if (location && location.search) {
             const urlParams = new URLSearchParams(location.search);
             const brandsFromUrl = urlParams.getAll('brandSlug');
             if (brandsFromUrl && brandsFromUrl.length > 0) {
                 // если newFilters.brandSlug пустой — ставим; если уже массив — объединяем уникально
                 const exist = Array.isArray(newFilters.brandSlug) ? newFilters.brandSlug : (newFilters.brandSlug ? [newFilters.brandSlug] : []);
                 const merged = Array.from(new Set([...exist, ...brandsFromUrl]));
                 newFilters.brandSlug = merged;
             }
         }
         if (rootRef.current) {
             const elems = rootRef.current.querySelectorAll('input[name], select[name]');
             elems.forEach(el => {
                 const name = el.getAttribute('name');
                 if (!name) return;
                 if (el.type === 'checkbox') {
                     newFilters[name] = el.checked;
                 } else if (el.tagName.toLowerCase() === 'select') {
                     newFilters[name] = el.value;
                 } else {
                     const v = el.value;
                     if (v === '' || v === null) {
                         newFilters[name] = '';
                     } else if (!isNaN(v) && el.type === 'number') {
                         newFilters[name] = Number(v);
                     } else if (!isNaN(v) && el.type === 'text' && /^\d+(\.\d+)?$/.test(v)) {
                         newFilters[name] = Number(v);
                     } else {
                         newFilters[name] = v;
                     }
                 }
             });
         }

         // Синхронизируем hook-state (currentFilters) — это важно, чтобы внутренняя логика тоже увидела изменения
         Object.keys(newFilters).forEach(key => {
             // не обновляем если значение не изменилось (минимизация ререндеров)
             if (currentFilters[key] !== newFilters[key]) {
                 handleFilterChange(key, newFilters[key]);
             }
         });

         // Применяем фильтры в hook (апплай)
         handleApplyFilters();

         // Формируем query и навигируем
         const params = new URLSearchParams();
         const append = (key, value) => {
             if (value !== null && value !== undefined && value !== '' && value !== false) {
                 if (Array.isArray(value)) value.forEach(v => params.append(key, v));
                 else params.append(key, value);
             }
         };

         if (newFilters.condition && newFilters.condition !== 'all') append('condition', newFilters.condition);
         append('bodyType', newFilters.bodyType);
         append('engineType', newFilters.engineType);
         append('drivetrain', newFilters.drivetrain);
         append('origin', newFilters.origin);
         append('priceFrom', newFilters.priceFrom);
         append('priceTo', newFilters.priceTo);
         if (autocomplete.inputValue) append('searchTerm', autocomplete.inputValue);

         append('yearFrom', newFilters.yearFrom);
         append('yearTo', newFilters.yearTo);
         append('mileageFrom', newFilters.mileageFrom);
         append('mileageTo', newFilters.mileageTo);
         append('powerFrom', newFilters.powerFrom);
         append('powerTo', newFilters.powerTo);
         append('displacementFrom', newFilters.displacementFrom);
         append('displacementTo', newFilters.displacementTo);
         if (newFilters.withDiscount) append('withDiscount', true);
         if (newFilters.withGift) append('withGift', true);
         if (newFilters.withPromo) append('withPromo', true);

         // Передаем brandSlug (массив), если есть
         append('brandSlug', newFilters.brandSlug);

         navigate(`/search?${params.toString()}`);
     };

     const getTabClassName = (tabName) => `filter-tab ${currentFilters.condition === tabName ? 'active' : ''}`;

     // НОВАЯ ФУНКЦИЯ: при переключении чекбокса сразу обновляем фильтр и навигируем с новым набором параметров
     const handleCheckboxChange = (e) => {
         const { name, checked } = e.target;
         // Обновляем внутреннее состояние фильтров (useFilterState)
         handleFilterChange(name, checked);

         // Формируем query с учётом нового состояния чекбокса и текущих brandSlug из URL (чтобы они не терялись)
         const newFilters = { ...currentFilters, [name]: checked };
         if (location && location.search) {
             const urlParams = new URLSearchParams(location.search);
             const brandsFromUrl = urlParams.getAll('brandSlug');
             if (brandsFromUrl && brandsFromUrl.length > 0) {
                 const exist = Array.isArray(newFilters.brandSlug) ? newFilters.brandSlug : (newFilters.brandSlug ? [newFilters.brandSlug] : []);
                 newFilters.brandSlug = Array.from(new Set([...exist, ...brandsFromUrl]));
             }
         }

         const params = new URLSearchParams();
         const append = (key, value) => {
             if (value !== null && value !== undefined && value !== '' && value !== false) {
                 if (Array.isArray(value)) value.forEach(v => params.append(key, v));
                 else params.append(key, value);
             }
         };

         if (newFilters.condition && newFilters.condition !== 'all') append('condition', newFilters.condition);
         append('bodyType', newFilters.bodyType);
         append('engineType', newFilters.engineType);
         append('drivetrain', newFilters.drivetrain);
         append('origin', newFilters.origin);
         append('priceFrom', newFilters.priceFrom);
         append('priceTo', newFilters.priceTo);
         if (autocomplete.inputValue) append('searchTerm', autocomplete.inputValue);

         // Передаем brandSlug (массив), если есть
         append('brandSlug', newFilters.brandSlug);

         navigate(`/search?${params.toString()}`);
     };

     return (
         <div className="luminous-horizontal-bar" ref={rootRef}>
             {/* --- ОСНОВНАЯ ПАНЕЛЬ ФИЛЬТРОВ --- */}
             <div className="filter-controls">
                 <div className="filter-tabs">
                     <button className={getTabClassName('all')} onClick={() => handleFilterChange('condition', 'all')}>Все</button>
                     <button className={getTabClassName('new')} onClick={() => handleFilterChange('condition', 'new')}>Новые</button>
                     <button className={getTabClassName('used')} onClick={() => handleFilterChange('condition', 'used')}>С пробегом</button>
                 </div>
                 <div className="filter-item filter-search-input">
                     <SmartSearchInput {...autocomplete} placeholder="Марка, модель..."/>
                 </div>
                 <div className="filter-item">
                     <select value={currentFilters.bodyType || ''} onChange={(e) => handleFilterChange('bodyType', e.target.value)} className="filter-select">
                         {BODY_TYPE_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                     </select>
                 </div>
                 <div className="filter-item">
                     <select value={currentFilters.engineType || ''} onChange={(e) => handleFilterChange('engineType', e.target.value)} className="filter-select">
                         {ENGINE_OPTIONS.map(opt => <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>)}
                     </select>
                 </div>
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
                 <div className="filter-item input-with-prefix" data-prefix="от ₽">
                     <input name="priceFrom" type="number" value={currentFilters.priceFrom || ''} onChange={handlePriceChange} className="filter-input"/>
                 </div>
                 <div className="filter-item input-with-prefix" data-prefix="до ₽">
                     <input name="priceTo" type="number" value={currentFilters.priceTo || ''} onChange={handlePriceChange} className="filter-input"/>
                 </div>
                 <div className="filter-actions">
                     <button className="filter-submit" onClick={handleFinalSearch}>Показать</button>
                     <button onClick={handleResetFilters} className="filter-reset">Сбросить</button>
                 </div>
             </div>

             {/* --- РАСШИРЕННАЯ ПАНЕЛЬ --- */}
             {isExpanded && (
                 <div className="expanded-filters">
                     <div className="filter-group special-offers">
                         <label className="checkbox-item">
                             <input type="checkbox" name="withDiscount" checked={!!currentFilters.withDiscount} onChange={handleCheckboxChange} />
                             Со скидкой
                         </label>
                          <label className="checkbox-item">
                             <input type="checkbox" name="withGift" checked={!!currentFilters.withGift} onChange={handleCheckboxChange} />
                             С подарком
                         </label>
                          <label className="checkbox-item">
                             <input type="checkbox" name="withPromo" checked={!!currentFilters.withPromo} onChange={handleCheckboxChange} />
                             Акции
                         </label>
                     </div>

                     <div className="filter-group">
                         <label>Год выпуска</label>
                         <div className="input-range">
                             <div className="input-with-prefix" data-prefix="от">
                                 <input name="yearFrom" type="number" value={currentFilters.yearFrom || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                             <div className="input-with-prefix" data-prefix="до">
                                 <input name="yearTo" type="number" value={currentFilters.yearTo || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                         </div>
                     </div>
                     <div className="filter-group">
                         <label>Пробег, км</label>
                         <div className="input-range">
                             <div className="input-with-prefix" data-prefix="от">
                                 <input name="mileageFrom" type="number" value={currentFilters.mileageFrom || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                             <div className="input-with-prefix" data-prefix="до">
                                 <input name="mileageTo" type="number" value={currentFilters.mileageTo || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                         </div>
                     </div>
                      <div className="filter-group">
                         <label>Объем двигателя, л</label>
                         <div className="input-range">
                             <div className="input-with-prefix" data-prefix="от">
                                 <input name="displacementFrom" type="number" value={currentFilters.displacementFrom || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                             <div className="input-with-prefix" data-prefix="до">
                                 <input name="displacementTo" type="number" value={currentFilters.displacementTo || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                         </div>
                     </div>
                      <div className="filter-group">
                         <label>Мощность, л.с.</label>
                         <div className="input-range">
                             <div className="input-with-prefix" data-prefix="от">
                                 <input name="powerFrom" type="number" value={currentFilters.powerFrom || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                             <div className="input-with-prefix" data-prefix="до">
                                 <input name="powerTo" type="number" value={currentFilters.powerTo || ''} onChange={handlePriceChange} className="filter-input" />
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- КНОПКА --- */}
             <div className="expand-button-container">
                 <button className="expand-button" onClick={() => setIsExpanded(!isExpanded)}>
                     {isExpanded ? 'Свернуть' : 'Расширенный поиск'}
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                         <polyline points="6 9 12 15 18 9"></polyline>
                     </svg>
                 </button>
             </div>
         </div>
     );
};

export default HorizontalFilterBar;