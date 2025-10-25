import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';

// Демонстрационные данные для команды остаются без изменений.
const teamMembers = [
  {
    name: 'Александр Иванов',
    title: 'Основатель и CEO',
    imageUrl: 'https://placehold.co/400x400/2a2a2a/f0f0f0?text=AI',
  },
  {
    name: 'Елена Петрова',
    title: 'Руководитель отдела продаж',
    imageUrl: 'https://placehold.co/400x400/2a2a2a/f0f0f0?text=EP',
  },
  {
    name: 'Дмитрий Сидоров',
    title: 'Специалист по логистике',
    imageUrl: 'https://placehold.co/400x400/2a2a2a/f0f0f0?text=DS',
  },
];

function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* === СЕКЦИЯ 1: ИСТОРИЯ КОМПАНИИ === */}
        <section className={styles.heroSection}>
          <h1 className={styles.mainTitle}>
            Доверие — это не слово. <span className={styles.titleAccent}>Это результат.</span>
          </h1>
          <p className={styles.subtitle}>
            Компания NSBHauto началась не с бизнес-плана. Она родилась из личного опыта, полного разочарований и вопросов. Из запутанных схем, «плавающей» цены и постоянного ощущения, что ты один на один с системой, где каждый пытается на тебе заработать. Мы задались вопросом: «А что, если создать компанию, с которой нам самим было бы спокойно работать как клиентам?». Так родилась NSBHauto. Мы — ваше спокойствие в мире сложного выбора.
          </p>
        </section>

        {/* === СЕКЦИЯ 2: МИССИЯ === */}
        <section className={styles.missionSection}>
           <h2 className={styles.sectionTitle}>Наша миссия</h2>
           <p className={styles.missionText}>
             Превратить нервный и непрозрачный процесс покупки автомобиля из-за рубежа в понятный, предсказуемый и безопасный опыт для каждого клиента. Мы стремимся к тому, чтобы слова «авто из Китая» ассоциировались не с риском, а с надежностью, выгодой и современными технологиями. Наша работа — построить мост доверия между вами и автомобилем вашей мечты.
           </p>
        </section>

        {/* === СЕКЦИЯ 3: НАШИ ПРЕИМУЩЕСТВА === */}
        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle}>Три столпа, на которых все держится</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Честная и финальная цена</h3>
              <p>Никаких «цены от…». Вы получаете полную смету, где учтены все расходы. Эта цифра фиксируется в договоре и не изменится. Никаких «непредвиденных расходов» и скрытых комиссий.</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Реальные и быстрые сроки</h3>
              <p>Мы не обещаем доставку за две недели, если это невозможно. Благодаря отлаженным маршрутам и честному информированию вы всегда знаете, где находится ваш автомобиль. Ожидание должно быть предсказуемым.</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Личная ответственность</h3>
              <p>За вами закрепляется персональный менеджер, который ведет сделку от первого звонка до передачи ключей. Один контакт, который несет полную ответственность за результат.</p>
            </div>
          </div>
        </section>

        {/* === СЕКЦИЯ 4: НАША КОМАНДА (без изменений) === */}
        <section className={styles.teamSection}>
          <h2 className={styles.sectionTitle}>Наша Команда</h2>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamMember}>
                <img src={member.imageUrl} alt={member.name} className={styles.teamImage} />
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamTitle}>{member.title}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* === СЕКЦИЯ 5: ЦЕЛИ КОМПАНИИ (новый блок) === */}
        <section className={styles.goalsSection}>
           <h2 className={styles.sectionTitle}>Наши цели</h2>
           <ul className={styles.goalsList}>
              <li>Стать синонимом надежности при покупке авто из Китая.</li>
              <li>Сделать процесс максимально доступным с помощью удобных онлайн-инструментов.</li>
              <li>Формировать открытый рынок, создавая базу знаний и честных обзоров.</li>
              <li>Строить долгосрочные отношения, чтобы вы без колебаний снова обратились к нам.</li>
           </ul>
        </section>

        {/* === СЕКЦИЯ 6: ПРИЗЫВ К ДЕЙСТВИЮ (без изменений) === */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Готовы выбрать свой идеальный автомобиль?</h2>
          <p className={styles.ctaSubtitle}>Ознакомьтесь с нашим каталогом, в котором собраны лучшие предложения на рынке.</p>
          <Link to="/search" className={styles.ctaButton}>
            Перейти в каталог
          </Link>
        </section>

      </div>
    </div>
  );
}

export default AboutPage;