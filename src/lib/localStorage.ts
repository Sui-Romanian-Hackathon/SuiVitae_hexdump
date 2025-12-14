// IndexedDB helper for storing certificate PDFs locally

const DB_NAME = "SuiVitaeCertificates";
const DB_VERSION = 1;
const STORE_NAME = "certificates";

// Initialize IndexedDB
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "blobId" });
      }
    };
  });
}

// Check if PDF exists in local storage
export async function hasLocalPDF(blobId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(blobId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result !== undefined);
    });
  } catch (error) {
    console.error("Error checking local PDF:", error);
    return false;
  }
}

// Get PDF from local storage
export async function getLocalPDF(blobId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(blobId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.blob) {
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error("Error getting local PDF:", error);
    return null;
  }
}

// Save PDF to local storage
export async function saveLocalPDF(blobId: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ blobId, blob, savedAt: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`✅ PDF saved locally for blobId: ${blobId}`);
        resolve();
      };
    });
  } catch (error) {
    console.error("Error saving local PDF:", error);
    throw error;
  }
}

// Delete PDF from local storage
export async function deleteLocalPDF(blobId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(blobId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error deleting local PDF:", error);
    throw error;
  }
}

