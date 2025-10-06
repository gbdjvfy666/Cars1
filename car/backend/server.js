const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 4000; // <--- УБЕДИТЕСЬ, ЧТО ЭТА СТРОКА НЕ УДАЛЕНА И НЕ ЗАКОММЕНТИРОВАНА

// Настройка CORS
app.use(cors());
app.use(express.json());

// Настройки подключения к PostgreSQL (Используя данные, предоставленные вами)
const pool = new Pool({
    user: 'postgres', 
    host: 'localhost',
    database: 'car_market', 
    password: 'gbdjvfy666', 
    port: 5432,
});

/**
 * Функция для получения данных марок из БД, динамического подсчета машин 
 * и форматирования результата для фронтенда.
 */
async function getFormattedBrands() {
    try {
        // --- ИСПРАВЛЕННЫЙ SQL-ЗАПРОС С ПОДСЧЕТОМ ---
        // Использован фактический столбец из вашей БД: b.country_group
        const sqlQuery = `
            SELECT 
                b.name, 
                b.slug, 
                b.img_src, 
                b.country_group AS country_key, 
                b.country_group AS country_title, 
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

        // Группируем данные по стране (country_key)
        for (const row of result.rows) {
            const { country_key, country_title, name, slug, car_count, img_src } = row;

            if (!formattedData[country_key]) {
                formattedData[country_key] = {
                    // Используем название группы, например, "chinese"
                    title: country_title.charAt(0).toUpperCase() + country_title.slice(1), 
                    brands: []
                };
            }
            formattedData[country_key].brands.push({
                name,
                slug,
                // Используем car_count, преобразованный в целое число
                count: parseInt(car_count, 10), 
                imgSrc: img_src
            });
        }

        return formattedData;

    } catch (err) {
        console.error('❌ Критическая ошибка при выполнении запроса к БД:', err);
        throw err;
    }
}


// ====================================================================
// API ROUTE: /api/brands (Главный эндпоинт)
// ====================================================================

app.get('/api/brands', async (req, res) => {
    try {
        const data = await getFormattedBrands();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch brands from database' });
    }
});


// ====================================================================
// API ROUTE: /api/brands/:brandSlug (Получение данных одного бренда)
// НОВЫЙ ЭНДПОИНТ для получения имени и URL логотипа.
// ====================================================================

app.get('/api/brands/:brandSlug', async (req, res) => {
    try {
        const { brandSlug } = req.params;
        // Запрос, который возвращает название и URL логотипа
        const query = 'SELECT name, slug, img_src FROM brands WHERE LOWER(slug) = LOWER($1)';
        const { rows } = await pool.query(query, [brandSlug]);
        
        if (rows.length === 0) {
            // Если бренд не найден
            return res.status(404).json({ message: 'Бренд не найден' });
        }

        // Возвращаем первый найденный бренд
        res.json(rows[0]); 
    } catch (error) {
        console.error("Ошибка при получении данных бренда из БД:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


// ====================================================================
// API ROUTE: /api/cars/:brandSlug (Получение списка моделей)
// ====================================================================

app.get('/api/cars/:brandSlug', async (req, res) => {
    try {
        const { brandSlug } = req.params;
        const query = 'SELECT * FROM cars WHERE LOWER(brand) = LOWER($1)';
        const { rows } = await pool.query(query, [brandSlug]);
        
        // ВНИМАНИЕ: В вашей таблице cars поле brand, вероятно, содержит slug или имя.
        // Я использую LOWER(brand) = LOWER($1) для соответствия.
        
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении машин бренда из БД:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


// ====================================================================
// API ROUTE: /api/car/:id (Получение одной машины по ID)
// ====================================================================

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


// ====================================================================
// Запуск сервера
// ====================================================================

app.listen(port, () => {
    console.log(`\n🚀 Бэкенд-сервер запущен на http://localhost:${port}`);
    console.log(`API доступно по адресу http://localhost:${port}/api/brands`);
});

// Проверка подключения к БД при запуске
pool.connect()
  .then(() => console.log('✅ Успешное подключение к PostgreSQL'))
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err.stack));
