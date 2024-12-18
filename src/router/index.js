import { createRouter, createWebHistory } from 'vue-router'
import CharacterSelectionView from '../views/CharacterSelectionView.vue'
import GameView from '../views/GameView.vue'
import GameOverView from '../views/GameOverView.vue'
import RulesView from '../views/RulesView.vue'
import VictoryView from '../views/VictoryView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'CharacterSelection',
    component: CharacterSelectionView
  },
  {
    path: '/game',
    name: 'Game',
    component: GameView
  },
  {
    path: '/game-over',
    name: 'GameOver',
    component: GameOverView
  },
  {
    path: '/rules',
    name: 'Rules',
    component: RulesView
  },
  {
    path: '/victory',
    name: 'Victory',
    component: VictoryView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
