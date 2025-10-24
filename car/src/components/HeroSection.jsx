import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// ИМПОРТИРУЕМ НАШ НОВЫЙ КОМПОНЕНТ
import LuminousCard from './Card'; // <-- Убедитесь, что путь к файлу верный

// ====================================================================
// КОНСТАНТЫ
// ====================================================================

const API_BASE_URL = 'http://localhost:4000/api';
const INITIAL_VISIBLE_COUNT = { chinese: 11, european: 5, american: 5, japanese: 5, korean: 4 };
const ICON_PLACEHOLDER = 'https://placehold.co/32x32/f0f0f0/ccc.png?text=...';

// ====================================================================
// ВЛОЖЕННЫЕ КОМПОНЕНТЫ (остаются без изменений)
// ====================================================================

const BrandItem = ({ slug, imgSrc, name, count }) => (
    <Link to={`/cars/${slug}`} style={styles.brandLink}>
        <div style={styles.brandInner}>
            <img src={imgSrc || ICON_PLACEHOLDER} alt={name} style={styles.brandLogo} onError={(e) => { e.currentTarget.src = ICON_PLACEHOLDER; }} /> 
            <div style={styles.brandName}>{name}</div>
        </div>
        <div style={styles.brandCount}>{count}</div>
    </Link>
);

const BrandSection = ({ sectionKey, title, brands, isExpanded, onToggle }) => {
    const initialCount = INITIAL_VISIBLE_COUNT[sectionKey] || brands.length;
    const canBeExpanded = brands.length > initialCount;
    const displayedBrands = isExpanded ? brands : brands.slice(0, initialCount);
    
    return (
        <div style={styles.brandSectionWrapper(sectionKey)}>
            <div style={styles.sectionTitle}>{title.toUpperCase()}</div>
            <div style={styles.brandGrid(sectionKey)}>
                {displayedBrands.map(brand => <BrandItem key={brand.slug} {...brand} />)}
                {canBeExpanded && (
                    <button onClick={() => onToggle(sectionKey)} style={styles.showAllButton}>
                        <span style={styles.showAllText}>{isExpanded ? 'Скрыть' : 'Показать все'}</span> 
                        <svg width="19" height="19" viewBox="0 0 19 19" fill="currentColor" style={{...styles.showAllIcon, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                            <path d="M5.675 6.5L9.5 10.2085L13.325 6.5L14.5 7.6417L9.5 12.5L4.5 7.6417L5.675 6.5Z" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

// ====================================================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ====================================================================

function HomePage() {
    const [expandedSections, setExpandedSections] = useState({});
    const [carData, setCarData] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/brands`);
                if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
                const data = await response.json();
                setCarData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []); 

    const handleToggleSection = (sectionKey) => {
        setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };
    
    const totalCars = loading || error ? 0 : Object.values(carData).reduce((sum, group) => sum + group.brands.reduce((brandSum, brand) => brandSum + brand.count, 0), 0);
    const displayData = loading || error ? [] : Object.entries(carData).filter(([, value]) => value.brands.length > 0);

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={styles.mainContent}>
                    <div style={styles.header}>
                        <h1 style={styles.mainTitle}>Автомобили из Китая в <span style={{color: '#E30016'}}>1 клик</span></h1>
                        <span style={styles.subHeader}>Найдено {totalCars.toLocaleString('ru-RU')} объявлений</span>
                    </div>
                    {loading && <div style={{textAlign: 'center', padding: '50px 0', fontSize: '18px', color: '#fff'}}>Загрузка марок...</div>}
                    {error && <div style={{textAlign: 'center', padding: '50px 0', color: '#ff8a8a'}}>Ошибка: {error}</div>}
                    {!loading && !error && (
                        <div style={styles.allBrandsContainer}>
                            {displayData.map(([key, value]) => (
                                <BrandSection key={key} sectionKey={key} title={value.title} brands={value.brands} isExpanded={!!expandedSections[key]} onToggle={handleToggleSection} />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* КОНТЕЙНЕР ДЛЯ КАРТОЧКИ */}
                <div style={styles.sidebarContainer}>
                    <LuminousCard />
                </div>

            </div>
        </div>
    );
}

// ====================================================================
// ОБЪЕКТ СТИЛЕЙ
// ====================================================================
const styles = {
    pageWrapper: {
        backgroundColor: '#131313',
        backgroundImage: 'radial-gradient(circle at 70% 20%, #2a2a2a 0%, #131313 64%)',
        // ИЗМЕНЕНИЕ 1: Убираем верхний отступ (оставляем только 0 для верха), чтобы sticky элемент мог подняться выше.
        padding: '0 0 40px 0',
        minHeight: '100vh',
        
        // ==============================================
        // !!! НОВЫЕ СВОЙСТВА ДЛЯ СТАТИЧНОГО ФОНА !!!
        backgroundAttachment: 'fixed', 
        backgroundRepeat: 'no-repeat',
        // ==============================================
    },
    container: { 
        display: 'flex', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
        maxWidth: '1360px', 
        margin: '0 auto',
        // ИЗМЕНЕНИЕ 2: Возвращаем 40px верхнего отступа для контента здесь, чтобы он не слипался с Navbar.
        padding: '40px 24px 0 24px', 
        gap: '32px', 
        alignItems: 'flex-start' 
    },
    mainContent: { flex: '1 1 67%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
    mainTitle: { fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#f0f0f0', lineHeight: 1.2 },
    subHeader: { color: '#E30016', fontSize: '12px', fontWeight: 'bold', textAlign: 'right', lineHeight: '1.2', maxWidth: '120px' },
    allBrandsContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' },
    brandSectionWrapper: (key) => ({ gridColumn: key === 'chinese' ? '1 / -1' : 'auto', marginBottom: '40px' }),
    sectionTitle: { fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500 },
    brandGrid: (key) => ({ display: 'grid', gridTemplateColumns: key === 'chinese' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '16px 32px' }),
    brandLink: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', transition: 'background-color 0.2s', padding: '5px 0', borderRadius: '4px' },
    brandInner: { display: 'flex', alignItems: 'center', gap: '12px' },
    brandLogo: { width: '32px', height: '32px', objectFit: 'contain' },
    brandName: { fontSize: '14px', fontWeight: 500, color: '#e0e0e0' },
    brandCount: { fontSize: '14px', color: '#888' },
    showAllButton: { background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#aaa', transition: 'color 0.2s', marginTop: '8px' },
    showAllText: { fontSize: '14px', fontWeight: 500, marginRight: '4px' },
    showAllIcon: { transition: 'transform 0.3s ease-in-out' },
    
    // НОВЫЙ СТИЛЬ для контейнера, в котором будет наша карточка
    sidebarContainer: { 
        flex: '0 0 30rem', // Задаем фиксированную ширину, равную ширине карточки
        position: 'sticky', 
        // ИЗМЕНЕНИЕ: Устанавливаем прилипание на 110px от верха viewport. 
        // Это (70px Navbar + 40px padding контейнера) = 110px.
        top: '110px' 
    },
};

export default HomePage;
