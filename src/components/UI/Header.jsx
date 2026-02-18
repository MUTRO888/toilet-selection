import styles from './Header.module.css'

export default function Header() {
    return (
        <div className={styles.header}>
            <h1 className={styles.mainTitle}>如厕精选</h1>
            <span className={styles.subTitle}>TOILET SELECTION</span>
        </div>
    )
}
