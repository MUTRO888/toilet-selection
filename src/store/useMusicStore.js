import { create } from 'zustand'

const useMusicStore = create((set) => ({
  title: 'Smooth Operator',
  artist: 'Sade',
  coverImage: null,
  reviewText: 'Toilet Review: This track is smoother than 2-ply.',
  isLoading: false,

  trackDuration: 0,
  segmentStart: 0,
  segmentEnd: 30,

  exportState: 'idle',
  exportProgress: 0,

  setMusicInfo: (title, artist) => set({ title, artist }),
  setCoverImage: (coverImage) => set({ coverImage }),
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
