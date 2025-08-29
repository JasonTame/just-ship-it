import { defineStore } from "pinia";
import { computed, ref } from "vue";

interface BoatPart {
  level: number;
  hiddenMultiplier: number;
}

interface Boat {
  hull: BoatPart;
  sail: BoatPart;
  engine: BoatPart;
  steering: BoatPart;
}

interface Milestone {
  distance: number;
  reward: number;
  label: string;
}

interface AttemptResult {
  attempt: number;
  distance: number;
  moneyEarned: number;
  milestonesHit: number[];
  boatState: {
    hull: number;
    sail: number;
    engine: number;
    steering: number;
  };
}

export const useGameStore = defineStore("game", () => {
  // State
  const currentAttempt = ref(1);
  const totalMoney = ref(100);
  const gameComplete = ref(false);
  const isLaunching = ref(false);
  const upgradesThisAttempt = ref(0);

  // Boat configuration with hidden multipliers
  const boat = ref<Boat>({
    hull: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 }, // 0.5x - 2.0x
    sail: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
    engine: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
    steering: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
  });

  // Milestones
  const milestones = ref<Milestone[]>([
    { distance: 100, reward: 50, label: "$50" },
    { distance: 200, reward: 100, label: "$100" },
    { distance: 400, reward: 200, label: "$200" },
    { distance: 800, reward: 1000, label: "$1000" },
  ]);

  // Attempt history
  const attemptHistory = ref<AttemptResult[]>([]);

  // Upgrade costs - increased by 30%+ and more expensive scaling for quadratic benefits
  const upgradeCosts = {
    hull: [0, 30, 70, 150, 320], // was [0, 20, 40, 80, 160]
    sail: [0, 25, 55, 120, 250], // was [0, 15, 30, 60, 120]
    engine: [0, 35, 80, 170, 350], // was [0, 25, 50, 100, 200]
    steering: [0, 20, 45, 95, 200], // was [0, 10, 20, 40, 80]
  };

  // Computed
  const attemptsRemaining = computed(() => 10 - currentAttempt.value + 1);
  const canLaunch = computed(() => !isLaunching.value && !gameComplete.value);

  // Calculate max upgrades allowed for current attempt
  const maxUpgradesThisAttempt = computed(() => {
    const attempt = currentAttempt.value;
    if (attempt <= 3) return 1; // Attempts 1-3: 1 upgrade
    if (attempt <= 6) return 2; // Attempts 4-6: 2 upgrades
    if (attempt <= 9) return 3; // Attempts 7-9: 3 upgrades
    return 999; // Attempt 10: unlimited
  });

  // Actions
  function calculateDistance(): number {
    const baseDistance = 90; // Fixed base distance
    let totalMultiplier = 1;

    // Apply part multipliers with increased effectiveness
    Object.values(boat.value).forEach((part) => {
      // Increased multiplier: each level adds more power, and it scales up
      const levelMultiplier = part.level * (part.level + 1) * 0.15; // Quadratic scaling
      totalMultiplier += levelMultiplier * part.hiddenMultiplier;
    });

    console.log("[v0] Distance calculation:", {
      baseDistance,
      totalMultiplier,
      finalDistance: Math.floor(baseDistance * totalMultiplier),
    });
    return Math.floor(baseDistance * totalMultiplier);
  }

  function launchBoat(): Promise<AttemptResult> {
    return new Promise((resolve) => {
      if (!canLaunch.value) {
        console.log("[v0] Cannot launch - game state:", {
          isLaunching: isLaunching.value,
          gameComplete: gameComplete.value,
        });
        return;
      }

      console.log(
        "[v0] Starting boat launch for attempt",
        currentAttempt.value
      );
      isLaunching.value = true;

      // Simulate launch delay
      setTimeout(() => {
        const distance = calculateDistance();
        const milestonesHit: number[] = [];
        let moneyEarned = 0;

        // Check milestones
        milestones.value.forEach((milestone, index) => {
          if (distance >= milestone.distance) {
            milestonesHit.push(index);
            moneyEarned += milestone.reward;
          }
        });

        // Update state
        totalMoney.value += moneyEarned;

        const result: AttemptResult = {
          attempt: currentAttempt.value,
          distance,
          moneyEarned,
          milestonesHit,
          boatState: {
            hull: boat.value.hull.level,
            sail: boat.value.sail.level,
            engine: boat.value.engine.level,
            steering: boat.value.steering.level,
          },
        };

        attemptHistory.value.push(result);
        console.log("[v0] Attempt completed:", result);

        // Check if game is complete
        if (currentAttempt.value >= 10) {
          gameComplete.value = true;
          console.log(
            "[v0] Game completed! Final score (current money):",
            totalMoney.value
          );
        } else {
          currentAttempt.value++;
          upgradesThisAttempt.value = 0; // Reset upgrades for next attempt
        }

        isLaunching.value = false;
        resolve(result);
      }, 2000); // 2 second launch animation
    });
  }

  function upgradePart(partName: keyof Boat): boolean {
    const part = boat.value[partName];
    const nextLevel = part.level + 1;

    // Check upgrade limit per attempt (sliding scale)
    if (upgradesThisAttempt.value >= maxUpgradesThisAttempt.value) {
      console.log(
        "[v0] Cannot upgrade - reached upgrade limit for this attempt:",
        {
          upgradesUsed: upgradesThisAttempt.value,
          maxAllowed: maxUpgradesThisAttempt.value,
          attempt: currentAttempt.value,
        }
      );
      return false;
    }

    if (nextLevel >= upgradeCosts[partName].length) {
      console.log("[v0] Cannot upgrade - already at max level:", partName);
      return false;
    }

    const cost = upgradeCosts[partName][nextLevel];
    if (totalMoney.value < cost) {
      console.log("[v0] Cannot upgrade - insufficient funds:", {
        partName,
        cost,
        available: totalMoney.value,
      });
      return false;
    }

    totalMoney.value -= cost;
    part.level = nextLevel;
    upgradesThisAttempt.value++;
    console.log("[v0] Upgraded part:", {
      partName,
      newLevel: nextLevel,
      cost,
      remainingMoney: totalMoney.value,
      upgradesThisAttempt: upgradesThisAttempt.value,
    });
    return true;
  }

  function getUpgradeCost(partName: keyof Boat): number {
    const nextLevel = boat.value[partName].level + 1;
    return upgradeCosts[partName][nextLevel] || 0;
  }

  function canUpgrade(partName: keyof Boat): boolean {
    const nextLevel = boat.value[partName].level + 1;
    const cost = getUpgradeCost(partName);
    return (
      upgradesThisAttempt.value < maxUpgradesThisAttempt.value &&
      nextLevel < upgradeCosts[partName].length &&
      totalMoney.value >= cost
    );
  }

  function resetGame(): void {
    console.log("[v0] Resetting game");
    currentAttempt.value = 1;
    totalMoney.value = 100;
    gameComplete.value = false;
    isLaunching.value = false;
    upgradesThisAttempt.value = 0;
    attemptHistory.value = [];

    // Reset boat with new random multipliers
    boat.value = {
      hull: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
      sail: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
      engine: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
      steering: { level: 0, hiddenMultiplier: Math.random() * 1.5 + 0.5 },
    };
  }

  return {
    // State
    currentAttempt,
    totalMoney,
    gameComplete,
    isLaunching,
    upgradesThisAttempt,
    boat,
    milestones,
    attemptHistory,

    // Computed
    attemptsRemaining,
    canLaunch,
    maxUpgradesThisAttempt,

    // Actions
    launchBoat,
    upgradePart,
    getUpgradeCost,
    canUpgrade,
    resetGame,
  };
});
