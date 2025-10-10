import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const AdminEditCarPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Состояния для загрузки и ошибок
    const [carData, setCarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    
    // Состояние для данных формы, которое будет редактироваться
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });


    // =========================================================
    // 1. ЗАГРУЗКА ДАННЫХ ПРИ ИНИЦИАЛИЗАЦИИ
    // =========================================================
    useEffect(() => {
        const fetchCarData = async () => {
            if (!id) {
                setError('ID машины не найден в URL.');
                setLoading(false);
                return;
            }
            
            try {
                // GET-запрос для получения текущих данных
                const response = await axios.get(`${API_URL}/car/${id}`);
                const data = response.data;
                
                // ВАЖНО: Присваиваем загруженные данные в оба состояния
                setCarData(data);
                
                // Инициализируем редактируемые данные
                // Преобразуем JSONB поля обратно в строки, чтобы textarea работали корректно
                setFormData({
                    ...data,
                    images: JSON.stringify(data.images || [], null, 2),
                    options: JSON.stringify(data.options || {}, null, 2),
                    characteristics: JSON.stringify(data.characteristics || {}, null, 2),
                    accessories: JSON.stringify(data.accessories || {}, null, 2),
                    other_trims: JSON.stringify(data.other_trims || [], null, 2),
                    colors: JSON.stringify(data.colors || [], null, 2),
                    specs: JSON.stringify(data.specs || {}, null, 2),
                });
                
            } catch (err) {
                console.error("❌ Ошибка загрузки данных машины:", err);
                if (err.response) {
                    setError(`Ошибка ${err.response.status}: ${err.response.data.message || 'Машина не найдена.'}`);
                } else {
                    setError('Ошибка сети. Проверьте Node.js сервер.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCarData();
    }, [id]);

    // =========================================================
    // 2. ОБРАБОТЧИК ИЗМЕНЕНИЙ ФОРМЫ
    // =========================================================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Сбрасываем сообщение о сохранении при любом изменении
        setSaveMessage({ type: '', text: '' });
    };

    // =========================================================
    // 3. ОТПРАВКА ФОРМЫ (PUT-ЗАПРОС)
    // =========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });
        
        try {
            // Клонируем данные для отправки, чтобы безопасно преобразовать JSON-строки
            const dataToSubmit = { ...formData };
            
            // Преобразуем JSON-строки обратно в объекты для PostgreSQL JSONB
            // Обязательно используем try/catch для проверки валидности JSON
            try {
                dataToSubmit.images = JSON.parse(formData.images);
                dataToSubmit.options = JSON.parse(formData.options);
                dataToSubmit.characteristics = JSON.parse(formData.characteristics);
                dataToSubmit.accessories = JSON.parse(formData.accessories);
                dataToSubmit.other_trims = JSON.parse(formData.other_trims);
                dataToSubmit.colors = JSON.parse(formData.colors);
                dataToSubmit.specs = JSON.parse(formData.specs);
            } catch (jsonError) {
                setSaveMessage({ type: 'error', text: 'Ошибка: Некорректный JSON формат в одном из текстовых полей (images, options и т.д.).' });
                setIsSaving(false);
                return; 
            }
            
            // PUT-запрос к вашему API
            const response = await axios.put(`${API_URL}/car/${id}`, dataToSubmit);
            
            setSaveMessage({ type: 'success', text: response.data.message });
            
            // Опционально: обновить carData после успешного сохранения
            setCarData(response.data.car); 

        } catch (err) {
            console.error("❌ Ошибка при сохранении данных:", err);
            const errorMessage = err.response?.data?.message || 'Не удалось сохранить данные из-за ошибки сервера или сети.';
            setSaveMessage({ type: 'error', text: `Ошибка сохранения: ${errorMessage}` });
        } finally {
            setIsSaving(false);
        }
    };


    // =========================================================
    // 4. ОТОБРАЖЕНИЕ СТРАНИЦЫ
    // =========================================================
    if (loading) {
        return <div style={styles.message(null)}>Загрузка данных для ID: {id}...</div>;
    }

    if (error) {
        return <div style={styles.errorBox}>
            <h2>🛑 Ошибка загрузки машины</h2>
            <p style={{fontWeight: 'bold'}}>ID из URL: {id}</p>
            <p>{error}</p>
        </div>;
    }

    if (!formData) {
        return <div style={styles.message('warning')}>Нет данных для редактирования.</div>;
    }
    
    // Вспомогательный компонент для полей
    const InputField = ({ label, name, type = 'text', value, onChange, placeholder, isRequired = false }) => (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}{isRequired && <span style={{color: 'red'}}>*</span>}:</label>
            <input
                style={styles.input}
                type={type}
                name={name}
                value={value || (type === 'number' ? '' : '')}
                onChange={onChange}
                placeholder={placeholder}
                required={isRequired}
                min={type === 'number' ? 0 : undefined}
            />
        </div>
    );
    
    // Вспомогательный компонент для JSON/больших текстовых полей
    const TextAreaField = ({ label, name, value, onChange }) => (
        <div style={styles.formGroup}>
            <label style={styles.label}>{label}:</label>
            <textarea
                style={styles.textArea}
                name={name}
                value={value || ''}
                onChange={onChange}
            />
            <small style={{ color: '#666' }}>Введите валидный JSON. Длина: {value ? value.length : 0}</small>
        </div>
    );
    
    // Сообщение о сохранении
    const SaveNotification = ({ type, text }) => {
        if (!text) return null;
        const color = type === 'success' ? '#28a745' : '#dc3545';
        const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
        
        return (
            <div style={{...styles.notification, backgroundColor: bgColor, color: color}}>
                {text}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Редактирование: {carData?.name || 'Автомобиль'} (ID: {id})</h1>
            
            <SaveNotification type={saveMessage.type} text={saveMessage.text} />
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* Кнопки действий */}
                <div style={styles.actionButtons}>
                    <button 
                        type="submit" 
                        style={styles.saveButton} 
                        disabled={isSaving}
                    >
                        {isSaving ? 'Сохранение...' : '💾 Сохранить изменения'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin')} 
                        style={styles.backButton}
                    >
                        Вернуться к списку
                    </button>
                </div>
                
                <h2 style={styles.sectionHeader}>Общие сведения</h2>
                <div style={styles.grid}>
                    <InputField label="Бренд (brand)" name="brand" value={formData.brand} onChange={handleChange} />
                    <InputField label="Модель (model)" name="model" value={formData.model} onChange={handleChange} />
                    <InputField label="Полное название (name)" name="name" value={formData.name} onChange={handleChange} isRequired={true} />
                    <InputField label="Год (year)" name="year" type="number" value={formData.year} onChange={handleChange} />
                    <InputField label="Пробег (mileage)" name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                    <InputField label="Происхождение (origin)" name="origin" value={formData.origin} onChange={handleChange} />
                    <InputField label="Тип кузова (body_type)" name="body_type" value={formData.body_type} onChange={handleChange} />
                    <InputField label="Тип двигателя (engine_type)" name="engine_type" value={formData.engine_type} onChange={handleChange} />
                </div>

                <h2 style={styles.sectionHeader}>Цены</h2>
                <div style={styles.grid}>
                    <InputField label="Цена в России (RUB)" name="price_russia" type="number" value={formData.price_russia} onChange={handleChange} isRequired={true} />
                    <InputField label="Цена в Китае (CNY)" name="price_china" type="number" value={formData.price_china} onChange={handleChange} />
                    <div /> {/* Пустой слот для выравнивания */}
                </div>
                
                <h2 style={styles.sectionHeader}>Технические характеристики</h2>
                <div style={styles.grid}>
                    <InputField label="Трансмиссия (transmission)" name="transmission" value={formData.transmission} onChange={handleChange} />
                    <InputField label="Тип привода (drivetrain)" name="drivetrain" value={formData.drivetrain} onChange={handleChange} />
                    <InputField label="Мощность (max_power_ps)" name="max_power_ps" type="number" value={formData.max_power_ps} onChange={handleChange} />
                    <InputField label="Момент (max_torque_nm)" name="max_torque_nm" type="number" value={formData.max_torque_nm} onChange={handleChange} />
                    <InputField label="Объем/Емкость (displacement)" name="displacement" value={formData.displacement} onChange={handleChange} />
                    <InputField label="Макс. скорость (max_speed_kmh)" name="max_speed_kmh" type="number" value={formData.max_speed_kmh} onChange={handleChange} />
                    <InputField label="Тип топлива (fuel_type)" name="fuel_type" value={formData.fuel_type} onChange={handleChange} />
                    <InputField label="Количество мест (seats)" name="seats" type="number" value={formData.seats} onChange={handleChange} />
                </div>
                
                <h2 style={styles.sectionHeader}>JSON и массивы (Требуют валидного JSON)</h2>
                <div style={styles.gridJson}>
                    <TextAreaField label="Изображения (images: Array)" name="images" value={formData.images} onChange={handleChange} />
                    <TextAreaField label="Опции (options: Object)" name="options" value={formData.options} onChange={handleChange} />
                    <TextAreaField label="Характеристики (characteristics: Object)" name="characteristics" value={formData.characteristics} onChange={handleChange} />
                    <TextAreaField label="Аксессуары (accessories: Object)" name="accessories" value={formData.accessories} onChange={handleChange} />
                    <TextAreaField label="Другие комплектации (other_trims: Array)" name="other_trims" value={formData.other_trims} onChange={handleChange} />
                    <TextAreaField label="Цвета (colors: Array)" name="colors" value={formData.colors} onChange={handleChange} />
                    <TextAreaField label="Спецификации (specs: Object)" name="specs" value={formData.specs} onChange={handleChange} />
                </div>
                
                {/* Финальная кнопка сохранения */}
                <div style={styles.actionButtons}>
                    <button 
                        type="submit" 
                        style={styles.saveButton} 
                        disabled={isSaving}
                    >
                        {isSaving ? 'Сохранение...' : '💾 Сохранить изменения'}
                    </button>
                </div>
                
            </form>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    header: { borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    gridJson: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: '600', color: '#333' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', transition: 'border-color 0.2s' },
    textArea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '150px', fontFamily: 'Consolas, monospace' },
    sectionHeader: { marginTop: '30px', borderBottom: '1px solid #ddd', paddingBottom: '5px', color: '#007bff' },
    actionButtons: { display: 'flex', gap: '15px', marginTop: '20px', marginBottom: '20px', padding: '10px', borderTop: '1px solid #eee' },
    saveButton: { padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    backButton: { padding: '12px 25px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
    notification: { padding: '15px', borderRadius: '8px', fontWeight: 'bold', margin: '15px 0' },
    errorBox: { padding: '20px', color: 'red', border: '1px solid red', margin: '20px', borderRadius: '8px' },
    message: (type) => ({ 
        padding: '20px', 
        color: type === 'warning' ? 'orange' : '#007bff', 
        fontSize: '1.2em' 
    })
};

export default AdminEditCarPage;
