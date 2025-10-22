import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchPanelUI.module.css';

const SearchPanelUI = () => {
    // Панель теперь всегда активна, состояние isPowerOn убрано
    const [angle, setAngle] = useState(0);
    const [filterIndex, setFilterIndex] = useState(0);
    const [foundCount, setFoundCount] = useState(1488); 
    
    const rotRef = useRef(null);
    const countRef = useRef(null);
    const loadingBarRef = useRef(null);
    
    const filterData = [
        { name: 'Все', count: 1488 }, 
        { name: 'Германия', count: 320 }, 
        { name: 'Япония', count: 512 },
        { name: 'Корея', count: 250 }, 
        { name: 'Китай', count: 310 },  
        { name: 'США', count: 96 }
    ];

    // Эффект для создания конического градиента на вращающемся фоне
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

    // Логика вращения циферблата
    const handleDialClick = () => {
        const newAngle = angle + 60;
        setAngle(newAngle);
        const newIndex = (filterIndex + 1) % filterData.length;
        setFilterIndex(newIndex);
        setFoundCount(filterData[newIndex].count); 
        
        // Активация индикатора "загрузки"
        if (loadingBarRef.current) {
            loadingBarRef.current.classList.add(styles.active);
            setTimeout(() => {
                loadingBarRef.current && loadingBarRef.current.classList.remove(styles.active);
            }, 1200);
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

                        {/* ======================================================= */}
                        {/* ||      ВЕРХНЯЯ ЧАСТЬ: ФОРМА И КНОПКИ ДЕЙСТВИЙ        || */}
                        {/* ======================================================= */}
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
                        
                        {/* ======================================================= */}
                        {/* ||             НИЖНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ              || */}
                        {/* ======================================================= */}
                        <div className={styles.controlPanel}>
                            <div className={styles.window}>
                                <div className={styles.windowRounded}>
                                    {/* Индикатор загрузки */}
                                    <div className={`${styles.loadingBar} ${styles.active}`} ref={loadingBarRef}>
                                      <div></div><div></div><div></div><div></div>
                                    </div>
                                    {/* Циферблат */}
                                    <div className={styles.backCircle}></div>
                                    <div className={styles.circle} ref={rotRef} style={{ transform: `rotate(${angle}deg)` }}></div>
                                    <div className={styles.innerCircle} onClick={handleDialClick}>
                                        <div className={styles.dialLabel}>{filterData[filterIndex].name}</div>
                                    </div>
                                    
                                    {/* Дисплей справа */}
                                    <div className={styles.rightDisplayBlock}>
                                        <p className={styles.label}>Найдено авто</p>
                                        <div className={styles.screen}>
                                            <p className={styles.countDisplay} ref={countRef}>
                                              {foundCount}
                                            </p>
                                        </div>
                                        <div className={`${styles.toggle} ${styles.active}`}>Новые</div>
                                        <div className={`${styles.toggle} ${styles.two}`}>Б/У</div>
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