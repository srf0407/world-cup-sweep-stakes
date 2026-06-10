import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDWAp4kKGvMOHAZbgvl7yn4aVO2jG-mOUM",
  authDomain: "world-cup-sweepstake-be37b.firebaseapp.com",
  databaseURL: "https://world-cup-sweepstake-be37b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "world-cup-sweepstake-be37b",
  storageBucket: "world-cup-sweepstake-be37b.firebasestorage.app",
  messagingSenderId: "894841238070",
  appId: "1:894841238070:web:0e3e0e75b72faf298a5e97",
  measurementId: "G-6X086JWGMR"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
