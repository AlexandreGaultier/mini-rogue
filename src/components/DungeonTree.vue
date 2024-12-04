<template>
  <div v-if="dungeon && dungeon.floors" class="dungeon-tree">
    <h3>{{ dungeon.name }}</h3>
    <div v-for="floor in dungeon.floors" :key="floor.level" class="floor">
      <div class="floor-label">Étage {{ floor.level }}</div>
      <div class="rooms">
        <div v-for="room in floor.rooms" :key="room.number" 
             :class="['room', { 'current': isCurrentRoom(floor.level, room.number), 'boss': room.type === 'boss' }]">
          {{ room.number }}
          <span v-if="room.type === 'boss'" class="boss-icon">💀</span>
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
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

h3 {
  color: white;
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.2em;
  text-shadow: 0 0 5px white;
  padding: 5px;
  margin-top: 0px;
  border-radius: 5px;
}

.floor {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.floor-label {
  width: 70px;
  text-align: right;
  font-size: 0.9em;
  color: var(--color-text-secondary);
}

.rooms {
  display: flex;
  gap: 8px;
}

.room {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  position: relative;
  font-size: 0.8em;
  background-color: rgba(60, 60, 60, 0.6);
  color: var(--color-text);
  transition: all 0.3s ease;
}

.room:hover {
  transform: scale(1.1);
  box-shadow: 0 0 5px var(--color-accent);
}

.room.boss {
  border-color: #ff4500;
  background-color: rgba(255, 69, 0, 0.2);
}

.room.current {
  background-color: var(--color-accent);
  color: var(--color-dark-gray);
  box-shadow: 0 0 5px var(--color-accent); /* Réduction de l'intensité du box-shadow */
}

/* Ajout d'un style pour les salles visitées */
.room.visited {
  background-color: rgba(100, 100, 100, 0.8);
}

.boss-icon {
  position: absolute;
  top: -12px;
  right: -4px;
  font-size: 12px;
  text-shadow: 0 0 3px #ff4500;
}

@media screen and (max-width: 768px) {
  .dungeon-tree {
    padding: 0.5rem 0;
    margin: 0 auto;
    width: 85%;
  }

  h3 {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .floor {
    gap: 5px;
    margin-bottom: 8px;
  }

  .floor-label {
    width: 50px;
    font-size: 0.8em;
  }

  .room {
    width: 25px;
    height: 25px;
    font-size: 0.7em;
  }

  .rooms {
    gap: 5px;
  }

  .boss-icon {
    font-size: 10px;
    top: -8px;
    right: -3px;
  }
}
</style>
