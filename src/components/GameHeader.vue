<template>
  <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
    <div class="grid grid-cols-3 gap-6">
      <div class="text-center">
        <div class="text-4xl font-bold text-slate-800 font-mono">{{ gameStore.currentAttempt }}/10</div>
        <div class="text-sm text-slate-600 font-medium">Attempts</div>
      </div>

      <div class="text-center">
        <div class="text-4xl font-bold text-emerald-600 font-mono">${{ gameStore.totalMoney }}</div>
        <div class="text-sm text-slate-600 font-medium">Money</div>
      </div>

      <div class="text-center">
        <div class="text-4xl font-bold text-amber-600 font-mono">{{ gameStore.attemptsRemaining }}</div>
        <div class="text-sm text-slate-600 font-medium">Remaining</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore()
</script>
