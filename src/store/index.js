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
    dungeon: gameData.dungeon,
    currentLevel: 1,
    currentChamber: 1,
    potionOffer: null
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
    }
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
    }
  },
  getters: {
    character: state => state.character,
    currentLevel: state => state.currentLevel,
    currentChamber: state => state.currentChamber,
    offensivePotion: state => state.character.offensivePotion,
    defensivePotion: state => state.character.defensivePotion,
    potionOffer: state => state.potionOffer
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
