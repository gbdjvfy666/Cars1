import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          
          {/* === КОЛОНКА 1: О КОМПАНИИ === */}
          <div className={styles.footerColumn}>
            <h3 className={styles.logo}>
              NSBH<span className={styles.logoAccent}>Auto</span>
            </h3>
            <p className={styles.mission}>
              Ваш надежный партнер по подбору и доставке автомобилей из Китая. Прозрачность, скорость и качество на каждом этапе.
            </p>
          </div>

          {/* === КОЛОНКА 2: КАТАЛОГ === */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Каталог</h4>
            <ul className={styles.footerList}>
              <li><a href="/search?condition=new">Новые авто</a></li>
              <li><a href="/search?condition=used">С пробегом</a></li>
              <li><a href="/search?engineType=electric">Электромобили</a></li>
              <li><a href="/search?origin=chinese">Китайские бренды</a></li>
              <li><a href="/search?origin=european">Европейские бренды</a></li>
            </ul>
          </div>

          {/* === КОЛОНКА 3: УСЛУГИ === */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Услуги</h4>
            <ul className={styles.footerList}>
              <li><a href="/services/custom-order">Авто на заказ</a></li>
              <li><a href="/services/delivery">Доставка и таможня</a></li>
              <li><a href="/services/credit">Кредитование</a></li>
              <li><a href="/services/insurance">Страхование</a></li>
            </ul>
          </div>

          {/* === КОЛОНКА 4: КОНТАКТЫ === */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Контакты</h4>
            <address className={styles.address}>
              <p>г. Москва, ул. Примерная, д. 1, офис 101</p>
              <p>
                <a href="tel:+74951234567">+7 (495) 123-45-67</a>
              </p>
              <p>
                <a href="mailto:info@limeeauto.com">info@limeeauto.com</a>
              </p>
            </address>
          </div>

        </div>

        {/* === НИЖНЯЯ ЧАСТЬ ФУТЕРА === */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} NSBHAuto. Все права защищены.
          </p>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Telegram" title="Telegram">TG</a>
            <a href="#" aria-label="VK" title="VK">VK</a>
            <a href="#" aria-label="YouTube" title="YouTube">YT</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;