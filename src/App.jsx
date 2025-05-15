import { useEffect, useState, useCallback } from 'react';
import styles from './App.module.css';
import { useHolderCount } from './hooks/useHolderCount';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const GOAL = 6942;
const CONTRACT_ADDRESS = 'HxptKywiNbHobJD4XMMBn1czMUGkdMrUkeUErQLKbonk';

function App() {
  const holders = useHolderCount();
  const [animatedCount, setAnimatedCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const { width, height } = useWindowSize();

  const triggerCelebration = useCallback(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (holders === null) return;
    const diff = holders - animatedCount;
    if (diff === 0) return;

    const duration = 1500;
    const startTime = Date.now();
    const startValue = animatedCount;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedCount(Math.floor(startValue + diff * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [holders]);

  useEffect(() => {
    if (animatedCount > 0 && animatedCount % 100 === 0) {
      triggerCelebration();
    }
  }, [animatedCount, triggerCelebration]);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
  <div className={styles.wrapper}>
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <motion.img
          src="/goggles-banner.jpeg"
          alt="Trench Goggles"
          className={styles.banner}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />
        <h1 className={styles.title}>
          are you wearing your trench goggles?
        </h1>
        <motion.p
          key={animatedCount}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className={styles.counter}
        >
          <span className={styles.counterValue}>
            {animatedCount.toLocaleString()}
          </span>
          <span className={styles.counterLabel}>
            people wear the trench goggles
          </span>
        </motion.p>

      

        <div className={styles.buttonRow}>
  <a
    href="https://raydium.io/launchpad/token/?mint=HxptKywiNbHobJD4XMMBn1czMUGkdMrUkeUErQLKbonk"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.button}
  >
    Buy $GOGS
  </a>
  <a
    href="https://x.com/i/communities/1922769104458613236"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.button}
  >
    Join the community on X
  </a>
</div>

<div className={styles.caWrapper}>
  <button className={styles.button} onClick={handleCopy}>
    {copied ? 'copied!' : `ca: ${CONTRACT_ADDRESS}`}
  </button>
</div>



        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Confetti
                width={width}
                height={height}
                numberOfPieces={80}
                colors={['#ff6b6b', '#ff9500', '#fff200']}
                gravity={0.12}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  </div>
);
}

export default App;
