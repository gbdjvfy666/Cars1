// Button.jsx

import React from 'react';
import styles from './Button.module.css';

/**
 * Адаптивный компонент кнопки.
 * @param {object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Содержимое кнопки (текст, иконки).
 * @param {Function} props.onClick - Функция, вызываемая при клике.
 * @param {string} [props.className] - Дополнительные CSS-классы для стилизации.
 * @param {string} [props.width] - Ширина кнопки (например, '150px').
 * @param {string} [props.height] - Высота кнопки (например, '50px').
 * @param {string} [props.borderRadius] - Радиус скругления углов (например, '10px' или '50%').
 */
function Button({ children, onClick, className, width, height, borderRadius }) {
  
  // Объединяем класс по умолчанию (.button) с любыми классами, переданными извне.
  const combinedClassName = `${styles.button} ${className || ''}`.trim();

  // Создаем объект для inline-стилей.
  // Свойства в этом объекте будут иметь приоритет над стилями из CSS-файла.
  const dynamicStyles = {
    width: width,
    height: height,
    borderRadius: borderRadius,
  };

  return (
    // Используем тег <button> для семантической корректности
    <button 
      className={combinedClassName} 
      onClick={onClick}
      style={dynamicStyles} // Применяем динамические стили
    >
      {children}
    </button>
  );
}

export default Button;