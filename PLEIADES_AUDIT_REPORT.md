# Pleiades OS Comprehensive Audit Report
**Date:** February 20, 2026  
**Site:** https://pleiades2.vercel.app/  
**Version:** 1.0 (1441 lines, ~98KB)

---

## Executive Summary

### ✅ What Works Perfectly
| Feature | Status | Notes |
|---------|--------|-------|
| **Visual Design** | ⭐⭐⭐⭐⭐ | Starfield animation, glassmorphism, cohesive dark theme |
| **Tab Navigation** | ⭐⭐⭐⭐⭐ | All 9 tabs render correctly, smooth transitions |
| **localStorage System** | ⭐⭐⭐⭐⭐ | Clean abstraction, error handling, prefixed keys |
| **XSS Protection** | ⭐⭐⭐⭐⭐ | Universal `esc()` function used throughout |
| **PWA Foundation** | ⭐⭐⭐⭐ | Meta tags present, responsive design |
| **Kanban Drag-Drop** | ⭐⭐⭐⭐⭐ | Full implementation with visual feedback |
| **Search** | ⭐⭐⭐⭐ | Cross-tab search with keyboard shortcuts |
| **Modal System** | ⭐⭐⭐⭐⭐ | Unified modal, slide panel, toast systems |
| **Mobile Responsive** | ⭐⭐⭐⭐ | Touch-friendly, safe areas, responsive grids |

### ⚠️ Issues Found
| Severity | Count | Categories |
|----------|-------|------------|
| **Critical** | 1 | Hardcoded localhost endpoint |
| **High** | 2 | Mixed content risk, incomplete Brain tab |
| **Medium** | 3 | Data accuracy, accessibility, PWA incomplete |
| **Low** | 4 | UX improvements, code optimization |

---

## Critical Issues (Fix Immediately)

### 🔴 C1: Hardcoded Localhost Endpoint (Line 1426)
```javascript
fetch('http://localhost:8899/mc/status')
```
**Risk:** Will fail in production, exposes development endpoint  
**Fix:** Remove or make configurable:
```javascript
const serverUrl = S.get('server_url', '');
if (serverUrl) {
  fetch(serverUrl + '/mc/status')...
}
```

---

## High Severity Issues

### 🟠 H1: Brain Tab - Incomplete Implementation
**Problem:** The Brain tab has UI but incomplete API integration:
```javascript
function sendBrainCmd() {
  // Only logs to UI, doesn't actually send to agent
  chat.innerHTML+=`<div class="brain-chat-message agent">📡 Sending to agent...</div>`;
  // Missing: Actual API call to OpenClaw
}
```

**Impact:** Users think commands are sent but they aren't  
**Fix:** Complete the fetch implementation:
```javascript
async function sendBrainCmd() {
  const msg = input?.value.trim();
  if (!msg) return;
  
  chat.innerHTML += `<div class="brain-chat-message user">${esc(msg)}</div>`;
  
  if (!brainConnected) {
    chat.innerHTML += `<div class="brain-chat-message agent">⚠️ Not connected</div>`;
    return;
  }
  
  const url = S.get('brain_url', '');
  const key = S.get('brain_key', '');
  
  try {
    const response = await fetch(url + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [{role: 'user', content: msg}],
        stream: true
      })
    });
    
    // Handle streaming response
    const reader = response.body.getReader();
    // ... stream handling code
    
  } catch (e) {
    chat.innerHTML += `<div class="brain-chat-message agent">❌ Error: ${esc(e.message)}</div>`;
  }
}
```

### 🟠 H2: Mixed Content Warning (HTTPS → HTTP)
**Problem:** Vercel serves HTTPS but brain connection may use HTTP  
**Impact:** Browser blocks requests, shows security warnings  
**Fix Options:**
1. **Cloudflare Tunnel** (recommended) - Free HTTPS URL
2. **Vercel Edge Proxy** - Route through serverless function
3. **Buy domain + SSL** - Most permanent solution

---

## Medium Severity Issues

### 🟡 M1: LLM Pricing Data Inaccurate
**Current Data (Line 1152-1161):**
```javascript
{id:'kimi-k2.5', inCost:1.5, outCost:6},  // Check current
{id:'gemini-2.5-flash', inCost:0.35, outCost:1.05},  // May be outdated
{id:'claude-sonnet-4.6', inCost:3, outCost:15, cap:20}
```

**Issues:**
- Claude Sonnet 4.6 pricing may not be accurate
- Missing newer models (Gemini 2.5 Pro, etc.)
- No API to fetch live pricing

**Fix:** Add pricing verification or live fetch:
```javascript
// Add to renderLLMTab
async function fetchLivePricing() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    // Update pricing from API
  } catch(e) {
    // Fall back to cached pricing
  }
}
```

### 🟡 M2: Missing Models
The LLM tracker shows 5 models but your config has 7:
- Missing: `step-3.5-flash`, `minimax-m2.5`

**Fix:** Add to LLM_MODELS array:
```javascript
{id:'step-3.5-flash', name:'Step 3.5 Flash', provider:'Step', ctx:32000, inCost:0.5, outCost:2, status:'online'},
{id:'minimax-m2.5', name:'MiniMax M2.5', provider:'MiniMax', ctx:8000, inCost:0.3, outCost:1.2, status:'online'}
```

### 🟡 M3: Accessibility Issues
**Problems:**
- No `aria-label` on interactive elements
- Color contrast on `.text-muted` (50% white) may fail WCAG
- No keyboard navigation for drag-drop
- Missing `alt` text on icons

**Fix Priority:** Medium (legal compliance in Canada)

---

## Low Severity Issues

### 🟢 L1: PWA Incomplete
**Missing:**
- `manifest.json` file
- Service worker for offline functionality
- Icon set (apple-touch-icon is data URI)

**Fix:** Add `manifest.json`:
```json
{
  "name": "Pleiades OS",
  "short_name": "Pleiades",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#050508",
  "theme_color": "#8b5cf6",
  "icons": [...]
}
```

### 🟢 L2: Search Limited
**Current:** Only searches local data  
**Could add:** Full-text search across notes, tasks, intel

### 🟢 L3: No Data Export/Backup
**Risk:** LocalStorage can be cleared accidentally  
**Fix:** Add export/import JSON functionality

### 🟢 L4: Console Noise
`el._clockCleanup` pattern may cause memory leaks if not handled properly

---

## Security Analysis

### ✅ Strengths
1. **XSS Protection:** Universal `esc()` function prevents injection
2. **localStorage:** Clean abstraction with try/catch
3. **No eval() or Function() usage**
4. **CSP-friendly structure**

### ⚠️ Concerns
1. **API Key Storage:** Brain API key stored in localStorage (unencrypted)
   - Mitigation: Acceptable for client-side only, but warn users
2. **innerHTML usage:** Multiple `innerHTML` assignments (line 441, 570, 609, etc.)
   - Mitigation: All use `esc()` for user content, safe but could use `textContent`
3. **No CSRF protection:** Not applicable for client-only app

### 🛡️ Recommendations
```javascript
// Consider encrypting sensitive keys
const encrypt = (text, passphrase) => { /* simple XOR or Web Crypto */ };
const decrypt = (encrypted, passphrase) => { /* reverse */ };

// Store encrypted
S.set('brain_key_encrypted', encrypt(apiKey, userPassphrase));
```

---

## Code Quality Assessment

### ✅ Strengths
- Clean separation of concerns (render functions per tab)
- Consistent naming conventions
- Good use of modern JS (const, arrow functions, template literals)
- Error handling on localStorage
- Mobile-first responsive design

### 🔧 Improvements
1. **Code size:** 1441 lines in one file - consider splitting
2. **No JSDoc comments** - makes maintenance harder
3. **Magic numbers:** Hardcoded values (50, 20, 8, etc.)
4. **No unit tests**

---

## Performance Analysis

### ✅ Strengths
- Single file = fewer HTTP requests
- CSS-in-HTML = no render-blocking CSS files
- Efficient localStorage usage
- Minimal external dependencies (just Google Fonts)

### ⚠️ Concerns
1. **Large HTML file:** 98KB may be slow on 3G
2. **No lazy loading:** All tabs render at once
3. **Google Fonts:** External dependency (privacy, speed)

### 📊 Metrics (Estimated)
- **First Contentful Paint:** ~1.5s (good)
- **Time to Interactive:** ~2.5s (acceptable)
- **Lighthouse Score:** ~85/100 (estimated)

---

## Mobile/Responsive Testing

### ✅ Works Well
- Responsive grids (`repeat(auto-fit, minmax(220px, 1fr))`)
- Touch-friendly buttons (min 44px)
- Safe area insets for notches
- Mobile-optimized font sizes

### ⚠️ Issues
1. **Header overflow:** Too many tabs causes horizontal scroll
2. **Brain tab:** Grid may be cramped on small screens
3. **Kanban:** Drag-drop may not work on touch devices

---

## Feature Recommendations

### High Priority
1. **Complete Brain Tab API integration**
2. **Notion Sync** (as discussed)
3. **Data export/backup**
4. **Live LLM pricing fetch**

### Medium Priority
1. **Keyboard shortcuts** (⌘K search, ⌘N new task, etc.)
2. **Dark/light mode toggle**
3. **Undo/redo functionality**
4. **Recurring tasks/meetings**
5. **Email reminders** for rituals

### Low Priority
1. **Voice input** for field notes
2. **AI suggestions** for task prioritization
3. **Integration with Google Calendar**
4. **Desktop app** (via Tauri or Electron)
5. **Collaboration features** (share with Tia, etc.)

---

## Data Accuracy Verification

### LLM Models Configured (5 shown, 7 expected)

| Model | Listed Price | Verify At | Accuracy |
|-------|--------------|-----------|----------|
| Kimi K2.5 | $1.50/$6.00 | platform.moonshot.cn | ⚠️ CHECK |
| Gemini 2.5 Flash | $0.35/$1.05 | ai.google.dev/pricing | ⚠️ CHECK |
| Gemini 3 Flash | $0.15/$0.60 | ai.google.dev/pricing | ✅ Likely correct |
| Trinity Large | $2.00/$8.00 | openrouter.ai/models | ⚠️ CHECK |
| Claude Sonnet 4.6 | $3.00/$15.00 | anthropic.com/pricing | ⚠️ CHECK |
| **Step 3.5 Flash** | **Missing** | stepfun.com | ❌ NOT LISTED |
| **MiniMax M2.5** | **Missing** | minimax.chat | ❌ NOT LISTED |

**Action:** Verify pricing at sources, add missing models

---

## Final Verdict

| Category | Score | Grade |
|----------|-------|-------|
| **Functionality** | 7/10 | B |
| **Security** | 8/10 | B+ |
| **Design** | 9/10 | A |
| **Code Quality** | 7/10 | B |
| **Performance** | 7/10 | B |
| **Accessibility** | 5/10 | C |
| **Mobile** | 8/10 | B+ |
| **Overall** | **7.3/10** | **B** |

### Summary
Pleiades OS is a **well-designed, functional personal dashboard** with strong visual appeal and good security practices. The main issues are:
1. **Incomplete Brain tab** (API integration missing)
2. **Data accuracy** (LLM pricing needs verification)
3. **Hardcoded endpoints** need cleanup

With fixes for the critical/high issues, this becomes an **A-grade production application**.

---

## Action Items Checklist

- [ ] Fix hardcoded localhost endpoint (C1)
- [ ] Complete Brain tab API integration (H1)
- [ ] Set up HTTPS for OpenClaw connection (H2)
- [ ] Verify and update LLM pricing (M1)
- [ ] Add missing Step and MiniMax models (M2)
- [ ] Add ARIA labels for accessibility (M3)
- [ ] Create manifest.json for PWA (L1)
- [ ] Add data export functionality (L3)
- [ ] Implement Notion sync (feature request)

**Estimated fix time:** 4-6 hours
