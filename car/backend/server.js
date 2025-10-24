const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Настройки подключения к PostgreSQL
const pool = new Pool({
    user: 'postgres', 
    host: 'localhost',
    database: 'car_market', 
    password: 'gbdjvfy666', 
    port: 5432,
});

// Функция для получения брендов для главной страницы
async function getFormattedBrands() {
    try {
        const sqlQuery = `
            SELECT 
                b.name, 
                b.slug, 
                b.img_src, 
                b.country_group,
                COUNT(c.id) AS car_count
            FROM 
                brands b
            LEFT JOIN 
                cars c ON LOWER(b.slug) = LOWER(c.brand)
            GROUP BY 
                b.name, b.slug, b.img_src, b.country_group
            ORDER BY 
                b.country_group, b.name;
        `;
        const result = await pool.query(sqlQuery);
        const formattedData = {};
        for (const row of result.rows) {
            const { country_group, name, slug, car_count, img_src } = row;
            const countryKey = country_group.toLowerCase();
            if (!formattedData[countryKey]) {
                formattedData[countryKey] = {
                    title: country_group.charAt(0).toUpperCase() + country_group.slice(1),
                    brands: []
                };
            }
            formattedData[countryKey].brands.push({ name, slug, count: parseInt(car_count, 10), imgSrc: img_src });
        }
        return formattedData;
    } catch (err) {
        console.error('❌ Критическая ошибка при выполнении запроса к БД:', err);
        throw err;
    }
}

// API роут для получения брендов
app.get('/api/brands', async (req, res) => {
    try {
        const data = await getFormattedBrands();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch brands from database' });
    }
});

// API роут для поисковых подсказок
app.get('/api/suggestions', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim().length < 2) {
            return res.json([]);
        }
        const searchTerm = query.trim();
        const sql = `
            SELECT DISTINCT
                CONCAT(brand, ' ', model) as suggestion,
                CASE
                    WHEN CONCAT(brand, ' ', model) ILIKE $2 THEN 1
                    WHEN CONCAT(brand, ' ', model) ILIKE $3 THEN 2
                    ELSE 3
                END as rank
            FROM cars
            WHERE CONCAT(brand, ' ', model) ILIKE $1
            ORDER BY
                rank,
                suggestion
            LIMIT 10;
        `;
        const values = [`%${searchTerm}%`, `${searchTerm}%`, `% ${searchTerm}%`];
        const { rows } = await pool.query(sql, values);
        const formattedSuggestions = rows.map(row => ({
            value: row.suggestion,
            label: row.suggestion,
        }));
        res.json(formattedSuggestions);
    } catch (error) {
        console.error("Ошибка при получении подсказок:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Основной API роут для поиска со всеми фильтрами (Обновлен для Admin Dashboard)
app.get('/api/search', async (req, res) => {
    try {
        const { condition, origin, bodyType, priceFrom, priceTo, engine, engineType, searchTerm, drivetrain } = req.query;
        const engineParam = engine || engineType; // поддерживаем both names
        
        // Устанавливаем лимит по умолчанию 20, но разрешаем фронтенду (например, админке) его переопределять
        const limit = parseInt(req.query.limit) || 20; 
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        let queryParts = [];
        const queryValues = [];
        let valueIndex = 1;
        let baseWhereClause = ' WHERE 1=1';

        // ==========================================================
        // 🚨 УЛУЧШЕННАЯ ЛОГИКА ПОИСКА ПО ID, NAME, BRAND/MODEL
        // ==========================================================
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.trim();
            const ilikeValue = `%${term}%`;

            // Поиск по: CONCAT(brand, ' ', model) ИЛИ ID ИЛИ NAME
            const searchCondition = `(
                CONCAT(brand, ' ', model) ILIKE $${valueIndex} OR 
                id ILIKE $${valueIndex} OR 
                name ILIKE $${valueIndex}
            )`;
            
            queryParts.push(searchCondition);
            
            // Все 3 условия используют одно и то же значение: %searchTerm%
            queryValues.push(ilikeValue);
            valueIndex++; 
        }
        // ==========================================================

        if (condition === 'new') {
            queryParts.push('mileage = 0');
        } else if (condition === 'used') {
            queryParts.push('mileage > 0');
        }
        
        // "Умная" фильтрация для двигателей
        const engineFilters = Array.isArray(engineParam) ? engineParam : (engineParam ? [engineParam] : []);
        if (engineFilters.length > 0) {
            const exactMatches = [];
            const hybridSearchTerms = [];
            
            engineFilters.forEach(eng => {
                if (eng === 'Гибрид') {
                    hybridSearchTerms.push(`engine_type ILIKE '%' || $${valueIndex++} || '%'`);
                    queryValues.push('гибрид');
                } else {
                    exactMatches.push(`$${valueIndex++}`);
                    queryValues.push(eng);
                }
            });
            
            let finalEngineQueryParts = [];
            if (exactMatches.length > 0) {
                finalEngineQueryParts.push(`engine_type IN (${exactMatches.join(', ')})`);
            }
            if (hybridSearchTerms.length > 0) {
                finalEngineQueryParts.push(...hybridSearchTerms);
            }

            if (finalEngineQueryParts.length > 0) {
                queryParts.push(`(${finalEngineQueryParts.join(' OR ')})`);
            }
        }
        
        // Стандартная обработка для остальных множественных фильтров
        const addMultiFilter = (param, columnName) => {
            const items = Array.isArray(param) ? param : (param ? [param] : []);
            if (items.length > 0) {
                const placeholders = items.map(() => `$${valueIndex++}`).join(', ');
                queryParts.push(`${columnName} IN (${placeholders})`);
                queryValues.push(...items);
            }
        };

        addMultiFilter(origin, 'origin');
        addMultiFilter(bodyType, 'body_type');
        addMultiFilter(drivetrain, 'drivetrain');

        // Корректная обработка priceFrom (разрешаем 0)
        if (priceFrom !== undefined && priceFrom !== '' && !isNaN(parseInt(priceFrom))) {
            queryParts.push(`price_russia >= $${valueIndex++}`);
            queryValues.push(parseInt(priceFrom));
        }
        if (priceTo !== undefined && priceTo !== '' && !isNaN(parseInt(priceTo))) {
            queryParts.push(`price_russia <= $${valueIndex++}`);
            queryValues.push(parseInt(priceTo));
        }

        if (queryParts.length > 0) {
            baseWhereClause += ' AND ' + queryParts.join(' AND ');
        }
        
        const countQuery = `SELECT COUNT(*) FROM cars${baseWhereClause};`;
        const totalResult = await pool.query(countQuery, queryValues);
        const totalCount = parseInt(totalResult.rows[0].count, 10);
        
        let sqlQuery = `SELECT * FROM cars${baseWhereClause} ORDER BY year DESC, price_russia DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++};`;
        queryValues.push(limit, offset);
        const { rows: cars } = await pool.query(sqlQuery, queryValues);
        
        res.json({ totalCount, limit, page, cars });

    } catch (error) {
        console.error("Ошибка при выполнении поискового запроса:", error);
        res.status(500).json({ message: "Ошибка сервера при поиске" });
    }
});

// Роут для получения данных одного бренда
app.get('/api/brands/:brandSlug', async (req, res) => {
    try {
        const { brandSlug } = req.params;
        const query = 'SELECT name, slug, img_src FROM brands WHERE LOWER(slug) = LOWER($1)';
        const { rows } = await pool.query(query, [brandSlug]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Бренд не найден' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Ошибка при получении данных бренда из БД:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Роут для получения списка моделей одного бренда
app.get('/api/cars/:brandSlug', async (req, res) => {
    try {
        const { brandSlug } = req.params;
        const query = 'SELECT * FROM cars WHERE LOWER(brand) = LOWER($1) ORDER BY year DESC';
        const { rows } = await pool.query(query, [brandSlug]);
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении машин бренда из БД:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Роут для получения одной машины по ID
app.get('/api/car/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Машина не найдена' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Ошибка при получении машины из БД:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// =================================================================
// 🚀 МАРШРУТ ДЛЯ ПОЛНОГО РЕДАКТИРОВАНИЯ ДАННЫХ МАШИНЫ (PUT)
// =================================================================
// =================================================================
// 🚀 МАРШРУТ ДЛЯ ПОЛНОГО РЕДАКТИРОВАНИЯ ДАННЫХ МАШИНЫ (PUT)
// =================================================================
app.put('/api/car/:id', async (req, res) => {
    const { id } = req.params;
    
    // 1. Деструктуризация ВСЕХ полей
    const { 
        brand, model, name, price_russia, price_china, year, mileage, 
        engine_type, drivetrain, body_type, origin, 
        images, options, characteristics, accessories, other_trims, colors, 
        source_url, emission_standard, engine_spec_type, displacement, max_power_ps, 
        transmission, steering_position, max_torque_nm, fuel_type, seats, 
        brake_system, tire_size, airbags, sunroof, roof_rack, body_structure, 
        max_speed_kmh, battery_type, charging_time, dimensions_lwh, tpms, 
        rear_camera, seat_color, driver_seat_adjustment, copilot_seat_adjustment, 
        touch_screen, air_conditioner, rear_light, daytime_light, specs 
    } = req.body;
    
    // ⚠️ Базовая проверка: убедитесь, что ключевые поля не пустые
    if (!name || price_russia === undefined) {
        return res.status(400).json({ message: 'Необходимо указать название и цену.' });
    }

    try {
        // 2. SQL-запрос для обновления 46 столбцов
        const query = `
            UPDATE cars
            SET 
                brand = $1, model = $2, name = $3, price_russia = $4, price_china = $5, year = $6, mileage = $7, 
                engine_type = $8, drivetrain = $9, body_type = $10, origin = $11, 
                images = $12::jsonb, options = $13::jsonb, characteristics = $14::jsonb, accessories = $15::jsonb, 
                other_trims = $16::jsonb, colors = $17::jsonb, 
                source_url = $18, emission_standard = $19, engine_spec_type = $20, displacement = $21, 
                max_power_ps = $22, transmission = $23, steering_position = $24, max_torque_nm = $25, 
                fuel_type = $26, seats = $27, brake_system = $28, tire_size = $29, airbags = $30, 
                sunroof = $31, roof_rack = $32, body_structure = $33, max_speed_kmh = $34, 
                battery_type = $35, charging_time = $36, dimensions_lwh = $37, tpms = $38, rear_camera = $39, 
                seat_color = $40, driver_seat_adjustment = $41, copilot_seat_adjustment = $42, 
                touch_screen = $43, air_conditioner = $44, rear_light = $45, daytime_light = $46, 
                specs = $47::jsonb
            WHERE id = $48
            RETURNING *;
        `;
        
        // 3. Массив значений. 
        // 🚨 JSONB-поля (images, options, characteristics, etc.) передаются как JavaScript-объекты.
        const values = [
            brand, model, name, price_russia, price_china, year, mileage, engine_type, drivetrain, body_type, 
            origin, images, options, characteristics, 
            accessories, other_trims, colors, source_url, 
            emission_standard, engine_spec_type, displacement, max_power_ps, transmission, steering_position, 
            max_torque_nm, fuel_type, seats, brake_system, tire_size, airbags, sunroof, roof_rack, 
            body_structure, max_speed_kmh, battery_type, charging_time, dimensions_lwh, tpms, rear_camera, 
            seat_color, driver_seat_adjustment, copilot_seat_adjustment, touch_screen, air_conditioner, 
            rear_light, daytime_light, specs, 
            id // $48
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Машина с ID ${id} не найдена.` });
        }

        res.json({ 
            message: '✅ Данные успешно обновлены', 
            car: result.rows[0] 
        });

    } catch (error) {
        console.error(`❌ Ошибка при обновлении машины с ID ${id}:`, error);
        res.status(500).json({ 
            error: 'Ошибка сервера при обновлении данных.', 
            details: error.message 
        });
    }
});


// Запуск сервера
app.listen(port, () => {
    console.log(`\n🚀 Бэкенд-сервер запущен на http://localhost:${port}`);
});

pool.connect()
    .then(() => console.log('✅ Успешное подключение к PostgreSQL'))
    .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err.stack));