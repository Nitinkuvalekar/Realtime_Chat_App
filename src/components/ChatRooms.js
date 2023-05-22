/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import firebaseConfig from "../firebaseConfig";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    const chatRoomsRef = database.ref("chatRooms");

    chatRoomsRef.on("value", (snapshot) => {
      const rooms = snapshot.val();
      const chatRoomList = rooms
        ? Object.entries(rooms).map(([roomId, roomData]) => ({
            id: roomId,
            ...roomData,
          }))
        : [];
      setChatRooms(chatRoomList);
    });

    return () => {
      chatRoomsRef.off(); // Unsubscribe from the chat rooms updates
    };
  }, []);

  const handleCreateRoom = () => {
    if (newRoomName.trim() !== "") {
      const chatRoomsRef = database.ref("chatRooms");
      const newRoomRef = chatRoomsRef.push();
      newRoomRef.set({ name: newRoomName });
      setNewRoomName("");
    }
  };

  return (
    <div>
      <div className="main-content">
        <h5>
          <ul>
            {chatRooms.map((room) => (
              <li key={room.id}>
                {room.name}
                <Link to={`/chatRoom/${room.id}`}>
                  <i className="fa-solid fa-circle-chevron-right p-2"></i>
                </Link>
              </li>
            ))}
          </ul>
        </h5>

        <div className="create-room">
          <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
          <button onClick={handleCreateRoom}>Create New Room</button>
        </div>
      </div>
    </div>
  );
};

export default ChatRooms;
