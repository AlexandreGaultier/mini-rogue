<template>
  <div class="potion-indicator" :class="{ 'filled': filled }">
    <div :class="['point', type]"></div>
    <span class="potion-name">{{ name }}</span>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  type: String,
  filled: Boolean
});
</script>

<style scoped>
.potion-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.point {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-bottom: 6px;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.potion-name {
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
}

.fire { background-color: rgba(255, 87, 34, 0.4); }
.frost { background-color: rgba(3, 169, 244, 0.4); }
.poison { background-color: rgba(76, 175, 80, 0.4); }
.acid { background-color: rgba(255, 193, 7, 0.4); }
.healing { background-color: rgba(244, 67, 54, 0.4); }
.shield { background-color: rgba(63, 81, 181, 0.4); }
.invisibility { background-color: rgba(156, 39, 176, 0.4); }
.resistance { background-color: rgba(121, 85, 72, 0.4); }

.filled {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.filled .point {
  border-color: rgba(255, 255, 255, 0.8);
}

.filled .fire { background-color: #FF5722; box-shadow: 0 0 10px #FF5722; }
.filled .frost { background-color: #03A9F4; box-shadow: 0 0 10px #03A9F4; }
.filled .poison { background-color: #4CAF50; box-shadow: 0 0 10px #4CAF50; }
.filled .acid { background-color: #FFC107; box-shadow: 0 0 10px #FFC107; }
.filled .healing { background-color: #F44336; box-shadow: 0 0 10px #F44336; }
.filled .shield { background-color: #3F51B5; box-shadow: 0 0 10px #3F51B5; }
.filled .invisibility { background-color: #9C27B0; box-shadow: 0 0 10px #9C27B0; }
.filled .resistance { background-color: #795548; box-shadow: 0 0 10px #795548; }
</style>
