import axios from "axios";
import vueApp from "../main"

export const apiClient = axios.create({
  baseURL: "https://test.sipmovil.com/",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Token ccbb8ecebd3be1606157ceedc86f179b8123fbfe",
    //"X-CSRFToken": 'yBAqqbZNB69nEEQLFTeO3VBI7TfRKalwAEJRRr6wRNnBlEv5oiU0RDt0EAFAXf52'
  },
});

export const apiRequest = {
  getLabel(callDirection, number, userId, optionPush) {
    return apiClient.get(
      `/api/pbx/get_call_info?call_direction=${callDirection}&number=${number}&user_id=${userId}&option_push=${optionPush}`
    );
  },
  getExtensionInfo(extension) {
    return apiClient.get(`/api/pbx/get_extension_info?number=${extension}`);
  },
  convertSDP(localDescription, remoteDescription) {
    return apiClient.post(
      `/api/pbx/translate_sdp?local=${localDescription}&remote=${remoteDescription}`
    );
  },
  getLastNumber() {
    return apiClient.get(`/api/webrtc/last_call?endpoint=${user.User}`);
  },
  preTranslateNumber(callNumber) {
    return apiClient.post(`/api/pbx/pre_translate?number=${callNumber}`);
  },
  pbxTransfer(transferType, transferTarget) {
    return apiClient.post(
      `/zoho/api/zoho_transfer?endpoint=${user.User}&target=${transferTarget}&call_id=${ctxSip.currentSession.call_id}&type=${transferType}`
    );
  },
  warnTransfer(transferPhase) {
    return apiClient.post(
      `/zoho/api/transfer_event?endpoint=${user.User}&phase=${transferPhase}&call_id=${ctxSip.currentSession.call_id}`
    );
  },
  rejectClickToCall(reason) {
    let from = ctxSip.clickToDial.from;
    let to = ctxSip.clickToDial.to;
    return apiClient.post(
      `/zoho/api/reject_call?endpoint=${user.User}&from=${from}&to=${to}&reason=${reason}`
    );
  },
  getContacts() {
    return apiClient.get("/api/webrtc/get_contacts");
  },
  removeConferenceMember(conferenceId, memberExtension) {
    return apiClient.post(
      `/zoho/api/remove_member?endpoint=${user.User}&conference_id=${conferenceId}&member=${memberExtension}`
    );
  },
  addConferenceMember(conferenceId, memberExtension) {
    return apiClient.post(
      `/zoho/api/add_member?endpoint=${user.User}&conference_id=${conferenceId}&member=${memberExtension}`
    );
  },
  toggleConferenceRecord(conferenceId, state) {
    return apiClient.post(
      `/zoho/api/toggle_record?endpoint=${user.User}&conference_id=${conferenceId}&state=${state}`
    );
  },
  removeInvitedChannel(conferenceId, targetEndpoint) {
    return apiClient.post(
      `/zoho/api/remove_invited?endpoint=${user.User}&conference_id=${conferenceId}&target_endpoint=${targetEndpoint}`
    );
  },
  // rejectConferenceInvitation(invitationData) {
  //   return apiClient.post(`/zoho/api/reject_invitation?invitor_endpoint=${invitationData.invitorEndpoint}&conference_id=${invitationData.conferenceId}&invitor_channel_id=${invitationData.invitorChannel}&invited_channel=${invitationData.invitedChannel}`)
  // },
  rejecttranferInvitation(transferCallId, transferType) {
    return apiClient.post(
      `/zoho/api/reject_transfer?call_id=${transferCallId}&transfer_type=${transferType}&endpoint=${user.User}`
    );
  },
  getPjsipContacts() {
    return apiClient.get("/api/webrtc/pjsip_contacts");
  },
};

export let ctxSip = {
  config: {
    password: "03EEFP3I",
    displayName: "115",
    uri: "sip:109582851223@pbxhost0.sipmovil.com",
    wsServers: "wss://pbxhost0.sipmovil.com:8089/ws",
    stunServers: ["stun:stun.l.google.com:19302"],
    traceSip: true,
    log: {
      level: 0,
    },
  },
  ringtone: document.getElementById("ringtone"),
  ringbacktone: document.getElementById("ringbacktone"),
  dtmfTone: document.getElementById("dtmfTone"),

  Sessions: [],
  callTimers: {},
  callActiveID: null,
  callVolume: 1,
  Stream: null,
  currentSession: null,
  clickToDial: null,

  /**
   * Parses a SIP uri and returns a formatted US phone number.
   *
   * @param  {string} phone number or uri to format
   * @return {string}       formatted number
   */
  formatPhone: function (phone) {
    var num;

    if (phone.indexOf("@")) {
      num = phone.split("@")[0];
    } else {
      num = phone;
    }

    num = num.toString().replace(/[^0-9]/g, "");

    if (num.length === 10) {
      return (
        "(" +
        num.substr(0, 3) +
        ") " +
        num.substr(3, 3) +
        "-" +
        num.substr(6, 4)
      );
    } else if (num.length === 11) {
      return (
        "(" +
        num.substr(1, 3) +
        ") " +
        num.substr(4, 3) +
        "-" +
        num.substr(7, 4)
      );
    } else {
      return num;
    }
  },

  // Sound methods
  startRingTone: function () {
    try {
      ctxSip.ringtone.play();
    } catch (e) {}
  },

  stopRingTone: function () {
    try {
      ctxSip.ringtone.pause();
    } catch (e) {}
  },

  startRingbackTone: function () {
    //try { ctxSip.ringbacktone.play(); } catch (e) { }
    console.log("telefono sin ring por ahora");
  },

  stopRingbackTone: function () {
    try {
      ctxSip.ringbacktone.pause();
    } catch (e) {}
  },

  // Genereates a rendom string to ID a call
  getUniqueID: function () {
    return Math.random().toString(36).substr(2, 9);
  },

  newSession: function (newSess) {
    console.log("Entro funcion newSession: " + newSess.direction);
    console.log(newSess);
    ctxSip.currentSession = { session: newSess };
    newSess.displayName =
      newSess.remoteIdentity.displayName || newSess.remoteIdentity.uri.user;
    newSess.ctxid = ctxSip.getUniqueID();
    var status;

    ctxSip.callActiveID = newSess.ctxid;

    if (newSess.direction === "incoming") {
      sessionDirection = "incoming";
      status = "Llamada entrante: " + newSess.displayName;

      // acciones para el sofphone movil

      if (!window.location.pathname.includes("mobile_phone")) {
        params = { show: "yes" };
        changeView("mobile_phone", params);
      }

      vueApp.$store.dispatch("incommingCall", newSess.displayName);
      ctxSip.callActiveID = newSess.ctxid;
    }

    ctxSip.setCallSessionStatus(status);

    // EVENT CALLBACKS

    newSess.on("SessionDescriptionHandler-created", function () {
      console.log("ENTRO EVENTO PEERCONNECTION");
      // console.log(newSess)
      // console.log(newSess.sessionDescriptionHandler)
      // var peerConnection = newSess.sessionDescriptionHandler.peerConnection;
      // var remoteStream = peerConnection.getRemoteStreams()[0];
      // console.log(remoteStream)
    });

    newSess.on("progress", function (e) {
      // localStorage.setItem('currentObj', JSON.stringify(e));
      traceLog("Evento progress direccion: " + e.direction, 1);
      if (e.direction === "outgoing") {
        ctxSip.setCallSessionStatus("Llamando");
      }
    });

    newSess.on("connecting", function (e) {
      traceLog("Evento connecting direccion: " + e.direction, 1);
      console.log(e);
      $("#btnCallNow").prop("hidden", true);
      $(".mobile-phone-container .btnHangup").css("margin-left", "0px");
      if (e.direction === "outgoing") {
        ctxSip.setCallSessionStatus("Conectando");
      }
    });

    newSess.on("accepted", function (e) {
      // If there is another active call, hold it
      peerConnection = this.mediaHandler.peerConnection;
      vueApp.$store.commit("SET_PHONE_STATE", {
        phoneVar: "peerConnection",
        phoneState: peerConnection,
      });
      traceLog("Evento accepted", 1);
      // vueApp.$store.dispatch('convertSDP')
      vueApp.$store.dispatch("answerCall");

      // acciones softphone movil
      $(".mobile-phone-container .option-icon").prop("disabled", false);
      $(".mobile-phone-container #numDisplay").prop("disabled", true);
      $(".mobile-phone-container .phone-backspace").prop("hidden", true);
      $(".mobile-phone-container #numDisplay")
        .parent()
        .removeClass("col-9")
        .addClass("col-11");

      if (ctxSip.callActiveID && ctxSip.callActiveID !== newSess.ctxid) {
        ctxSip.phoneHoldButtonPressed(ctxSip.callActiveID);
      }

      ctxSip.stopRingTone();
      ctxSip.callActiveID = newSess.ctxid;
    });

    newSess.on("hold", function (e) {
      ctxSip.fireHoldEvent();
    });

    newSess.on("unhold", function (e) {
      ctxSip.fireUnHoldEvent(newSess);
    });

    newSess.on("muted", function (e) {
      ctxSip.fireMuteEvent(newSess);
    });

    newSess.on("unmuted", function (e) {
      ctxSip.fireUnMuteEvent(newSess);
    });

    newSess.on("cancel", function (e) {
      traceLog("Evento cancel direccion: ", 1);
      console.log(ctxSip.clickToDial);

      // if call is zoho click to dial and call isnot answer
      if (!!ctxSip.clickToDial) {
        vueApp.rejectClickToCall("noanswer");
      }

      ctxSip.setCallSessionStatus("Cancelada");
      if (this.direction === "outgoing") {
        ctxSip.callActiveID = null;
        newSess = null;
        // restartPhoneControls();
        vueApp.$store.dispatch("finishCall");
      }
    });

    newSess.on("bye", function (e) {
      traceLog(e);
      traceLog("Evento bye direccion: ", 1);
      vueApp.$store.dispatch("finishCall");
      ctxSip.callActiveID = null;
      newSess = null;
    });

    newSess.on("failed", function (e) {
      vueApp.$store.dispatch("finishCall");
      console.log("Evento failed direccion: ", 1);
    });

    newSess.on("rejected", function (e) {
      traceLog("Evento rejected direccion: ", 1);
      vueApp.$store.dispatch("finishCall");
      ctxSip.callActiveID = null;
      newSess = null;
    });

    ctxSip.Sessions[newSess.ctxid] = newSess;
  },

  // getUser media request refused or device was not present
  getUserMediaFailure: function (e) {
    console.log("entro funcion getUserMediaFailure");
    window.console.error("getUserMedia failed:", e);
    ctxSip.setError(
      true,
      "Sin micrófono.",
      "No detectamos tu micrófono, revisa que esté habilitado en tu navegador, revisa la barra de direcciones.",
      true
    );
  },

  getUserMediaSuccess: function (stream) {
    ctxSip.Stream = stream;
  },

  setCallSessionStatus: function (status) {
    $(".txtCallStatus").html(status);
  },

  setStatus: function (status) {
    $("#txtRegStatus").html('<i class="fa fa-signal"></i> ' + status);
  },

  fireMuteEvent: function (newSess) {
    ctxSip.Sessions[newSess.ctxid].isMuted = true;
    ctxSip.setCallSessionStatus("Silenciada");
  },

  fireUnMuteEvent: function (newSess) {
    ctxSip.Sessions[newSess.ctxid].isMuted = false;
    ctxSip.setCallSessionStatus("Contestada");
  },

  fireHoldEvent: function () {
    traceLog("Evento hold", 1);
  },

  fireUnHoldEvent: function (newSess) {
    traceLog("Evento unhold", 1);
    ctxSip.callActiveID = newSess.ctxid;
  },

  fireDMTFEvent: function (dig) {
    vueApp.$store.commit("SET_PHONE_STATE", {
      phoneVar: "callNumber",
      phoneState: vueApp.$store.state.callNumber + dig,
    });
  },

  fireAnswerEvent: function () {
    $("#screenHoldOn").hide(1);
    var sessionid = ctxSip.callActiveID;
    ctxSip.phoneCallButtonPressed(sessionid);
  },

  sipCall: function (target) {
    console.log("target sipcall: " + target);
    console.log(ctxSip.Stream);
    try {
      var s = ctxSip.phone.invite(target, {
        media: {
          stream: ctxSip.Stream,
          constraints: { audio: true, video: false },
          render: {
            remote: $("#audioRemote").get()[0],
          },
          RTCConstraints: { optional: [{ DtlsSrtpKeyAgreement: "true" }] },
        },
        rel100: SIP.C.supported.SUPPORTED,
        earlyMedia: true,
        // inviteWithoutSdp: true
      });
      console.log("asignar stream en sipCall");
      s.direction = "outgoing";
      ctxSip.newSession(s);
    } catch (e) {
      throw e;
    }
  },

  sipTransfer: function (sessionid) {
    console.log("Entro funcion sipTransfer");
    var s = ctxSip.Sessions[sessionid],
      target = window.prompt("Ingrese número destino", "");
    console.log("paso var s");
    ctxSip.setCallSessionStatus("<i>Transfering the call...</i>");
    console.log("paso setCallSessionStatus");
    s.refer(target);
    console.log("paso s.refer(target)");
  },

  sipHangUp: function (sessionid) {
    console.log("entro sipHangUp sessionid: " + sessionid);
    var s = ctxSip.Sessions[sessionid];
    // s.terminate();
    if (!s) {
      return;
    } else if (s.startTime) {
      console.log("entro s.startTime: " + s.startTime);
      s.bye();
    } else if (s.reject) {
      console.log("entro s.reject: " + s.reject);
      s.reject();
    } else if (s.cancel) {
      console.log("entro s.cancel: " + s.cancel);
      s.cancel();
    }
  },

  sipSendDTMF: function (digit) {
    $("#dial-in-call").val($("#dial-in-call").val() + digit);
    try {
      ctxSip.dtmfTone.play();
    } catch (e) {}

    var a = ctxSip.callActiveID;
    if (a) {
      var s = ctxSip.Sessions[a];
      s.dtmf(digit);
    }
  },

  phoneCallButtonPressed: function (sessionid) {
    console.log("Funcion phoneCallButtonPressed sessionid: " + sessionid, 1);
    var s = ctxSip.Sessions[sessionid],
      target = "112";

    if (!s) {
      // $("#numDisplay").val("");
      ctxSip.sipCall(target);
    } else if (s.accept && !s.startTime) {
      console.log("asignar stream en phoneCallButtonPressed");
      s.accept({
        media: {
          stream: ctxSip.Stream,
          constraints: { audio: true, video: false },
          render: {
            remote: $("#audioRemote").get()[0],
          },
          RTCConstraints: { optional: [{ DtlsSrtpKeyAgreement: "true" }] },
        },
      });
    }
  },

  phoneMuteButtonPressed: function (sessionid) {
    var s = ctxSip.Sessions[sessionid];

    if (!s.isMuted) {
      s.mute();
    } else {
      s.unmute();
    }
  },

  phoneHoldButtonPressed: function (sessionid) {
    traceLog("Funcion phoneHoldButtonPressed ", 1);
    console.log("sessionid: " + sessionid);
    var s = ctxSip.Sessions[sessionid];
    console.log(s);
    console.log("s.isOnHold().local: " + s.isOnHold().local);
    if (s.isOnHold().local === true) {
      console.log("entro s.unhold");
      s.unhold();
    } else {
      s.hold();
      console.log("entro s.hold");
    }
  },

  setError: function (err, title, msg, closable) {
    $("#sophone-error").prop("hidden", false);
    $("#sophone-error").text(msg);
  },

  removeError: function () {
    $("#sophone-error").prop("hidden", true);
    $("#sophone-error").text("");
  },

  /**
   * Tests for a capable browser, return bool, and shows an
   * error modal on fail.
   */
  hasWebRTC: function () {
    if (navigator.webkitGetUserMedia) {
      return true;
    } else if (navigator.mozGetUserMedia) {
      return true;
    } else if (navigator.getUserMedia) {
      return true;
    } else {
      ctxSip.setError(
        true,
        "Navegador no soportado.",
        "Su navegador no soporta comunicaciones RTC. Utilice un navegador compatible."
      );
      window.console.error("WebRTC support not found");
      return false;
    }
  },
};
ctxSip.phone = new SIP.UA(ctxSip.config);

ctxSip.phone.on('connected', function(e) {
  console.log("WEBRTC connected ", 1)
  ctxSip.setStatus("Connected");
  ctxSip.removeError();
});

ctxSip.phone.on('disconnected', function(e) {
  $("#modal-asterisk-call").modal('hide')
  console.log("WEBRTC disconnected ", 1)

  ctxSip.setStatus("Disconnected");

  // disable phone
  ctxSip.setError(true, 'Desconectado.', 'Desconectado. Recargue la página para continuar llamando.');

  // remove existing sessions
  $("#sessions > .session").each(function(i, session) {
    ctxSip.removeSession(session, 500);
  });
});

ctxSip.phone.on('registered', function(e) {
  vueApp.$store.commit('SET_PHONE_STATE',{phoneVar:'phoneStatus', phoneState:'REGISTERED'})
  vueApp.$store.commit('SET_PHONE_STATE',{phoneVar:'pjsipAccount', phoneState:'109582851223'})
  //traceLog("WEBRTC registered ", 1)

  var closeEditorWarning = function() {
      return 'If you close this window, you will not be able to make or receive calls from your browser.';
  };

  var closePhone = function() {
    // stop the phone on unload
    localStorage.removeItem('ctxPhone');
    ctxSip.phone.stop();
  };

  // window.onbeforeunload = closeEditorWarning;
  // window.onunload       = closePhone;

  // This key is set to prevent multiple windows.
  //localStorage.setItem('ctxPhone', 'true');

  ctxSip.setStatus("SIPMOVIL");

  // Get the userMedia and cache the stream
  if (SIP.WebRTC.isSupported()) {
    SIP.WebRTC.getUserMedia({ audio : true, video : false }, ctxSip.getUserMediaSuccess, ctxSip.getUserMediaFailure);
  }

  // remove alert error when phone has been disconnected
  ctxSip.removeError();
});
