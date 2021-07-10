class Encryption {
  static async getKeyMaterial(password: string) {
    const encoder = new TextEncoder();

    return window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
      'deriveBits',
      'deriveKey',
    ]);
  }

  static async deriveKey(keyMaterial: CryptoKey, salt: any) {
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async generateRandomKeyBuffer() {
    const randomKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedRandomKey = await window.crypto.subtle.exportKey('raw', randomKey);

    return new Uint8Array(exportedRandomKey);
  }

  static save({ salt, encryptedKey, iv }: any) {
    //TODO: don't save to localStorage, but to backend
  }

  static async encryptKey(keyBuffer: any, password: string) {
    // generate key from password  to use in encryption
    const keyMaterial = await Encryption.getKeyMaterial(password);
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    const masterKey = await Encryption.deriveKey(keyMaterial, salt);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedKey = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      masterKey,
      keyBuffer
    );
    const encryptedKeyArray = new Uint8Array(encryptedKey);
    const temp = {
      salt: JSON.stringify(Array.from(salt)),
      encryptedKey: JSON.stringify(Array.from(encryptedKeyArray)),
      iv: JSON.stringify(Array.from(iv)),
    };
    this.save(temp);
    return temp;
  }

  static async decryptKey(password: string) {
    //TODO: retrieve from backend, not localStorage

    const encryptedSymmetricKeyString = localStorage.getItem('encryptedSymmetricKey');
    const ivString = localStorage.getItem('iv');
    const saltString = localStorage.getItem('salt');

    const encryptedSymmetricKeyArray = JSON.parse(encryptedSymmetricKeyString || '');
    const ivArray = JSON.parse(ivString || '');
    const saltArray = JSON.parse(saltString || '');

    const keyMaterial = await Encryption.getKeyMaterial(password);
    const masterKey = await Encryption.deriveKey(keyMaterial, new Uint8Array(saltArray));

    const decryptedSymmetricKey = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivArray),
      },
      masterKey,
      encryptedSymmetricKeyArray
    );

    return new Uint8Array(decryptedSymmetricKey);
  }
}

export default Encryption;
