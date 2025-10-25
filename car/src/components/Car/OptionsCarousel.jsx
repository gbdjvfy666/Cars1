// OptionsCarousel.js (Улучшенный визуал и логика)

import React, { useRef } from 'react';

const OptionsCarousel = ({ options }) => {
    // 💡 Хук для управления прокруткой карусели
    const carouselRef = useRef(null);

    // =======================================================================
    // 🎨 ЛОКАЛЬНЫЕ СТИЛИ ДЛЯ OptionsCarousel
    // =======================================================================
    const styles = {
        optionsContainer: { 
            marginTop: '40px', 
            padding: '24px 0', // Убираем горизонтальный padding, чтобы карусель прилегала
            backgroundColor: '#1c1c1c', 
            borderRadius: '12px', 
            border: '1px solid #333',
            overflow: 'hidden', // Чтобы стрелки были вне прокручиваемой области
            position: 'relative', // Для позиционирования стрелок
        },
        sectionTitle: { 
            fontSize: '26px', 
            fontWeight: '700', 
            margin: '0 0 24px 0', 
            color: '#f0f0f0', 
            textAlign: 'center',
            padding: '0 24px', // Возвращаем padding для заголовка
        },
        // 💡 Улучшенная карусель: Flexbox, скрытие скроллбара, плавность
        optionsCarouselWrapper: {
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px', // Отступы по бокам для видимости первого/последнего элемента
        },
        optionsCarousel: { 
            display: 'flex', 
            gap: '16px', 
            overflowX: 'scroll', 
            paddingBottom: '10px', 
            scrollBehavior: 'smooth',
            flexGrow: 1, // Занимает всё доступное пространство между стрелками
            // Скрытие скроллбара
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
            '::-webkit-scrollbar': { display: 'none' }, // Chrome, Safari, Opera
        },
        // 💡 Стиль для элемента карусели (теперь это Категория)
        optionItem: { 
            minWidth: '220px', 
            maxWidth: '220px',
            backgroundColor: '#242424', // Более темный фон для карточек
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #444',
            transition: 'border-color 0.2s',
            cursor: 'default',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
        optionCategory: { 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '10px',
            color: '#E30016', // Красный акцент для категории
            textAlign: 'left',
        },
        optionList: {
            listStyle: 'disc inside',
            margin: '0',
            paddingLeft: '10px',
            textAlign: 'left',
            color: '#ccc',
            fontSize: '14px',
        },
        optionListItem: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '2px 0',
        },
        // 💡 Стиль для стрелок
        carouselArrow: { 
            background: 'rgba(51, 51, 51, 0.8)', // Полупрозрачный фон
            border: '1px solid #555', 
            color: '#f0f0f0', 
            width: '40px',
            height: '40px',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer', 
            borderRadius: '50%',
            zIndex: 10,
            transition: 'background-color 0.2s',
            flexShrink: 0, // Не сжимать стрелки
        },
        buttonsContainer: { 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginTop: '30px',
            padding: '0 24px', // Отступы для кнопок
        },
        redButton: { 
            padding: '12px 24px', 
            backgroundColor: '#E30016', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s',
        },
        whiteButton: { 
            padding: '12px 24px', 
            backgroundColor: '#f0f0f0', 
            color: '#131313', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'opacity 0.2s',
        }
    };

    if (!options || options.length === 0) return null;
    
    // 💡 Функция для прокрутки
    const scroll = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 250; // Расстояние прокрутки
            carouselRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    };
    
    // Мы берем первые 3-4 пункта из каждой категории для краткого отображения в карусели
    const MAX_ITEMS_TO_SHOW = 4; 

    return (
        <div style={styles.optionsContainer}>
            <h2 style={styles.sectionTitle}>Основные опции комплектации</h2>
            
            <div style={styles.optionsCarouselWrapper}>
                <button style={styles.carouselArrow} onClick={() => scroll('left')}>{"<"}</button>
                
                <div style={styles.optionsCarousel} ref={carouselRef}>
                    {options.map((categoryData, i) => (
                        // 💡 Использование категории как элемента карусели
                        <div key={i} style={styles.optionItem}>
                            <h4 style={styles.optionCategory}>{categoryData.category}</h4>
                            <ul style={styles.optionList}>
                                {categoryData.items.slice(0, MAX_ITEMS_TO_SHOW).map((item, itemIndex) => (
                                    <li key={itemIndex} style={styles.optionListItem} title={item}>
                                        {item}
                                    </li>
                                ))}
                                {categoryData.items.length > MAX_ITEMS_TO_SHOW && (
                                    <li style={{...styles.optionListItem, color: '#E30016', fontWeight: 'bold'}}>
                                        ... и еще {categoryData.items.length - MAX_ITEMS_TO_SHOW}
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>

                <button style={styles.carouselArrow} onClick={() => scroll('right')}>{">"}</button>
            </div>
            
            <div style={styles.buttonsContainer}>
                <button style={styles.redButton}>Сравнить все комплектации</button>
                <button style={styles.whiteButton}>Как проходит сделка?</button>
            </div>
        </div>
    );
};

export default OptionsCarousel;