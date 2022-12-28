import {createStore} from "vuex"
import {phoneGetters,phoneState,phoneMutations} from "../phone.js"
import axios from "axios"

const apiClient = axios.create({
  baseURL: 'http://localhost:8001',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authentication: 'Token d0c481f5886f30f533f0e88a4190210db154d5f0',
    "X-CSRFToken": 'yBAqqbZNB69nEEQLFTeO3VBI7TfRKalwAEJRRr6wRNnBlEv5oiU0RDt0EAFAXf52'
  }
})

const apiRequest = {
  getLabel(callDirection, number, userId, optionPush){
    return apiClient.get(`/api/pbx/get_call_info?call_direction=${callDirection}&number=${number}&user_id=${userId}&option_push=${optionPush}`)
  },
  getExtensionInfo(extension){
    return apiClient.get(`/api/pbx/get_extension_info?number=${extension}`)
  },
  convertSDP(localDescription, remoteDescription){
    return apiClient.post(`/api/pbx/translate_sdp?local=${localDescription}&remote=${remoteDescription}`)
  },
  getLastNumber() {
    return apiClient.get(`/api/webrtc/last_call?endpoint=${user.User}`)
  },
  preTranslateNumber(callNumber){
    return apiClient.post(`/api/pbx/pre_translate?number=${callNumber}`)
  },
  pbxTransfer(transferType, transferTarget) {
    return apiClient.post(`/zoho/api/zoho_transfer?endpoint=${user.User}&target=${transferTarget}&call_id=${ctxSip.currentSession.call_id}&type=${transferType}`)
  },
  warnTransfer(transferPhase) {
    return apiClient.post(`/zoho/api/transfer_event?endpoint=${user.User}&phase=${transferPhase}&call_id=${ctxSip.currentSession.call_id}`)
  },
  rejectClickToCall(reason) {
    let from = ctxSip.clickToDial.from
    let to = ctxSip.clickToDial.to
    return apiClient.post(`/zoho/api/reject_call?endpoint=${user.User}&from=${from}&to=${to}&reason=${reason}`)
  },
  getContacts() {
    return apiClient.get('/api/webrtc/get_contacts')
  },
  removeConferenceMember(conferenceId, memberExtension) {
    return apiClient.post(`/zoho/api/remove_member?endpoint=${user.User}&conference_id=${conferenceId}&member=${memberExtension}`)
  },
  addConferenceMember(conferenceId, memberExtension) {
    return apiClient.post(`/zoho/api/add_member?endpoint=${user.User}&conference_id=${conferenceId}&member=${memberExtension}`)
  },
  toggleConferenceRecord(conferenceId, state) {
    return apiClient.post(`/zoho/api/toggle_record?endpoint=${user.User}&conference_id=${conferenceId}&state=${state}`)
  },
  removeInvitedChannel(conferenceId, targetEndpoint) {
    return apiClient.post(`/zoho/api/remove_invited?endpoint=${user.User}&conference_id=${conferenceId}&target_endpoint=${targetEndpoint}`)
  },
  // rejectConferenceInvitation(invitationData) {
  //   return apiClient.post(`/zoho/api/reject_invitation?invitor_endpoint=${invitationData.invitorEndpoint}&conference_id=${invitationData.conferenceId}&invitor_channel_id=${invitationData.invitorChannel}&invited_channel=${invitationData.invitedChannel}`)
  // },
  rejecttranferInvitation(transferCallId, transferType) {
    return apiClient.post(`/zoho/api/reject_transfer?call_id=${transferCallId}&transfer_type=${transferType}&endpoint=${user.User}`)
  },
  getPjsipContacts() {
    return apiClient.get('/api/webrtc/pjsip_contacts')
  },
}

export default createStore({
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
})