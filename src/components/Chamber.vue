<template>
  <div class="chamber">
    <!-- Grille des tuiles -->
    <div class="tiles-grid">
      <!-- Boucle sur les 9 tuiles de la chambre -->
      <div v-for="i in 9" :key="i" class="tile" 
           :class="{ 'current': currentTile === i, 'available': isAvailableTile(i), 'completed': rewardsCollected[i], 'revealed': tileRevealed(i) }" 
           @click="selectTile(i)">
        <!-- Contenu de la tuile -->
        <template v-if="tileContent(i)">
          <h3>{{ tileContent(i).name }}</h3>
          <!-- Affichage des détails de la tuile si elle est disponible ou sélectionnée -->
          <template v-if="isAvailableTile(i) || currentTile === i">
            <p>{{ tileContent(i).description }}</p>
            <!-- Affichage spécifique pour les monstres -->
            <template v-if="tileContent(i).type === 'monster'">
              <div class="monster-health-container">
                <label class="monster-health-label" for="health">Vie : </label>
                <p class="monster-health">{{ tileContent(i).health }}</p>
              </div>
              <div class="monster-damage-container">
                <label class="monster-damage-label" for="damage">Dégats : </label>
                <p class="monster-damage">{{ tileContent(i).damage }}</p>
              </div>
            </template>
            <!-- Affichage pour les récompenses, bénéfices et pièges -->
            <template v-if="['reward', 'beneficial', 'trap'].includes(tileContent(i).type)">
              <p v-if="tileContent(i).immediateReward" 
                 class="immediate-reward" 
                 :class="getRewardColorClass(tileContent(i).immediateReward)">
                 &#9655; {{ tileContent(i).immediateReward.text }}
              </p>
              <ul class="roll-rewards" v-if="tileContent(i).rollRewards">
                <li v-for="(reward, roll) in tileContent(i).rollRewards" :key="roll"
                    :class="getRewardColorClass(reward)">
                  {{ getDiceSymbol(roll) }} {{ reward.text }}
                </li>
              </ul>
            </template>
            <!-- Affichage spécifique pour les pièges sans récompense immédiate -->
            <template v-if="tileContent(i).type === 'trap' && !tileContent(i).immediateReward">
              <p>Dégâts : {{ -(tileContent(i).effect?.hp || 0) }} PV</p>
            </template>
          </template>
          <!-- Interactions spécifiques pour la tuile sélectionnée -->
          <template v-if="currentTile === i">
            <!-- Mécanisme de lancer de dés -->
            <template v-if="['DiceRoll2', 'DiceRoll3', 'DiceRoll6'].includes(tileContent(i).mechanism)">
              <div v-if="currentTile === i" class="tile-details">
                <button v-if="!diceResults[i]" @click.stop="rollDice(i)" :disabled="diceRolling[i]">
                  Lancer le dé
                </button>
                <template v-else>
                  <p class="dice-result">
                    Résultat : <span :class="getRewardColorClass(tileContent(i).rollRewards[diceResults[i]])">
                      {{ getDiceSymbol(diceResults[i]) }} {{ diceResults[i] }}
                    </span>
                    <br>
                    <span :class="getRewardColorClass(tileContent(i).rollRewards[diceResults[i]])">
                      {{ tileContent(i).rollRewards[diceResults[i]].text }}
                    </span>
                  </p>
                </template>
              </div>
            </template>
            <!-- Mécanisme de récompense immédiate -->
            <template v-else-if="tileContent(i).mechanism === 'ImmediateReward'">
              <button @click="handleImmediateReward(i)" :disabled="rewardsCollected[i]">
                Collecter la récompense
              </button>
            </template>
            <!-- Gestion des combats contre les monstres -->
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
            <!-- Gestion des tuiles vides et des pièges -->
            <template v-else-if="['empty', 'trap'].includes(tileContent(i).type)">
              <button @click="interactWithTile(i)" :disabled="rewardsCollected[i]">
                {{ rewardsCollected[i] ? 'Continuer' : 'Interagir' }}
              </button>
            </template>
          </template>
        </template>
        <!-- Gestion spécifique des marchands -->
        <template v-if="currentTile === i && tileContent(i) && tileContent(i).type === 'merchant'">
          <div class="merchant-choices">
            <template v-if="!merchantInteractionCompleted[i]">
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
              <br>
              <button @click="completeMerchantTile(i)" class="continue-button">
                Poursuivre sa route
              </button>
            </template>
            <template v-else>
              <p>Vous avez terminé vos affaires avec ce marchand.</p>
            </template>
          </div>
        </template>
      </div>
    </div>
    <!-- Bouton pour passer à la salle suivante -->
    <button v-if="lastTileCompleted" @click="goToNextRoom" class="continue-button">
      Continuer
    </button>
  </div>
</template>

<script setup>
// Importations nécessaires
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import gameData from '../data/game-data.json';
import MonsterFight from './MonsterFight.vue';

// Initialisation du store Vuex
const store = useStore();

// Computed properties pour accéder à l'état du store
const potionOffer = computed(() => store.state.potionOffer);
const pendingLoot = computed(() => store.state.pendingLoot);
const currentFloor = computed(() => store.state.currentFloor);
const currentRoom = computed(() => store.state.currentRoom);
const dungeon = computed(() => store.state.dungeon);

// État local réactif
const revealedTiles = ref([1]);
const diceResults = reactive({});
const diceRolling = reactive({});
const rewardsCollected = reactive({});
const currentTile = ref(1);
const tiles = ref([]);

// Ajoutez ceci avec les autres états réactifs
const merchantInteractionCompleted = reactive({});

// Computed property pour vérifier si la dernière tuile est complétée
const lastTileCompleted = computed(() => rewardsCollected[9] === true);

// Données du donjon
const dungeonLore = ref(gameData.dungeonLore);
const currentLoreIndex = ref(0);

// Initialisation au montage du composant
onMounted(() => {
  initializeTiles();
  selectTile(1);
});

// Fonctions d'initialisation et de gestion générale des tuiles
function initializeTiles() {
  const currentFloorIndex = dungeon.value.floors.findIndex(floor => floor.level === currentFloor.value);
  const difficulty = (currentFloorIndex + 1) / dungeon.value.floors.length;

  tiles.value = Array(9).fill().map(() => {
    const tileType = getRandomTileType(difficulty);
    return getTileContent(tileType, difficulty);
  });

  // Réinitialisation des états
  revealedTiles.value = [1];
  currentTile.value = 1;
  Object.keys(diceResults).forEach(key => delete diceResults[key]);
  Object.keys(diceRolling).forEach(key => delete diceRolling[key]);
  Object.keys(rewardsCollected).forEach(key => delete rewardsCollected[key]);
  Object.keys(merchantInteractionCompleted).forEach(key => delete merchantInteractionCompleted[key]);
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

// Fonctions de gestion des mécanismes de jeu
function rollDice(tileNumber) {
  const tile = tileContent(tileNumber);
  if (tile.immediateReward) {
    applyImmediateReward(tile.immediateReward);
  }
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
  console.log('Tile content:', tile); // Log pour vérifier le contenu de la tuile

  if (tile.type === 'lore') {
    handleLoreTile(tileNumber);
  } else if (tile.type === 'merchant') {
    if (!merchantInteractionCompleted[tileNumber]) {
      handleMerchantTile(tileNumber);
    } else {
      completeTile(tileNumber);
    }
  } else {
    if (tile.immediateReward) {
      console.log('Immediate reward found:', tile.immediateReward); // Log pour vérifier la récompense immédiate
      applyImmediateReward(tile.immediateReward);
    }
    if (tile.mechanism === 'ImmediateReward' && tile.effect) {
      applyReward(tile.effect);
    }
    completeTile(tileNumber);
  }
  checkAvailableTiles();
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
  checkAvailableTiles();
}

function checkLastTileCompleted() {
  if (rewardsCollected[9]) {
    lastTileCompleted.value = true;
  }
}

// Fonctions de gestion des combats
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

// Fonctions utilitaires
function formatReward(reward) {
  if (!reward) return 'Aucun butin';
  let rewardText = [];
  if (reward.gold) rewardText.push(`${reward.gold} or`);
  if (reward.exp) rewardText.push(`${reward.exp} XP`);
  if (reward.type === 'xp' && reward.value) rewardText.push(`${reward.value} XP`);
  return rewardText.join(', ') || 'Aucun butin';
}

function goToNextRoom() {
  // Récupérer l'état actuel du personnage
  const character = store.state.character;
  
  // Vérifier les rations
  if (character.rations > 0) {
    // Consommer une ration
    store.commit('UPDATE_STAT', { stat: 'rations', value: -1 });
    store.commit('ADD_LOG_MESSAGE', 'Vous consommez 1 ration pour votre voyage.');
  } else {
    // Pas de rations, le personnage perd 3 PV
    store.commit('UPDATE_STAT', { stat: 'hp', value: -3 });
    store.commit('ADD_LOG_MESSAGE', 'Sans rations, vous perdez 3 PV durant votre voyage.');
  }

  // Passer à la salle suivante
  store.dispatch('nextRoom');
  
  // Réinitialiser les tuiles pour la nouvelle salle
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

// Fonctions spécifiques aux types de tuiles
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
  merchantInteractionCompleted[tileNumber] = true;
  revealAdjacentTiles(tileNumber);
  store.commit('SET_CURRENT_MERCHANT_TILE', null);
}

function getRewardColorClass(reward) {
  if (!reward || !reward.color) return '';
  return `reward-${reward.color}`;
}

function getDiceSymbol(roll) {
  const diceSymbols = {
    '1': '⚀',
    '2': '⚁',
    '3': '⚂',
    '4': '⚃',
    '5': '⚄',
    '6': '⚅'
  };
  return diceSymbols[roll] || roll;
}

// Ajoutez cette nouvelle fonction pour gérer spécifiquement les récompenses immédiates :

function applyImmediateReward(immediateReward) {
  console.log('Applying immediate reward:', immediateReward); // Log pour vérifier l'application de la récompense
  if (immediateReward && immediateReward.effect) {
    if (typeof immediateReward.effect === 'object') {
      Object.entries(immediateReward.effect).forEach(([stat, value]) => {
        console.log(`Updating stat: ${stat} by ${value}`); // Log pour chaque mise à jour de stat
        store.commit('UPDATE_STAT', { stat, value });
      });
    } else {
      console.log('Applying reward effect:', immediateReward.effect);
      applyReward(immediateReward.effect);
    }
    store.commit('ADD_LOG_MESSAGE', immediateReward.text);
  }
}
</script>

<style scoped>
/* Ajoutez ceci au début du bloc style */
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

/* Modifiez le style .chamber pour inclure la nouvelle font-family */
.chamber {
  margin-bottom: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) var(--color-dark-gray);
  font-family: 'Lato', sans-serif;
}

.tiles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.tile {
  background-color: var(--color-dark-gray);
  border: 1px solid #E0E0E0;
  border-radius: 0.5rem;
  padding: 0.8rem; /* Réduit le padding */
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
  min-height: 110px; /* Réduit la hauteur minimale */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  font-size: 0.85rem; /* Réduit la taille de la police */
  color: rgba(255, 255, 255, 0.8); /* Couleur légèrement moins vive pour la description */
}

.tile.available {
  border: 1px solid var(--color-accent);
  opacity: 1;
  cursor: pointer;
}

.tile.current {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
}

.tile:hover.available {
  background-color: var(--color-secondary);
}

h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-primary);
  font-size: 1rem; /* Réduit la taille du titre */
}

.tile-details {
  background-color: rgba(29, 29, 29, 0.7) !important;
  width: 70%;
  border-radius: 0.5rem;
  padding: 0 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.85rem; /* Réduit la taille de la police */
}

.tile-details button {
  background-color: transparent;
  color: var(--color-text);
  border-radius: 0.5rem;
  padding: 0.8rem 1.2rem;
  margin: 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: auto;
  display: inline-block;
}

.tile-details button:hover {
  font-weight: 700;
  font-size: 1.2rem;
  transform: translateY(-2px);
}

.tile-details button:active {
  transform: translateY(1px);
}

.tile-details button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.immediate-reward {
  margin-bottom: 0.5rem;
  font-weight: 700; /* Texte en gras */
  color: var(--color-text); /* Couleur de texte normale pour les récompenses */
}

.roll-rewards {
  list-style-type: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  text-align: left;
  font-size: 0.8rem; /* Réduit la taille de la police */
}

.roll-rewards li {
  margin-bottom: 0.3rem;
  font-weight: 700; /* Texte en gras */
  color: var(--color-text); /* Couleur de texte normale pour les récompenses */
}

.monster-health-container {
  display: flex;
  align-items: center;
}

.monster-health-label {
  margin-right: 0.5rem;
}

.monster-health {
  color: #8BC34A !important; /* Vert plus doux */
}

.monster-damage-container {
  display: flex;
  align-items: center;
}

.monster-damage-label {
  margin-right: 0.5rem;
}

.monster-damage {
  color: #FF7043 !important; /* Rouge-orange plus doux */
}

button {
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem; /* Réduit le padding */
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.85rem; /* Réduit la taille de la police */
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dice-result {
  margin: 0.5rem 0;
  font-weight: bold;
  color: var(--color-accent);
  font-size: 1.2rem !important; /* Réduit la taille de la police */
}

.continue-button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem; /* Réduit le padding */
  font-size: 1rem; /* Réduit la taille de la police */
  background-color: var(--color-dark-gray);
  box-shadow: 0 0 10px rgba(29, 29, 29, 0.7);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  align-self: center;
}

.continue-button:hover {
  background-color: #242424;
  color: #FF7043;
  transition: all 0.3s ease-in-out;
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

.merchant-choices {
  margin-top: 1rem;
}

.merchant-choices button {
  display: block;
  width: 100%;
  margin: 0.5rem 0; /* Réduit la marge */
  padding: 0.6rem; /* Réduit le padding */
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem; /* Réduit la taille de la police */
  transition: opacity 0.3s;
}

.merchant-lore {
  font-style: italic;
  margin-bottom: 1rem;
  font-size: 0.9rem; /* Réduit la taille de la police */
  color: var(--color-text-secondary);
}

/* Styles pour les écrans plus grands */
@media (min-width: 768px) {
  .tile {
    font-size: 0.95rem;
    min-height: 140px;
  }

  h3 {
    font-size: 1.2rem;
  }

  .tile-details, .roll-rewards, button, .dice-result {
    font-size: 0.95rem;
  }

  .continue-button {
    font-size: 1.1rem;
  }

  .immediate-reward, .roll-rewards li {
    font-size: 1rem; /* Ajustez la taille de la police si nécessaire */
  }

  .tile p:not(.immediate-reward):not(.roll-rewards li) {
    color: rgba(255, 255, 255, 0.8); /* Couleur légèrement moins vive pour les autres paragraphes */
  }
}

.reward-green {
  color: #8BC34A !important; /* Vert plus doux */
}

.reward-red {
  color: #FF7043 !important; /* Rouge-orange plus doux */
}

.reward-white {
  color: #E0E0E0 !important; /* Blanc cassé */
}

.immediate-reward, .roll-rewards li {
  font-weight: 700;
}

/* Assurez-vous que ces styles sont après les styles de couleur pour qu'ils aient la priorité */
.tile p:not(.immediate-reward):not(.roll-rewards li) {
  color: rgba(255, 255, 255, 0.8);
}
</style>







