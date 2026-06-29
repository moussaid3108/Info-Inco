import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

export default function NotificationBell() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle');

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'denied') setStatus('denied');
    else if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setStatus('subscribed');
        })
      );
    }
  }, []);

  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus('denied'); return; }

      const { publicKey } = await fetch('/api/vapid-key').then(r => r.json());
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      setStatus('subscribed');
    } catch {
      setStatus('denied');
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('idle');
    } catch {}
  };

  if (status === 'unsupported') return null;

  return (
    <button
      onClick={status === 'subscribed' ? unsubscribe : subscribe}
      title={status === 'subscribed' ? 'Désactiver les alertes' : 'Activer les alertes prioritaires'}
      className={`p-2 rounded-lg transition-colors ${
        status === 'subscribed'
          ? 'text-red-600 bg-red-50 hover:bg-red-100'
          : status === 'denied'
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
      disabled={status === 'denied'}
    >
      {status === 'subscribed'
        ? <Bell size={18} className="fill-red-600" />
        : <BellOff size={18} />
      }
    </button>
  );
}
