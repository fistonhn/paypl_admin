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
const DELETE_PIN = 'F@123456';
const ADD_PIN = 'F@123456'; // Same or different as DELETE_PIN

function App() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPinInput, setAddPinInput] = useState('');
  const [addPinError, setAddPinError] = useState('');

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

  const handleDeleteRequest = (id) => {
    setSelectedCodeId(id);
    setShowModal(true);
    setPinInput('');
    setPinError('');
  };

  const confirmDelete = async () => {
    if (pinInput !== DELETE_PIN) {
      setPinError('Incorrect PIN. Please try again.');
      return;
    }
    await deleteDoc(doc(db, CODES_COLLECTION, selectedCodeId));
    setShowModal(false);
    fetchCodes();
  };

  const confirmAddCode = async () => {
    if (addPinInput !== ADD_PIN) {
      setAddPinError('Incorrect PIN. Please try again.');
      return;
    }

    if (!newCode.trim()) return;

    await addDoc(collection(db, CODES_COLLECTION), {
      code: newCode.trim(),
      used: false,
      devices: []
    });

    setNewCode('');
    setShowAddModal(false);
    setAddPinInput('');
    fetchCodes();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🛠️ Activation Code Admin Panel</h1>

      <div style={styles.addCodeBox}>
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Enter new code"
          style={styles.input}
        />
        <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
          ➕ Add Code
        </button>
      </div>

      <div style={styles.codeList}>
        {codes.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No activation codes yet.</p>
        ) : (
          codes.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.codeInfo}>
                <h3 style={styles.codeText}>🔑 Code: {item.code}</h3>
                <p>✅ Used: <strong>{item.used ? 'Yes' : 'No'}</strong></p>
              </div>

              <div style={styles.deviceSection}>
                <h4>📱 Devices:</h4>
                {item.devices && item.devices.length > 0 ? (
                  <ul style={styles.deviceList}>
                    {item.devices.map((device, idx) => (
                      <li key={idx} style={styles.deviceItem}>
                        <strong>ID:</strong> {device.id}<br />
                        <strong>Brand:</strong> {device.brand} <br />
                        <strong>Model:</strong> {device.modelName} <br />
                        <strong>OS:</strong> {device.osName} {device.osVersion} <br />
                        <strong>Activated at:</strong>{' '}
                        {new Date(device.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ marginTop: 5, color: '#888' }}>No devices registered</p>
                )}
              </div>

              <button onClick={() => handleDeleteRequest(item.id)} style={styles.deleteButton}>
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Confirm Deletion</h3>
            <p>Enter admin PIN to confirm deletion:</p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              style={styles.input}
              placeholder="Enter PIN"
            />
            {pinError && <p style={{ color: 'red' }}>{pinError}</p>}
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button onClick={confirmDelete} style={styles.addButton}>Confirm</button>
              <button onClick={() => setShowModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Code Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Confirm New Code</h3>
            <p>Enter admin PIN to add code:</p>
            <input
              type="password"
              value={addPinInput}
              onChange={(e) => setAddPinInput(e.target.value)}
              style={styles.input}
              placeholder="Enter PIN"
            />
            {addPinError && <p style={{ color: 'red' }}>{addPinError}</p>}
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button onClick={confirmAddCode} style={styles.addButton}>Confirm</button>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f5f8fa',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#222',
  },
  addCodeBox: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '30px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    width: '250px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#aaa',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  codeList: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
  },
  codeInfo: {
    marginBottom: '10px',
  },
  codeText: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
  },
  deviceSection: {
    marginTop: '10px',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '8px',
  },
  deviceList: {
    listStyle: 'none',
    paddingLeft: 0,
    margin: 0,
  },
  deviceItem: {
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: '1px solid #ddd',
  },
  deleteButton: {
    marginTop: '15px',
    padding: '8px 12px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  },
};

export default App;
