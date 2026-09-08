export type SoundName = 'add' | 'remove' | 'login' | 'logout' | 'error' | 'toggleOn' | 'toggleOff' | 'open' | 'select'

interface Note {
  hz: number
  at: number
  duration: number
  volume?: number
  type?: OscillatorType
}

const MASTER_VOLUME = 0.16

const RECIPES: Record<SoundName, Note[]> = {
  add: [
    { hz: 523, at: 0, duration: 0.1 },
    { hz: 784, at: 0.09, duration: 0.16 },
  ],
  remove: [
    { hz: 784, at: 0, duration: 0.1 },
    { hz: 523, at: 0.09, duration: 0.16 },
  ],
  login: [
    { hz: 660, at: 0, duration: 0.13 },
    { hz: 880, at: 0.16, duration: 0.13 },
    { hz: 1175, at: 0.32, duration: 0.18, volume: 0.8 },
  ],
  logout: [
    { hz: 880, at: 0, duration: 0.1, volume: 0.6 },
    { hz: 660, at: 0.09, duration: 0.14, volume: 0.6 },
  ],
  error: [{ hz: 400, at: 0, duration: 0.07, volume: 0.7, type: 'triangle' }],
  toggleOn: [{ hz: 620, at: 0, duration: 0.07, volume: 0.7, type: 'triangle' }],
  toggleOff: [{ hz: 400, at: 0, duration: 0.07, volume: 0.7, type: 'triangle' }],
  open: [{ hz: 880, at: 0, duration: 0.05, volume: 0.35 }],
  select: [
    { hz: 660, at: 0, duration: 0.06, volume: 0.45 },
    { hz: 880, at: 0.06, duration: 0.08, volume: 0.4 },
  ],
}

let context: AudioContext | null = null
let isEnabled = () => true

export function configureSounds(enabled: () => boolean) {
  isEnabled = enabled
  unlockOnFirstGesture()
}

// O navegador só libera áudio depois de um gesto real (clique ou tecla).
// Passar o mouse não conta, então destravamos no primeiro gesto da sessão.
function unlockOnFirstGesture() {
  if (typeof window === 'undefined') return
  const unlock = () => {
    getContext()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock, { passive: true })
}

function getContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

let noiseBuffer: AudioBuffer | null = null

// Ruído marrom (branco integrado): grave e macio, parece vento; o branco puro soa como chiado.
function getNoiseBuffer(ctx: AudioContext) {
  if (noiseBuffer) return noiseBuffer
  const length = ctx.sampleRate * 2
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  return noiseBuffer
}

const WHOOSH_GAP = 0.09
let lastWhooshAt = 0

/**
 * Sopro curto: ruído branco por um filtro passa-banda que sobe e desce.
 * `pitch` (0 a 1) desloca o centro do filtro, para uma fileira soar como escala.
 */
export function playWhoosh(pitch = 0.5) {
  if (!isEnabled()) return
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  if (now - lastWhooshAt < WHOOSH_GAP) return
  lastWhooshAt = now

  const duration = 1.25
  const attack = 0.35
  const floor = 180 + pitch * 120
  const ceiling = floor * 5

  const source = ctx.createBufferSource()
  source.buffer = getNoiseBuffer(ctx)
  source.playbackRate.value = 0.9 + pitch * 0.2

  // Só um passa-baixa que abre e fecha: sem ressonância não aparece nota nenhuma.
  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.Q.value = 0.3
  lowpass.frequency.setValueAtTime(floor, now)
  lowpass.frequency.exponentialRampToValueAtTime(ceiling, now + attack + 0.1)
  lowpass.frequency.exponentialRampToValueAtTime(floor, now + duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(MASTER_VOLUME * 0.17, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(lowpass).connect(gain).connect(ctx.destination)
  source.start(now)
  source.stop(now + duration + 0.02)
}

export function playSound(name: SoundName) {
  if (!isEnabled()) return
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  for (const note of RECIPES[name]) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = note.type ?? 'sine'
    oscillator.frequency.value = note.hz

    const start = now + note.at
    const end = start + note.duration
    const peak = MASTER_VOLUME * (note.volume ?? 1)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(end + 0.02)
  }
}
