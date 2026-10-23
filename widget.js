window.OWL_API = window.OWL_API || "https://459vn001-8000.inc1.devtunnels.ms";
/* Website assistant widget. Embed: <script src="https://YOUR-APP/widget.js" data-bot="SLUG" async></script> */
(function () {
  var script = document.currentScript || document.querySelector('script[data-bot]');
  if (!script) return;
  var slug = script.getAttribute('data-bot');
  // OWL_API is set when this file is served from the static site (owl.technokari.com) instead of the app itself.
  var api = script.getAttribute('data-api') || window.OWL_API || new URL(script.src).origin;
  var autoOpen = script.getAttribute('data-open') === 'true';
  var visitor;
  try {
    visitor = localStorage.getItem('lp_vid_' + slug);
    if (!visitor) { visitor = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('lp_vid_' + slug, visitor); }
  } catch (e) { visitor = Math.random().toString(36).slice(2); }

  // Dev Tunnels / ngrok show a browser warning page unless these headers are sent.
  var H = { 'X-Tunnel-Skip-AntiPhishing-Page': 'true', 'ngrok-skip-browser-warning': '1' };
  fetch(api + '/api/bot/' + encodeURIComponent(slug), { headers: H }).then(function (r) { return r.json(); }).then(function (cfg) {
    if (!cfg.live) return;
    build(cfg);
  }).catch(function () {});

  function el(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text) e.textContent = text; return e; }

  function build(cfg) {
    var c = cfg.color || '#2563eb';
    var root = el('div', 'position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;');
    var btn = el('button', 'width:60px;height:60px;border-radius:50%;border:none;background:' + c + ';color:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:26px;float:right;');
    btn.setAttribute('aria-label', 'Chat with ' + cfg.name);
    btn.innerHTML = '&#128172;';
    var panel = el('div', 'display:none;width:min(370px,calc(100vw - 40px));height:min(540px,calc(100vh - 110px));background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);overflow:hidden;flex-direction:column;margin-bottom:12px;');
    var head = el('div', 'background:' + c + ';color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;');
    var title = el('div', 'font-weight:600;font-size:15px;', cfg.name);
    var sub = el('div', 'font-size:12px;opacity:.85;', 'Typically replies instantly');
    var tWrap = el('div'); tWrap.appendChild(title); tWrap.appendChild(sub);
    var close = el('button', 'background:none;border:none;color:#fff;font-size:22px;cursor:pointer;', '\u00d7');
    head.appendChild(tWrap); head.appendChild(close);
    var log = el('div', 'flex:1;overflow-y:auto;padding:14px;background:#f7f8fa;');
    var form = el('form', 'display:flex;border-top:1px solid #e5e7eb;background:#fff;');
    var input = el('input', 'flex:1;border:none;padding:14px;font-size:14px;outline:none;color:#111;background:#fff;');
    input.placeholder = 'Type your message\u2026';
    var send = el('button', 'border:none;background:none;color:' + c + ';font-weight:600;padding:0 16px;cursor:pointer;font-size:14px;', 'Send');
    form.appendChild(input); form.appendChild(send);
    var foot = el('div', 'text-align:center;font-size:10px;color:#9ca3af;padding:4px;background:#fff;', 'AI assistant \u00b7 may make mistakes');
    panel.appendChild(head); panel.appendChild(log); panel.appendChild(form); panel.appendChild(foot);
    root.appendChild(panel); root.appendChild(btn);
    document.body.appendChild(root);

    function bubble(text, mine) {
      var b = el('div', 'max-width:82%;padding:10px 13px;border-radius:14px;margin:6px 0;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;' +
        (mine ? 'margin-left:auto;background:' + c + ';color:#fff;border-bottom-right-radius:4px;' : 'background:#fff;color:#111;border:1px solid #e5e7eb;border-bottom-left-radius:4px;'), text);
      log.appendChild(b); log.scrollTop = log.scrollHeight; return b;
    }
    var greeted = false;
    function open() { panel.style.display = 'flex'; btn.innerHTML = '&#8964;'; if (!greeted) { bubble(cfg.greeting || 'Hi! How can I help?'); greeted = true; } input.focus(); }
    function hide() { panel.style.display = 'none'; btn.innerHTML = '&#128172;'; }
    btn.onclick = function () { panel.style.display === 'flex' ? hide() : open(); };
    close.onclick = hide;
    form.onsubmit = function (e) {
      e.preventDefault();
      var text = input.value.trim(); if (!text) return;
      input.value = ''; bubble(text, true);
      var typing = bubble('\u2026');
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 60000);
      fetch(api + '/api/chat', { method: 'POST', signal: ctrl ? ctrl.signal : undefined, headers: Object.assign({ 'Content-Type': 'application/json' }, H),
        body: JSON.stringify({ slug: slug, visitor_id: visitor, message: text }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { clearTimeout(timer); typing.textContent = d.reply || 'Sorry, something went wrong.'; log.scrollTop = log.scrollHeight; })
        .catch(function () { clearTimeout(timer); typing.textContent = 'Sorry, that took too long. Please try again, or leave your email or phone and the team will reply.'; });
    };
    window.OwlFrontDeskWidget = { open: open, close: hide, input: input, form: form };
    if (autoOpen) setTimeout(open, 600);
  }
})();
