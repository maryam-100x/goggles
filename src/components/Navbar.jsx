import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>🕶 $GOGS</div>
      <div className={styles.links}>
        <a href="https://raydium.io/launchpad/token/?mint=HxptKywiNbHobJD4XMMBn1czMUGkdMrUkeUErQLKbonk" target="_blank">Buy</a>
        <a href="https://x.com/i/communities/1922769104458613236" target="_blank">Community</a>
      </div>
    </nav>
  );
}
