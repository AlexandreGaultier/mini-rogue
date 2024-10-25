<template>
  <div class="character-selection">
    <div class="title-overlay" :class="{ 'fade-out': gameStarted }" @click="startGame">
      <h1 class="game-title">Crypts of Chaos</h1>
      <p class="start-prompt">Cliquez pour commencer</p>
    </div>
    <div class="game-content">
      <h2>Choisissez votre héros</h2>
      <div class="characters">
        <div v-for="character in characters" :key="character.id" 
             class="character" 
             :class="{ selected: selectedCharacter === character }"
             @click="selectCharacter(character)">
          <h3>{{ character.name }}</h3>
          <p>PV: {{ character.hp }}/{{ character.maxHp }}</p>
          <p>Armure: {{ character.armor }}</p>
          <p>Or de départ: {{ character.gold }}</p>
          <p>Rations de départ: {{ character.rations }}</p>
          <button @click.stop="showLore(character)">Lire le lore</button>
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
          <button @click.stop="showLore(dungeon, 'dungeon')">Lire le lore</button>
        </div>
      </div>

      <button @click="startAdventure" :disabled="!selectedCharacter || !selectedDungeon">
        Commencer l'aventure
      </button>
    </div>

    <div v-if="showLorePopup" class="lore-popup">
      <div class="lore-content">
        <h3>{{ currentLoreItem.name }}</h3>
        <p>{{ currentLoreItem.lore }}</p>
        <button @click="closeLorePopup" class="close-button">X</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import gameData from '../data/game-data.json';

const store = useStore();
const router = useRouter();

const characters = ref(gameData.characters);
const dungeons = ref(gameData.dungeons);
const selectedCharacter = ref(null);
const selectedDungeon = ref(null);
const gameStarted = ref(false);
const showLorePopup = ref(false);
const currentLoreItem = ref(null);

let audio;

function selectCharacter(character) {
  selectedCharacter.value = character;
}

function selectDungeon(dungeon) {
  selectedDungeon.value = dungeon;
}

async function startGame() {
  gameStarted.value = true;
  await startAudio();
}

function startAdventure() {
  if (selectedCharacter.value && selectedDungeon.value) {
    store.dispatch('initializeGame', {
      character: selectedCharacter.value,
      dungeon: selectedDungeon.value
    });
    router.push('/game');
  }
}

function showLore(item, type) {
  currentLoreItem.value = item;
  showLorePopup.value = true;
}

function closeLorePopup() {
  showLorePopup.value = false;
  currentLoreItem.value = null;
}

async function startAudio() {
  if (!audio) {
    const audioModule = await import('../assets/music/intro.mp3');
    audio = new Audio(audioModule.default);
    audio.loop = true;
    audio.volume = 0.7;
  }
  
  try {
    await audio.play();
  } catch (error) {
    console.error('Erreur lors de la lecture audio:', error);
  }
}

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
  justify-content: flex-start;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  overflow: hidden;
  position: relative;
}

.title-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 1.5s ease-in-out, transform 1.5s ease-in-out;
}
.title-overlay:hover {
  cursor: pointer;
}

.title-overlay.fade-out {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}

.game-title {
  font-size: 6rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5rem;
  animation: glow 2s ease-in-out infinite alternate;
}

.start-prompt {
  font-size: 1.5rem;
  margin-top: 2rem;
  animation: blink 1s infinite;
}

.game-content {
  padding-top: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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
  margin-bottom: 20px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px var(--color-primary), 0 0 35px var(--color-primary), 0 0 40px var(--color-primary), 0 0 50px var(--color-primary), 0 0 75px var(--color-primary);
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px var(--color-primary), 0 0 70px var(--color-primary), 0 0 80px var(--color-primary), 0 0 100px var(--color-primary), 0 0 150px var(--color-primary);
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.lore-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.lore-content {
  background-color: var(--color-dark-gray);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--color-accent);
  border: none;
  color: var(--color-text);
  font-size: 18px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character button {
  margin-top: 10px;
  padding: 5px 10px;
  font-size: 14px;
}

.dungeon button {
  margin-top: 10px;
  padding: 5px 10px;
  font-size: 14px;
}
</style>
