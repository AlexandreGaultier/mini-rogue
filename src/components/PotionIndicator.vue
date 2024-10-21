<template>
  <div class="potion-indicator">
    <div :class="['point', type, { 'filled': filled }]"></div>
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
  width: 50px;
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
.healing { background-color: rgba(244, 67, 54, 0.4); }
.blessing { background-color: rgba(255, 235, 59, 0.4); }
.perception { background-color: rgba(156, 39, 176, 0.4); }

.fire.filled { 
  background-color: #FF5722; 
  box-shadow: 0 0 10px #FF5722;
}
.frost.filled { 
  background-color: #03A9F4; 
  box-shadow: 0 0 10px #03A9F4;
}
.poison.filled { 
  background-color: #4CAF50; 
  box-shadow: 0 0 10px #4CAF50;
}
.healing.filled { 
  background-color: #F44336; 
  box-shadow: 0 0 10px #F44336;
}
.blessing.filled { 
  background-color: #FFEB3B; 
  box-shadow: 0 0 10px #FFEB3B;
}
.perception.filled { 
  background-color: #9C27B0; 
  box-shadow: 0 0 10px #9C27B0;
}
</style>
