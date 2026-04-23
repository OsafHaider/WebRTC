import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../hooks/use-socket";
import peer from "../service/peer";
const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketID, setRemoteSocketID] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  console.log(myStream)
  const handleUserJoined = useCallback(function (data) {
    const { email, id } = data;
    console.log(`${email} has joined the room with id ${id}`);
    setRemoteSocketID(id);
  }, []);
  const handleCallUser = useCallback(async function () {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const offer=await peer.getOffers();
    socket.emit("user-call", { to: remoteSocketID, offer });
    setMyStream(stream);
  }, [remoteSocketID, socket]);








  const handleIncommingCall=useCallback(async function(data){
    const { from, offer }=data;
    setRemoteSocketID(from)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
    console.log(`incomming call from ${from} with offer ${offer.sdp}`);
    const answer=await peer.getAnswer(offer);
    socket.emit("call-accepted", { to: from, answer })
  }, [socket])


  const sendStreams=useCallback(()=>{
for(const track of myStream.getTracks()){
    peer.peer.addTrack(track, myStream)
  }
  },[myStream])

const handleCallAccepted=useCallback(function(data){
  const { from, answer }=data;
  peer.setLocalDescription(answer);
  console.log(`call accepted by ${from} with answer ${answer.sdp}`)
  sendStreams();
  
  
}, [sendStreams
])

const handleNegotiation=useCallback(async() => {
const offer=await peer.getOffers();
socket.emit("peer-negotiation", { offer, to: remoteSocketID })
    },[remoteSocketID, socket])

useEffect(() => {
  if (peer.peer) {
    peer.peer.addEventListener("negotiationneeded", handleNegotiation);
  }
  return () => {    if (peer.peer) {
      peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
    }
  };
},[myStream, handleNegotiation])



const handleNegotiationNeedIcomming=useCallback(async function(data){
  const { from, offer }=data;
  console.log(`Peer negotiation needed from ${from} with offer ${offer.sdp}`)
  const answer=await peer.getAnswer(offer);
  socket.emit("nego-done", { to: from, answer })
}, [socket])


const handleNegoFinal=useCallback(async function(data){
  const { from, answer }=data;
  console.log(`Negotiation done with ${from} with answer ${answer.sdp}`)
  await peer.setLocalDescription(answer);
},[])

useEffect(() => {
  if (peer.peer) {
    peer.peer.addEventListener("track", (event) => {
      const remoteStream = event.streams[0];
      console.log("Received remote stream:", remoteStream);
      setRemoteStream(remoteStream);
    });
  }
}, [myStream])





  useEffect(
    function () {
      socket.on("user-joined", handleUserJoined);
      socket.on("incomming-call", handleIncommingCall)
      socket.on("call-accepted", handleCallAccepted)
      socket.on("peer-negotiation",handleNegotiationNeedIcomming)
      socket.on("nego-done-final", handleNegoFinal)
      return function () {
        socket.off("user-joined", handleUserJoined);
        socket.off("incomming-call", handleIncommingCall)
        socket.off("call-accepted", handleCallAccepted)
        socket.off("peer-negotiation",handleNegotiationNeedIcomming)
        socket.off("nego-done-final", handleNegoFinal)

      };
    },
    [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegotiationNeedIcomming, handleNegoFinal],
  );
  return (
   <div className="min-h-screen bg-green-50 flex flex-col items-center justify-start py-6 px-4">
  
  {/* Header */}
  <h1 className="text-2xl font-bold text-green-600 mb-4">
    Video Call Room
  </h1>

  {/* Status */}
  <p className="text-gray-700 mb-4 text-center">
    {remoteSocketID
      ? `Connected: ${remoteSocketID}`
      : "Waiting for another user to join..."}
  </p>

  {/* Buttons */}
  <div className="flex gap-3 mb-6">
    {myStream && (
      <button
        onClick={sendStreams}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
      >
        Send Stream
      </button>
    )}

    {remoteSocketID && (
      <button
        onClick={handleCallUser}
        className="bg-white border border-green-500 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg shadow"
      >
        Call User
      </button>
    )}
  </div>

  {/* Video Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">

    {/* My Stream */}
    {myStream && (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-green-600 font-semibold mb-2 text-center">
          My Stream
        </h2>
        <video
          className="w-full rounded-lg"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = myStream;
          }}
        />
      </div>
    )}

    {/* Remote Stream */}
    {remoteStream && (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-green-600 font-semibold mb-2 text-center">
          Remote Stream
        </h2>
        <video
          className="w-full rounded-lg"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = remoteStream;
          }}
        />
      </div>
    )}

  </div>
</div>
  );
};

export default RoomPage;
