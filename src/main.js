import App from './App.vue'
// import './assets/main.css'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { phoneState, phoneGetters, phoneMutations } from './phone.js'
// import Vue from 'vue'



const app = createApp(App);
app.use(phoneMutations);
app.use(phoneGetters);
app.use(phoneState);
app.mount('#app');

// const app2 = createStore(App);
// app2.use(phoneMutations);
// app2.use(phoneGetters);
// app2.use(phoneState);
// app2.mount('#app')

// Create a new store instance.
// export default new createStore({
//   modules:{
//     phoneState,
//     phoneGetters,
//     phoneMutations
//   }
// })

// new Vue({
//   phoneState,
//   phoneGetters,
//   phoneMutations,
//   render: h => h(App)
// }).$mount('#app')
