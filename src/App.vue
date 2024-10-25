<template>
  <div id="container">
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

onMounted(() => {
  store.dispatch('initGame')
})
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
</style>
