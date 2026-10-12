import styles from './Skeleton.module.css';

export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`${styles.skeleton} ${className}`} />;
}
