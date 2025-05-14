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

    function register() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          const uid = userCredential.user.uid;
          db.ref("users/" + uid).set({
            email: email
          });
          document.getElementById("status").innerText = "Cadastrado!";
        })
        .catch(error => {
          document.getElementById("status").innerText = error.message;
        });
    }

    function login() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = "chat.html";
        })
        .catch(error => {
          document.getElementById("status").innerText = error.message;
        });
    }

