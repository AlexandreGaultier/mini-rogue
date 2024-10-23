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
  },
  mutations: {
    UPDATE_STAT(state, { stat, value }) {
      if (stat in state.character) {
        const maxValue = getMaxValue(stat);
        state.character[stat] = Math.max(0, Math.min(state.character[stat] + value, maxValue));
      } else {
        console.error(`Statistique non reconnue: ${stat}`);
      }
    },
    SET_CURRENT_LEVEL(state, level) {
      state.currentLevel = level;
    },
    SET_CURRENT_CHAMBER(state, chamber) {
      state.currentChamber = chamber;
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
    REGENERATE_TILES(state) {
      // Cette fonction sera appelée pour régénérer les tuiles
      // Vous pouvez implémenter la logique de génération ici si vous le souhaitez
      // ou laisser le composant Chamber s'en charger
    },
    INCREMENT_FLOOR(state) {
      state.currentFloor++;
      state.currentChamber = 1;
    },
    SET_CURRENT_FLOOR(state, floor) {
      state.currentFloor = floor;
    },
    SET_CURRENT_ROOM(state, room) {
      state.currentRoom = room;
    },
  },
  actions: {
    applyReward({ commit, dispatch }, reward) {
      console.log("Récompense appliquée:", reward);
      if (reward && reward.effect) {
        Object.entries(reward.effect).forEach(([stat, value]) => {
          console.log(`Mise à jour de la statistique: ${stat} avec la valeur: ${value}`);
          if (stat === 'offensivePotion' || stat === 'defensivePotion') {
            dispatch('offerNewPotion', { type: stat, value });
          } else {
            commit('UPDATE_STAT', { stat, value });
          }
        });
      } else {
        console.error("Format de récompense invalide:", reward);
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
    nextChamber({ commit, state, getters }) {
      const currentFloor = getters.currentFloor;
      if (state.currentChamber < currentFloor.rooms.length) {
        commit('SET_CURRENT_CHAMBER', state.currentChamber + 1);
      } else if (state.currentLevel < state.dungeon.floors.length) {
        commit('SET_CURRENT_LEVEL', state.currentLevel + 1);
        commit('SET_CURRENT_CHAMBER', 1);
      } else {
        // Le donjon est terminé
        return 'finished';
      }
      commit('REGENERATE_TILES');
      return 'next';
    },
    nextFloor({ commit }) {
      commit('INCREMENT_FLOOR');
    },
  },
  getters: {
    character: state => state.character,
    currentLevel: state => state.currentLevel,
    currentChamber: state => state.currentChamber,
    offensivePotion: state => state.character.offensivePotion,
    defensivePotion: state => state.character.defensivePotion,
    potionOffer: state => state.potionOffer,
    currentFloor: (state) => {
      return state.dungeon.floors.find(floor => floor.level === state.currentLevel);
    }
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
