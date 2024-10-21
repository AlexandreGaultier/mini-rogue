<template>
  <div class="chamber">
    <div class="tiles-grid">
      <div v-for="i in 9" :key="i" class="tile" :class="{ 'current': currentTile === i, 'available': isAvailableTile(i) }" @click="selectTile(i)">
        <template v-if="(tileRevealed(i) || isAvailableTile(i)) && tileContent(i)">
          <h3>{{ tileContent(i).name }}</h3>
          <template v-if="isAvailableTile(i) || currentTile === i">
            <p class="immediate-reward">{{ tileContent(i).immediateReward }}</p>
            <ul class="roll-rewards">
              <li v-for="(reward, roll) in tileContent(i).rollRewards" :key="roll">
                {{ roll }}: {{ reward }}
              </li>
            </ul>
            <div v-if="currentTile === i" class="tile-details">
              <button v-if="!diceResults[i]" @click.stop="rollDice(i)" :disabled="diceRolling[i]">Lancer le dé</button>
              <template v-else>
                <p class="dice-result">
                  Résultat : {{ diceResults[i] }}
                  <br>
                  Récompense : {{ tileContent(i).rollRewards[diceResults[i]] }}
                </p>
                <button v-if="!rewardsCollected[i]" @click.stop="collectReward(i)">Récupérer</button>
              </template>
            </div>
          </template>
        </template>
        <template v-else>
          ?
        </template>
      </div>
    </div>
    <button v-if="currentTile === 9 && rewardsCollected[9]" @click="completeChamber">Continuer</button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits } from 'vue';
import gameData from '../data/game-data.json';

const props = defineProps({
  chamberNumber: {
    type: Number,
    required: true
  }
});

const revealedTiles = ref([1]);
const diceResults = reactive({});
const diceRolling = reactive({});
const rewardsCollected = reactive({});
const currentTile = ref(1);
const tiles = ref([]);

const emit = defineEmits(['chamber-completed']);

onMounted(() => {
  initializeTiles();
  selectTile(1);
});

function initializeTiles() {
  tiles.value = Array(9).fill().map(() => {
    return gameData.tiles[Math.floor(Math.random() * gameData.tiles.length)];
  });
}

function selectTile(tileNumber) {
  if (isAvailableTile(tileNumber) && rewardsCollected[currentTile.value]) {
    if (!revealedTiles.value.includes(tileNumber)) {
      revealedTiles.value.push(tileNumber);
    }
    currentTile.value = tileNumber;
    console.log(`Tuile ${tileNumber} sélectionnée`);
  }
}

function tileRevealed(tileNumber) {
  return revealedTiles.value.includes(tileNumber);
}

function isAvailableTile(tileNumber) {
  if (tileNumber === currentTile.value) return true;
  if (tileNumber === currentTile.value + 1 && currentTile.value % 3 !== 0 && rewardsCollected[currentTile.value]) return true;
  if (tileNumber === currentTile.value + 3 && currentTile.value <= 6 && rewardsCollected[currentTile.value]) return true;
  return false;
}

function tileContent(tileNumber) {
  return tiles.value[tileNumber - 1];
}

function rollDice(tileNumber) {
  diceRolling[tileNumber] = true;
  setTimeout(() => {
    const result = Math.floor(Math.random() * 6) + 1;
    diceResults[tileNumber] = result;
    diceRolling[tileNumber] = false;
    console.log(`Résultat du dé pour la tuile ${tileNumber}: ${result}`);
    console.log(`Récompense: ${tileContent(tileNumber).rollRewards[result]}`);
  }, 1000);
}

function collectReward(tileNumber) {
  rewardsCollected[tileNumber] = true;
  console.log(`Récompense de la tuile ${tileNumber} récupérée`);
}

function completeChamber() {
  console.log("Salle terminée !");
  emit('chamber-completed');
  // Réinitialiser les tuiles pour la prochaine salle
  initializeTiles();
  revealedTiles.value = [1];
  currentTile.value = 1;
  Object.keys(diceResults).forEach(key => delete diceResults[key]);
  Object.keys(rewardsCollected).forEach(key => delete rewardsCollected[key]);
}
</script>

<style scoped>
.chamber {
  margin-bottom: 1rem;
}

.tiles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tile {
  background-color: var(--color-dark-gray);
  border: 1px solid var(--color-accent);
  border-radius: 0.25rem;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  font-size: 0.7rem;
}

.tile.available {
  opacity: 1;
  cursor: pointer;
}

.tile.current {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 5px var(--color-primary);
}

.tile:hover.available {
  background-color: var(--color-secondary);
}

h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.tile-details {
  margin-top: 0.5rem;
  font-size: 0.7rem;
}

.immediate-reward {
  margin-bottom: 0.25rem;
}

.roll-rewards {
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: left;
  font-size: 0.65rem;
  margin-top: 0.25rem;
}

.roll-rewards li {
  margin-bottom: 0.1rem;
}

button {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  border-radius: 0.15rem;
  cursor: pointer;
  font-size: 0.75rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dice-result {
  margin-top: 0.25rem;
  font-weight: bold;
  color: var(--color-accent);
  font-size: 0.75rem;
}
</style>
