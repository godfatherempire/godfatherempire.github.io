# UECHT GROUP Website — プロジェクト構成

```
uecht-website/
├── index.html              # メインサイト（精簡主页）
├── charity.html            # 慈善・援助事業ページ
├── css/
│   └── main.css            # 共通スタイルシート
├── js/
│   ├── main.js             # 言語切換・スクロール・フォーム送信
│   └── donate.js           # 寄付・支払いロジック（決済ゲートウェイ統合）
├── pages/                  # （将来拡張用）
│   ├── about.html          # 会社概要詳細ページ（要作成）
│   ├── news.html           # ニュース一覧ページ（要作成）
│   ├── services/           # 各事業領域詳細（要作成）
│   └── privacy.html        # プライバシーポリシー（要作成）
└── assets/                 # 画像・アイコン・ロゴ（要追加）
    ├── logo.png
    ├── og-image.jpg        # OGP画像
    └── favicon.ico
```

---

## ページ構成

| ファイル | 内容 | 状態 |
|----------|------|------|
| `index.html` | メインサイト（Hero/理念/事業/慈善入口/ニュース/連絡先） | ✅ 完成 |
| `charity.html` | 慈善・援助専用（Hero/4分野/寄付/会員/透明性） | ✅ 完成 |
| `css/main.css` | 全ページ共通CSS | ✅ 完成 |
| `js/main.js` | 言語・スクロール・フォーム | ✅ 完成（要バックエンド） |
| `js/donate.js` | 決済ゲートウェイ統合 | ✅ UI完成（要バックエンド） |

---

## 支払い機能の本番化手順

### Step 1: 銀行振込（今すぐ使える）
- 現在の口座情報表示は実装済み
- バックエンド不要でUI表示は動作する

### Step 2: Stripe（クレジットカード・月額定期）
```bash
# バックエンド (Node.js 例)
npm install stripe express

# 必要なAPIエンドポイント:
POST /api/donate/stripe/create-intent    # 一回払い
POST /api/donate/stripe/create-subscription  # 月額
GET  /api/donate/stripe/webhook          # Webhook受信
```
```javascript
// js/donate.js の設定:
var STRIPE_KEY = 'pk_live_YOUR_PUBLISHABLE_KEY';
```
HTMLに追加:
```html
<script src="https://js.stripe.com/v3/"></script>
```

### Step 3: PayPal
```html
<!-- charity.html に追加 -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=JPY"></script>
```
```javascript
var PAYPAL_CLIENT_ID = 'YOUR_CLIENT_ID';
```

### Step 4: 支付宝 / WeChat Pay
- Stripe の Alipay/WeChat Pay モジュールで対応可能
- または Adyen / Checkout.com を利用

### Step 5: フォームバックエンド
```javascript
// js/main.js の設定:
var CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
// または自前APIなら:
var CONTACT_FORM_ENDPOINT = '/api/contact';
```
**Formspree（最も簡単）**: https://formspree.io で登録 → IDを取得

---

## デプロイ方法

### 静的ホスティング（推奨）
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --dir=.

# GitHub Pages
# リポジトリのSettings > Pages > Deploy from main branch
```

### バックエンドあり（支払い機能本番化の場合）
- Node.js + Express + Stripe SDK
- または Python + FastAPI + Stripe SDK
- サーバー: AWS / GCP / Render / Railway など

---

## 言語システム
- 日本語 / 中文 / English の三言語対応済み
- `data-ja`, `data-cn`, `data-en` 属性で管理
- 選択言語は localStorage に保存（次回訪問時も維持）

## 今後の追加ページ（要作成）
- `pages/about.html` — 会社概要・経営陣・沿革
- `pages/news/` — ニュース記事個別ページ
- `pages/services/` — 6事業領域の詳細ページ
- `pages/privacy.html` — プライバシーポリシー
- `pages/careers.html` — 採用情報
