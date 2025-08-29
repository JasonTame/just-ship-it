<template>
  <div class="h-full flex items-center">
    <button
      @click="handleLaunch"
      :disabled="!gameStore.canLaunch"
      class="w-full py-6 px-6 text-2xl font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 shadow-lg"
      :class="gameStore.canLaunch 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl' 
        : 'bg-slate-400 text-slate-600 cursor-not-allowed shadow-sm'"
    >
      <span v-if="gameStore.isLaunching" class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sailing...
      </span>
      <span v-else-if="gameStore.gameComplete" class="text-slate-700">
        Game Complete!
      </span>
      <span v-else>
        Launch Boat! ⛵
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore()

const emit = defineEmits<{
  launch: [distance: number]
}>()

function handleLaunch() {
  if (!gameStore.canLaunch) return
  
  console.log('[v0] Starting launch sequence')
  
  gameStore.launchBoat().then(result => {
    console.log('[v0] Launch completed:', result)
    emit('launch', result.distance)
  }).catch(error => {
    console.error('[v0] Launch failed:', error)
  })
}
</script>
