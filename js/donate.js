/* ========================================
   UECHT GROUP — Donation & Payment JS
   ========================================
   
   支払いゲートウェイ統合ガイド:
   
   【Stripe (クレジットカード・定期)】
   1. https://stripe.com でアカウント作成
   2. publishable key を STRIPE_KEY に設定
   3. バックエンド /api/donate/stripe エンドポイントを実装
      → stripe.paymentIntents.create() でPaymentIntent作成
      → クライアントにclient_secretを返す
   
   【PayPal】
   1. https://developer.paypal.com でアプリ作成
   2. client-id を PAYPAL_CLIENT_ID に設定
   3. PayPal JS SDK スクリプトをHTMLに追加:
      <script src="https://www.paypal.com/sdk/js?client-id=YOUR_ID&currency=JPY"></script>
   
   【支付宝 / WeChat Pay】
   1. 国際決済は Stripe の場合 stripe.com/payments/alipay で対応可
   2. または Adyen / Checkout.com などのマルチゲートウェイを利用
   
   ======================================== */

// ── 設定 (本番前に必ず変更) ─────────────
var STRIPE_KEY = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'; // Stripe publishable key
var PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID';
var DONATE_API_BASE = '/api/donate'; // バックエンドAPIのベースURL

// ── 現在選択されている金額・方法 ─────────
var selectedAmount = 5000;
var selectedCurrency = 'JPY';
var selectedMethod = 'bank'; // bank | stripe | paypal | alipay | wechat

// ── 金額選択 ─────────────────────────────
function selectAmount(btn) {
  var grid = btn.closest('.amount-grid');
  if (grid) grid.querySelectorAll('.amount-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  selectedAmount = parseInt(btn.getAttribute('data-amount') || btn.textContent.replace(/[^\d]/g, ''));
  updateDonateButton();
}

function updateDonateButton() {
  var btn = document.getElementById('donate-submit-btn');
  if (!btn) return;
  var fmt = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });
  btn.textContent = fmt.format(selectedAmount) + ' を寄付する →';
}

// ── 支払い方法選択 ────────────────────────
function selectPayMethod(btn) {
  var container = btn.closest('.payment-methods');
  if (container) container.querySelectorAll('.pay-method').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  selectedMethod = btn.getAttribute('data-method') || 'bank';
  showPayMethodDetail(selectedMethod);
}

function showPayMethodDetail(method) {
  document.querySelectorAll('.pay-detail').forEach(function(d) { d.style.display = 'none'; });
  var detail = document.getElementById('pay-detail-' + method);
  if (detail) detail.style.display = 'block';
}

// ── 寄付送信メイン ────────────────────────
function submitDonation() {
  var btn = document.getElementById('donate-submit-btn');
  if (!btn) return;

  // 入力バリデーション
  var email = document.getElementById('donor-email');
  var name = document.getElementById('donor-name');
  if (email && !email.value.includes('@')) {
    alert('有効なメールアドレスを入力してください。');
    return;
  }

  switch (selectedMethod) {
    case 'stripe':  processStripe(btn); break;
    case 'paypal':  processPayPal(btn); break;
    case 'alipay':  processAlipay(btn); break;
    case 'wechat':  processWechat(btn); break;
    default:        processBankTransfer(btn); break;
  }
}

// ── 銀行振込 ─────────────────────────────
function processBankTransfer(btn) {
  var origText = btn.textContent;
  btn.textContent = '処理中...'; btn.disabled = true;

  // バックエンドに寄付記録を送信
  fetch(DONATE_API_BASE + '/bank', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: selectedAmount,
      currency: selectedCurrency,
      name: document.getElementById('donor-name') ? document.getElementById('donor-name').value : '',
      email: document.getElementById('donor-email') ? document.getElementById('donor-email').value : '',
      type: 'one-time'
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    showDonationSuccess('bank', data);
  })
  .catch(function() {
    // フォールバック: バックエンド未実装の場合は口座情報を表示
    showBankInfo();
    btn.textContent = origText; btn.disabled = false;
  });
}

function showBankInfo() {
  var info = document.getElementById('bank-info-display');
  if (info) {
    info.style.display = 'block';
    info.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Stripe 決済 ───────────────────────────
function processStripe(btn) {
  // Stripe.js がロードされているか確認
  if (typeof Stripe === 'undefined') {
    alert('Stripe SDKが読み込まれていません。\n管理者にお問い合わせください。');
    return;
  }
  var stripe = Stripe(STRIPE_KEY);
  var origText = btn.textContent;
  btn.textContent = '接続中...'; btn.disabled = true;

  fetch(DONATE_API_BASE + '/stripe/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: selectedAmount,
      currency: 'jpy',
      email: document.getElementById('donor-email') ? document.getElementById('donor-email').value : ''
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    return stripe.confirmCardPayment(data.client_secret, {
      payment_method: { card: stripeCardElement } // カード要素は別途Stripe Elementsで実装
    });
  })
  .then(function(result) {
    if (result.error) {
      alert('決済エラー: ' + result.error.message);
      btn.textContent = origText; btn.disabled = false;
    } else {
      showDonationSuccess('stripe', result.paymentIntent);
    }
  })
  .catch(function(err) {
    console.error('Stripe error:', err);
    btn.textContent = origText; btn.disabled = false;
    alert('決済処理中にエラーが発生しました。');
  });
}

// ── PayPal 決済 ───────────────────────────
function processPayPal(btn) {
  // PayPal Buttons は別途 paypal.Buttons() で初期化が必要
  // HTML内の #paypal-button-container に自動レンダリング
  var container = document.getElementById('paypal-button-container');
  if (container) {
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
  }
  if (typeof paypal !== 'undefined') {
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: { value: (selectedAmount / 100).toFixed(2), currency_code: 'JPY' },
            description: 'UECHT Group Charity Donation'
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          showDonationSuccess('paypal', details);
        });
      },
      onError: function(err) {
        console.error('PayPal error:', err);
        alert('PayPal決済中にエラーが発生しました。');
      }
    }).render('#paypal-button-container');
  } else {
    alert('PayPal SDKが読み込まれていません。\n<script src="https://www.paypal.com/sdk/js?client-id=' + PAYPAL_CLIENT_ID + '&currency=JPY"></script> をHTMLに追加してください。');
  }
}

// ── 支付宝 ────────────────────────────────
function processAlipay(btn) {
  var origText = btn.textContent;
  btn.textContent = '処理中...'; btn.disabled = true;
  // Stripe の Alipay 統合を使用
  // バックエンドで PaymentIntent (alipay) を作成 → redirect_to_url
  fetch(DONATE_API_BASE + '/alipay/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: selectedAmount, currency: 'jpy' })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.redirect_url) {
      window.location.href = data.redirect_url; // 支付宝決済ページへリダイレクト
    }
  })
  .catch(function() {
    btn.textContent = origText; btn.disabled = false;
    alert('支付宝決済の設定が必要です。管理者にお問い合わせください。');
  });
}

// ── WeChat Pay ────────────────────────────
function processWechat(btn) {
  var origText = btn.textContent;
  btn.textContent = '処理中...'; btn.disabled = true;
  fetch(DONATE_API_BASE + '/wechat/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: selectedAmount, currency: 'cny' })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.qr_code_url) {
      showWechatQR(data.qr_code_url); // QRコードを表示
    }
  })
  .catch(function() {
    btn.textContent = origText; btn.disabled = false;
    alert('WeChat Pay決済の設定が必要です。管理者にお問い合わせください。');
  });
}

function showWechatQR(qrUrl) {
  var container = document.getElementById('wechat-qr-container');
  if (container) {
    container.innerHTML = '<img src="' + qrUrl + '" alt="WeChat QR" style="width:200px;height:200px;">';
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── 成功画面 ─────────────────────────────
function showDonationSuccess(method, data) {
  var overlay = document.getElementById('donation-success-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    var amount = overlay.querySelector('.success-amount');
    if (amount) {
      var fmt = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });
      amount.textContent = fmt.format(selectedAmount);
    }
  } else {
    alert('ご寄付ありがとうございます！\n領収書をメールでお送りします。');
  }
}

function closeDonationSuccess() {
  var overlay = document.getElementById('donation-success-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ── コピー機能 ────────────────────────────
function copyText(text, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = '✓ コピー完了';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  }
}

// ── 月額定期寄付 ──────────────────────────
function submitMonthlyDonation() {
  // Stripe Subscriptions を使用
  // バックエンドで Customer + Subscription を作成
  fetch(DONATE_API_BASE + '/stripe/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: selectedAmount,
      email: document.getElementById('donor-email-monthly') ? document.getElementById('donor-email-monthly').value : '',
      name: document.getElementById('donor-name-monthly') ? document.getElementById('donor-name-monthly').value : ''
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.checkout_url) {
      window.location.href = data.checkout_url; // Stripe Checkout へリダイレクト
    }
  })
  .catch(function() {
    alert('月額定期寄付はバックエンド実装後に有効になります。');
  });
}

// ── Membership join ──
function joinMembership(tier) {
  var donateSection = document.getElementById('donate');
  if (donateSection) {
    donateSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(function() {
      var monthlyTab = document.querySelector('[onclick*="switchDonateTab(\'monthly\'"]');
      if (!monthlyTab) monthlyTab = document.querySelectorAll('.donate-tab')[1];
      if (monthlyTab) switchDonateTab('monthly', monthlyTab);
    }, 600);
  }
}

// ── Sponsor application ──
function submitSponsorApplication() {
  var company = document.querySelector('#donate-sponsor input[type="text"]');
  var email   = document.querySelector('#donate-sponsor input[type="email"]');
  var level   = document.querySelector('#donate-sponsor select');
  if (!company || !company.value.trim()) { alert('会社名を入力してください'); return; }
  if (!email   || !email.value.includes('@')) { alert('有効なメールアドレスを入力してください'); return; }
  var btn = document.querySelector('#donate-sponsor .btn-primary');
  var orig = btn ? btn.textContent : '';
  if (btn) { btn.textContent = '送信中...'; btn.disabled = true; }
  fetch('/api/donate/sponsor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company: company.value, email: email.value, level: level ? level.value : '' })
  }).then(function() {
    if (btn) { btn.textContent = '✓ 申請を受け付けました'; btn.disabled = false; }
  }).catch(function() {
    alert('スポンサーシップについてはお問い合わせからご連絡ください。');
    if (btn) { btn.textContent = orig; btn.disabled = false; }
  });
}
