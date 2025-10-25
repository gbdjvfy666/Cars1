import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Импортируем ваш компонент CarCard
import CarCard from '../CarCard';

// URL вашего API
const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Секция с рекомендованными автомобилями.
 * Загружает 4 автомобиля с бэкенда и отображает их с помощью компонента CarCard.
 */
function Recommendations() {
    // Состояния для данных, загрузки и ошибок (аналогично SearchPage)
    const [recommendedCars, setRecommendedCars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect для загрузки данных при монтировании компонента
    useEffect(() => {
        const fetchRecommendations = async () => {
            // Устанавливаем начальное состояние перед запросом
            setIsLoading(true);
            setError(null);

            try {
                // Используем тот же эндпоинт `/search`, что и в SearchPage,
                // но с параметром `limit`, чтобы получить небольшое количество авто.
                const response = await fetch(`${API_BASE_URL}/search?limit=4`);
                
                if (!response.ok) {
                    throw new Error(`Ошибка получения данных: ${response.status}`);
                }
                
                const data = await response.json();

                // Ожидаем, что API вернет объект { cars: [...] }, как на SearchPage
                setRecommendedCars(data.cars || []);

            } catch (err) {
                console.error("Не удалось загрузить рекомендации:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []); // Пустой массив зависимостей гарантирует, что запрос выполнится один раз

    // Функция для отрисовки контента в зависимости от состояния
    const renderContent = () => {
        if (isLoading) {
            return <div style={styles.message}>Загрузка предложений...</div>;
        }

        if (error) {
            return <div style={{...styles.message, color: '#E30016'}}>Ошибка: {error}</div>;
        }

        if (recommendedCars.length === 0) {
            return <div style={styles.message}>Рекомендации не найдены.</div>;
        }

        return (
            <div style={styles.carGrid}>
                {recommendedCars.map(car => (
                    // Передаем в CarCard все необходимые пропсы
                    <CarCard 
                        key={car.id} 
                        car={car} 
                        view="grid" 
                    />
                ))}
            </div>
        );
    };

    return (
        <section style={styles.recommendationsSection}>
            <div style={styles.container}>
                <h2 style={styles.title}>Вам может быть интересно</h2>
                
                {renderContent()}

                <div style={styles.actionContainer}>
                    {/* Кнопка теперь ведет на реальную страницу поиска */}
                    <Link to="/search" style={{ textDecoration: 'none' }}>
                        <button style={styles.viewAllButton}>
                            Смотреть все автомобили
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ======================= СТИЛИ =======================
const styles = {
    recommendationsSection: {
        backgroundColor: '#131313',
        padding: '80px 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderTop: '1px solid #2a2a2a',
    },
    container: {
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 24px',
    },
    title: {
        color: '#f0f0f0',
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '48px',
    },
    carGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px',
    },
    actionContainer: {
        textAlign: 'center',
        marginTop: '60px',
    },
    viewAllButton: {
        backgroundColor: '#E30016',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '16px 48px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        textTransform: 'uppercase',
        transition: 'background-color 0.2s, transform 0.2s',
        boxShadow: '0 4px 20px rgba(227, 0, 22, 0.3)',
    },
    message: {
        textAlign: 'center',
        padding: '50px 0',
        fontSize: '18px',
        color: '#999',
    },
};

export default Recommendations;