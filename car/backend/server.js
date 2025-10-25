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

// =================================================================
// Функции для работы с брендами
// =================================================================
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

// =================================================================
// Роуты для брендов и подсказок
// =================================================================
app.get('/api/brands', async (req, res) => {
    try {
        const data = await getFormattedBrands();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch brands from database' });
    }
});

app.get('/api/brands/popular', async (req, res) => {
    try {
        const sqlQuery = `
            WITH BrandCounts AS (
                SELECT
                    LOWER(brand) as brand_lower,
                    COUNT(id) as car_count
                FROM
                    cars
                GROUP BY
                    LOWER(brand)
                HAVING
                    COUNT(id) > 0
            )
            SELECT
                b.name,
                b.slug,
                bc.car_count
            FROM
                BrandCounts bc
            INNER JOIN
                brands b ON b.slug = bc.brand_lower
            ORDER BY
                bc.car_count DESC;
        `;
        const { rows } = await pool.query(sqlQuery);
        const formattedBrands = rows.map(brand => ({
            name: brand.name,
            slug: brand.slug,
            count: parseInt(brand.car_count, 10)
        }));
        res.json(formattedBrands);
    } catch (error) {
        console.error("❌ Ошибка при получении популярных брендов:", error);
        res.status(500).json({ message: "Ошибка сервера при получении популярных марок" });
    }
});

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

// =================================================================
// 🚀 ФИНАЛЬНЫЙ ИСПРАВЛЕННЫЙ МАРШРУТ ПОИСКА V3
// =================================================================
app.get('/api/search', async (req, res) => {
    try {
        const { 
            condition, origin, bodyType, priceFrom, priceTo, 
            engineType, searchTerm, drivetrain, brandSlug,
            yearFrom, yearTo, mileageFrom, mileageTo, 
            displacementFrom, displacementTo, powerFrom, powerTo,
            withDiscount, withGift, withPromo // Чекбоксы
        } = req.query;
        
        const limit = parseInt(req.query.limit) || 20; 
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        let queryParts = [];
        const queryValues = [];
        let valueIndex = 1;
        let baseWhereClause = ' WHERE 1=1';
        
        // 1. Полнотекстовый поиск
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.trim();
            const ilikeValue = `%${term}%`;
            // Важно: приводим id к тексту (::text) для ILIKE
            const searchCondition = `(CONCAT(brand, ' ', model) ILIKE $${valueIndex} OR id::text ILIKE $${valueIndex} OR name ILIKE $${valueIndex})`;
            queryParts.push(searchCondition);
            queryValues.push(ilikeValue);
            valueIndex++;
        }

        // 2. Условие (Новый/С пробегом)
        if (condition === 'new') { queryParts.push('mileage = 0'); }
        if (condition === 'used') { queryParts.push('mileage > 0'); }
        
        // Вспомогательная функция для мульти-фильтров (Select)
        const addMultiFilter = (param, columnName) => {
            const items = Array.isArray(param) ? param : (param ? [param] : []);
            if (items.length > 0) {
                const placeholders = items.map(() => `$${valueIndex++}`).join(', ');
                const finalColumnName = (columnName === 'brand') ? `LOWER(${columnName})` : columnName;
                const finalItems = (columnName === 'brand') ? items.map(item => item.toLowerCase()) : items;
                queryParts.push(`${finalColumnName} IN (${placeholders})`);
                queryValues.push(...finalItems);
            }
        };

        addMultiFilter(origin, 'origin');
        addMultiFilter(bodyType, 'body_type');
        addMultiFilter(drivetrain, 'drivetrain');
        addMultiFilter(brandSlug, 'brand');
        addMultiFilter(engineType, 'engine_type');

        // Вспомогательная функция для "чистых" числовых полей (цена, год, пробег)
        const addSimpleRangeFilter = (from, to, columnName) => {
            const floatFrom = from !== undefined && from !== '' ? parseFloat(from) : null;
            const floatTo = to !== undefined && to !== '' ? parseFloat(to) : null;
            
            if (floatFrom !== null && !isNaN(floatFrom)) {
                queryParts.push(`${columnName} >= $${valueIndex++}`);
                queryValues.push(floatFrom);
            }
            if (floatTo !== null && !isNaN(floatTo)) {
                queryParts.push(`${columnName} <= $${valueIndex++}`);
                queryValues.push(floatTo);
            }
        };

        // Вспомогательная функция для "грязных" текстовых полей (мощность, объем)
        const addSmartRangeFilter = (from, to, columnName) => {
            const floatFrom = from !== undefined && from !== '' ? parseFloat(from) : null;
            const floatTo = to !== undefined && to !== '' ? parseFloat(to) : null;
            
            if (floatFrom === null && floatTo === null) return;
            
            // SQL-конструкция: Извлечь число (с точкой или запятой), заменить запятую на точку, привести к NUMERIC.
            const rawNumberExtraction = `substring(${columnName} from '(\\d+(?:[.,]\\d+)?)')`;
            const normalizedNumber = `REPLACE(${rawNumberExtraction}, ',', '.')`;
            const numericColumn = `NULLIF(${normalizedNumber}, '') :: NUMERIC`; 
            
            if (floatFrom !== null && !isNaN(floatFrom)) {
                queryParts.push(`${numericColumn} >= $${valueIndex++}`);
                queryValues.push(floatFrom);
            }
            if (floatTo !== null && !isNaN(floatTo)) {
                queryParts.push(`${numericColumn} <= $${valueIndex++}`);
                queryValues.push(floatTo);
            }
        };

        // 3. Применение диапазонных фильтров
        addSimpleRangeFilter(priceFrom, priceTo, 'price_russia');
        addSimpleRangeFilter(yearFrom, yearTo, 'year');
        addSimpleRangeFilter(mileageFrom, mileageTo, 'mileage');

        // Используем SmartRange для текстовых полей
        addSmartRangeFilter(powerFrom, powerTo, 'max_power_ps');
        addSmartRangeFilter(displacementFrom, displacementTo, 'displacement');
        
        // 4. Логика для чекбоксов
        if (withDiscount === 'true') { queryParts.push('has_discount = TRUE'); }
        if (withGift === 'true') { queryParts.push('has_gift = TRUE'); }
        if (withPromo === 'true') { queryParts.push('is_promo = TRUE'); }

        // Объединение условий WHERE
        if (queryParts.length > 0) {
            baseWhereClause += ' AND ' + queryParts.join(' AND ');
        }
        
        // Запрос на общее количество (для пагинации)
        const countQuery = `SELECT COUNT(*) FROM cars${baseWhereClause};`;
        const totalResult = await pool.query(countQuery, queryValues);
        const totalCount = parseInt(totalResult.rows[0].count, 10);
        
        // Основной запрос
        let sqlQuery = `SELECT * FROM cars${baseWhereClause} ORDER BY year DESC, price_russia DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++};`;
        queryValues.push(limit, offset);
        const { rows: cars } = await pool.query(sqlQuery, queryValues);
        
        res.json({ totalCount, limit, page, cars });

    } catch (error) {
        console.error("❌ Критическая ошибка при выполнении поискового запроса:", error);
        res.status(500).json({ message: "Ошибка сервера при поиске", details: error.message });
    }
});
// =================================================================
// КОНЕЦ ИСПРАВЛЕННОГО МАРШРУТА ПОИСКА
// =================================================================

// =================================================================
// Роуты для деталей и обновления (без изменений)
// =================================================================
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
app.put('/api/car/:id', async (req, res) => {
    const { id } = req.params;
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
    
    if (!name || price_russia === undefined) {
        return res.status(400).json({ message: 'Необходимо указать название и цену.' });
    }

    try {
        // === НОРМАЛИЗАЦИЯ И ВАЛИДАЦИЯ JSON ПОЛЕЙ ===
        const normalizeJsonField = (value, fieldName) => {
            // Если передали строку — проверим, что это валидный JSON
            if (typeof value === 'string') {
                try {
                    // parse только для валидации
                    JSON.parse(value);
                    return value; // оставляем строкой (pg::jsonb примет string)
                } catch (err) {
                    throw new Error(`Невалидный JSON в поле "${fieldName}": ${err.message}`);
                }
            }
            // Если объект/массив — сериализуем в строку JSON
            try {
                return JSON.stringify(value);
            } catch (err) {
                throw new Error(`Не получилось сериализовать поле "${fieldName}" в JSON: ${err.message}`);
            }
        };

        const normImages = normalizeJsonField(images, 'images');
        const normOptions = normalizeJsonField(options, 'options');
        const normCharacteristics = normalizeJsonField(characteristics, 'characteristics');
        const normAccessories = normalizeJsonField(accessories, 'accessories');
        const normOtherTrims = normalizeJsonField(other_trims, 'other_trims');
        const normColors = normalizeJsonField(colors, 'colors');
        const normSpecs = normalizeJsonField(specs, 'specs');

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
        
        const values = [
            brand, model, name, price_russia, price_china, year, mileage, engine_type, drivetrain, body_type, 
            origin,
            // Передаём нормализованные JSON-строки
            normImages, normOptions, normCharacteristics, 
            normAccessories, normOtherTrims, normColors, source_url, 
            emission_standard, engine_spec_type, displacement, max_power_ps, transmission, steering_position, 
            max_torque_nm, fuel_type, seats, brake_system, tire_size, airbags, sunroof, roof_rack, 
            body_structure, max_speed_kmh, battery_type, charging_time, dimensions_lwh, tpms, rear_camera, 
            seat_color, driver_seat_adjustment, copilot_seat_adjustment, touch_screen, air_conditioner, 
            rear_light, daytime_light, specs, 
            id
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
        // Если это валидатор JSON — вернуть 400 с понятной ошибкой клиенту
        if (error.message && error.message.startsWith('Невалидный JSON')) {
            return res.status(400).json({ message: error.message });
        }
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