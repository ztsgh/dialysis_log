/**
 * 肾友日记 - Service Worker
 * 支持离线缓存和后台同步
 */

const CACHE_NAME = 'dialysis-diary-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './icons/icon.svg'
];

// 安装事件 - 缓存核心资源
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] 缓存核心资源');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] 安装完成');
                return self.skipWaiting();
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] 激活中...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] 激活完成');
            return self.clients.claim();
        })
    );
    
    // 通知所有客户端有新版本可用
    event.waitUntil(
        self.clients.claim().then(() => {
            return self.clients.matchAll();
        }).then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_UPDATED'
                });
            });
        })
    );
});

// 请求拦截 - 缓存优先策略
self.addEventListener('fetch', (event) => {
    // 只缓存GET请求
    if (event.request.method !== 'GET') {
        return;
    }

    // 跳过 chrome-extension 等特殊scheme
    if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // 如果有缓存，返回缓存
                if (cachedResponse) {
                    // 同时在后台更新缓存
                    fetchAndCache(event.request);
                    return cachedResponse;
                }

                // 没有缓存，从网络获取
                return fetchAndCache(event.request);
            })
            .catch(() => {
                // 网络失败且没有缓存，返回离线页面
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});

// 从网络获取并缓存
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200) {
                return response;
            }

            // 跳过 chrome-extension 等特殊scheme
            if (request.url.startsWith('chrome-extension://')) {
                return response;
            }

            // 克隆响应（因为响应是流，只能使用一次）
            const responseToCache = response.clone();

            // 缓存响应
            caches.open(CACHE_NAME)
                .then((cache) => {
                    cache.put(request, responseToCache);
                });

            return response;
        });
}

// 后台同步（用于离线数据同步）
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] 后台同步事件:', event.tag);
    
    if (event.tag === 'sync-records') {
        event.waitUntil(syncRecords());
    }
});

// 同步记录（扩展点：可对接后端API）
async function syncRecords() {
    try {
        console.log('[ServiceWorker] 开始同步记录...');
        
        // 获取所有客户端
        const allClients = await clients.matchAll({ includeUncontrolled: true });
        
        // 通知客户端同步完成
        allClients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                timestamp: Date.now()
            });
        });
        
        console.log('[ServiceWorker] 同步完成');
    } catch (error) {
        console.error('[ServiceWorker] 同步失败:', error);
        throw error; // 抛出错误以触发重试
    }
}

// 消息处理（用于与主线程通信）
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] 收到消息:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CHECK_ONLINE') {
        // 回复在线状态
        event.ports[0].postMessage({
            online: navigator.onLine
        });
    }
});

// 推送通知
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '您有一条新消息',
        icon: './icons/icon.svg',
        badge: './icons/icon.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'open', title: '打开' },
            { action: 'close', title: '关闭' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('肾友日记', options)
    );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});