import { useState } from 'react'
import useMusicStore from '../../store/useMusicStore'
import styles from './InputOverlay.module.css'

export default function InputOverlay() {
    const [url, setUrl] = useState('')
    const { parseAppleMusicLink, isLoading } = useMusicStore()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (url.trim()) {
            parseAppleMusicLink(url.trim())
            setUrl('')
        }
    }

    return (
        <div className={styles.overlay}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Apple Music link..."
                    className={styles.input}
                    disabled={isLoading}
                />
                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? '...' : 'GO'}
                </button>
            </form>
            <div className={styles.hint}>
                Paste an Apple Music song link to generate your poster
            </div>
        </div>
    )
}
