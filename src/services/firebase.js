import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBOVIxeBvo4BxPniGYYWczp5DEbWVv1asw",
    authDomain: "prettyyou-958e9.firebaseapp.com",
    projectId: "prettyyou-958e9",
    storageBucket: "prettyyou-958e9.firebasestorage.app",
    messagingSenderId: "981565959741",
    appId: "1:981565959741:web:384e3fd7192dddd4834454",
    measurementId: "G-N7X62059QT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
