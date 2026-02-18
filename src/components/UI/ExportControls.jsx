import { useEffect, useCallback, useState } from 'react'
import useMusicStore from '../../store/useMusicStore'
import AudioSegmentSelector from './AudioSegmentSelector'
import styles from './ExportControls.module.css'

const STAGE_LABELS = {
    preparing: 'Preparing...',
    starting: 'Starting...',
    playing: 'Starting playback...',
    recording: 'Recording...',
    processing: 'Processing video...',
    saving: 'Saving...',
    done: 'Complete',
    error: 'Export failed',
}

export default function ExportControls() {
    const {
        title, artist, trackDuration,
        segmentStart, segmentEnd,
        exportState, exportProgress,
        setExportState, setExportProgress, resetExport,
    } = useMusicStore()

    const [errorDetail, setErrorDetail] = useState(null)

    useEffect(() => {
        if (!window.electronAPI) return

        window.electronAPI.onExportProgress(({ stage, percent }) => {
            setExportState(stage)
            setExportProgress(percent / 100)
        })
    }, [setExportState, setExportProgress])

    const handleExport = useCallback(async () => {
        if (!window.electronAPI || !trackDuration) return

        const container = document.getElementById('phone-container')
        if (!container) return

        const rect = container.getBoundingClientRect()
        const containerRect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
        }

        setExportState('preparing')
        setExportProgress(0)
        setErrorDetail(null)

        const result = await window.electronAPI.exportVideo({
            songName: title,
            artistName: artist,
            startSeconds: segmentStart,
            endSeconds: segmentEnd,
            containerRect,
        })

        if (!result.success && result.error !== 'Cancelled') {
            if (result.error?.includes('SONG_NOT_IN_LIBRARY')) {
                setErrorDetail(`"${title}" not found in Music.app library. Add the song to your library first.`)
            } else {
                setErrorDetail(result.error || 'Unknown error')
            }
            setExportState('error')
        }
    }, [title, artist, trackDuration, segmentStart, segmentEnd, setExportState, setExportProgress])

    const handleCancel = useCallback(() => {
        if (window.electronAPI) {
            window.electronAPI.cancelExport()
        }
        resetExport()
    }, [resetExport])

    const isBusy = ['preparing', 'starting', 'playing', 'recording', 'processing', 'saving'].includes(exportState)
    const isDone = exportState === 'done'
    const isError = exportState === 'error'

    return (
        <div className={styles.wrap}>
            <span className="section-label">Export</span>

            <AudioSegmentSelector />

            {isBusy && (
                <div className={styles.progressWrap}>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${exportProgress * 100}%` }}
                        />
                    </div>
                    <span className={styles.progressLabel}>
                        {STAGE_LABELS[exportState] || `${Math.round(exportProgress * 100)}%`}
                    </span>
                </div>
            )}

            {isError && (
                <span className={styles.errorText}>
                    {errorDetail || 'Export failed. Please try again.'}
                </span>
            )}

            <div className={styles.actions}>
                {isBusy ? (
                    <button className={styles.button} onClick={handleCancel}>
                        Cancel
                    </button>
                ) : isDone ? (
                    <button className={styles.button} onClick={resetExport}>
                        New Export
                    </button>
                ) : (
                    <button
                        className={styles.button}
                        onClick={handleExport}
                        disabled={!trackDuration}
                    >
                        Export Video
                    </button>
                )}
            </div>
        </div>
    )
}
