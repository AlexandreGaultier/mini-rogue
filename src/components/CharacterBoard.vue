<template>
  <div class="character-board">
    <div class="character-header">
      <h2>{{ character.name }}</h2>
      <div class="dice-section">
        <span>Dés: {{ character.whiteDice }}</span>
      </div>
    </div>
    <div class="board-content">
      <div class="gauges-and-potions">
        <div class="gauge-row">
          <div class="gauge exp-gauge">
            <span>EXP: {{ character.exp }}/23</span>
            <div class="gauge-points" :style="{ width: `${(character.exp / 23) * 100}%` }"></div>
          </div>
        </div>
        <div class="gauge-row">
          <div class="gauge armor-gauge">
            <span>Armure: {{ character.armor }}/4</span>
            <div class="gauge-points" :style="{ width: `${(character.armor / 4) * 100}%` }"></div>
          </div>
          <div class="gauge hp-gauge">
            <span>HP: {{ character.hp }}/20</span>
            <div class="gauge-points" :style="{ width: `${(character.hp / 20) * 100}%` }"></div>
          </div>
        </div>
        <div class="gauge-row">
          <div class="gauge rations-gauge">
            <span>Rations: {{ character.rations }}/5</span>
            <div class="gauge-points" :style="{ width: `${(character.rations / 5) * 100}%` }"></div>
          </div>
          <div class="gauge gold-gauge">
            <span>Or: {{ character.gold }}/10</span>
            <div class="gauge-points" :style="{ width: `${(character.gold / 10) * 100}%` }"></div>
          </div>
        </div>
        <div class="potions-section">
          <div class="potion-group">
            <span>Offensive:</span>
            <div class="potion-points">
              <PotionIndicator name="Feu" type="fire" :filled="character.offensivePotion === 'Potion de feu'" />
              <PotionIndicator name="Givre" type="frost" :filled="character.offensivePotion === 'Potion de givre'" />
              <PotionIndicator name="Poison" type="poison" :filled="character.offensivePotion === 'Potion de poison'" />
              <PotionIndicator name="Acide" type="acid" :filled="character.offensivePotion === 'Potion d\'acide'" />
            </div>
          </div>
          <div class="potion-group">
            <span>Défensive:</span>
            <div class="potion-points">
              <PotionIndicator name="Soin" type="healing" :filled="character.defensivePotion === 'Potion de soin'" />
              <PotionIndicator name="Bouclier" type="shield" :filled="character.defensivePotion === 'Potion de bouclier'" />
              <PotionIndicator name="Invisibilité" type="invisibility" :filled="character.defensivePotion === 'Potion d\'invisibilité'" />
              <PotionIndicator name="Résistance" type="resistance" :filled="character.defensivePotion === 'Potion de résistance'" />
            </div>
          </div>
        </div>
      </div>
      <div class="skills-section">
        <h3>Compétences:</h3>
        <ul>
          <li v-for="skill in character.skills" :key="skill.name">
            <strong>{{ skill.name }}</strong> ({{ skill.usageType }})
            <p>{{ skill.description }}</p>
          </li>
        </ul>
      </div>
      <div class="potions">
        <div class="offensive-potion">
          Potion offensive: {{ offensivePotion || 'Aucune' }}
        </div>
        <div class="defensive-potion">
          Potion défensive: {{ defensivePotion || 'Aucune' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import PotionIndicator from './PotionIndicator.vue';

const store = useStore();
const character = computed(() => store.getters.character);

const offensivePotion = computed(() => store.getters.offensivePotion);
const defensivePotion = computed(() => store.getters.defensivePotion);
</script>

<style scoped>
.character-board {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Réduit de 20px à 10px */
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-header h2 {
  margin: 0;
}

.board-content {
  display: flex;
  gap: 15px; /* Réduit de 20px à 15px */
}

.gauges-and-potions {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 10px; /* Réduit de 15px à 10px */
}

.skills-section {
  flex: 1;
  background-color: var(--color-secondary);
  border-radius: 5px;
  padding: 10px; /* Réduit de 15px à 10px */
}

.gauge-row {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.gauge {
  background-color: #444;
  border-radius: 5px;
  height: 25px;
  position: relative;
  overflow: hidden;
}

.gauge.exp-gauge {
  flex: 1; /* La barre d'EXP prend toute la largeur disponible */
}

.gauge.armor-gauge,
.gauge.rations-gauge {
  flex: 1;  /* Représente 1/3 de l'espace dans leur ligne */
}

.gauge.hp-gauge,
.gauge.gold-gauge {
  flex: 2;  /* Représente 2/3 de l'espace dans leur ligne */
}

.gauge span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.gauge-points {
  height: 100%;
  width: 0;
  transition: width 0.3s ease;
}

.exp-gauge .gauge-points { background-color: #64B5F6; }
.hp-gauge .gauge-points { background-color: #EF5350; }
.armor-gauge .gauge-points { background-color: #90A4AE; }
.gold-gauge .gauge-points { background-color: #FFD54F; }
.rations-gauge .gauge-points { background-color: #8D6E63; }

/* Supprimez les styles pour .point, car nous n'utiliserons plus de points individuels */

.potions-section {
  margin-top: 10px; /* Réduit de 25px à 10px */
  background-color: var(--color-secondary);
  border-radius: 5px;
  padding: 10px;
}

.potion-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.potion-group span {
  font-weight: bold;
  margin-bottom: 5px;
}

.potion-points {
  display: flex;
  justify-content: space-between;
}

ul {
  list-style-type: none;
  padding-left: 0;
  font-size: 0.9em;
}

li {
  margin-bottom: 10px;
}

li p {
  margin-top: 5px;
  font-size: 0.9em;
  color: var(--color-text-secondary);
}

.hp-gauge .gauge-points, .gold-gauge .gauge-points {
  gap: 3px;
}

.potions {
  margin-top: 10px;
}
.offensive-potion, .defensive-potion {
  margin: 5px 0;
}
</style>
