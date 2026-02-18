import { create } from 'zustand'

function extractDominantColor(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = 8
                canvas.height = 8
                const ctx = canvas.getContext('2d', { willReadFrequently: true })
                ctx.drawImage(img, 0, 0, 8, 8)
                const { data } = ctx.getImageData(0, 0, 8, 8)

                let bestR = 200, bestG = 200, bestB = 200, maxSat = -1
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2]
                    const max = Math.max(r, g, b)
                    const min = Math.min(r, g, b)
                    const sat = max === 0 ? 0 : (max - min) / max
                    if (sat > maxSat) {
                        maxSat = sat
                        bestR = r; bestG = g; bestB = b
                    }
                }
                resolve({ r: bestR, g: bestG, b: bestB })
            } catch {
                resolve(null)
            }
        }
        img.onerror = () => resolve(null)
        img.src = imageUrl
    })
}

const useMusicStore = create((set) => ({
  title: 'Smooth Operator',
  artist: 'Sade',
  coverImage: null,
  themeColor: null,
  reviewText: 'Toilet Review: This track is smoother than 2-ply.',
  isLoading: false,

  trackDuration: 0,
  segmentStart: 0,
  segmentEnd: 30,

  exportState: 'idle',
  exportProgress: 0,

  setMusicInfo: (title, artist) => set({ title, artist }),
  setCoverImage: (coverImage) => {
    set({ coverImage })
    if (coverImage) {
      extractDominantColor(coverImage).then(c => set({ themeColor: c }))
    } else {
      set({ themeColor: null })
    }
  },
  setReviewText: (reviewText) => set({ reviewText }),
  setLoading: (isLoading) => set({ isLoading }),

  setSegment: (segmentStart, segmentEnd) => set({ segmentStart, segmentEnd }),
  setExportState: (exportState) => set({ exportState }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  resetExport: () => set({ exportState: 'idle', exportProgress: 0 }),

  parseAppleMusicLink: async (url) => {
    set({ isLoading: true })
    try {
      const songIdMatch = url.match(/[?&]i=(\d+)/)
      const albumIdMatch = url.match(/\/album\/[^/]+\/(\d+)/)

      const id = songIdMatch ? songIdMatch[1] : albumIdMatch ? albumIdMatch[1] : null
      if (!id) throw new Error('Invalid Apple Music URL')

      const apiUrl = `https://itunes.apple.com/lookup?id=${id}&entity=song&country=CN`

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.resultCount > 0) {
        const track = data.results.find(r => r.wrapperType === 'track') || data.results[0]
        const title = track.trackName || track.collectionName || 'Unknown'
        const artist = track.artistName || 'Unknown'
        const artwork = track.artworkUrl100?.replace('100x100bb', '1024x1024bb') || null
        const trackDuration = track.trackTimeMillis ? track.trackTimeMillis / 1000 : 0

        set({
          title,
          artist,
          coverImage: artwork,
          trackDuration,
          segmentStart: 0,
          segmentEnd: Math.min(30, trackDuration),
          isLoading: false,
        })

        if (artwork) {
          extractDominantColor(artwork).then(c => set({ themeColor: c }))
        }
      } else {
        throw new Error('No results found')
      }
    } catch (error) {
      console.error('Apple Music parse error:', error)
      set({ isLoading: false })
    }
  },
}))

export default useMusicStore
