self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Do not cache authenticated pages, private family data, or live readings.
self.addEventListener('push',event=>{let p={title:'Kidder’s Universal Day',body:'Check your return time.',url:'/universal'};try{p={...p,...event.data.json()};}catch{}event.waitUntil(self.registration.showNotification(p.title,{body:p.body,tag:p.tag||'kidder-return',icon:'/universal/icon-192.png',badge:'/universal/icon-192.png',data:{url:'/universal'}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const win=windows.find(w=>{const p=new URL(w.url).pathname;return p==='/universal'||p.startsWith('/universal/');});if(win){await win.focus();await win.navigate('/universal');}else await self.clients.openWindow('/universal');})());});
