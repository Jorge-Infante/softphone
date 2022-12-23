<script>
console.log('Phone component mounted');
export default {
  data() {
    return {
      baseStyle: {
        cursor: "grab",
        zIndex: "150",
      },
      phoneStyle: {
        position: "fixed",
        width: "250px",
      },
      mobilePhoneStyle: {
        width: "100%",
        position: "absolute",
        top: "0px",
        left: "0px",
        height: "100%",
      },
      //Fake esperando data
      keyboardActive:true,
      showConferenceOptions:false
    }
  },
};
</script>

<template>
  <v-card
    elevation="2"
    dark
    :style="[baseStyle, isMobileDevice ? mobilePhoneStyle : phoneStyle]"
  >
    <phone-status-bar></phone-status-bar>
    <status-screen></status-screen>
    <v-card-text :style="isMobileDevice ? { height: '90%' } : {}">
      <key-board v-if="keyboardActive && !showConferenceOptions"></key-board>
      <call-screen
        v-else-if="!keyboardActive && !showConferenceOptions"
      ></call-screen>
      <conference-manager
        v-else-if="showConferenceOptions"
      ></conference-manager>
      <call-controls></call-controls>
    </v-card-text>
  </v-card>
</template>