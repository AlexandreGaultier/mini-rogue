<template>
  <div class="character-selection">
    <div class="title-overlay" :class="{ 'fade-out': gameStarted }" @click="startGame">
      <h1 class="game-title">Crypts of Chaos</h1>
      <p class="start-prompt">Cliquez pour commencer</p>
    </div>
    <div class="game-content">
      <div class="buttons-container">
      <button @click="startAdventure" :disabled="!selectedCharacter || !selectedDungeon">
        Entrer dans le donjon
        </button>
        <button @click="goToRules" class="rules-button">Comment jouer ?</button>
      </div>
      <div class="sections-container">
        <div class="characters-section">
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
        </div>
        <div class="dungeons-section">
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
        </div>
      </div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import gameData from '../data/game-data.json';

const store = useStore();
const router = useRouter();

const characters = ref(gameData.characters);
const dungeons = ref(gameData.dungeons);
const selectedCharacter = ref(null);
const selectedDungeon = ref(dungeons.value[0]); // Sélectionne le premier donjon par défaut
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

function goToRules() {
  router.push('/rules');
}

onMounted(() => {
  // Sélectionne un personnage aléatoire parmi ceux qui ne sont pas désactivés
  const availableCharacters = characters.value.filter((_, index) => index < 4);
  const randomIndex = Math.floor(Math.random() * availableCharacters.length);
  selectedCharacter.value = availableCharacters[randomIndex];
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
  padding: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh; /* Utilise min-height au lieu de height */
  overflow-y: auto; /* Permet le défilement vertical si nécessaire */
}

.buttons-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.sections-container {
  display: flex;
  flex-direction: column; /* Change en colonne */
  width: 100%;
  gap: 2rem; /* Ajoute un espace entre les sections */
}

.characters-section, .dungeons-section {
  width: 100%; /* Prend toute la largeur */
  overflow-y: visible; /* Supprime le défilement */
}

h2 {
  font-size: 1.5rem; /* Réduit davantage la taille des titres h2 */
  color: var(--color-text);
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 0 0.2rem var(--color-text);
}

.characters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
}

.character {
  background-color: rgba(26, 26, 26, 0.8);
  border: none;
  box-shadow: 0 0 0.1rem #ffffff3b;
  border-radius: 10px;
  padding: 1.5rem 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  aspect-ratio: 3 / 1.5;
  font-size: 0.8rem;
  width: calc(50% - 0.8rem);
  min-width: 250px;
  max-width: 300px;
  margin: 0;
}

.character:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 0.2rem #ffffff3b;
}
.character.selected {
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 20px var(--color-accent);
}

.character:nth-child(n+5) {
  opacity: 0.5;
  pointer-events: none;
}

.character:nth-child(n+5) button {
  pointer-events: auto;
  opacity: 1;
}

.dungeons {
  display: flex;
  flex-direction: row;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}

.dungeon {
  background-color: rgba(26, 26, 26, 0.8);
  border: none;
  box-shadow: 0 0 0.1rem #ffffff3b;
  border-radius: 10px;
  padding: 1.5rem 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  aspect-ratio: 3 / 1.5;
  font-size: 0.8rem;
  width: calc(50% - 0.8rem);
  min-width: 250px;
  max-width: 300px;
  margin: 0;
}

.dungeon:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 0.2rem #ffffff3b;
}

.dungeon.selected {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary);
}

.dungeon h3 {
  color: var(--color-primary);
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.character h3, .dungeon h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.character p, .dungeon p {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  background-color: var(--color-primary);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

button:hover {
  background-color: var(--color-secondary);
  transform: translateY(-2px);
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

.character button, .dungeon button {
  margin-top: auto;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: rgba(60, 60, 60, 0.8);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character button:hover, .dungeon button:hover {
  background-color: rgba(80, 80, 80, 0.8);
}

.game-content > button {
  margin-bottom: 1rem; /* Réduit l'espace sous le bouton */
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: var(--color-primary);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%; /* Le bouton prend toute la largeur */
  max-width: 400px; /* Limite la largeur maximale */
}

.game-content > button:hover {
  background-color: var(--color-secondary);
}

.game-content > button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.rules-button {
  margin-top: 1rem;
  background-color: #ffffff3b;
}

.rules-button:hover {
  background-color: #ffffff6b;
}

@media screen and (max-width: 768px) {
  .game-title {
    font-size: 3rem;
    letter-spacing: 0.2rem;
  }

  .start-prompt {
    font-size: 1rem;
  }

  .game-content {
    padding: 1rem 0;
  }

  .characters {
    gap: 1rem;
    padding: 0.5rem;
  }

  .character {
    width: 100%;
    min-width: unset;
    aspect-ratio: auto;
    padding: 1rem;
  }

  .character h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .character p {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .buttons-container {
    flex-direction: column;
    gap: 0.5rem;
  }

  button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .dungeons {
    gap: 1rem;
    padding: 0.5rem;
  }

  .dungeon {
    width: 100%;
    min-width: unset;
    aspect-ratio: auto;
    padding: 1rem;
  }

  .dungeon h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .dungeon p {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }
}
</style>
