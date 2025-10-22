import React, { useState, useEffect, useRef } from 'react';
import styles from './PortholeUI.module.css';

const PortholeUI = () => {
    const [isPowerOn, setIsPowerOn] = useState(false);
    const [angle, setAngle] = useState(0);
    const [weatherIndex, setWeatherIndex] = useState(0);
    const [tempUnit, setTempUnit] = useState('F');
    const [baseTempF, setBaseTempF] = useState(34);

    const [isAnimatingTemp, setIsAnimatingTemp] = useState(false);
    
    // Состояния для анимаций боковых кнопок
    const [isRocketActive, setIsRocketActive] = useState(false);
    const [isMonsterActive, setIsMonsterActive] = useState(false);
    const [isBiplaneActive, setIsBiplaneActive] = useState(false);

    const rotRef = useRef(null);
    const rotIconsRef = useRef(null);
    const tempRef = useRef(null);
    const loadingBarRef = useRef(null);
    const rocketRef = useRef(null);
    const monsterRef = useRef(null);
    const biplaneRef = useRef(null);

    const weatherData = [
        { temp: 34 }, { temp: 27 }, { temp: 14 },
        { temp: 16 }, { temp: 8 },  { temp: -4 }
    ];

    // Эффект для создания конического градиента (выполняется один раз)
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

    // Эффект для анимации изменения температуры
    useEffect(() => {
        if (!isPowerOn || !tempRef.current || !tempRef.current.dataset.fahrenheit) return;

        let animationFrameId;
        setIsAnimatingTemp(true);

        const element = tempRef.current;
        const currentStoredTempF = parseFloat(element.dataset.fahrenheit);

        const targetTempF = baseTempF;
        
        const startTemp = tempUnit === 'F' 
            ? Math.round(currentStoredTempF)
            : Math.round((currentStoredTempF - 32) * 5 / 9);
            
        const finalTemp = tempUnit === 'F' ? targetTempF : Math.round((targetTempF - 32) * 5 / 9);
        
        const duration = 2000;
        let startTime = null;
        
        const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        
        const animate = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            
            const elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / duration, 1);
            progress = easeInOutCubic(progress);

            const tempNow = Math.round(startTemp + (progress * (finalTemp - startTemp)));
            if(element) element.textContent = `${tempNow}°${tempUnit}`;

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                if(element) element.dataset.fahrenheit = targetTempF;
                setIsAnimatingTemp(false);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        
        return () => cancelAnimationFrame(animationFrameId);
    }, [baseTempF, tempUnit, isPowerOn]);

    // Эффект для анимации индикатора загрузки
    useEffect(() => {
        if (!isPowerOn) return;
        
        if (loadingBarRef.current) {
            loadingBarRef.current.classList.add(styles.active);
            setTimeout(() => {
                loadingBarRef.current && loadingBarRef.current.classList.remove(styles.active);
            }, 1200);
        }
    }, [weatherIndex, isPowerOn]);
    
    // Эффект для сброса состояния при выключении
    useEffect(() => {
        if (!isPowerOn) {
            setAngle(0);
            setWeatherIndex(0);
            setBaseTempF(34);
            if(tempRef.current) {
                tempRef.current.textContent = '34°F';
                tempRef.current.dataset.fahrenheit = '34';
            }
            setTempUnit('F');
        } else {
             if(tempRef.current) {
                tempRef.current.dataset.fahrenheit = '34';
            }
        }
    }, [isPowerOn]);

    const handleDialClick = () => {
        if (!isPowerOn || isAnimatingTemp) return;
        
        const newAngle = angle + 60;
        setAngle(newAngle);

        const newIndex = (weatherIndex + 1) % weatherData.length;
        setWeatherIndex(newIndex);
        setBaseTempF(weatherData[newIndex].temp);
    };

    const handleTempUnitChange = (unit) => {
        if (!isPowerOn || isAnimatingTemp || tempUnit === unit) return;
        setTempUnit(unit);
    };

    const handleRocketClick = () => {
        if (!isPowerOn || isRocketActive) return;
        const rocketElement = rocketRef.current;
        rocketElement.style.animation = `${styles.rocketAnimation} 8s ease-in`;
        setIsRocketActive(true);
        setTimeout(() => {
            setIsRocketActive(false);
            if (rocketElement) rocketElement.style.animation = 'none';
        }, 6000);
    };

    const handleMonsterClick = () => {
        if (!isPowerOn || isMonsterActive) return;
        const monsterElement = monsterRef.current;
        monsterElement.style.animation = `${styles.monsterAnimation} 24s linear`;
        setIsMonsterActive(true);
        setTimeout(() => {
            setIsMonsterActive(false);
            if (monsterElement) monsterElement.style.animation = 'none';
        }, 24000);
    };

    const handleBiplaneClick = () => {
        if (!isPowerOn || isBiplaneActive) return;
        const biplaneElement = biplaneRef.current;
        biplaneElement.style.animation = `${styles.biplaneAnimation} 12s linear`;
        setIsBiplaneActive(true);
        setTimeout(() => {
            setIsBiplaneActive(false);
            if (biplaneElement) biplaneElement.style.animation = 'none';
        }, 12000);
    };

    return (
        <div className={styles.portholeContainer}>
            <svg id={styles.noiseSvg}>
                <filter id='noiseFilter'>
                    <feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch' />
                </filter>
                <rect id={styles.noiseRect} filter='url(#noiseFilter)' />
            </svg>
            
            <div className={`${styles.outerRim} ${isPowerOn ? styles.powerOn : ''}`}>
                <div className={styles.outerRim2}>
                    <div className={styles.innerRim}>
                        {/* Верхний иллюминатор с анимацией пейзажа удален */}
                        <div className={`${styles.outerWindow} ${styles.invert}`}>
                            <div className={styles.window}>
                                <div className={styles.windowRounded}>
                                    <div className={styles.loadingBar} ref={loadingBarRef}>
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                      <div></div>
                                    </div>
                                    <div className={styles.backCircle}></div>
                                    <div className={styles.circle} id={styles.rot} ref={rotRef} style={{ transform: `rotate(${angle}deg)` }}>
                                    </div>
                                    <div className={styles.innerCircle} id={styles.clickRot} onClick={handleDialClick}>
                                     <div className={styles.sixthsContainer} id={styles.rotIcons} ref={rotIconsRef} style={{ transform: `rotate(${angle}deg)` }}>
                                         <div className={`${styles.sixths} ${weatherIndex === 0 ? styles.active : ''}`}><div className={styles.icon}>
                                            <svg id="Sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                                <rect width="100" height="100" style={{fill: 'none'}}/>
                                                <circle cx="50" cy="50" r="23.44" style={{fill: 'none', stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="50" y1="14.06" x2="50" y2="6.25" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="24.59" y1="24.59" x2="19.06" y2="19.06" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="14.06" y1="50" x2="6.25" y2="50" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="24.59" y1="75.41" x2="19.06" y2="80.94" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="50" y1="85.94" x2="50" y2="93.75" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="75.41" y1="75.41" x2="80.94" y2="80.94" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="85.94" y1="50" x2="93.75" y2="50" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="75.41" y1="24.59" x2="80.94" y2="19.06" style={{stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                            </svg>
                                         </div></div>
                                         <div className={`${styles.sixths} ${weatherIndex === 1 ? styles.active : ''}`}><div className={styles.icon}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 93.5 73.17" style={{transform: 'rotate(180deg)'}}>
                                                <line x1="46.75" y1="10.81" x2="46.75" y2="3" style={{fill: 'none', stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="21.34" y1="21.34" x2="15.81" y2="15.81" style={{fill: 'none', stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="10.81" y1="46.75" x2="3" y2="46.75" style={{fill: 'none', stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="82.69" y1="46.75" x2="90.5" y2="46.75" style={{fill: 'none', stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <line x1="72.16" y1="21.34" x2="77.69" y2="15.81" style={{fill: 'none', stroke: 'rgba(152, 243, 248,0.9)', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '6px'}}/>
                                                <path d="M71.22,50.11H22.62c-1.42,0-2.57-1.15-2.57-2.57h0c0-14.71,11.98-26.67,26.71-26.67s26.45,11.51,26.9,25.83c.46,1.34-.25,2.81-1.59,3.27-.27,.09-.55,.14-.84,.14Zm-45.87-5.15h43.02c-1.29-10.66-10.49-18.95-21.61-18.95s-20.13,8.29-21.41,18.95Zm40.75,16.78H27.4c-1.42,0-2.57-1.15-2.57-2.57,0-1.42,1.15-2.57,2.57-2.57h38.7c1.42,0,2.57,1.15,2.57,2.57,0,1.42-1.15,2.57-2.57,2.57Zm-9.99,11.42h-18.51c-1.42,0-2.57-1.15-2.57-2.57s1.15-2.57,2.57-2.57h18.51c1.42,0,2.57,1.15,2.57,2.57s-1.15,2.57-2.57,2.57Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                            </svg>
                                        </div></div>
                                         <div className={`${styles.sixths} ${weatherIndex === 2 ? styles.active : ''}`}><div className={styles.icon}>
                                            <svg id="Night" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100" style={{transform: 'rotate(180deg)'}}>
                                                <path d="M85.26,14.96h-17.94c-1.66,0-3-1.34-3-3,0-1.65,1.34-3,3-3h17.94c1.66,0,3,1.34,3,3,0,1.65-1.34,3-3,3ZM41.15,87.22c-4.99-.01-9.9-1.23-14.31-3.55-3.99-2-7.51-4.81-10.36-8.25-1.06-1.27-.89-3.16,.38-4.22,.61-.51,1.39-.75,2.18-.69,10.27,.89,20.08-4.39,25-13.44,4.45-8.92,3.42-19.6-2.64-27.51-1.02-1.31-.78-3.19,.53-4.21,.64-.5,1.47-.72,2.27-.6,4.21,.6,8.07,1.8,11.19,3.48,7.44,3.8,13.04,10.43,15.54,18.4,2.48,7.9,1.71,16.31-2.18,23.68-5.27,10.4-15.94,16.94-27.6,16.91Zm-15.04-10.97c1.1,.78,2.26,1.48,3.47,2.09,12.15,6.43,27.21,1.79,33.63-10.36,.08-.14,.15-.29,.22-.43,3.15-5.98,3.77-12.76,1.77-19.13-2.03-6.46-6.58-11.83-12.62-14.89-.83-.45-1.69-.84-2.58-1.17,3.89,8.8,3.65,18.87-.64,27.47-4.72,8.84-13.34,14.94-23.26,16.43Zm-12.43-21.55c-1.66,0-3-1.34-3-3h0v-17.93c0-1.66,1.34-3,3-3s3,1.34,3,3v17.93c0,1.66-1.34,3-3,3h0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M22.66,45.73H4.7c-1.66,0-3-1.34-3-3,0-1.65,1.34-3,3-3H22.66c1.66,0,3,1.34,3,3,0,1.65-1.34,3-3,3Zm53.62-21.8c-1.66,0-3-1.34-3-3h0V3C73.29,1.34,74.63,0,76.29,0s3,1.34,3,3h0V20.93c0,1.66-1.34,3-3,3,0,0,0,0,0,0Zm5.83,58.63c-1.66,0-3-1.34-3-3h0v-12.11c0-1.66,1.34-3,3-3s3,1.34,3,3v12.11c0,1.66-1.34,3-3,3h0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M88.17,76.5h-11.88c-1.66,0-3-1.34-3-3,0-1.65,1.34-3,3-3h11.88c1.66,0,3,1.34,3,3,0,1.65-1.34,3-3,3ZM9.07,100c-1.66,0-3-1.34-3-3h0v-11.87c0-1.66,1.34-3,3-3s3,1.34,3,3v11.88c0,1.65-1.34,2.99-2.99,2.99,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M15.13,93.94H3c-1.66,0-3-1.34-3-3s1.34-3,3-3H15.13c1.66,0,3,1.34,3,3s-1.34,3-3,3Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                              </svg>
                                         </div></div>
                                         <div className={`${styles.sixths} ${weatherIndex === 3 ? styles.active : ''}`}><div className={styles.icon}>
                                            <svg id="Rain" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100" style={{transform: 'rotate(180deg) scale(0.9)'}}>
                                                <path d="M75.29,63.6H18.89c-.31,0-.61-.08-.89-.22C8.37,62.38,.91,54.26,.91,44.66c0-10.45,8.58-18.95,19.13-18.95,.43,0,.84,0,1.25,.01C21.6,11.43,33.28,0,47.58,0,61.99,0,73.72,11.78,73.72,26.27c0,.26-.01,.52-.03,.77,.25-.01,.52-.02,.79-.02,10,0,18.15,8.2,18.15,18.29s-7.4,17.73-17.21,18.29c0,0-.12,.01-.12,.01Zm-55.76-4.03h55.7c7.62-.46,13.36-6.58,13.36-14.26s-6.33-14.26-14.12-14.26c-1.02,0-1.89,.15-2.76,.3-.58,.1-1.18-.06-1.63-.45-.45-.38-.71-.94-.71-1.54,0-.58,.09-1.15,.18-1.75,.07-.43,.14-.87,.14-1.34,0-12.26-9.92-22.24-22.11-22.24-12.29,0-22.25,9.95-22.27,22.24,0,.22,.03,.41,.06,.6,.07,.39,.11,.78,.11,1.18,0,1.11-.9,2.02-2.01,2.02-.19,0-.37-.03-.55-.08-.87-.25-1.66-.25-2.87-.25-8.32,0-15.1,6.69-15.1,14.91s6,14.16,13.95,14.75c.23,.02,.45,.07,.65,.16Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                              </svg>
                                         </div></div>
                                         <div className={`${styles.sixths} ${weatherIndex === 4 ? styles.active : ''}`}><div className={styles.icon}>
                                            <svg id="Rain" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100" style={{transform: 'rotate(180deg) scale(0.9)'}}>
                                                <path d="M75.29,63.6H18.89c-.31,0-.61-.08-.89-.22C8.37,62.38,.91,54.26,.91,44.66c0-10.45,8.58-18.95,19.13-18.95,.43,0,.84,0,1.25,.01C21.6,11.43,33.28,0,47.58,0,61.99,0,73.72,11.78,73.72,26.27c0,.26-.01,.52-.03,.77,.25-.01,.52-.02,.79-.02,10,0,18.15,8.2,18.15,18.29s-7.4,17.73-17.21,18.29c0,0-.12,.01-.12,.01Zm-55.76-4.03h55.7c7.62-.46,13.36-6.58,13.36-14.26s-6.33-14.26-14.12-14.26c-1.02,0-1.89,.15-2.76,.3-.58,.1-1.18-.06-1.63-.45-.45-.38-.71-.94-.71-1.54,0-.58,.09-1.15,.18-1.75,.07-.43,.14-.87,.14-1.34,0-12.26-9.92-22.24-22.11-22.24-12.29,0-22.25,9.95-22.27,22.24,0,.22,.03,.41,.06,.6,.07,.39,.11,.78,.11,1.18,0,1.11-.9,2.02-2.01,2.02-.19,0-.37-.03-.55-.08-.87-.25-1.66-.25-2.87-.25-8.32,0-15.1,6.69-15.1,14.91s6,14.16,13.95,14.75c.23,.02,.45,.07,.65,.16Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M19.33,81.03c-1.05,.38-2.2-.17-2.58-1.21h0l-2.71-7.5c-.38-1.05,.17-2.2,1.21-2.58,1.05-.38,2.2,.17,2.58,1.21l2.71,7.5c.38,1.05-.17,2.2-1.21,2.58,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M72.19,81.17c-1.05,.38-2.2-.17-2.58-1.21h0l-2.71-7.5c-.38-1.05,.17-2.2,1.21-2.58s2.2,.17,2.58,1.21l2.71,7.5c.38,1.05-.17,2.2-1.21,2.58h0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M30.68,96.41c-1.05,.38-2.2-.17-2.58-1.21h0l-2.71-7.5c-.38-1.05,.17-2.2,1.21-2.58,1.05-.38,2.2,.17,2.58,1.21l2.71,7.5c.38,1.05-.17,2.2-1.21,2.58,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M63.64,96.33c-1.05,.38-2.2-.17-2.58-1.21h0l-2.76-7.66c-.38-1.05,.17-2.2,1.21-2.58,1.05-.38,2.2,.17,2.58,1.21l2.76,7.66c.38,1.05-.17,2.2-1.21,2.58,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M32.88,81.26c-1.05,.38-2.2-.17-2.58-1.21h0l-2.71-7.5c-.38-1.05,.17-2.2,1.21-2.58,1.05-.38,2.2,.17,2.58,1.21l2.71,7.5c.38,1.05-.17,2.2-1.21,2.58,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M45.38,99c-.84,0-1.52-.68-1.52-1.52,0-.1,.01-.21,.03-.31l3.07-14.99h-6.49c-.84,0-1.52-.68-1.52-1.52,0-.14,.02-.27,.05-.4l5.16-18.65c.18-.66,.78-1.11,1.46-1.12h13.39c.84,0,1.52,.68,1.52,1.52,0,.31-.09,.61-.27,.86l-6.11,8.91h7.81c.84,0,1.52,.68,1.52,1.52,0,.31-.09,.61-.27,.86l-16.59,24.17c-.28,.41-.76,.66-1.26,.66Zm-2.92-19.85h6.36c.85,0,1.53,.7,1.52,1.55,0,.09-.01,.19-.03,.28l-1.94,9.46,10.71-15.61h-7.81c-.84,0-1.52-.68-1.52-1.52,0-.31,.09-.61,.27-.86l6.11-8.9h-9.35l-4.32,15.61Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                              </svg>
                                         </div></div>
                                         <div className={`${styles.sixths} ${weatherIndex === 5 ? styles.active : ''}`}><div className={styles.icon}>
                                            <svg id="Snow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100" style={{transform: 'rotate(180deg) scale(0.9)'}}>
                                                <path d="M75.16,63.9H18.78c-.31,0-.61-.08-.89-.22C8.27,62.67,.8,54.56,.8,44.96c0-10.44,8.58-18.94,19.12-18.94,.43,0,.84,0,1.25,.01C21.49,11.74,33.16,.32,47.46,.32c14.41,0,26.13,11.78,26.13,26.26,0,.26-.01,.52-.03,.77,.25-.01,.52-.02,.79-.02,10,0,18.14,8.2,18.14,18.28s-7.4,17.73-17.21,18.28c0,0-.12,.01-.12,.01Zm-55.74-4.03h55.68c7.62-.46,13.35-6.58,13.35-14.26s-6.33-14.25-14.11-14.25c-1.02,0-1.89,.15-2.76,.3-.58,.1-1.18-.06-1.63-.45-.45-.38-.71-.94-.71-1.54,0-.58,.09-1.15,.18-1.75,.07-.43,.14-.87,.14-1.34,0-12.25-9.91-22.23-22.1-22.23-12.28,0-22.24,9.95-22.27,22.23,0,.22,.03,.41,.06,.6,.07,.39,.11,.78,.11,1.18,0,1.11-.9,2.01-2.01,2.02-.19,0-.37-.03-.55-.08-.87-.25-1.66-.25-2.87-.25-8.32,0-15.09,6.69-15.09,14.91s6,14.16,13.94,14.75c.23,.02,.45,.07,.65,.16Zm3.27,21.11c-1.11,0-2.01-.9-2.01-2.01h0v-7.97c0-1.11,.9-2.01,2.01-2.01s2.01,.9,2.01,2.01v7.97c0,1.11-.9,2.01-2.01,2.01h0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M26.77,77.07h-7.99c-1.11,0-2.01-.9-2.01-2.01s.9-2.01,2.01-2.01h7.99c1.11,0,2.01,.9,2.01,2.01s-.9,2.01-2.01,2.01Zm19.55,3.9c-1.11,0-2.01-.9-2.01-2.01h0v-7.97c0-1.11,.9-2.01,2.02-2.01,1.11,0,2.01,.9,2.01,2.01v7.97c0,1.11-.9,2.01-2.01,2.01,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M50.39,77.07h-8.15c-1.11,0-2.01-.9-2.01-2.01s.9-2.01,2.01-2.01h8.15c1.11,0,2.01,.9,2.01,2.01s-.9,2.01-2.01,2.01Zm20.7,5.53c-1.11,0-2.01-.9-2.01-2.01h0v-7.97c0-1.11,.9-2.01,2.01-2.01s2.01,.9,2.01,2.01v7.97c0,1.11-.9,2.01-2.01,2.01h0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M75.16,78.7h-7.99c-1.11,0-2.01-.9-2.01-2.01s.9-2.01,2.01-2.01h7.99c1.11,0,2.01,.9,2.01,2.01s-.9,2.01-2.01,2.01Zm-41.06,19.52c-1.11,0-2.01-.9-2.01-2.01h0v-7.97c0-1.11,.9-2.01,2.02-2.01,1.11,0,2.01,.9,2.01,2.01v7.97c0,1.11-.9,2.01-2.01,2.01,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M38.17,94.32h-7.98c-1.11,0-2.01-.9-2.01-2.01s.9-2.01,2.01-2.01h7.99c1.11,0,2.01,.9,2.01,2.02,0,1.11-.9,2.01-2.02,2.01Zm20.86,5.37c-1.11,0-2.01-.9-2.01-2.01h0v-8.14c0-1.11,.9-2.01,2.02-2.01,1.11,0,2.01,.9,2.01,2.01v8.14c0,1.11-.9,2.01-2.01,2.01,0,0,0,0,0,0Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                                <path d="M62.94,95.62h-7.99c-1.11,0-2.01-.9-2.01-2.01s.9-2.01,2.01-2.01h7.99c1.11,0,2.01,.9,2.01,2.01s-.9,2.01-2.01,2.01Z" style={{fill: 'rgba(152, 243, 248,0.9)'}}/>
                                              </svg>
                                         </div></div>
                                     </div>
                                    </div>
                                    <div className={styles.leftModal}>
                                      <div className={styles.power}  onClick={() => setIsPowerOn(!isPowerOn)}>
                                          <div className={styles.innerPower}></div>
                                      </div>
                                    </div>
                                    <div className={`${styles.leftBtn1} ${isRocketActive ? styles.active : ''}`} onClick={handleRocketClick}>
                                      <svg ref={rocketRef} id={styles.rocketIco} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100">
                                        <path d="M47.36,27.79c-5.2,0-9.42,4.23-9.42,9.42s4.23,9.42,9.42,9.42,9.42-4.23,9.42-9.42-4.23-9.42-9.42-9.42Zm0,14.41c-2.75,0-4.99-2.24-4.99-4.99s2.24-4.99,4.99-4.99,4.99,2.24,4.99,4.99-2.24,4.99-4.99,4.99Z"/>
                                        <path d="M75.68,60.08c-2.69-4.13-5.93-6.02-7.62-6.79,.91-5.81,1.21-11.61,.33-16.56-3.22-17.99-18.8-28.79-19.46-29.24-.94-.64-2.18-.64-3.12,0-.66,.45-16.24,11.26-19.46,29.24-.9,5.01-.57,10.9,.36,16.78-1.77,.88-4.7,2.79-7.16,6.57-4.63,7.11-5.41,17.22-2.31,30.04,.21,.89,.85,1.61,1.7,1.94,.32,.12,.66,.18,.99,.18,.55,0,1.1-.17,1.57-.49l13.51-9.32c.36,.9,.6,1.46,.66,1.61,.43,1.02,1.44,1.69,2.55,1.69h6.38v4.5c0,1.53,1.24,2.77,2.77,2.77s2.77-1.24,2.77-2.77v-4.5h6.38c1.11,0,2.12-.66,2.55-1.69,.07-.16,.35-.82,.76-1.87l13.9,9.58c.47,.32,1.02,.49,1.57,.49,.33,0,.67-.06,.99-.18,.85-.33,1.49-1.05,1.7-1.94,3.1-12.82,2.32-22.93-2.31-30.04ZM47.36,13.26c1.79,1.46,4.87,4.2,7.85,8.02h-15.71c2.98-3.81,6.06-6.56,7.85-8.02ZM21.77,84.82c-3.03-16.71,2.71-23.24,6.03-25.55,1.49,6.81,3.55,13.21,5.19,17.81l-11.22,7.74Zm32.87-4.64h-4.51v-21.97c0-1.53-1.24-2.77-2.77-2.77s-2.77,1.24-2.77,2.77v21.97h-4.51c-2.48-6.29-10.75-28.72-8.29-42.48,.81-4.51,2.56-8.54,4.65-11.99h21.84c2.09,3.46,3.84,7.48,4.65,11.99,2.46,13.74-5.81,36.18-8.29,42.48Zm18.81,4.64l-11.62-8.01c1.65-4.64,3.69-11.04,5.16-17.82,3.22,2.03,9.62,8.37,6.46,25.83Z"/>
                                      </svg>
                                    </div>
                                    <div className={`${styles.leftBtn2} ${isMonsterActive ? styles.active : ''}`} onClick={handleMonsterClick}>
                                      <svg ref={monsterRef} id={styles.monsterIco} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100">
                                        <path d="M7.36,82.89s.08,.08,.12,.13c.81,.82,1.9,1.63,3.38,2.27,2.01-.78,5.1-1.78,8.96-2.24,8.22-.98,10.78,1.59,19.04,2.24,12.77,1,13.92-4.57,24.64-2.24,1.77,.38,6.21,1.51,12.32,2.24,0,0,7.24,.87,10.16-1.89,.24-.22,.5-.49,.5-.49,.43-.47,.61-.61,1.07-1.25,.5-.7,.61-.82,.94-1.6l-1.29-.03c-1.13,.02-3.9,.95-4.17,1.02-3.25,.8-6.47,1.11-9.87,.81-2.88-.26-6.29-1.06-8.53-1.3-11.04-1.17-21.41,3.21-32.16,.76-2.14-.49-3.22-.73-3.23-.73-2.78-.51-5.55-.71-8.31-.61-3.79,.14-7.02,.82-9.53,1.57" style={{fill: '#141414'}}/>
                                        <path d="M15.38,77.21c10.34-3.64,20.67,3.73,31.25,.29,5.45-1.3,10.94-2.17,16.55-.87,6.05,1.52,12.21,1.99,18.12-.13,4.02-9.03,6.02-21.19-2.84-28.65-6.02-4.09-4.26-13.8,3.54-8.62-2.26-6.51-12.2-5.86-13.23,1.76,.09,10.32,15.91,21.49-2.45,26.39,.72-14.15-31.02-16.94-31.02-16.94,0,0-1.12-.3-1.24-7.28-.13-8.27,6.64-20.71,15.76-21.47,2.87,3.63,20.89,4.46,17.83,.35,.6,.8-3.29-7.92-5.85-9.94C32.2-11.19,2.61,51.17,15.38,77.21" style={{fill: '#141414'}}/>
                                        <path d="M20.28,89.89s.06,.07,.09,.1c.61,.69,1.43,1.37,2.55,1.89,1.52-.65,3.85-1.49,6.76-1.87,6.2-.82,8.13,1.33,14.36,1.87,9.63,.84,10.5-3.82,18.59-1.87,1.33,.32,4.69,1.26,9.29,1.87,0,0,5.47,.73,7.67-1.58,.18-.19,.38-.41,.38-.41,.32-.39,.46-.51,.81-1.05,.38-.58,.46-.68,.71-1.34l-.97-.03c-.85,.01-2.95,.8-3.15,.85-2.45,.67-4.88,.93-7.45,.68-2.18-.22-4.75-.89-6.44-1.09-8.33-.98-16.15,2.69-24.27,.64-1.62-.41-2.43-.61-2.44-.61-2.1-.43-4.19-.6-6.27-.51-2.86,.12-5.3,.69-7.19,1.31" style={{fill: '#141414'}}/>
                                      </svg>
                                    </div>
                                    <div className={`${styles.leftBtn3} ${isBiplaneActive ? styles.active : ''}`} onClick={handleBiplaneClick}>
                                      <svg ref={biplaneRef} id={styles.biplaneIco} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.24 100">
                                        <path d="M53.13,33.53c10.67,.02,21.34,.03,32.02,.02,3.28,0,6.21,.47,8.82,2.62,.11,.09,.13,.26,.04,.37-3.35,4.25-9.49,3.46-14.16,3.5-.1,0-.18,.08-.18,.18h0c.02,5.53,.01,11.05-.03,16.57-.01,1.59-.48,4.28-2.5,4.29-.1,0-.18-.08-.18-.18l-.05-5.71c0-.1-.08-.17-.18-.17,0,0,0,0,0,0l-15.89,.6c-.13,0-.23-.09-.24-.22,0-.04,0-.08,.02-.11,1.15-2.34,1.63-4.85,1.45-7.56,0-.09,.05-.16,.13-.17,0,0,.02,0,.03,0l6,.72c.12,.01,.24-.01,.33-.07l8.23-5.14c.1-.06,.15-.16,.15-.27v-2.6c-.01-.1-.09-.18-.2-.18h-17.54c-.11,0-.22-.05-.3-.14-6.28-7.25-16.46-7.09-22.72,.01-.08,.08-.18,.13-.3,.13H18.68c-.11,0-.2,.08-.2,.18v2.53c0,.1,.06,.21,.16,.27l8,5.12c.1,.06,.22,.09,.33,.08l5.94-.61c.09,0,.16,.05,.17,.14,0,0,0,.01,0,.02-.09,2.67,.4,5.2,1.48,7.6,.03,.06,0,.13-.05,.15-.02,0-.03,.01-.05,0l-15.84-.52c-.1,0-.18,.08-.18,.18h0s-.08,5.67-.08,5.67c0,.11-.08,.19-.18,.21-2.63,.39-2.5-4.51-2.47-6,0-.1-.08-.18-.17-.18,0,0,0,0,0,0-4.18-.08-8.07,.13-10.96-3.51-.31-.39-.21-.61,.28-.66l10.68-1.16c.1-.01,.18-.1,.18-.2v-9.15c0-.1-.08-.18-.18-.18-5.54,.04-10.53,.65-14.4-3.45-.1-.11-.1-.28,.01-.39,0,0,0,0,.01,0,2.71-2.31,5.77-2.62,9.17-2.62,10.47,0,20.94-.02,31.4-.02,.1,0,.18-.08,.18-.18l.03-.67c0-.47,.24-.7,.7-.7h9.58c.46,0,.7,.24,.7,.71v.64c.01,.1,.1,.18,.2,.18h0Zm-28.55,14.79l-5.95-3.78c-.11-.06-.16-.04-.16,.09v4.39c-.01,.09,.06,.16,.15,.16,0,0,.01,0,.02,0l5.9-.66c.2-.02,.21-.09,.05-.19Zm46.07,.23l6.12,.72c.09,.01,.17-.05,.18-.14,0,0,0-.01,0-.02v-4.39c-.01-.12-.06-.15-.17-.08l-6.17,3.77c-.13,.08-.12,.13,.03,.14Z"/>
                                        <path d="M60.92,48.95c0,7.35-5.96,13.3-13.3,13.3h0c-7.35,0-13.3-5.96-13.3-13.3h0c0-7.35,5.96-13.3,13.3-13.3h0c7.35,0,13.3,5.96,13.3,13.3h0Zm-1.25-.02c0-6.65-5.39-12.04-12.04-12.04h0c-6.65,0-12.04,5.39-12.04,12.04h0c0,6.65,5.39,12.04,12.04,12.04h0c6.65,0,12.04-5.39,12.04-12.04h0Z"/>
                                        <path d="M44.79,46.76l.76-1.06c.05-.07,.04-.17-.03-.23-1.56-1.39-3-2.91-4.3-4.58-.05-.07-.04-.16,.02-.22,1.93-1.64,4.08-2.45,6.43-2.43,8.49,.09,12.87,10.05,7,16.27-.07,.07-.18,.08-.26,.02-1.58-1.26-3.03-2.63-4.33-4.11-.05-.06-.15-.08-.22-.03l-1.04,.69c-.06,.04-.08,.12-.04,.18,0,0,0,.01,.01,.02,1.43,1.58,3.11,2.86,5.02,3.82,.05,.02,.07,.08,.04,.12,0,.01-.02,.02-.03,.03-9.26,7.25-21.01-4.35-13.55-13.7,.1-.12,.27-.14,.39-.04,.03,.02,.06,.06,.07,.09,.96,1.92,2.24,3.63,3.84,5.16,.05,.05,.14,.05,.19,0,0,0,0-.01,.01-.02Zm.26,1.19c-.09,1.46,1.01,2.71,2.47,2.81s2.71-1.01,2.81-2.47-1.01-2.71-2.47-2.81h0c-1.46-.09-2.71,1.01-2.81,2.47h0Z"/>
                                        <path d="M90.52,51.38c-2.9,3.45-5.74,3.38-9.79,3.47-.1,0-.19-.08-.19-.17,0,0,0,0,0,0v-4.76c0-.09,.08-.16,.17-.16,0,0,.01,0,.02,0l9.53,.97c.5,.05,.59,.27,.27,.66Z"/>
                                        <path d="M36.55,67.17c2-.37,3.94-1.12,5.96-1.12,3.27,0,6.54,0,9.8,0,2.08,0,4.03,.72,6.02,1.22,.2,.05,.22,0,.08-.14l-4.85-4.84c-.05-.05-.05-.14,0-.19,0,0,.02-.02,.03-.02l2.32-1.42c.08-.05,.19-.03,.25,.05l6.18,8.63c.07,.1,.11,.09,.13-.03,.08-.88,.1-1.96,.07-3.26-.14-5.21,6.49-5.91,6.85-.72,.12,1.69,.15,3.61,.09,5.76-.07,2.46,.02,4.2-1.95,5.41-2.26,1.4-4.46-.54-4.88-2.82-.12-.63-.15-1.52-.11-2.67,0-.1-.05-.21-.14-.28l-2.18-1.85c-.1-.08-.2-.12-.31-.12h-25.01c-.12,0-.24,.03-.32,.1l-2.24,1.86c-.08,.07-.13,.18-.13,.3,.04,1.27-.03,2.28-.2,3.04-1.03,4.51-6.73,3.42-6.76-1.26-.02-4.12-.01-6.61,.04-7.45,.22-3.9,5.05-5.12,6.59-1.19,.53,1.36,.33,3.48,.41,4.97,0,.12,.05,.13,.12,.04,2.22-2.72,4.3-5.51,6.27-8.39,.06-.09,.18-.12,.26-.07l2.41,1.36c.07,.04,.09,.12,.05,.19,0,.01-.01,.02-.02,.03l-4.88,4.76c-.09,.08-.07,.12,.04,.09Z"/>
                                      </svg>
                                    </div>
                                    <div className={styles.rightModal}>
                                        <p className={styles.label}>Temperature</p>
                                        <div className={styles.screen}>
                                            <p className={styles.temp} ref={tempRef} data-fahrenheit="34">
                                              {isPowerOn ? '34°F' : ''}
                                            </p>
                                        </div>
                                        <div className={`${styles.toggle} ${tempUnit === 'F' ? styles.active : ''}`} id={styles.toggleFar} onClick={() => handleTempUnitChange('F')}>°F</div>
                                        <div className={`${styles.toggle} ${styles.two} ${tempUnit === 'C' ? styles.active : ''}`} id={styles.toggleCel} onClick={() => handleTempUnitChange('C')}>°C</div>
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

export default PortholeUI;