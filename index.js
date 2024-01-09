const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("./config");
const db = require("./firebase");
const {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
} = require("firebase/firestore");

app.use(express.static("public"));
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("getMessages", () => {
    const data = [];
    getDocs(collection(db, "miniChatMessages")).then((e) => {
      e.docs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      io.sockets.emit("readMessages", data);
    });
  });

  socket.on("sendMessage", (req) => {
    addDoc(collection(db, "miniChatMessages"), req).then((e) => {
      io.sockets.emit("readNewMessage", { id: e.id, ...req });
    });
  });

  socket.on("deleteMessage", (req) => {
    deleteDoc(doc(db, "miniChatMessages", req.id)).then(() => {
      io.sockets.emit("removeMessage", req);
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
