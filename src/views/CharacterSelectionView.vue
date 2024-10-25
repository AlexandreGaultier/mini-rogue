<template>
  <div class="character-selection">
    <h2>Choisissez votre héros</h2>
    <div class="characters">
      <div v-for="character in characters" :key="character.id" 
           class="character" 
           :class="{ selected: selectedCharacter === character }"
           @click="selectCharacter(character)">
        <h3>{{ character.name }}</h3>
        <p>PV: {{ character.hp }}/{{ character.maxHp }}</p>
        <p>Armure: {{ character.armor }}</p>
        <p>Dés blancs: {{ character.whiteDice }}</p>
      </div>
    </div>

    <h2>Choisissez votre donjon</h2>
    <div class="dungeons">
      <div v-for="dungeon in dungeons" :key="dungeon.id"
           class="dungeon"
           :class="{ selected: selectedDungeon === dungeon }"
           @click="selectDungeon(dungeon)">
        <h3>{{ dungeon.name }}</h3>
        <p>Difficulté: {{ dungeon.difficulty }}</p>
        <p>Étages: {{ dungeon.floors.length }}</p>
      </div>
    </div>

    <button @click="startGame" :disabled="!selectedCharacter || !selectedDungeon">
      Commencer l'aventure
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import gameData from '../data/game-data.json';

const store = useStore();
const router = useRouter();

const characters = ref(gameData.characters);
const dungeons = ref(gameData.dungeons);
const selectedCharacter = ref(null);
const selectedDungeon = ref(null);

function selectCharacter(character) {
  selectedCharacter.value = character;
}

function selectDungeon(dungeon) {
  selectedDungeon.value = dungeon;
}

function startGame() {
  if (selectedCharacter.value && selectedDungeon.value) {
    store.commit('SET_CHARACTER', selectedCharacter.value);
    store.commit('SET_DUNGEON', selectedDungeon.value);
    store.commit('SET_CURRENT_LEVEL', 1);
    store.commit('SET_CURRENT_CHAMBER', 1);
    router.push('/game');
  }
}

let audio;
const isMusicPlaying = ref(false);

onMounted(async () => {
  const audioModule = await import('../assets/music/intro.mp3');
  audio = new Audio(audioModule.default);
  audio.loop = true;
  audio.volume = 0.7;
  audio.play();
});

onUnmounted(() => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
});
</script>

<style scoped>
.character-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--color-background);
  color: var(--color-text);
}

.characters, .dungeons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.character, .dungeon {
  background-color: var(--color-dark-gray);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character.selected, .dungeon.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
}

button {
  padding: 10px 20px;
  font-size: 18px;
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
