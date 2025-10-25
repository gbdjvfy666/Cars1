import React from 'react';

// ====================================================================
// ГЛАВНЫЙ КОМПОНЕНТ (ТЕПЕРЬ ЭТО HERO СЕКЦИЯ)
// ====================================================================

function HeroSection() {
    return (
        // Основная обертка со стилем фона
        <div style={styles.pageWrapper}>
            {/* Контейнер для центрирования контента */}
            <div style={styles.container}>
                
                {/* Новый блок для контента Hero-секции */}
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Автомобили из Китая в <span style={{color: '#E30016'}}>один клик</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Ваш надежный партнер в поиске и доставке лучших автомобилей с азиатского рынка. Прозрачные цены, быстрая доставка и гарантия качества.
                    </p>
                    <button style={styles.heroButton}>
                        Подобрать автомобиль
                    </button>
                </div>

            </div>
        </div>
    );
}

// ====================================================================
// ОБЪЕКТ СТИЛЕЙ (сохранен и дополнен)
// ====================================================================
const styles = {
    // Стили обертки страницы, отвечают за фон
    pageWrapper: {
        backgroundColor: '#131313',
        backgroundImage: 'radial-gradient(circle at 70% 20%, #2a2a2a 0%, #131313 64%)',
        minHeight: '100vh',
        display: 'flex', // Добавлено для вертикального центрирования
        alignItems: 'center', // Добавлено для вертикального центрирования
        padding: '40px 0',
        backgroundAttachment: 'fixed', 
        backgroundRepeat: 'no-repeat',
    },
    // Основной контейнер, который ограничивает ширину и центрирует контент
    container: { 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
        maxWidth: '1360px', 
        margin: '0 auto',
        padding: '0 24px', 
        width: '100%',
    },
    // 🔥 НОВЫЕ СТИЛИ ДЛЯ HERO СЕКЦИИ 🔥
    heroContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '800px', // Ограничиваем ширину текста для читаемости
        margin: '0 auto', // Центрируем блок
    },
    heroTitle: {
        fontSize: '56px', // Увеличиваем размер основного заголовка
        fontWeight: 'bold',
        margin: 0,
        color: '#f0f0f0',
        lineHeight: 1.2,
        marginBottom: '16px', // Отступ снизу
    },
    heroSubtitle: {
        fontSize: '18px',
        color: '#b0b0b0', // Делаем цвет чуть менее ярким, чем заголовок
        lineHeight: 1.6,
        maxWidth: '600px', // Сужаем подзаголовок для лучшей формы текста
        marginBottom: '32px', // Увеличиваем отступ до кнопки
    },
    heroButton: {
        backgroundColor: '#E30016', // Фирменный красный цвет
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '16px 32px', // Делаем кнопку крупнее
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        textTransform: 'uppercase', // Текст заглавными буквами
        transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Плавный переход для будущих эффектов
        boxShadow: '0 4px 20px rgba(227, 0, 22, 0.3)', // Добавляем свечение
    },
};

export default HeroSection;