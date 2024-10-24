<template>
  <div class="monster-fight">
    <MonsterHealthBar :monster-name="monster.name" :current-health="monsterHealth" :max-health="monster.health" />
    <div class="dice-results" v-if="diceRolled">
      <div class="player-dice">
        <h3>Vos dés:</h3>
        <span v-for="(die, index) in playerDiceResults" :key="index" class="die white-die">{{ die }}</span>
      </div>
      <div class="monster-die">
        <h3>Dé du monstre:</h3>
        <span class="die black-die">{{ monsterDiceResult }}</span>
      </div>
    </div>
    <button @click="rollDice" :disabled="isRolling || combatEnded">Lancer les dés</button>
    <div v-if="combatEnded">
      <p>{{ combatResult }}</p>
      <button @click="collectReward" v-if="playerWon">Récupérer le butin</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import MonsterHealthBar from './MonsterHealthBar.vue';

const props = defineProps({
  monster: {
    type: Object,
    required: true
  }
});

const store = useStore();
const router = useRouter();
const emit = defineEmits(['combat-ended']);

const monsterHealth = ref(props.monster.health);
const playerHealth = computed(() => store.state.character.hp);
const playerArmor = computed(() => store.state.character.armor);
const playerWhiteDice = computed(() => {
  const exp = store.state.character.exp;
  if (exp >= 18) return 3;
  if (exp >= 6) return 2;
  return 1;
});
const combatEnded = ref(false);
const playerWon = ref(false);
const combatResult = ref('');
const diceRolled = ref(false);
const playerDiceResults = ref([]);
const monsterDiceResult = ref(0);
const isRolling = ref(false);

watch(() => playerHealth.value, (newHealth) => {
  if (newHealth <= 0) {
    router.push('/game-over');
  }
});

function rollDice() {
  isRolling.value = true;
  diceRolled.value = false;
  
  setTimeout(() => {
    // Lancer des dés du joueur
    playerDiceResults.value = Array(playerWhiteDice.value).fill().map(() => Math.floor(Math.random() * 6) + 1);
    const playerDamage = playerDiceResults.value.reduce((a, b) => a + b, 0);

    // Lancer du dé du monstre
    monsterDiceResult.value = Math.floor(Math.random() * 6) + 1;

    diceRolled.value = true;

    // Appliquer les dégâts au monstre
    monsterHealth.value = Math.max(0, monsterHealth.value - playerDamage);

    // Attendre un court instant pour que les dés soient affichés avant de terminer le combat
    setTimeout(() => {
      if (monsterHealth.value <= 0) {
        endCombat(true);
      } else if (monsterDiceResult.value > playerArmor.value) {
        // Appliquer les dégâts au joueur
        store.commit('UPDATE_STAT', { stat: 'hp', value: -props.monster.damage });
        if (playerHealth.value <= 0) {
          endCombat(false);
        }
      }

      isRolling.value = false;
    }, 1500); // Changé de 1000 à 1500 ms
  }, 500);
}

function endCombat(playerVictory) {
  combatEnded.value = true;
  playerWon.value = playerVictory;
  combatResult.value = playerVictory ? 'Vous avez vaincu le monstre !' : 'Vous avez été vaincu...';
  if (playerVictory && props.monster.reward) {
    store.dispatch('setMonsterLoot', props.monster.reward);
  }
  emit('combat-ended', playerVictory);
}

function collectReward() {
  emit('loot-collected');
}
</script>

<style scoped>
.monster-fight {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dice-results {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
}

.die {
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 2px solid #000;
  margin-right: 10px;
  font-weight: bold;
  font-size: 18px;
  border-radius: 5px;
}

.white-die {
  background-color: white;
  color: black;
}

.black-die {
  background-color: black;
  color: white;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
