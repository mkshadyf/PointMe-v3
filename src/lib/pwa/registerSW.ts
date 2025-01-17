export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              showUpdatePrompt();
            }
          });
        }
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}

function showUpdatePrompt() {
  // Show update prompt to user
  const updatePrompt = document.createElement('div');
  updatePrompt.className = 'update-prompt';
  updatePrompt.innerHTML = `
    <div class="update-prompt-content">
      <p>A new version is available!</p>
      <button onclick="window.location.reload()">Update Now</button>
    </div>
  `;
  document.body.appendChild(updatePrompt);
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push notifications
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
}

async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY!),
    });

    // Send subscription to backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Handle offline/online status
export function setupNetworkStatusHandlers() {
  window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    // Sync any pending operations
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-ignore
      registration.sync.register('syncData');
    });
  });

  window.addEventListener('offline', () => {
    document.body.classList.add('offline');
  });
}
