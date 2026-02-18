import styles from './ReviewDisplay.module.css'
import useMusicStore from '../../store/useMusicStore'

export default function ReviewDisplay() {
    const reviewText = useMusicStore(state => state.reviewText)

    return (
        <div className={styles.container}>
            <div className={styles.label}>厕评</div>
            <p className={styles.text}>{reviewText?.trim() || "Listening..."}</p>
        </div>
    )
}
