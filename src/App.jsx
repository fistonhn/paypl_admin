import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD0chuKSE6HKNKWUJU9mDe50N3bqYLfnMI',
  authDomain: 'paypl-27218.firebaseapp.com',
  projectId: 'paypl-27218',
  storageBucket: 'paypl-27218.appspot.com',
  messagingSenderId: '322317526974',
  appId: '1:322317526974:android:4d369cd26d8fba27217bef',
  databaseURL: 'https://paypl-27218-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const CODES_COLLECTION = 'paypl28';

function App() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState('');

  // Fetch all codes on load
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const snapshot = await getDocs(collection(db, CODES_COLLECTION));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCodes(data);
  };

  const handleAddCode = async () => {
    if (!newCode.trim()) return;
    await addDoc(collection(db, CODES_COLLECTION), {
      code: newCode.trim(),
      used: false
    });
    setNewCode('');
    fetchCodes();
  };

  const handleDeleteCode = async (id) => {
    await deleteDoc(doc(db, CODES_COLLECTION, id));
    fetchCodes();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Admin Code Manager</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Enter new code"
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleAddCode}>Add Code</button>
      </div>

      <h2>All Activation Codes</h2>
      {codes.length === 0 ? (
        <p>No codes yet.</p>
      ) : (
        <ul>
          {codes.map((item) => (
            <li key={item.id} style={{ marginBottom: '8px' }}>
              <strong>{item.code}</strong> - Used: {item.used ? 'Yes' : 'No'}
              <button
                onClick={() => handleDeleteCode(item.id)}
                style={{ marginLeft: '10px' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
