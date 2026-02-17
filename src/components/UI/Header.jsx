import styles from './Header.module.css'

export default function Header() {
    return (
        <div className={styles.header}>
            <h1 className={styles.zhTitle}>如厕精选</h1>
            <div className={styles.rule} />
            <span className={styles.enTitle}>TOILET SELECTION</span>
        </div>
    )
}
