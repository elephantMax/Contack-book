<template>
  <div>
    <h1 v-if="!contact">Контакт не был найден</h1>
    <div v-else>
      <h1>Контакт #{{ contact.id }}</h1>
      <div class="form" :key="mainKey">
        <div v-for="(field, key) in contact" :key="key" class="form-group">
          <template v-if="key !== 'id'">
            <label>{{ key }}</label>
            <input type="text" :name="key" :value="field" class="form-input" />
            <button class="btn btn-red" @click="showModal(key)">Удалить</button>
          </template>
        </div>
       
        <button class="btn btn-field" @click="showForm = !showForm">
          Добавить поле
        </button>
         
        <form @submit.prevent="addField" class="form" v-if="showForm">
          <div class="form-group">
            <input
              type="text"
              name="fieldName"
              placeholder="Название поля"
              class="form-input"
              v-model="fieldName"
            />
            <input
              type="text"
              name="fieldName"
              placeholder="Значение"
              class="form-input"
              v-model="fieldValue"
            />
            <button class="btn btn-green btn-add">Добавить</button>
          </div>
        </form>
        <div class="panel">
          <button class="btn btn-red">Отменить измененеие</button>
          <button class="btn btn-blue">Сохранить изменения</button>
        </div>
      </div>
    </div>
    <Modal
      :selectedItem="selectedField"
      @close="closeModal"
      @remove="removeField"
    />
  </div>
</template>

<script>
import Modal from "@/components/ModalRemove";
export default {
  name: "Contact",
  components: { Modal },
  data: () => ({
    contact: null,
    showForm: false,
    fieldName: null,
    fieldValue: null,
    mainKey: 0,
    backups: [],
    selectedField: null,
  }),
  methods: {
    addField() {
      if (this.fieldName && this.fieldValue) {
        this.contact[this.fieldName] = this.fieldValue;
        this.fieldName = this.fieldValue = null;
        let contacts = JSON.parse(localStorage.getItem("contacts"));
        contacts = contacts.map((c) => {
          if (c.id === this.contact.id) return this.contact;
          return c;
        });
        localStorage.setItem("contacts", JSON.stringify(contacts));
        this.mainKey++;
      }
    },
    removeField(key) {
      delete this.contact[this.selectedField];
      this.selectedField = null;
      let contacts = JSON.parse(localStorage.getItem("contacts"));
      contacts = contacts.map((c) => {
        if (c.id === this.contact.id) return this.contact;
        return c;
      });
      localStorage.setItem("contacts", JSON.stringify(contacts));
      this.mainKey++;
    },
    closeModal(e) {
      if (e.target.className === "modal") this.selectedField = null;
    },
    showModal(key) {
      this.selectedField = key;
    },
  },
  mounted() {
    const contacts = JSON.parse(localStorage.getItem("contacts"));
    this.contact = contacts.find((c) => c.id === +this.$route.params.id);
    this.backups.push(this.contact);
  },
};
</script>
<style scoped>
.form-group {
  align-items: baseline;
}
</style>