import Vue from 'vue'
import App from './App.vue'
import router from './router'
import StoragePlugnin from '@/plugins/storage.plugin'
import Modal from '@/components/Modal'
import Notification from '@/components/Notification'
import '@/assets/styles.css'

Vue.config.productionTip = false
Vue.use(StoragePlugnin)
Vue.component('Modal', Modal)
Vue.component('Notification', Notification)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
