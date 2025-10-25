// CarDetailsPanel.js

import React, { useState } from 'react';

// =======================================================================
// 🎨 ЛОКАЛЬНЫЕ СТИЛИ ДЛЯ CarDetailsPanel
// =======================================================================
const localStyles = {
    detailsColumn: {
        padding: '24px',
        backgroundColor: '#1c1c1c',
        borderRadius: '12px',
        border: '1px solid #333',
        color: '#f0f0f0',
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative', 
    },
    carTitle: { 
        fontSize: '28px', 
        fontWeight: 'bold', 
        margin: '0 0 24px 0', 
        color: '#f0f0f0', 
        lineHeight: 1.3, 
    },
    specsTable: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: '20px', 
        padding: '20px', 
        backgroundColor: '#242424', 
        borderRadius: '8px', 
        border: '1px solid #333', 
    },
    specItem: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px', 
    },
    specKey: { 
        color: '#999', 
        fontSize: '14px', 
    },
    specValue: { 
        color: '#f0f0f0', 
        fontWeight: '500', 
        fontSize: '16px', 
    },
    divider: { 
        margin: '24px 0', 
        borderBottom: '1px solid #333', 
    },
    colors: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '24px', 
    },
    colorSwatches: { 
        display: 'flex', 
        gap: '8px', 
    },
    colorSwatch: { 
        width: '24px', 
        height: '24px', 
        borderRadius: '50%', 
        border: '2px solid #242424', 
        cursor: 'pointer', 
        boxShadow: '0 0 0 1px #444', 
        transition: 'border-color 0.2s',
    },
    colorSwatchActive: {
        width: '24px', 
        height: '24px', 
        borderRadius: '50%', 
        border: '3px solid #E30016', 
        cursor: 'pointer', 
        boxShadow: '0 0 0 1px #444',
    },
    
    // Блок цены в Китае (меньший блок)
    priceChinaBlock: { 
        padding: '12px 20px',
        backgroundColor: '#242424', 
        borderRadius: '8px', 
        border: '1px solid #333', 
        marginBottom: '20px',
        textAlign: 'center',
    },
    priceChinaText: {
        fontSize: '18px', 
        color: '#f0f0f0', 
        margin: '0', 
    },
    
    // Стиль для основной КРАСНОЙ кнопки внизу
    finalOrderButton: { 
        width: '100%', 
        padding: '12px 20px',
        backgroundColor: '#E30016', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '18px', 
        fontWeight: 'bold', 
        cursor: 'pointer', 
        transition: 'background-color 0.2s', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px',
    },
    finalOrderButtonPrice: { 
        fontSize: '32px', 
        fontWeight: 'bold', 
        color: '#f0f0f0', 
        margin: '4px 0 0 0', 
    },
    finalOrderButtonLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
        fontWeight: 'normal',
    },

    deliveryInfo: { 
        fontSize: '13px', 
        color: '#bbb', 
        margin: '20px 0', 
        padding: '12px 16px', 
        backgroundColor: '#242424', 
        borderRadius: '8px', 
        border: '1px solid #333', 
        display: 'flex', 
        alignItems: 'center', 
    },
    alertIcon: { 
        color: '#E30016', 
        marginRight: '8px', 
        fontWeight: 'bold', 
    },
    
    // Калькулятор и его детали
    calcToggleButton: { 
        fontSize: '14px', 
        color: '#34a853', 
        fontWeight: '500', 
        cursor: 'pointer', 
        marginTop: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        userSelect: 'none', 
    },
    calcArrow: { 
        fontSize: '10px', 
        transition: 'transform 0.2s ease-in-out', 
    },
    calcDetailsWrapper: { 
        marginTop: '20px', 
        paddingTop: '20px', 
        borderTop: '1px solid #333', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        marginBottom: '30px', 
    },
    calcRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        paddingBottom: '16px', 
        borderBottom: '1px solid #333', 
    },
    calcTotalRow: { 
        paddingBottom: '16px', 
        marginBottom: '8px', 
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#E30016'
    },
    calcLabel: { 
        fontSize: '16px', 
        color: '#e0e0e0', 
        fontWeight: '500', 
    },
    calcDescription: { 
        fontSize: '13px', 
        color: '#888', 
        margin: '4px 0 0 0', 
        maxWidth: '300px', 
    },
    calcValue: { 
        fontSize: '16px', 
        color: '#f0f0f0', 
        fontWeight: '600', 
        textAlign: 'right', 
        whiteSpace: 'nowrap', 
        marginLeft: '16px', 
    },
};

/**
 * 📊 Компонент правой панели с деталями автомобиля, ценами и калькулятором.
 * @param {object} props
 * @param {object} props.car - Объект с данными об автомобиле.
 */
const CarDetailsPanel = ({ car }) => {
    // Деструктурируем ЛОКАЛЬНЫЙ объект styles
    const { 
        detailsColumn, carTitle, specsTable, specItem, specKey, specValue, 
        divider, colors, colorSwatches, colorSwatch, colorSwatchActive, 
        priceChinaBlock, priceChinaText, finalOrderButton, finalOrderButtonPrice, finalOrderButtonLabel, 
        deliveryInfo, alertIcon,
        calcToggleButton, calcArrow, calcDetailsWrapper, calcRow, calcTotalRow,
        calcLabel, calcDescription, calcValue
    } = localStyles;

    const [showCalculator, setShowCalculator] = useState(false);
    const [selectedColor, setSelectedColor] = useState(car.colors?.[0]?.name || 'Н/Д');

    const specs = car.specs || {};
    const hasDeliveryInfo = true; // Для демонстрации

    // ⚠️ ЛОГИКА РАСЧЕТА С НОВОЙ КОМИССИЕЙ
    const basePrice = car.price_russia || 0;
    const customsDuty = basePrice * 0.2; 
    const certification = 80000;
    const nsbhCommission = 240000; // НОВАЯ КОМИССИЯ NSBHAuto
    
    const totalCost = basePrice + customsDuty + certification + nsbhCommission; // Обновленный итог

    return (
        <div style={detailsColumn}>
            <h2 style={carTitle}>{car.name}</h2>

            {/* Блок характеристик */}
            <div style={specsTable}>
                <div style={specItem}>
                    <span style={specKey}>Двигатель</span>
                    <span style={specValue}>{specs.engine_type || 'Н/Д'}</span>
                </div>
                <div style={specItem}>
                    <span style={specKey}>Мощность</span>
                    <span style={specValue}>{specs.engine_power || 'Н/Д'} л.с.</span>
                </div>
                <div style={specItem}>
                    <span style={specKey}>Коробка</span>
                    <span style={specValue}>{specs.transmission_type || 'Н/Д'}</span>
                </div>
                <div style={specItem}>
                    <span style={specKey}>Привод</span>
                    <span style={specValue}>{specs.drive_type || 'Н/Д'}</span>
                </div>
                <div style={specItem}>
                    <span style={specKey}>Пробег</span>
                    <span style={specValue}>{car.mileage ? `${(car.mileage / 1000).toFixed(0)} тыс. км` : 'Н/Д'}</span>
                </div>
            </div>

            <div style={divider} />

            {/* Выбор цвета */}
            <div style={colors}>
                <span style={specKey}>Цвет кузова:</span>
                <div style={colorSwatches}>
                    {(car.colors || []).map((color, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                ...(selectedColor === color.name ? colorSwatchActive : colorSwatch), 
                                backgroundColor: color.hex_code || '#fff' 
                            }}
                            onClick={() => setSelectedColor(color.name)}
                            title={color.name}
                        />
                    ))}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedColor}</span>
            </div>

            <div style={divider} />
            
            {/* Блок цены в Китае */}
            <div style={priceChinaBlock}>
                <p style={priceChinaText}>Цена в Китае: {car.price_china ? car.price_china.toLocaleString('ru-RU') + ' ¥' : 'Н/Д'}</p>
            </div>
            
            {hasDeliveryInfo && (
                <div style={deliveryInfo}>
                    <span style={alertIcon}>!</span>
                    Срок доставки: 25-45 дней. Цена включает доставку до Москвы и таможенное оформление.
                </div>
            )}
            
            {/* Калькулятор стоимости (Кнопка-переключатель) */}
            <div style={calcToggleButton} onClick={() => setShowCalculator(!showCalculator)}>
                Показать детали стоимости
                <span style={{ ...calcArrow, transform: showCalculator ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            </div>
            
            {/* Детали калькулятора (скрываемый блок) */}
            {showCalculator && (
                <div style={calcDetailsWrapper}>
                    <div style={calcRow}>
                        <div style={calcLabel}>Базовая стоимость авто в РФ</div>
                        <div style={calcValue}>{basePrice.toLocaleString('ru-RU')} ₽</div>
                    </div>
                    {/* ⚠️ НОВАЯ СТРОКА: КОМИССИЯ NSBHAuto */}
                    <div style={calcRow}>
                        <div>
                            <div style={calcLabel}>Комиссия NSBHAuto</div>
                            <p style={calcDescription}>Стоимость услуг по подбору, проверке, выкупу и сопровождению сделки.</p>
                        </div>
                        <div style={calcValue}>+ {nsbhCommission.toLocaleString('ru-RU')} ₽</div>
                    </div>
                    <div style={calcRow}>
                        <div>
                            <div style={calcLabel}>Таможенная пошлина</div>
                            <p style={calcDescription}>Включает НДС, акциз и пошлину за объем двигателя.</p>
                        </div>
                        <div style={calcValue}>+ {customsDuty.toLocaleString('ru-RU')} ₽</div>
                    </div>
                    <div style={calcRow}>
                        <div>
                            <div style={calcLabel}>Сертификация и ЭПТС</div>
                            <p style={calcDescription}>Получение СБКТС, установка ЭРА-ГЛОНАСС и оформление ЭПТС.</p>
                        </div>
                        <div style={calcValue}>+ {certification.toLocaleString('ru-RU')} ₽</div>
                    </div>
                    <div style={calcTotalRow}>
                        <div style={calcLabel}>Итоговая стоимость</div>
                        <div style={calcValue}>{totalCost.toLocaleString('ru-RU')} ₽</div>
                    </div>
                </div>
            )}
            
            {/* КНОПКА С ИТОГОВОЙ ЦЕНОЙ В САМОМ НИЗУ */}
            <button style={finalOrderButton}>
                <span style={finalOrderButtonLabel}>Заказать {car.brand || ''} {car.model || ''} (Цена под ключ)</span>
                <span style={finalOrderButtonPrice}>
                    {(totalCost || 0).toLocaleString('ru-RU')} ₽
                </span>
            </button>
        </div>
    );
};

export default CarDetailsPanel;