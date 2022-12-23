<script>
export default function App() {
  data() {
      return {
        title: "hello world",
        timeout: 3000,
        isModalSurveyVisible: false,
        lastCallSurvey: {
          call_id: null,
        },
        phoneState:true,
      };
    },
    created() {
      let userInfo = {name:'testinf', avatar: '/static/images/male.png', extension: '113'}
      console.log('mi phoneMutations',phoneMutations.UPDATE_USER_INFO)
      this.$store.commit('UPDATE_USER_INFO', userInfo)
      this.$store.commit('SET_PHONE_STATE', { phoneVar: 'localIp', phoneState: 'https://test.sipmovil.com/' })
      // this.$store.dispatch('setPjsipContacts')
    },
    computed: {
      ...Vuex.mapState([]'snackbarMessage']),
      showSnackbar: {
        get () {
          return this.$store.state.showSnackbar
        },
        set (newValue) {
          return this.$store.commit('SET_PHONE_STATE', { phoneVar: 'showSnackbar', phoneState: newValue })
        }
      }
    },
    store: new Vuex.Store({
      state: phoneState,
      getters: phoneGetters,
      mutations: phoneMutations,
      actions: {
        setCallEvents({commit, state}, callEvents){
          filteredEvents = callEvents.filter((x) => x.eventType == 'RINGING_GROUP' || x.eventType == 'RINGING_IVR' || x.eventType == 'IVR_DMTF' || x.eventType == 'ORIGIN_DID' )
          commit('SET_PHONE_STATE', {phoneVar:'callEvents', phoneState: filteredEvents})
        },
        incommingCall({commit, state}, callNumber){
          let callDirection = 'INCOMING'
          commit('SET_CALL_DIRECTION', callDirection)

          apiRequest.getLabel(callDirection, callNumber, '{{request.user.id}}', 'call')
          .then((response) => {
            callInfo = response.data
            callInfo['status'] = 'Llamada entrante'
            commit('SET_PHONE_STATE', {phoneVar:'showPhone', phoneState:true})
            commit('UPDATE_CALL_INFO', callInfo)
            commit('START_CALL')
            ctxSip.startRingTone()
          }, (error) => {
            callInfo = {status:'Llamada entrante', label:'Desconocido', info:'Número - '+callNumber}
            commit('SET_PHONE_STATE', {phoneVar:'showPhone', phoneState:true})
            commit('UPDATE_CALL_INFO', callInfo)
            commit('START_CALL')
            ctxSip.startRingTone()
          })
        },
        convertSDP({commit, state}){
          localDesc = '\"'+state.peerConnection.localDescription.sdp.replaceAll(String.fromCharCode(13),'\\r').replaceAll(String.fromCharCode(10), '\\n') + '\"'
          remoteDesc = state.peerConnection.remoteDescription.sdp.replaceAll(String.fromCharCode(13),'\\r').replaceAll(String.fromCharCode(10), '\\n')
          apiRequest.convertSDP(localDesc, remoteDesc)
          .then((response) => {
            console.log(response.data)
          }, (error) => {
          })
        },
        outgoingCall({commit, state}){
          console.log('action outgoingCall')
          let callDirection = 'OUTGOING'
          let number = state.callNumber
          if (number == '') {
            state.showCallButton = true
            return
          }
          commit('SET_CALL_DIRECTION', callDirection)
          apiRequest.getLabel(callDirection, number, '{{request.user.id}}','call')
          .then((response) => {
            callInfo = response.data
            callInfo.info = `${callInfo.info.split('-')[0]}- ${state.callNumber}`
            callInfo['status'] = 'Llamando'
            commit('UPDATE_CALL_INFO', callInfo)
            state.showCallButton = false
            commit('START_CALL')
            ctxSip.phoneCallButtonPressed()

            // update second user in outgoing call
            userInfo = {name:callInfo.label , avatar:callInfo.avatar, extension:callInfo.number}
            console.log(userInfo)
            commit('SET_PHONE_STATE', {phoneVar:'seconduserInfo', phoneState:userInfo})
            // Vue.set(state.inCallPeers, 0, {})
            // Vue.set(state.inCallPeers, 1, userInfo)
          }, (error) => {
            callInfo = {status:'Llamando', label:'Desconocido', info:'Número - '+number}
            commit('UPDATE_CALL_INFO', callInfo)
            state.showCallButton = false
            commit('START_CALL')
            ctxSip.phoneCallButtonPressed()
            console.log(error)
          })
          console.log('after AXIOS')
        },
        updateSecondUser({commit, state}, numbersInCall){
          secondExtension = numbersInCall.filter(x => x != '{{request.user.profile.get_extension}}')[0]
          apiRequest.getExtensionInfo(secondExtension)
          .then((response) => {
            userInfo = response.data
            commit('SET_PHONE_STATE', {phoneVar:'seconduserInfo', phoneState:userInfo})
            Vue.set(state.inCallPeers, 1, userInfo)
          }, (error) => {
            console.log(error)
          })
        },
        getLastNumber({ state }) {
          apiRequest.getLastNumber()
          .then((response) => {
            state.callNumber = response.data.number
          }, (error) => {
            console.log(error)
          })
        },
        preTranslateNumber({ state }) {
          console.log('Entro accion base html')
          apiRequest.preTranslateNumber(state.callNumber)
          .then((response) => {
            console.log('ENTRO action preTranslateNumber')
            console.log(response)
            state.callNumber = response.data
          }, (error) => {
            console.log(error)
          })
        },
        acceptCall({ commit, state }){
          ctxSip.clickToDial = null
          ctxSip.stopRingTone()
          state.showCallButton = false
          commit('UPDATE_CALL_INFO', {status:'Conectando...'})
          ctxSip.fireAnswerEvent()
        },
        answerCall({ commit, state }) {
          ctxSip.clickToDial = null
          commit('ANSWER_CALL')
          commit('INIT_STATISTIC')
          commit('UPDATE_CALL_INFO', {status:'En llamada'})
        },
        hangupCall({commit}) {
          console.log('action hangupCall')
          if (ctxSip.clickToDial) {
            // notify zoho click to call rejected
            vueApp.rejectClickToCall('rejected')
          }
          ctxSip.sipHangUp(ctxSip.callActiveID)
          ctxSip.stopRingTone()
          commit('HANGUP_CALL')
        },
        finishCall({ commit }) {
          ctxSip.stopRingTone()
          ctxSip.clickToDial = null
          const callInfoSurvey = ctxSip.currentSession.call_id
          if (callInfoSurvey){
            const [,call_idSurvey] = callInfoSurvey.split(':')
            vueApp.lastCallSurvey.call_id = call_idSurvey
            commit('HANGUP_CALL')
            setTimeout(() => {
              vueApp.showModal()
            }, 2000);
          }
          if(!callInfoSurvey){
            commit('HANGUP_CALL')
          }
        },
        pressDigit({ commit, state }, digit) {
          commit('APPEND_DIGIT', digit)
          ctxSip.sipSendDTMF(digit)
        },
        pressMute({ state }) {
          state.isMuted = !state.isMuted
          ctxSip.phoneMuteButtonPressed(ctxSip.callActiveID);
        },
        pressHold({ state }) {
          state.isHold = !state.isHold
          ctxSip.phoneHoldButtonPressed(ctxSip.callActiveID);
        },
        initTransfer({ commit, state }, { transferType, transferTarget }) {
          // target = window.prompt('Ingrese número destino', '');

          if (state.userInConference == true) {
            let alreadyInConference = state.conferenceMembers.filter(x => x.extension == transferTarget).length

            if (alreadyInConference != 0) {
              alertError(`No se puede agregar al número ${transferTarget} porque ya esta en la conferencia`);
              return
            }
          }

          if (ctxSip.currentSession.numbers_in_call.includes(String(transferTarget))) {
            alertError(`No se puede transferir al número ${transferTarget} porque ya esta en la llamada`);
            return
          }

          apiRequest.pbxTransfer(transferType, transferTarget)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            alertError(error.response.data.error)
          })
        },
        warnTranferAction({ commit, state }, transferPhase){
          state.warnTransfer = false
          apiRequest.warnTransfer(transferPhase)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            alertError('Error al transferir la llamada')
            console.log(error)
          })
        },
        restartCallDuration({ state }) {
          state.callDuration = 0
        },
        setTranferParams({ state }, {callId, transferType}) {
          state.isTransferInvited = true
          state.transferCallId = callId
          state.transferType = transferType
        },
        rejecttranferInvitation ({ state, commit }) {
          apiRequest.rejecttranferInvitation(state.transferCallId, state.transferType)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            alertError(error.response.data.error)
          })
          state.isTransferInvited = false
          state.transferCallId = ''
          state.transferType = ''
        },

        // Actions for call conference
        callConferenceMember({ state, commit }, number){
          console.log('entro accion callConferenceMember')
          let callDirection = 'OUTGOING'

          apiRequest.getLabel(callDirection, number, '{{request.user.id}}', 'call')
          .then((response) => {
            console.log(response)
            callInfo = response.data
            callInfo['status'] = 'Llamando'
            commit('CALL_CONFERENCE_MEMBER', {callInfo, number})
          }, (error) => {
            callInfo = {status:'Llamando', label:'Desconocido', info:'Número - '+number}
            commit('CALL_CONFERENCE_MEMBER', {callInfo, number})
          })
        },
        addConferenceMember({ state }, member){
          apiRequest.addConferenceMember(state.conferenceId, member)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            alertError('Error al agregar el miembro a la conferencia')
            console.log(error)
            console.log(error.message)
          })
        },
        removeConferenceMember({ state }, member){
          apiRequest.removeConferenceMember(state.conferenceId, member)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            alertError('Error al agregar el miembro a la conferencia')
            console.log(error)
          })
        },
        toggleConferenceRecord ({ state, commit }){
          commit('TOGGLE_CONFERENCE_RECORD')
          apiRequest.toggleConferenceRecord(state.conferenceId, state.recordConference)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            alertError('Error la grabación de la conferencia')
            console.log(error)
          })
        },
        removeInvitedChannel ({ state, commit }) {
          apiRequest.removeInvitedChannel(state.conferenceId, state.targetConferenceEndpoint)
          .then((response) => {
            console.log(response)
            commit('REMOVE_INVITED_CHANNEL')
          })
          .catch((error) => {
            alertError(error.response.data.error)
          })
        },
        

        // Actions for ContactBrowser Component
        setContacts({ commit }) {
          apiRequest.getContacts()
          .then((response) => {
            commit('SET_CONTACTS', response.data)
          })
          .catch((error) => {
            console.log(error)
          })
        },
        setPjsipContacts({ state }) {
          apiRequest.getPjsipContacts()
          .then((response) => {
            console.log('setPjsipContacts', response.data)
            state.pjsipContacts = response.data
            // commit('SET_PHONE_STATE', { phoneVar: 'pjsipContacts', phoneState: response.data })
          }, (error) => {
            console.log(error)
          })
        },
        showDialog({ commit }, type){
          commit('SHOW_DIALOG', type)
        },
        closeDialog({commit}) {
          commit('CLOSE_DIALOG')
        }
      }
    }),
    methods: {
      changeState() {
        this.$store.commit("ADD_EVENT");
      },
      rejectClickToCall(reason) {
        apiRequest.rejectClickToCall(reason)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          alertError('Error al notificar rehazo llamada')
          console.log(error)
        })
      },
      showModal(){
        const num = Math.floor(Math.random() * 9)
        if (num < 3) {
          this.isModalSurveyVisible = true
        }
      },
      closeModal(rate, comments){
        const rateNumber = Number(rate)
        const parseComments = comments.toString()
        this.sendSurvey(rateNumber, parseComments, this.lastCallSurvey.call_id);
        this.isModalSurveyVisible = false
      },
      sendSurvey(rate, comments, call_id){
        const data = {
          rate,
          comments,
          call_id,
        }
        apiClient.post(`/api/calls/survey/`, data)
      }
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
    PhoneStatusBar,
    StatusScreen, 
    CallScreen, 
    CallControls,
    ConferenceManager,
    ContactBrowser,
    KeyBoard,
    NumberKey,
    PhoneWidget
  }
};
import Phone from "./components/Phone.vue"
import PhoneStatusBar from "./components/PhoneStatusBar.vue";
import StatusScreen from "./components/StatusScreen.vue";
import CallScreen from "./components/CallScreen.vue";
import CallControls from "./components/CallControls.vue";
import ConferenceManager from "./components/ConferenceManager.vue";
import ContactBrowser from "./components/ContactBrowser.vue";
import KeyBoard from "./components/KeyBoard.vue";
import NumberKey from "./components/NumberKey.vue";
import PhoneWidget from "./components/PhoneWidget.vue";
import Vuex from "vuex"
import {phoneState,phoneGetters,phoneMutations} from "./phone.js"
</script>



<template>
  <h3>Mi sofphone</h3>




  
</template>