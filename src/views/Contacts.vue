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
    <h2 v-if="!contacts.length">Здесь пока пусто</h2>
    <table v-else class="table">
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
    name: null,//value of input for name
    number: null,//value of input for number
    selectedContact: null,//modal toggler
    contacts: JSON.parse(localStorage.getItem("contacts")) || [],//array with contacts
    messages: [],//messages with erorrs
  }),
  methods: {
    addContact() {//add contact
      this.messages.length = 0; //to avoid error message in console
      if (this.name && this.number) { //check inputs
        this.contacts.push({//adds new contact
          id: Date.now(),
          name: this.name,
          number: this.number,
        });
        this.name = this.number = "" //clear inputs
        localStorage.setItem("contacts", JSON.stringify(this.contacts)) //save contact to storage
      } else {
        this.messages.push("Fields required");//toggle modal with errors
      }
    },
    showAlert(id) {
      this.selectedContact = id;//shows modal to remove contact
    },
    closeModal(e) { //close modal if click to modal's wrapper or button to cencel
      if (
        e.target.className === "modal" ||
        e.target.className.includes("btn-dark")
      )
      this.selectedContact = null; //close modal
    },
    removeContact() {
      this.contacts = this.contacts.filter(//remove contact from arr
        (contact) => contact.id !== this.selectedContact
      );
      localStorage.setItem("contacts", JSON.stringify(this.contacts)); //save contact
      this.selectedContact = null; //close modal
    },
  },
};
</script>

