import { ref, get, set, onValue } from 'firebase/database';
import { database } from '../firebase';

const STATE_PATH = 'worldcup-sweepstake-state';

function serializeForFirebase(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(serializeForFirebase);
  const result = {};
  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined) {
      result[key] = serializeForFirebase(val);
    }
  }
  return result;
}

export async function loadState() {
  try {
    const snapshot = await get(ref(database, STATE_PATH));
    if (!snapshot.exists()) return null;
    return snapshot.val();
  } catch (error) {
    console.error('Error loading state from Firebase:', error);
    return null;
  }
}

export async function saveState(state) {
  try {
    await set(ref(database, STATE_PATH), serializeForFirebase(state));
  } catch (error) {
    console.error('Error saving state to Firebase:', error);
  }
}

export function onStateChange(callback) {
  const stateRef = ref(database, STATE_PATH);
  return onValue(stateRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  }, (error) => {
    console.error('Error listening to state changes:', error);
  });
}
