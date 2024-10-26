<template>
  <div class="not-found">
    <h1>Perdu dans les ténèbres</h1>
    <p>{{ loreText }}</p>
    <button @click="returnToEntrance">Suivre la lumière</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gameData from '../data/game-data.json';

const router = useRouter();
const loreText = ref('');

onMounted(() => {
  const randomLore = gameData.dungeonLore[Math.floor(Math.random() * gameData.dungeonLore.length)];
  loreText.value = `${randomLore} Mais soudain, une lueur divine apparaît. La divinité "AG" vous montre le chemin pour sortir de ce labyrinthe maudit.`;
});

function returnToEntrance() {
  router.push('/');
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 20px;
  background-color: var(--color-background);
  color: var(--color-text);
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 600px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: var(--color-accent-hover);
}
</style>
