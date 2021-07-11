import crypto from 'crypto';

export function createCodec(stringKey: string) {
  const key = crypto.createHash('sha256').update(stringKey).digest();

  return {
    encrypt,
    decrypt,
  };

  function encrypt(json: Object) {
    const iv = crypto.createHash('sha256').update(crypto.randomBytes(48).toString('hex')).digest();
    const resizedIV = Buffer.allocUnsafe(16);
    iv.copy(resizedIV);

    const cipher = crypto.createCipheriv('aes256', key, resizedIV);
    const msg = [];
    msg.push(cipher.update(JSON.stringify(json), 'binary', 'hex'));
    msg.push(cipher.final('hex'));
    return encodeURIComponent(JSON.stringify([resizedIV.toString('hex'), msg.join('')]));
  }

  function decrypt(input: string) {
    const [iv, ciphertext] = JSON.parse(decodeURIComponent(input));
    const bufferIV = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes256', key, bufferIV);
    const msg = [];
    msg.push(decipher.update(ciphertext, 'hex', 'binary'));
    msg.push(decipher.final('binary'));
    return JSON.parse(msg.join(''));
  }
}

export function createKey() {
  return crypto.randomBytes(48).toString('hex');
}
