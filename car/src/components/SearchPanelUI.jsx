import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchPanelUI.module.css';

// Данные о странах без состояния isHovered
const initialFilterData = [
    { name: 'Все', count: 1488, angle: 0, flagImage: '' }, 
    { name: 'Германия', count: 320, angle: 60, flagImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg' }, 
    { name: 'Япония', count: 512, angle: 120, flagImage: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg' },
    { name: 'Корея', count: 250, angle: 180, flagImage: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg' }, 
    { name: 'Китай', count: 310, angle: 240, flagImage: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg' }, 
    { name: 'США', count: 96, angle: 300, flagImage: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg' }
];


const SearchPanelUI = () => {
    const [angle, setAngle] = useState(0);
    const [filterIndex, setFilterIndex] = useState(0);
    const [foundCount, setFoundCount] = useState(1488); 
    
    const rotRef = useRef(null);
    const loadingBarRef = useRef(null);

    useEffect(() => {
        if (rotRef.current) {
            const step = 2;
            const color1 = 'rgba(0,0,0,0.5)';
            const color2 = 'rgba(0,0,0,0.1)';
            let gradient = 'conic-gradient(';
            for (let i = 0; i < 360; i += step) {
                const color = i % (2 * step) === 0 ? color1 : color2;
                gradient += `${color} ${i}deg, `;
            }
            gradient = gradient.slice(0, -2) + '), rgb(85 93 108)';
            rotRef.current.style.background = gradient;
        }
    }, []);

    const handleCountrySelect = (index) => {
        let targetAngle = initialFilterData[index].angle;

        const currentRotation = angle - (angle % 360);
        if (targetAngle < (angle % 360)) {
            targetAngle += 360;
        }

        const newAngle = currentRotation + targetAngle;

        setAngle(newAngle);
        setFilterIndex(index);
        setFoundCount(initialFilterData[index].count); 
        
        if (loadingBarRef.current) {
            loadingBarRef.current.classList.remove(styles.active);
            void loadingBarRef.current.offsetWidth;
            loadingBarRef.current.classList.add(styles.active);
        }
    };
    
    // Функции-заглушки для кнопок в верхней панели
    const handleAction1Click = () => { console.log("Действие 1: Расширенный поиск"); };
    const handleAction2Click = () => { console.log("Действие 2: Сбросить фильтры"); };
    const handleAction3Click = () => { console.log("Действие 3: Показать избранное"); };

    return (
        <div className={styles.searchPanelContainer}>
            <div className={styles.outerRim}>
                <div className={styles.outerRim2}>
                    <div className={styles.innerRim}>

                        <div className={styles.searchFormContainer}>
                           <div className={styles.formFields}>
                                <h3>Параметры подбора автомобиля</h3>
                                <div className={styles.inputGroup}>
                                    <input type="text" placeholder="Марка" />
                                    <input type="text" placeholder="Модель" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input type="text" placeholder="Год от" />
                                    <input type="text" placeholder="Бюджет до, $" />
                                </div>
                                <button className={styles.searchButton}>Найти</button>
                           </div>
                           
                           <div className={styles.actionButtonsContainer}>
                                <div className={styles.actionButton} onClick={handleAction1Click}>
                                    <p>🔍</p><span>Расширенный поиск</span>
                                </div>
                                <div className={styles.actionButton} onClick={handleAction2Click}>
                                    <p>♻️</p><span>Сбросить</span>
                                </div>
                                <div className={styles.actionButton} onClick={handleAction3Click}>
                                    <p>❤️</p><span>Избранное</span>
                                </div>
                           </div>
                        </div>
                        
                        <div className={styles.controlPanel}>
                            <div className={styles.window}>
                                <div className={styles.windowRounded}>
                                    <div className={styles.rightDisplayBlock}>
                                        <p className={styles.label}>Найдено авто</p>
                                        <div className={styles.screen}>
                                            <p className={styles.countDisplay}>
                                                {foundCount}
                                            </p>
                                        </div>
                                        <div className={`${styles.toggle} ${styles.active}`}>Новые</div>
                                        <div className={`${styles.toggle} ${styles.two}`}>Б/У</div>
                                    </div>

                                    {/* БОКОВЫЕ КНОПКИ УПРАВЛЕНИЯ ЦИФЕРБЛАТОМ (УПРОЩЕННАЯ РАЗМЕТКА) */}
                                    <div className={styles.countryButtonsLeft}>
                                        {initialFilterData.slice(4).reverse().map((country, index) => {
                                            const i = 5 - index; // Фактический индекс в initialFilterData
                                            return (
                                                <button 
                                                    key={country.name}
                                                    className={`${styles.countryButton} ${filterIndex === i ? styles.active : ''}`}
                                                    onClick={() => handleCountrySelect(i)}
                                                    style={{ 
                                                        '--flag-url': `url(${country.flagImage})`
                                                    }}
                                                >
                                                    {country.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className={styles.countryButtonsRight}>
                                        {initialFilterData.slice(1, 4).map((country, index) => {
                                             const i = index + 1; // Фактический индекс в initialFilterData
                                            return (
                                                <button 
                                                    key={country.name}
                                                    className={`${styles.countryButton} ${filterIndex === i ? styles.active : ''}`}
                                                    onClick={() => handleCountrySelect(i)}
                                                    style={{ 
                                                        '--flag-url': `url(${country.flagImage})`
                                                    }}
                                                >
                                                    {country.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className={styles.backCircle}></div>
                                    <div className={styles.circle} ref={rotRef} style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}></div>
                                    <div className={styles.innerCircle}>
                                        <div className={styles.dialLabel}>{initialFilterData[filterIndex].name}</div>
                                    </div>
                                    
                                    <div className={styles.loadingBar} ref={loadingBarRef}>
                                        <div></div><div></div><div></div><div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPanelUI;