import { useContext } from "react";
import { PeerContext } from "../context/peer";

export const usePeer=() => {
    const peer = useContext(PeerContext);
    return peer;
}