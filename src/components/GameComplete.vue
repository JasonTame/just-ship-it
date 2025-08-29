<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <div class="text-6xl mb-4">🏆</div>
        <h2 class="text-2xl font-bold pixel-font text-gray-800 mb-2">
          Game Complete!
        </h2>
        <p class="text-gray-600 mb-6">
          You've completed all 10 attempts. Here's how you did:
        </p>
        
        <!-- Final Stats -->
        <div class="space-y-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-2xl font-bold pixel-font text-blue-600">
              ${{ finalScore }}
            </div>
            <div class="text-sm text-gray-600">Final Score</div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-50 rounded-lg p-3">
              <div class="font-bold text-lg pixel-font text-green-600">
                {{ bestDistance }}m
              </div>
              <div class="text-xs text-gray-600">Best Distance</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-3">
              <div class="font-bold text-lg pixel-font text-yellow-600">
                ${{ totalEarned }}
              </div>
              <div class="text-xs text-gray-600">Total Earned</div>
            </div>
          </div>
        </div>
        
        <!-- Performance message -->
        <div class="mb-6 p-4 rounded-lg" :class="performanceClass">
          <div class="font-bold mb-1">{{ performanceTitle }}</div>
          <div class="text-sm">{{ performanceMessage }}</div>
        </div>
        
        <!-- Actions -->
        <div class="space-y-3">
          <button
            @click="gameStore.resetGame"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold pixel-font rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            @click="shareScore"
            class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Share Score
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

const finalScore = computed(() => {
  return gameStore.totalMoney
})

const bestDistance = computed(() => {
  return Math.max(...gameStore.attemptHistory.map(a => a.distance))
})

const totalEarned = computed(() => {
  return gameStore.attemptHistory.reduce((sum, attempt) => sum + attempt.moneyEarned, 0)
})

const performanceClass = computed(() => {
  if (finalScore.value >= 6000) return 'bg-green-100 text-green-800'
  if (finalScore.value >= 4000) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
})

const performanceTitle = computed(() => {
  if (finalScore.value >= 6000) return 'Master Sailor! 🌟'
  if (finalScore.value >= 4000) return 'Good Captain! ⭐'
  return 'Learning Sailor 📚'
})

const performanceMessage = computed(() => {
  if (finalScore.value >= 6000) return 'Perfect balance! You upgraded wisely while keeping money for the final score.'
  if (finalScore.value >= 4000) return 'Good strategy! You found the right balance between upgrades and saving.'
  return 'Try balancing upgrades with saving money for a higher final score!'
})

function shareScore() {
  const text = `I just scored $${finalScore.value} in Just Ship It! My best distance was ${bestDistance.value}m. Can you beat it? 🚢`
  
  if (navigator.share) {
    navigator.share({
      title: 'Just Ship It - My Score',
      text: text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(text)
    alert('Score copied to clipboard!')
  }
}
</script>
