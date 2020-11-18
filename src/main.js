import Vue from 'vue'
import App from './App.vue'
import router from './router'
import StoragePlugnin from '@/plugins/storage.plugin'
import '@/assets/styles.css'

Vue.config.productionTip = false
Vue.use(StoragePlugnin)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
