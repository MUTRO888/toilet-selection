import { create } from 'zustand'

const useMusicStore = create((set) => ({
  title: 'Smooth Operator',
  artist: 'Sade',
  coverImage: null,
  isLoading: false,

  setMusicInfo: (title, artist) => set({ title, artist }),
  setCoverImage: (coverImage) => set({ coverImage }),
  setLoading: (isLoading) => set({ isLoading }),

  parseAppleMusicLink: async (url) => {
    set({ isLoading: true })
    try {
      const songIdMatch = url.match(/[?&]i=(\d+)/)
      const albumIdMatch = url.match(/\/album\/[^/]+\/(\d+)/)
      
      const id = songIdMatch ? songIdMatch[1] : albumIdMatch ? albumIdMatch[1] : null
      if (!id) throw new Error('Invalid Apple Music URL')

      // CORS Proxy fallback (uncomment if needed):
      // const proxyUrl = 'https://corsproxy.io/?'
      // const apiUrl = `${proxyUrl}https://itunes.apple.com/lookup?id=${id}&entity=song&country=CN`
      const apiUrl = `https://itunes.apple.com/lookup?id=${id}&entity=song&country=CN`
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (data.resultCount > 0) {
        const track = data.results.find(r => r.wrapperType === 'track') || data.results[0]
        const title = track.trackName || track.collectionName || 'Unknown'
        const artist = track.artistName || 'Unknown'
        const artwork = track.artworkUrl100?.replace('100x100bb', '1024x1024bb') || null
        
        set({ title, artist, coverImage: artwork, isLoading: false })
      } else {
        throw new Error('No results found')
      }
    } catch (error) {
      console.error('Apple Music parse error:', error)
      set({ isLoading: false })
    }
  }
}))

export default useMusicStore
