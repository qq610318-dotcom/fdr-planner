import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ 請把下面的 apiKey 和 appId 換成你截圖中完整的值
const firebaseConfig = {
  apiKey: "AIzaSyB6rAP8NPStaemo0yYWgBtXt2OtTX_REPLACE_THIS",
  authDomain: "fdr-planner.firebaseapp.com",
  projectId: "fdr-planner",
  storageBucket: "fdr-planner.firebasestorage.app",
  messagingSenderId: "516754417263",
  appId: "1:516754417263:web:3c39db7d232734ba_REPLACE_THIS",
  measurementId: "G-T88HHQPLTV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
