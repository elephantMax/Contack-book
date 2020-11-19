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
    contact: null, //current contact
    showConfirmModal: false, //confirm modal toggler
    showForm: false, //show form toggler
    fieldName: null,
    fieldValue: null,
    backups: [], // array with backups
    fields: [], //fields data
    currentVersion: 0, //version for backup
    selectedField: null, //editor's toggler
    messages: [], // messages with validation info
  }),
  methods: {
    selectField(field) {
      //sets to field prop selected and disabled for others fields
      this.fields.forEach((f) => {
        f.selected = false;
      });
      field.selected = true;
    },
    addField() {
      this.messages = [];
      //pushing messages with errors
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
          //add new field to fields arr
          key: this.fieldName,
          value: this.fieldValue,
          selected: false,
        });
        this.contact[this.fieldName] = this.fieldValue; //adds new prop (field) to current contact
        this.fieldName = this.fieldValue = null; //clear inputs
        let contacts = JSON.parse(localStorage.getItem("contacts")); //getting contacts from storage
        contacts = contacts.map((c) => {
          //updating them
          if (c.id === this.contact.id) return this.contact; //change old contact to new
          return c;
        });
        localStorage.setItem("contacts", JSON.stringify(contacts)); //saving new contatcs arr to storage
        this.showForm = false; //hiding form
        this.backups = this.$addBackup(this.backups, this.fields); //add backup
        this.currentVersion++; //set newest version for moving in backups
      }
    },
    removeField() {
      this.backups = this.$addBackup(this.backups, this.fields); //add backup and then removing selected field
      this.currentVersion++; //set newest version
      this.fields = this.fields.filter((f) => f.key !== this.selectedField); //updating fields (removing current field)
      delete this.contact[this.selectedField]; //remove field from current contact
      this.selectedField = null; //clear selected field
      let contacts = JSON.parse(localStorage.getItem("contacts")); //getting contacts
      contacts = contacts.map((c) => {
        //updating them
        if (c.id === this.contact.id) return this.contact; //set new contact instead of old
        return c;
      });
      localStorage.setItem("contacts", JSON.stringify(contacts)); //save contacts to stroage
    },
    closeModal(e) {
      //close modal window
      if (
        e.target.className === "modal" ||
        e.target.className.includes("btn-dark")
      ) {
        this.selectedField = null;
        this.showConfirmModal = false;
      }
    },
    showModal(key) {
      //showing modal for removes
      this.selectedField = key;
    },
    confirmModal() {
      //opens modal to confirm backup
      this.fields.forEach((f) => {
        f.selected = false;
      });
      this.showConfirmModal = true;
    },
    saveField(field) {
      //field - old version of field (only field.key old) //for backup
      const fieldKey = this.$refs.fieldKey[0].value; //getting newest value of selected field's key
      if (!fieldKey || !field.value) return; //check values
      delete this.contact[field["key"]]; //removes old field in current contact
      this.contact[fieldKey] = field["value"]; //sets new (renamed) field with newest value to current contact
      let contacts = JSON.parse(localStorage.getItem("contacts")); //getting contacts from storage
      contacts = contacts.map((c) => {
        //update contacts
        if (c.id === this.contact.id) return this.contact; //set new contact instead of old
        return c;
      });
      this.fields = this.fields.map((f) => {
        if (f.key === field.key) {
          // changing (rename) current  field
          delete f.key;
          f.key = fieldKey;
          f.selected = false;
          return {
            ...f,
          };
        }
        return f;
      });
      this.backups = this.$addBackup(this.backups, this.fields); //add backup
      this.currentVersion++; //set new version
      localStorage.setItem("contacts", JSON.stringify(contacts)); //save contacts
      field.selected = false;
    },
    resetFieldForm() {
      //reset form
      this.showForm = false;
      this.fieldName = null;
      this.fieldValue = null;
    },
    rollBack() {
      if (this.currentVersion > 0) {
        this.backups = this.$removeLastBackup(this.backups); //remove last backup
        this.backups = this.$addBackup(this.backups, this.fields); //wierd move... but i did that to avoid bug
        this.currentVersion -= 1; // change version of backup
        this.fields = this.backups[this.currentVersion]; //set latest version
        this.contact = {}; //updating current contact
        this.fields.forEach((f) => {
          //set new fileds
          this.contact[f.key] = f.value;
          f.selected = false;
        });
        let contacts = JSON.parse(localStorage.getItem("contacts")); //get all contacts from storage
        contacts = contacts.map((c) => {
          //update them
          if (c.id === this.contact.id) return this.contact;
          return c;
        });
        localStorage.setItem("contacts", JSON.stringify(contacts)); //save contacts
        this.backups = this.$removeLastBackup(this.backups);//remove last backup
        this.showConfirmModal = false; //close  modal
      }
    },
    canEdit(field) {
      let NotEditableFields = ["id", "number", "name"] //this fields is not editable
      if (!NotEditableFields.includes(field.key)) return false
      return true //buttons disabled
    },
  },
  computed: {},
  mounted() {
    const contacts = JSON.parse(localStorage.getItem("contacts"));//get all contacts from storage
    this.contact = contacts.find((c) => c.id === +this.$route.params.id);//get by id current contact
    this.fields = Object.keys(this.contact);
    //set contact fields to fields var
    this.fields = this.fields.map((k) => ({ 
      key: k,
      value: this.contact[k],
      selected: false,
    }));
    sessionStorage.clear();//clear storage from old backups 
    this.backups = this.$addBackup(this.backups, this.fields); //add new backup
  },
};
</script>
