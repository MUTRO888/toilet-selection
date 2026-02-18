import { useRef, useEffect, useCallback } from 'react'
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

    const recorderRef = useRef(null)
    const chunksRef = useRef([])

    useEffect(() => {
        if (!window.electronAPI) return

        window.electronAPI.onStartRecording(async ({ sourceId }) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: sourceId,
                        },
                    },
                })

                chunksRef.current = []
                const recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                })

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data)
                }

                recorder.start(100)
                recorderRef.current = recorder
            } catch (err) {
                console.error('MediaRecorder setup failed:', err)
            }
        })

        window.electronAPI.onStopRecording(async () => {
            const recorder = recorderRef.current
            if (!recorder) return

            await new Promise((resolve) => {
                recorder.onstop = resolve
                recorder.stop()
            })

            recorder.stream.getTracks().forEach(t => t.stop())
            recorderRef.current = null

            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            const arrayBuffer = await blob.arrayBuffer()
            window.electronAPI.sendRecordedBuffer(arrayBuffer)
            chunksRef.current = []
        })

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
            dpr: window.devicePixelRatio || 2,
        }

        setExportState('preparing')
        setExportProgress(0)

        const result = await window.electronAPI.exportVideo({
            songName: title,
            artistName: artist,
            startSeconds: segmentStart,
            endSeconds: segmentEnd,
            containerRect,
        })

        if (!result.success) {
            console.error('Export failed:', result.error)
            setExportState('error')
        }
    }, [title, artist, trackDuration, segmentStart, segmentEnd, setExportState, setExportProgress])

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
                <span className={styles.errorText}>Export failed. Please try again.</span>
            )}

            <div className={styles.actions}>
                {isBusy ? (
                    <button className={styles.button} onClick={resetExport}>
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
