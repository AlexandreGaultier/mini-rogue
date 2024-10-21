<template>
  <div class="monster-health-bar">
    <h3>{{ monsterName }}</h3>
    <div class="health-bar">
      <div class="health-bar-fill" :style="{ width: healthPercentage + '%' }"></div>
      <span class="health-text">{{ currentHealth }} / {{ maxHealth }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  monsterName: {
    type: String,
    required: true
  },
  currentHealth: {
    type: Number,
    required: true
  },
  maxHealth: {
    type: Number,
    required: true
  }
});

const healthPercentage = computed(() => {
  return (props.currentHealth / props.maxHealth) * 100;
});
</script>

<style scoped>
.monster-health-bar {
  background-color: var(--color-dark-gray);
  border: 1px solid var(--color-accent);
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--color-text);
}

.health-bar {
  background-color: #444;
  border-radius: 5px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.health-bar-fill {
  background-color: #e74c3c;
  height: 100%;
  transition: width 0.3s ease;
}

.health-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
