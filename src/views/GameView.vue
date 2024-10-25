<template>
  <div class="game-view">
    <div class="game-board">
      <div class="left-panel">
        <DungeonTree 
          :dungeon="dungeon" 
          :currentLevel="currentLevel" 
          :currentChamber="currentChamber"
        />
        <CharacterBoard :character="character" />
      </div>
      <div class="main-panel">
        <Chamber :chamberNumber="currentChamber" @chamber-completed="nextChamber" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Chamber from '../components/Chamber.vue';
import CharacterBoard from '../components/CharacterBoard.vue';
import DungeonTree from '../components/DungeonTree.vue';
import gameData from '../data/game-data.json';

const store = useStore();
const router = useRouter();

const dungeon = computed(() => store.state.dungeon);
const currentLevel = ref(1);
const currentChamber = ref(1);
const character = computed(() => store.state.character);

watch(() => character.value.hp, (newHp) => {
  if (newHp <= 0) {
    store.dispatch('resetCharacter');
    router.push('/game-over');
  }
});

let audio;

onMounted(async () => {
  const audioModule = await import('../assets/music/background1.mp3');
  audio = new Audio(audioModule.default);
  audio.loop = true;
  audio.volume = 0.3;
  audio.play();
});

onUnmounted(() => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
});

function nextChamber() {
  const currentFloor = gameData.dungeon.floors.find(floor => floor.level === currentLevel.value);
  if (currentChamber.value < currentFloor.rooms.length) {
    currentChamber.value++;
  } else {
    if (currentLevel.value < gameData.dungeon.floors.length) {
      currentLevel.value++;
      currentChamber.value = 1;
    } else {
      alert("Félicitations ! Vous avez terminé le donjon !");
    }
  }
}
</script>

<style scoped>
.game-view {
  display: flex;
  background-color: var(--color-background);
  overflow: hidden;
}

.game-board {
  display: flex;
  width: 100%;
  height: calc(100vh - 6rem);
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
}

:deep(.chamber) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.dungeon-tree),
:deep(.chamber),
:deep(.character-board) {
  background-color: var(--color-dark-gray);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

:deep(.dungeon-tree):hover,
:deep(.chamber):hover,
:deep(.character-board):hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
</style>
