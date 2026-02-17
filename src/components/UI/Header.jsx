import styles from './Header.module.css'

export default function Header() {
    return (
        <div className={styles.header}>
            <h1 className={styles.mainTitle}>TOILET SELECTION</h1>
            <div className={styles.subTag}>如厕精选</div>
        </div>
    )
}
