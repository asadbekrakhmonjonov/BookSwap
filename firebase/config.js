import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-iNB_fwtGVLZ3hFe8820DYY8BtzufEVQ",
  authDomain: "bookswap-5348d.firebaseapp.com",
  projectId: "bookswap-5348d",
  storageBucket: "bookswap-5348d.appspot.com",  // fix here
  messagingSenderId: "616532818768",
  appId: "1:616532818768:web:a1340bca2b56346d02ca55",
  measurementId: "G-VWJGRQWGDH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
