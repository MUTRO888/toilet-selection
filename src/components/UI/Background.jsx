import useMusicStore from '../../store/useMusicStore'
import styles from './Background.module.css'

export default function Background() {
    const coverImage = useMusicStore((state) => state.coverImage)

    return (
        <div className={styles.background} data-export-layer="background">
            {coverImage ? (
                <img
                    src={coverImage}
                    alt=""
                    className={styles.coverBlur}
                />
            ) : (
                <div className={styles.fallback} />
            )}
        </div>
    )
}
