<template>
  <div class="victory-view">
    <h1>Victoire</h1>
    <div class="victory-text" v-html="victoryText"></div>
    <button @click="returnToMenu">Retour au menu principal</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import gameData from '../data/game-data.json';

const router = useRouter();
const store = useStore();

const victoryText = ref('');

onMounted(() => {
  const character = store.state.character;
  const characterData = gameData.characters.find(c => c.name === character.name);
  
  if (characterData) {
    victoryText.value = generateVictoryText(characterData);
  }
});

function generateVictoryText(characterData) {
  const { name, lore } = characterData;
  
  let text = `${name}, vous avez survécu aux horreurs du donjon, mais à quel prix ? `;
  
  switch (name) {
    case 'Rogue':
      text += `L'artefact maudit que vous portiez semble s'être nourri des ténèbres du donjon, amplifiant vos cauchemars. Vous émergez victorieux, mais les ombres qui vous entourent semblent plus épaisses que jamais. La malédiction s'est-elle vraiment dissipée, ou a-t-elle simplement évolué, fusionnant avec votre être même ?`;
      break;
    case 'Mage':
      text += `Votre quête d'immortalité vous a mené dans les profondeurs les plus sombres, où vous avez goûté à des pouvoirs au-delà de l'entendement. Mais alors que vous sortez du donjon, vous réalisez que votre corps se désagrège lentement, votre essence se dispersant dans l'éther. Avez-vous vraiment trouvé l'immortalité, ou êtes-vous condamné à une existence éthérée, à jamais séparé du monde des vivants ?`;
      break;
    case 'Prêtresse':
      text += `Les ténèbres que vous avez embrassées ont résonné avec la noirceur du donjon, amplifiant vos pouvoirs au-delà de vos espérances. Mais alors que vous émergez victorieux, vous réalisez que votre toucher, jadis source de guérison, ne provoque désormais que souffrance et corruption. Votre rédemption est-elle encore possible, ou êtes-vous devenue l'incarnation même du mal que vous cherchiez à combattre ?`;
      break;
    case 'Croisé':
      text += `Chaque pas dans le donjon a été une torture, les visages de ceux que vous avez injustement condamnés vous hantant à chaque instant. Votre victoire sonne creux, car vous réalisez que votre quête de rédemption n'a fait qu'ajouter à votre fardeau. Les âmes que vous avez libérées dans le donjon se sont attachées à vous, leurs murmures incessants vous rappelant que votre pénitence ne fait que commencer.`;
      break;
    case 'Barbare':
      text += `La bête en vous s'est déchaînée dans les profondeurs du donjon, se nourrissant du chaos et de la violence. Vous émergez victorieux, mais vous sentez que le contrôle vous échappe. La malédiction de votre tribu s'est renforcée, et vous craignez que chaque bataille future ne vous rapproche inexorablement de la perte totale de votre humanité.`;
      break;
    case 'Archer':
      text += `Votre vengeance vous a guidé à travers les horreurs du donjon, mais alors que vous en émergez, vous réalisez que votre cœur est aussi froid et vide que les salles que vous avez traversées. Le Croisé que vous poursuiviez reste insaisissable, et vous vous demandez si vous n'êtes pas devenu le monstre que vous chassiez, votre âme corrompue par la même obscurité que vous cherchiez à combattre.`;
      break;
    case 'Alchimiste':
      text += `Les secrets alchimiques que vous avez découverts dans les profondeurs du donjon dépassent vos rêves les plus fous. Mais chaque formule apprise, chaque élixir créé, semble vous rapprocher davantage de l'abomination que vous avez créée. Votre corps se transforme lentement, fusionnant avec vos créations. Avez-vous trouvé la clé de la rédemption, ou êtes-vous en train de devenir la prochaine horreur à hanter ces couloirs maudits ?`;
      break;
    case 'Druide':
      text += `La corruption que vous avez affrontée dans le donjon a résonné avec les ténèbres grandissantes en vous. Votre connexion avec la nature s'est transformée en quelque chose de tordu et de malsain. Les plantes pourrissent à votre toucher, et les animaux fuient votre présence. Avez-vous sauvé votre sanctuaire, ou êtes-vous devenu la source même de la corruption que vous cherchiez à éradiquer ?`;
      break;
    default:
      text += `Vous avez survécu aux horreurs inimaginables du donjon, mais à quel prix ? Les ténèbres que vous avez affrontées semblent vous avoir suivi, s'accrochant à votre âme comme une seconde peau. Votre victoire a un goût amer, car vous réalisez que vous ne serez plus jamais la même personne.`;
  }
  
  text += `\n\nAlors que vous quittez ce lieu maudit, vous vous demandez si les véritables épreuves ne font que commencer. Car les secrets que vous avez découverts et les horreurs que vous avez vécues continueront à vous hanter, faisant de vous à la fois un héros et un paria dans le monde que vous avez juré de protéger.`;
  
  return text;
}

function returnToMenu() {
  router.push('/');
}
</script>

<style scoped>
.victory-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  padding: 2rem;
  text-align: center;
}

.victory-text {
  max-width: 800px;
  margin: 2rem 0;
  line-height: 1.6;
  font-size: 1.1rem;
}

button {
  background-color: var(--color-accent);
  color: var(--color-text);
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: var(--color-primary);
}

@media screen and (max-width: 768px) {
  .victory-text {
    font-size: 1rem;
    margin: 1rem 0;
  }

  button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
