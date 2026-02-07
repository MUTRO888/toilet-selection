import styles from './Marquee.module.css'

export default function Marquee() {
    const text = "SH*T HAPPENS & MUSIC PLAYS /// KEEP IT SMOOTH /// DO NOT DISTURB /// "

    return (
        <div className={styles.marquee}>
            <div className={styles.content}>
                {text}{text}
            </div>
        </div>
    )
}
