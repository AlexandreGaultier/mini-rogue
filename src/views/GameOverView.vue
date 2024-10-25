<template>
  <div class="game-over">
    <h1>Game Over</h1>
    <p class="death-message">{{ deathMessage }}</p>
    <button @click="returnToMenu">Retour au menu principal</button>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #000;
  color: #8b0000;
}

h1 {
  font-size: 4rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px #ff0000;
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
</style>
