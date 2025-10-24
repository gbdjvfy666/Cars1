import React from 'react';

const PlainWhiteNavbar = () => {
    // Высота навбара (оставляем, чтобы контент страницы знал, насколько сместиться)
    const NAVBAR_HEIGHT = '70px';

    // Встраивание стилей (только для позиционирования и отступа body)
    React.useEffect(() => {
        const styleElement = document.createElement('style');
        if (!document.getElementById('plain-white-navbar-styles')) {
            styleElement.id = 'plain-white-navbar-styles';
            styleElement.innerHTML = `
                /* ======================================================= */
                /* 🚀 ГЛОБАЛЬНЫЕ СТИЛИ: Исправление отступа для контента */
                /* ======================================================= */
                body {
                    /* Отступ, чтобы контент начинался ПОД навбаром */
                    padding-top: ${NAVBAR_HEIGHT} !important;
                    margin: 0;
                }

                /* ======================================================= */
                /* СТИЛИ НАВБАРА: Чистый белый, фиксированный, без контента */
                /* ======================================================= */
                .plain-white-navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: ${NAVBAR_HEIGHT};
                    z-index: 999; 
                    
                    background-color: #FFFFFF; /* Полностью белый непрозрачный фон */
                    box-shadow: none; /* Убираем все тени, чтобы он был "без всего" */
                    border-bottom: 1px solid #e0e0e0; /* Легкая линия для видимости */
                }
            `;
            document.head.appendChild(styleElement);
        }
    }, [NAVBAR_HEIGHT]);

    return (
        <header className="plain-white-navbar">
            {/* Навбар пустой, как вы и просили */}
        </header>
    );
};

export default PlainWhiteNavbar;
