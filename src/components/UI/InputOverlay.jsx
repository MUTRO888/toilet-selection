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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e)
        }
    }

    return (
        <div className={styles.overlay}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste Apple Music Link..."
                    className={styles.input}
                    disabled={isLoading}
                />
                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? '...' : 'GO'}
                </button>
            </form>
            <div className={styles.hint}>
                Paste a link from Apple Music to load song info
            </div>
        </div>
    )
}
