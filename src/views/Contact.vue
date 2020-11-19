<template>
  <div>
    <h1 v-if="!contact">Контакт не был найден</h1>
    <div v-else>
      <h1>Редактировать контакт</h1>
      <div class="fields">
        <div class="field" v-for="field in fields" :key="field.key">
          <label v-if="!field.selected">{{ field.key }}</label>
          <input
            v-else
            type="text"
            :disabled="canEdit(field)"
            :value="field.key"
            ref="fieldKey"
            @keyup.enter="saveField(field)"
            class="field-input"
          />
          <input
            :disabled="!field.selected ? true : false"
            v-model="field.value"
            :type="field.key === 'number' ? 'number' : 'text'"
            @keyup.enter="saveField(field)"
            class="field-input"
          />
          <div class="field-panel">
            <template v-if="field.selected">
              <button
                class="btn btn-blue"
                type="submit"
                @click="saveField(field)"
              >
                Сохранить
              </button>
              <button class="btn btn-red" @click="field.selected = false">
                Отмена
              </button>
            </template>
            <template v-else>
              <button
                class="btn btn-blue"
                :disabled="field.key === 'id'"
                @click="selectField(field)"
              >
                Редактировать
              </button>
              <button
                class="btn btn-red"
                :disabled="canEdit(field)"
                @click="showModal(field.key)"
              >
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
            placeholder="Поле"
            class="field-input"
          />
          <input
            type="text"
            name="value"
            v-model="fieldValue"
            placeholder="Значение"
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
            @click="confirmModal"
            :disabled="currentVersion < 1 ? true : false"
          >
            Отменить последнее измененеие
          </button>
        </div>
      </div>
    </div>
    <Modal
      :show="selectedField"
      @close="closeModal"
      @confirmed="removeField"
      content="Удалить поле?"
      btnConfirmContent="Удалить"
      btnCancelContent="Отмена"
    />
    <Modal
      :show="showConfirmModal"
      @close="closeModal"
      @confirmed="rollBack"
      content="Отменить последнее изменение?"
      btnConfirmContent="Да"
      btnCancelContent="Нет"
    />
    <Notification :messages="messages" />
  </div>
</template>

<script>
export default {
  name: "Contact",
  data: () => ({
    contact: null,
    showConfirmModal: false,
    showForm: false,
    fieldName: null,
    fieldValue: null,
    backups: [],
    fields: [],
    currentVersion: 0,
    showEdit: false,
    selectedField: null,
    messages: [],
  }),
  methods: {
    selectField(field = null) {
      this.fields.forEach((f) => {
        f.selected = false;
      });
      field.selected = true;
    },
    addField() {
      this.messages = [];
      this.fields.forEach((f) => {
        if (f.key === this.fieldName) {
          this.messages.push("duplicate keys");
        }
      });
      if (!this.fieldName && !this.fieldValue) {
        this.messages.push("fields is required");
      }
      if (!this.messages.length) {
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
        });
        localStorage.setItem("contacts", JSON.stringify(contacts));
        this.showForm = false;
        this.backups = this.$addBackup(this.backups, this.fields);
        this.currentVersion++;
      }
    },
    removeField() {
      this.backups = this.$addBackup(this.backups, this.fields);
      this.currentVersion++;
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
      if (
        e.target.className === "modal" ||
        e.target.className.includes("btn-dark")
      ) {
        this.selectedField = null;
        this.showConfirmModal = false;
      }
    },
    showModal(key) {
      this.selectedField = key;
    },
    confirmModal(){
      this.fields.forEach((f) => {
        f.selected = false;
      });
      this.showConfirmModal = true
    },
    saveField(field) {
      const fieldKey = this.$refs.fieldKey[0].value;
      if (!fieldKey || !field.value) return;
      let contacts = JSON.parse(localStorage.getItem("contacts"));
      delete this.contact[field["key"]];
      field.key = fieldKey;
      this.contact[fieldKey] = field["value"];
      contacts = contacts.map((c) => {
        if (c.id === this.contact.id) return this.contact;
        return c;
      });
      this.backups = this.$addBackup(this.backups, this.fields);
      this.currentVersion++;
      localStorage.setItem("contacts", JSON.stringify(contacts));

      field.selected = false;
    },
    resetFieldForm() {
      this.showForm = false;
      this.fieldName = null;
      this.fieldValue = null;
    },
    rollBack() {
      if (this.currentVersion > 0) {
        this.backups = this.$removeLastBackup(this.backups);
        this.currentVersion -= 1;
        this.fields = this.backups[this.currentVersion];
        this.contact = {};
        this.fields.forEach((f) => {
          this.contact[f.key] = f.value
          f.selected = false
        });
        let contacts = JSON.parse(localStorage.getItem("contacts"));
        contacts = contacts.map((c) => {
          if (c.id === this.contact.id) return this.contact;
          return c;
        });
        localStorage.setItem("contacts", JSON.stringify(contacts));
        this.showConfirmModal = false;
      }
    },
    canEdit(field) {
      let NotEditableFields = ["id", "number", "name"];
      if (NotEditableFields.includes(field.key)) return true;
      return false;
    },
  },
  computed: {},
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
