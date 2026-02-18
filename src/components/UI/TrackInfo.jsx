import styles from './TrackInfo.module.css'
import useMusicStore from '../../store/useMusicStore'

export default function TrackInfo() {
    const { title, artist } = useMusicStore()

    return (
        <div className={styles.wrap}>
            <h2 className={styles.title}>{title}</h2>
            <h3 className={styles.artist}>{artist}</h3>
        </div>
    )
}
