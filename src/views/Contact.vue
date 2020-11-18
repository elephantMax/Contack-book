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
            :disabled="
              field.key === 'name' || field.key === 'number' ? true : false
            "
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
                :disabled="field.key === 'id' ? true : false"
                @click="selectField(field)"
              >
                Редактировать
              </button>
              <button
                class="btn btn-red"
                :disabled="
                  field.key === 'id' ||
                  field.key === 'name' ||
                  field.key === 'number'
                    ? true
                    : false
                "
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
            @click="showConfirmModal = true"
            :disabled="currentVerison < 1 ? true : false"
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
      btnContent="Удалить"
    />
    <Modal
      :show="showConfirmModal"
      @close="closeModal"
      @confirmed="rollBack"
      content="Отменить последнее изменение?"
      btnContent="Отменить"
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
    currentVerison: 0,
    showEdit: false,
    selectedField: null,
    messages: [],
  }),
  methods: {
    selectField(field) {
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
        this.currentVerison++;
      }
    },
    removeField() {
      this.backups = this.$addBackup(this.backups, this.fields);
      this.currentVerison++;
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
      const fieldKey = this.$refs.fieldKey[0].value;
      if (!fieldKey || !field.value) return
     
      let sameField;
      this.backups[this.backups.length - 1].forEach((b) => {
        if (b.key === fieldKey && b.value === field.value) {
          sameField = true;
        }
      });
      if (!sameField) {
        let contacts = JSON.parse(localStorage.getItem("contacts"));
        delete this.contact[field["key"]];
        field.key = fieldKey;

        this.contact[fieldKey] = field["value"];
        contacts = contacts.map((c) => {
          if (c.id === this.contact.id) return this.contact;
          return c;
        });
        this.backups = this.$addBackup(this.backups, this.fields);
        this.currentVerison++;
        localStorage.setItem("contacts", JSON.stringify(contacts));
      }
      field.selected = false;
    },
    resetFieldForm() {
      this.showForm = false;
      this.fieldName = null;
      this.fieldValue = null;
    },
    rollBack() {
      if (this.currentVerison > 0) {
        this.backups.splice(this.currentVerison);
        this.fields = this.backups[this.currentVerison - 1];
        this.currentVerison--;
        this.contact = {};
        this.fields.forEach((f) => {
          this.contact[f.key] = f.value;
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
