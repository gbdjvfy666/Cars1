// Accessories.js (Исправленный код)

import React from 'react';

const Accessories = ({ accessories, model }) => {
    // Локальные стили для компонента
    const styles = {
        sectionTitle: { 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '60px 0 24px 0', 
            color: '#f0f0f0', 
            textAlign: 'center' 
        },
        accessoriesGrid: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
        },
        accessoryCard: { 
            backgroundColor: '#1c1c1c', 
            borderRadius: '12px', 
            padding: '20px', 
            textAlign: 'center', 
            border: '1px solid #333' 
        },
        accessoryImage: { 
            width: '100%', 
            height: '150px', 
            objectFit: 'cover', 
            borderRadius: '8px', 
            marginBottom: '10px' 
        },
        accessoryName: { 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 5px 0' 
        },
        accessoryDesc: { 
            fontSize: '14px', 
            color: '#999' 
        }
    };
    
    // ⚠️ ИСПРАВЛЕНИЕ: Проверяем, что accessories существует И является массивом
    if (!accessories || !Array.isArray(accessories) || accessories.length === 0) {
        return null;
    }
    
    return (
        <div>
            <h2 style={styles.sectionTitle}>Аксессуары {model}</h2>
            <div style={styles.accessoriesGrid}>
                {accessories.map(acc => (
                    <div key={acc.name} style={styles.accessoryCard}>
                        <img src={acc.img || 'https://placehold.co/150x150/eee/ccc?text=No+Image'} style={styles.accessoryImage} alt={acc.name} />
                        <h4 style={styles.accessoryName}>{acc.name} - {(acc.price || 0).toLocaleString('ru-RU')} ₽</h4>
                        <p style={styles.accessoryDesc}>{acc.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Accessories;