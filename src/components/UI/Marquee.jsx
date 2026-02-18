import styles from './Marquee.module.css'

export default function Marquee() {
    const repeated = Array(6).fill("保持通畅 /// KEEP IT SMOOTH /// ").join("")

    return (
        <div className={styles.marquee}>
            <div className={styles.track}>
                <span className={styles.segment}>{repeated}</span>
                <span className={styles.segment}>{repeated}</span>
            </div>
        </div>
    )
}
