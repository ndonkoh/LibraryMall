(function () {
  var KEY = 'librarymall_notifications';

  function defaultList() {
    return [
      {
        id: 'n1',
        title: 'Order confirmed',
        body: 'Your order #1042 was placed successfully. Browse Discover for more titles.',
        read: false,
        time: new Date(Date.now() - 3600000 * 5).toISOString(),
        type: 'order',
        href: 'discover.html'
      },
      {
        id: 'n2',
        title: 'Borrow due soon',
        body: 'Return date for your borrowed book is in 3 days. See Bookmarks for details.',
        read: false,
        time: new Date(Date.now() - 3600000 * 28).toISOString(),
        type: 'borrow',
        href: 'bookmark.html'
      },
      {
        id: 'n3',
        title: 'Welcome to LibraryMall',
        body: 'Thanks for joining. Use Discover to find books and save them to Bookmarks.',
        read: true,
        time: new Date(Date.now() - 86400000 * 4).toISOString(),
        type: 'system',
        href: 'homepage.html'
      }
    ];
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : null;
    } catch (e) {
      return null;
    }
  }

  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function seedIfEmpty() {
    try {
      if (localStorage.getItem(KEY) === null) save(defaultList());
    } catch (e) {}
  }

  function unreadCount() {
    var list = load() || [];
    return list.filter(function (x) {
      return !x.read;
    }).length;
  }

  function syncNotificationBadge() {
    var n = unreadCount();
    document.querySelectorAll('.notif-dot').forEach(function (dot) {
      dot.style.display = n > 0 ? '' : 'none';
    });
  }

  function formatTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function typeIcon(type) {
    if (type === 'order') return '📦';
    if (type === 'borrow') return '📚';
    return '✉️';
  }

  var backdrop;
  var panel;
  var lastTriggerBtn;

  function ensureDom() {
    if (document.getElementById('notifPanel')) return;
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="notifBackdrop" class="notif-backdrop" aria-hidden="true"></div>' +
        '<div id="notifPanel" class="notif-panel" role="dialog" aria-modal="true" aria-labelledby="notifPanelTitle" aria-hidden="true">' +
        '<div class="notif-panel-header">' +
        '<div class="notif-panel-heading">' +
        '<div id="notifPanelTitle" class="notif-panel-title">Notifications</div>' +
        '<div class="notif-panel-sub" id="notifUnreadLabel"></div>' +
        '</div>' +
        '<button type="button" class="notif-panel-close" id="notifPanelClose" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="notif-panel-actions">' +
        '<button type="button" class="notif-btn-sm" id="notifMarkAll">Mark all read</button>' +
        '<button type="button" class="notif-btn-sm notif-btn-sm--danger" id="notifClearAll">Clear all</button>' +
        '</div>' +
        '<div class="notif-panel-scroll">' +
        '<div id="notifList" class="notif-panel-list"></div>' +
        '<div id="notifEmpty" class="notif-panel-empty">No notifications yet.</div>' +
        '</div>' +
        '</div>'
    );
    backdrop = document.getElementById('notifBackdrop');
    panel = document.getElementById('notifPanel');

    backdrop.addEventListener('click', closePanel);
    document.getElementById('notifPanelClose').addEventListener('click', closePanel);
    document.getElementById('notifMarkAll').addEventListener('click', function (e) {
      e.stopPropagation();
      markAllRead();
    });
    document.getElementById('notifClearAll').addEventListener('click', function (e) {
      e.stopPropagation();
      clearAll();
    });
    panel.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    var listEl = document.getElementById('notifList');
    listEl.addEventListener('click', function (e) {
      var dismissBtn = e.target.closest('.nt-dismiss');
      if (dismissBtn) {
        e.preventDefault();
        e.stopPropagation();
        dismiss(dismissBtn.getAttribute('data-dismiss'));
        return;
      }
      var item = e.target.closest('.nt-item');
      if (!item) return;
      var id = item.getAttribute('data-id');
      var list = load() || [];
      var row = list.find(function (x) {
        return x.id === id;
      });
      if (!row) return;
      if (!row.read) {
        row.read = true;
        save(list);
        syncNotificationBadge();
        renderList();
      }
      if (row.href) {
        closePanel();
        window.location.href = row.href;
      }
    });

    listEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest('.nt-item');
      if (!item) return;
      e.preventDefault();
      item.click();
    });
  }

  function renderList() {
    ensureDom();
    var container = document.getElementById('notifList');
    var emptyEl = document.getElementById('notifEmpty');
    if (!container) return;

    var list = load() || [];
    list.sort(function (a, b) {
      return new Date(b.time) - new Date(a.time);
    });

    var unread = list.filter(function (x) {
      return !x.read;
    }).length;
    var label = document.getElementById('notifUnreadLabel');
    if (label) {
      if (list.length === 0) {
        label.textContent = '';
      } else {
        label.textContent = unread === 0 ? 'All caught up' : unread + ' unread';
      }
    }

    if (list.length === 0) {
      container.innerHTML = '';
      emptyEl.classList.add('visible');
      return;
    }

    emptyEl.classList.remove('visible');
    var esc = function (s) {
      return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
    };

    container.innerHTML = list
      .map(function (item) {
        var readClass = item.read ? 'nt-item nt-item--read' : 'nt-item';
        return (
          '<article class="' +
          readClass +
          '" data-id="' +
          esc(item.id) +
          '" tabindex="0" role="button">' +
          '<div class="nt-icon" aria-hidden="true">' +
          typeIcon(item.type) +
          '</div>' +
          '<div class="nt-body">' +
          '<div class="nt-title">' +
          esc(item.title) +
          '</div>' +
          '<div class="nt-msg">' +
          esc(item.body) +
          '</div>' +
          '<div class="nt-meta">' +
          formatTime(item.time) +
          (item.href ? ' · <span class="nt-link-hint">Open</span>' : '') +
          '</div>' +
          '</div>' +
          '<button type="button" class="nt-dismiss" data-dismiss="' +
          esc(item.id) +
          '" aria-label="Dismiss">&times;</button>' +
          '</article>'
        );
      })
      .join('');
  }

  function dismiss(id) {
    var list = (load() || []).filter(function (x) {
      return x.id !== id;
    });
    save(list);
    syncNotificationBadge();
    renderList();
  }

  function markAllRead() {
    var list = load() || [];
    list.forEach(function (x) {
      x.read = true;
    });
    save(list);
    syncNotificationBadge();
    renderList();
    if (typeof showToast === 'function') showToast('All marked as read', 'success');
  }

  function clearAll() {
    if (!confirm('Remove all notifications?')) return;
    save([]);
    syncNotificationBadge();
    renderList();
    if (typeof showToast === 'function') showToast('Notifications cleared', 'success');
  }

  function positionPanel(triggerBtn) {
    if (!panel || !triggerBtn) return;
    var rect = triggerBtn.getBoundingClientRect();
    var margin = 12;
    var panelW = Math.min(380, window.innerWidth - margin * 2);
    panel.style.width = panelW + 'px';
    var right = window.innerWidth - rect.right;
    if (right < margin) right = margin;
    panel.style.top = rect.bottom + 8 + 'px';
    panel.style.right = right + 'px';
    panel.style.left = 'auto';
    var scrollEl = panel.querySelector('.notif-panel-scroll');
    if (scrollEl) {
      if (rect.bottom + 380 > window.innerHeight) {
        var maxH = Math.max(160, window.innerHeight - rect.bottom - margin - 100);
        scrollEl.style.maxHeight = maxH + 'px';
      } else {
        scrollEl.style.maxHeight = '';
      }
    }
  }

  function openPanel(triggerBtn) {
    ensureDom();
    lastTriggerBtn = triggerBtn;
    renderList();
    backdrop.classList.add('notif-open');
    panel.classList.add('notif-open');
    backdrop.setAttribute('aria-hidden', 'false');
    panel.setAttribute('aria-hidden', 'false');
    document.querySelectorAll('.notif-btn').forEach(function (b) {
      b.setAttribute('aria-expanded', 'true');
    });
    positionPanel(triggerBtn);
  }

  function closePanel() {
    if (!backdrop || !panel) return;
    backdrop.classList.remove('notif-open');
    panel.classList.remove('notif-open');
    backdrop.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.notif-btn').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function isOpen() {
    return panel && panel.classList.contains('notif-open');
  }

  function togglePanel(e) {
    var btn = e.currentTarget;
    if (isOpen()) {
      closePanel();
    } else {
      openPanel(btn);
    }
  }

  function init() {
    seedIfEmpty();
    syncNotificationBadge();
    ensureDom();

    document.querySelectorAll('.notif-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        togglePanel(e);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        closePanel();
      }
    });

    window.addEventListener('resize', function () {
      if (isOpen() && lastTriggerBtn) positionPanel(lastTriggerBtn);
    });

    window.addEventListener('storage', function (ev) {
      if (ev.key === KEY) {
        syncNotificationBadge();
        if (isOpen()) renderList();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
