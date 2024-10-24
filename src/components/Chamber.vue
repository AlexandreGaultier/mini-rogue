<template>
  <div class="chamber">
    <div class="tiles-grid">
      <div v-for="i in 9" :key="i" class="tile" 
           :class="{ 'current': currentTile === i, 'available': isAvailableTile(i), 'completed': isTileCompleted(i), 'revealed': tileRevealed(i) }" 
           @click="selectTile(i)">
        <template v-if="tileContent(i)">
          <h3>{{ tileContent(i).name }}</h3>
          <template v-if="isAvailableTile(i) || currentTile === i">
            <p>{{ tileContent(i).description }}</p>
            <template v-if="tileContent(i).type === 'monster'">
              <p>Vie: {{ tileContent(i).health }}</p>
              <p>Dégâts: {{ tileContent(i).damage }}</p>
            </template>
            <template v-if="['reward', 'beneficial'].includes(tileContent(i).type)">
              <p class="immediate-reward">{{ tileContent(i).immediateReward?.text || 'Pas de récompense immédiate' }}</p>
              <ul class="roll-rewards" v-if="tileContent(i).rollRewards">
                <li v-for="(reward, roll) in tileContent(i).rollRewards" :key="roll">
                  {{ roll }}: {{ reward.text }}
                </li>
              </ul>
            </template>
            <template v-if="tileContent(i).type === 'trap'">
              <p>Dégâts : {{ -tileContent(i).effect.hp }} PV</p>
            </template>
          </template>
          <template v-if="currentTile === i">
            <template v-if="['reward', 'beneficial'].includes(tileContent(i).type)">
              <div v-if="currentTile === i" class="tile-details">
                <button v-if="!diceResults[i]" @click.stop="rollDice(i)" :disabled="diceRolling[i]">Lancer le dé</button>
                <template v-else>
                  <p class="dice-result">
                    Résultat : {{ diceResults[i] }}
                    <br>
                    {{ tileContent(i).rollRewards[diceResults[i]].text }}
                  </p>
                  <button @click="collectReward(i)" :disabled="rewardsCollected[i]">Collecter la récompense</button>
                </template>
              </div>
            </template>
            <template v-else-if="tileContent(i).type === 'monster'">
              <template v-if="currentTile === i && !rewardsCollected[i] && !pendingLoot">
                <MonsterFight 
                  :monster="tileContent(i)"
                  @combat-ended="onCombatEnded"
                  @loot-collected="onLootCollected(i)" 
                />
              </template>
              <template v-else-if="currentTile === i && pendingLoot">
                <p>Butin : {{ formatReward(pendingLoot) }}</p>
                <button @click="collectMonsterLoot(i)">
                  Récupérer le butin
                </button>
              </template>
            </template>
            <template v-else-if="['empty', 'trap', 'merchant'].includes(tileContent(i).type)">
              <button @click="interactWithTile(i)" :disabled="rewardsCollected[i]">
                {{ rewardsCollected[i] ? 'Continuer' : 'Interagir' }}
              </button>
            </template>
          </template>
        </template>
      </div>
    </div>
    <button v-if="lastTileCompleted" @click="goToNextRoom" class="continue-button">
      Continuer
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import gameData from '../data/game-data.json';
import MonsterFight from './MonsterFight.vue';

const props = defineProps({
  chamberNumber: {
    type: Number,
    required: true
  }
});

const store = useStore();
const potionOffer = computed(() => store.state.potionOffer);
const pendingLoot = computed(() => store.state.pendingLoot);

const revealedTiles = ref([1]);
const diceResults = reactive({});
const diceRolling = reactive({});
const rewardsCollected = reactive({});
const currentTile = ref(1);

const tiles = ref([]);
const newPotionNotification = ref('');
const currentMonster = ref(null);

const emit = defineEmits(['chamber-completed']);

const currentFloor = computed(() => store.state.currentFloor);
const currentRoom = computed(() => store.state.currentRoom);
const dungeon = computed(() => store.state.dungeon);

const lastTileCompleted = computed(() => rewardsCollected[9] === true);

onMounted(() => {
  initializeTiles();
  selectTile(1);
});

function initializeTiles() {
  const currentFloorIndex = dungeon.value.floors.findIndex(floor => floor.level === currentFloor.value);
  const difficulty = (currentFloorIndex + 1) / dungeon.value.floors.length;

  tiles.value = Array(9).fill().map(() => {
    const tileType = getRandomTileType(difficulty);
    return getTileContent(tileType, difficulty);
  });

  revealedTiles.value = [1];
  currentTile.value = 1;
  Object.keys(diceResults).forEach(key => delete diceResults[key]);
  Object.keys(diceRolling).forEach(key => delete diceRolling[key]);
  Object.keys(rewardsCollected).forEach(key => delete rewardsCollected[key]);
}

function tileContent(tileNumber) {
  return tiles.value[tileNumber - 1];
}

function tileRevealed(tileNumber) {
  return revealedTiles.value.includes(tileNumber);
}

function isAvailableTile(tileNumber) {
  if (currentTile.value === null) return tileNumber === 1;
  if (!rewardsCollected[currentTile.value]) return false;
  const row = Math.floor((tileNumber - 1) / 3);
  const col = (tileNumber - 1) % 3;
  return (row === Math.floor((currentTile.value - 1) / 3) && col === (currentTile.value - 1) % 3 + 1) || 
         (row === Math.floor((currentTile.value - 1) / 3) + 1 && col === (currentTile.value - 1) % 3);
}

function selectTile(tileNumber) {
  if (!isAvailableTile(tileNumber)) return;
  revealedTiles.value.push(tileNumber);
  currentTile.value = tileNumber;
}

function rollDice(tileNumber) {
  diceRolling[tileNumber] = true;
  setTimeout(() => {
    diceResults[tileNumber] = Math.floor(Math.random() * 6) + 1;
    diceRolling[tileNumber] = false;
  }, 1000);
}

function collectReward(tileNumber) {
  const tile = tileContent(tileNumber);
  if (tile.immediateReward) {
    store.dispatch('applyReward', tile.immediateReward.effect);
  }
  if (diceResults[tileNumber]) {
    const rollReward = tile.rollRewards[diceResults[tileNumber]];
    if (rollReward && rollReward.effect) {
      store.dispatch('applyReward', rollReward.effect);
    }
  }
  rewardsCollected[tileNumber] = true;
  console.log('Récompense collectée pour la tuile:', tileNumber);
  if (tileNumber === 9) {
    console.log('Dernière tuile complétée !');
  }
}

function goToNextRoom() {
  console.log('Passage à la salle suivante');
  store.dispatch('nextRoom');
  initializeTiles();
}

function interactWithTile(tileNumber) {
  const tile = tileContent(tileNumber);
  if (tile.type === 'trap') {
    if (tile.effect) {
      store.dispatch('applyReward', tile.effect);
      console.log('Effet du piège appliqué:', tile.effect);
    } else {
      console.error('Effet du piège non défini pour la tuile:', tile);
    }
  } else if (tile.type === 'beneficial' && tile.name === 'Fontaine de vie') {
    if (tile.effect) {
      store.dispatch('applyReward', tile.effect);
      console.log('Effet de la fontaine de vie appliqué:', tile.effect);
    } else {
      console.error('Effet de la fontaine de vie non défini pour la tuile:', tile);
    }
  } else if (tile.effect) {
    store.dispatch('applyReward', tile.effect);
  }
  rewardsCollected[tileNumber] = true;
  console.log('Interaction avec la tuile:', tileNumber);
  if (tileNumber === 9) {
    console.log('Dernière tuile complétée !');
  }
}

function collectMonsterLoot(tileNumber) {
  if (pendingLoot.value) {  // Ajoutez cette vérification
    store.dispatch('applyReward', pendingLoot.value);
    rewardsCollected[tileNumber] = true;
    store.commit('CLEAR_LOOT');
    if (tileNumber === 9) {
      console.log('Dernière tuile complétée !');
    }
  } else {
    console.error('Aucun butin en attente à collecter');
  }
}

function getRandomTileType(difficulty) {
  const types = ['monster', 'reward', 'empty', 'beneficial', 'trap', 'merchant'];
  const weights = [
    0.2 + difficulty * 0.2,  // monster
    0.2 - difficulty * 0.1,  // reward
    0.2 - difficulty * 0.1,  // empty
    0.2 - difficulty * 0.1,  // beneficial
    0.1 + difficulty * 0.1,  // trap
    0.1                      // merchant (constant)
  ];

  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < types.length; i++) {
    sum += weights[i];
    if (random < sum) return types[i];
  }
  return types[types.length - 1];
}

function getTileContent(type, difficulty) {
  if (type === 'monster') {
    return getRandomMonster(difficulty) || getDefaultTile(type);
  } else {
    const tile = getRandomTile(type, difficulty) || getDefaultTile(type);
    // Ajuster les noms des tuiles
    if (tile.type === 'trap') {
      tile.name = 'Piège à pointes';
    } else if (tile.type === 'empty') {
      tile.name = 'Salle vide';
    }
    return tile;
  }
}

function getRandomMonster(difficulty) {
  const availableMonsters = gameData.monsters.filter(m => m.difficulty <= Math.ceil(difficulty * 5));
  return availableMonsters.length > 0 
    ? { ...availableMonsters[Math.floor(Math.random() * availableMonsters.length)], type: 'monster' }
    : null;
}

function getRandomTile(type, difficulty) {
  const availableTiles = gameData.tiles.filter(t => t.type === type && t.difficulty <= Math.ceil(difficulty * 5));
  return availableTiles.length > 0
    ? availableTiles[Math.floor(Math.random() * availableTiles.length)]
    : null;
}

function getDefaultTile(type) {
  return {
    type: type,
    name: type === 'trap' ? 'Piège à pointes' : 
          type === 'empty' ? 'Salle vide' : 
          type === 'merchant' ? 'Marchand ambulant' :
          `Salle ${type}`,
    description: type === 'trap' ? "Un piège mortel avec des pointes acérées." :
                 type === 'empty' ? "Une salle sans rien de particulier." :
                 type === 'merchant' ? "Un marchand propose ses services." :
                 `Une salle ${type} ordinaire.`,
    immediateReward: { text: "Pas de récompense immédiate" },
    rollRewards: {
      1: { text: "Rien ne se passe" },
      2: { text: "Rien ne se passe" },
      3: { text: "Rien ne se passe" },
      4: { text: "Rien ne se passe" },
      5: { text: "Rien ne se passe" },
      6: { text: "Rien ne se passe" }
    },
    effect: type === 'trap' ? { hp: -3 } : null
  };
}

function onCombatEnded(playerWon) {
  if (playerWon) {
    const monster = tileContent(currentTile.value);
    if (monster.reward) {
      store.dispatch('setMonsterLoot', monster.reward);
    }
  } else {
    rewardsCollected[currentTile.value] = true;
  }
}

function startCombat(tileNumber) {
  currentTile.value = tileNumber;
}

function onLootCollected(tileNumber) {
  collectMonsterLoot(tileNumber);
  currentTile.value = null;
  checkAvailableTiles();
}

function checkAvailableTiles() {
  for (let i = 1; i <= 9; i++) {
    if (isAvailableTile(i) && !rewardsCollected[i]) {
      return; // Il y a encore des tuiles disponibles
    }
  }
  // Si aucune tuile n'est disponible, activez le bouton "Continuer"
  lastTileCompleted.value = true;
}

function formatReward(reward) {
  if (!reward) return 'Aucun butin';
  let rewardText = [];
  if (reward.gold) rewardText.push(`${reward.gold} or`);
  if (reward.exp) rewardText.push(`${reward.exp} XP`);
  if (reward.type === 'xp' && reward.value) rewardText.push(`${reward.value} XP`);
  return rewardText.join(', ') || 'Aucun butin';
}

function isTileCompleted(tileNumber) {
  return rewardsCollected[tileNumber];
}

const currentLevel = computed(() => store.state.currentLevel);
const currentChamber = computed(() => store.state.currentChamber);
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

.potion-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
}

.potion-offer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
  text-align: center;
}

.potion-offer button {
  margin: 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.continue-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.tile.completed {
  opacity: 0.7;
  cursor: default;
}

.tile.revealed h3 {
  opacity: 1;
}

.tile:not(.available):not(.current):not(.revealed) h3 {
  opacity: 0.5;
}

.tile.available,
.tile.current {
  opacity: 1;
}

.tile:not(.available):not(.current) {
  opacity: 0.3;
  cursor: not-allowed;
}

.tile.completed {
  opacity: 0.7;
  cursor: default;
}
</style>

