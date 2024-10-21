<template>
  <div class="game-view">
    <div class="game-board">
      <div class="left-panel">
        <DungeonTree :dungeon="gameData.dungeon" :currentLevel="currentLevel" :currentChamber="currentChamber" />
        <MonsterHealthBar 
          :monsterName="currentMonster.name"
          :currentHealth="currentMonster.currentHealth"
          :maxHealth="currentMonster.maxHealth"
        />
      </div>
      <div class="main-panel">
        <Chamber :chamberNumber="currentChamber" @chamber-completed="nextChamber" />
      </div>
    </div>
    <CharacterBoard :character="currentCharacter" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Chamber from '../components/Chamber.vue';
import CharacterBoard from '../components/CharacterBoard.vue';
import DungeonTree from '../components/DungeonTree.vue';
import gameData from '../data/game-data.json';
import MonsterHealthBar from '../components/MonsterHealthBar.vue';

const currentLevel = ref(1);
const currentChamber = ref(1);
const currentCharacter = ref(gameData.characters[0]); // Sélectionne le premier personnage par défaut

const currentMonster = ref({
  name: "Gobelin",
  currentHealth: 20,
  maxHealth: 30
});

function nextChamber() {
  const currentFloor = gameData.dungeon.floors.find(floor => floor.level === currentLevel.value);
  if (currentChamber.value < currentFloor.rooms.length) {
    currentChamber.value++;
  } else {
    // Passer au niveau suivant
    if (currentLevel.value < gameData.dungeon.floors.length) {
      currentLevel.value++;
      currentChamber.value = 1;
    } else {
      // Le donjon est terminé
      alert("Félicitations ! Vous avez terminé le donjon !");
    }
  }
}
</script>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: var(--color-background);
}

.game-board {
  display: flex;
  gap: 20px;
  max-width: 1800px;
  width: 100%;
  margin-bottom: 20px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 300px;
}

.main-panel {
  flex: 3;
}

:deep(.dungeon-tree),
:deep(.monster-health-bar),
:deep(.chamber),
:deep(.character-board) {
  background-color: var(--color-dark-gray);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

:deep(.dungeon-tree):hover,
:deep(.monster-health-bar):hover,
:deep(.chamber):hover,
:deep(.character-board):hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

:deep(.character-board) {
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column; /* Changé de grid à flex avec direction column */
  gap: 20px;
}

:deep(.gauge) {
  height: 25px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12.5px;
  overflow: hidden;
  position: relative;
}

:deep(.gauge-points) {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 5px;
}

:deep(.point) {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin: 0 2px;
  transition: all 0.3s ease;
}

:deep(.point.filled) {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

:deep(.exp-gauge .point.filled) { background-color: #64B5F6; }
:deep(.hp-gauge .point.filled) { background-color: #EF5350; }
:deep(.armor-gauge .point.filled) { background-color: #90A4AE; }
:deep(.gold-gauge .point.filled) { background-color: #FFD54F; }
:deep(.rations-gauge .point.filled) { background-color: #8D6E63; }

:deep(.potion-indicator .point) {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

:deep(.potion-indicator .point.filled) {
  box-shadow: 0 0 10px currentColor;
}
</style>
