import styles from './Marquee.module.css'
import useMusicStore from '../../store/useMusicStore'

export default function Marquee() {
    const text = "保持顺畅 /// KEEP IT SMOOTH /// 请勿打扰 /// DO NOT DISTURB /// 有味道的音乐 /// SH*T HAPPENS & MUSIC PLAYS /// "
    const exportState = useMusicStore(state => state.exportState)
    const paused = exportState !== 'idle'

    const content = Array(8).fill(text).join("")

    return (
        <div className={styles.marquee}>
            <div className={`${styles.content} ${paused ? styles.paused : ''}`}>
                {content}
            </div>
        </div>
    )
}
