// 📁 ScrollToTop.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Принудительно прокручивает окно к началу при каждом изменении маршрута (URL).
 */
const ScrollToTop = () => {
    // Получаем текущий объект местоположения (location) из React Router
    const { pathname } = useLocation();

    useEffect(() => {
        // При изменении pathname (то есть при переходе на новый маршрут)
        window.scrollTo(0, 0);

        // Дополнительная настройка для браузеров
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

    }, [pathname]); // Запускаем эффект только при изменении pathname

    return null; 
};

export default ScrollToTop;