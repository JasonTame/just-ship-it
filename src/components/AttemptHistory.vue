<template>
  <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-slate-800">Attempt History</h3>
      <button
        @click="expanded = !expanded"
        class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
      >
        <span>{{ expanded ? 'Hide' : 'Show' }} All</span>
        <svg 
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    <!-- Latest Attempt - Always Visible -->
    <div v-if="gameStore.attemptHistory.length > 0" class="mb-4">
      <div class="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">Latest Attempt</div>
      <div class="border border-blue-200 rounded-lg p-3 bg-blue-50">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="text-lg font-bold font-mono text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center border border-blue-200">
              {{ gameStore.attemptHistory[gameStore.attemptHistory.length - 1].attempt }}
            </div>
            <div>
              <div class="font-medium text-slate-800 text-sm">
                {{ gameStore.attemptHistory[gameStore.attemptHistory.length - 1].distance }}m sailed
              </div>
              <div class="text-xs text-slate-600">
                {{ gameStore.attemptHistory[gameStore.attemptHistory.length - 1].milestonesHit.length }} milestone{{ gameStore.attemptHistory[gameStore.attemptHistory.length - 1].milestonesHit.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-emerald-600 font-mono text-lg">
              +${{ gameStore.attemptHistory[gameStore.attemptHistory.length - 1].moneyEarned }}
            </div>
          </div>
        </div>
        
        <!-- Part upgrades for latest attempt -->
        <div class="mb-2">
          <div class="text-xs text-slate-600 mb-1">Parts:</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(level, partName) in gameStore.attemptHistory[gameStore.attemptHistory.length - 1].boatState"
              :key="partName"
              class="inline-flex items-center text-xs px-2 py-0.5 rounded-full border"
              :class="level > 0 
                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                : 'bg-gray-100 text-gray-500 border-gray-300'"
            >
              {{ getPartIcon(partName) }} {{ partName }} {{ level }}
            </span>
          </div>
        </div>
        
        <!-- Milestones hit for latest attempt -->
        <div v-if="gameStore.attemptHistory[gameStore.attemptHistory.length - 1].milestonesHit.length > 0" class="flex flex-wrap gap-1 mb-2">
          <span
            v-for="milestoneIndex in gameStore.attemptHistory[gameStore.attemptHistory.length - 1].milestonesHit"
            :key="milestoneIndex"
            class="inline-flex items-center bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full border border-amber-300"
          >
            🏆 {{ gameStore.milestones[milestoneIndex].label }}
          </span>
        </div>
        
        <!-- Progress bar for latest attempt -->
        <div class="w-full bg-slate-200 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
            :style="{ width: Math.min((gameStore.attemptHistory[gameStore.attemptHistory.length - 1].distance / 800) * 100, 100) + '%' }"
          />
        </div>
      </div>
    </div>
    
    <!-- Previous Attempts - Expandable -->
    <div v-if="expanded && gameStore.attemptHistory.length > 1" class="space-y-2 transition-all duration-300">
      <div class="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">Previous Attempts</div>
      <div
        v-for="(attempt, index) in gameStore.attemptHistory.slice(0, -1).reverse()"
        :key="attempt.attempt"
        class="border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-all duration-200 hover:shadow-md bg-slate-50"
        :style="{ animationDelay: index * 50 + 'ms' }"
        :class="{ 'animate-slide-in': expanded }"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="text-sm font-bold font-mono text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center border border-blue-200">
              {{ attempt.attempt }}
            </div>
            <div>
              <div class="font-medium text-slate-800 text-sm">
                {{ attempt.distance }}m sailed
              </div>
              <div class="text-xs text-slate-600">
                {{ attempt.milestonesHit.length }} milestone{{ attempt.milestonesHit.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-emerald-600 font-mono text-sm">
              +${{ attempt.moneyEarned }}
            </div>
          </div>
        </div>
        
        <!-- Part upgrades for this attempt -->
        <div class="mb-2">
          <div class="text-xs text-slate-600 mb-1">Parts:</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(level, partName) in attempt.boatState"
              :key="partName"
              class="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full border"
              :class="level > 0 
                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                : 'bg-gray-100 text-gray-500 border-gray-300'"
            >
              {{ getPartIcon(partName) }} {{ partName }} {{ level }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-if="gameStore.attemptHistory.length === 0" class="text-center text-slate-500 py-8">
      <div class="text-4xl mb-2">🌊</div>
      <div class="text-sm">No attempts yet. Launch your boat to get started!</div>
    </div>
    
    <!-- Enhanced summary stats -->
    <div v-if="gameStore.attemptHistory.length > 0" class="mt-4 pt-4 border-t border-slate-200">
      <div class="grid grid-cols-2 gap-3 text-center">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div class="font-bold text-lg font-mono text-blue-600">
            {{ Math.max(...gameStore.attemptHistory.map(a => a.distance)) }}m
          </div>
          <div class="text-xs text-slate-600">Best Distance</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
          <div class="font-bold text-lg font-mono text-emerald-600">
            ${{ gameStore.attemptHistory.reduce((sum, a) => sum + a.moneyEarned, 0) }}
          </div>
          <div class="text-xs text-slate-600">Total Earned</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const expanded = ref(false)

function getPartIcon(partName: string): string {
  const icons = {
    hull: '🚢',
    sail: '⛵',
    engine: '⚙️',
    steering: '🎯'
  }
  return icons[partName as keyof typeof icons] || '❓'
}
</script>

<style scoped>
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
</style>
