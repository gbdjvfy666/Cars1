import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:4000/api';
const INITIAL_VISIBLE_BRANDS = 14;

const PopularBrandsFilter = () => {
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchPopularBrands = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/brands/popular`);
                if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
                const data = await response.json();
                setBrands(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPopularBrands();
    }, []);

    const displayedBrands = isExpanded ? brands : brands.slice(0, INITIAL_VISIBLE_BRANDS);

    if (isLoading) {
        return <div style={styles.container}>Загрузка популярных марок...</div>;
    }

    if (error) {
        return <div style={{...styles.container, color: '#E30016'}}>Ошибка загрузки марок: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Популярные марки</h3>
            <div style={styles.grid}>
                {displayedBrands.map(brand => (
                    <Link
                        key={brand.slug}
                        to={`/cars/${brand.slug}`}
                        style={styles.brandButton}
                    >
                        {brand.name}
                        <span style={styles.count}>{brand.count}</span>
                    </Link>
                ))}
            </div>
            {brands.length > INITIAL_VISIBLE_BRANDS && (
                <div style={styles.toggleContainer}>
                    <button onClick={() => setIsExpanded(!isExpanded)} style={styles.toggleButton}>
                        {isExpanded ? 'Скрыть' : `Показать еще ${brands.length - INITIAL_VISIBLE_BRANDS} марок`}
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        backgroundColor: '#1c1c1c',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        border: '1px solid #333'
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#f0f0f0',
        margin: '0 0 16px 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
    },
    brandButton: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        fontSize: '15px',
        fontWeight: 500,
        color: '#d0d0d0',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 0.2s, color 0.2s',
        textDecoration: 'none',
    },
    count: {
        fontSize: '14px',
        color: '#888',
    },
    toggleContainer: {
        marginTop: '16px',
        borderTop: '1px solid #333',
        paddingTop: '16px',
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: 500,
    }
};

export default PopularBrandsFilter;