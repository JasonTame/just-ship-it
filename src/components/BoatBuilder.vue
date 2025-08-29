<template>
  <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
    <div class="text-center mb-6">
      <h3 class="text-xl font-bold text-slate-800">Boat Builder</h3>
      <p class="text-sm text-slate-600">Upgrade your boat parts to sail further!</p>
    </div>
    
    <!-- Boat visualization with improved colors -->
    <div class="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div class="text-center">
        <div class="text-4xl mb-2 animate-float">⛵</div>
        <div class="text-sm text-slate-700 font-mono font-semibold">
          Total Power: {{ totalPower.toFixed(1) }}x
        </div>
        <div class="w-full bg-slate-200 rounded-full h-3 mt-3">
          <div 
            class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            :style="{ width: Math.min(totalPower * 10, 100) + '%' }"
          />
        </div>
      </div>
    </div>
    
    <!-- Horizontal layout for part upgrades -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6">
      <PartUpgrade
        v-for="(partName, index) in partNames"
        :key="partName"
        :part-name="partName"
        :part-data="gameStore.boat[partName]"
        :upgrade-cost="gameStore.getUpgradeCost(partName)"
        :can-upgrade="gameStore.canUpgrade(partName)"
        :icon="partIcons[partName]"
        :description="partDescriptions[partName]"
        @upgrade="handleUpgrade"
        :style="{ animationDelay: index * 100 + 'ms' }"
        class="animate-fade-in"
      />
    </div>
    
    <!-- Upgrade status display -->
    <div class="mb-4 p-3 rounded-lg border" :class="upgradeStatusClasses">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="text-lg" :class="upgradeStatusIcon.class">{{ upgradeStatusIcon.icon }}</div>
          <div class="text-sm" :class="upgradeStatusText.class">
            <strong>{{ upgradeStatusText.title }}</strong> {{ upgradeStatusText.message }}
          </div>
        </div>
        <div class="text-xs font-mono" :class="upgradeStatusText.class">
          {{ gameStore.upgradesThisAttempt }}/{{ gameStore.maxUpgradesThisAttempt === 999 ? '∞' : gameStore.maxUpgradesThisAttempt }}
        </div>
      </div>
    </div>

    <!-- Enhanced strategy hint with better contrast -->
    <div class="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
      <div class="flex items-start space-x-3">
        <div class="text-blue-600 mt-0.5 text-lg">💡</div>
        <div class="text-sm text-slate-700">
                    <strong class="text-slate-800">Strategy Tips:</strong>
          <ul class="mt-1 space-y-1">
            <li>• Each part has hidden effectiveness (50%-200%)</li>
            <li>• Upgrade allowance increases as you progress: 1→2→3→∞</li>
            <li>• Higher upgrade levels give increasingly better returns</li>
            <li>• Upgrade costs have increased significantly - spend wisely!</li>
            </ul>
          <div class="mt-2 text-xs text-slate-600">
            Analyze your sailing results to discover which parts work best for your boat.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import PartUpgrade from './PartUpgrade.vue'

const gameStore = useGameStore()

const partNames = ['hull', 'sail', 'engine', 'steering'] as const

const partIcons = {
  hull: '🚢',
  sail: '⛵',
  engine: '⚙️',
  steering: '🎯'
}

const partDescriptions = {
  hull: 'Stronger hulls can handle rougher waters and go further',
  sail: 'Better sails catch more wind power for speed',
  engine: 'Powerful engines provide extra thrust when wind fails',
  steering: 'Precise steering helps navigate efficiently through currents'
}

// Calculate total boat power for visualization (matching new calculation)
const totalPower = computed(() => {
  let power = 1
  Object.values(gameStore.boat).forEach(part => {
    const levelMultiplier = part.level * (part.level + 1) * 0.15
    power += levelMultiplier * part.hiddenMultiplier
  })
  return power
})

// Upgrade status display logic
const upgradeStatusClasses = computed(() => {
  const hasUpgradesLeft = gameStore.upgradesThisAttempt < gameStore.maxUpgradesThisAttempt
  return hasUpgradesLeft 
    ? 'bg-green-50 border-green-200' 
    : 'bg-amber-50 border-amber-200'
})

const upgradeStatusIcon = computed(() => {
  const hasUpgradesLeft = gameStore.upgradesThisAttempt < gameStore.maxUpgradesThisAttempt
  return hasUpgradesLeft
    ? { icon: '✅', class: 'text-green-600' }
    : { icon: '⚠️', class: 'text-amber-600' }
})

const upgradeStatusText = computed(() => {
  const hasUpgradesLeft = gameStore.upgradesThisAttempt < gameStore.maxUpgradesThisAttempt
  const maxUpgrades = gameStore.maxUpgradesThisAttempt
  const used = gameStore.upgradesThisAttempt
  
  if (hasUpgradesLeft) {
    const remaining = maxUpgrades === 999 ? 'unlimited' : maxUpgrades - used
    return {
      title: 'Upgrades Available:',
      message: maxUpgrades === 999 ? 'Unlimited upgrades this attempt!' : `${remaining} upgrade${remaining !== 1 ? 's' : ''} remaining this attempt`,
      class: 'text-green-800'
    }
  } else {
    return {
      title: 'Upgrade limit reached!',
      message: 'Launch your boat to continue upgrading.',
      class: 'text-amber-800'
    }
  }
})

function handleUpgrade(partName: string) {
  const success = gameStore.upgradePart(partName as keyof typeof gameStore.boat)
  if (success) {
    // Add visual feedback for successful upgrade
    console.log('[v0] Successfully upgraded:', partName)
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
</style>
