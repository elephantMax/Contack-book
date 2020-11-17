<template>
  <div>
    <h1 v-if="!contact">Контакт не был найден</h1>
    <div v-else>
      <h1>Контакт #{{ contact.id }}</h1>
      <div class="fields" :key="mainKey">
        <div v-for="field in fields" :key="field.key" class="form-group">
          <label v-if="!field.selected">{{ field.key }}</label>
          <input
            v-else
            type="text"
            :value="field.key"
            class="field-input field-input-name"
          />
          <input
            type="text"
            :disabled="field.key === 'id' ? true : false"
            :name="field.key"
            :value="field.value"
            class="field-input"
          />
          <div>
            <template v-if="field.selected">
              <button class="btn btn-green">Сохранить</button>
              <button class="btn btn-red">Удалить</button>
            </template>

            <button
              class="btn btn-blue"
              :disabled="field.key === 'id' ? true : false"
              @click="field.selected = !field.selected"
            >
              {{ field.selected ? "Отменить" : "Редактировать" }}
            </button>
          </div>
        </div>
        <form
          @submit.prevent="addField"
          class="form-group field-form"
          v-if="showForm"
        >
          <input
            type="text"
            name="fieldName"
            placeholder="Название поля"
            v-model="fieldName"
            class="field-input"
          />
          <input
            type="text"
            name="fieldValue"
            placeholder="Значение"
            v-model="fieldValue"
            class="field-input"
          />
          <button class="btn btn-green">Добавить</button>
          <button class="btn btn-red" @click="resetFieldForm">Отмена</button>
        </form>
        <div class="form-group">
          <button
            class="btn btn-field"
            v-if="!showForm"
            @click="showForm = true"
          >
            Добавить поле
          </button>
        </div>
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
    fields: [],
    showEdit: false,
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
        this.showForm = false;
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
    resetFieldForm() {
      this.showForm = false;
      this.fieldName = null;
      this.fieldValue = null;
    },
  },
  mounted() {
    const contacts = JSON.parse(localStorage.getItem("contacts"));
    this.contact = contacts.find((c) => c.id === +this.$route.params.id);
    this.backups.push(this.contact);
    this.fields = Object.keys(this.contact);
    this.fields = this.fields.map((f) => ({
      key: f,
      value: this.contact[f],
      selected: false,
    }));
  },
};
</script>
<style scoped>
.form-group {
  align-items: baseline;
}
</style>