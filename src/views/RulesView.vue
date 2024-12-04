<template>
  <div class="rules-view">
    <h1>Les Secrets des Cryptes du Chaos</h1>
    
    <div class="cards-container">
      <div class="card">
        <h2>I. L'Aventurier (Personnage)</h2>
        <ul>
          <li><strong>Vitalité :</strong> Vos points de vie. La mort vous guette à zéro.</li>
          <li><strong>Défense :</strong> Votre capacité à esquiver et encaisser les coups.</li>
          <li><strong>Richesse :</strong> L'or amassé, crucial pour les transactions et certains choix.</li>
          <li><strong>Provisions :</strong> Nourriture pour restaurer votre vitalité en dehors des combats.</li>
          <li><strong>Expérience :</strong> Détermine votre progression et vos améliorations.</li>
        </ul>
      </div>

      <div class="card">
        <h2>II. Les Profondeurs Maudites (Structure)</h2>
        <ul>
          <li>Étages successifs, chacun plus périlleux que le précédent.</li>
          <li>Salles variées, chacune cachant dangers ou trésors.</li>
          <li>Un gardien redoutable à la fin de chaque étage.</li>
        </ul>
      </div>

      <div class="card">
        <h2>III. Les Épreuves (Types de salles)</h2>
        <ul>
          <li><strong>Monstres :</strong> Combattez pour l'or et l'expérience.</li>
          <li><strong>Trésors :</strong> Richesses cachées, mais parfois piégées.</li>
          <li><strong>Pièges :</strong> Testez votre chance et votre agilité.</li>
          <li><strong>Marchands :</strong> Échangez votre or contre des objets précieux.</li>
          <li><strong>Événements :</strong> Le hasard peut être votre allié... ou votre perte.</li>
          <li><strong>Gardiens :</strong> Affrontez ces boss pour progresser plus profondément.</li>
        </ul>
      </div>

      <div class="card">
        <h2>IV. L'Art de la Survie (Gameplay)</h2>
        <ol>
          <li>Choisissez judicieusement votre héros et votre crypte.</li>
          <li>Explorez chaque salle avec prudence, pesez chaque décision.</li>
          <li>Dans le feu du combat, les dés guideront votre destin.</li>
          <li>Gérez vos ressources avec sagesse, la survie en dépend.</li>
          <li>Progressez d'étage en étage, en vainquant chaque gardien.</li>
          <li>Votre ultime défi : le maître des lieux, au cœur des cryptes.</li>
        </ol>
      </div>

      <div class="card">
        <h2>V. Sagesse de l'Aventurier (Astuces)</h2>
        <ul>
          <li>Planifiez votre route, mais restez flexible face à l'imprévu.</li>
          <li>Les provisions sont votre bouée de sauvetage entre deux batailles.</li>
          <li>L'or est précieux : dépensez-le avec discernement chez les marchands.</li>
          <li>La prudence est de mise face aux pièges, mais la récompense peut être grande.</li>
          <li>Améliorez-vous constamment : chaque niveau gagné est crucial.</li>
        </ul>
      </div>

      <div class="card">
        <h2>VI. Le Créateur des Cryptes</h2>
        <p>Ces cryptes mystérieuses ont été forgées par l'esprit torturé de :</p>
        <p class="creator">Alexandre G</p>
        <p>Que votre curseur soit votre guide dans ces sombres dédales...</p>
        <div class="cursor-hint">👆</div>
      </div>
    </div>

    <button @click="goBack" class="back-button">Retourner à l'entrée des Cryptes</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();
const audio = ref(null);

function goBack() {
  router.push('/');
}

async function startAudio() {
  if (!audio.value) {
    const audioModule = await import('../assets/music/background4.mp3');
    audio.value = new Audio(audioModule.default);
    audio.value.loop = true;
    audio.value.volume = store.state.volume;
  }
  
  try {
    await audio.value.play();
  } catch (error) {
    console.error('Erreur lors de la lecture audio:', error);
  }
}

watch(
  () => store.state.volume,
  (newVolume) => {
    if (audio.value) {
      audio.value.volume = newVolume;
    }
  }
);

onMounted(async () => {
  await startAudio();
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value = null;
  }
});
</script>

<style scoped>
.rules-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #f0f0f0;
  background-color: var(--color-background);
  font-family: 'Courier New', monospace;
}

h1 {
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  letter-spacing: 2px;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 1rem;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background-color: var(--color-dark-gray);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: start;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

h2 {
  color: #ff9999;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  border-left: 3px solid #ff9999;
  padding-left: 10px;
}

ul, ol {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}

.back-button {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 2rem auto 0;
  padding: 1rem;
  background-color: var(--color-dark-gray);
  color: #ff9999;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.back-button:hover {
  background-color: var(--color-gray);
}

.creator {
  font-size: 1.2em;
  font-weight: bold;
  color: #ff6b6b;
  text-align: center;
  margin: 1rem 0;
}

.cursor-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.5em;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.card:hover .cursor-hint {
  display: none;
}

.card::after {
  content: "🐁";
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover::after {
  opacity: 1;
  position: absolute;
  font-size: 1.5em;
  animation: move-cursor 5s linear infinite;
}

@keyframes move-cursor {
  0% { left: 10%; top: 90%; }
  25% { left: 90%; top: 90%; }
  50% { left: 90%; top: 10%; }
  75% { left: 10%; top: 10%; }
  100% { left: 10%; top: 90%; }
}

@media screen and (max-width: 768px) {
  .rules-view {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .cards-container {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 1rem;
  }

  .back-button {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
