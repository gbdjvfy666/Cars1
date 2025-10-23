import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar - закрепленная навигационная панель, стилизованная под темную тему, 
 * без какого-либо подчеркивания или явного выделения активного элемента.
 */
const Navbar = () => {
    const location = useLocation();
    
    // Определяем активную ссылку.
    const isActive = (path) => location.pathname === path;

    // Обновленные стили для ссылок под темную тему
    const linkClasses = (path) => 
        `text-base font-semibold tracking-wide transition-colors duration-200 relative pb-1 ` +
        // Стиль активной ссылки: просто белый текст (нет линии и специального ховера)
        (isActive(path) 
            ? 'text-white' 
            // Стиль неактивной ссылки: серый, hover - белый
            : 'text-gray-300 hover:text-white'
        );

    // Классы для создания "темного" фона и мягкого "свечения/градиента"
    const headerClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-300 
        bg-gray-900 
        shadow-2xl 
        shadow-black/70 
        border-b border-gray-700/50 
    `;

    return (
        <header className={headerClasses}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Логотип / Название проекта: NSBH */}
                <Link 
                    to="/" 
                    className="text-3xl font-extrabold text-white tracking-tighter transition-colors duration-200 hover:text-gray-300"
                >
                    NSBH
                </Link>

                {/* Навигационные ссылки */}
                <nav className="flex space-x-6 sm:space-x-8">
                    {/* Главная */}
                    <Link to="/" className={linkClasses('/')}>
                        Главная
                    </Link>
                    
                    {/* О нас (Placeholder) */}
                    <Link to="/about" className={linkClasses('/about')}>
                        О нас
                    </Link>

                    {/* Контакты (Placeholder) */}
                    <Link to="/contact" className={linkClasses('/contact')}>
                        Контакты
                    </Link>

                    {/* Административная панель (Оставлена для удобства) */}
                    <Link to="/admin" className={linkClasses('/admin')}>
                        Админка
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;