import { createStore } from 'vuex';
import gameData from '../data/game-data.json';

const localStoragePlugin = store => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('gameState', JSON.stringify(state));
  });
};

export default createStore({
  state: {
    character: { ...gameData.characters[0] }, // On commence avec le premier personnage
    dungeon: gameData.dungeon,
    currentLevel: 1,
    currentChamber: 1,
  },
  mutations: {
    UPDATE_CHARACTER(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.character[key] += value;
      }
    },
    SET_CURRENT_LEVEL(state, level) {
      state.currentLevel = level;
    },
    SET_CURRENT_CHAMBER(state, chamber) {
      state.currentChamber = chamber;
    },
  },
  actions: {
    applyReward({ commit }, reward) {
      const updates = {};
      reward.split(', ').forEach(effect => {
        const [change, stat] = effect.split(' ');
        const value = parseInt(change);
        switch(stat.toLowerCase()) {
          case 'pv':
            updates.hp = -value; // Perdre des PV
            break;
          case "points d'expérience":
            updates.exp = value;
            break;
          case 'points de vie':
            updates.hp = value;
            break;  
          // Ajoutez d'autres cas pour les différentes statistiques
        }
      });
      commit('UPDATE_CHARACTER', updates);
    },
    nextChamber({ commit, state }) {
      const currentFloor = state.dungeon.floors.find(floor => floor.level === state.currentLevel);
      if (state.currentChamber < currentFloor.rooms.length) {
        commit('SET_CURRENT_CHAMBER', state.currentChamber + 1);
      } else if (state.currentLevel < state.dungeon.floors.length) {
        commit('SET_CURRENT_LEVEL', state.currentLevel + 1);
        commit('SET_CURRENT_CHAMBER', 1);
      } else {
        // Le donjon est terminé
        alert("Félicitations ! Vous avez terminé le donjon !");
      }
    },
    loadGame({ commit }) {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        this.replaceState(JSON.parse(savedState));
      }
    },
  },
  getters: {
    character: state => state.character,
    currentLevel: state => state.currentLevel,
    currentChamber: state => state.currentChamber,
  },
  plugins: [localStoragePlugin]
});
