<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-100 to-blue-50">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Enhanced Game Title -->
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold text-slate-800 mb-2 drop-shadow-sm">
          Just Ship It! ⛵
        </h1>
        <p class="text-slate-600 text-lg">
          Sail as far as you can in 10 attempts. Upgrade wisely or just ship it!
        </p>
        <div class="mt-2 text-slate-500 text-sm">
          Strategic sailing game • Discover hidden part effectiveness • Maximize your score
        </div>
      </div>

      <!-- Game Stats and Launch Button - Above Canvas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <GameHeader />
        <LaunchButton @launch="handleLaunch" />
      </div>
      
      <!-- Main Canvas Area - Full Width -->
      <div class="mb-6">
        <GameCanvas ref="gameCanvasRef" />
      </div>
      
      <!-- Two Column Layout: Boat Builder + Attempt History -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Boat Builder (2/3 width) -->
        <div class="lg:col-span-2">
          <BoatBuilder />
        </div>
        
        <!-- Right Column: Attempt History (1/3 width) -->
        <div class="lg:col-span-1">
          <AttemptHistory />
        </div>
      </div>
      
      <!-- Game Complete Modal -->
      <GameComplete v-if="gameStore.gameComplete" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AttemptHistory from './components/AttemptHistory.vue'
import BoatBuilder from './components/BoatBuilder.vue'
import GameCanvas from './components/GameCanvas.vue'
import GameComplete from './components/GameComplete.vue'
import GameHeader from './components/GameHeader.vue'
import LaunchButton from './components/LaunchButton.vue'
import { useGameStore } from './stores/gameStore'

const gameStore = useGameStore()
const gameCanvasRef = ref<InstanceType<typeof GameCanvas> | null>(null)
const isLoading = ref(true)

onMounted(() => {
  // Simulate initial loading
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

async function handleLaunch(distance: number) {
  console.log('[v0] Launch triggered with distance:', distance)
  
  // Start canvas animation
  if (gameCanvasRef.value) {
    gameCanvasRef.value.startAnimation(distance)
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
