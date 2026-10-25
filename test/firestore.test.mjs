import test from 'node:test';
import assert from 'node:assert/strict';
import { firestoreKomut } from '../api/_firestore.js';

// Sahte Firestore: yalnızca bu bağdaştırıcının kullandığı yüzey.
function sahteDb() {
  const cols = new Map();
  const col = ad => cols.get(ad) || cols.set(ad, new Map()).get(ad);
  const doc = (ad, id) => ({
    async get() { const v = col(ad).get(id); return { exists: !!v, data: () => v }; },
    async set(v) { col(ad).set(id, { ...v }); },
    async update(v) { col(ad).set(id, { ...col(ad).get(id), ...v }); },
    async delete() { col(ad).delete(id); },
  });
  const db = {
    collection: ad => ({ doc: id => doc(ad, id), async get() { return { docs: [...col(ad).values()].map(v => ({ data: () => v })) }; } }),
    async runTransaction(fn) { return fn({ get: r => r.get(), set: (r, v) => { r.set(v); } }); },
  };
  return db;
}

test('GET/SET/DEL ve süre sonu', async () => {
  let t = 1000; const k = firestoreKomut(sahteDb(), () => t);
  assert.equal(await k(['GET', 'a']), null);
  await k(['SET', 'a', 'x', 'EX', 10]);
  assert.equal(await k(['GET', 'a']), 'x');
  assert.equal(await k(['TTL', 'a']), 10);
  t += 11000; assert.equal(await k(['GET', 'a']), null);
  await k(['SET', 'b', 'y']); assert.equal(await k(['TTL', 'b']), -1);
  assert.equal(await k(['DEL', 'b']), 1); assert.equal(await k(['GET', 'b']), null);
});

test('INCR/DECR/EXPIRE sayaç', async () => {
  let t = 0; const k = firestoreKomut(sahteDb(), () => t);
  assert.equal(await k(['INCR', 'n']), 1);
  await k(['EXPIRE', 'n', 5]);
  assert.equal(await k(['INCR', 'n']), 2);
  assert.equal(await k(['DECR', 'n']), 1);
  t += 6000; assert.equal(await k(['INCR', 'n']), 1); // süre dolunca sıfırdan
});

test('küme komutları', async () => {
  const k = firestoreKomut(sahteDb());
  await k(['SADD', 'uyarilar', 'id1']); await k(['SADD', 'uyarilar', 'id2']);
  assert.deepEqual((await k(['SMEMBERS', 'uyarilar'])).sort(), ['id1', 'id2']);
  await k(['SREM', 'uyarilar', 'id1']);
  assert.deepEqual(await k(['SMEMBERS', 'uyarilar']), ['id2']);
});
