import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ====================================================================
// ПОЛНЫЕ ДАННЫЕ С ДОБАВЛЕННЫМ ПОЛЕМ 'slug' ДЛЯ URL
// ====================================================================

const carData = {
  chinese: {
    title: "Китайские",
    brands: [
        { name: 'LiXiang', slug: 'lixiang', count: 3298, imgSrc: 'https://crh.market/storage/car-brands/January2023/QHue9Fsr5hV2jlLLNNKL.jpg' },
        { name: 'ZEEKR', slug: 'zeekr', count: 1076, imgSrc: 'https://crh.market/storage/car-brands/January2023/9zTrJWWsHFZk4tTt85gI.png' },
        { name: 'Voyah', slug: 'voyah', count: 1074, imgSrc: 'https://crh.market/storage/car-brands/January2023/WALARkbzhKeTFBBgNv0y.png' },
        { name: 'BYD', slug: 'byd', count: 18825, imgSrc: 'https://crh.market/storage/car-brands/February2023/3fpP277q6V8aQx78Iy2F.jpg' },
        { name: 'Jetta', slug: 'jetta', count: 931, imgSrc: 'https://crh.market/storage/car-brands/January2023/YW3kmUZn5AnCSvu94fTG.png' },
        { name: 'red flag', slug: 'red-flag', count: 4466, imgSrc: 'https://crh.market/storage/car-brands/January2023/Kp17AsniuhHVVLoepxq2.png' },
        { name: 'Link&Co', slug: 'link-co', count: 4790, imgSrc: 'https://crh.market/storage/car-brands/January2023/66md7kIG1rsIJtkBd5cr.png' },
        { name: 'Lotus', slug: 'lotus', count: 98, imgSrc: 'https://crh.market/storage/car-brands/January2024/MSTUcFFyBj3HfczdLvwy.png' },
        { name: 'Changan', slug: 'changan', count: 9904, imgSrc: 'https://crh.market/storage/car-brands/January2023/twq0V6jJ0hGBOiiS3rJm.png' },
        { name: 'Deepal', slug: 'deepal', count: 896, imgSrc: 'https://crh.market/storage/car-brands/July2023/VEPSuJQaYiLOwxY2Aocy.png' },
        { name: 'Galaxy', slug: 'galaxy', count: 122, imgSrc: 'https://crh.market/storage/car-brands/July2023/fchLV5jmW4D2ceE72r3N.png' },
        { name: 'Futian (Foton)', slug: 'foton', count: 1106, imgSrc: 'https://crh.market/storage/car-brands/January2023/j8VMNhPq0yFeX3fo5zVR.png' },
        { name: 'GAC', slug: 'gac', count: 6833, imgSrc: 'https://crh.market/storage/car-brands/January2023/au4MZ4FJhxZnYB0zObaP.png' },
        { name: 'Geely', slug: 'geely', count: 14663, imgSrc: 'https://crh.market/storage/car-brands/January2023/4oGUXwvDipXePkS1tC7I.jpg' },
        { name: 'AITO', slug: 'aito', count: 1670, imgSrc: 'https://crh.market/storage/car-brands/January2023/A5rmPJdGr8JCaHUH8WX0.jpg' },
        { name: 'Hi-Phi', slug: 'hiphi', count: 119, imgSrc: 'https://crh.market/storage/car-brands/January2023/9ERaTXa2i50bgpjfIDWz.png' },
        { name: 'Wuling', slug: 'wuling', count: 11299, imgSrc: 'https://crh.market/storage/car-brands/January2023/08nvbca1LQs3dju5NAET.png' },
        { name: 'Haval', slug: 'haval', count: 8392, imgSrc: 'https://crh.market/storage/car-brands/February2023/9faTz9LvuiAd6Hd7kHE9.png' },
        { name: 'ROEWE', slug: 'roewe', count: 4819, imgSrc: 'https://crh.market/storage/car-brands/January2023/uT9PGDQyDdMYhAkRTqD2.png' },
        { name: 'Chery', slug: 'chery', count: 4283, imgSrc: 'https://crh.market/storage/car-brands/January2023/WS1ipMAqjXridxckW8rA.png' },
        { name: 'Baojun', slug: 'baojun', count: 3322, imgSrc: 'https://crh.market/storage/car-brands/January2023/0nn9oVneYQvNy268r5AS.png' },
        { name: 'NIO', slug: 'nio', count: 3205, imgSrc: 'https://crh.market/storage/car-brands/January2023/lW3URvwmYvBbAIhx76VG.jpg' },
        { name: 'X-Peng', slug: 'xpeng', count: 2789, imgSrc: 'https://crh.market/storage/car-brands/January2023/iEB2xpU1tr0rsICdK8xR.png' },
        { name: 'Leapmotor', slug: 'leapmotor', count: 2326, imgSrc: 'https://crh.market/storage/car-brands/January2023/9yl8iAynAvRMQo5UdHfG.png' },
        { name: 'Ora', slug: 'ora', count: 2264, imgSrc: 'https://crh.market/storage/car-brands/February2023/w5XhVFXeooiOq7miPnJQ.png' },
        { name: 'Tank', slug: 'tank', count: 2166, imgSrc: 'https://crh.market/storage/car-brands/January2023/T6Vk0SaMImBEKh0y7iIo.png' },
        { name: 'Aion', slug: 'aion', count: 2077, imgSrc: 'https://crh.market/storage/car-brands/February2023/ukSibPEPrrAEt4HO1p2q.jpg' },
    ]
  },
  european: {
    title: "Европейские",
    brands: [
      { name: 'Volkswagen', slug: 'volkswagen', count: 35029, imgSrc: 'https://crh.market/storage/car-brands/January2023/oN6U4CbaADyyYY8kM5Fo.png' },
      { name: 'Mercedes', slug: 'mercedes', count: 18099, imgSrc: 'https://crh.market/storage/car-brands/January2023/9QeLliPTh1Xcuj2Suv4x.png' },
      { name: 'Skoda', slug: 'skoda', count: 1673, imgSrc: 'https://crh.market/storage/car-brands/January2023/YyKBxkF8mMHh2Z8wC5DA.png' },
      { name: 'BMW', slug: 'bmw', count: 11719, imgSrc: 'https://crh.market/storage/car-brands/January2023/nLWDZ29c8FA2nNzYqKis.png' },
      { name: 'Audi', slug: 'audi', count: 19615, imgSrc: 'https://crh.market/storage/car-brands/January2023/xPre3OJpfI9YS0MlOYoQ.png' },
      { name: 'Volvo', slug: 'volvo', count: 4799, imgSrc: 'https://crh.market/storage/car-brands/January2023/XKBA5typU22iCe3ju9FG.png' },
      { name: 'Porsche', slug: 'porsche', count: 4621, imgSrc: 'https://crh.market/storage/car-brands/January2023/8rYmBdn7jbXOzYKURGa8.png' },
      { name: 'Mini', slug: 'mini', count: 4046, imgSrc: 'https://crh.market/storage/car-brands/January2023/OajxwlgB6fAmL02durRn.png' },
      { name: 'Landrover', slug: 'landrover', count: 2745, imgSrc: 'https://crh.market/storage/car-brands/January2023/Z32TiaBAXAwoYRweubVM.png' },
      { name: 'MG', slug: 'mg', count: 2559, imgSrc: 'https://crh.market/storage/car-brands/January2023/7nMHue7wNIxxszU04TFo.png' },
      { name: 'Peugeot', slug: 'peugeot', count: 1559, imgSrc: 'https://crh.market/storage/car-brands/January2023/M85GeZmpdOlzcCV4uEen.png' },
    ]
  },
  american: {
    title: "Американские",
    brands: [
      { name: 'Chevrolet', slug: 'chevrolet', count: 5318, imgSrc: 'https://crh.market/storage/car-brands/January2023/x1H05iynLuyVQVG06GYq.png' },
      { name: 'Tesla', slug: 'tesla', count: 9621, imgSrc: 'https://crh.market/storage/car-brands/January2023/KJbDyOd9zXR0TJa9SeZj.png' },
      { name: 'Ford', slug: 'ford', count: 6560, imgSrc: 'https://crh.market/storage/car-brands/January2023/y8lvFQoeSRMqDhtcNXag.png' },
      { name: 'Lincoln', slug: 'lincoln', count: 1887, imgSrc: 'https://crh.market/storage/car-brands/January2023/2PrDfbeE7GPSZ1vsWBSA.png' },
      { name: 'Buick', slug: 'buick', count: 13223, imgSrc: 'https://crh.market/storage/car-brands/January2023/miax2jJnHpLnh5NJekVt.png' },
      { name: 'Cadillac', slug: 'cadillac', count: 5420, imgSrc: 'https://crh.market/storage/car-brands/January2023/Lbe7CHrq47SlD1uNy3H5.png' },
      { name: 'Jeep', slug: 'jeep', count: 3278, imgSrc: 'https://crh.market/storage/car-brands/January2023/AzaQ1IdGkuqY1ANrNA1z.png' },
    ]
  },
  japanese: {
    title: "Японские",
    brands: [
      { name: 'Honda', slug: 'honda', count: 17249, imgSrc: 'https://crh.market/storage/car-brands/January2023/ocGevlYn5DLj9AoGYKAM.png' },
      { name: 'Mazda', slug: 'mazda', count: 3184, imgSrc: 'https://crh.market/storage/car-brands/January2023/kxPLvmHX7h6NTeLeiZE7.png' },
      { name: 'Toyota', slug: 'toyota', count: 16391, imgSrc: 'https://crh.market/storage/car-brands/January2023/AnK6MxkXBaqLJmC9gsEF.png' },
      { name: 'Nissan', slug: 'nissan', count: 8985, imgSrc: 'https://crh.market/storage/car-brands/January2023/X5Xm6WcevuZoZhh1JJl1.png' },
      { name: 'Lexus', slug: 'lexus', count: 3486, imgSrc: 'https://crh.market/storage/car-brands/January2023/YrxIoyTWo1tpdZmPnoUe.png' },
    ]
  },
  korean: {
    title: "Корейские",
    brands: [
      { name: 'Hyundai', slug: 'hyundai', count: 63812, imgSrc: 'https://crh.market/storage/car-brands/January2023/jdXjvkrIAAzZTgmUobG9.png' },
      { name: 'Kia', slug: 'kia', count: 62892, imgSrc: 'https://crh.market/storage/car-brands/January2023/NObZUycdeZUZeFlSsrmf.png' },
      { name: 'Genesis', slug: 'genesis', count: 10161, imgSrc: 'https://crh.market/storage/car-brands/July2023/FH2fgVUeskRN77HAUGXU.png' },
      { name: 'Renault Samsung', slug: 'renault-samsung', count: 3, imgSrc: 'https://crh.market/storage/car-brands/July2023/Ht2xAE7bLrf1XBGHoFeJ.png' },
    ]
  }
};

const INITIAL_VISIBLE_COUNT = { chinese: 11, european: 5, american: 5, japanese: 5, korean: 4 };
const ICON_PLACEHOLDER = 'https://placehold.co/32x32/f0f0f0/ccc.png?text=...';

const BrandItem = ({ slug, imgSrc, name, count }) => (
  <Link to={slug ? `/cars/${slug}` : '#'} style={styles.brandLink}>
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
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.brandGrid(sectionKey)}>
        {displayedBrands.map(brand => <BrandItem key={`${brand.name}-${brand.count}`} {...brand} />)}
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

const MainContent = ({ onToggleSection, expandedSections }) => (
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
            <BrandSection key={key} sectionKey={key} title={value.title} brands={value.brands} isExpanded={!!expandedSections[key]} onToggle={onToggleSection} />
          ))}
        </div>
    </div>
);

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

function HeroSection() {
    const [expandedSections, setExpandedSections] = useState({});
    const handleToggleSection = (sectionKey) => {
        setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };

    return (
        <div style={styles.container}>
            <MainContent onToggleSection={handleToggleSection} expandedSections={expandedSections} />
            <Sidebar />
        </div>
    );
}

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
    submitButton: { width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#E30016', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' },
    stats: { marginTop: '24px', fontSize: '14px', color: '#555', lineHeight: '1.8' },
    statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

export default HeroSection;