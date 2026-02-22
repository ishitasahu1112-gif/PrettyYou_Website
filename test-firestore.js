import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBOVIxeBvo4BxPniGYYWczp5DEbWVv1asw",
    authDomain: "prettyyou-958e9.firebaseapp.com",
    projectId: "prettyyou-958e9",
    storageBucket: "prettyyou-958e9.firebasestorage.app",
    messagingSenderId: "981565959741",
    appId: "1:981565959741:web:384e3fd7192dddd4834454",
    measurementId: "G-N7X62059QT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    console.log("Fetching products...");
    try {
        const snap = await getDocs(collection(db, "products"));
        console.log("Fetched", snap.size, "products");
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
    
    console.log("Attempting to write...");
    try {
        const docRef = await Promise.race([
            addDoc(collection(db, "test_collection"), { test: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 5000))
        ]);
        console.log("Write success!", docRef.id);
    } catch (e) {
        console.error("Write failed:", e.message);
    }
    process.exit(0);
}
test();
