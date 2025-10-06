import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// ======================= КОМПОНЕНТ ФИЛЬТРОВ =======================
const FilterBlock = ({ filters, onFilterChange }) => {
    const handleCheckboxChange = (group, value) => {
        const currentValues = filters[group] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(group, newValues);
    };

    return (
        <div style={styles.filterBlock}>
            <div style={styles.filterGroup}><span style={styles.filterTitle}>Год</span><div style={styles.checkboxWrapper}>{['2023', '2024', '2025'].map(year => (<label key={year} style={styles.checkboxLabel}><input type="checkbox" checked={(filters.year || []).includes(year)} onChange={() => handleCheckboxChange('year', year)} /> {year}</label>))}</div></div>
            <div style={styles.filterGroup}><span style={styles.filterTitle}>Объем, л</span><div style={styles.checkboxWrapper}><label style={styles.checkboxLabel}><input type="checkbox" /> до 1.6</label></div></div>
            <div style={styles.filterGroup}><span style={styles.filterTitle}>Привод</span><div style={styles.checkboxWrapper}><label style={styles.checkboxLabel}><input type="checkbox" /> 4WD</label></div></div>
            <div style={styles.filterGroup}><span style={styles.filterTitle}>Стоимость</span><div style={{...styles.checkboxWrapper, gridTemplateColumns: '1fr 1fr' }}><label style={styles.checkboxLabel}><input type="checkbox" /> до 1 млн</label><label style={styles.checkboxLabel}><input type="checkbox" /> 1-2 млн</label><label style={styles.checkboxLabel}><input type="checkbox" /> 2-3 млн</label><label style={styles.checkboxLabel}><input type="checkbox" /> 3-4 млн</label><label style={styles.checkboxLabel}><input type="checkbox" /> 4-5 млн</label><label style={styles.checkboxLabel}><input type="checkbox" /> 5+ млн</label></div></div>
        </div>
    );
};

// ======================= КОМПОНЕНТ КАРТОЧКИ АВТО =======================
const CarCard = ({ car }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link 
            to={`/cars/${car.brandSlug}/${car.modelSlug}/${car.id}`} 
            style={styles.cardLink}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.card}>
                <div style={styles.cardImageContainer}>
                    <img src={(car.images && car.images[0]) || car.img} alt={car.name} style={styles.cardImage} />
                    <div style={styles.cardBottomLeftIcons}><div style={styles.iconWrapper}><span style={styles.starIcon}>⭐</span></div></div>
                    <div style={styles.cardTopRightBadges}><div style={{...styles.badge, ...styles.badgeBlue}}><span>O<small>km</small></span></div><div style={{...styles.badge, ...styles.badgeOrange}} title="ТОП 3"><span>🏆</span></div><div style={{...styles.badge, ...styles.badgeLightBlue}}><span>4+💺</span></div></div>
                    {car.mileage > 0 && (<div style={styles.mileageBadge}><div>Пробег: {car.mileage.toLocaleString('ru-RU')} км</div><div>Год: {car.year}</div></div>)}
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.cardTitleWrapper}><h3 style={styles.cardTitle}>{car.name}</h3><div style={{...styles.cardTitleTooltip, display: isHovered ? 'block' : 'none'}}>{car.name}</div></div>
                    <div style={styles.cardLocationAndId}><span style={styles.cardLocation}>В НАЛИЧИИ В КИТАЕ</span><span style={styles.cardId}>ID: {car.id}</span></div>
                    <div style={styles.cardFooter}>
                        <div style={{...styles.priceInfo, opacity: isHovered ? 0 : 1}}>
                            <div style={styles.cardPriceRussia}>~ {car.price_russia.toLocaleString('ru-RU')} ₽</div>
                            <div style={styles.cardPriceSubtitleWrapper}><span style={styles.cardPriceChina}>{car.price_china.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽ в Китае</span><span style={styles.cardPriceDisclaimer}>цена в России (под ключ)</span></div>
                        </div>
                        <div style={{...styles.orderInfo, opacity: isHovered ? 1 : 0}}>
                            <div style={styles.cardPriceChinaFull}>{car.price_china.toLocaleString('ru-RU')} ₽ <br/><span style={{fontSize: '10px'}}>Цена в Китае</span></div>
                            <button style={styles.orderButton} onClick={(e) => { e.preventDefault(); alert(`Заказ ${car.name}`); }}>Заказать</button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// ======================= ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ МОДЕЛИ =======================
const ModelPage = () => {
    const { brandSlug, modelSlug } = useParams();
    
    const [pageData, setPageData] = useState({ brandName: '', modelName: '', headerImages: [] });
    const [allCarsForModel, setAllCarsForModel] = useState([]);
    const [displayedCars, setDisplayedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState({});

    const handleFilterChange = (group, values) => {
        setFilters(prev => ({ ...prev, [group]: values }));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:4000/api/cars/${brandSlug}`);
                if (!response.ok) throw new Error('Бренд не найден');
                const allBrandCars = await response.json();

                if (allBrandCars.length === 0) throw new Error('Машин для этого бренда не найдено');

                const carsForModel = allBrandCars.filter(car => car.model.toLowerCase() === modelSlug.toLowerCase());

                if (carsForModel.length === 0) throw new Error(`Модель '${modelSlug}' не найдена`);
                
                // Добавляем brandSlug и modelSlug к каждой машине для корректной работы Link в CarCard
                const carsWithSlugs = carsForModel.map(car => ({ ...car, brandSlug, modelSlug }));

                setAllCarsForModel(carsWithSlugs);
                setPageData({
                    brandName: carsWithSlugs[0].brand,
                    modelName: carsWithSlugs[0].model,
                    headerImages: carsWithSlugs[0].headerImages || ["https://i.ibb.co/bzzx45G/l7-1.png", "https://i.ibb.co/Y0dmyhJ/l7-2.png"]
                });

            } catch (err) {
                console.error("Ошибка:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [brandSlug, modelSlug]);

    useEffect(() => {
        let cars = [...allCarsForModel];
        if (activeTab === 'new') cars = cars.filter(c => c.mileage < 1000);
        if (activeTab === 'used') cars = cars.filter(c => c.mileage >= 1000);
        if (filters.year && filters.year.length > 0) cars = cars.filter(c => filters.year.includes(String(c.year)));
        setDisplayedCars(cars);
    }, [activeTab, filters, allCarsForModel]);

    if (loading) return <div style={styles.centeredMessage}>Загрузка...</div>;
    if (error) return <div style={{...styles.centeredMessage, color: 'red'}}>Ошибка: {error}</div>;

    const countAll = allCarsForModel.length;
    const countNew = allCarsForModel.filter(c => c.mileage < 1000).length;
    const countUsed = countAll - countNew;

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}><Link to="/" style={styles.breadcrumbLink}>🏠</Link> / <Link to={`/cars/${brandSlug}`} style={styles.breadcrumbLink}>{pageData.brandName.toUpperCase()}</Link> / {pageData.modelName.toUpperCase()}</div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Купить {pageData.brandName} {pageData.modelName}</h1>
                <div style={styles.headerImages}><img src={pageData.headerImages[0]} style={styles.headerImage} /><img src={pageData.headerImages[1]} style={styles.headerImage} /></div>
            </div>
            <FilterBlock filters={filters} onFilterChange={handleFilterChange} />
            <div style={styles.tabsContainer}>
                <div style={styles.tabs}>
                    <button onClick={() => setActiveTab('all')} style={activeTab === 'all' ? styles.activeTab : styles.tab}>Все ({countAll})</button>
                    <button onClick={() => setActiveTab('new')} style={activeTab === 'new' ? styles.activeTab : styles.tab}>Новые ({countNew})</button>
                    <button onClick={() => setActiveTab('used')} style={activeTab === 'used' ? styles.activeTab : styles.tab}>С пробегом ({countUsed})</button>
                </div>
                <button style={styles.compareButton}>❤️ Сравнить все комплектации</button>
            </div>
            <div style={styles.resultsGrid}>{displayedCars.map(car => <CarCard key={car.id} car={car} />)}</div>
        </div>
    );
};

// ======================= СТИЛИ =======================
const styles = {
    page: { maxWidth: '1280px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, sans-serif', backgroundColor: '#fff', color: '#333' },
    centeredMessage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '24px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', color: '#888', marginBottom: '20px', fontSize: '14px' },
    breadcrumbLink: { textDecoration: 'none', color: '#555' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    pageTitle: { fontSize: '28px', fontWeight: 'bold' },
    headerImages: { display: 'flex', gap: '10px' },
    headerImage: { width: '150px', height: '100px', objectFit: 'cover', borderRadius: '12px' },
    filterBlock: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '12px', marginBottom: '30px' },
    filterGroup: {},
    filterTitle: { fontWeight: '500', marginBottom: '10px', display: 'block' },
    checkboxWrapper: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
    tabsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    tabs: { display: 'flex', gap: '10px' },
    tab: { padding: '8px 16px', fontSize: '14px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', borderRadius: '20px', cursor: 'pointer', color: '#555' },
    activeTab: { padding: '8px 16px', fontSize: '14px', border: '1px solid #E30016', backgroundColor: '#E30016', color: 'white', borderRadius: '20px', cursor: 'pointer' },
    compareButton: { color: '#E30016', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    cardLink: { textDecoration: 'none', color: 'inherit' },
    card: { border: '1px solid #f0f0f0', borderRadius: '10px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
    cardImageContainer: { position: 'relative', width: '100%', paddingTop: '66.66%', overflow: 'hidden', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' },
    cardImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    cardBottomLeftIcons: { position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '5px' },
    iconWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    starIcon: { fontSize: '14px' },
    cardTopRightBadges: { position: 'absolute', top: 0, right: '11px', display: 'flex', gap: '1px' },
    badge: { width: '28px', height: '27px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '10px', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' },
    badgeBlue: { backgroundColor: '#135BE8' },
    badgeOrange: { backgroundColor: '#D27029', fontSize: '14px' },
    badgeLightBlue: { backgroundColor: '#4DA7FA', fontSize: '14px' },
    mileageBadge: { position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', textAlign: 'right' },
    cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
    cardTitleWrapper: { position: 'relative', marginBottom: '8px' },
    cardTitle: { margin: 0, fontSize: '16px', fontWeight: '500', lineHeight: 1.25, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
    cardTitleTooltip: { position: 'absolute', bottom: '100%', left: '-10px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.1)', whiteSpace: 'normal', zIndex: 10, pointerEvents: 'none' },
    cardLocationAndId: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px' },
    cardLocation: { color: '#00b33e', fontWeight: 'bold', textTransform: 'uppercase' },
    cardId: { color: '#838790' },
    cardFooter: { height: '42px', position: 'relative', marginTop: 'auto' },
    priceInfo: { position: 'absolute', width: '100%', opacity: 1, transition: 'opacity 0.2s ease', pointerEvents: 'none' },
    orderInfo: { position: 'absolute', width: '100%', opacity: 0, transition: 'opacity 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' },
    cardPriceRussia: { fontSize: '20px', fontWeight: '600', marginBottom: '2px' },
    cardPriceSubtitleWrapper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#999ea6' },
    cardPriceChina: {},
    cardPriceDisclaimer: {},
    cardPriceChinaFull: { fontSize: '18px', fontWeight: 'normal', lineHeight: 1.1 },
    orderButton: { padding: '4px 16px', backgroundColor: '#E30016', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', pointerEvents: 'auto' },
};

export default ModelPage;