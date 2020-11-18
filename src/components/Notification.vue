<template>
  <div v-if="messages.length" class="notification error">
    <h3>Возникли ошибки</h3>
    <ul>
      <li v-for="message in messages" :key="message">{{ message }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ["messages", "type"],
  watch: {
    messages() {
      if (this.messages.length) {
        setTimeout(() => {
          this.$parent.messages = [];
        }, 2000);
      }
    },
  },
};
</script>

<style scoped>
.notification {
  position: fixed;
  right: 1%;
  bottom: 1%;
  padding: 20px;
}
.error {
  background: rgba(231, 11, 11, 0.835);
  color: white;
}
@media screen and (max-width: 600px) {
  .notification {
    top: 10%;
    bottom: unset;
  }
}
</style>