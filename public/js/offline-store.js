const ALX_OFFLINE_KEY = 'alx-offline-queue';

function readOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(ALX_OFFLINE_KEY) || '[]');
  } catch (error) {
    console.warn('Unable to read offline queue.', error);
    return [];
  }
}

function queueOfflineRequest(request) {
  const queue = readOfflineQueue();
  queue.push({ ...request, queuedAt: new Date().toISOString() });
  localStorage.setItem(ALX_OFFLINE_KEY, JSON.stringify(queue));
}

window.alxOfflineStore = { readOfflineQueue, queueOfflineRequest };
