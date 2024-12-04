<template>
  <div class="character-board">
    <div class="character-header">
      <h2>{{ character.name }}</h2>
      <div class="dice-section">Dés: {{ character.whiteDice }}</div>
    </div>
    <div class="gauges">
      <div class="gauge exp-gauge">
        <div class="gauge-label">EXP: {{ character.exp }}/23</div>
        <div class="gauge-bar">
          <div class="gauge-fill" :style="{ width: `${(character.exp / 23) * 100}%` }"></div>
        </div>
      </div>
      <div class="gauge-row">
        <div class="gauge armor-gauge">
          <div class="gauge-label">Armure: {{ character.armor }}/4</div>
          <div class="gauge-bar">
            <div class="gauge-fill" :style="{ width: `${(character.armor / 4) * 100}%` }"></div>
          </div>
        </div>
        <div class="gauge hp-gauge">
          <div class="gauge-label">HP: {{ character.hp }}/20</div>
          <div class="gauge-bar">
            <div class="gauge-fill" :style="{ width: `${(character.hp / 20) * 100}%` }"></div>
          </div>
        </div>
      </div>
      <div class="gauge-row">
        <div class="gauge rations-gauge">
          <div class="gauge-label">Rations: {{ character.rations }}/5</div>
          <div class="gauge-bar">
            <div class="gauge-fill" :style="{ width: `${(character.rations / 5) * 100}%` }"></div>
          </div>
        </div>
        <div class="gauge gold-gauge">
          <div class="gauge-label">Or: {{ character.gold }}/10</div>
          <div class="gauge-bar">
            <div class="gauge-fill" :style="{ width: `${(character.gold / 10) * 100}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const character = computed(() => store.getters.character);
</script>

<style scoped>
.character-board {
  background-color: #2c3e50;
  border-radius: 8px;
  padding: 15px;
  color: white;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.character-header h2 {
  margin: 0;
  font-size: 1.2em;
}

.dice-section {
  font-size: 0.9em;
}

.gauges {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gauge-row {
  display: flex;
  gap: 10px;
}

.gauge {
  flex: 1;
}

.gauge-label {
  font-size: 0.8em;
  margin-bottom: 2px;
}

.gauge-bar {
  height: 15px;
  background-color: #34495e;
  border-radius: 7px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.exp-gauge .gauge-fill { background-color: #3498db; }
.hp-gauge .gauge-fill { background-color: #e74c3c; }
.armor-gauge .gauge-fill { background-color: #95a5a6; }
.gold-gauge .gauge-fill { background-color: #f1c40f; }
.rations-gauge .gauge-fill { background-color: #d35400; }

@media screen and (max-width: 768px) {
  .character-board {
    padding: 0.5rem;
    width: 85%;
    margin: 0 auto;
  }

  .character-header h2 {
    font-size: 1rem;
  }

  .level-section {
    font-size: 0.8em;
  }

  .gauge-label {
    font-size: 0.7em;
  }

  .gauge-bar {
    height: 12px;
  }

  .gauges {
    gap: 8px;
  }

  .gauge-row {
    gap: 8px;
  }
}
</style>
