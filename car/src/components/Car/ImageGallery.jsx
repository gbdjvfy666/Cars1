// ImageGallery.js (Финальная темная версия)

import React, { useState, useEffect } from 'react';

// =======================================================================
// 🎨 ЛОКАЛЬНЫЕ СТИЛИ ДЛЯ ImageGallery
// =======================================================================
const localStyles = {
    // ⚠️ НОВЫЙ ОБЩИЙ КОНТЕЙНЕР ДЛЯ ВСЕЙ СЕКЦИИ
    galleryContainerWrapper: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1c1c1c', // Темный фон для всей секции
        borderRadius: '12px',      // Скругленные углы
        border: '1px solid #333',  // Общая рамка
        color: '#f0f0f0',          // Светлый цвет текста по умолчанию
        gap: '12px',
        padding: '20px 20px 24px 20px', // Внутренние отступы, чтобы галерея и сводка не прилипали
    },
    
    // Стили галереи (теперь без рамок и фонов)
    galleryContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    mainImageWrapper: {
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#242424',
        border: '1px solid #333',
    },
    mainImage: {
        width: '100%',
        display: 'block',
        aspectRatio: '16 / 10',
        objectFit: 'cover',
    },
    // ... (Остальные стили изображений/тегов не меняются)
    imageTags: {
        position: 'absolute',
        top: '15px',
        left: '15px',
        display: 'flex',
        gap: '8px',
        zIndex: 10,
    },
    imageTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        color: '#333',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    imageId: {
        position: 'absolute',
        bottom: '15px',
        left: '15px',
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 10,
    },
    inStockLabel: {
        // ...
    },
    thumbnailGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px',
    },
    thumbnailWrapper: {
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #333',
        backgroundColor: '#242424',
        transition: 'border-color 0.2s',
    },
    thumbnail: {
        width: '100%',
        height: '70px',
        objectFit: 'cover',
        display: 'block',
    },
    thumbnailOverlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        height: '70px',
    },
    
    // СТИЛИ ДЛЯ БЛОКА СВОДКИ (CarSummaryPanel)
    carSummaryBlock: {
        backgroundColor: 'transparent', // Убираем фон, он теперь у родителя
        borderRadius: '0', 
        padding: '0', // Убираем лишние отступы, используем отступы общего контейнера
        color: '#f0f0f0', // Основной цвет текста - светлый
        border: 'none', // Убираем рамки
        marginTop: '8px', // Небольшой отступ от миниатюр
        zIndex: 1,
        position: 'relative',
    },
    carSummaryTitle: {
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 4px 0',
        color: '#f0f0f0', // Светлый
        lineHeight: 1.3,
        display: 'flex',
        alignItems: 'center',
    },
    yearTag: {
        backgroundColor: '#E30016', 
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        marginLeft: '12px',
        verticalAlign: 'middle',
    },
    carSummaryDetails: {
        fontSize: '16px',
        color: '#ccc', // Светло-серый
        margin: '0 0 16px 0',
        fontWeight: '400',
    },
    carSummarySpecRow: {
        fontSize: '18px',
        color: '#f0f0f0', // Светлый
        fontWeight: '500',
        margin: '0 0 12px 0',
        lineHeight: '1.5',
    },
    reviewInfo: {
        fontSize: '14px',
        color: '#00b33e', // Зеленый для акцента
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    carSummaryMarketPrice: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '24px 0 12px 0',
        backgroundColor: '#242424', // Акцентный фон для цены
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #333',
    },
    carSummaryMarketPriceLabel: {
        fontSize: '16px',
        color: '#ccc', // Светло-серый
        fontWeight: '400',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    carSummaryMarketPriceValue: {
        fontSize: '18px',
        color: '#f0f0f0', // Светлый
        fontWeight: '600',
        marginLeft: 'auto',
    },
    carSummaryPriceRussia: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#f0f0f0',
        margin: '12px 0 8px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    priceLabel: {
        color: '#888',
        fontSize: '14px',
        fontWeight: 'normal',
        marginTop: '4px',
    },
    carSummaryButtonsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 50px 50px 50px',
        gap: '8px',
        marginTop: '20px',
        borderTop: '1px solid #333', // Темный разделитель
        paddingTop: '20px',
    },
    carSummaryButton: {
        padding: '12px 20px',
        backgroundColor: '#E30016',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    carSummaryButtonGreen: {
        backgroundColor: '#00b33e', // Темно-зеленый
        color: 'white',
        fontSize: '20px',
        padding: '12px',
        minWidth: '50px',
    },
    carSummarySmallInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#888',
        borderTop: '1px solid #333', // Темный разделитель
        paddingTop: '15px',
        marginTop: '15px',
    },
    carSummaryActions: {
        display: 'flex',
        gap: '10px',
    },
    carSummaryActionButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '0',
    },
    infoIcon: {
        color: '#E30016', // Красный акцент
        fontSize: '16px',
        verticalAlign: 'middle',
        marginLeft: '5px',
    },
};

// =======================================================================
// ⚛️ КОМПОНЕНТ IMAGEGALLERY
// =======================================================================

const ImageGallery = ({ images = [], tags = [], id, carInfo }) => {
    
    // Деструктурируем ЛОКАЛЬНЫЙ объект styles
    const { 
        galleryContainerWrapper, galleryContainer, mainImageWrapper, 
        mainImage: mainImageStyle,
        imageTags, imageTag, imageId, inStockLabel, 
        thumbnailGrid, thumbnailWrapper, thumbnail, 
        thumbnailOverlay,
        
        // СТИЛИ ДЛЯ БЛОКА СВОДКИ
        carSummaryBlock, carSummaryTitle, carSummaryDetails, carSummarySpecRow,
        carSummaryMarketPrice, carSummaryMarketPriceLabel, carSummaryMarketPriceValue,
        carSummaryPriceRussia, carSummaryButtonsGrid, carSummaryButton,
        carSummaryButtonGreen, carSummarySmallInfo, carSummaryActions,
        carSummaryActionButton, priceLabel, infoIcon, yearTag, reviewInfo
    } = localStyles; 

    const [mainImage, setMainImage] = useState(images[0] || 'https://placehold.co/600x400/eee/ccc?text=No+Image');

    useEffect(() => {
        if (images && images.length > 0) {
            setMainImage(images[0]);
        } else {
            setMainImage('https://placehold.co/600x400/eee/ccc?text=No+Image');
        }
    }, [images]);

    const { 
        brand, model, year, mileage, owners, 
        power, drive, transmission, engine, seats, acceleration,
        price_russia, market_price_label, market_price_value,
        days_on_market, location, id: carId
    } = carInfo || {}; 
    
    // ⚠️ Оборачиваем ВСЁ в новый контейнер galleryContainerWrapper
    return (
        <div style={galleryContainerWrapper}>
            <div style={galleryContainer}>
                {/* 1. ГАЛЕРЕЯ И МИНИАТЮРЫ */}
                <div style={mainImageWrapper}>
                    <img src={mainImage} style={mainImageStyle} alt="Основной вид автомобиля" />
                    {tags && tags.length > 0 && (
                        <div style={imageTags}>{tags.map(tag => <span key={tag} style={imageTag}>{tag}</span>)}</div>
                    )}
                    <div style={imageId}>ID: {id}</div>
                </div>
                
                <div style={thumbnailGrid}>
                    {images.slice(0, 5).map((img, index) => (
                        <div 
                            key={index} 
                            style={thumbnailWrapper} 
                            onMouseEnter={() => setMainImage(img)}
                            onClick={() => setMainImage(img)}
                        >
                            <img src={img} style={thumbnail} alt={`Миниатюра ${index + 1}`} />
                        </div>
                    ))}
                    {images.length > 5 && (
                        <div 
                            style={{ ...thumbnailWrapper, ...thumbnailOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => alert(`Показано 5 фото, всего ${images.length}. Открыть модальное окно с галереей.`)}
                        >
                            <span>+{images.length - 5}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. БЛОК СВОДКИ: Информация под фотографиями */}
            {carInfo && (
                <div style={carSummaryBlock}>
                    <h1 style={carSummaryTitle}>
                        {brand} {model} {year} 
                        {year && <span style={yearTag}>{year}</span>}
                    </h1>
                    
                    <p style={carSummaryDetails}>
                        {year} выпуск &middot; {mileage} &middot; {owners} владелец
                    </p>
                    
                    <p style={carSummarySpecRow}>
                        {power} л.с. &middot; {drive} &middot; {transmission} &middot; {engine} &middot; {seats}-местн. &middot; {acceleration} сек
                    </p>
                    
                    <p style={reviewInfo}>
                         2023款 Plus 1.5L Автомат &middot; <span style={{fontWeight: 'bold'}}>7 отзывов</span>
                    </p>


                    {market_price_label && market_price_value && (
                        <div style={carSummaryMarketPrice}>
                            <span style={carSummaryMarketPriceLabel}>{market_price_label} <span style={infoIcon}>ⓘ</span></span>
                            <span style={carSummaryMarketPriceValue}>{market_price_value}</span>
                        </div>
                    )}

                    <p style={carSummaryPriceRussia}>
                        {(price_russia || 0).toLocaleString('ru-RU')} ₽ <span style={priceLabel}>Цена в РФ от Limee Auto</span>
                    </p>

                    <div style={carSummaryButtonsGrid}>
                        <button style={carSummaryButton}>Позвоните мне</button>
                        <button style={{ ...carSummaryButton, ...carSummaryButtonGreen }}>📞</button> 
                        <button style={{ ...carSummaryButton, ...carSummaryButtonGreen }}>💬</button> 
                        <button style={{ ...carSummaryButton, ...carSummaryButtonGreen }}>✈️</button> 
                    </div>

                    <div style={carSummarySmallInfo}>
                        <span>{days_on_market} на рынке</span>
                        <span>{location}</span>
                        <span>id {carId}</span>
                        <div style={carSummaryActions}>
                            <button style={carSummaryActionButton}>Share</button> 
                            <button style={carSummaryActionButton}>Compare</button> 
                        </div>
                    </div>
                </div> 
            )}
        </div>
    );
};

export default ImageGallery;