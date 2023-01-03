import { createApp } from 'vue'
import store from "./store"
import App from './App.vue'
import * as cors from 'cors';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


const vuetify = createVuetify({
  components,
  directives,
})

createApp(App).use(store).use(vuetify).mount('#app')


// const cors = require('cors');
// App.use(cors())
// var whiteList = ['https://test.sipmovil.com/customer/people/']

// var corsOptions = {
//   origin : function(origin, callback){
//     if(whiteList.indexOf(origin) != -1){
//       callback(null, true);
//     }else{
//       callback(new Error('no cors'))
//     }
//   }
// }

// appendFile.get('/', cors(corsOptions),(req, res)=>{
//   res.json({mensaje: 'ok'})
// })
