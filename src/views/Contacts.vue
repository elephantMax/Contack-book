<template>
  <div>
    <form class="form" @submit.prevent="addContact">
      <h2 class="form-title">Добавить контакт</h2>
      <div class="form-group">
        <label>Имя</label>
        <input v-model="name" type="text" name="name" class="form-input" />
      </div>
      <div class="form-group">
        <label>Телефон</label>
        <input
          v-model="number"
          type="number"
          name="number"
          class="form-input"
        />
      </div>
      <button class="btn btn-green">Добавить</button>
    </form>
    <table class="table">
      <tr class="table-first-row">
        <th>#</th>
        <th>Имя</th>
        <th>Телефон</th>
        <th>Действия</th>
      </tr>
      <tr v-for="(contact, index) in contacts" :key="index">
        <th>{{ (index += 1) }}</th>
        <th class="table-txt-overflow">
          <router-link class="contact-link" :to="`/contact/${contact.id}`">{{
            contact.name
          }}</router-link>
        </th>
        <th class="table-txt-overflow">{{ contact.number }}</th>
        <th>
          <button class="btn btn-red" @click="showAlert(contact.id)">
            Удалить
          </button>
        </th>
      </tr>
    </table>
    <Modal
      :show="selectedContact"
      content="Удалить контакт?"
      btnConfirmContent="Удалить"
      btnCancelContent="Отмена"
      @close="closeModal"
      @confirmed="removeContact"
    />

    <Notification :messages="messages" />
  </div>
</template>

<script>
export default {
  name: "Contacts",
  data: () => ({
    name: null,
    number: null,
    selectedContact: null,
    contacts: JSON.parse(localStorage.getItem("contacts")) || [],
    messages: [],
  }),
  methods: {
    addContact() {
      this.messages.length = 0;
      if (this.name && this.number) {
        this.contacts.push({
          id: Date.now(),
          name: this.name,
          number: this.number,
        });
        this.name = this.number = "";
        localStorage.setItem("contacts", JSON.stringify(this.contacts));
      } else {
        this.messages.push("Fields required");
      }
    },
    showAlert(id) {
      this.selectedContact = id;
    },
    closeModal(e) {
      if (
        e.target.className === "modal" ||
        e.target.className.includes("btn-dark")
      )
        this.selectedContact = null;
    },
    removeContact() {
      this.contacts = this.contacts.filter(
        (contact) => contact.id !== this.selectedContact
      );
      localStorage.setItem("contacts", JSON.stringify(this.contacts));
      this.selectedContact = null;
    },
  },
};
</script>

