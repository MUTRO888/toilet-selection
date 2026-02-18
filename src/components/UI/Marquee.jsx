import styles from './Marquee.module.css'

export default function Marquee() {
    const text = "保持顺畅 /// KEEP IT SMOOTH /// 请勿打扰 /// DO NOT DISTURB /// 有味道的音乐 /// SH*T HAPPENS & MUSIC PLAYS /// "

    // Repeat content enough times to ensure no gaps during animation
    const content = Array(8).fill(text).join("")

    return (
        <div className={styles.marquee}>
            <div className={styles.content}>
                {content}
            </div>
        </div>
    )
}
