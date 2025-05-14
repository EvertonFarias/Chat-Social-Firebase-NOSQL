 const firebaseConfig = {
      apiKey: "AIzaSyDWIecSQ48-VnXDBdaEAqhOL1cwlCEoa9w",
      authDomain: "chat-social-3c317.firebaseapp.com",
      databaseURL: "https://chat-social-3c317-default-rtdb.firebaseio.com",
      projectId: "chat-social-3c317",
      storageBucket: "chat-social-3c317.appspot.com",
      messagingSenderId: "1087201105550",
      appId: "1:1087201105550:web:dba1c47c300d0d4a7f1bdf"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();

    let currentChatId = null;

    auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById("userEmail").textContent = user.email;
        loadChats();
        loadUsers();
    }
    });

    function logout() {
      auth.signOut();
    }

document.getElementById("chatType").addEventListener("change", function () {
  const userSelect = document.getElementById("userSelect");

  if (this.value === "private") {
    userSelect.style.display = "block";
    userSelect.multiple = false;
  } else if (this.value === "group") {
    userSelect.style.display = "block";
    userSelect.multiple = true;
  } else {
    userSelect.style.display = "none";
    userSelect.multiple = false;
  }
});


function loadUsers() {
  const uid = auth.currentUser.uid;
  const userSelect = document.getElementById("userSelect");

  db.ref("users").once("value", snapshot => {
    const users = snapshot.val();
    userMap = users || {};
    userSelect.innerHTML = "";

    for (let userId in users) {
      if (userId !== uid) {
        const option = document.createElement("option");
        option.value = userId;
        option.textContent = users[userId].email;
        userSelect.appendChild(option);
      }
    }
  });
}


    function createChat() {
      const name = document.getElementById("chatName").value;
      const type = document.getElementById("chatType").value;
      const uid = auth.currentUser.uid;
      const userSelect = document.getElementById("userSelect");
      const selectedUsers = Array.from(userSelect.selectedOptions).map(opt => opt.value);

      if (!name.trim()) return;

      if ((type === "private" || type === "group") && selectedUsers.length === 0) {
        alert("Selecione pelo menos um usuário.");
        return;
      }

      if (type === "private" && selectedUsers.length > 1) {
        alert("Chat privado deve ter apenas um usuário selecionado.");
        return;
      }

      const newChatRef = db.ref("chats").push();
      let members = { [uid]: true };

      selectedUsers.forEach(id => members[id] = true);

      newChatRef.set({
        name: name,
        type: type,
        members: members
      });

      document.getElementById("chatName").value = "";
      userSelect.selectedIndex = -1;
    }

    function loadChats() {
      const uid = auth.currentUser.uid;
      db.ref("chats").on("value", snapshot => {
        const chats = snapshot.val();
        const chatList = document.getElementById("chatList");
        chatList.innerHTML = "";

        for (let chatId in chats) {
          const chat = chats[chatId];
          if (chat.type === "public" || (chat.members && chat.members[uid])) {
            const li = document.createElement("li");
            li.textContent = `${chat.name} (${chat.type})`;
            li.onclick = () => openChat(chatId);
            chatList.appendChild(li);
          }
        }
      });
    }

    function openChat(chatId) {
      currentChatId = chatId;
      const msgDiv = document.getElementById("messages");
      msgDiv.innerHTML = "";

      db.ref("messages/" + chatId).off();
      db.ref("messages/" + chatId).on("child_added", snapshot => {
        const msg = snapshot.val();
        const p = document.createElement("p");
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const senderEmail = userMap[msg.sender]?.email || msg.sender;
        p.textContent = `[${time}] ${senderEmail}: ${msg.text}`;

        msgDiv.appendChild(p);
        msgDiv.scrollTop = msgDiv.scrollHeight;
      });
    }

    function sendMessage() {
      const uid = auth.currentUser.uid;
      const text = document.getElementById("msgInput").value;
      const timestamp = Date.now();

      if (currentChatId && text.trim() !== "") {
        db.ref("messages/" + currentChatId).push({
          sender: uid,
          text: text,
          timestamp: timestamp
        });
        document.getElementById("msgInput").value = "";
      }
    }

    const msgINput = document.querySelector("#msgInput");

    msgINput.addEventListener('keydown', function(event) { 
      if (event.key === 'Enter') {
        sendMessage();
      }
    });