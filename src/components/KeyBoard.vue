<script>
console.log('Key board mounted');
export default {
  data () {
    return {
      digits: [
        { digit: 1, letters: [] },
        { digit: 2, letters: ['a', 'b', 'c'] },
        { digit: 3, letters: ['d', 'e', 'f'] },
        { digit: 4, letters: ['g', 'h', 'i'] },
        { digit: 5, letters: ['j', 'k', 'l'] },
        { digit: 6, letters: ['m', 'n', 'o'] },
        { digit: 7, letters: ['p', 'q', 'r'] },
        { digit: 8, letters: ['p', 'q', 'r', 's'] },
        { digit: 9, letters: ['t', 'u', 'v'] },
        { digit: '*', letters: [] },
        { digit: 0, letters: ['+'] },
        { digit: '#', letters: [] }
      ],
      baseInputStyle: {        
        paddingRight: '2px'
      },
      inputStyle: {
        paddingTop: '0px',
      },
      mobileInputStyle: {
        paddingTop: '15%',
        paddingRight: '11px',
        width: '100%',
        height: '5%',
        fontSize: '5vh',
      },
      baseContainerStyle: {
        padding: '0px',
        paddingLeft:'13px',
        paddingRight: '11px',
      },
      mobileContainerStyle: {
        height: '75%'
      }
    }
  },
  methods: {
    removeDigit () {
      this.$store.commit('REMOVE_DIGIT')
    },
    updateNumber (value) {
      this.$store.commit('SET_PHONE_STATE', { phoneVar: 'callNumber', phoneState: value })
    },
    doCall () {      
      // disable input to prevent multiple outgoing calls
      this.$store.commit('SET_PHONE_STATE', { phoneVar: 'disableInput', phoneState: true })
      this.$store.dispatch('outgoingCall')
    }
  },
  computed: {
    // ...Vuex.mapState([
    //   'callNumber', 
    //   'userInCall',
    //   'isMobileDevice',
    //   'disableInput',
    // ])
  }
}
</script>
<template>
  <v-row :style="[baseContainerStyle, isMobileDevice ? mobileContainerStyle: {}]">   
      <v-text-field
        :value="callNumber"
        type="text"
        :append-icon="userInCall?undefined:'mdi-backspace'"
        @click:append="removeDigit"
        @keyup.enter="doCall"
        @input="updateNumber"
        :style="[baseInputStyle , isMobileDevice ? mobileInputStyle : inputStyle]"
        :disabled="disableInput || userInCall"
      />  
      <number-key v-for="(digit, index) in digits" :keyData="digit" :key="index"></number-key>
    </v-row>
</template>
