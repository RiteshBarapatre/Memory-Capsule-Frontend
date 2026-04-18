const hasAudioContext = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
let audioContext = null

function getAudioContext() {
  if (!hasAudioContext) return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function playTone({ frequency = 440, type = 'sine', duration = 0.16, volume = 0.08, detune = 0 }) {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const now = ctx.currentTime
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  oscillator.detune.setValueAtTime(detune, now)

  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

export function playUIAudio(variation = 'tab') {
  switch (variation) {
    case 'step':
      playTone({ frequency: 420, type: 'triangle', duration: 0.14, volume: 0.08 })
      playTone({ frequency: 660, type: 'square', duration: 0.12, volume: 0.05, detune: 20 })
      break
    case 'confirm':
      playTone({ frequency: 320, type: 'sine', duration: 0.18, volume: 0.1 })
      playTone({ frequency: 520, type: 'triangle', duration: 0.18, volume: 0.06, detune: 30 })
      break
    case 'danger':
      playTone({ frequency: 200, type: 'sawtooth', duration: 0.18, volume: 0.08 })
      playTone({ frequency: 120, type: 'square', duration: 0.14, volume: 0.05, detune: -20 })
      break
    default:
      playTone({ frequency: 520, type: 'sawtooth', duration: 0.12, volume: 0.08 })
      playTone({ frequency: 740, type: 'triangle', duration: 0.1, volume: 0.04, detune: 20 })
      break
  }
}
