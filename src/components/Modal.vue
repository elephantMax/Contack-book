<template>
   <div class="modal" v-if="show" @click="$emit('close', $event)">
      <div class="modal-content">
        <h2>{{content}}</h2>
        <button class="btn btn-red" @click="$emit('confirmed')">{{btnContent}}</button>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Modal1',
  props: ['show', 'content', 'btnContent'],
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(250, 245, 245, 0.589);
}
.modal-content{
  padding: 10px 30px;
  z-index: 9999;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  box-shadow: 0px 0px 10px black;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.modal-content > *{
  margin-bottom: 10px;
}
@media screen and (max-width: 400px) {
  .modal-content{
    width: 90%;
  }
  .modal-content .btn{
    width: 100%;
  }
}
</style>