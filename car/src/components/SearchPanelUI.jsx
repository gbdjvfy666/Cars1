import React, { useState, useEffect, useRef } from 'react';
// Импорты Firebase удалены, так как сейчас мы фокусируемся только на визуале.

const SearchPanelUI = () => {
    // Состояние для управления циферблатом и отображением данных
    const [angle, setAngle] = useState(0);
    const [filterIndex, setFilterIndex] = useState(0);
    const [foundCount, setFoundCount] = useState(1488); 
    
    // Рефы для прямого доступа к DOM-элементам (вращающийся круг, счетчик, индикатор загрузки)
    const rotRef = useRef(null);
    const countRef = useRef(null);
    const loadingBarRef = useRef(null);
    
    // Данные для отображения в циферблате
    const filterData = [
        { name: 'Все', count: 1488 }, 
        { name: 'Германия', count: 320 }, 
        { name: 'Япония', count: 512 },
        { name: 'Корея', count: 250 }, 
        { name: 'Китай', count: 310 },  
        { name: 'США', count: 96 }
    ];

    // Эффект для создания конического градиента на вращающемся фоне (визуальная инициализация)
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

    // Логика вращения циферблата и обновления данных
    const handleDialClick = () => {
        const newAngle = angle + 60;
        setAngle(newAngle);
        const newIndex = (filterIndex + 1) % filterData.length;
        setFilterIndex(newIndex);
        setFoundCount(filterData[newIndex].count); 
        
        // Активация индикатора "загрузки"
        if (loadingBarRef.current) {
            loadingBarRef.current.classList.add('active');
            setTimeout(() => {
                loadingBarRef.current && loadingBarRef.current.classList.remove('active');
            }, 1200);
        }
    };
    
    // Функции-заглушки для кнопок в верхней панели
    const handleAction1Click = () => { console.log("Действие 1: Расширенный поиск"); };
    const handleAction2Click = () => { console.log("Действие 2: Сбросить фильтры"); };
    const handleAction3Click = () => { console.log("Действие 3: Показать избранное"); };

    return (
        <div className="searchPanelContainer">
            {/* Внедряем стили CSS прямо в компонент */}
            <style jsx="true">{`
                @import url('https://fonts.cdnfonts.com/css/transponder-aoe');

                /* === ОБЩИЕ СТИЛИ И СБРОСЫ === */
                .searchPanelContainer, .searchPanelContainer * {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    box-sizing: border-box;
                }

                /* === ОСНОВНОЙ КОНТЕЙНЕР (ПРЯМОУГОЛЬНЫЙ) === */
                .searchPanelContainer {
                    position: relative;
                    width: 850px;
                    height: 600px; 
                    max-width: 95vw;
                    font-family: Arial, sans-serif;
                }

                .outerRim {
                    position: absolute;
                    top: 0; bottom: 0; left: 0; right: 0;
                    margin: auto;
                    width: 100%;
                    height: 100%;
                    border-radius: 30px; 
                    overflow: hidden; 
                    box-shadow: -20px 20px 30px 10px rgb(0 0 0 / 40%), -40px 40px 40px 10px rgb(0 0 0 / 60%); 
                    background: linear-gradient(205deg, rgb(69 75 85) 0%, rgb(22 25 32) 100%);
                }

                .outerRim2 {
                    width: 100%; height: 100%;
                    border-radius: 30px;
                    box-shadow: 2px -2px 2px 0 rgb(108 115 129 / 80%), -15px 15px 12px 10px rgb(0 0 0 / 50%),
                    inset -2px 2px 2px 0 rgb(108 115 129 / 20%), inset 2px -2px 2px 0px rgb(0 0 0 / 30%);
                }

                .innerRim {
                    width: 100%; height: 100%;
                    border-radius: 30px;
                    box-shadow: -2px 2px 2px 0 rgb(108 115 129 / 40%), 2px -2px 1px 0px rgb(0 0 0 / 20%), 
                    inset -3px 3px 2px 1px rgb(0 0 0 / 50%);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                /* === ВЕРХНЯЯ ЧАСТЬ: ФОРМА И КНОПКИ ДЕЙСТВИЙ === */
                .searchFormContainer {
                    position: relative;
                    width: 100%;
                    flex-grow: 1; 
                    background: rgb(40, 44, 54); 
                    border-radius: 15px;
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.6); 
                    color: white;
                    padding: 25px 30px;
                    display: flex;
                    gap: 30px;
                    justify-content: space-between;
                }

                .formFields {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .formFields h3 {
                    color: #ccc; font-weight: 300; text-align: left;
                    margin-top: 0; margin-bottom: 20px; font-size: 16px;
                }
                .inputGroup { display: flex; gap: 15px; margin-bottom: 15px; }
                .inputGroup input {
                    width: 100%; padding: 14px 15px;
                    border: 1px solid rgba(0, 0, 0, 0.5);
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px; color: #fff;
                    font-size: 16px; outline: none; transition: all 0.2s;
                }
                .inputGroup input::placeholder { color: #888; }
                .inputGroup input:focus { border-color: #00aaff; box-shadow: 0 0 8px rgba(0, 170, 255, 0.5); }
                .searchButton {
                    width: 100%; padding: 14px; border: none; background: #00aaff; color: #fff;
                    font-size: 18px; border-radius: 8px; cursor: pointer; margin-top: auto; 
                    transition: background 0.2s;
                }
                .searchButton:hover { background: #0088cc; }

                .actionButtonsContainer {
                    display: flex; flex-direction: column;
                    justify-content: space-between;
                    width: 220px; 
                }
                .actionButton {
                    display: flex; align-items: center; padding: 12px 20px;
                    background: rgb(40, 44, 54);
                    border-radius: 10px;
                    cursor: pointer;
                    color: #ccc;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                    box-shadow: 
                        inset 1px 1px 2px 0px rgba(255, 255, 255, 0.1),
                        inset -1px -1px 2px 0px rgba(0, 0, 0, 0.8),
                        3px 3px 5px rgba(0,0,0,0.3);
                }
                .actionButton:hover { border-color: rgba(255, 255, 255, 0.3); }
                .actionButton:active {
                    box-shadow: 
                        inset -1px -1px 2px 0px rgba(255, 255, 255, 0.1),
                        inset 1px 1px 2px 0px rgba(0, 0, 0, 0.8);
                }
                .actionButton p { margin: 0 12px 0 0; font-size: 20px; }
                .actionButton span { font-size: 14px; font-weight: 500; }

                /* === НИЖНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ === */
                .controlPanel {
                    position: relative; width: 100%; height: 230px; margin-top: 20px;
                    background: none; overflow: hidden; border-radius: 15px;
                }
                .window {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    overflow: hidden;
                    box-shadow: inset 0px 8px 10px -5px rgba(0, 0, 0, 0.6), inset 0px -2px 2px 0px rgba(255, 255, 255, 0.2);
                }
                .windowRounded {
                    position: absolute; width: 100%; height: 100%;
                    background: linear-gradient(to right, rgb(202, 216, 228) 55%, rgb(40, 44, 54) 55%);
                }

                /* ======================================================= */
                /* === Центральный циферблат                === */
                /* ======================================================= */

                /* 1. Общие правила позиционирования для всех кругов */
                .backCircle, .circle, .innerCircle {
                    position: absolute;
                    border-radius: 50%;
                    top: 50%;
                    left: 28%; 
                    /* Transform для .circle удален, т.к. он перенесен в JSX для корректной работы с rotate */
                }

                /* 2. BackCircle (Свечение) - НЕ ВРАЩАЕТСЯ, центрирование через transform */
                .backCircle {
                    width: 180px; height: 180px;
                    background: none;
                    transform: translate(-50%, -50%); 
                    box-shadow: -12px 22px 22px 0px rgba(152, 243, 248,0.2), -6px 12px 12px 4px rgba(152, 243, 248, 0.2); 
                }

                /* 3. Circle (Вращающийся) - Transform: translate будет добавлен ИНЛАЙН в React */
                .circle {
                    width: 180px; height: 180px;
                    transition: transform 1s ease-in-out;
                    box-shadow: 0px 0px 2px 2px rgba(108, 115, 129, 0.4), 0px 0px 3px 4px rgba(108, 115, 129, 0.2); 
                }

                /* 4. InnerCircle (Передний) - НЕ ВРАЩАЕТСЯ, центрирование через transform */
                .innerCircle {
                    width: 170px; height: 170px;
                    transform: translate(-50%, -50%); 
                    box-shadow: 16px -16px 22px 0px rgba(0, 0, 0, 0.4),
                    inset -3px 3px 2px 1px rgba(0, 0, 0, 0.5), inset 5px -5px 14px 3px rgba(108, 115, 129, 0.5);
                    background: linear-gradient(25deg, rgb(69 75 85) 0%, rgb(22 25 32) 100%);
                    cursor: pointer;
                    display: flex; justify-content: center; align-items: center;
                    color: #ccc; font-size: 22px; font-weight: bold; text-align: center;
                }
                .dialLabel { opacity: 1; }

                /* --- Правый блок дисплея --- */
                .rightDisplayBlock {
                    position: absolute; right: 0; top: 0; width: 45%; height: 100%; padding: 20px;
                }
                .label { position: absolute; color: #999; font-size: 14px; top: 20px; left: 20px; }
                .screen {
                    position: absolute; top: 45px; left: 20px; width: calc(100% - 40px); height: 70px;
                    background: #000; border-radius: 8px;
                    box-shadow: inset 0 0 2px 2px rgba(0,0,0, 1), inset 0 0 2px 2px rgba(255,255,255, 0.7);
                    display: flex; justify-content: center; align-items: center;
                }
                .countDisplay {
                    background: none; font-size: 42px; font-family: 'Transponder AOE', sans-serif;
                    color: rgba(255, 255, 255, 0.8); text-shadow: 0px 0px 8px rgba(255, 255, 255, 0.4);
                }
                .toggle {
                    position: absolute; bottom: 30px; left: 20px; color: rgba(170, 170, 170, 0.7);
                    font-size: 14px; background: rgba(0, 0, 0, 0.5); width: 80px; height: 35px;
                    display: flex; justify-content: center; align-items: center; border-radius: 20px;
                    box-shadow: inset -1px 2px 4px 0 rgba(255, 255, 255, 0.4); cursor: pointer;
                }
                .toggle.two { left: 110px; }
                .toggle.active {
                    color: #fff; text-shadow: 0 0 5px #fff;
                    box-shadow: inset -1px 2px 4px 0 rgba(0, 195, 255, 0.7);
                }

                /* --- Индикатор загрузки --- */
                .loadingBar {
                    position: absolute; background: none; width: 120px; height: 10px;
                    bottom: 15px; left: 28%;
                    transform: translateX(-50%); border-radius: 50px;
                    overflow: hidden; box-shadow: inset 0 0 5px rgba(0,0,0,0.8);
                }
                .loadingBar > div {
                    background: rgba(152, 243, 248, 0.9); width: 25%; height: 100%;
                    transition: opacity 0.2s 1s, transform 0.8s ease-out;
                    opacity: 0; left: 0; position: absolute; transform: translateX(-100%);
                }
                .loadingBar.active > div {
                    opacity: 1; transform: translateX(300%);
                    transition: opacity 0.1s, transform 0.8s ease-out;
                }
            `}</style>

            <div className="outerRim">
                <div className="outerRim2">
                    <div className="innerRim">

                        {/* ======================================================= */}
                        {/* ||      ВЕРХНЯЯ ЧАСТЬ: ФОРМА И КНОПКИ ДЕЙСТВИЙ        || */}
                        {/* ======================================================= */}
                        <div className="searchFormContainer">
                           <div className="formFields">
                                <h3>Параметры подбора автомобиля</h3>
                                <div className="inputGroup">
                                    <input type="text" placeholder="Марка" />
                                    <input type="text" placeholder="Модель" />
                                </div>
                                <div className="inputGroup">
                                    <input type="text" placeholder="Год от" />
                                    <input type="text" placeholder="Бюджет до, $" />
                                </div>
                                <button className="searchButton">Найти</button>
                           </div>
                           
                           <div className="actionButtonsContainer">
                                <div className="actionButton" onClick={handleAction1Click}>
                                    <p>🔍</p><span>Расширенный поиск</span>
                                </div>
                                <div className="actionButton" onClick={handleAction2Click}>
                                    <p>♻️</p><span>Сбросить</span>
                                </div>
                                <div className="actionButton" onClick={handleAction3Click}>
                                    <p>❤️</p><span>Избранное</span>
                                </div>
                           </div>
                        </div>
                        
                        {/* ======================================================= */}
                        {/* ||             НИЖНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ              || */}
                        {/* ======================================================= */}
                        <div className="controlPanel">
                            <div className="window">
                                <div className="windowRounded">
                                    {/* Индикатор загрузки */}
                                    <div className={`loadingBar active`} ref={loadingBarRef}>
                                        <div></div><div></div><div></div><div></div>
                                    </div>
                                    
                                    {/* Циферблат */}
                                    {/* 1. СВЕЧЕНИЕ (Самый задний) */}
                                    <div className="backCircle"></div>
                                    
                                    {/* 2. ВРАЩАЮЩИЙСЯ КРУГ (Средний) */}
                                    <div 
                                        className="circle" 
                                        ref={rotRef} 
                                        style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                                    ></div>
                                    
                                    {/* 3. ПЕРЕДНИЙ ЦИФЕРБЛАТ (Самый передний) */}
                                    <div className="innerCircle" onClick={handleDialClick}>
                                        <div className="dialLabel">{filterData[filterIndex].name}</div>
                                    </div>
                                    
                                    {/* Дисплей справа */}
                                    <div className="rightDisplayBlock">
                                        <p className="label">Найдено авто</p>
                                        <div className="screen">
                                            <p className="countDisplay" ref={countRef}>
                                              {foundCount}
                                            </p>
                                        </div>
                                        <div className={`toggle active`}>Новые</div>
                                        <div className={`toggle two`}>Б/У</div>
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
