<template>
  <div v-if="dungeon && dungeon.floors" class="dungeon-tree">
    <h3>{{ dungeon.name }}</h3>
    <div v-for="floor in dungeon.floors" :key="floor.level" class="floor">
      <div class="floor-label">Étage {{ floor.level }}</div>
      <div class="rooms">
        <div v-for="room in floor.rooms" :key="room.number" 
             :class="['room', { 'current': isCurrentRoom(floor.level, room.number), 'boss': room.type === 'boss' }]">
          {{ room.number }}
          <span v-if="room.type === 'boss'" class="boss-icon">👑</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const dungeon = computed(() => store.state.dungeon);
const currentFloor = computed(() => store.state.currentFloor);
const currentRoom = computed(() => store.state.currentRoom);

function isCurrentRoom(floorLevel, roomNumber) {
  return currentFloor.value === floorLevel && currentRoom.value === roomNumber;
}
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
