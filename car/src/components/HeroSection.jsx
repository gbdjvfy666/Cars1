import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ====================================================================
// КОНСТАНТЫ
// ====================================================================

// Сколько марок видно по умолчанию в секции
const INITIAL_VISIBLE_COUNT = { chinese: 11, european: 5, american: 5, japanese: 5, korean: 4 };
const ICON_PLACEHOLDER = 'https://placehold.co/32x32/f0f0f0/ccc.png?text=...';

// ====================================================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ====================================================================

const BrandItem = ({ slug, imgSrc, name, count }) => (
  <Link to={slug ? `/cars/${slug}` : '#'} style={styles.brandLink}>
    <div style={styles.brandInner}>
      <img 
        src={imgSrc || ICON_PLACEHOLDER} 
        alt={name} 
        style={styles.brandLogo} 
        // Если иконка не загрузилась, используем заглушку
        onError={(e) => { e.currentTarget.src = ICON_PLACEHOLDER; }} 
      />
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
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.brandGrid(sectionKey)}>
        {displayedBrands.map(brand => (
          <BrandItem 
            key={brand.slug} 
            {...brand} 
            // count теперь динамически считается бэкендом
            count={brand.count} 
          />
        ))}
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
// ОСНОВНОЙ КОНТЕНТ (Отображает марки и обрабатывает состояния загрузки)
// ====================================================================

const MainContent = ({ carData, loading, error, onToggleSection, expandedSections }) => {
    
    // 1. Состояние загрузки
    if (loading) return (
        <div style={styles.mainContent}>
            <div style={{...styles.header, justifyContent: 'center', marginTop: 50}}>
                <h1 style={{...styles.mainTitle, color: '#E30016'}}>Загрузка марок...</h1>
            </div>
            <div style={{minHeight: 300}}></div>
        </div>
    );

    // 2. Состояние ошибки
    if (error) return (
        <div style={styles.mainContent}>
             <div style={{...styles.header, justifyContent: 'center', marginTop: 50}}>
                <h1 style={{...styles.mainTitle, color: 'red', textAlign: 'center'}}>
                    Ошибка загрузки данных:
                </h1>
                <p style={{textAlign: 'center', color: '#555', marginTop: 10}}>{error}</p>
                <p style={{textAlign: 'center', color: '#555'}}>
                    Проверьте, запущен ли ваш бэкенд-сервер на порту 4000.
                </p>
            </div>
            <div style={{minHeight: 300}}></div>
        </div>
    );
    
    // 3. Успешная загрузка данных
    return (
        <div style={styles.mainContent}>
            <div style={styles.header}>
                <h1 style={styles.mainTitle}>Автомобили из Китая в <span style={{color: '#E30016'}}>1 клик</span></h1>
                <span style={styles.subHeader}>МАРКЕТПЛЕЙС КИТАЙСКИХ АВТОМОБИЛЕЙ</span>
            </div>
            <div style={styles.tabs}>
                <button style={{...styles.tab, ...styles.activeTab}}>Все</button>
                <button style={styles.tab}>Новые</button>
                <button style={styles.tab}>С пробегом</button>
            </div>
            <div style={styles.allBrandsContainer}>
                {Object.entries(carData).map(([key, value]) => (
                    <BrandSection 
                        key={key} 
                        sectionKey={key} 
                        title={value.title} 
                        brands={value.brands} 
                        isExpanded={!!expandedSections[key]} 
                        onToggle={onToggleSection} 
                    />
                ))}
            </div>
        </div>
    );
};

const Sidebar = () => (
    <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Быстрый подбор</h2>
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.activeFilter}}>Новые</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>С пробегом</button></div>
        <hr style={styles.hr} />
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.activeFilter}}>Внедорожник</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Седан</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Минивэн</button></div>
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Пикап</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Фургон</button></div>
        <hr style={styles.hr} />
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.activeFilter}}>до 3 млн ₽</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>3-6 млн</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>от 6 млн ₽</button></div>
        <hr style={styles.hr} />
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.activeFilter}}>Китайские</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Европейские</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Американские</button></div>
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Японские</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Корейские</button></div>
        <hr style={styles.hr} />
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.inactiveFilter}}>2WD</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>4WD</button></div>
        <hr style={styles.hr} />
        <div style={styles.filterGroup}><button style={{...styles.filterButton, ...styles.activeFilter}}>Электро</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Бензин</button><button style={{...styles.filterButton, ...styles.inactiveFilter}}>Гибрид</button></div>
        <Link to="/search" style={styles.submitButton}>🔍 Подобрать</Link>
        <div style={styles.stats}>
            <div style={styles.statRow}><span>🚗 Новых: <b>16211</b></span><span>🏷️ Марок: <b>599</b></span></div>
            <div style={styles.statRow}><span>🏁 С пробегом: <b>12792</b></span><span>📋 Моделей: <b>5572</b></span></div>
            <div style={styles.statRow}><span>🚘 Всего: <b>29003</b></span></div>
        </div>
    </div>
);

// ====================================================================
// ГЛАВНЫЙ КОМПОНЕНТ HeroSection (Hooks)
// ====================================================================

function HeroSection() {
    const [expandedSections, setExpandedSections] = useState({});
    
    // --- Состояния для загрузки данных из БД ---
    const [carData, setCarData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const handleToggleSection = (sectionKey) => {
        setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };

    // Хук для загрузки данных марок из API при монтировании компонента
    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true);
            setError(null);
            try {
                // Запрос к нашему новому бэкенд-эндпоинту
                const response = await fetch('http://localhost:4000/api/brands'); 
                
                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.statusText} (Статус: ${response.status})`);
                }
                
                const data = await response.json();
                setCarData(data); // Обновляем состояние загруженными данными
            } catch (err) {
                console.error("Ошибка загрузки марок:", err);
                // Устанавливаем сообщение об ошибке для отображения пользователю
                setError(err.message || "Не удалось подключиться к серверу.");
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []); // Запрос выполнится только один раз при монтировании

    return (
        <div style={styles.container}>
            <MainContent 
                carData={carData} 
                loading={loading}
                error={error}
                onToggleSection={handleToggleSection} 
                expandedSections={expandedSections} 
            />
            <Sidebar />
        </div>
    );
}

// ====================================================================
// СТИЛИ (Остаются без изменений)
// ====================================================================

const styles = {
    container: { display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '1280px', margin: '40px auto', padding: '0 24px' },
    mainContent: { flex: '0 0 67%', paddingRight: '32px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    mainTitle: { fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#000', lineHeight: 1.2 },
    subHeader: { color: '#E30016', fontSize: '12px', fontWeight: 'bold', textAlign: 'right', lineHeight: '1.2', maxWidth: '120px' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '28px' },
    tab: { padding: '7px 20px', fontSize: '14px', border: '1px solid #d7d8dc', backgroundColor: '#fff', borderRadius: '20px', cursor: 'pointer', color: '#4c4a55', fontWeight: 500 },
    activeTab: { backgroundColor: '#E30016', color: '#fff', border: '1px solid #E30016' },
    allBrandsContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' },
    brandSectionWrapper: (key) => ({ gridColumn: key === 'chinese' ? '1 / -1' : 'auto', marginBottom: '40px' }),
    sectionTitle: { fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500 },
    brandGrid: (key) => ({ display: 'grid', gridTemplateColumns: key === 'chinese' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '16px 32px' }),
    brandLink: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' },
    brandInner: { display: 'flex', alignItems: 'center', gap: '12px' },
    brandLogo: { width: '32px', height: '32px', objectFit: 'contain' },
    brandName: { fontSize: '14px', fontWeight: 500, color: '#333' },
    brandCount: { fontSize: '14px', color: '#999' },
    showAllButton: { background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#6f737d', transition: 'color 0.2s', marginTop: '8px' },
    showAllText: { fontSize: '14px', fontWeight: 500, marginRight: '4px' },
    showAllIcon: { transition: 'transform 0.3s ease-in-out' },
    sidebar: { flex: '1 1 33%', backgroundColor: 'rgb(255, 249, 249)', padding: '24px', borderRadius: '12px', border: '1px solid rgb(251, 235, 235)', height: 'fit-content' },
    sidebarTitle: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#000' },
    filterGroup: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' },
    filterButton: { padding: '8px 12px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
    activeFilter: { backgroundColor: '#E30016', color: '#fff', border: '1px solid #E30016' },
    inactiveFilter: { backgroundColor: '#fff', color: '#333', border: '1px solid #e0e0e0'},
    hr: { border: 'none', borderTop: '1px solid rgb(251, 235, 235)', margin: '20px 0' },
    submitButton: { width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', textDecoration: 'none', textAlign: 'center' },
    stats: { marginTop: '24px', fontSize: '14px', color: '#555', lineHeight: '1.8' },
    statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

export default HeroSection;
