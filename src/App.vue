<template>
  <div id="container">
    <div class="sound-controls">
      <button class="sound-button" @click="toggleSound" aria-label="Toggle sound">
        <span v-if="isMuted" class="icon">🔇</span>
        <span v-else class="icon">🔊</span>
      </button>
      <input 
        type="range" 
        min="0" 
        max="100" 
        v-model="volume" 
        @input="updateVolume" 
        class="volume-slider"
        :disabled="isMuted"
        aria-label="Volume control"
      >
      <span class="volume-value">{{ volume }}%</span>
    </div>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const volume = ref(70)
const isMuted = ref(false)
const previousVolume = ref(70)

onMounted(() => {
  store.dispatch('initGame')
  updateVolume()
})

function updateVolume() {
  if (!isMuted.value) {
    store.commit('SET_VOLUME', volume.value / 100)
  }
}

function toggleSound() {
  isMuted.value = !isMuted.value
  if (isMuted.value) {
    previousVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = previousVolume.value
  }
  updateVolume()
}
</script>

<style>
:root {
  --color-background: #121212;
  --color-text: #e0e0e0;
  --color-primary: #ff3333;
  --color-secondary: #2a2a2a;
  --color-accent: #3366ff;
  --color-dark-gray: #333333;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  margin: 0;
  padding: 0;
}

#container {
  font-family: 'Courier New', Courier, monospace;
  max-width: 2000px;
  margin: 0 0;
}

header {
  text-align: center;
  margin: 20px 0;
}

h1 {
  color: var(--color-primary);
}

main {
  border-radius: 5px;
  min-height: 80vh;
}

.sound-controls {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-dark-gray);
  padding: 0.5rem;
  border-radius: 1rem;
  z-index: 1000;
}

.sound-button {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-slider {
  width: 100px;
  height: 5px;
  -webkit-appearance: none;
  background: var(--color-secondary);
  border-radius: 5px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  background: var(--color-accent);
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: var(--color-accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-value {
  min-width: 3rem;
  text-align: right;
  font-size: 0.8rem;
  color: var(--color-text);
}

@media screen and (max-width: 768px) {
  #container {
    font-size: 14px;
  }

  main {
    min-height: 100vh;
    padding: 0;
  }

  .sound-controls {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    padding: 0.3rem;
  }

  .volume-slider {
    width: 60px;
  }

  .sound-button {
    font-size: 1.2rem;
    padding: 0.3rem;
  }

  .volume-value {
    min-width: 2.5rem;
    font-size: 0.7rem;
  }
}

</style>
