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

// Основной API роут для поиска со всеми фильтрами
app.get('/api/search', async (req, res) => {
    try {
        const { condition, origin, bodyType, priceFrom, priceTo, engine, searchTerm, drivetrain } = req.query;
        
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        let queryParts = [];
        const queryValues = [];
        let valueIndex = 1;
        let baseWhereClause = ' WHERE 1=1';

        if (searchTerm && searchTerm.trim() !== '') {
            queryParts.push(`CONCAT(brand, ' ', model) ILIKE $${valueIndex++}`);
            queryValues.push(`%${searchTerm.trim()}%`);
        }
        if (condition === 'new') {
            queryParts.push('mileage = 0');
        } else if (condition === 'used') {
            queryParts.push('mileage > 0');
        }
        
        // "Умная" фильтрация для двигателей
        const engineFilters = Array.isArray(engine) ? engine : (engine ? [engine] : []);
        if (engineFilters.length > 0) {
            const exactMatches = [];
            const hybridSearchTerms = [];
            
            engineFilters.forEach(eng => {
                if (eng === 'Гибрид') {
                    // Ищем по подстроке 'гибрид' без учета регистра
                    hybridSearchTerms.push(`engine_type ILIKE '%' || $${valueIndex++} || '%'`);
                    queryValues.push('гибрид');
                } else {
                    // Для остальных - точное совпадение
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

        if (priceFrom && !isNaN(parseInt(priceFrom))) {
            queryParts.push(`price_russia >= $${valueIndex++}`);
            queryValues.push(parseInt(priceFrom));
        }
        if (priceTo && !isNaN(parseInt(priceTo))) {
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

// Запуск сервера
app.listen(port, () => {
    console.log(`\n🚀 Бэкенд-сервер запущен на http://localhost:${port}`);
});

pool.connect()
    .then(() => console.log('✅ Успешное подключение к PostgreSQL'))
    .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err.stack));