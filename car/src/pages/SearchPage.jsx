import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ======================= УТИЛИТА ДЛЯ ДИНАМИЧЕСКОЙ ЗАГРУЗКИ =======================

async function fetchAllCars() {
    const modules = import.meta.glob('../data/cars/*/*/*.js');
    
    const carPromises = Object.entries(modules).map(async ([path, loader]) => {
        const module = await loader();
        const carData = module.default;

        // Извлекаем brand и model из пути к файлу
        const pathParts = path.split('/');
        const brandSlug = pathParts[3];
        const modelSlug = pathParts[4];
        
        return {
            ...carData,
            id: pathParts[5].replace('.js', ''), // ID - это имя файла
            brandSlug,
            modelSlug,
        };
    });

    return Promise.all(carPromises);
}


// ======================= КОМПОНЕНТЫ СТРАНИЦЫ =======================
// Карточка машины, можно вынести в отдельный компонент
const CarCard = ({ car }) => (
    <Link to={`/cars/${car.brandSlug}/${car.modelSlug}/${car.id}`} style={styles.cardLink}>
        {/* ... JSX карточки из прошлого ответа ... */}
    </Link>
);


const SearchPage = () => {
    const [allCars, setAllCars] = useState([]); // Здесь будут храниться ВСЕ машины после загрузки
    const [displayedCars, setDisplayedCars] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState({
        condition: 'new',
        origin: [],
        bodyType: [],
        engineType: [],
        priceFrom: 0,
        priceTo: 30000000,
    });
    
    // Функция, которая запускает поиск и фильтрацию
    const handleSearch = async () => {
        setIsLoading(true);
        let carsToFilter = allCars;

        // Если машины еще не загружены, загружаем их один раз
        if (carsToFilter.length === 0) {
            const fetchedCars = await fetchAllCars();
            setAllCars(fetchedCars);
            carsToFilter = fetchedCars;
        }
        
        // Применяем фильтры
        let filtered = carsToFilter;
        if (filters.condition === 'new') {
            filtered = filtered.filter(car => car.mileage === 0);
        } else if (filters.condition === 'used') {
            filtered = filtered.filter(car => car.mileage > 0);
        }
        // ... другие фильтры по аналогии ...
        filtered = filtered.filter(car => car.priceRussia >= filters.priceFrom && car.priceRussia <= filters.priceTo);

        setDisplayedCars(filtered);
        setIsLoading(false);
    };

    // Запускаем поиск один раз при первой загрузке страницы, чтобы показать начальные результаты
    useEffect(() => {
        handleSearch();
    }, []); // Пустой массив зависимостей означает "только при первом рендере"
    

    const handlePriceChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: Number(e.target.value) || 0 }));
    };

    const handleConditionChange = (condition) => {
        setFilters(prev => ({ ...prev, condition }));
    };

    return (
        <div style={styles.page}>
            <div style={styles.breadcrumb}>🏠 / Поиск</div>
            <h1 style={styles.pageTitle}>Поиск объявлений</h1>

            <div style={styles.filterContainer}>
                <div style={styles.tabGroup}>
                    <button onClick={() => handleConditionChange('all')} style={filters.condition === 'all' ? styles.activeTab : styles.tab}>Все</button>
                    <button onClick={() => handleConditionChange('new')} style={filters.condition === 'new' ? styles.activeTab : styles.tab}>Новые</button>
                    <button onClick={() => handleConditionChange('used')} style={filters.condition === 'used' ? styles.activeTab : styles.tab}>С пробегом</button>
                </div>
                {/* ... остальные фильтры ... */}
                <div style={styles.priceFilters}>
                    <input name="priceFrom" onChange={handlePriceChange} style={styles.input} placeholder="от 0 ₽" />
                    <input name="priceTo" onChange={handlePriceChange} style={styles.input} placeholder="до 30 000 000 ₽" />
                </div>
                <button style={styles.showButton} onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? 'Загрузка...' : `Показать (${displayedCars.length})`}
                </button>
            </div>
            
            <div style={styles.resultsGrid}>
                {displayedCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
        </div>
    );
};

const styles = { /* ... все стили из прошлого ответа ... */ };

export default SearchPage;