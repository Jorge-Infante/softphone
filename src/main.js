import App from './App.vue'
import { createStore } from 'vuex'
import { phoneState, phoneGetters, phoneMutations } from './phone.js'
import Vue from 'vue'

Vue.config.productionTip =false

new Vue({
  phoneState,
  phoneGetters,
  phoneMutations,
  render: h => h(App)
}).$mount('#app')
