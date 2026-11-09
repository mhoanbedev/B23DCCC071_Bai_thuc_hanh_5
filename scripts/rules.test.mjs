import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import {
  connectDatabaseEmulator,
  get,
  getDatabase,
  goOffline,
  increment,
  push,
  ref,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';

const PROJECT_ID = 'demo-chat-realtime';
const HOST = '127.0.0.1';
const DATABASE_URL = `http://${HOST}:9000?ns=${PROJECT_ID}-default-rtdb`;
const runId = Date.now().toString(36);

const clients = [];

async function createClient(label) {
  const app = initializeApp(
    { apiKey: 'demo-api-key', projectId: PROJECT_ID, databaseURL: `https://${PROJECT_ID}-default-rtdb.firebaseio.com` },
    `${label}-${runId}`,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${HOST}:9099`, { disableWarnings: true });
  const db = getDatabase(app);
  connectDatabaseEmulator(db, HOST, 9000);
  const email = `${label}.${runId}@test.dev`;
  const credential = await createUserWithEmailAndPassword(auth, email, 'secret123');
  const uid = credential.user.uid;
  const client = { app, db, uid, email, name: `User ${label.toUpperCase()}` };
  clients.push(client);
  return client;
}

function chatIdOf(a, b) {
  return [a, b].sort().join('_');
}

function buildSendUpdates(sender, receiverUid, text) {
  const chatId = chatIdOf(sender.uid, receiverUid);
  const messageId = push(ref(sender.db, `messages/${chatId}`)).key;
  const notificationId = push(ref(sender.db, `notifications/${receiverUid}`)).key;
  const ts = serverTimestamp();
  return {
    chatId,
    messageId,
    notificationId,
    updates: {
      [`messages/${chatId}/${messageId}`]: { senderId: sender.uid, type: 'text', text, createdAt: ts },
      [`userChats/${sender.uid}/${chatId}/chatId`]: chatId,
      [`userChats/${sender.uid}/${chatId}/peerId`]: receiverUid,
      [`userChats/${sender.uid}/${chatId}/lastMessage`]: text,
      [`userChats/${sender.uid}/${chatId}/lastType`]: 'text',
      [`userChats/${sender.uid}/${chatId}/lastSenderId`]: sender.uid,
      [`userChats/${sender.uid}/${chatId}/updatedAt`]: ts,
      [`userChats/${receiverUid}/${chatId}/chatId`]: chatId,
      [`userChats/${receiverUid}/${chatId}/peerId`]: sender.uid,
      [`userChats/${receiverUid}/${chatId}/lastMessage`]: text,
      [`userChats/${receiverUid}/${chatId}/lastType`]: 'text',
      [`userChats/${receiverUid}/${chatId}/lastSenderId`]: sender.uid,
      [`userChats/${receiverUid}/${chatId}/updatedAt`]: ts,
      [`userChats/${receiverUid}/${chatId}/unread`]: increment(1),
      [`notifications/${receiverUid}/${notificationId}`]: {
        type: 'message',
        messageType: 'text',
        fromId: sender.uid,
        chatId,
        preview: text,
        createdAt: ts,
        read: false,
      },
    },
  };
}

async function denied(promise) {
  await assert.rejects(promise, error => /permission[_ ]denied/i.test(String(error?.code ?? error?.message)));
}

describe('Realtime Database security rules', () => {
  let a;
  let b;
  let c;

  before(async () => {
    a = await createClient('alice');
    b = await createClient('bob');
    c = await createClient('carol');
    for (const client of [a, b, c]) {
      await set(ref(client.db, `users/${client.uid}`), {
        uid: client.uid,
        name: client.name,
        nameLower: client.name.toLowerCase(),
        email: client.email,
        createdAt: serverTimestamp(),
      });
    }
  });

  after(async () => {
    for (const client of clients) {
      goOffline(client.db);
      await deleteApp(client.app);
    }
  });

  test('signed-in users can read the user directory', async () => {
    const snapshot = await get(ref(a.db, 'users'));
    assert.ok(snapshot.child(b.uid).exists());
    assert.equal(snapshot.child(c.uid).child('name').val(), c.name);
  });

  test('users cannot edit other profiles or fake their email', async () => {
    await denied(set(ref(a.db, `users/${b.uid}/name`), 'Hacked'));
    await denied(
      set(ref(a.db, `users/${a.uid}`), {
        uid: a.uid,
        name: a.name,
        nameLower: a.name.toLowerCase(),
        email: 'other@test.dev',
        createdAt: Date.now(),
      }),
    );
  });

  test('presence can only be written by its owner', async () => {
    await set(ref(a.db, `status/${a.uid}`), { state: 'online', lastChanged: serverTimestamp() });
    await denied(set(ref(a.db, `status/${b.uid}`), { state: 'offline', lastChanged: serverTimestamp() }));
    await denied(set(ref(a.db, `status/${a.uid}`), { state: 'busy', lastChanged: serverTimestamp() }));
    const snapshot = await get(ref(c.db, `status/${a.uid}/state`));
    assert.equal(snapshot.val(), 'online');
  });

  test('sending a message updates both inboxes, unread counter and notification atomically', async () => {
    const first = buildSendUpdates(a, b.uid, 'Xin chào');
    await update(ref(a.db), first.updates);
    const second = buildSendUpdates(a, b.uid, 'Bạn khỏe không?');
    await update(ref(a.db), second.updates);

    const inbox = (await get(ref(b.db, `userChats/${b.uid}/${first.chatId}`))).val();
    assert.equal(inbox.unread, 2);
    assert.equal(inbox.peerId, a.uid);
    assert.equal(inbox.lastMessage, 'Bạn khỏe không?');

    const own = (await get(ref(a.db, `userChats/${a.uid}/${first.chatId}`))).val();
    assert.equal(own.unread, undefined);

    const messages = (await get(ref(b.db, `messages/${first.chatId}`))).val();
    assert.equal(Object.keys(messages).length, 2);

    const notification = (await get(ref(b.db, `notifications/${b.uid}/${second.notificationId}`))).val();
    assert.equal(notification.read, false);
    assert.equal(notification.fromId, a.uid);
  });

  test('outsiders cannot read or write a conversation', async () => {
    const chatId = chatIdOf(a.uid, b.uid);
    await denied(get(ref(c.db, `messages/${chatId}`)));
    await denied(
      set(ref(c.db, `messages/${chatId}/intruder`), { senderId: c.uid, type: 'text', text: 'hi', createdAt: Date.now() }),
    );
    await denied(get(ref(c.db, `userChats/${b.uid}`)));
    await denied(get(ref(a.db, `notifications/${b.uid}`)));
  });

  test('messages cannot be spoofed, emptied or edited', async () => {
    const chatId = chatIdOf(a.uid, b.uid);
    await denied(
      set(ref(b.db, `messages/${chatId}/spoof`), { senderId: a.uid, type: 'text', text: 'fake', createdAt: Date.now() }),
    );
    await denied(
      set(ref(b.db, `messages/${chatId}/empty`), { senderId: b.uid, type: 'text', text: '', createdAt: Date.now() }),
    );
    const existing = Object.keys((await get(ref(b.db, `messages/${chatId}`))).val())[0];
    await denied(set(ref(a.db, `messages/${chatId}/${existing}/text`), 'edited'));
  });

  test('location messages require valid coordinates', async () => {
    const chatId = chatIdOf(a.uid, b.uid);
    await set(ref(b.db, `messages/${chatId}/loc-ok-${runId}`), {
      senderId: b.uid,
      type: 'location',
      location: { latitude: 21.0285, longitude: 105.8542, accuracy: 12 },
      createdAt: serverTimestamp(),
    });
    await denied(
      set(ref(b.db, `messages/${chatId}/loc-bad-${runId}`), {
        senderId: b.uid,
        type: 'location',
        location: { latitude: 200, longitude: 105.8542 },
        createdAt: serverTimestamp(),
      }),
    );
  });

  test('receivers can only reset their own unread counter to zero', async () => {
    const chatId = chatIdOf(a.uid, b.uid);
    await denied(set(ref(b.db, `userChats/${b.uid}/${chatId}/unread`), 7));
    await set(ref(b.db, `userChats/${b.uid}/${chatId}/unread`), 0);
    const snapshot = await get(ref(b.db, `userChats/${b.uid}/${chatId}/unread`));
    assert.equal(snapshot.val(), 0);
  });

  test('only the owner can mark notifications as read', async () => {
    const sent = buildSendUpdates(c, a.uid, 'Chào Alice');
    await update(ref(c.db), sent.updates);
    await denied(set(ref(c.db, `notifications/${a.uid}/${sent.notificationId}/read`), true));
    await set(ref(a.db, `notifications/${a.uid}/${sent.notificationId}/read`), true);
    const snapshot = await get(ref(a.db, `notifications/${a.uid}/${sent.notificationId}/read`));
    assert.equal(snapshot.val(), true);
  });

  test('users cannot write into an unrelated pair inbox', async () => {
    const chatId = chatIdOf(a.uid, b.uid);
    await denied(set(ref(c.db, `userChats/${a.uid}/${chatId}/lastMessage`), 'spam'));
  });
});
