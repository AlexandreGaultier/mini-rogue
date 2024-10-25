<template>
  <div class="chamber">
    <div class="tiles-grid">
      <div v-for="i in 9" :key="i" class="tile" 
           :class="{ 'current': currentTile === i, 'available': isAvailableTile(i), 'completed': rewardsCollected[i], 'revealed': tileRevealed(i) }" 
           @click="selectTile(i)">
        <template v-if="tileContent(i)">
          <h3>{{ tileContent(i).name }}</h3>
          <template v-if="isAvailableTile(i) || currentTile === i">
            <p>{{ tileContent(i).description }}</p>
            <template v-if="tileContent(i).type === 'monster'">
              <p>Vie: {{ tileContent(i).health }}</p>
              <p>Dégâts: {{ tileContent(i).damage }}</p>
            </template>
            <template v-if="['reward', 'beneficial', 'trap'].includes(tileContent(i).type)">
              <p class="immediate-reward">{{ tileContent(i).immediateReward?.text || '' }}</p>
              <ul class="roll-rewards" v-if="tileContent(i).rollRewards">
                <li v-for="(reward, roll) in tileContent(i).rollRewards" :key="roll">
                  {{ roll }}: {{ reward.text }}
                </li>
              </ul>
            </template>
            <template v-if="tileContent(i).type === 'trap' && !tileContent(i).immediateReward">
              <p>Dégâts : {{ -(tileContent(i).effect?.hp || 0) }} PV</p>
            </template>
          </template>
          <template v-if="currentTile === i">
            <template v-if="['DiceRoll2', 'DiceRoll3', 'DiceRoll6'].includes(tileContent(i).mechanism)">
              <div v-if="currentTile === i" class="tile-details">
                <button v-if="!diceResults[i]" @click.stop="rollDice(i)" :disabled="diceRolling[i]">
                  Lancer le dé
                </button>
                <template v-else>
                  <p class="dice-result">
                    Résultat : {{ diceResults[i] }}
                    <br>
                    {{ tileContent(i).rollRewards[diceResults[i]].text }}
                  </p>
                </template>
              </div>
            </template>
            <template v-else-if="tileContent(i).mechanism === 'ImmediateReward'">
              <button @click="handleImmediateReward(i)" :disabled="rewardsCollected[i]">
                Collecter la récompense
              </button>
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
            <template v-else-if="['empty', 'trap'].includes(tileContent(i).type)">
              <button @click="interactWithTile(i)" :disabled="rewardsCollected[i]">
                {{ rewardsCollected[i] ? 'Continuer' : 'Interagir' }}
              </button>
            </template>
          </template>
        </template>
        <template v-if="currentTile === i && tileContent(i) && tileContent(i).type === 'merchant'">
          <div class="merchant-choices">
            <p class="merchant-lore">{{ getRandomLore() }}</p>
            <h4>Objets à vendre :</h4>
            <button 
              v-for="(choice, index) in tileContent(i).choices" 
              :key="index"
              @click="buyMerchantItem(i, choice)"
              :disabled="store.state.character.gold < choice.cost || choice.purchased"
            >
              {{ choice.text }} ({{ choice.cost }} or)
            </button>
            <button @click="interactWithTile(i)" class="continue-button">
              Poursuivre sa route
            </button>
          </div>
        </template>
      </div>
    </div>
    <button v-if="lastTileCompleted" @click="goToNextRoom" class="continue-button">
      Continuer
    </button>
    <div v-if="store.state.currentMerchantTile === i" class="merchant-choices">
      <h4>Objets à vendre :</h4>
      <button 
        v-for="choice in store.state.merchantChoices" 
        :key="choice.text"
        @click="buyMerchantItem(choice)"
        :disabled="store.state.character.gold < choice.cost"
      >
        {{ choice.text }} ({{ choice.cost }} or)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import gameData from '../data/game-data.json';
import MonsterFight from './MonsterFight.vue';

const store = useStore();
const potionOffer = computed(() => store.state.potionOffer);
const pendingLoot = computed(() => store.state.pendingLoot);

const revealedTiles = ref([1]);
const diceResults = reactive({});
const diceRolling = reactive({});
const rewardsCollected = reactive({});
const currentTile = ref(1);

const tiles = ref([]);

const currentFloor = computed(() => store.state.currentFloor);
const currentRoom = computed(() => store.state.currentRoom);
const dungeon = computed(() => store.state.dungeon);

const lastTileCompleted = computed(() => rewardsCollected[9] === true);

const dungeonLore = ref(gameData.dungeonLore);
const currentLoreIndex = ref(0);

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
  return tiles.value[tileNumber - 1] || null;
}

function tileRevealed(tileNumber) {
  return revealedTiles.value.includes(tileNumber);
}

function isAvailableTile(tileNumber) {
  if (tileNumber === 1 && !rewardsCollected[1]) return true;
  
  const currentTileIndex = currentTile.value;
  const rightTile = currentTileIndex + 1;
  const bottomTile = currentTileIndex + 3;
  
  const isRightEdge = currentTileIndex % 3 === 0;
  const isBottomEdge = currentTileIndex > 6;

  if (isRightEdge && isBottomEdge) {
    return false; // Pas de tuile disponible si on est dans le coin inférieur droit
  } else if (isRightEdge) {
    return tileNumber === bottomTile && rewardsCollected[currentTileIndex] && !rewardsCollected[tileNumber];
  } else if (isBottomEdge) {
    return tileNumber === rightTile && rewardsCollected[currentTileIndex] && !rewardsCollected[tileNumber];
  } else {
    return (tileNumber === rightTile || tileNumber === bottomTile) &&
           rewardsCollected[currentTileIndex] &&
           !rewardsCollected[tileNumber];
  }
}

function selectTile(tileNumber) {
  if (isAvailableTile(tileNumber)) {
    currentTile.value = tileNumber;
  }
}

function rollDice(tileNumber) {
  const tile = tileContent(tileNumber);
  const faces = tile.mechanism === 'DiceRoll2' ? 2 : 
                tile.mechanism === 'DiceRoll3' ? 3 : 6;
  diceRolling[tileNumber] = true;
  setTimeout(() => {
    diceResults[tileNumber] = Math.floor(Math.random() * faces) + 1;
    diceRolling[tileNumber] = false;
    applyDiceRollReward(tileNumber);
  }, 1000);
}

function applyDiceRollReward(tileNumber) {
  const tile = tileContent(tileNumber);
  const rollResult = diceResults[tileNumber];
  const reward = tile.rollRewards[rollResult];
  if (reward && reward.effect) {
    store.dispatch('applyReward', reward.effect);
  }
  completeTile(tileNumber);
}

function handleImmediateReward(tileNumber) {
  const tile = tileContent(tileNumber);
  if (tile.immediateReward && tile.immediateReward.effect) {
    store.dispatch('applyReward', tile.immediateReward.effect);
  }
  completeTile(tileNumber);
}

function interactWithTile(tileNumber) {
  const tile = tileContent(tileNumber);
  if (tile.type === 'lore') {
    handleLoreTile(tileNumber);
  } else if (tile.type === 'merchant') {
    completeMerchantTile(tileNumber);
  } else {
    if (tile.immediateReward) {
      applyReward(tile.immediateReward.effect);
    }
    if (tile.mechanism === 'ImmediateReward') {
      applyReward(tile.effect);
    }
    completeTile(tileNumber);
  }
  checkAvailableTiles();
  currentTile.value = null;
}

function applyReward(effect) {
  if (effect) {
    Object.entries(effect).forEach(([stat, value]) => {
      if (stat === 'offensivePotion' || stat === 'defensivePotion') {
        store.commit('ADD_POTION', { type: stat, amount: value === 'random' ? 1 : value });
      } else {
        store.commit('UPDATE_STAT', { stat, value });
      }
    });
  }
}

function completeTile(tileNumber) {
  rewardsCollected[tileNumber] = true;
  revealAdjacentTiles(tileNumber);
  checkLastTileCompleted();
}

function checkLastTileCompleted() {
  if (rewardsCollected[9]) {
    lastTileCompleted.value = true;
  }
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

function onLootCollected(tileNumber) {
  collectMonsterLoot(tileNumber);
  currentTile.value = null;
  checkAvailableTiles();
}

function collectMonsterLoot(tileNumber) {
  if (pendingLoot.value) {
    if (typeof pendingLoot.value === 'object') {
      if (pendingLoot.value.type === 'xp') {
        store.dispatch('applyReward', { exp: pendingLoot.value.value });
      } else {
        store.dispatch('applyReward', pendingLoot.value);
      }
    }
    rewardsCollected[tileNumber] = true;
    store.commit('CLEAR_LOOT');
    if (tileNumber === 9) {
      console.log('Dernière tuile complétée !');
    }
  } else {
    console.error('Aucun butin en attente à collecter');
  }
}

function checkAvailableTiles() {
  let availableTileFound = false;
  for (let i = 1; i <= 9; i++) {
    if (isAvailableTile(i) && !rewardsCollected[i]) {
      availableTileFound = true;
      break;
    }
  }
  if (!availableTileFound) {
    lastTileCompleted.value = true;
  }
}

function formatReward(reward) {
  if (!reward) return 'Aucun butin';
  let rewardText = [];
  if (reward.gold) rewardText.push(`${reward.gold} or`);
  if (reward.exp) rewardText.push(`${reward.exp} XP`);
  if (reward.type === 'xp' && reward.value) rewardText.push(`${reward.value} XP`);
  return rewardText.join(', ') || 'Aucun butin';
}

function goToNextRoom() {
  store.dispatch('nextRoom');
  initializeTiles();
}

function getRandomTileType(difficulty) {
  const types = ['monster', 'reward', 'empty', 'beneficial', 'trap', 'merchant', 'lore'];
  const weights = [
    0.2 + difficulty * 0.2,  // monster
    0.2 - difficulty * 0.1,  // reward
    0.2 - difficulty * 0.1,  // empty
    0.2 - difficulty * 0.1,  // beneficial
    0.1 + difficulty * 0.1,  // trap
    0.1,                      // merchant (constant)
    0.1                       // lore (constant)
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
    return getRandomMonster(difficulty) || getRandomTile('monster', difficulty);
  } else {
    const tile = getRandomTile(type, difficulty);
    if (!tile) {
      console.warn(`Aucune tuile de type ${type} trouvée pour la difficulté ${difficulty}`);
      return getRandomTile('empty', 1); // Fallback sur une tuile vide de difficulté 1
    }
    return tile;
  }
}

function getRandomTile(type, difficulty) {
  const availableTiles = gameData.tiles.filter(t => t.type === type);
  return availableTiles.length > 0
    ? availableTiles[Math.floor(Math.random() * availableTiles.length)]
    : null;
}

function getRandomMonster(difficulty) {
  const availableMonsters = gameData.monsters.filter(m => m.difficulty <= Math.ceil(difficulty * 5));
  return availableMonsters.length > 0 
    ? { ...availableMonsters[Math.floor(Math.random() * availableMonsters.length)], type: 'monster' }
    : null;
}

function revealAdjacentTiles(tileNumber) {
  const rightTile = tileNumber + 1;
  const bottomTile = tileNumber + 3;
  
  if (rightTile <= 9 && rightTile % 3 !== 1) {
    revealedTiles.value.push(rightTile);
  }
  if (bottomTile <= 9) {
    revealedTiles.value.push(bottomTile);
  }
}

function handleLoreTile(tileNumber) {
  const lore = dungeonLore.value[currentLoreIndex.value];
  store.commit('ADD_LOG_MESSAGE', lore);
  currentLoreIndex.value = (currentLoreIndex.value + 1) % dungeonLore.value.length;
  completeTile(tileNumber);
}

function handleMerchantTile(tileNumber) {
  const tile = tileContent(tileNumber);
  const lore = dungeonLore.value[currentLoreIndex.value];
  store.commit('ADD_LOG_MESSAGE', `Le marchand murmure : "${lore}"`);
  currentLoreIndex.value = (currentLoreIndex.value + 1) % dungeonLore.value.length;
  
  store.commit('SET_MERCHANT_CHOICES', tile.choices);
  store.commit('SET_CURRENT_MERCHANT_TILE', tileNumber);
}

function buyMerchantItem(tileNumber, choice) {
  if (store.state.character.gold >= choice.cost && !choice.purchased) {
    store.commit('UPDATE_STAT', { stat: 'gold', value: -choice.cost });
    store.dispatch('applyReward', choice.effect);
    
    // Marquer le choix comme acheté
    choice.purchased = true;
  }
}

function getRandomLore() {
  return dungeonLore.value[Math.floor(Math.random() * dungeonLore.value.length)];
}

function completeMerchantTile(tileNumber) {
  rewardsCollected[tileNumber] = true;
  revealAdjacentTiles(tileNumber);
  store.commit('SET_CURRENT_MERCHANT_TILE', null);
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

.merchant-choices {
  margin-top: 1rem;
}

.merchant-choices button {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: opacity 0.3s;
}

.merchant-choices button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.merchant-choices button:not(:disabled):hover {
  opacity: 0.8;
}

.merchant-lore {
  font-style: italic;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.continue-button {
  margin-top: 1rem;
  width: 100%;
  padding: 0.5rem;
  background-color: var(--color-primary);
  color: var(--color-text);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.continue-button:not(:disabled):hover {
  opacity: 0.8;
}
</style>



