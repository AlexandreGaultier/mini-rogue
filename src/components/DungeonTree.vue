<template>
  <div class="dungeon-tree">
    <h3>{{ dungeon.name }}</h3>
    <div class="current-location">Niveau {{ currentLevel }} - Salle {{ currentChamber }}</div>
    <div class="floors">
      <div v-for="floor in dungeon.floors" :key="floor.level" class="floor">
        <div class="level">Niveau {{ floor.level }}</div>
        <div class="rooms">
          <div v-for="room in floor.rooms" :key="room.number" 
               :class="['room', room.type, { 'current': floor.level === currentLevel && room.number === currentChamber }]">
            {{ room.number }}
            <span v-if="room.type === 'boss'" class="boss-icon">👑</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  dungeon: {
    type: Object,
    required: true
  },
  currentLevel: {
    type: Number,
    required: true
  },
  currentChamber: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.dungeon-tree {
  background-color: var(--color-dark-gray);
  border: 1px solid var(--color-accent);
  border-radius: 5px;
  padding: 15px;
}

.current-location {
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--color-accent);
}

.floors {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}

.floor {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level {
  width: 70px;
  text-align: right;
  font-size: 0.9em;
}

.rooms {
  display: flex;
  gap: 8px;
}

.room {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  position: relative;
  font-size: 0.8em;
}

.room.boss {
  border-color: gold;
}

.room.current {
  background-color: var(--color-accent);
  color: var(--color-dark-gray);
}

.boss-icon {
  position: absolute;
  top: -12px;
  right: -4px;
  font-size: 10px;
}
</style>
