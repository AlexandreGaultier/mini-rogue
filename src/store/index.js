import { createStore } from 'vuex';
import gameData from '../data/game-data.json';

const initialCharacterState = { ...gameData.characters[0] };

const potions = {
  offensive: ['Potion de feu', 'Potion de givre', 'Potion de poison', 'Potion d\'acide'],
  defensive: ['Potion de soin', 'Potion de bouclier', 'Potion d\'invisibilité', 'Potion de résistance']
};

export default createStore({
  state: {
    character: { ...initialCharacterState },
    dungeon: null,
    currentLevel: 1,
    currentChamber: 1,
    potionOffer: null,
    currentFloor: 1,
    currentRoom: 1,
    pendingLoot: null,
  },
  mutations: {
    UPDATE_STAT(state, { stat, value }) {
      const currentValue = state.character[stat];
      const maxValue = state.character[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] || Infinity;
      
      if (stat === 'exp') {
        // Si l'exp descend en dessous de 0, on la laisse à 0 et on applique le reste à hp
        if (currentValue + value < 0) {
          const overflow = currentValue + value;
          state.character.exp = 0;
          state.character.hp = Math.min(state.character.hp - overflow, state.character.maxHp);
        } else {
          state.character.exp = Math.min(currentValue + value, maxValue);
        }
      } else {
        state.character[stat] = Math.max(0, Math.min(currentValue + value, maxValue));
      }
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
  },
  actions: {
    initializeGame({ commit, state }) {
      const selectedDungeon = gameData.dungeons[0]; // Sélectionnez le donjon que vous voulez
      commit('SET_DUNGEON', selectedDungeon);
      commit('SET_CURRENT_FLOOR', 1);
      commit('SET_CURRENT_ROOM', 1);
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
    nextRoom({ commit, state }) {
      const currentFloor = state.dungeon.floors.find(f => f.level === state.currentFloor);
      if (state.currentRoom < currentFloor.rooms.length) {
        commit('SET_CURRENT_ROOM', state.currentRoom + 1);
      } else if (state.currentFloor < state.dungeon.floors.length) {
        commit('SET_CURRENT_FLOOR', state.currentFloor + 1);
        commit('SET_CURRENT_ROOM', 1);
      } else {
        // Donjon terminé
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

function getMaxValue(stat) {
  const maxValues = {
    hp: 20,
    exp: 23,
    armor: 4,
    rations: 5,
    gold: 10,
  };
  return maxValues[stat] || Infinity;
}
