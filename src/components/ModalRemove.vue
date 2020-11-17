<template>
   <div class="modal" v-if="selectedItem" @click="$emit('close', $event)">
      <div class="modal-content">
        <h2>Удалить контакт?</h2>
        <button class="btn btn-red" @click="$emit('remove')">Удалить</button>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Modal',
  props: ['selectedItem'],
}
</script>

<style scoped>
.modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(250, 245, 245, 0.589);
}
.modal-content{
  z-index: 9999;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  box-shadow: 0px 0px 10px black;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>