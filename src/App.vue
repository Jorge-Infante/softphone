<script>
import Phone from "./components/Phone.vue";
import ContactBrowser from "./components/ContactBrowser.vue";
import PhoneWidget from "./components/PhoneWidget.vue";
import {mapState}  from "vuex"


export default {
  
  data() {
    return {
      title: "hello world",
      timeout: 3000,
      isModalSurveyVisible: false,
      lastCallSurvey: {
        call_id: null,
      },
      phoneState: true,
    };
  },
  created() {
    let userInfo = {
      name: "testinf",
      avatar: "/static/images/male.png",
      extension: "113",
    };
    this.$store.commit("UPDATE_USER_INFO", userInfo);
    this.$store.commit("SET_PHONE_STATE", {
      phoneVar: "localIp",
      phoneState: "https://test.sipmovil.com/",
    });
    this.$store.dispatch("setPjsipContacts");
  },
  computed: {
    ...mapState(["snackbarMessage"]),
    showSnackbar: {
      get() {
        return this.$store.state.showSnackbar;
      },
      set(newValue) {
        return this.$store.commit("SET_PHONE_STATE", {
          phoneVar: "showSnackbar",
          phoneState: newValue,
        });
      },
    },
  },
  methods: {
    changeState() {
      this.$store.commit("ADD_EVENT");
    },
    rejectClickToCall(reason) {
      apiRequest
        .rejectClickToCall(reason)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          alertError("Error al notificar rehazo llamada");
          console.log(error);
        });
    },
    showModal() {
      const num = Math.floor(Math.random() * 9);
      if (num < 3) {
        this.isModalSurveyVisible = true;
      }
    },
    closeModal(rate, comments) {
      const rateNumber = Number(rate);
      const parseComments = comments.toString();
      this.sendSurvey(rateNumber, parseComments, this.lastCallSurvey.call_id);
      this.isModalSurveyVisible = false;
    },
    sendSurvey(rate, comments, call_id) {
      const data = {
        rate,
        comments,
        call_id,
      };
      apiClient.post(`/api/calls/survey/`, data);
    },
  },
  computed: {
    showPhone() {
      return this.$store.state.showPhone;
    },
    userInCall() {
      return this.$store.state.userInCall;
    },
  },
  components: {
    Phone,
    ContactBrowser,
    PhoneWidget,
  },
};
</script>

<template>
  <Phone />
  <ContactBrowser />
  <PhoneWidget />
</template>