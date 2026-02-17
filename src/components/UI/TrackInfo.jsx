import useMusicStore from '../../store/useMusicStore'
import styles from './TrackInfo.module.css'

export default function TrackInfo() {
    const { title, artist, coverImage } = useMusicStore()

    return (
        <div className={styles.wrap}>
            {coverImage && (
                <img src={coverImage} alt="" className={styles.cover} />
            )}
            <div className={styles.meta}>
                <span className={styles.title}>{title}</span>
                <span className={styles.artist}>{artist}</span>
            </div>
        </div>
    )
}
