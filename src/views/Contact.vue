<template>
  <div>
    <h1 v-if="!contact">Контакт не был найден</h1>
    <div v-else>
      <h1>Контакт #{{ contact.id }}</h1>
      <div class="fields">
        <div class="field" v-for="field in fields" :key="field.key">
          <label v-if="!field.selected">{{ field.key }}</label>
          <input
            v-else
            type="text"
            :disabled="{ true: field.key === 'name' || field.key === 'phone' }"
            :value="field.key"
            class="field-input"
          />
          <input
            type="text"
            :disabled="!field.selected ? true : false"
            v-model="field.value"
            class="field-input"
          />
          <div class="field-panel">
            <template v-if="field.selected">
              <button class="btn btn-blue" @click="saveField(field)">
                Сохранить
              </button>
              <button class="btn btn-red">Отмена</button>
            </template>
            <template v-else>
              <button
                class="btn btn-blue"
                :disabled="field.key === 'id' ? true : false"
                @click="field.selected = true"
              >
                Редактировать
              </button>
              <button class="btn btn-red" @click="showModal(field.key)">
                Удалить
              </button>
            </template>
          </div>
        </div>
        <form @submit.prevent="addField" class="field" v-if="showForm">
          <input
            type="text"
            name="key"
            v-model="fieldName"
            class="field-input"
          />
          <input
            type="text"
            name="value"
            v-model="fieldValue"
            class="field-input"
          />
          <button class="btn btn-green" type="submit">Доабвить</button>
          <button class="btn btn-red" @click.prevent="resetFieldForm">
            Отмена
          </button>
        </form>
        <div class="field" v-if="!showForm">
          <button class="btn btn-green btn-addField" @click="showForm = true">
            Добавить поле
          </button>
        </div>
        <div class="panel">
          <button
            class="btn btn-red"
            @click="showBackups"
            :disabled="currentVerison < 1 ? true : false"
          >
            Отменить последнее измененеие ({{currentVerison }})
          </button>
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
    currentVerison: 0,
    showEdit: false,
    selectedField: null,
  }),
  methods: {
    addField() {
      if (this.fieldName && this.fieldValue) {
        this.fields.push({
          key: this.fieldName,
          value: this.fieldValue,
          selected: false,
        });
        this.contact[this.fieldName] = this.fieldValue;
        this.fieldName = this.fieldValue = null;
        let contacts = JSON.parse(localStorage.getItem("contacts"));
        contacts = contacts.map((c) => {
          if (c.id === this.contact.id) return this.contact;
          return c;
        })
        localStorage.setItem("contacts", JSON.stringify(contacts));
        this.showForm = false;
        this.backups = this.$addBackup(this.backups, this.fields);
        this.currentVerison++
      }
    },
    removeField() {
      this.backups = this.$addBackup(this.backups, this.fields);
      this.currentVerison++
      this.fields = this.fields.filter((f) => f.key !== this.selectedField);
      delete this.contact[this.selectedField];
      this.selectedField = null;
      let contacts = JSON.parse(localStorage.getItem("contacts"));
      contacts = contacts.map((c) => {
        if (c.id === this.contact.id) return this.contact;
        return c;
      });
      localStorage.setItem("contacts", JSON.stringify(contacts));
    },
    closeModal(e) {
      if (e.target.className === "modal") this.selectedField = null;
    },
    showModal(key) {
      this.selectedField = key;
    },
    saveField(field) {
      let contacts = JSON.parse(localStorage.getItem("contacts"));
      field.selected = false;
      this.contact[field["key"]] = field["value"];
      contacts = contacts.map((c) => {
        if (c.id === this.contact.id) return this.contact;
        return c;
      });
      // this.backups = this.$getBackups();
      this.backups = this.$addBackup(this.backups, this.fields);
      this.currentVerison++
      localStorage.setItem("contacts", JSON.stringify(contacts));
    },
    resetFieldForm() {
      this.showForm = false;
      this.fieldName = null;
      this.fieldValue = null;
    },
    showBackups() {
      if (this.currentVerison > 0) {
        this.backups.splice(this.currentVerison)
        this.fields = this.backups[this.currentVerison - 1];
        this.currentVerison--;
        this.fields.forEach((f) => {
          this.contact[f.key] = f.value;
        });
        console.log(this.contact);
        let contacts = JSON.parse(localStorage.getItem("contacts"));
        contacts = contacts.map((c) => {
          if (c.id === this.contact.id) return this.contact;
          return c;
        });
        localStorage.setItem("contacts", JSON.stringify(contacts));
      }
    },
  },
  mounted() {
    const contacts = JSON.parse(localStorage.getItem("contacts"));
    this.contact = contacts.find((c) => c.id === +this.$route.params.id);
    this.fields = Object.keys(this.contact);
    this.fields = this.fields.map((k) => ({
      key: k,
      value: this.contact[k],
      selected: false,
    }));
    sessionStorage.clear();
    this.backups = this.$addBackup(this.backups, this.fields);
  },
};
</script>
<style scoped>
.form-group {
  align-items: baseline;
}
</style>