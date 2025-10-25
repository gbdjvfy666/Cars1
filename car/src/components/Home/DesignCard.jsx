import React from 'react';
import styles from './DesignCard.module.css';

function DesignCard() {
  return (
    <div className={styles.cardPageWrapper}>

      <div className={styles.card}>
        {/* Изображение удалено */}
        <h2>Design Smarter, Not Harder</h2>
        <p>Unlock powerful tools to create pixel-perfect designs in record time.</p>
        <div className={styles.button}>Get Started</div>
      </div>

      <div className={styles.accents}>
        <div className={styles.accCard}></div>
        <div className={styles.accCard}></div>
        <div className={styles.accCard}></div>

        <div className={styles.light}></div>
        <div className={`${styles.light} ${styles.sm}`}></div>
        
        <div className={styles.topLight}></div>
      </div>
    </div>
  );
}

export default DesignCard;