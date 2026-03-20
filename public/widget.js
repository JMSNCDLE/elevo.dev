;(function () {
  'use strict'

  // ── Config ────────────────────────────────────────────────────────────────
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()

  var WIDGET_ID = script.getAttribute('data-widget-id')
  var POSITION = script.getAttribute('data-position') || 'bottom-right'
  var PRIMARY_COLOR = script.getAttribute('data-color') || '#6366F1'
  var GREETING = script.getAttribute('data-greeting') || 'Hi! How can I help you today?'
  var BUSINESS_NAME = script.getAttribute('data-business') || 'Support'
  var API_BASE = script.src.replace('/widget.js', '')

  if (!WIDGET_ID) {
    console.warn('[ELEVO Widget] No data-widget-id found on script tag.')
    return
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  var css = [
    '#elevo-widget-bubble{position:fixed;' + (POSITION === 'bottom-left' ? 'left:20px' : 'right:20px') + ';bottom:20px;width:52px;height:52px;border-radius:50%;background:' + PRIMARY_COLOR + ';border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;z-index:99999;transition:transform 0.15s}',
    '#elevo-widget-bubble:hover{transform:scale(1.08)}',
    '#elevo-widget-bubble svg{width:24px;height:24px;fill:white}',
    '#elevo-widget-panel{position:fixed;' + (POSITION === 'bottom-left' ? 'left:20px' : 'right:20px') + ';bottom:84px;width:340px;height:480px;background:#ffffff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:99998;display:flex;flex-direction:column;overflow:hidden;transition:opacity 0.2s,transform 0.2s}',
    '#elevo-widget-panel.hidden{opacity:0;pointer-events:none;transform:translateY(12px)}',
    '#elevo-widget-header{background:' + PRIMARY_COLOR + ';padding:16px;color:#fff;display:flex;align-items:center;gap:10px}',
    '#elevo-widget-header .avatar{width:36px;height:36px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}',
    '#elevo-widget-header .info .name{font-weight:600;font-size:14px}',
    '#elevo-widget-header .info .status{font-size:11px;opacity:0.85}',
    '#elevo-widget-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f9fafb}',
    '.elevo-msg{max-width:82%;padding:10px 13px;border-radius:12px;font-size:13px;line-height:1.5;word-break:break-word}',
    '.elevo-msg.bot{align-self:flex-start;background:#ffffff;border:1px solid #e5e7eb;color:#111827;border-radius:4px 12px 12px 12px}',
    '.elevo-msg.user{align-self:flex-end;background:' + PRIMARY_COLOR + ';color:#ffffff;border-radius:12px 4px 12px 12px}',
    '.elevo-msg.typing{color:#9ca3af;font-style:italic}',
    '#elevo-widget-footer{padding:12px;border-top:1px solid #e5e7eb;display:flex;gap:8px;background:#fff}',
    '#elevo-widget-input{flex:1;border:1px solid #d1d5db;border-radius:8px;padding:9px 12px;font-size:13px;outline:none;font-family:inherit}',
    '#elevo-widget-input:focus{border-color:' + PRIMARY_COLOR + '}',
    '#elevo-widget-send{background:' + PRIMARY_COLOR + ';color:#fff;border:none;border-radius:8px;padding:9px 14px;cursor:pointer;font-size:13px;font-weight:600;transition:opacity 0.15s}',
    '#elevo-widget-send:hover{opacity:0.88}',
    '#elevo-widget-powered{text-align:center;padding:6px;font-size:10px;color:#9ca3af;border-top:1px solid #f3f4f6}',
    '#elevo-widget-powered a{color:#9ca3af;text-decoration:none}',
    '@media(max-width:400px){#elevo-widget-panel{width:calc(100vw - 32px);' + (POSITION === 'bottom-left' ? 'left:16px' : 'right:16px') + '}}',
  ].join('\n')

  var style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  // ── Panel HTML ────────────────────────────────────────────────────────────
  var panel = document.createElement('div')
  panel.id = 'elevo-widget-panel'
  panel.className = 'hidden'
  panel.innerHTML = [
    '<div id="elevo-widget-header">',
    '  <div class="avatar">' + BUSINESS_NAME.charAt(0).toUpperCase() + '</div>',
    '  <div class="info"><div class="name">' + BUSINESS_NAME + '</div><div class="status">Online — ask us anything</div></div>',
    '</div>',
    '<div id="elevo-widget-messages"></div>',
    '<div id="elevo-widget-footer">',
    '  <input id="elevo-widget-input" type="text" placeholder="Type a message..." />',
    '  <button id="elevo-widget-send">Send</button>',
    '</div>',
    '<div id="elevo-widget-powered">Powered by <a href="https://elevo.ai" target="_blank">ELEVO AI</a></div>',
  ].join('')

  // ── Bubble HTML ────────────────────────────────────────────────────────────
  var bubble = document.createElement('button')
  bubble.id = 'elevo-widget-bubble'
  bubble.setAttribute('aria-label', 'Open chat')
  bubble.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>'

  document.body.appendChild(panel)
  document.body.appendChild(bubble)

  // ── State ──────────────────────────────────────────────────────────────────
  var isOpen = false
  var messages = []
  var sessionId = null

  // ── Helpers ────────────────────────────────────────────────────────────────
  function addMessage(text, role) {
    var el = document.createElement('div')
    el.className = 'elevo-msg ' + role
    el.textContent = text
    var container = document.getElementById('elevo-widget-messages')
    container.appendChild(el)
    container.scrollTop = container.scrollHeight
    return el
  }

  function removeTyping() {
    var typing = document.querySelector('.elevo-msg.typing')
    if (typing) typing.remove()
  }

  function showTyping() {
    return addMessage('Typing…', 'bot typing')
  }

  // ── Init greeting ──────────────────────────────────────────────────────────
  function initChat() {
    if (messages.length === 0) {
      addMessage(GREETING, 'bot')
      messages.push({ role: 'assistant', content: GREETING })
    }
  }

  // ── Send message ───────────────────────────────────────────────────────────
  function sendMessage() {
    var input = document.getElementById('elevo-widget-input')
    var text = (input.value || '').trim()
    if (!text) return

    input.value = ''
    addMessage(text, 'user')
    messages.push({ role: 'user', content: text })

    var typingEl = showTyping()

    var payload = {
      widgetId: WIDGET_ID,
      message: text,
      sessionId: sessionId,
      history: messages.slice(-10),
    }

    fetch(API_BASE + '/api/widget/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json() })
      .then(function (data) {
        removeTyping()
        if (data.sessionId) sessionId = data.sessionId
        var reply = data.reply || 'Sorry, I had trouble with that. Please try again.'
        addMessage(reply, 'bot')
        messages.push({ role: 'assistant', content: reply })
      })
      .catch(function () {
        removeTyping()
        addMessage('Sorry, something went wrong. Please try again.', 'bot')
      })
  }

  // ── Toggle panel ────────────────────────────────────────────────────────────
  bubble.addEventListener('click', function () {
    isOpen = !isOpen
    if (isOpen) {
      panel.classList.remove('hidden')
      initChat()
      document.getElementById('elevo-widget-input').focus()
      bubble.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/></svg>'
    } else {
      panel.classList.add('hidden')
      bubble.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>'
    }
  })

  document.getElementById('elevo-widget-send').addEventListener('click', sendMessage)

  document.getElementById('elevo-widget-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })
})()
