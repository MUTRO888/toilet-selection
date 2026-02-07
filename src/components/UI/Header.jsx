import styles from './Header.module.css'

export default function Header() {
    return (
        <div className={styles.header}>
            <h1 className={styles.superTitle}>
                如厠<span className={styles.highlight}>精选</span>
            </h1>
        </div>
    )
}
