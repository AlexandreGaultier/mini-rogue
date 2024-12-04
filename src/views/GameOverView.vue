<template>
  <div class="game-over">
    <div class="fog-overlay"></div>
    <div class="content">
      <h1>Game Over</h1>
      <div class="image-container">
        <img src="../assets/img/gameOver/1.webp" alt="Game Over" class="game-over-image">
      </div>
      <p class="death-message">{{ deathMessage }}</p>
      <button @click="returnToMenu">Retour au menu principal</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import gameData from '../data/game-data.json';

const router = useRouter();
const deathMessage = ref('');

let audio;

onMounted(async () => {
  const messages = gameData.gameOverDialogues;
  deathMessage.value = messages[Math.floor(Math.random() * messages.length)];

  const audioModule = await import('../assets/music/gameover1.mp3');
  audio = new Audio(audioModule.default);
  audio.loop = false;
  audio.volume = 0.7;
  audio.play();
});

onUnmounted(() => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
});

function returnToMenu() {
  router.push('/');
}
</script>

<style scoped>

.game-over {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #000;
  color: #8b0000;
  overflow: hidden;
}

.fog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.4"/></svg>');
  mix-blend-mode: overlay;
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 4rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px #ff0000;
}

.image-container {
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
}

.game-over-image {
  width: 50%;
  height: auto;
  border-radius: 10px;
}

.death-message {
  font-size: 1.5rem;
  max-width: 600px;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

button {
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #8b0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #ff0000;
}

@media screen and (max-width: 768px) {
  h1 {
    font-size: 3rem;
  }

  .death-message {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
  }
}
</style>
