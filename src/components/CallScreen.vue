<script>
console.log('CallScren mounted');
//agregado fake :key="ev"
export default {
  data() {
    return {
      baseContainerStyle: {
        background: "#333333",
        flexDirection: "column",
        minHeight: "211px",
        borderRadius: "5px",
        paddingTop: "10px",
        marginLeft: "0px",
        marginRight: "0px",
        paddingLeft: "10px",
      },
      mobileContainerStyle: {
        height: "75%",
      },
      labelContactStyle: {
        color: "white",
        marginBottom: "5px",
      },
      addInfoStyle: {
        color: "white",
        listStyle: "square",
        marginLeft: "15px",
        fontSize: "13px",
        lineHeight: "15px",
      },
      conferenceInfoStyle: {
        color: "white",
        display: "flex",
        marginBottom: "5px",
        marginRight: "5px",
        marginTop: "4px",
      },
      ev: {
        eventType: "IVR_DMTF",
      },
      userInCall: true,
      userInConference: true,
      userConferenceRole: "Admin",
      callInfo: {
        info: "info",
      },
      conferenceCallInfo: true,
      isAddingMember: null,
      isMobileDevice: true,
      callEvents: null,
      browserContacts: null,
    };
  },
  methods: {
    // ...Vuex.mapActions(["removeInvitedChannel"]),
    // showOptions() {
    //   vueApp.$store.commit("SET_PHONE_STATE", {
    //     phoneVar: "showConferenceOptions",
    //     phoneState: true,
    //   });
    // },
    getEventLabel(event) {
      query = event.eventType == "IVR_DMTF" ? event.ivrSource : event.slugName;
      eventInfo = this.browserContacts.filter((x) => x.unique_id == query)[0];

      eventLabel = "";
      if (event.eventType == "IVR_DMTF") {
        ivrOption = eventInfo.options[`key-${event.key}`];
        label = `Opción ${event.key} `;
        if (ivrOption.label) {
          label += ` - ${ivrOption.label}`;
        }
        eventLabel = label;
      } else if (event.eventType == "ORIGIN_DID") {
        eventLabel = event.label;
      } else {
        eventLabel = `${eventInfo.name} [${eventInfo.extension}]`;
      }

      return eventLabel;
    },
  },
  computed: {
    // ...Vuex.mapState([
    //   "userInCall",
    //   "userInConference",
    //   "userConferenceRole",
    //   "callInfo",
    //   "conferenceCallInfo",
    //   "isAddingMember",
    //   "isMobileDevice",
    //   "callEvents",
    //   "browserContacts",
    // ]),
    // callDuration() {
    //   return this.$store.getters.callDurationFormat;
    // },
  },
};
</script>
<template>
  <v-row
    :style="[baseContainerStyle, isMobileDevice ? mobileContainerStyle : {}]"
  >
    <span
      :style="{
        marginBottom: isMobileDevice ? '16px' : '10px',
        fontSize: isMobileDevice ? '3vh' : 'small',
      }"
      >{{ callInfo.status }}</span
    >

    <v-row
      :style="{ paddingLeft: '12px', paddingRight: '15px', maxHeight: '25px' }"
    >
      <span
        :style="[
          labelContactStyle,
          { fontSize: isMobileDevice ? '5vh' : 'x-large' },
        ]"
        >{{ callInfo.label }}</span
      >
      <v-spacer></v-spacer>
      <span
        @click="showOptions"
        title="Opcines conferencia"
        v-if="userInConference"
      >
        <v-icon
          medium
          dark
          :style="{
            cursor: 'pointer',
            fontSize: isMobileDevice ? '5.5vh' : '',
          }"
        >
          mdi-settings
        </v-icon>
      </span>
    </v-row>

    <span
      :style="{
        color: 'white',
        marginTop: isMobileDevice ? '20px' : '10px',
        fontSize: isMobileDevice ? '2.5vh' : '',
      }"
      >{{ callInfo.info }}</span
    >
    <span
      :style="{ color: 'white', fontSize: isMobileDevice ? '3vh' : '' }"
      v-if="userInCall"
      >{{ callDuration }}</span
    >

    <ul v-if="callEvents.length > 0" :style="addInfoStyle">
      <li
        :style="{
          marginLeft: ev.eventType == 'IVR_DMTF' ? '5px' : '',
          listStyle: ev.eventType == 'IVR_DMTF' ? 'none' : 'square',
        }"
        v-for="ev in callEvents"
        :key="ev"
      >
        {{ getEventLabel(ev) }}
      </li>
    </ul>

    <v-spacer v-if="isAddingMember"></v-spacer>
    <div
      :style="{ display: 'contents', marginBottom: '5px' }"
      v-if="isAddingMember"
    >
      <v-divider></v-divider>
      <span :style="{}">{{ conferenceCallInfo.status }}</span>
      <span
        :style="[
          labelContactStyle,
          { fontSize: isMobileDevice ? '5vh' : 'x-large' },
        ]"
        >{{ conferenceCallInfo.label }}</span
      >
      <span
        :style="[
          conferenceInfoStyle,
          { fontSize: isMobileDevice ? '3vh' : '' },
        ]"
      >
        {{ conferenceCallInfo.info }}
        <v-spacer></v-spacer>
        <v-btn
          :style="{
            backgroundColor: '#dc3545',
            fontSize: isMobileDevice ? '2.5vh' : '',
            padding: isMobileDevice ? '12px' : '',
          }"
          rounded
          x-small
          @click="removeInvitedChannel"
        >
          Cancelar
        </v-btn>
      </span>
    </div>
  </v-row>
</template>
  
