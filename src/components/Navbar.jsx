import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a href="/" className={styles.logo}>
        <img src="/goggles.png" alt="$GOGS Logo" className={styles.logoImage} />
        <span className={styles.logoText}>$GOGS</span>
      </a>
      <div className={styles.links}>
        <a
          href="https://raydium.io/launchpad/token/?mint=HxptKywiNbHobJD4XMMBn1czMUGkdMrUkeUErQLKbonk"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy
        </a>
        <a
          href="https://x.com/i/communities/1922769104458613236"
          target="_blank"
          rel="noopener noreferrer"
        >
          Community
        </a>
      </div>
    </nav>
  );
}
