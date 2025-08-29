<template>
  <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
    
    <div class="relative p-4">
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="w-full h-auto border border-slate-300 rounded-lg"
      />
      
      <!-- Distance overlay with better contrast -->
      <div 
        v-if="currentDistance > 0"
        class="absolute top-6 left-6 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-mono shadow-lg"
        :class="{ 'animate-pulse': isAnimating }"
      >
        Distance: {{ Math.floor(currentDistance) }}m
      </div>
      
      <!-- Speed indicator -->
      <div 
        v-if="isAnimating"
        class="absolute top-6 right-6 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold animate-bounce shadow-lg"
      >
        Sailing! 🌊
      </div>

      
      <!-- Celebration particles for milestones -->
      <div 
        v-if="showCelebration"
        class="absolute inset-0 pointer-events-none"
      >
        <div
          v-for="particle in celebrationParticles"
          :key="particle.id"
          class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          :style="{ left: particle.x + 'px', top: particle.y + 'px', animationDelay: particle.delay + 'ms' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = 1200
const canvasHeight = 500
const currentDistance = ref(0)
const isAnimating = ref(false)
const showCelebration = ref(false)
const celebrationParticles = ref<Array<{ id: number, x: number, y: number, delay: number }>>([])

let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let boatX = 0
let boatY = 0
let targetDistance = 0
let animationSpeed = 2
let waveOffset = 0

// Boat sprite data (simple pixel art)
const boatSprite = {
  width: 32,
  height: 24,
  frames: [
    // Frame 1 - boat slightly tilted up
    [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '........wwwwwwww................',
      '.......wwwwwwwwww...............',
      '......wwwwwwwwwwww..............',
      '.....wwwwwwwwwwwwww.............',
      '....wwwwwwwwwwwwwwww............',
      '...wwwwwwwwwwwwwwwwww...........',
      '..wwwwwwwwwwwwwwwwwwww..........',
      '.wwwwwwwwwwwwwwwwwwwwww.........',
      'wwwwwwwwwwwwwwwwwwwwwwww........',
      'bbbbbbbbbbbbbbbbbbbbbbbb........',
      'bbbbbbbbbbbbbbbbbbbbbbbb........',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................'
    ],
    // Frame 2 - boat slightly tilted down
    [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '........wwwwwwww................',
      '.......wwwwwwwwww...............',
      '......wwwwwwwwwwww..............',
      '.....wwwwwwwwwwwwww.............',
      '....wwwwwwwwwwwwwwww............',
      '...wwwwwwwwwwwwwwwwww...........',
      '..wwwwwwwwwwwwwwwwwwww..........',
      '.wwwwwwwwwwwwwwwwwwwwww.........',
      'wwwwwwwwwwwwwwwwwwwwwwww........',
      'bbbbbbbbbbbbbbbbbbbbbbbb........',
      'bbbbbbbbbbbbbbbbbbbbbbbb........',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................'
    ]
  ]
}

// Milestone buoy positions
const buoyPositions = ref<Array<{ x: number, y: number, milestone: any }>>([])

onMounted(() => {
  ctx = canvasRef.value?.getContext('2d') as CanvasRenderingContext2D | null
  setupCanvas()
  calculateBuoyPositions()
  drawScene()
  // Start continuous wave animation
  startWaveAnimation()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

function setupCanvas() {
  if (!ctx) return
  
  // Set initial boat position - start at left edge, not at first milestone
  boatX = 24 // Start at left edge
  boatY = canvasHeight / 2 - boatSprite.height / 2
}

function calculateBuoyPositions() {
  // Proportional positions for 4 milestones based on actual distances (100m, 200m, 400m, 800m)
  const maxDistance = 800
  const usableWidth = canvasWidth - 48 // Leave 24px padding on each side
  
  buoyPositions.value = [
    { x: 24 + (100 / maxDistance) * usableWidth, y: canvasHeight * 0.39, milestone: gameStore.milestones[0] }, // 100m at 12.5%
    { x: 24 + (200 / maxDistance) * usableWidth, y: canvasHeight * 0.39, milestone: gameStore.milestones[1] }, // 200m at 25%
    { x: 24 + (400 / maxDistance) * usableWidth, y: canvasHeight * 0.39, milestone: gameStore.milestones[2] }, // 400m at 50%
    { x: 24 + (800 / maxDistance) * usableWidth, y: canvasHeight * 0.39, milestone: gameStore.milestones[3] }, // 800m at 100%
  ]
}

function drawScene() {
  if (!ctx) return
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Draw sky (top 40% of canvas)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.4)
  skyGradient.addColorStop(0, '#87CEEB')
  skyGradient.addColorStop(1, '#B0E0E6')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.4)
  
  // Draw ocean (bottom 60% of canvas) - much flatter
  const oceanGradient = ctx.createLinearGradient(0, canvasHeight * 0.4, 0, canvasHeight)
  oceanGradient.addColorStop(0, '#4682B4')
  oceanGradient.addColorStop(1, '#2F4F4F')
  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, canvasHeight * 0.4, canvasWidth, canvasHeight * 0.6)
  
  // Draw horizon line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, canvasHeight * 0.4)
  ctx.lineTo(canvasWidth, canvasHeight * 0.4)
  ctx.stroke()
  
  
  // Draw milestone buoys
  drawBuoys()
  
  // Draw boat
  drawBoat()
}

function drawBuoys() {
    buoyPositions.value.forEach(buoy => {
    if (!ctx) return
    const oceanSurface = canvasHeight * 0.39
    const time = Date.now() * 0.001
    const bobY = oceanSurface + Math.sin(time + buoy.x * 0.01) * 2 // Minimal bobbing
    
    // Draw buoy body
    ctx.fillStyle = '#FF6B6B'
    ctx.fillRect(buoy.x - 4, bobY, 8, 16)
    
    // Draw buoy top
    ctx.fillStyle = '#FFE66D'
    ctx.fillRect(buoy.x - 3, bobY - 2, 6, 4)
    
    // Draw money label
    ctx.fillStyle = '#FF6B6B'
    ctx.font = 'bold 15px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(buoy.milestone.label, buoy.x, bobY - 8)
  })
}

function drawBoat() {
  if (!ctx) return
  
  const frameIndex = Math.floor(Date.now() * 0.002) % 2 // Slower animation
  const frame = boatSprite.frames[frameIndex]
  
  const oceanSurface = canvasHeight * 0.42
  const time = Date.now() * 0.003
  const bobOffset = Math.sin(time) * 1 // Much smaller bobbing
  const currentBoatY = oceanSurface - boatSprite.height + bobOffset
  
  // Enhanced bobbing motion
  const tilt = isAnimating.value ? Math.sin(time * 2) * 0.1 : 0
  
  // Draw boat shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  for (let y = 0; y < frame.length; y++) {
    for (let x = 0; x < frame[y].length; x++) {
      const pixel = frame[y][x]
      if (pixel !== '.') {
        ctx.fillRect(boatX + x + 2, currentBoatY + y + 2, 1, 1)
      }
    }
  }
  
  // Draw boat with enhanced colors
  for (let y = 0; y < frame.length; y++) {
    for (let x = 0; x < frame[y].length; x++) {
      const pixel = frame[y][x]
      if (pixel !== '.') {
        let color = '#8B4513'
        if (pixel === 'w') color = '#F8F9FA' // Brighter white sail
        if (pixel === 'b') color = '#5D4037' // Richer brown hull
        
        ctx.fillStyle = color
        ctx.fillRect(boatX + x, currentBoatY + y + tilt, 1, 1)
      }
    }
  }
  
  // Add wake effect when moving
  if (isAnimating.value && boatX > 60) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(boatX - 10, boatY + 20)
    ctx.lineTo(boatX - 20, boatY + 25)
    ctx.moveTo(boatX - 10, boatY + 25)
    ctx.lineTo(boatX - 20, boatY + 30)
    ctx.stroke()
  }
}

function startWaveAnimation() {
  function animateWaves() {
    waveOffset += 0.02
    drawScene()
    requestAnimationFrame(animateWaves)
  }
  animateWaves()
}

function startAnimation(distance: number) {
  targetDistance = distance
  currentDistance.value = 0
  boatX = 24 // Start at left edge
  isAnimating.value = true
  showCelebration.value = false
  
  const maxDistance = 800 // Updated max distance for 800m milestone
  const usableWidth = canvasWidth - 48 // Same calculation as buoy positioning
  
  function animate() {
    if (currentDistance.value < targetDistance) {
      currentDistance.value += animationSpeed
      
      // Map distance to boat position using proportional scaling (same as buoys)
      const progress = Math.min(currentDistance.value / maxDistance, 1)
      boatX = 24 + progress * usableWidth
      
      drawScene()
      animationId = requestAnimationFrame(animate)
    } else {
      // Animation complete
      currentDistance.value = targetDistance
      isAnimating.value = false
      drawScene()
    }
  }
  
  animate()
}

defineExpose({
  startAnimation
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
