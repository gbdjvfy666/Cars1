// Characteristics.js

import React, { useState, useEffect } from 'react';

const Characteristics = ({ characteristics }) => {
    // Локальные стили для компонента
    const styles = {
        charContainer: { 
            marginTop: '32px', 
            backgroundColor: '#1c1c1c', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #333' 
        },
        sectionTitle: { 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '0 0 24px 0', 
            color: '#f0f0f0', 
            textAlign: 'center' 
        },
        charGrid: { 
            display: 'grid', 
            gridTemplateColumns: '250px 1fr', 
            gap: '24px' 
        },
        charTabs: { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
        },
        charTab: { 
            backgroundColor: '#242424', 
            color: '#f0f0f0', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #333', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '500', 
            transition: 'background-color 0.2s' 
        },
        activeCharTab: { 
            backgroundColor: '#E30016', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #333', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '500' 
        },
        charContent: { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
        },
        charCategoryTitle: { 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#E30016', 
            margin: '0 0 20px 0', 
            paddingTop: 0, 
            borderTop: 'none' 
        },
        charRow: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '8px 0', 
            borderBottom: '1px solid #333' 
        },
        charName: { 
            color: '#f0f0f0', 
            fontSize: '14px', 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
        },
        charValue: { 
            color: '#f0f0f0', 
            fontSize: '14px', 
            fontWeight: '500', 
            textAlign: 'right', 
            minWidth: '100px' 
        },
        infoIcon: { 
            color: '#E30016', 
            fontSize: '16px', 
            verticalAlign: 'middle' 
        }
    };
    
    const rawCharacteristics = characteristics || {};
    const charKeys = Object.keys(rawCharacteristics);
    if (charKeys.length === 0) return null;

    // Логика определения секций характеристик
    const isSectioned = charKeys.length > 0 && 
                         typeof rawCharacteristics[charKeys[0]] === 'object' && 
                         !Array.isArray(rawCharacteristics[charKeys[0]]) && 
                         Object.keys(rawCharacteristics[charKeys[0]]).length > 0;

    const normalizedCharacteristics = isSectioned 
        ? rawCharacteristics 
        : { 'Общие характеристики': rawCharacteristics };
        
    const finalKeys = Object.keys(normalizedCharacteristics);
    if (finalKeys.length === 0) return null;

    const [activeSection, setActiveSection] = useState(finalKeys[0]);

    useEffect(() => {
        if (!finalKeys.includes(activeSection)) {
            setActiveSection(finalKeys[0]);
        }
    }, [finalKeys, activeSection]);

    const renderSectionContent = (sectionName, items) => {
        const itemsObject = typeof items === 'object' && items !== null ? items : {};
        const dataAsArray = Object.entries(itemsObject)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([name, value]) => ({ name, value }));
            
        if (dataAsArray.length === 0) return <div>Нет данных для отображения в этом разделе.</div>;
        
        return (
            <div>
                <h3 style={styles.charCategoryTitle}>{sectionName}</h3>
                {dataAsArray.map((item, index) => (
                    <div key={item.name || index} style={styles.charRow}>
                        <div style={styles.charName}><span style={styles.infoIcon}>ⓘ</span>{item.name}</div>
                        <div style={styles.charValue}>{String(item.value)}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.charContainer}>
            <h2 style={styles.sectionTitle}>Характеристики</h2>
            <div style={styles.charGrid}>
                <nav style={styles.charTabs}>
                    {finalKeys.map(key => (
                        <button 
                            key={key} 
                            onClick={() => setActiveSection(key)} 
                            style={activeSection === key ? styles.activeCharTab : styles.charTab}
                        >
                            {key}
                        </button>
                    ))}
                </nav>
                <div style={styles.charContent}>
                    {normalizedCharacteristics[activeSection] &&
                        renderSectionContent(activeSection, normalizedCharacteristics[activeSection])
                    }
                </div>
            </div>
        </div>
    );
};

export default Characteristics;