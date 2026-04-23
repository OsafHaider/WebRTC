import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "../hooks/use-socket";

export const PeerContext = createContext(null);

export const PeerProvider = ({ children }) => {
  const socket = useSocket();
  const [remoteStream, setRemoteStream] = useState(null);

  const peer = useMemo(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onconnectionstatechange = () => {
      console.log("🔗 STATE:", pc.connectionState);
    };

    return pc;
  }, []);

  // =========================
  // ICE (PRODUCTION SAFE)
  // =========================
  const attachIceHandlers = useCallback(
    (emailID) => {
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            emailID,
            candidate: event.candidate,
          });
        }
      };
    },
    [peer, socket]
  );

  useEffect(() => {
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("ICE error", e);
      }
    });

    return () => socket.off("ice-candidate");
  }, [peer, socket]);

  // =========================
  // OFFER
  // =========================
  const createOffer = useCallback(async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  }, [peer]);

  // =========================
  // ANSWER
  // =========================
  const createAnswer = useCallback(async (offer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    return answer;
  }, [peer]);

  const setRemoteAnswer = useCallback(async (answer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  }, [peer]);

  // =========================
  // STREAM (FIXED ONCE ONLY)
  // =========================
  const streamAttached = useMemo(() => new Set(), []);

  const sendStream = useCallback(
    (stream, emailID) => {
      if (streamAttached.has("done")) return;

      attachIceHandlers(emailID);

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      streamAttached.add("done");

      console.log("🎥 STREAM ATTACHED ONCE");
    },
    [peer, attachIceHandlers, streamAttached]
  );

  // =========================
  // RECEIVE STREAM
  // =========================
  useEffect(() => {
    peer.ontrack = (event) => {
      const stream = event.streams?.[0];

      if (stream) {
        console.log("🎬 REMOTE STREAM RECEIVED");

        setRemoteStream(new MediaStream(stream));
      }
    };
  }, [peer]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};