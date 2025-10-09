import React,{ useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

// ======================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =======================

// Безопасный парсер JSON. Если приходит не строка или невалидный JSON, вернет пустой массив или объект.
const safeJSONParse = (data, returnType = 'array') => {
    if (typeof data !== 'string') {
        // Если это уже объект/массив, просто возвращаем его
        return data || (returnType === 'array' ? [] : {});
    }
    try {
        const parsed = JSON.parse(data);
        return parsed;
    } catch (e) {
        // В случае ошибки парсинга, возвращаем пустую структуру
        return returnType === 'array' ? [] : {};
    }
};

// Безопасный парсер для поля images, которое хранится в формате {url1,url2}
const parseImageString = (imageStr) => {
    if (!imageStr || typeof imageStr !== 'string') return [];
    // Удаляем фигурные скобки и разбиваем по запятой
    return imageStr.replace(/[{}]/g, '').split(',').filter(url => url);
}


// ======================= МЕЛКИЕ КОМПОНЕНТЫ =======================

const ImageGallery = ({ images, tags, id }) => ( <div style={styles.galleryContainer}><div style={styles.mainImageWrapper}><img src={images[0]} style={styles.mainImage} alt="Main car view" /><div style={styles.imageTags}>{tags.map(tag => <span key={tag} style={styles.imageTag}>{tag}</span>)}</div><div style={styles.imageId}>ID: {id}</div><div style={styles.inStockLabel}>В наличии в Китае</div></div><div style={styles.thumbnailGrid}>{images.slice(1, 3).map((img, index) => <img key={index} src={img} style={styles.thumbnail} alt={`Thumbnail ${index + 1}`} />)}<div style={styles.thumbnailOverlay}><span>+{(images.length - 3 > 0) ? images.length - 3 : '!'}</span></div></div></div> );
const SpecsTable = ({ specs }) => ( <div style={styles.specsTable}>{Object.entries(specs).map(([key, value]) => ( <div key={key} style={styles.specItem}><div style={styles.specKey}>{key}:</div><div style={styles.specValue}>{value}</div></div>))}</div> );
const OptionsCarousel = ({ options }) => ( <div style={styles.optionsContainer}><h2 style={styles.sectionTitle}>Опции</h2><div style={styles.optionsCarousel}><button style={styles.carouselArrow}>{"<"}</button>{options.map((opt, i) => (<div key={i} style={styles.optionItem}><img src={opt.icon} style={styles.optionIcon} alt={opt.name} /><div style={styles.optionName}>{opt.name}</div></div>))}<button style={styles.carouselArrow}>{">"}</button></div><div style={styles.buttonsContainer}><button style={styles.redButton}>Сравнить все комплектации</button><button style={styles.whiteButton}>Как проходит сделка?</button></div></div> );

// 🚨 ИСПРАВЛЕННЫЙ КОМПОНЕНТ CHARACTERISTICS
const Characteristics = ({ characteristics }) => {
    if (!characteristics || Object.keys(characteristics).length === 0) return null;

    const [activeSection, setActiveSection] = useState(Object.keys(characteristics)[0] || "");
    const sectionRefs = useRef({});

    const handleNavClick = (key) => {
        setActiveSection(key);
        sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div style={styles.charContainer}>
            <h2 style={styles.sectionTitle}>Характеристики</h2>
            <div style={styles.charGrid}>
                <nav style={styles.charTabs}>
                    {Object.keys(characteristics).map(key => (
                        <button key={key} onClick={() => handleNavClick(key)} style={activeSection === key ? styles.activeCharTab : styles.charTab}>{key}</button>
                    ))}
                </nav>
                <div style={styles.charContent}>
                    {Object.entries(characteristics).map(([key, items], index) => {
                        // ✨ ГЛАВНОЕ ИСПРАВЛЕНИЕ:
                        // Преобразуем данные в массив, если они им не являются
                        const dataAsArray = Array.isArray(items) 
                            ? items 
                            : Object.entries(items).map(([name, value]) => ({ name, value }));

                        return (
                            <div key={key} ref={el => sectionRefs.current[key] = el} data-section-key={key}>
                                <h3 style={styles.charCategoryTitle(index === 0)}>{key}</h3>
                                {dataAsArray.map(item => (
                                    <div key={item.name} style={styles.charRow}>
                                        <div style={styles.charName}><span style={styles.infoIcon}>ⓘ</span>{item.name}</div>
                                        <div style={styles.charValue}>{typeof item.value === 'boolean' ? (item.value ? '●' : '○') : item.value}</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const Accessories = ({ accessories, model }) => ( <div><h2 style={styles.sectionTitle}>Аксессуары {model}</h2><div style={styles.accessoriesGrid}>{accessories.map(acc => (<div key={acc.name} style={styles.accessoryCard}><img src={acc.img} style={styles.accessoryImage} alt={acc.name} /><h4 style={styles.accessoryName}>{acc.name} - {acc.price.toLocaleString('ru-RU')} ₽</h4><p style={styles.accessoryDesc}>{acc.description}</p></div>))}</div></div> );

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
                
                // ✨ ГЛАВНОЕ ИСПРАВЛЕНИЕ: Парсим все JSON-строки в объекты/массивы
                const parsedData = {
                    ...data,
                    images: parseImageString(data.images),
                    specs: safeJSONParse(data.specs, 'object'),
                    options: safeJSONParse(data.options, 'array'),
                    characteristics: safeJSONParse(data.characteristics, 'object'),
                    accessories: safeJSONParse(data.accessories, 'array'),
                    colors: parseImageString(data.colors), // Также парсим цвета
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

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadcrumbLink}>🏠</Link> / 
                <Link to={`/cars/${brandSlug}`} style={styles.breadcrumbLink}>{(car.brand || brandSlug).toUpperCase()}</Link> / 
                <Link to={`/cars/${brandSlug}/${modelSlug}`} style={styles.breadcrumbLink}>{(car.model || modelSlug).toUpperCase()}</Link> / {carId}
            </div>

            <div style={styles.mainGrid}>
                <ImageGallery images={car.images} tags={car.tags || []} id={carId} />
                <div style={styles.detailsColumn}>
                    <h1 style={styles.carTitle}>{car.name}</h1>
                    <SpecsTable specs={car.specs} />
                    <div style={{ margin: '20px 0', borderBottom: '1px solid #eee' }}></div>
                    <div style={styles.colors}>
                        <span style={styles.specKey}>Цвет кузова:</span>
                        <div style={styles.colorSwatches}>
                            {car.colors.map((color, index) => <div key={index} style={{...styles.colorSwatch, backgroundColor: color}}></div>)}
                        </div>
                    </div>
                    <div style={styles.priceBlock}>
                        <div style={styles.priceChina}>{priceChina.toLocaleString('ru-RU')} ₽ <span style={{color: '#999'}}>Цена в Китае</span></div>
                        <div style={styles.priceRussia}>~ {priceRussia.toLocaleString('ru-RU')} ₽</div>
                    </div>
                    <div style={styles.deliveryInfo}><span style={{color: 'red', marginRight: 5}}>!</span>Доставка, таможенные платежи, СБКТС и ЭПТС включены в стоимость...</div>
                    <button style={styles.orderButton}>Оставить заявку</button>
                </div>
            </div>
            
            <OptionsCarousel options={car.options} />
            <Characteristics characteristics={car.characteristics} />
            <Accessories accessories={car.accessories} model={car.model} />
        </div>
    );
};

// ======================= СТИЛИ (без изменений) =======================
const styles = {
    page: { maxWidth: '1280px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    breadcrumb: { color: '#888', marginBottom: '20px', fontSize: '14px' },
    breadcrumbLink: { textDecoration: 'none', color: '#555' },
    mainGrid: { display: 'grid', gridTemplateColumns: '55% 45%', gap: '40px', alignItems: 'flex-start' },
    detailsColumn: { paddingLeft: '20px' },
    galleryContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
    mainImageWrapper: { borderRadius: '12px', overflow: 'hidden', position: 'relative' },
    mainImage: { width: '100%', display: 'block' },
    imageTags: { position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' },
    imageTag: { backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' },
    imageId: { position: 'absolute', bottom: '15px', left: '15px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'},
    inStockLabel: { position: 'absolute', bottom: '15px', right: '15px', color: '#333', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '500'},
    thumbnailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
    thumbnail: { width: '100%', borderRadius: '8px', cursor: 'pointer', height: '120px', objectFit: 'cover' },
    thumbnailOverlay: { background: 'rgba(0,0,0,0.6)', color: 'white', display: 'grid', placeItems: 'center', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' },
    carTitle: { fontSize: '28px', fontWeight: 'bold', margin: '0 0 20px 0', lineHeight: 1.3 },
    specsTable: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '8px', marginBottom: '20px' },
    specItem: { display: 'flex', flexDirection: 'column' },
    specKey: { color: '#888', fontSize: '14px', marginBottom: '4px' },
    specValue: { fontWeight: '500', fontSize: '16px' },
    colors: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' },
    colorSwatches: { display: 'flex', gap: '8px' },
    colorSwatch: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 1px #ddd', cursor: 'pointer' },
    priceBlock: { margin: '20px 0' },
    priceChina: { fontSize: '18px', color: '#333' },
    priceRussia: { fontSize: '28px', fontWeight: 'bold', color: '#333', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', marginTop: '10px', textAlign: 'center' },
    deliveryInfo: { fontSize: '12px', color: '#999', margin: '20px 0', padding: '10px', backgroundColor: '#fff8f8', borderRadius: '8px', display: 'flex', alignItems: 'center' },
    orderButton: { width: '100%', padding: '18px', backgroundColor: '#E30016', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
    sectionTitle: { fontSize: '24px', fontWeight: 'bold', margin: '60px 0 20px 0', textAlign: 'center' },
    optionsContainer: { padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginTop: '40px' },
    optionsCarousel: { display: 'flex', gap: '20px', overflowX: 'auto', padding: '20px 10px', alignItems: 'center', justifyContent: 'center' },
    carouselArrow: { background: 'none', border: '1px solid #ccc', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' },
    optionItem: { textAlign: 'center', minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    optionIcon: { width: '50px', height: '50px' },
    optionName: { fontSize: '12px', color: '#666' },
    buttonsContainer: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' },
    redButton: { padding: '12px 24px', backgroundColor: '#E30016', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    whiteButton: { padding: '12px 24px', backgroundColor: 'white', color: '#E30016', border: '1px solid #E30016', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    charContainer: { marginTop: '40px' },
    charGrid: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px', backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px', alignItems: 'start' },
    charTabs: { display: 'flex', flexDirection: 'column', gap: '5px', position: 'sticky', top: '20px' },
    charTab: { padding: '10px 15px', border: '1px solid #eee', backgroundColor: 'white', color: '#333', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s, border-color 0.2s' },
    activeCharTab: { padding: '10px 15px', border: '1px solid #E30016', backgroundColor: '#E30016', color: 'white', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s, color 0.2s' },
    charContent: { overflowY: 'auto', padding: '0 20px', minHeight: '300px' },
    charCategoryTitle: (isFirst) => ({ fontSize: '18px', fontWeight: 'bold', color: '#E30016', margin: '0 0 20px 0', paddingTop: isFirst ? 0 : '20px', borderTop: isFirst ? 'none' : '1px solid #eee' }),
    charRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #eee', padding: '12px 0', fontSize: '14px' },
    charName: { color: '#666', display: 'flex', alignItems: 'center', gap: '8px' },
    infoIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ccc', color: 'white', fontSize: '10px', fontWeight: 'bold' },
    charValue: { fontWeight: '500', justifySelf: 'flex-end' },
    accessoriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    accessoryCard: { border: '1px solid #eee', borderRadius: '8px', padding: '15px' },
    accessoryImage: { width: '100%', height: '150px', objectFit: 'contain', marginBottom: '10px' },
    accessoryName: { margin: '0 0 5px 0', fontSize: '16px' },
    accessoryDesc: { fontSize: '12px', color: '#666', lineHeight: 1.5 },
};

export default CarPage;