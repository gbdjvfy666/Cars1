import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../other/Breadcrumbs'; // 1. Импортируем компонент

// ======================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =======================

const safeJSONParse = (data, returnType = 'array') => {
    if (typeof data !== 'string') {
        return data || (returnType === 'array' ? [] : {});
    }
    if (!data) {
        return returnType === 'array' ? [] : {};
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка парсинга JSON:", data, e);
        return returnType === 'array' ? [] : {};
    }
};

// ======================= МЕЛКИЕ КОМПОНЕНТЫ =======================

const ImageGallery = ({ images = [], tags = [], id }) => {
    const [mainImage, setMainImage] = useState(images[0] || 'https://placehold.co/600x400/eee/ccc?text=No+Image');

    useEffect(() => {
        if (images && images.length > 0) {
            setMainImage(images[0]);
        } else {
            setMainImage('https://placehold.co/600x400/eee/ccc?text=No+Image');
        }
    }, [images]);
    
    return (
        <div style={styles.galleryContainer}>
            <div style={styles.mainImageWrapper}>
                <img src={mainImage} style={styles.mainImage} alt="Main car view" />
                {tags && tags.length > 0 && (
                    <div style={styles.imageTags}>{tags.map(tag => <span key={tag} style={styles.imageTag}>{tag}</span>)}</div>
                )}
                <div style={styles.imageId}>ID: {id}</div>
                <div style={styles.inStockLabel}>В наличии в Китае</div>
            </div>
            <div style={styles.thumbnailGrid}>
                {images.slice(0, 5).map((img, index) => (
                    <div key={index} style={styles.thumbnailWrapper} onMouseEnter={() => setMainImage(img)}>
                        <img src={img} style={styles.thumbnail} alt={`Thumbnail ${index + 1}`} />
                    </div>
                ))}
                {images.length > 5 && (
                    <div style={styles.thumbnailOverlay}>
                        <span>+{images.length - 5}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const SpecsTable = ({ specs }) => {
    if (!specs || Object.keys(specs).length === 0) {
        return null;
    }

    return (
        <div style={styles.specsTable}>
            {Object.entries(specs).map(([key, value]) => {
                if (!value) return null;
                return (
                    <div key={key} style={styles.specItem}>
                        <div style={styles.specKey}>{key}:</div>
                        <div style={styles.specValue}>{String(value)}</div>
                    </div>
                );
            })}
        </div>
    );
};

const OptionsCarousel = ({ options }) => {
    if (!options || options.length === 0) return null;
    return (
        <div style={styles.optionsContainer}>
            <h2 style={styles.sectionTitle}>Опции</h2>
            <div style={styles.optionsCarousel}>
                <button style={styles.carouselArrow}>{"<"}</button>
                {options.map((opt, i) => (
                    <div key={i} style={styles.optionItem}>
                        <img src={opt.icon || 'https://placehold.co/50x50/eee/ccc?text=?'} style={styles.optionIcon} alt={opt.name} />
                        <div style={styles.optionName}>{opt.name}</div>
                    </div>
                ))}
                <button style={styles.carouselArrow}>{">"}</button>
            </div>
            <div style={styles.buttonsContainer}>
                <button style={styles.redButton}>Сравнить все комплектации</button>
                <button style={styles.whiteButton}>Как проходит сделка?</button>
            </div>
        </div>
    );
};

const Characteristics = ({ characteristics }) => {
    const rawCharacteristics = characteristics || {};
    const charKeys = Object.keys(rawCharacteristics);
    if (charKeys.length === 0) return null;

    const isSectioned = charKeys.length > 0 && 
                         typeof rawCharacteristics[charKeys[0]] === 'object' && 
                         !Array.isArray(rawCharacteristics[charKeys[0]]) && 
                         Object.keys(rawCharacteristics[charKeys[0]]).length > 0;

    const normalizedCharacteristics = isSectioned 
        ? rawCharacteristics 
        : { 'Общие характеристики': rawCharacteristics };
        
    const finalKeys = Object.keys(normalizedCharacteristics);
    if (finalKeys.length === 0) return null;

    const [activeSection, setActiveSection] = useState(finalKeys[0]);

    useEffect(() => {
        if (!finalKeys.includes(activeSection)) {
            setActiveSection(finalKeys[0]);
        }
    }, [finalKeys, activeSection]);

    const renderSectionContent = (sectionName, items) => {
        const itemsObject = typeof items === 'object' && items !== null ? items : {};
        const dataAsArray = Object.entries(itemsObject)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([name, value]) => ({ name, value }));
            
        if (dataAsArray.length === 0) return <div>Нет данных для отображения в этом разделе.</div>;
        
        return (
            <div>
                <h3 style={styles.charCategoryTitle}>{sectionName}</h3>
                {dataAsArray.map((item, index) => (
                    <div key={item.name || index} style={styles.charRow}>
                        <div style={styles.charName}><span style={styles.infoIcon}>ⓘ</span>{item.name}</div>
                        <div style={styles.charValue}>{String(item.value)}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.charContainer}>
            <h2 style={styles.sectionTitle}>Характеристики</h2>
            <div style={styles.charGrid}>
                <nav style={styles.charTabs}>
                    {finalKeys.map(key => (
                        <button 
                            key={key} 
                            onClick={() => setActiveSection(key)} 
                            style={activeSection === key ? styles.activeCharTab : styles.charTab}
                        >
                            {key}
                        </button>
                    ))}
                </nav>
                <div style={styles.charContent}>
                    {normalizedCharacteristics[activeSection] &&
                        renderSectionContent(activeSection, normalizedCharacteristics[activeSection])
                    }
                </div>
            </div>
        </div>
    );
};

const Accessories = ({ accessories, model }) => {
    if (!accessories || accessories.length === 0) return null;
    return (
        <div>
            <h2 style={styles.sectionTitle}>Аксессуары {model}</h2>
            <div style={styles.accessoriesGrid}>
                {accessories.map(acc => (
                    <div key={acc.name} style={styles.accessoryCard}>
                        <img src={acc.img || 'https://placehold.co/150x150/eee/ccc?text=No+Image'} style={styles.accessoryImage} alt={acc.name} />
                        <h4 style={styles.accessoryName}>{acc.name} - {(acc.price || 0).toLocaleString('ru-RU')} ₽</h4>
                        <p style={styles.accessoryDesc}>{acc.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ======================= ОСНОВНОЙ КОМПОНЕНТ-КОНСТРУКТОР =======================

const CarPage = () => {
    const { brandSlug, modelSlug, carId } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCarData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:4000/api/car/${carId}`);
                if (!response.ok) {
                    throw new Error('Машина не найдена в базе данных');
                }
                const data = await response.json();
                
                const parsedData = {
                    ...data,
                    images: safeJSONParse(data.images, 'array'),
                    specs: safeJSONParse(data.specs, 'object'),
                    options: safeJSONParse(data.options, 'array'),
                    characteristics: safeJSONParse(data.characteristics, 'object'),
                    accessories: safeJSONParse(data.accessories, 'array'),
                    colors: safeJSONParse(data.colors, 'array'),
                    other_trims: safeJSONParse(data.other_trims, 'array'),
                };
                
                setCar(parsedData);
            } catch (err) {
                console.error("Ошибка при загрузке данных о машине:", err);
                setError("Не удалось загрузить информацию об автомобиле.");
            } finally {
                setLoading(false);
            }
        };

        fetchCarData();
    }, [carId]);

    if (loading) { return <div style={{padding: 50, fontFamily: 'sans-serif'}}>Загрузка...</div>; }
    if (error) { return <div style={{padding: 50, color: 'red', fontFamily: 'sans-serif'}}>{error}</div>; }
    if (!car) { return <div style={{padding: 50, fontFamily: 'sans-serif'}}>Автомобиль не найден.</div> }

    const priceRussia = car.price_russia || 0;
    const priceChina = car.price_china || 0;
    
    const specLabels = {
        year: 'Год',
        body_type: 'Тип кузова',
        engine_type: 'Двигатель',
        drivetrain: 'Привод',
        max_power_ps: 'Мощность (л.с.)',
        transmission: 'Коробка передач',
        displacement: 'Объем',
        max_speed_kmh: 'Макс. скорость'
    };

    const mainSpecsForTable = {};
    for (const key in specLabels) {
        if (car[key]) {
            mainSpecsForTable[specLabels[key]] = car[key];
        }
    }

    // 2. Формируем массив для хлебных крошек
    const breadcrumbItems = [
        { label: car.brand || brandSlug, to: `/cars/${brandSlug}` },
        { label: car.model || modelSlug, to: `/cars/${brandSlug}/${modelSlug}` },
        // Последний элемент будет неактивным текстом
        { label: car.name || carId, to: `/cars/${brandSlug}/${modelSlug}/${carId}` }
    ];

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <Breadcrumbs items={breadcrumbItems} />

                <div style={styles.mainGrid}>
                    <ImageGallery images={car.images} tags={car.tags} id={car.id} />
                    <div style={styles.detailsColumn}>
                        <h1 style={styles.carTitle}>{car.name}</h1>
                        <SpecsTable specs={mainSpecsForTable} />
                        <div style={styles.divider}></div>
                        {car.colors && car.colors.length > 0 && (
                            <div style={styles.colors}>
                                <span style={styles.specKey}>Цвет кузова:</span>
                                <div style={styles.colorSwatches}>
                                    {car.colors.map((color, index) => (
                                        <div key={index} style={{...styles.colorSwatch, backgroundColor: color}}></div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={styles.priceBlock}>
                            {priceChina > 0 && (
                                <div style={styles.priceChina}>
                                    {priceChina.toLocaleString('ru-RU')} ₽ 
                                    <span style={styles.priceLabel}>Цена в Китае</span>
                                </div>
                            )}
                            <div style={styles.priceRussia}>
                                ~ {priceRussia.toLocaleString('ru-RU')} ₽
                            </div>
                        </div>
                        <div style={styles.deliveryInfo}>
                            <span style={styles.alertIcon}>!</span>
                            Доставка, таможенные платежи, СБКТС и ЭПТС включены в стоимость...
                        </div>
                        <button style={styles.orderButton}>Оставить заявку</button>
                    </div>
                </div>
                
                <OptionsCarousel options={car.options} />
                <Characteristics characteristics={car.characteristics} />
                <Accessories accessories={car.accessories} model={car.model} />
            </div>
        </div>
    );
};

// Обновленные стили для темной темы
const styles = {
    pageWrapper: {
        backgroundColor: '#131313',
        backgroundImage: 'radial-gradient(circle at 70% 20%, #2a2a2a 0%, #131313 64%)',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        padding: '40px 0',
        color: '#f0f0f0',
    },
    container: {
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '55% 45%',
        gap: '40px',
        alignItems: 'flex-start',
        marginTop: '24px',
    },
    detailsColumn: {
        padding: '24px',
        backgroundColor: '#1c1c1c',
        borderRadius: '12px',
        border: '1px solid #333',
    },
    galleryContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#1c1c1c',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #333',
    },
    mainImageWrapper: {
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#242424',
    },
    mainImage: {
        width: '100%',
        display: 'block',
        aspectRatio: '16 / 10',
        objectFit: 'cover',
    },
    imageTags: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        display: 'flex',
        gap: '8px',
    },
    imageTag: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
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
    },
    inStockLabel: {
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        color: '#fff',
        backgroundColor: '#00b33e',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
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
        '&:hover': {
            borderColor: '#666',
        },
    },
    thumbnail: {
        width: '100%',
        height: '70px',
        objectFit: 'cover',
        display: 'block',
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
    },
    priceBlock: {
        margin: '24px 0',
        padding: '20px',
        backgroundColor: '#242424',
        borderRadius: '8px',
        border: '1px solid #333',
    },
    priceChina: {
        fontSize: '18px',
        color: '#f0f0f0',
        marginBottom: '12px',
    },
    priceLabel: {
        color: '#999',
        marginLeft: '8px',
        fontSize: '14px',
    },
    priceRussia: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#f0f0f0',
        textAlign: 'center',
        padding: '16px',
        backgroundColor: '#E30016',
        borderRadius: '8px',
        marginTop: '12px',
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
    orderButton: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#E30016',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#cc0014',
        },
    },

    // Стили для остальных компонентов тоже обновлены для темной темы
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '60px 0 24px 0',
        color: '#f0f0f0',
        textAlign: 'center',
    },
    charContainer: {
        marginTop: '32px',
        backgroundColor: '#1c1c1c',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #333',
    },
    charGrid: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '24px',
    },
    charTabs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    charTab: {
        backgroundColor: '#242424',
        color: '#f0f0f0',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #333',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#333',
        },
    },
    activeCharTab: {
        backgroundColor: '#E30016',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #333',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    charContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    charRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #333',
    },
    charName: {
        color: '#f0f0f0',
        fontSize: '14px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    infoIcon: {
        color: '#E30016',
        fontSize: '16px',
    },
    charValue: {
        color: '#f0f0f0',
        fontSize: '14px',
        fontWeight: '500',
        textAlign: 'right',
        minWidth: '100px',
    },
    charCategoryTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#E30016',
        margin: '0 0 20px 0',
        paddingTop: 0,
        borderTop: 'none'
    },
};

export default CarPage;