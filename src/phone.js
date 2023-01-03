function timeFormat (currentTime) {
  let hours = String(Math.trunc(currentTime / 10))
  currentTime -= hours * 3600
  let minutes = String(Math.trunc(currentTime / 60))
  currentTime -= minutes * 60
  let seconds = String(currentTime)
  let strTime = ''
  if (hours == '0') {
    strTime = `${minutes.length == 1 ? '0' + minutes : minutes}:${seconds.length == 1 ? '0' + seconds : seconds}`
  } else {
    strTime = `${hours.length == 1 ? '0' + hours : hours}:${minutes.length == 1 ? '0' + minutes : minutes}:${seconds.length == 1 ? '0' + seconds : seconds}`
  }

  return strTime
}

export const phoneState = {
  userInCall: false,
  callNumber: '',
  callInProgress: false,
  callDuration: 0,
  callTimer: null,
  callInfo: { status: '', label: '', info: '' },
  userInfo: {name:'Usuario Pbx', avatar: '/static/images/male.png', extension: '???'},
  seconduserInfo: {name:'Usuario Pbx', avatar: '/static/images/male.png', extension: '???'},
  callDirection: '',
  phoneSmall: false,
  showPhone: false,
  pjsipAccount: '',
  phoneStatus: 'UNREGISTERED',
  isMuted: false,
  isHold: false,
  keyboardActive: true,
  showCallButton: true,
  showHangupButton: false,
  currentCallSession:false,
  callEvents: [],
  // call actions states
  disableInput: false,
  disableCallAnswer: false,
  disableCallHangUp: false,
  // Tranfer conference
  warnTransfer: false,
  isTransferInvited: false,
  transferCallId: '',
  transferType: '',
  // Conference parameters
  userInConference: false,
  conferenceMembers: [],
  userConferenceRole: '',
  showConferenceOptions: false,
  conferenceId: '',
  conferenceStarted: null,
  conferenceRecordDuration: 0,
  recordConference: false,
  recordTimer: null,
  conferenceCallInfo: { status: '', label: '', info: '' },
  conferenceCallDuration: 0,
  isAddingMember: false,
  extensionAdded: '',
  invitationData: null,
  targetConferenceEndpoint: '',

  // states for ContactBrowser Component
  showBrowser: false,
  browserTitle: '',
  browserContacts: [],
  choosenNumber: '',
  browserAction: '',
  pjsipContacts: [],

  // states for snackbar notification
  snackbarMessage: '',
  showSnackbar: false,

  // state for mobile UI
  isMobileDevice: false,

  // states for call status
  showCallStatistics: false,
  inCallPeers: [],
  peerConnection: null,
  localIp: '',
  RTCStatisticTimer: null,
  localDescription: null,
  remoteDescription: null,
  callQuality: -1,
}

export const phoneGetters = {
  callDurationFormat: state => {
    return timeFormat(state.callDuration)
  },
  recordDurationFormat: state => {
    return timeFormat(state.conferenceRecordDuration)
  }
}

export const phoneMutations = {
  ACTIVATE_TRANSFER (state) {
    state.warnTransfer = true
  },
  APPEND_DIGIT (state, digit) {
    currentNumber = state.callNumber
    state.callNumber = currentNumber + digit
  },
  CHANGE_PHONE_STATE (state, phoneState) {
    state.phoneStatus = phoneState
  },
  REMOVE_DIGIT (state) {
    currentNumber = state.callNumber
    state.callNumber = currentNumber.slice(0, currentNumber.length - 1)
  },
  RESET_NUMBER (state) {
    state.callNumber = ''
  },
  INIT_CALL (state, number) {
    if (state.userInCall == true || state.userInConference == true) {
      alertError('No se puede llamar mientras se esta en una llamada')
      return
    }
    state.callNumber = number
    state.showPhone = true
  },
  HANGUP_CALL (state) {
    console.log('mutation HANGUP_CALL')
    state.userInCall = false
    state.callNumber = ''
    state.callInProgress = false
    state.callDuration = 0
    state.callDirection = ''
    state.phoneSmall = false
    state.isMuted = false
    state.isHold = false
    state.keyboardActive = true
    state.warnTransfer = false
    clearInterval(state.callTimer)
    state.callTimer = null
    state.phoneStatus = 'REGISTERED'
    state.callInfo = { status: '', label: '', info: '' }
    state.showCallButton = true
    state.currentCallSession = false
    state.showHangupButton = false
    state.callEvents = []
    // call actions states
    state.disableInput = false
    state.disableCallAnswer = false
    state.disableCallHangUp = false
    // conference parameters
    state.conferenceId = ''
    state.conferenceMembers = []
    state.conferenceStarted = null
    state.userInConference = false
    state.userConferenceRole = ''
    state.showConferenceOptions = false
    state.conferenceRecordDuration = 0
    state.recordConference = false
    state.conferenceCallInfo = { status: '', label: '', info: '' }
    state.conferenceCallDuration = 0
    state.isAddingMember = false
    state.invitationData = null
    state.targetConferenceEndpoint = ''
    // contact browser
    state.showBrowser = false
    state.choosenNumber = ''

    // RTC stattistics
    state.showCallStatistics = false
    state.inCallPeers = []
    state.peerConnection = null
    clearInterval(state.RTCStatisticTimer)
    state.localDescription = null
    state.remoteDescription =  null
    state.callQuality = -1
  },
  START_CALL (state) {
    state.keyboardActive = false
    state.callInProgress = true
    state.phoneStatus = 'BUSY'
    state.showHangupButton = true
  },
  ANSWER_CALL (state) {
    state.callTimer = setInterval(function () {
      state.callDuration += 1
    }, 1000)
    state.phoneStatus = 'IN_CALL'
    state.userInCall = true
    state.showCallButton = false
  },
  SET_CALL_DIRECTION (state, direction) {
    state.callDirection = direction
  },
  SET_PHONE_STATE (state, { phoneVar, phoneState }) {
    state[phoneVar] = phoneState
  },
  UPDATE_CALL_INFO (state, callInfo) {
    Object.assign(state.callInfo, callInfo)
  },
  UPDATE_CONFERENCE_INFO (state, conferenceInfo) {
    Object.assign(state.conferenceCallInfo, conferenceInfo)
  },
  UPDATE_USER_INFO (state, userInfo) {
    Object.assign(state.userInfo, userInfo)
  },
  TOGGLE_PHONE (state) {
    state.showPhone = !state.showPhone
  },

  // Mutations for conference call
  INIT_CONFERENCE (state, { conferenceId, userConferenceRole, conferenceStarted }) {
    state.userInConference = true
    state.userConferenceRole = userConferenceRole
    state.conferenceId = conferenceId
    state.conferenceStarted = new Date(conferenceStarted)
  },
  ADD_CONFERENCE_MEMBER (state, { members, conferenceId, extensionAdded }) {
    console.log('entro mutacion ADD_CONFERENCE_MEMBER')
    if (state.conferenceId == conferenceId) {
      var oldMembers = state.conferenceMembers
      state.conferenceMembers = members

      var newMember = null
      for (var i = 0; i < members.length; i++) {
        var memberExists = oldMembers.filter(x => x.extension == members[i].extension).length > 0
        if (memberExists == false) {
          newMember = members[i]// oldMembers.filter(x => x.extension == members[i].extension)[0]
        }
      }

      if (state.extensionAdded == extensionAdded) {
        state.isAddingMember = false
        state.conferenceCallInfo = { status: '', label: '', info: '' }
        state.extensionAdded = ''
      }

      // show snackbar with new member added
      state.snackbarMessage = `${newMember.name} ha sido agregado a la conferencia`
      state.showSnackbar = true
    }
  },
  CALL_CONFERENCE_MEMBER (state, { callInfo, number }) {
    console.log('entro mutacion CALL_CONFERENCE_MEMBER')
    console.log(callInfo)
    Object.assign(state.conferenceCallInfo, callInfo)
    state.isAddingMember = true
    state.extensionAdded = number
  },
  REMOVE_CONFERENCE_MEMBER (state, { member, conferenceId }) {
    if (state.conferenceId == conferenceId) {
      var removedMember = state.conferenceMembers.filter(x => x.extension == member)[0]
      state.conferenceMembers = state.conferenceMembers.filter(x => x.extension != member)

      // show snackbar with removed member
      state.snackbarMessage = `${removedMember.name} ha abandonado la conferencia`
      state.showSnackbar = true
    }
  },
  TOGGLE_CONFERENCE_RECORD (state) {
    newValue = !state.recordConference
    state.recordConference = newValue
    if (newValue == true) {
      state.recordTimer = setInterval(function () {
        state.conferenceRecordDuration += 1
      }, 1000)
    } else {
      clearInterval(state.recordTimer)
    }
  },
  REMOVE_INVITED_CHANNEL (state) {
    state.isAddingMember = false
    state.conferenceCallInfo = { status: '', label: '', info: '' }
    state.extensionAdded = ''
  },
  INVITED_REJECT (state) {
    // show snackbar with the invited that reject
    state.snackbarMessage = `${state.conferenceCallInfo.label} ha rechazado invitación`
    state.showSnackbar = true
    state.targetConferenceEndpoint = ''

    state.isAddingMember = false
    state.conferenceCallInfo = { status: '', label: '', info: '' }
    state.extensionAdded = ''
  },
  RECEIVE_CONFERENCE_INVITATION (state, invitationData) {
    state.invitationData = invitationData
    // state.conferenceId = conferenceId
  },

  // Mutations for ContactBrowser Component
  SET_CONTACTS (state, contacts) {
    state.browserContacts = contacts
  },
  SHOW_DIALOG (state, type) {
    let title = ''
    switch (type) {
      case 'warn':
        title = 'Elegir destino tranferencia atendida'
        break
      case 'blind':
        title = 'Elegir destino tranferencia ciega'
        break
      case 'conference':
        title = 'Agregar miembro conferencia'
        break
    }
    state.showBrowser = true
    state.browserTitle = title
    state.browserAction = type
  },
  CLOSE_DIALOG (state) {
    state.showBrowser = false
    state.browserTitle = ''
    state.browserAction = ''
  },

  // Mutations for snackbar Component
  SHOW_MESSAGE (state, message) {
    state.snackbarMessage = message
    state.showSnackbar = true
  },

  // Mutations for call Statistics
  TOGGLE_STATISTIC (state) {
    state.showCallStatistics = !state.showCallStatistics
  },
  INIT_STATISTIC (state) {
    inboundKeys = ['ssrc', 'packetsReceived', 'bytesReceived', 'packetsLost', 'jitter']
    outboundKeys = ['ssrc', 'packetsSent', 'bytesSent', 'packetsLost']
    localPeer = Object.assign(state.userInfo, {localIp: state.localIp})
    state.inCallPeers.push(localPeer)
    remotePeer = state.seconduserInfo
    state.inCallPeers.push(remotePeer)

    // acum variables to measure the speed
    prevBytes = 0
    prevPackets = 0

    state.RTCStatisticTimer = setInterval(function () {
      state.peerConnection.getStats(null).then(stats => {
      stats.forEach(report => {
        if (report.type == 'outbound-rtp' || report.type == 'inbound-rtp' ) { //|| report.type == 'inbound-rtp'         
          peerIndex = report.type == 'outbound-rtp' ? 0 : 1
          statsObj = state.inCallPeers[peerIndex] 
          statsObj['statDirection'] = report.type == 'outbound-rtp' ? 'outbound' : 'inbound'
          checkList = report.type == 'outbound-rtp' ? outboundKeys : inboundKeys
          Object.keys(report).forEach(statName => {
            if (checkList.includes(statName)) {
              statsObj[statName] = report[statName] 
              if (statName == 'jitter'){
                state.callQuality = parseFloat(report[statName]) * 1000
              }             
            }
          });

          varBytes = report.type == 'outbound-rtp' ? statsObj.bytesSent : statsObj.bytesReceived
          varPackets = report.type == 'outbound-rtp' ? statsObj.packetsSent : statsObj.packetsReceived

          statsObj.byteRate = prevBytes == 0 ? varBytes : varBytes - prevBytes
          statsObj.packetsRate = prevBytes == 0 ? varPackets : varPackets - prevPackets

          prevBytes = varBytes
          prevPackets = varPackets

          Vue.set(state.inCallPeers, peerIndex, statsObj)
          
        } 
      });
    });
    }, 1000)
  },

}

//function
