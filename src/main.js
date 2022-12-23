import App from './App.vue'
import {phoneState,phoneGetters,phoneMutations} from "./phone.js"
import './assets/main.css'
import { createApp } from 'vue'
import { createStore } from 'vuex'

// Create a new store instance.


createApp(App).mount('#app')
