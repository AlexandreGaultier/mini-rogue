<template>
  <div class="chamber">
    <div class="tiles-grid">
      <div v-for="i in 9" :key="i" class="tile" :class="{ 'current': currentTile === i, 'available': isAvailableTile(i) }" @click="selectTile(i)">
        <template v-if="(tileRevealed(i) || isAvailableTile(i)) && tileContent(i)">
          <h3>{{ tileContent(i).name }}</h3>
          <template v-if="isAvailableTile(i) || currentTile === i">
            <p class="immediate-reward">{{ tileContent(i).immediateReward.text }}</p>
            <ul class="roll-rewards">
              <li v-for="(reward, roll) in tileContent(i).rollRewards" :key="roll">
                {{ roll }}: {{ reward.text }}
              </li>
            </ul>
            <div v-if="currentTile === i" class="tile-details">
              <button v-if="!diceResults[i]" @click.stop="rollDice(i)" :disabled="diceRolling[i]">Lancer le dé</button>
              <template v-else>
                <p class="dice-result">
                  Résultat : {{ diceResults[i] }}
                  <br>
                  Récompense : {{ tileContent(i).rollRewards[diceResults[i]].text }}
                </p>
                <button v-if="!rewardsCollected[i] && diceResults[i]" @click.stop="collectReward(i)">Récupérer</button>
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
    <div v-if="newPotionNotification" class="potion-notification">
      {{ newPotionNotification }}
    </div>
    <div v-if="potionOffer" class="potion-offer">
      <h3>Nouvelle potion {{ potionOffer.type === 'offensivePotion' ? 'offensive' : 'défensive' }} disponible !</h3>
      <p>Voulez-vous remplacer votre {{ potionOffer.currentPotion || 'aucune potion' }} par {{ potionOffer.newPotion }} ?</p>
      <button @click="acceptNewPotion">Accepter</button>
      <button @click="rejectNewPotion">Refuser</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import gameData from '../data/game-data.json';

const props = defineProps({
  chamberNumber: {
    type: Number,
    required: true
  }
});

const store = useStore();
const potionOffer = computed(() => store.getters.potionOffer);

const revealedTiles = ref([1]);
const diceResults = reactive({});
const diceRolling = reactive({});
const rewardsCollected = reactive({});
const currentTile = ref(1);
const tiles = ref([]);
const newPotionNotification = ref('');

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
  }, 1000);
}

function collectReward(tileNumber) {
  if (rewardsCollected[tileNumber]) return;

  const tile = tileContent(tileNumber);
  const rollReward = tile.rollRewards[diceResults[tileNumber]];
  const immediateReward = tile.immediateReward;


  if (immediateReward) {
    store.dispatch('applyReward', immediateReward);
  }
  
  if (rollReward) {
    store.dispatch('applyReward', rollReward);
  }

  rewardsCollected[tileNumber] = true;
}

function completeChamber() {
  emit('chamber-completed');
  store.dispatch('nextChamber');
  initializeTiles();
  revealedTiles.value = [1];
  currentTile.value = 1;
  Object.keys(diceResults).forEach(key => delete diceResults[key]);
  Object.keys(rewardsCollected).forEach(key => delete rewardsCollected[key]);
}

watch(() => store.getters.offensivePotion, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    newPotionNotification.value = `Nouvelle potion offensive obtenue : ${newValue}`;
    setTimeout(() => { newPotionNotification.value = ''; }, 3000);
  }
});

watch(() => store.getters.defensivePotion, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    newPotionNotification.value = `Nouvelle potion défensive obtenue : ${newValue}`;
    setTimeout(() => { newPotionNotification.value = ''; }, 3000);
  }
});

function handlePotionOffer(offer) {
  potionOffer.value = offer;
}

function acceptNewPotion() {
  store.dispatch('acceptPotionOffer');
}

function rejectNewPotion() {
  store.dispatch('rejectPotionOffer');
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
</style>
