/**
 * Scene Configuration
 * Centralized constants for 3D scene layout and visual parameters
 */

export const SCENE = {
    RECORD_RADIUS: 3.5,
    TEXT_RADIUS: 3.6,
    VINYL_Y: -0.6,
    TEXT_ELEVATION: 0.15,

    CAMERA: {
        POSITION: [0, 9, 10],
        FOV: 40,
        LOOK_AT: [0, 0, 0]
    },

    ROTATION_SPEED: 0.006
}

export const COLORS = {
    HIGHLIGHT: '#ccff00',
    VINYL: '#111111',
    ACCENT: '#4d4dff',
    BACKGROUND: '#111'
}

export const LAYOUT = {
    CARD_WIDTH: 540,
    CARD_HEIGHT: 960,
    SAFE_AREA_BOTTOM: 180
}
