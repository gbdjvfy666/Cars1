// src/pages/AdminDashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';
// Большой лимит для админ-панели, чтобы видеть все результаты сразу
const ADMIN_SEARCH_LIMIT = 5000; 

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    // searchTerm: хранит текст в поле ввода
    const [searchTerm, setSearchTerm] = useState(''); 
    // submittedSearchTerm: хранит текст, по которому был запущен поиск (по кнопке)
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState(''); 
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    // 1. Функция для загрузки данных с бэкенда с учетом поиска
    const fetchCars = useCallback(async (currentSearchTerm = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: {
                    searchTerm: currentSearchTerm,
                    limit: ADMIN_SEARCH_LIMIT 
                }
            }); 
            
            setCars(response.data.cars);
            setTotalCount(response.data.totalCount);

        } catch (err) {
            console.error("Ошибка загрузки списка машин:", err);
            setError('Не удалось загрузить список автомобилей. Проверьте подключение к API.');
            setCars([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Инициализация и запуск поиска только при изменении submittedSearchTerm
    // Это решает проблему с частым обновлением при вводе каждой буквы
    useEffect(() => {
        fetchCars(submittedSearchTerm);
    }, [submittedSearchTerm, fetchCars]);
    
    // 3. Обработчик нажатия кнопки "Применить" (или Enter)
    const handleSearchSubmit = () => {
        // Устанавливаем значение, по которому будет запущен useEffect
        setSubmittedSearchTerm(searchTerm);
    };

    // 4. Обработчик перехода на страницу редактирования
    const handleEdit = (carId) => {
        // ВАЖНО: используем упрощенный маршрут только с ID
        // /admin/car/:id/edit
        navigate(`/admin/car/${carId}/edit`);
    };
    
    // 5. Логика отображения
    if (loading && cars.length === 0) return <div style={styles.container}>Загрузка данных...</div>;
    if (error) return <div style={{padding: '20px', color: 'red'}}>{error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Административная панель (Поиск и Редактирование)</h1>
            
            <div style={styles.searchContainer}>
                {/* Поле поиска */}
                <input
                    type="text"
                    placeholder="Поиск по марке, модели, названию или ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearchSubmit();
                        }
                    }}
                    style={styles.searchInput}
                    disabled={loading}
                />
                {/* Кнопка "Применить" */}
                <button 
                    onClick={handleSearchSubmit} 
                    style={styles.applyButton}
                    disabled={loading}
                >
                    {loading ? 'Загрузка...' : 'Применить'}
                </button>
            </div>
            
            {/* Отображаем общее количество найденных машин */}
            <p>
                {submittedSearchTerm 
                    ? `Найдено результатов по запросу "${submittedSearchTerm}": ${cars.length} (из ${totalCount} в базе)` 
                    : `Всего машин в базе: ${totalCount}`
                }
            </p>

            {/* Таблица со списком машин */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Название</th>
                            <th style={styles.th}>Цена (RUB)</th>
                            <th style={styles.th}>Год</th>
                            <th style={styles.th}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((car) => (
                            <tr key={car.id} style={styles.tr}>
                                <td style={styles.td}>{car.id}</td>
                                <td style={styles.td}>{car.name}</td>
                                <td style={styles.td}>{car.price_russia ? car.price_russia.toLocaleString() : 'N/A'}</td>
                                <td style={styles.td}>{car.year}</td>
                                <td style={styles.td}>
                                    <button 
                                        onClick={() => handleEdit(car.id)} // Передаем только ID
                                        style={styles.editButton}
                                    >
                                        Редактировать
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {cars.length === 0 && !loading && (
                <p style={{marginTop: '20px'}}>Нет результатов.</p>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
    header: { borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' },
    searchContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
    searchInput: { padding: '10px', flexGrow: 1, borderRadius: '4px', border: '1px solid #ccc' },
    applyButton: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '12px', textAlign: 'left', verticalAlign: 'top' },
    tr: { transition: 'background-color 0.3s' },
    editButton: { padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default AdminDashboardPage;