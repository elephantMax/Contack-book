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
        <input v-model="phone" type="number" name="phone" class="form-input" />
      </div>
      <button class="btn btn-green">Добавить</button>
    </form>
    <table class="table">
      <tr class="table-first-row">
        <th>#</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Действия</th>
      </tr>
      <tr v-for="(contact, index) in contacts" :key="index">
        <th>{{ (index += 1) }}</th>
        <th class="table-phoneCell">
          <router-link class="contact-link" :to="`/contact/${contact.id}`">{{
            contact.name
          }}</router-link>
        </th>
        <th>{{ contact.phone }}</th>
        <th>
          <button class="btn btn-red" @click="showAlert(contact.id)">
            Удалить
          </button>
        </th>
      </tr>
    </table>
    <Modal
      :selectedItem="selectedContact"
      @close="closeModal"
      @remove="removeContact"
    />
  </div>
</template>

<script>
import Modal from "@/components/ModalRemove";
export default {
  name: "Contacts",
  components: { Modal },
  data: () => ({
    name: null,
    phone: null,
    selectedContact: null,
    contacts: JSON.parse(localStorage.getItem("contacts")) || [],
  }),
  methods: {
    addContact() {
      if (this.name && this.phone) {
        this.contacts.push({
          id: Date.now(),
          name: this.name,
          phone: this.phone,
        });
        this.name = "";
        this.phone = "";
        localStorage.setItem("contacts", JSON.stringify(this.contacts));
      }
    },
    showAlert(id) {
      this.selectedContact = id;
    },
    closeModal(e) {
      if (e.target.className === "modal") this.selectedContact = null;
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

