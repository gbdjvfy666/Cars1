import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Удалены все инлайн-компоненты SVG для максимальной простоты.

/**
 * Navbar - закрепленная навигационная панель с минималистичным дизайном (NSBH).
 * Использует чистый белый фон и простой текст.
 */
const Navbar = () => {
    const location = useLocation();

    // Определяем активную ссылку.
    // Добавляем placeholder для 'О нас' и 'Контакты'
    const isActive = (path) => location.pathname === path;

    // Упрощенные стили для ссылок: меньше padding, нет теней, только подчеркивание и цвет
    const linkClasses = (path) => 
        `text-base font-semibold tracking-wide transition-colors duration-200 relative pb-1 ` +
        // Стиль активной ссылки: синий цвет и подчеркивание
        (isActive(path) 
            // Используем псевдоэлемент after для красивого, тонкого подчеркивания
            ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-blue-600' 
            // Стиль неактивной ссылки: серый цвет, hover - синий
            : 'text-gray-700 hover:text-blue-600'
        );

    return (
        // Фиксированный контейнер: белый фон, легкая тень, z-index 50
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Логотип / Название проекта: NSBH */}
                <Link to="/" className="text-3xl font-extrabold text-gray-900 tracking-tighter">
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
