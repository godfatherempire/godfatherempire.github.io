/* ========================================
   UECHT GROUP — Main JavaScript
   ======================================== */

// ── LANGUAGE SYSTEM ─────────────────────
const philosophyTexts = {
  ja: {
    quote: '宇宙の広大さ、人類の小ささ、生命の短さ。<br>有限の人生の中で、健康に幸福に喜びをもって歩み、<br>個人の価値と信仰の追求を実現しながら、<br>自らが世界と人類の歩みを変えていく過程を体験する。',
    mission: '人類の進化と発展の促進に尽力する'
  },
  cn: {
    quote: '宇宙之浩瀚，人類之渺小，生命之短暫。<br>在有限的人生中，健康幸福快樂地度過，<br>實現個人的價值和信仰的追求中，<br>體驗自我改變世界和人類進程的過程。',
    mission: '致力促进为人类进化发展'
  },
  en: {
    quote: 'The universe is vast, humanity is small, life is fleeting.<br>In this finite existence, may we live in health, happiness, and joy —<br>realizing our personal values and the pursuit of our beliefs,<br>experiencing the journey of transforming ourselves, the world, and the course of humanity.',
    mission: 'Dedicated to Advancing Human Evolution & Progress'
  }
};

function setLang(lang) {
  document.body.className = lang === 'ja' ? '' : 'lang-' + lang;
  document.documentElement.lang = lang === 'ja' ? 'ja' : lang === 'cn' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-' + lang + ']').forEach(function(el) {
    var val = el.getAttribute('data-' + lang);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = val;
    else if (el.tagName === 'OPTION') el.textContent = val;
    else el.innerHTML = val;
  });
  var map = { ja: 'jp', cn: 'cn', en: 'en' };
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === map[lang]);
  });
  var ta = document.querySelector('.form-textarea');
  if (ta) ta.placeholder = lang === 'ja' ? 'ご用件をご記入ください。' : lang === 'cn' ? '请填写您的需求。' : 'Please describe your inquiry.';
  var q = document.getElementById('philosophy-quote');
  var m = document.getElementById('philosophy-mission');
  var key = lang === 'ja' ? 'ja' : lang === 'en' ? 'en' : 'cn';
  if (q) { q.style.opacity='0'; setTimeout(function(){ q.innerHTML = philosophyTexts[key].quote; q.style.opacity='1'; }, 280); }
  if (m) { m.style.opacity='0'; setTimeout(function(){ m.innerHTML = philosophyTexts[key].mission; m.style.opacity='1'; }, 280); }
  localStorage.setItem('uecht_lang', lang);
}

// ── SCROLL HEADER ────────────────────────
window.addEventListener('scroll', function() {
  var h = document.getElementById('header');
  if (h) h.classList.toggle('scrolled', window.scrollY > 60);
});

// ── REVEAL ON SCROLL ─────────────────────
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e, i) {
    if (e.isIntersecting) setTimeout(function() { e.target.classList.add('visible'); }, i * 60);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(r) { obs.observe(r); });

// ── NEWS FILTER ──────────────────────────
document.querySelectorAll('.filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
  });
});

// ── SMOOTH SCROLL ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── FUND BAR ANIMATION ───────────────────
var barObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.fund-bar-fill').forEach(function(bar) {
        var w = bar.getAttribute('data-width');
        setTimeout(function() { bar.style.width = w + '%'; }, 200);
      });
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
var fundSection = document.querySelector('.fund-allocations');
if (fundSection) barObs.observe(fundSection);

// ── DONATE TABS ──────────────────────────
function switchDonateTab(id, btn) {
  document.querySelectorAll('.donate-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.donate-tab').forEach(function(b) { b.classList.remove('active'); });
  var panel = document.getElementById('donate-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

function selectAmount(btn) {
  var grid = btn.closest('.amount-grid');
  if (grid) grid.querySelectorAll('.amount-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
}

function selectPayMethod(btn) {
  var container = btn.closest('.payment-methods');
  if (container) container.querySelectorAll('.pay-method').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
}

function copyText(text, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  }
}

// ── CONTACT FORM SUBMIT ──────────────────
// Formspree を使用: https://formspree.io/f/YOUR_ID を取得後に差し替え
var CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/mnjgveao';

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = form.querySelector('.btn-submit');
    var origText = btn.textContent;
    var currentLang = localStorage.getItem('uecht_lang') || 'ja';
    var sendingText = currentLang === 'en' ? 'Sending...' : currentLang === 'cn' ? '发送中...' : '送信中...';
    btn.textContent = sendingText;
    btn.disabled = true;
    var formData = new FormData(form);
    fetch(CONTACT_FORM_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(res) {
      if (res.ok) {
        var lang2 = localStorage.getItem('uecht_lang') || 'ja';
        btn.textContent = lang2 === 'en' ? '✓ Sent!' : lang2 === 'cn' ? '✓ 已发送' : '✓ 送信しました';
        form.reset();
        setTimeout(function() { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else { throw new Error('server error'); }
    })
    .catch(function() {
      var lang3 = localStorage.getItem('uecht_lang') || 'ja';
      btn.textContent = lang3 === 'en' ? '✗ Error. Please try again.' : lang3 === 'cn' ? '✗ 错误，请重试' : '✗ エラー。再送してください';
      btn.disabled = false;
      setTimeout(function() { btn.textContent = origText; }, 3000);
    });
  });

  // Restore saved language
  var savedLang = localStorage.getItem('uecht_lang');
  if (savedLang && savedLang !== 'ja') setLang(savedLang);
});
