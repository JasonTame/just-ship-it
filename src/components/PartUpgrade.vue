<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors h-full">
    <div class="flex flex-col h-full">
      <!-- Part Info -->
      <div class="flex items-center space-x-3 mb-3">
        <div class="text-2xl">{{ icon }}</div>
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <h4 class="font-bold text-gray-800 capitalize pixel-font">{{ partName }}</h4>
            <div class="flex space-x-1">
              <div
                v-for="level in 4"
                :key="level"
                class="w-2 h-2 rounded-full border-2"
                :class="level <= partData.level 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-gray-100 border-gray-300'"
              />
            </div>
          </div>
          <p class="text-xs text-gray-600 mb-2">{{ description }}</p>
          <div class="text-sm text-gray-500">
            Level {{ partData.level }}/4
            
          </div>
        </div>
      </div>
      
      <!-- Upgrade Button - Full Width at Bottom -->
      <div class="mt-auto">
        <button
          @click="handleUpgrade"
          :disabled="!canUpgrade"
          class="w-full px-3 py-2 rounded-lg font-bold pixel-font text-sm transition-all duration-200"
          :class="canUpgrade 
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
        >
          <span v-if="partData.level >= 4">MAX</span>
          <span v-else-if="canUpgrade">
            Upgrade<br>
            <span class="text-xs">${{ upgradeCost }}</span>
          </span>
          <span v-else>
            Need<br>
            <span class="text-xs">${{ upgradeCost }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  partName: string
  partData: {
    level: number
    hiddenMultiplier: number
  }
  upgradeCost: number
  canUpgrade: boolean
  icon: string
  description: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  upgrade: [partName: string]
}>()

function handleUpgrade() {
  console.log('[v0] Upgrading part:', props.partName)
  emit('upgrade', props.partName)
}
</script>
