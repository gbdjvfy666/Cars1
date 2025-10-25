import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../other/Breadcrumbs';

// 1. ИМПОРТЫ ВСЕХ КОМПОНЕНТОВ
import ImageGallery from '../components/Car/ImageGallery';
import CarDetailsPanel from '../components/Car/CarDetailsPanel'; 
import OptionsCarousel from '../components/Car/OptionsCarousel'; // НОВЫЙ ИМПОРТ
import Characteristics from '../components/Car/Characteristics'; // НОВЫЙ ИМПОРТ
import Accessories from '../components/Car/Accessories'; // НОВЫЙ ИМПОРТ

// ======================= ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ =======================

const safeJSONParse = (data, returnType = 'array') => {
    if (typeof data !== 'string') {
        return data || (returnType === 'array' ? [] : {});
    }
    if (!data) {
        return returnType === 'array' ? [] : {};
    }
    try {
        const cleanedData = data.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        return JSON.parse(cleanedData);
    } catch (e) {
        console.error("Ошибка парсинга JSON:", data, e);
        return returnType === 'array' ? [] : {};
    }
};

// ======================= ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ =======================

const CarPage = () => {
    // Основные стили макета (минимум, только для wrapper и контейнера)
    const layoutStyles = {
        pageWrapper: {
            backgroundColor: '#131313',
            backgroundImage: 'radial-gradient(circle at 70% 20%, #2a2a2a 0%, #131313 64%)',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            padding: '40px 0',
            color: '#f0f0f0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        container: {
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 24px',
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: '55% 45%',
            gap: '40px',
            alignItems: 'flex-start',
            marginTop: '24px',
        },
    };
    
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

    const breadcrumbItems = [
        { label: car.brand || brandSlug, to: `/cars/${brandSlug}` },
        { label: car.model || modelSlug, to: `/cars/${brandSlug}/${modelSlug}` },
        { label: car.name || carId, to: `/cars/${brandSlug}/${modelSlug}/${carId}` }
    ];
    
    // Подготовка данных для галереи (сводка)
    const carInfoForGallery = {
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year,
        mileage: car.mileage ? `${(car.mileage / 1000).toFixed(0)} тыс. км` : 'Н/Д',
        owners: car.owners || 'Н/Д',
        power: car.specs?.engine_power || 'Н/Д',
        drive: car.specs?.drive_type || 'Н/Д',
        transmission: car.specs?.transmission_type || 'Н/Д',
        engine: car.specs?.engine_type || 'Н/Д',
        seats: car.specs?.seats || 'Н/Д',
        acceleration: car.specs?.acceleration_0_100 || 'Н/Д',
        price_china: car.price_china,
        price_russia: car.price_russia || 0,
        market_price_label: "Рыночная цена", 
        market_price_value: "2 050 404 ₽", 
        days_on_market: car.days_on_market ? `${car.days_on_market} дня` : 'Н/Д',
        location: car.location || 'Китай, Чэнду',
        id: car.id,
    };

    return (
        <div style={layoutStyles.pageWrapper}>
            <div style={layoutStyles.container}>
                <Breadcrumbs items={breadcrumbItems} />

                <div style={layoutStyles.mainGrid}>
                    {/* ЛЕВАЯ КОЛОНКА */}
                    <ImageGallery 
                        images={car.images} 
                        tags={car.tags} 
                        id={car.id} 
                        carInfo={carInfoForGallery}
                    />
                    
                    {/* ПРАВАЯ КОЛОНКА */}
                    <CarDetailsPanel car={car} />
                </div>
                
                {/* НИЖНИЕ СЕКЦИИ */}
                <OptionsCarousel options={car.options} />
                <Characteristics characteristics={car.characteristics} />
                <Accessories accessories={car.accessories} model={car.model} />
            </div>
        </div>
    );
};

export default CarPage;