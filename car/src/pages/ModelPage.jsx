import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Базовый URL вашего бэкенд-сервера
const API_BASE_URL = 'http://localhost:4000';

// ======================= 🎨 ЦВЕТОВАЯ ПАЛИТРА =======================
const COLORS = {
    primary: '#E30016',     // Красный акцент
    secondary: '#00b33e',   // Зеленый для "В наличии"
    background: '#FFFFFF',
    border: '#EAEAEA',      // Светло-серый для границ
    shadow: 'rgba(0, 0, 0, 0.05)', // Легкая тень
    textPrimary: '#1A1A1A', // Глубокий черный
    textSecondary: '#555555', // Серый текст
    textMuted: '#999999',   // Бледный текст/идентификаторы
};


// ======================= ФУНКЦИЯ ДЛЯ СБОРА ДОСТУПНЫХ ФИЛЬТРОВ (без изменений) =======================
const getAvailableFilters = (cars) => {
    const filters = {
        year: new Set(),
        engine_volume: new Set(),
        drivetrain: new Set(),
    };

    const translateDrivetrain = (text) => {
        if (!text) return null;
        const lowerText = text.toLowerCase();
        if (lowerText.includes('передний')) return 'FWD';
        if (lowerText.includes('задний')) return 'RWD';
        if (lowerText.includes('полный') || lowerText.includes('4wd')) return '4WD';
        return null;
    };

    const getVolumeRange = (volumeLiters) => {
        if (volumeLiters < 1.6) return 'до 1.6';
        if (volumeLiters >= 1.6 && volumeLiters < 2.0) return '1.6 - 2.0';
        if (volumeLiters >= 2.0 && volumeLiters <= 2.5) return '2.0 - 2.5';
        if (volumeLiters > 2.5) return 'более 2.5';
        return null;
    };

    cars.forEach(car => {
        if (car.year) filters.year.add(String(car.year));
        
        let volumeLiters = 0;
        try {
            const characteristics = typeof car.characteristics === 'string' 
                ? JSON.parse(car.characteristics) 
                : car.characteristics;
            
            const volumeCm3String = characteristics?.Двигатель?.["Объем двигателя"];
            
            if (volumeCm3String) {
                const cleanedVolume = volumeCm3String.replace(/[^\d]/g, ''); 
                const volumeCm3 = parseInt(cleanedVolume, 10);
                
                if (!isNaN(volumeCm3) && volumeCm3 > 0) {
                    volumeLiters = volumeCm3 / 1000;
                }
            }
        } catch (e) {}

        if (volumeLiters > 0) {
             const range = getVolumeRange(volumeLiters);
             if (range) {
                 filters.engine_volume.add(range);
             }
        }
        
        const translatedDrive = translateDrivetrain(car.drivetrain);
        if (translatedDrive) filters.drivetrain.add(translatedDrive);
    });

    return {
        year: Array.from(filters.year).sort((a, b) => parseInt(b) - parseInt(a)),
        engine_volume: Array.from(filters.engine_volume).sort((a, b) => {
            const order = ['до 1.6', '1.6 - 2.0', '2.0 - 2.5', 'более 2.5'];
            return order.indexOf(a) - order.indexOf(b);
        }),
        drivetrain: Array.from(filters.drivetrain).sort(),
    };
};

// ======================= КОМПОНЕНТ ФИЛЬТРОВ (без изменений) =======================
const FilterBlock = ({ filters, onFilterChange, availableOptions }) => {
    
    const allEngineVolumeOptions = ['до 1.6', '1.6 - 2.0', '2.0 - 2.5', 'более 2.5'];
    const allDrivetrainOptions = ['4WD', 'RWD', 'FWD'];
    const priceOptions = ['до 1 млн', '1-2 млн', '2-3 млн', '3-4 млн', '4-5 млн', '5+ млн'];
    
    const filterGroups = [
        { 
            group: 'year', 
            title: 'Год выпуска', 
            options: availableOptions.year || []
        },
        { 
            group: 'engine_volume', 
            title: 'Объем, л', 
            options: allEngineVolumeOptions.filter(opt => availableOptions.engine_volume.includes(opt))
        },
        { 
            group: 'drivetrain', 
            title: 'Привод', 
            options: allDrivetrainOptions.filter(opt => availableOptions.drivetrain.includes(opt))
        },
        { 
            group: 'price', 
            title: 'Стоимость (₽)', 
            options: priceOptions 
        }
    ];

    const handleCheckboxChange = (group, value) => {
        const currentValues = filters[group] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(group, newValues);
    };

    const renderCheckboxes = (group, options) => {
        const isPriceGroup = group === 'price';
        const isYearGroup = group === 'year';
        
        return (
            <div 
                style={{ 
                    ...styles.checkboxWrapper,
                    ...(isPriceGroup ? styles.priceCheckboxGrid : {}),
                    ...(isYearGroup ? styles.yearCheckboxInline : {}) 
                }}
            >
                {options.map(value => {
                    const isChecked = (filters[group] || []).includes(value);

                    const labelStyle = { 
                        ...styles.checkboxLabel, 
                        color: isChecked ? COLORS.primary : COLORS.textSecondary, 
                        fontWeight: isChecked ? '600' : '400',
                        cursor: 'pointer',
                        ...(isYearGroup ? { marginRight: '15px', marginBottom: '8px', minWidth: 'auto' } : {})
                    };

                    return (
                        <label key={value} style={labelStyle}>
                            <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => handleCheckboxChange(group, value)} 
                                style={{ accentColor: COLORS.primary }}
                            /> 
                            {value}
                        </label>
                    );
                })}
            </div>
        );
    };

    const activeFilterGroups = filterGroups.filter(item => item.options.length > 0 || item.group === 'price');

    return (
        <div style={{...styles.filterBlockNew, 
            gridTemplateColumns: `repeat(${activeFilterGroups.length}, minmax(180px, 1fr))`
        }}>
            {activeFilterGroups.map((filterItem, index) => {
                return (
                    <div 
                        key={filterItem.group} 
                        style={{
                            ...styles.filterGroup, 
                            ...(index > 0 ? styles.filterGroupSeparator : {}) 
                        }}
                    >
                        <span style={styles.filterTitle}>{filterItem.title}</span>
                        {renderCheckboxes(filterItem.group, filterItem.options)}
                    </div>
                );
            })}
        </div>
    );
};

// ======================= КОМПОНЕНТ-ОБЕРТКА ДЛЯ ЗАГОЛОВКА (без изменений) =======================
const TitleHoverWrapper = ({ carName }) => {
    // Логика всплывающей подсказки сохранена
    const [isHovered, setIsHovered] = useState(false); 

    return (
        <div 
            style={styles.cardTitleWrapper}
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)} 
        >
            <h3 
                style={{
                    ...styles.cardTitle,
                    ...(isHovered ? styles.cardTitleHover : {}), 
                }}
            >
                {carName}
            </h3>
            
            {isHovered && (
                <div style={styles.fullTitleTooltip}>
                    {carName}
                </div>
            )}
        </div>
    );
};

// ======================= КОМПОНЕНТ КАРТОЧКИ АВТО (ВОССТАНОВЛЕНЫ HOVER-ЭФФЕКТЫ) =======================
const CarCard = ({ car }) => {
    // ВОССТАНОВЛЕН useState для отслеживания наведения
    const [isCardHovered, setIsCardHovered] = useState(false);

    const handleMouseEnter = () => setIsCardHovered(true);
    const handleMouseLeave = () => setIsCardHovered(false);

    const carData = {
        id: car.id || 'N/A',
        brand: car.brand || 'Неизвестно',
        model: car.model || 'Неизвестно',
        name: car.name || `${car.brand} ${car.model}`,
        price_russia: car.price_russia || 0,
        price_china: car.price_china || 0,
        year: car.year || 'N/A',
        mileage: car.mileage || 0,
        img: car.img_src || "https://placehold.co/300x200/F0F0F0/888888?text=Image+N/A" 
    };

    const brandSlug = car.brand_slug || carData.brand.toLowerCase().replace(/\s+/g, '-');
    const modelSlug = car.model_slug || carData.model.toLowerCase().replace(/\s+/g, '-');

    return (
        <Link 
            to={`/cars/${brandSlug}/${modelSlug}/${carData.id}`} 
            style={styles.cardLink}
            // ВОССТАНОВЛЕНЫ обработчики наведения
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Используем базовый стиль card, у cardHover удалены красная рамка и transform */}
            <div style={isCardHovered ? styles.cardHover : styles.card}> 
                <div style={styles.cardImageContainer}>
                    <img src={carData.img} alt={carData.name} onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/300x200/F0F0F0/888888?text=Image+N/A"}} style={styles.cardImage} />
                    
                    <div style={styles.cardBottomLeftIcons}><div style={styles.iconWrapper}><span style={styles.starIcon}>⭐</span></div></div>
                    <div style={styles.cardTopRightBadges}><div style={{...styles.badge, ...styles.badgeBlue}}><span>O<small>km</small></span></div><div style={{...styles.badge, ...styles.badgeOrange}} title="ТОП 3"><span>🏆</span></div><div style={{...styles.badge, ...styles.badgeLightBlue}}><span>4+💺</span></div></div>
                    
                    {carData.mileage >= 0 && (
                        <div style={styles.mileageBadge}>
                            <div><span style={styles.mileageLabel}>Пробег:</span> <span style={styles.mileageValue}>{carData.mileage.toLocaleString('ru-RU')} км</span></div>
                            <div><span style={styles.mileageLabel}>Год:</span> <span style={styles.mileageValue}>{carData.year}</span></div>
                        </div>
                    )}
                </div>
                <div style={styles.cardBody}>
                    <TitleHoverWrapper carName={carData.name} />
                    
                    <div style={styles.cardLocationAndId}><span style={styles.cardLocation}>В НАЛИЧИИ В КИТАЕ</span><span style={styles.cardId}>ID: {carData.id}</span></div>
                    
                    <div style={styles.cardFooter}>
                        {/* ВОССТАНОВЛЕНА логика скрытия/показа priceInfo */}
                        <div style={{...styles.priceInfo, opacity: isCardHovered ? 0 : 1, pointerEvents: isCardHovered ? 'none' : 'auto'}}>
                            <div style={styles.cardPriceRussiaWrapper}>
                                <div style={styles.cardPriceRussia}>~ {carData.price_russia.toLocaleString('ru-RU')} ₽</div>
                                <div style={styles.cardPriceDisclaimer}>цена в России<br/>(под ключ)</div>
                            </div>
                            <div style={styles.cardPriceChinaWrapper}>
                                <div style={styles.cardPriceChina}>{carData.price_china.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽ в Китае</div>
                            </div>
                        </div>
                        
                        {/* ВОССТАНОВЛЕНА логика скрытия/показа orderInfo */}
                        <div style={{...styles.orderInfo, opacity: isCardHovered ? 1 : 0, pointerEvents: isCardHovered ? 'auto' : 'none'}}>
                            <div style={styles.cardPriceChinaFull}>{carData.price_china.toLocaleString('ru-RU')} ₽ <br/><span style={styles.cardPriceChinaDisclaimerHover}>Цена в Китае</span></div>
                            <button style={styles.orderButton} onClick={(e) => { e.preventDefault(); console.log(`Заказ ${carData.name}`); }}>Заказать</button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};


// ======================= ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ МОДЕЛИ (без изменений) =======================
const ModelPage = () => {
    const { brandSlug, modelSlug } = useParams();
    
    const [pageInfo, setPageInfo] = useState({ brandName: brandSlug.toUpperCase(), modelName: modelSlug.toUpperCase() });
    const [allCarsForModel, setAllCarsForModel] = useState([]);
    const [displayedCars, setDisplayedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [availableFilters, setAvailableFilters] = useState({ year: [], engine_volume: [], drivetrain: [] });
    
    const [activeTab, setActiveTab] = useState('all'); 
    const [brandLogo, setBrandLogo] = useState("");
    const [headerImages, setHeaderImages] = useState([]);


    const handleFilterChange = (group, values) => {
        setFilters(prev => ({ ...prev, [group]: values }));
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };


    // -----------------------------------------------------------
    // ЭФФЕКТЫ (без изменений)
    // -----------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const carsResponse = await fetch(`${API_BASE_URL}/api/cars/${brandSlug}`);
                if (!carsResponse.ok) throw new Error("Failed to fetch cars");
                let cars = await carsResponse.json();

                cars = cars.filter(car => car.model && car.model.toLowerCase() === modelSlug.toLowerCase());

                if (cars.length === 0) {
                    setAllCarsForModel([]);
                    setLoading(false);
                    return;
                }
                
                const brandResponse = await fetch(`${API_BASE_URL}/api/brands/${brandSlug}`);
                if (!brandResponse.ok) throw new Error("Failed to fetch brand info");
                const brandInfo = await brandResponse.json();

                setPageInfo({
                    brandName: brandInfo.name || brandSlug.toUpperCase(),
                    modelName: cars[0].model || modelSlug.toUpperCase(),
                });
                
                setBrandLogo(brandInfo.img_src || "https://placehold.co/50x50/333333/ffffff?text=Logo");
                setHeaderImages(["https://i.ibb.co/bzzx45G/l7-1.png", "https://i.ibb.co/Y0dmyhJ/l7-2.png"]);

                setAllCarsForModel(cars);
                setAvailableFilters(getAvailableFilters(cars)); 

            } catch (err) {
                console.error("Ошибка при загрузке данных с API:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [brandSlug, modelSlug]);


    useEffect(() => {
        let cars = [...allCarsForModel];
        
        if (activeTab === 'new') {
            cars = cars.filter(c => c.mileage < 1000);
        } else if (activeTab === 'used') {
            cars = cars.filter(c => c.mileage >= 1000);
        }

        if (filters.year && filters.year.length > 0) {
            cars = cars.filter(c => filters.year.includes(String(c.year)));
        }

        if (filters.engine_volume && filters.engine_volume.length > 0) {
            const getVolumeRange = (volumeLiters) => {
                if (volumeLiters < 1.6) return 'до 1.6';
                if (volumeLiters >= 1.6 && volumeLiters < 2.0) return '1.6 - 2.0';
                if (volumeLiters >= 2.0 && volumeLiters <= 2.5) return '2.0 - 2.5';
                if (volumeLiters > 2.5) return 'более 2.5';
                return null;
            };

            cars = cars.filter(c => {
                let volumeLiters = 0;
                try {
                    const characteristics = typeof c.characteristics === 'string' 
                        ? JSON.parse(c.characteristics) 
                        : c.characteristics;

                    const volumeCm3String = characteristics?.Двигатель?.["Объем двигателя"];
                    if (volumeCm3String) {
                        const cleanedVolume = volumeCm3String.replace(/[^\d]/g, '');
                        const volumeCm3 = parseInt(cleanedVolume, 10);
                        if (!isNaN(volumeCm3) && volumeCm3 > 0) {
                            volumeLiters = volumeCm3 / 1000;
                        }
                    }
                } catch (e) { /* silent fail */ }
                
                if (isNaN(volumeLiters) || volumeLiters <= 0) return false; 
                
                const range = getVolumeRange(volumeLiters);
                return range && filters.engine_volume.includes(range);
            });
        }
        
        const translateDrivetrain = (text) => {
            if (!text) return null;
            const lowerText = text.toLowerCase();
            if (lowerText.includes('передний')) return 'FWD';
            if (lowerText.includes('задний')) return 'RWD';
            if (lowerText.includes('полный') || lowerText.includes('4wd')) return '4WD';
            return null;
        };

        if (filters.drivetrain && filters.drivetrain.length > 0) {
            cars = cars.filter(c => {
                 const translatedDrive = translateDrivetrain(c.drivetrain);
                 return filters.drivetrain.includes(translatedDrive);
            });
        }

        setDisplayedCars(cars);
    }, [filters, allCarsForModel, activeTab]); 

    if (loading) return <div style={styles.centeredMessage}>Загрузка данных с сервера...</div>;

    if (allCarsForModel.length === 0) return <div style={styles.centeredMessage}>Извините, для модели **{pageInfo.modelName}** пока нет предложений.</div>;

    const countAll = allCarsForModel.length;
    const countNew = allCarsForModel.filter(c => c.mileage < 1000).length;
    const countUsed = countAll - countNew; 
    const currentCount = displayedCars.length;

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadcrumbLink}>🏠</Link> 
                <span style={{color: COLORS.textMuted}}>/</span> 
                <Link to={`/cars/${brandSlug}`} style={styles.breadcrumbLink}>{pageInfo.brandName}</Link> 
                <span style={{color: COLORS.textMuted}}>/</span>
                <span style={{color: COLORS.textPrimary, fontWeight: 600}}>{pageInfo.modelName}</span>
            </div>
            
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Купить {pageInfo.brandName} {pageInfo.modelName}</h1>
                <div style={styles.headerImages}>
                    {headerImages[0] && <img src={headerImages[0]} alt="Header 1" style={styles.headerImage} />}
                    {headerImages[1] && <img src={headerImages[1]} alt="Header 2" style={styles.headerImage} />}
                </div>
            </div>
            
            <FilterBlock filters={filters} onFilterChange={handleFilterChange} availableOptions={availableFilters} />
            
            <div style={styles.tabsContainer}>
                <div style={styles.tabs}>
                    <button 
                        onClick={() => handleTabChange('all')} 
                        style={activeTab === 'all' ? styles.activeTabNew : styles.tabNew}
                    >
                        Все ({activeTab === 'all' ? currentCount : countAll})
                    </button>
                    <button 
                        onClick={() => handleTabChange('new')} 
                        style={activeTab === 'new' ? styles.activeTabNew : styles.tabNew}
                    >
                        Новые ({activeTab === 'new' ? currentCount : countNew})
                    </button>
                    <button 
                        onClick={() => handleTabChange('used')} 
                        style={activeTab === 'used' ? styles.activeTabNew : styles.tabNew}
                    >
                        С пробегом ({activeTab === 'used' ? currentCount : countUsed})
                    </button>
                </div>
                <button style={styles.compareButtonNew}>❤️ Сравнить комплектации</button>
            </div>
            
            <div style={styles.resultsGrid}>
                {displayedCars.length > 0 ? (
                    displayedCars.map(car => <CarCard key={car.id} car={car} />)
                ) : (
                    <div style={{gridColumn: 'span 4', textAlign: 'center', padding: '50px', color: COLORS.textMuted}}>
                        Нет автомобилей, соответствующих выбранным фильтрам.
                    </div>
                )}
            </div>
        </div>
    );
};

// ======================= НОВЫЕ ПРОФЕССИОНАЛЬНЫЕ СТИЛИ (ОБНОВЛЕНЫ) =======================
const styles = {
    // --- ЦВЕТА И ТИПОГРАФИКА ---
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    },

    // --- ОБЩАЯ СТРУКТУРА ---
    page: { 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '30px 20px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', 
        backgroundColor: COLORS.background, 
        color: COLORS.textPrimary 
    },
    centeredMessage: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh', 
        fontSize: '20px', 
        color: COLORS.textSecondary 
    },
    breadcrumb: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        color: COLORS.textMuted, 
        marginBottom: '20px', 
        fontSize: '14px' 
    },
    breadcrumbLink: { 
        textDecoration: 'none', 
        color: COLORS.textSecondary, 
        fontWeight: '500',
        transition: 'color 0.2s',
        '&:hover': {
            color: COLORS.primary 
        }
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
    },
    pageTitle: { 
        fontSize: '32px', 
        fontWeight: '700', 
        color: COLORS.textPrimary, 
        margin: 0
    },
    headerImages: { 
        display: 'flex', 
        gap: '10px' 
    },
    headerImage: { 
        width: '150px', 
        height: '90px', 
        objectFit: 'cover', 
        borderRadius: '10px' 
    },

    // --- СТИЛИ ДЛЯ ФИЛЬТРОВ ---
    filterBlockNew: { 
        display: 'grid', 
        gap: '20px', 
        padding: '25px 0', 
        marginBottom: '40px',
        borderTop: `1px solid ${COLORS.border}`, 
        borderBottom: `1px solid ${COLORS.border}`, 
    },
    filterGroup: { 
        padding: '0 15px', 
    },
    filterGroupSeparator: {
        borderLeft: `1px solid ${COLORS.border}`, 
        paddingLeft: '15px',
        marginLeft: '-15px',
    },
    filterTitle: { 
        fontWeight: '700', 
        marginBottom: '15px', 
        display: 'block',
        fontSize: '15px',
        color: COLORS.textPrimary, 
        textTransform: 'uppercase',
    },
    checkboxWrapper: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
    },
    yearCheckboxInline: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '0', 
        marginTop: '-2px', 
    },
    priceCheckboxGrid: {
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px 8px',
    },
    checkboxLabel: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        cursor: 'pointer',
        fontSize: '15px',
        transition: 'color 0.2s, font-weight 0.2s',
    },
    
    // --- СТИЛИ ДЛЯ ВКЛАДОК И КНОПОК ---
    tabsContainer: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px', 
        borderBottom: `2px solid ${COLORS.border}` 
    },
    tabs: { 
        display: 'flex', 
        gap: '20px' 
    },
    tabNew: { 
        padding: '12px 0', 
        fontSize: '17px', 
        border: 'none', 
        backgroundColor: 'transparent', 
        cursor: 'pointer', 
        color: COLORS.textSecondary, 
        fontWeight: '500',
        borderBottom: '3px solid transparent',
        transition: 'color 0.2s, border-bottom 0.2s',
    },
    activeTabNew: { 
        padding: '12px 0', 
        fontSize: '17px', 
        border: 'none', 
        backgroundColor: 'transparent', 
        color: COLORS.primary, 
        cursor: 'pointer',
        fontWeight: '600',
        borderBottom: `3px solid ${COLORS.primary}`, 
    },
    compareButtonNew: { 
        color: COLORS.primary, 
        background: 'none', 
        border: `1px solid ${COLORS.primary}`, 
        borderRadius: '8px', 
        padding: '10px 20px', 
        cursor: 'pointer', 
        fontWeight: '600', 
        fontSize: '14px',
        transition: 'background-color 0.2s, color 0.2s',
        '&:hover': {
            backgroundColor: 'rgba(227, 0, 22, 0.05)'
        }
    },
    
    // --- СТИЛИ ДЛЯ КАРТОЧЕК (ОБНОВЛЕНЫ) ---
    resultsGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '25px' 
    },
    cardLink: { 
        textDecoration: 'none', 
        color: 'inherit' 
    },
    // Базовый стиль - статичный
    card: { 
        border: `1px solid ${COLORS.border}`, 
        borderRadius: '12px', 
        backgroundColor: COLORS.background, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: `0 4px 12px ${COLORS.shadow}`, 
        transition: 'box-shadow 0.2s', // Плавное изменение тени
        overflow: 'hidden',
    }, 
    // Стиль при наведении: только чуть более заметная тень. Бордюр и подпрыгивание УДАЛЕНЫ.
    cardHover: {
        border: `1px solid ${COLORS.border}`, // Оставили светлую рамку, чтобы не было "дергания"
        borderRadius: '12px', 
        backgroundColor: COLORS.background, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)', // Усиленная тень
        // transform: 'translateY(-2px)' - УДАЛЕНО!
        transition: 'box-shadow 0.2s', 
        overflow: 'hidden',
    },
    
    cardImageContainer: { position: 'relative', width: '100%', paddingTop: '66%', overflow: 'hidden' }, 
    cardImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    
    cardBottomLeftIcons: { position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '5px' },
    iconWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    starIcon: { fontSize: '14px' },
    cardTopRightBadges: { position: 'absolute', top: 0, right: '0', display: 'flex', gap: '1px' },
    badge: { width: '35px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '11px', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' },
    badgeBlue: { backgroundColor: '#135BE8' },
    badgeOrange: { backgroundColor: '#D27029', fontSize: '14px' },
    badgeLightBlue: { backgroundColor: '#4DA7FA', fontSize: '14px' },
    
    mileageLabel: { fontWeight: '500' }, 
    mileageValue: { fontWeight: '400' }, 
    mileageBadge: { 
        position: 'absolute', 
        bottom: '0', 
        right: '0',  
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        color: 'white', 
        padding: '6px 12px', 
        fontSize: '11px', 
        textAlign: 'left', 
        lineHeight: 1.4, 
        borderTopLeftRadius: '10px',
    },
    
    cardBody: { padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative', zIndex: 1 }, 
    cardTitleWrapper: { position: 'relative', marginBottom: '12px', minHeight: '40px' },
    cardTitle: { 
        margin: 0, 
        fontSize: '17px', 
        fontWeight: '600', 
        lineHeight: 1.3, 
        height: '2.6em', 
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal',
        cursor: 'pointer',
        transition: 'color 0.2s ease', 
        color: COLORS.textPrimary, 
    },
    cardTitleHover: { color: COLORS.primary }, 
    fullTitleTooltip: {
        position: 'absolute',
        top: '-15px', 
        left: '-15px', 
        right: '-15px', 
        zIndex: 10, 
        backgroundColor: COLORS.background, 
        border: `1px solid ${COLORS.border}`, 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '17px',
        fontWeight: '600',
        lineHeight: 1.3,
        color: COLORS.primary, 
        pointerEvents: 'none',
    },
    cardLocationAndId: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '13px' },
    cardLocation: { color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase' }, 
    cardId: { color: COLORS.textMuted }, 
    cardFooter: { minHeight: '55px', position: 'relative', marginTop: 'auto' }, // Вернул minHeight
    
    // Стили для динамического переключения Price/Order Info
    priceInfo: { position: 'absolute', width: '100%', transition: 'opacity 0.2s ease', pointerEvents: 'none' },
    orderInfo: { position: 'absolute', width: '100%', transition: 'opacity 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' },

    cardPriceRussiaWrapper: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', lineHeight: 1.1 },
    cardPriceRussia: { fontSize: '20px', fontWeight: '700', lineHeight: 1.1, color: COLORS.textPrimary }, 
    cardPriceDisclaimer: { fontSize: '11px', color: COLORS.textMuted, lineHeight: 1.2, paddingTop: '3px' }, 
    cardPriceChinaWrapper: { fontSize: '12px', color: COLORS.textMuted, fontWeight: '500' }, 
    
    cardPriceChinaFull: { fontSize: '20px', fontWeight: '500', lineHeight: 1.2, color: COLORS.textPrimary }, // Вернул крупный шрифт
    cardPriceChinaDisclaimerHover: { fontSize: '11px', color: COLORS.textMuted, fontWeight: '400' }, 
    
    orderButton: { 
        padding: '8px 18px', 
        backgroundColor: COLORS.primary, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontWeight: '600', 
        fontSize: '15px', 
        cursor: 'pointer', 
        pointerEvents: 'auto',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#C80014', // Вернул hover-эффект для кнопки
        }
    },
};

export default ModelPage;