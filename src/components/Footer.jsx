import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      built with trench goggles by{' '}
      <a
        href="https://x.com/maryam100x"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        @maryam100x
      </a>
    </footer>
  );
}
