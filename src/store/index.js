import { createStore } from 'vuex';
import gameData from '../data/game-data.json';
import router from '../router';  // Importez le routeur

const initialCharacterState = { ...gameData.characters[0] };

const potions = {
  offensive: ['Potion de feu', 'Potion de givre', 'Potion de poison', 'Potion d\'acide'],
  defensive: ['Potion de soin', 'Potion de bouclier', 'Potion d\'invisibilité', 'Potion de résistance']
};

export default createStore({
  state: {
    character: null,
    dungeon: null,
    currentLevel: 1,
    currentChamber: 1,
    potionOffer: null,
    currentFloor: 1,
    currentRoom: 1,
    pendingLoot: null,
    merchantChoices: [],
    currentMerchantTile: null,
    logMessages: [],
    volume: 0.7
  },
  mutations: {
    SET_CHARACTER(state, character) {
      state.character = character;
    },
    UPDATE_STAT(state, { stat, value }) {
      const maxValues = {
        hp: state.character.maxHp,
        exp: 23,
        armor: 4,
        rations: 5,
        gold: 10
      };
      const currentValue = state.character[stat];
      const maxValue = maxValues[stat];
      
      state.character[stat] = Math.max(0, Math.min(currentValue + value, maxValue));
    },
    SET_POTION(state, { type, potion }) {
      state.character[type] = potion;
    },
    SET_POTION_OFFER(state, offer) {
      state.potionOffer = offer;
    },
    SET_DUNGEON(state, dungeon) {
      state.dungeon = dungeon;
    },
    SET_CURRENT_FLOOR(state, floor) {
      state.currentFloor = floor;
    },
    SET_CURRENT_ROOM(state, room) {
      state.currentRoom = room;
    },
    SET_PENDING_LOOT(state, loot) {
      state.pendingLoot = loot;
    },
    CLEAR_LOOT(state) {
      state.pendingLoot = null;
    },
    SET_MERCHANT_CHOICES(state, choices) {
      state.merchantChoices = choices.map(choice => ({
        ...choice,
        purchased: false
      }));
    },
    SET_CURRENT_MERCHANT_TILE(state, tileNumber) {
      state.currentMerchantTile = tileNumber;
    },
    REMOVE_MERCHANT_CHOICE(state, choice) {
      state.merchantChoices = state.merchantChoices.filter(c => c !== choice);
    },
    ADD_LOG_MESSAGE(state, message) {
      state.logMessages.push(message);
    },
    SET_CURRENT_LEVEL(state, level) {
      state.currentLevel = level;
    },
    SET_CURRENT_CHAMBER(state, chamber) {
      state.currentChamber = chamber;
    },
    SET_VOLUME(state, volume) {
      state.volume = volume;
    },
  },
  actions: {
    loadGameData({ commit }) {
      console.log('Game data loaded');
    },
    initGame({ commit, dispatch }) {
      dispatch('loadGameData');
    },
    setCharacter({ commit }, character) {
      commit('SET_CHARACTER', character);
    },
    initializeGame({ commit }, { character, dungeon }) {
      commit('SET_CHARACTER', character);
      commit('SET_DUNGEON', dungeon);
      commit('SET_CURRENT_LEVEL', 1);
      commit('SET_CURRENT_CHAMBER', 1);
    },
    applyReward({ commit }, reward) {
      for (const [stat, value] of Object.entries(reward)) {
        if (stat === 'offensivePotion' || stat === 'defensivePotion') {
          commit('SET_POTION', { type: stat, potion: value });
        } else if (['exp', 'gold', 'hp', 'armor', 'rations'].includes(stat)) {
          commit('UPDATE_STAT', { stat, value: Number(value) });
        } else {
          console.warn(`Statistique non reconnue: ${stat}`);
        }
      }
    },
    offerNewPotion({ commit, state }, { type, value }) {
      const potionType = type === 'offensivePotion' ? 'offensive' : 'defensive';
      let newPotion;
      if (value === 'random') {
        const availablePotions = potions[potionType].filter(potion => potion !== state.character[type]);
        newPotion = availablePotions[Math.floor(Math.random() * availablePotions.length)];
      } else {
        newPotion = value;
      }
      commit('SET_POTION_OFFER', { type, currentPotion: state.character[type], newPotion });
    },
    acceptPotionOffer({ commit, state }) {
      if (state.potionOffer) {
        commit('SET_POTION', { type: state.potionOffer.type, potion: state.potionOffer.newPotion });
        commit('SET_POTION_OFFER', null);
      }
    },
    rejectPotionOffer({ commit }) {
      commit('SET_POTION_OFFER', null);
    },
    nextRoom({ commit, state, dispatch }) {
      const currentFloor = state.dungeon.floors.find(f => f.level === state.currentFloor);
      if (state.currentRoom < currentFloor.rooms.length) {
        commit('SET_CURRENT_ROOM', state.currentRoom + 1);
      } else if (state.currentFloor < state.dungeon.floors.length) {
        commit('SET_CURRENT_FLOOR', state.currentFloor + 1);
        commit('SET_CURRENT_ROOM', 1);
        dispatch('consumeRation');
      } else {
        console.log('Donjon terminé !');
      }
    },
    setMonsterLoot({ commit }, loot) {
      commit('SET_PENDING_LOOT', loot);
    },
    resetCharacter({ commit, state }) {
      const initialStats = {
        hp: state.character.maxHp,
        exp: 0,
        gold: 5,
        armor: 0,
        rations: 3
      };
      Object.entries(initialStats).forEach(([stat, value]) => {
        commit('UPDATE_STAT', { stat, value });
      });
    },
    consumeRation({ commit, state }) {
      if (state.character.rations > 0) {
        commit('UPDATE_STAT', { stat: 'rations', value: -1 });
      } else {
        commit('UPDATE_STAT', { stat: 'hp', value: -3 });
      }
    },
    completeFloor({ commit, state, dispatch }) {
      // Logique pour compléter un étage
      commit('INCREMENT_FLOOR')

      if (state.currentFloor > state.totalFloors) {
        // Le joueur a terminé tous les étages
        dispatch('completeDungeon')
      } else {
        // Passer à l'étage suivant
        dispatch('setupNextFloor')
      }
    },

    completeDungeon({ commit }) {
      // Logique pour terminer le donjon
      commit('SET_DUNGEON_COMPLETED', true)
      
      // Rediriger vers la vue de victoire
      router.push('/victory')
    }
  },
  getters: {
    character: state => state.character,
    currentLevel: state => state.currentLevel,
    currentChamber: state => state.currentChamber,
    offensivePotion: state => state.character.offensivePotion,
    defensivePotion: state => state.character.defensivePotion,
    potionOffer: state => state.potionOffer,
    currentFloorData: (state) => state.dungeon.floors.find(f => f.level === state.currentFloor),
  }
});

