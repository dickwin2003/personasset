var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-4iNbFn/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-4iNbFn/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/itty-router/index.mjs
var e = /* @__PURE__ */ __name(({ base: e2 = "", routes: t = [], ...o2 } = {}) => ({ __proto__: new Proxy({}, { get: (o3, s2, r, n) => "handle" == s2 ? r.fetch : (o4, ...a) => t.push([s2.toUpperCase?.(), RegExp(`^${(n = (e2 + o4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), a, n]) && r }), routes: t, ...o2, async fetch(e3, ...o3) {
  let s2, r, n = new URL(e3.url), a = e3.query = { __proto__: null };
  for (let [e4, t2] of n.searchParams)
    a[e4] = a[e4] ? [].concat(a[e4], t2) : t2;
  for (let [a2, c2, i2, l2] of t)
    if ((a2 == e3.method || "ALL" == a2) && (r = n.pathname.match(c2))) {
      e3.params = r.groups || {}, e3.route = l2;
      for (let t2 of i2)
        if (null != (s2 = await t2(e3.proxy ?? e3, ...o3)))
          return s2;
    }
} }), "e");
var o = /* @__PURE__ */ __name((e2 = "text/plain; charset=utf-8", t) => (o2, { headers: s2 = {}, ...r } = {}) => void 0 === o2 || "Response" === o2?.constructor.name ? o2 : new Response(t ? t(o2) : o2, { headers: { "content-type": e2, ...s2.entries ? Object.fromEntries(s2) : s2 }, ...r }), "o");
var s = o("application/json; charset=utf-8", JSON.stringify);
var c = o("text/plain; charset=utf-8", String);
var i = o("text/html");
var l = o("image/jpeg");
var p = o("image/png");
var d = o("image/webp");

// src/worker.js
var router = e();
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
router.options("*", () => new Response(null, { headers: corsHeaders }));
async function getUserId(request, env) {
  return "ebda3063c344bd33";
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
  const userAgent = request.headers.get("User-Agent") || "unknown";
  const identifier = `${ip}-${userAgent}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("");
  const userId = hashHex.substring(0, 16);
  const existingUser = await env.DB.prepare("SELECT * FROM users WHERE user_id = ?").bind(userId).first();
  if (!existingUser) {
    const surnames = ["\u5F20", "\u674E", "\u738B", "\u5218", "\u9648", "\u6768", "\u8D75", "\u9EC4", "\u5468", "\u5434"];
    const names = ["\u4F1F", "\u82B3", "\u5A1C", "\u654F", "\u9759", "\u4E3D", "\u5F3A", "\u78CA", "\u519B", "\u6D0B"];
    const randomName = surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
    await env.DB.prepare(`
      INSERT INTO users (user_id, username, ip_address, created_at, last_login)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(userId, randomName, ip).run();
  } else {
    await env.DB.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?
    `).bind(userId).run();
  }
  return userId;
}
__name(getUserId, "getUserId");
router.get("/", async (request, env) => {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>\u4E2A\u4EBA\u8D44\u4EA7\u7EC4\u5408</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="format-detection" content="telephone=no">
    <style>
        .tab-btn {
            color: #6b7280;
            background-color: transparent;
        }
        .tab-btn.active {
            color: #3b82f6;
            background-color: #dbeafe;
        }
        .tab-btn:hover {
            background-color: #f3f4f6;
        }
        .tab-btn.active:hover {
            background-color: #dbeafe;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen overflow-x-hidden">
    <!-- \u79FB\u52A8\u7AEF\u5BFC\u822A\u680F -->
    <div class="bg-white shadow-sm sticky top-0 z-50">
        <div class="px-4 py-3">
            <div class="flex items-center justify-between">
                <h1 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                    \u4E2A\u4EBA\u8D44\u4EA7\u7EC4\u5408
                </h1>
                <button id="menuBtn" class="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            
            <!-- \u4E0B\u62C9\u83DC\u5355 -->
            <div id="dropdownMenu" class="hidden absolute top-full right-4 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div class="py-2">
                    <button id="assetTypesBtn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <i class="fas fa-tags mr-2 text-blue-500"></i>
                        \u8D44\u4EA7\u7C7B\u578B\u7BA1\u7406
                    </button>
                    <button id="settingsBtn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <i class="fas fa-cog mr-2 text-gray-500"></i>
                        \u8BBE\u7F6E
                    </button>
                    <button id="aboutBtn" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <i class="fas fa-info-circle mr-2 text-green-500"></i>
                        \u5173\u4E8E
                    </button>
                </div>
            </div>
        </div>
        
        <!-- \u5E95\u90E8\u5BFC\u822A -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div class="grid grid-cols-4 gap-1 p-2">
                <button id="dashboardBtn" class="nav-tab active flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-home text-lg mb-1"></i>
                    <span class="text-xs">\u9996\u9875</span>
                </button>
                <button id="assetsBtn" class="nav-tab flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-coins text-lg mb-1"></i>
                    <span class="text-xs">\u8D44\u4EA7</span>
                </button>
                <button id="liabilitiesBtn" class="nav-tab flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-credit-card text-lg mb-1"></i>
                    <span class="text-xs">\u8D1F\u503A</span>
                </button>
                <button id="cashFlowBtn" class="nav-tab flex flex-col items-center py-2 px-1 rounded-lg transition-all">
                    <i class="fas fa-chart-line text-lg mb-1"></i>
                    <span class="text-xs">\u8D44\u91D1\u6D41</span>
                </button>
            </div>
        </div>
    </div>

    <!-- \u4E3B\u5185\u5BB9\u533A\u57DF -->
    <div class="pb-20 px-4 py-4">
        <!-- \u4EEA\u8868\u677F\u9875\u9762 -->
        <div id="dashboardPage" class="page">
            <!-- \u7528\u6237\u4FE1\u606F -->
            <div class="mb-4 bg-white rounded-lg p-4 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-sm text-gray-500">\u6B22\u8FCE\u56DE\u6765</h3>
                        <p id="username" class="text-lg font-semibold text-gray-800">\u52A0\u8F7D\u4E2D...</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-400">\u6700\u540E\u767B\u5F55</p>
                        <p id="lastLogin" class="text-sm text-gray-600">\u52A0\u8F7D\u4E2D...</p>
                    </div>
                </div>
            </div>
            
            <!-- \u8D44\u4EA7\u603B\u89C8\uFF08\u4E00\u884C\u663E\u793A\uFF09 -->
            <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div class="text-center">
                        <i class="fas fa-coins text-2xl mb-2"></i>
                        <p class="text-xs opacity-90">\u603B\u8D44\u4EA7</p>
                        <p id="totalAssets" class="text-lg font-bold">\uFFE50</p>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                    <div class="text-center">
                        <i class="fas fa-credit-card text-2xl mb-2"></i>
                        <p class="text-xs opacity-90">\u603B\u8D1F\u503A</p>
                        <p id="totalLiabilities" class="text-lg font-bold">\uFFE50</p>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div class="text-center">
                        <i class="fas fa-chart-line text-2xl mb-2"></i>
                        <p class="text-xs opacity-90">\u51C0\u8D44\u4EA7</p>
                        <p id="netWorth" class="text-lg font-bold">\uFFE50</p>
                    </div>
                </div>
            </div>
            
            <!-- \u4ECA\u5E74\u6536\u652F\u5BF9\u6BD4 -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-balance-scale mr-2 text-purple-500"></i>
                    \u4ECA\u5E74\u6536\u652F\u5BF9\u6BD4
                </h3>
                <div class="grid grid-cols-4 gap-2 text-center">
                    <div class="p-2 bg-green-50 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">\u9884\u8BA1\u6536\u5165</p>
                        <p id="projectedIncome" class="text-sm font-bold text-green-600">\uFFE50</p>
                    </div>
                    <div class="p-2 bg-green-100 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">\u5B9E\u9645\u6536\u5165</p>
                        <p id="actualIncome" class="text-sm font-bold text-green-700">\uFFE50</p>
                    </div>
                    <div class="p-2 bg-red-50 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">\u9884\u8BA1\u652F\u51FA</p>
                        <p id="projectedExpense" class="text-sm font-bold text-red-600">\uFFE50</p>
                    </div>
                    <div class="p-2 bg-red-100 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">\u5B9E\u9645\u652F\u51FA</p>
                        <p id="actualExpense" class="text-sm font-bold text-red-700">\uFFE50</p>
                    </div>
                </div>
                <div class="mt-3 text-center p-2 rounded-lg" id="balanceStatus">
                    <p class="text-sm font-medium" id="balanceText">\u52A0\u8F7D\u4E2D...</p>
                </div>
            </div>
            
            <!-- \u4E00\u5E74\u6536\u652F\u8D8B\u52BF\u56FE -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                    \u4E00\u5E74\u6536\u652F\u8D8B\u52BF
                </h3>
                <div class="h-64">
                    <canvas id="monthlyTrendChart"></canvas>
                </div>
            </div>
            
            <!-- \u8D44\u4EA7\u6536\u76CA -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-trophy mr-2 text-yellow-500"></i>
                    \u8D44\u4EA7\u6536\u76CA
                </h3>
                <div class="h-64">
                    <canvas id="assetReturnsChart"></canvas>
                </div>
            </div>
            
            <!-- \u8D44\u4EA7\u5206\u5E03\u56FE -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-pie-chart mr-2 text-orange-500"></i>
                    \u8D44\u4EA7\u5206\u5E03
                </h3>
                <div class="h-64">
                    <canvas id="assetDistributionChart"></canvas>
                </div>
            </div>
        </div>

        <!-- \u8D44\u4EA7\u9875\u9762 -->
        <div id="assetsPage" class="page hidden">
            <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">\u6211\u7684\u8D44\u4EA7</h2>
                <button id="addAssetBtn" class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u8D44\u4EA7
                </button>
            </div>
            <div id="assetsContainer"></div>
        </div>

        <!-- \u8D1F\u503A\u9875\u9762 -->
        <div id="liabilitiesPage" class="page hidden">
            <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">\u6211\u7684\u8D1F\u503A</h2>
                <button id="addLiabilityBtn" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u8D1F\u503A
                </button>
            </div>
            <div id="liabilitiesContainer"></div>
        </div>

        <!-- \u8D44\u91D1\u6D41\u5165\u9875\u9762 -->
        <div id="cashFlowPage" class="page hidden">
            <div class="mb-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">\u8D44\u91D1\u6D41\u7BA1\u7406</h2>
                <button id="addCashFlowBtn" class="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                    <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u8BB0\u5F55
                </button>
            </div>
            
            <!-- \u5207\u6362\u9009\u9879\u5361 -->
            <div class="mb-4 bg-white rounded-lg p-1 shadow-sm">
                <div class="grid grid-cols-2 gap-1">
                    <button id="plannedFlowTab" class="tab-btn active py-2 px-4 rounded-md text-sm font-medium transition-all">
                        <i class="fas fa-calendar-alt mr-1"></i>\u9884\u671F\u6536\u652F
                    </button>
                    <button id="historicalFlowTab" class="tab-btn py-2 px-4 rounded-md text-sm font-medium transition-all">
                        <i class="fas fa-history mr-1"></i>\u5386\u53F2\u8BB0\u5F55
                    </button>
                </div>
            </div>
            
            <!-- \u9884\u671F\u6536\u652F\u5185\u5BB9 -->
            <div id="plannedFlowContent">
                <div id="cashFlowContainer"></div>
            </div>
            
            <!-- \u5386\u53F2\u8BB0\u5F55\u5185\u5BB9 -->
            <div id="historicalFlowContent" class="hidden">
                <!-- \u5386\u53F2\u73B0\u91D1\u6D41\u56FE\u8868 -->
                <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                        \u5386\u53F2\u6536\u652F\u8D8B\u52BF
                    </h3>
                    <div class="h-64">
                        <canvas id="historicalFlowChart"></canvas>
                    </div>
                </div>
                
                <!-- \u5386\u53F2\u8BB0\u5F55\u5217\u8868 -->
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-list mr-2 text-green-500"></i>
                        \u5386\u53F2\u4EA4\u6613\u8BB0\u5F55
                    </h3>
                    <div id="historicalFlowList"></div>
                </div>
            </div>
        </div>
        
        <!-- \u8BBE\u7F6E\u9875\u9762 -->
        <div id="settingsPage" class="page hidden">
            <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-800">\u8BBE\u7F6E</h2>
            </div>
            
            <!-- \u7528\u6237\u4FE1\u606F -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-user mr-2 text-blue-500"></i>
                    \u7528\u6237\u4FE1\u606F
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">\u7528\u6237\u540D</label>
                        <input type="text" id="usernameInput" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="\u8BF7\u8F93\u5165\u7528\u6237\u540D">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">\u624B\u673A\u53F7\u7801</label>
                        <input type="tel" id="phoneInput" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">\u90AE\u7BB1</label>
                        <input type="email" id="emailInput" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="\u8BF7\u8F93\u5165\u90AE\u7BB1">
                    </div>
                    <button id="saveUserInfoBtn" class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center">
                        <i class="fas fa-save mr-2"></i>
                        \u4FDD\u5B58\u4FE1\u606F
                    </button>
                </div>
            </div>
            
            <!-- \u5E94\u7528\u8BBE\u7F6E -->
            <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-cog mr-2 text-gray-500"></i>
                    \u5E94\u7528\u8BBE\u7F6E
                </h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">\u6570\u636E\u5907\u4EFD</span>
                        <button class="text-blue-500 hover:text-blue-600">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">\u6570\u636E\u6E05\u7406</span>
                        <button class="text-red-500 hover:text-red-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- \u5173\u4E8E -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-green-500"></i>
                    \u5173\u4E8E
                </h3>
                <div class="text-gray-600 space-y-2">
                    <p>\u4E2A\u4EBA\u8D44\u4EA7\u7EC4\u5408\u7BA1\u7406\u7CFB\u7EDF</p>
                    <p>\u7248\u672C: 2.0.0</p>
                    <p>\u6700\u540E\u66F4\u65B0: 2025-08-07</p>
                </div>
            </div>
        </div>
    </div>

    <!-- \u6A21\u6001\u6846 -->
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-end sm:items-center justify-center">
        <div id="modalContent" class="bg-white w-full sm:w-96 sm:rounded-lg rounded-t-xl max-h-[80vh] overflow-y-auto">
            <!-- \u6A21\u6001\u6846\u5185\u5BB9\u5C06\u52A8\u6001\u63D2\u5165 -->
        </div>
    </div>

    <!-- Toast \u901A\u77E5 -->
    <div id="toast" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-x-full z-50">
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span id="toastMessage">\u64CD\u4F5C\u6210\u529F</span>
        </div>
    </div>
    <script>
        // \u5168\u5C40\u53D8\u91CF
        let currentPage = 'dashboard';
        let assetTypes = [];
        let assets = [];
        
        // API\u5BA2\u6237\u7AEF
        class ApiClient {
            constructor() {
                this.baseUrl = window.location.origin;
            }
            
            async request(endpoint, options = {}) {
                const url = \`\${this.baseUrl}/api\${endpoint}\`;
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    ...options,
                };
                try {
                    const response = await fetch(url, config);
                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }
                    return await response.json();
                } catch (error) {
                    console.error('API request failed:', error);
                    throw error;
                }
            }
            
            // \u4EEA\u8868\u677F
            async getDashboardOverview() {
                return this.request('/dashboard/overview');
            }
            
            // \u8D44\u4EA7\u7C7B\u578B
            async getAssetTypes() {
                return this.request('/asset-types');
            }
            
            async createAssetType(data) {
                return this.request('/asset-types', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteAssetType(id) {
                return this.request(\`/asset-types/\${id}\`, {
                    method: 'DELETE',
                });
            }
            
            // \u8D44\u4EA7
            async getAssets() {
                return this.request('/assets');
            }
            
            async createAsset(data) {
                return this.request('/assets', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteAsset(id) {
                return this.request(\`/assets/\${id}\`, {
                    method: 'DELETE',
                });
            }
            
            // \u8D44\u91D1\u6D41\u5165
            async getCashFlows() {
                return this.request('/cash-flows');
            }
            
            async createCashFlow(data) {
                return this.request('/cash-flows', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteCashFlow(id) {
                return this.request(\`/cash-flows/\${id}\`, {
                    method: 'DELETE',
                });
            }
            
            async updateCashFlow(id, data) {
                return this.request(\`/cash-flows/\${id}\`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            async updateAsset(id, data) {
                return this.request(\`/assets/\${id}\`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            async updateAssetType(id, data) {
                return this.request(\`/asset-types/\${id}\`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // \u8D1F\u503A
            async getLiabilities() {
                return this.request('/liabilities');
            }
            
            async createLiability(data) {
                return this.request('/liabilities', {
                    method: 'POST',
                    body: JSON.stringify(data),
                });
            }
            
            async deleteLiability(id) {
                return this.request('/liabilities/' + id, {
                    method: 'DELETE',
                });
            }
            
            async updateLiability(id, data) {
                return this.request('/liabilities/' + id, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // \u8D44\u4EA7\u5220\u9664
            async deleteAsset(id) {
                return this.request(\`/assets/\${id}\`, {
                    method: 'DELETE',
                });
            }
            
            // \u8D44\u4EA7\u7C7B\u578B\u5220\u9664
            async deleteAssetType(id) {
                return this.request(\`/asset-types/\${id}\`, {
                    method: 'DELETE',
                });
            }
            
            // \u7528\u6237\u4FE1\u606F
            async getUserInfo() {
                return this.request('/user/info');
            }
            
            async updateUserInfo(data) {
                return this.request('/user/info', {
                    method: 'PUT',
                    body: JSON.stringify(data),
                });
            }
            
            // \u5206\u6790\u6570\u636E
            async getYearlyIncomeExpense() {
                return this.request('/analytics/yearly-income-expense');
            }
            
            async getMonthlyIncomeExpense() {
                return this.request('/analytics/monthly-income-expense');
            }
            
            async getAssetReturns() {
                return this.request('/analytics/asset-returns');
            }
            
            async getBalanceForecast() {
                return this.request('/analytics/balance-forecast');
            }
            
            // \u5386\u53F2\u6570\u636E
            async getCashFlowHistory() {
                return this.request('/cash-flows/history');
            }
            
            async getHistoricalMonthlyFlow() {
                return this.request('/analytics/historical-monthly-flow');
            }
            
            async getAssetValueTrends() {
                return this.request('/analytics/asset-value-trends');
            }
        }
        
        const apiClient = new ApiClient();
        
        // \u9875\u9762\u5BFC\u822A
        function showPage(pageName) {
            currentPage = pageName;
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
            document.getElementById(pageName + 'Page').classList.remove('hidden');
            
            document.querySelectorAll('.nav-tab').forEach(btn => {
                btn.classList.remove('active');
            });
            // \u53EA\u6709\u5E95\u90E8\u5BFC\u822A\u7684\u9875\u9762\u624D\u9AD8\u4EAE\u6309\u94AE
            const navBtn = document.getElementById(pageName + 'Btn');
            if (navBtn) {
                navBtn.classList.add('active');
            }
            
            // \u52A0\u8F7D\u5BF9\u5E94\u9875\u9762\u6570\u636E
            switch(pageName) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'assets':
                    loadAssets();
                    break;
                case 'liabilities':
                    loadLiabilities();
                    break;
                case 'cashFlow':
                    loadCashFlow();
                    break;
                case 'settings':
                    loadSettings();
                    break;
            }
        }
        
        // \u83DC\u5355\u5904\u7406
        function initializeMenu() {
            const menuBtn = document.getElementById('menuBtn');
            const dropdownMenu = document.getElementById('dropdownMenu');
            const assetTypesBtn = document.getElementById('assetTypesBtn');
            
            // \u83DC\u5355\u6309\u94AE\u70B9\u51FB\u4E8B\u4EF6
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('hidden');
            });
            
            // \u70B9\u51FB\u9875\u9762\u5176\u4ED6\u5730\u65B9\u5173\u95ED\u83DC\u5355
            document.addEventListener('click', () => {
                dropdownMenu.classList.add('hidden');
            });
            
            // \u8D44\u4EA7\u7C7B\u578B\u7BA1\u7406\u6309\u94AE
            assetTypesBtn.addEventListener('click', () => {
                dropdownMenu.classList.add('hidden');
                showAssetTypesManagement();
            });
            
            // \u8BBE\u7F6E\u6309\u94AE
            document.getElementById('settingsBtn').addEventListener('click', () => {
                dropdownMenu.classList.add('hidden');
                showPage('settings');
            });
        }
        
        // \u663E\u793AToast
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            toast.className = \`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 \${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white\`;
            
            setTimeout(() => {
                toast.classList.add('translate-x-full');
            }, 3000);
        }
        
        // \u663E\u793A/\u9690\u85CF\u6A21\u6001\u6846
        function showModal(content) {
            document.getElementById('modalContent').innerHTML = content;
            document.getElementById('modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        function hideModal() {
            document.getElementById('modal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        
        // \u52A0\u8F7D\u4EEA\u8868\u677F
        async function loadDashboard() {
            try {
                // \u5E76\u884C\u52A0\u8F7D\u6570\u636E
                const [userInfo, overview, balanceForecast] = await Promise.all([
                    apiClient.getUserInfo(),
                    apiClient.getDashboardOverview(),
                    apiClient.getBalanceForecast()
                ]);
                
                // \u66F4\u65B0\u7528\u6237\u4FE1\u606F
                document.getElementById('username').textContent = userInfo.username || '\u672A\u77E5\u7528\u6237';
                document.getElementById('lastLogin').textContent = userInfo.last_login ? 
                    new Date(userInfo.last_login).toLocaleDateString('zh-CN') : '\u4ECA\u5929';
                
                // \u66F4\u65B0\u8D44\u4EA7\u603B\u89C8
                document.getElementById('totalAssets').textContent = 
                    '\uFFE5' + (overview.total_assets || 0).toLocaleString();
                document.getElementById('totalLiabilities').textContent = 
                    '\uFFE5' + (overview.total_liabilities || 0).toLocaleString();
                document.getElementById('netWorth').textContent = 
                    '\uFFE5' + (overview.net_worth || 0).toLocaleString();
                
                // \u66F4\u65B0\u6536\u652F\u9884\u8BA1\u548C\u5B9E\u9645\u5BF9\u6BD4
                const plannedIncome = balanceForecast.planned?.income || 0;
                const plannedExpense = balanceForecast.planned?.expense || 0;
                const actualIncome = balanceForecast.actual?.income || 0;
                const actualExpense = balanceForecast.actual?.expense || 0;
                
                document.getElementById('projectedIncome').textContent = '\uFFE5' + plannedIncome.toLocaleString();
                document.getElementById('projectedExpense').textContent = '\uFFE5' + plannedExpense.toLocaleString();
                document.getElementById('actualIncome').textContent = '\uFFE5' + actualIncome.toLocaleString();
                document.getElementById('actualExpense').textContent = '\uFFE5' + actualExpense.toLocaleString();
                
                const plannedBalance = plannedIncome - plannedExpense;
                const actualBalance = actualIncome - actualExpense;
                const balanceStatus = document.getElementById('balanceStatus');
                const balanceText = document.getElementById('balanceText');
                
                if (actualBalance > 0) {
                    balanceStatus.className = 'mt-3 text-center p-2 rounded-lg bg-green-100';
                    balanceText.textContent = '\u5B9E\u9645\u76C8\u4F59\uFFE5' + actualBalance.toLocaleString() + ' | \u9884\u8BA1\u76C8\u4F59\uFFE5' + plannedBalance.toLocaleString();
                    balanceText.className = 'text-sm font-medium text-green-700';
                } else if (actualBalance < 0) {
                    balanceStatus.className = 'mt-3 text-center p-2 rounded-lg bg-red-100';
                    balanceText.textContent = '\u5B9E\u9645\u4E8F\u635F\uFFE5' + Math.abs(actualBalance).toLocaleString() + ' | \u9884\u8BA1\u76C8\u4F59\uFFE5' + plannedBalance.toLocaleString();
                    balanceText.className = 'text-sm font-medium text-red-700';
                } else {
                    balanceStatus.className = 'mt-3 text-center p-2 rounded-lg bg-gray-100';
                    balanceText.textContent = '\u5B9E\u9645\u6536\u652F\u5E73\u8861 | \u9884\u8BA1\u76C8\u4F59\uFFE5' + plannedBalance.toLocaleString();
                    balanceText.className = 'text-sm font-medium text-gray-700';
                }
                
                // \u52A0\u8F7D\u56FE\u8868
                await loadCharts();
                
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                showToast('\u52A0\u8F7D\u4EEA\u8868\u677F\u6570\u636E\u5931\u8D25', 'error');
            }
        }
        
        // \u5168\u5C40\u56FE\u8868\u5B9E\u4F8B
        let monthlyTrendChartInstance = null;
        let assetDistributionChartInstance = null;
        let assetReturnsChartInstance = null;
        
        // \u52A0\u8F7D\u56FE\u8868
        async function loadCharts() {
            try {
                const [monthlyData, assetReturns, overview] = await Promise.all([
                    apiClient.getMonthlyIncomeExpense(),
                    apiClient.getAssetReturns(),
                    apiClient.getDashboardOverview()
                ]);
                
                // \u6E32\u67D3\u6708\u5EA6\u6536\u652F\u8D8B\u52BF\u56FE\uFF08\u533A\u5206\u5B9E\u9645\u548C\u9884\u671F\uFF09
                renderMonthlyTrendChart(monthlyData);
                
                // \u6E32\u67D3\u8D44\u4EA7\u6536\u76CA\u56FE
                renderAssetReturnsChart(assetReturns);
                
                // \u6E32\u67D3\u8D44\u4EA7\u5206\u5E03\u56FE
                renderAssetDistributionChart(overview.assets_by_category || []);
                
            } catch (error) {
                console.error('Failed to load charts:', error);
            }
        }
        
        // \u6E32\u67D3\u4E00\u5E74\u6536\u652F\u8D8B\u52BF\u56FE\uFF08\u533A\u5206\u5B9E\u9645\u548C\u9884\u671F\uFF09
        function renderMonthlyTrendChart(data) {
            const ctx = document.getElementById('monthlyTrendChart');
            if (!ctx) return;
            
            // \u9500\u6BC1\u65E7\u7684\u56FE\u8868\u5B9E\u4F8B
            if (monthlyTrendChartInstance) {
                monthlyTrendChartInstance.destroy();
            }
            
            // \u5904\u7406\u65B0\u7684\u6570\u636E\u683C\u5F0F
            const currentMonth = data.currentMonth || 8; // \u5F53\u524D\u6708\u4EFD (1-12)
            const actualData = data.actual || [];
            const plannedData = data.planned || [];
            
            // \u751F\u6210 1-12 \u6708\u7684\u6807\u7B7E
            const months = [];
            const monthLabels = [];
            for (let i = 1; i <= 12; i++) {
                const monthStr = '2025-' + String(i).padStart(2, '0'); // \u4F7F\u75282025\u5E74\u6570\u636E
                months.push(monthStr);
                monthLabels.push(i + '\u6708');
            }
            
            // \u521B\u5EFA\u8FDE\u7EED\u7684\u6536\u5165\u548C\u652F\u51FA\u6570\u636E\uFF08\u5305\u542B\u5B9E\u9645\u548C\u9884\u671F\uFF09
            const incomeData = months.map((month, index) => {
                const monthNum = index + 1;
                if (monthNum < currentMonth) {
                    // \u5F53\u524D\u6708\u4EFD\u4E4B\u524D\uFF1A\u4F7F\u7528\u5B9E\u9645\u6570\u636E
                    const item = actualData.find(d => d.month === month && d.flow_type === 'income');
                    return item ? item.total_amount : 0;
                } else {
                    // \u5F53\u524D\u6708\u4EFD\u53CA\u4E4B\u540E\uFF1A\u4F7F\u7528\u9884\u671F\u6570\u636E
                    const item = plannedData.find(d => d.month === month && d.flow_type === 'income');
                    return item ? item.total_amount : 0;
                }
            });
            
            const expenseData = months.map((month, index) => {
                const monthNum = index + 1;
                if (monthNum < currentMonth) {
                    // \u5F53\u524D\u6708\u4EFD\u4E4B\u524D\uFF1A\u4F7F\u7528\u5B9E\u9645\u6570\u636E
                    const item = actualData.find(d => d.month === month && d.flow_type === 'expense');
                    return item ? item.total_amount : 0;
                } else {
                    // \u5F53\u524D\u6708\u4EFD\u53CA\u4E4B\u540E\uFF1A\u4F7F\u7528\u9884\u671F\u6570\u636E
                    const item = plannedData.find(d => d.month === month && d.flow_type === 'expense');
                    return item ? item.total_amount : 0;
                }
            });
            
            // \u521B\u5EFA\u5206\u6BB5\u6837\u5F0F\uFF1A\u5B9E\u9645\u6570\u636E\u90E8\u5206\u548C\u9884\u671F\u6570\u636E\u90E8\u5206
            const actualIncomeData = incomeData.map((value, index) => index < currentMonth - 1 ? value : null); // \u53EA\u663E\u793A\u5DF2\u5B8C\u6210\u7684\u6708\u4EFD
            const plannedIncomeData = incomeData.map((value, index) => index >= currentMonth - 2 ? value : null); // \u4ECE\u4E0A\u4E2A\u6708\u5F00\u59CB\u8FDE\u63A5
            const actualExpenseData = expenseData.map((value, index) => index < currentMonth - 1 ? value : null); // \u53EA\u663E\u793A\u5DF2\u5B8C\u6210\u7684\u6708\u4EFD
            const plannedExpenseData = expenseData.map((value, index) => index >= currentMonth - 2 ? value : null); // \u4ECE\u4E0A\u4E2A\u6708\u5F00\u59CB\u8FDE\u63A5
            
            monthlyTrendChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthLabels, // \u4F7F\u75281-12\u6708\u6807\u7B7E
                    datasets: [{
                        label: '\u5B9E\u9645\u6536\u5165',
                        data: actualIncomeData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 4
                    }, {
                        label: '\u9884\u671F\u6536\u5165',
                        data: plannedIncomeData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5], // \u865A\u7EBF
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 4
                    }, {
                        label: '\u5B9E\u9645\u652F\u51FA',
                        data: actualExpenseData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 4
                    }, {
                        label: '\u9884\u671F\u652F\u51FA',
                        data: plannedExpenseData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5], // \u865A\u7EBF
                        tension: 0.4,
                        spanGaps: true,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '\uFFE5' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // \u6E32\u67D3\u8D44\u4EA7\u5206\u5E03\u56FE
        function renderAssetDistributionChart(data) {
            console.log('renderAssetDistributionChart called with data:', data);
            const ctx = document.getElementById('assetDistributionChart');
            if (!ctx) {
                console.error('assetDistributionChart canvas not found');
                return;
            }
            
            if (!data || !data.length) {
                console.log('No asset distribution data, showing empty chart');
                // \u663E\u793A\u7A7A\u56FE\u8868
                if (assetDistributionChartInstance) {
                    assetDistributionChartInstance.destroy();
                }
                assetDistributionChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['\u6682\u65E0\u6570\u636E'],
                        datasets: [{
                            data: [1],
                            backgroundColor: ['rgba(156, 163, 175, 0.8)'],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
                return;
            }
            
            // \u9500\u6BC1\u65E7\u7684\u56FE\u8868\u5B9E\u4F8B
            if (assetDistributionChartInstance) {
                assetDistributionChartInstance.destroy();
            }
            
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
            
            assetDistributionChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.category),
                    datasets: [{
                        data: data.map(item => item.total_value),
                        backgroundColor: colors.slice(0, data.length),
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': \uFFE5' + context.parsed.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // \u6E32\u67D3\u8D44\u4EA7\u6536\u76CA\u5BF9\u6BD4\u56FE\uFF08\u57FA\u4E8E\u6210\u672C\u548C\u73B0\u4EF7\uFF09
        function renderAssetReturnsChart(data) {
            console.log('renderAssetReturnsChart called with data:', data);
            const ctx = document.getElementById('assetReturnsChart');
            if (!ctx) {
                console.error('assetReturnsChart canvas not found');
                return;
            }
            
            if (!data || !data.length) {
                console.log('No asset returns data, showing empty chart');
                // \u663E\u793A\u7A7A\u56FE\u8868
                if (assetReturnsChartInstance) {
                    assetReturnsChartInstance.destroy();
                }
                assetReturnsChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['\u6682\u65E0\u6570\u636E'],
                        datasets: [{
                            label: '\u6536\u76CA\u7387(%)',
                            data: [0],
                            backgroundColor: 'rgba(156, 163, 175, 0.8)',
                            borderColor: 'rgb(156, 163, 175)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                }
                            }
                        }
                    }
                });
                return;
            }
            
            // \u9500\u6BC1\u65E7\u7684\u56FE\u8868\u5B9E\u4F8B
            if (assetReturnsChartInstance) {
                assetReturnsChartInstance.destroy();
            }
            
            // \u6309\u6536\u76CA\u7387\u6392\u5E8F
            const sortedData = data.sort((a, b) => b.return_rate - a.return_rate);
            
            assetReturnsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedData.map(item => item.asset_name),
                    datasets: [{
                        label: '\u6536\u76CA\u7387(%)',
                        data: sortedData.map(item => item.return_rate),
                        backgroundColor: sortedData.map(item => 
                            item.return_rate >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                        ),
                        borderColor: sortedData.map(item => 
                            item.return_rate >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                        ),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const item = sortedData[context.dataIndex];
                                    return [
                                        '\u6536\u76CA\u7387: ' + item.return_rate + '%',
                                        '\u6210\u672C\u4EF7: \uFFE5' + item.cost_price.toLocaleString(),
                                        '\u73B0\u4EF7: \uFFE5' + item.current_price.toLocaleString(),
                                        '\u76C8\u4E8F: \uFFE5' + item.profit_loss.toLocaleString()
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // \u52A0\u8F7Ddashboard\u8D44\u4EA7\u5217\u8868
        async function loadDashboardAssets() {
            try {
                const assets = await apiClient.getAssets();
                const limitedAssets = assets.slice(0, 5); // \u53EA\u663E\u793A\u524D5\u4E2A
                
                if (limitedAssets.length === 0) {
                    document.getElementById('dashboardAssetsContainer').innerHTML = '<p class="text-gray-500 text-sm">\u6682\u65E0\u8D44\u4EA7\u8BB0\u5F55</p>';
                    return;
                }
                
                document.getElementById('dashboardAssetsContainer').innerHTML = limitedAssets.map(asset => \`
                    <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                            <h4 class="font-medium text-gray-800">\${asset.name}</h4>
                            <p class="text-sm text-gray-500">\${asset.asset_type_name || '\u672A\u5206\u7C7B'}</p>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-blue-600">\uFFE5\${asset.current_value.toLocaleString()}</span>
                            <button onclick="editAsset(\${asset.id})" class="ml-2 text-gray-400 hover:text-blue-500">
                                <i class="fas fa-edit text-sm"></i>
                            </button>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Failed to load dashboard assets:', error);
                document.getElementById('dashboardAssetsContainer').innerHTML = '<p class="text-red-500 text-sm">\u52A0\u8F7D\u5931\u8D25</p>';
            }
        }
        
        // \u52A0\u8F7Ddashboard\u8D44\u4EA7\u7C7B\u578B\u5217\u8868
        async function loadDashboardAssetTypes() {
            try {
                const assetTypes = await apiClient.getAssetTypes();
                const limitedTypes = assetTypes.slice(0, 6); // \u53EA\u663E\u793A\u524D6\u4E2A
                
                if (limitedTypes.length === 0) {
                    document.getElementById('dashboardTypesContainer').innerHTML = '<p class="text-gray-500 text-sm">\u6682\u65E0\u8D44\u4EA7\u7C7B\u578B</p>';
                    return;
                }
                
                const groupedTypes = limitedTypes.reduce((acc, type) => {
                    if (!acc[type.category]) acc[type.category] = [];
                    acc[type.category].push(type);
                    return acc;
                }, {});
                
                document.getElementById('dashboardTypesContainer').innerHTML = Object.entries(groupedTypes).map(([category, types]) => \`
                    <div class="mb-3 last:mb-0">
                        <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <i class="fas \${getCategoryIcon(category)} mr-2 text-blue-500"></i>
                            \${getCategoryName(category)} (\${types.length}\u9879)
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            \${types.map(type => \`
                                <div class="bg-gray-50 rounded-lg p-2 text-sm">
                                    <div class="flex justify-between items-center">
                                        <span class="font-medium text-gray-800">\${type.name}</span>
                                        <button onclick="editAssetType(\${type.id})" class="text-gray-400 hover:text-blue-500">
                                            <i class="fas fa-edit text-xs"></i>
                                        </button>
                                    </div>
                                    \${type.description ? \`<p class="text-gray-500 text-xs mt-1">\${type.description}</p>\` : ''}
                                    \${type.has_depreciation ? \`<p class="text-orange-500 text-xs">\u6298\u65E7\u7387: \${type.depreciation_rate}%</p>\` : ''}
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Failed to load dashboard asset types:', error);
                document.getElementById('dashboardTypesContainer').innerHTML = '<p class="text-red-500 text-sm">\u52A0\u8F7D\u5931\u8D25</p>';
            }
        }
        
        // \u52A0\u8F7D\u8D44\u4EA7\u7C7B\u578B
        async function loadAssetTypes() {
            try {
                assetTypes = await apiClient.getAssetTypes();
                
                const groupedTypes = assetTypes.reduce((acc, type) => {
                    if (!acc[type.category]) acc[type.category] = [];
                    acc[type.category].push(type);
                    return acc;
                }, {});
                
                document.getElementById('typesContainer').innerHTML = Object.entries(groupedTypes).map(([category, types]) => \`
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas \${getCategoryIcon(category)} mr-2 text-blue-500"></i>
                            \${getCategoryName(category)} (\${types.length}\u9879)
                        </h3>
                        <div class="space-y-2">
                            \${types.map(type => \`
                                <div class="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h4 class="font-medium text-gray-800">\${type.name}</h4>
                                        <p class="text-sm text-gray-500">\${type.description || '\u6682\u65E0\u63CF\u8FF0'}</p>
                                        \${type.has_depreciation ? \`<p class="text-xs text-orange-500 mt-1">\u6298\u65E7\u7387: \${(type.depreciation_rate * 100).toFixed(1)}%</p>\` : ''}
                                    </div>
                                    <button onclick="deleteAssetType(\${type.id})" class="text-red-500 hover:text-red-700 p-2">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Failed to load asset types:', error);
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u7C7B\u578B\u5931\u8D25', 'error');
            }
        }
        
        // \u52A0\u8F7D\u8D44\u4EA7
        async function loadAssets() {
            try {
                assets = await apiClient.getAssets();
                
                if (assets.length === 0) {
                    document.getElementById('assetsContainer').innerHTML = \`
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-coins text-4xl mb-4"></i>
                            <p class="mb-4">\u8FD8\u6CA1\u6709\u6DFB\u52A0\u4EFB\u4F55\u8D44\u4EA7</p>
                            <button onclick="document.getElementById('addAssetBtn').click()" class="bg-blue-500 text-white px-6 py-3 rounded-lg">
                                <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u7B2C\u4E00\u4E2A\u8D44\u4EA7
                            </button>
                        </div>
                    \`;
                    return;
                }
                
                document.getElementById('assetsContainer').innerHTML = assets.map(asset => \`
                    <div class="bg-white rounded-lg p-4 shadow-sm mb-3 flex justify-between items-center">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-800">\${asset.name}</h4>
                            <p class="text-sm text-gray-500">\${asset.type_name || '\u672A\u77E5\u7C7B\u578B'}</p>
                            <p class="text-lg font-bold text-green-600">\uFFE5\${(asset.current_value || 0).toLocaleString()}</p>
                        </div>
                        <button onclick="deleteAsset(\${asset.id})" class="text-red-500 hover:text-red-700 p-2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Failed to load assets:', error);
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u5931\u8D25', 'error');
            }
        }
        
        // \u52A0\u8F7D\u8D44\u4EA7\u5217\u8868
        async function loadAssets() {
            try {
                const assets = await apiClient.getAssets();
                
                if (assets.length === 0) {
                    document.getElementById('assetsContainer').innerHTML = \`
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-coins text-4xl mb-4"></i>
                            <p>\u6682\u65E0\u8D44\u4EA7\u8BB0\u5F55</p>
                            <p class="text-sm">\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0\u60A8\u7684\u7B2C\u4E00\u4E2A\u8D44\u4EA7</p>
                        </div>
                    \`;
                    return;
                }
                
                document.getElementById('assetsContainer').innerHTML = assets.map(asset => \`
                    <div class="bg-white rounded-lg p-4 shadow-sm mb-3 flex justify-between items-center">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-800">\${asset.name}</h4>
                            <p class="text-sm text-gray-500">\${asset.asset_type_name || '\u672A\u5206\u7C7B'}</p>
                            <p class="text-lg font-bold text-green-600">\uFFE5\${asset.current_value.toLocaleString()}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="editAsset(\${asset.id})" class="text-blue-500 hover:text-blue-700 p-2">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteAsset(\${asset.id})" class="text-red-500 hover:text-red-700 p-2">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                \`).join('');
                
            } catch (error) {
                console.error('Failed to load assets:', error);
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u5217\u8868\u5931\u8D25', 'error');
            }
        }
        
        // \u52A0\u8F7D\u8D1F\u503A\u5217\u8868
        async function loadLiabilities() {
            try {
                const liabilities = await apiClient.getLiabilities();
                
                if (liabilities.length === 0) {
                    document.getElementById('liabilitiesContainer').innerHTML = \`
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-credit-card text-4xl mb-4"></i>
                            <p>\u6682\u65E0\u8D1F\u503A\u8BB0\u5F55</p>
                            <p class="text-sm">\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0\u60A8\u7684\u7B2C\u4E00\u7B14\u8D1F\u503A</p>
                        </div>
                    \`;
                    return;
                }
                
                document.getElementById('liabilitiesContainer').innerHTML = liabilities.map(liability => \`
                    <div class="bg-white rounded-lg p-4 shadow-sm mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-800">\${liability.name}</h4>
                                <p class="text-sm text-gray-500">\${liability.type || '\u672A\u5206\u7C7B'}</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editLiability(\${liability.id})" class="text-blue-500 hover:text-blue-700 p-2">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteLiability(\${liability.id})" class="text-red-500 hover:text-red-700 p-2">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-gray-500">\u5269\u4F59\u91D1\u989D:</span>
                                <span class="font-bold text-red-600">\uFFE5\${liability.remaining_amount.toLocaleString()}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">\u5229\u7387:</span>
                                <span class="font-medium">\${(liability.interest_rate * 100).toFixed(2)}%</span>
                            </div>
                            \${liability.monthly_payment ? \`
                            <div>
                                <span class="text-gray-500">\u6708\u8FD8\u6B3E:</span>
                                <span class="font-medium">\uFFE5\${liability.monthly_payment.toLocaleString()}</span>
                            </div>
                            \` : ''}
                            \${liability.end_date ? \`
                            <div>
                                <span class="text-gray-500">\u5230\u671F\u65E5\u671F:</span>
                                <span class="font-medium">\${liability.end_date}</span>
                            </div>
                            \` : ''}
                        </div>
                    </div>
                \`).join('');
                
            } catch (error) {
                console.error('Failed to load liabilities:', error);
                showToast('\u52A0\u8F7D\u8D1F\u503A\u5217\u8868\u5931\u8D25', 'error');
            }
        }
        
        // \u52A0\u8F7D\u8D44\u91D1\u6D41\u5165
        async function loadCashFlow() {
            try {
                // \u521D\u59CB\u5316\u9009\u9879\u5361\u4E8B\u4EF6
                initializeCashFlowTabs();
                
                // \u52A0\u8F7D\u9884\u671F\u6536\u652F\u6570\u636E
                await loadPlannedCashFlow();
                
            } catch (error) {
                console.error('Failed to load cash flow:', error);
                showToast('\u52A0\u8F7D\u8D44\u91D1\u6D41\u5931\u8D25', 'error');
            }
        }
        
        // \u521D\u59CB\u5316\u73B0\u91D1\u6D41\u9009\u9879\u5361
        function initializeCashFlowTabs() {
            const plannedTab = document.getElementById('plannedFlowTab');
            const historicalTab = document.getElementById('historicalFlowTab');
            const plannedContent = document.getElementById('plannedFlowContent');
            const historicalContent = document.getElementById('historicalFlowContent');
            
            // \u9009\u9879\u5361\u5207\u6362\u4E8B\u4EF6
            plannedTab.addEventListener('click', () => {
                plannedTab.classList.add('active');
                historicalTab.classList.remove('active');
                plannedContent.classList.remove('hidden');
                historicalContent.classList.add('hidden');
                loadPlannedCashFlow();
            });
            
            historicalTab.addEventListener('click', () => {
                historicalTab.classList.add('active');
                plannedTab.classList.remove('active');
                historicalContent.classList.remove('hidden');
                plannedContent.classList.add('hidden');
                loadHistoricalCashFlow();
            });
        }
        
        // \u52A0\u8F7D\u9884\u671F\u73B0\u91D1\u6D41
        async function loadPlannedCashFlow() {
            try {
                const cashFlows = await apiClient.getCashFlows();
                
                if (cashFlows.length === 0) {
                    document.getElementById('cashFlowContainer').innerHTML = \`
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-chart-line text-4xl mb-4"></i>
                            <p class="mb-4">\u8FD8\u6CA1\u6709\u6DFB\u52A0\u4EFB\u4F55\u8D44\u91D1\u6D41\u5165\u8BB0\u5F55</p>
                            <button onclick="document.getElementById('addCashFlowBtn').click()" class="bg-purple-500 text-white px-6 py-3 rounded-lg">
                                <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u7B2C\u4E00\u6761\u8BB0\u5F55
                            </button>
                        </div>
                    \`;
                    return;
                }
                
                // \u6309\u7C7B\u578B\u5206\u7EC4
                const groupedFlows = {
                    'one_time_income': [],
                    'one_time_expense': [],
                    'recurring_income': [],
                    'recurring_expense': []
                };
                
                cashFlows.forEach(flow => {
                    const key = flow.is_recurring ? 
                        (flow.type === 'income' ? 'recurring_income' : 'recurring_expense') :
                        (flow.type === 'income' ? 'one_time_income' : 'one_time_expense');
                    groupedFlows[key].push(flow);
                });
                
                document.getElementById('cashFlowContainer').innerHTML = \`
                    <div class="space-y-6">
                        <!-- \u9884\u671F\u6536\u5165 -->
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                            <h3 class="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                                <i class="fas fa-sync mr-2"></i>\u9884\u671F\u6536\u5165 (\${groupedFlows.recurring_income.length}\u9879)
                                <span class="text-sm text-gray-500 ml-2">\u6BD4\u5982\u5DE5\u8D44</span>
                            </h3>
                            <div class="space-y-2">
                                \${groupedFlows.recurring_income.map(flow => renderCashFlowItem(flow)).join('')}
                                \${groupedFlows.recurring_income.length === 0 ? '<p class="text-gray-500 text-sm">\u6682\u65E0\u8BB0\u5F55</p>' : ''}
                            </div>
                        </div>
                        
                        <!-- \u9884\u671F\u652F\u51FA -->
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                            <h3 class="text-lg font-semibold text-orange-600 mb-3 flex items-center">
                                <i class="fas fa-calendar-alt mr-2"></i>\u9884\u671F\u652F\u51FA (\${groupedFlows.recurring_expense.length}\u9879)
                                <span class="text-sm text-gray-500 ml-2">\u6BD4\u5982\u623F\u8D37</span>
                            </h3>
                            <div class="space-y-2">
                                \${groupedFlows.recurring_expense.map(flow => renderCashFlowItem(flow)).join('')}
                                \${groupedFlows.recurring_expense.length === 0 ? '<p class="text-gray-500 text-sm">\u6682\u65E0\u8BB0\u5F55</p>' : ''}
                            </div>
                        </div>
                        
                        <!-- \u4E00\u6B21\u6027\u6536\u5165 -->
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                            <h3 class="text-lg font-semibold text-green-600 mb-3 flex items-center">
                                <i class="fas fa-arrow-up mr-2"></i>\u4E00\u6B21\u6027\u6536\u5165 (\${groupedFlows.one_time_income.length}\u9879)
                            </h3>
                            <div class="space-y-2">
                                \${groupedFlows.one_time_income.map(flow => renderCashFlowItem(flow)).join('')}
                                \${groupedFlows.one_time_income.length === 0 ? '<p class="text-gray-500 text-sm">\u6682\u65E0\u8BB0\u5F55</p>' : ''}
                            </div>
                        </div>
                        
                        <!-- \u4E00\u6B21\u6027\u652F\u51FA -->
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                            <h3 class="text-lg font-semibold text-red-600 mb-3 flex items-center">
                                <i class="fas fa-arrow-down mr-2"></i>\u4E00\u6B21\u6027\u652F\u51FA (\${groupedFlows.one_time_expense.length}\u9879)
                            </h3>
                            <div class="space-y-2">
                                \${groupedFlows.one_time_expense.map(flow => renderCashFlowItem(flow)).join('')}
                                \${groupedFlows.one_time_expense.length === 0 ? '<p class="text-gray-500 text-sm">\u6682\u65E0\u8BB0\u5F55</p>' : ''}
                            </div>
                        </div>
                    </div>
                \`;
            } catch (error) {
                console.error('Failed to load cash flows:', error);
                showToast('\u52A0\u8F7D\u8D44\u91D1\u6D41\u5165\u5931\u8D25', 'error');
            }
        }
        
        // \u6E32\u67D3\u8D44\u91D1\u6D41\u5165\u9879\u76EE
        function renderCashFlowItem(flow) {
            const isIncome = flow.type === 'income';
            const colorClass = isIncome ? 'text-green-600' : 'text-red-600';
            const iconClass = isIncome ? 'fa-plus-circle' : 'fa-minus-circle';
            const recurringText = flow.is_recurring ? \`(\u6BCF\${getRecurringText(flow.recurring_type)})\` : '';
            
            return \`
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas \${iconClass} \${colorClass} mr-3"></i>
                        <div>
                            <h4 class="font-medium text-gray-800">\${flow.description}</h4>
                            <p class="text-sm text-gray-500">
                                \${flow.date} \${recurringText}
                                \${flow.category ? \` \xB7 \${flow.category}\` : ''}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <span class="font-bold \${colorClass} mr-2">
                            \${isIncome ? '+' : '-'}\uFFE5\${Math.abs(flow.amount).toLocaleString()}
                        </span>
                        <button onclick="editCashFlow(\${flow.id})" class="text-gray-400 hover:text-blue-500 p-1 mr-1">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="deleteCashFlow(\${flow.id})" class="text-gray-400 hover:text-red-500 p-1">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
            \`;
        }
        
        // \u83B7\u53D6\u5B9A\u671F\u7C7B\u578B\u6587\u672C
        function getRecurringText(type) {
            const texts = {
                'daily': '\u5929',
                'weekly': '\u5468',
                'monthly': '\u6708',
                'quarterly': '\u5B63\u5EA6',
                'yearly': '\u5E74'
            };
            return texts[type] || type;
        }
        
        // \u5168\u5C40\u5386\u53F2\u73B0\u91D1\u6D41\u56FE\u8868\u5B9E\u4F8B
        let historicalFlowChartInstance = null;
        
        // \u52A0\u8F7D\u5386\u53F2\u73B0\u91D1\u6D41\u6570\u636E
        async function loadHistoricalCashFlow() {
            try {
                const [historyData, monthlyData] = await Promise.all([
                    apiClient.getCashFlowHistory(),
                    apiClient.getHistoricalMonthlyFlow()
                ]);
                
                // \u6E32\u67D3\u5386\u53F2\u73B0\u91D1\u6D41\u56FE\u8868
                renderHistoricalFlowChart(monthlyData);
                
                // \u6E32\u67D3\u5386\u53F2\u8BB0\u5F55\u5217\u8868
                renderHistoricalFlowList(historyData);
                
            } catch (error) {
                console.error('Failed to load historical cash flow:', error);
                showToast('\u52A0\u8F7D\u5386\u53F2\u6570\u636E\u5931\u8D25', 'error');
            }
        }
        
        // \u6E32\u67D3\u5386\u53F2\u73B0\u91D1\u6D41\u56FE\u8868
        function renderHistoricalFlowChart(data) {
            const ctx = document.getElementById('historicalFlowChart');
            if (!ctx) return;
            
            // \u9500\u6BC1\u65E7\u7684\u56FE\u8868\u5B9E\u4F8B
            if (historicalFlowChartInstance) {
                historicalFlowChartInstance.destroy();
            }
            
            // \u6570\u636E\u5904\u7406
            const months = [...new Set(data.map(item => item.month))].sort().slice(-12);
            const incomeData = months.map(month => {
                const item = data.find(d => d.month === month && d.type === 'income');
                return item ? item.total_amount : 0;
            });
            const expenseData = months.map(month => {
                const item = data.find(d => d.month === month && d.type === 'expense');
                return item ? item.total_amount : 0;
            });
            
            historicalFlowChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months.map(m => m.substring(5)), // \u53EA\u663E\u793A\u6708\u4EFD
                    datasets: [{
                        label: '\u5B9E\u9645\u6536\u5165',
                        data: incomeData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '\u5B9E\u9645\u652F\u51FA',
                        data: expenseData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '\uFFE5' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': \uFFE5' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // \u6E32\u67D3\u5386\u53F2\u8BB0\u5F55\u5217\u8868
        function renderHistoricalFlowList(data) {
            const container = document.getElementById('historicalFlowList');
            if (!container) return;
            
            if (data.length === 0) {
                container.innerHTML = \`
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-history text-4xl mb-4"></i>
                        <p>\u6682\u65E0\u5386\u53F2\u8BB0\u5F55</p>
                    </div>
                \`;
                return;
            }
            
            // \u6309\u6708\u4EFD\u5206\u7EC4
            const groupedData = data.reduce((acc, item) => {
                const month = item.actual_date.substring(0, 7);
                if (!acc[month]) acc[month] = [];
                acc[month].push(item);
                return acc;
            }, {});
            
            container.innerHTML = Object.entries(groupedData)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6) // \u53EA\u663E\u793A\u6700\u8FD16\u4E2A\u6708
                .map(([month, items]) => \`
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                            <i class="fas fa-calendar mr-2 text-blue-500"></i>
                            \${month} (\${items.length}\u7B14)
                        </h4>
                        <div class="space-y-2">
                            \${items.map(item => renderHistoricalFlowItem(item)).join('')}
                        </div>
                    </div>
                \`).join('');
        }
        
        // \u6E32\u67D3\u5386\u53F2\u73B0\u91D1\u6D41\u9879\u76EE
        function renderHistoricalFlowItem(item) {
            const isIncome = item.type === 'income';
            const colorClass = isIncome ? 'text-green-600' : 'text-red-600';
            const iconClass = isIncome ? 'fa-plus-circle' : 'fa-minus-circle';
            
            return \`
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas \${iconClass} \${colorClass} mr-3"></i>
                        <div>
                            <h5 class="font-medium text-gray-800">\${item.description}</h5>
                            <p class="text-sm text-gray-500">
                                \${item.actual_date}
                                \${item.category ? \` \xB7 \${item.category}\` : ''}
                            </p>
                        </div>
                    </div>
                    <span class="font-bold \${colorClass}">
                        \${isIncome ? '+' : '-'}\uFFE5\${Math.abs(item.amount).toLocaleString()}
                    </span>
                </div>
            \`;
        }
        
        // \u52A0\u8F7D\u8D1F\u503A\u5217\u8868
        async function loadLiabilities() {
            try {
                const liabilities = await apiClient.getLiabilities();
                
                if (liabilities.length === 0) {
                    document.getElementById('liabilitiesContainer').innerHTML = \`
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-credit-card text-4xl mb-4"></i>
                            <p>\u6682\u65E0\u8D1F\u503A\u8BB0\u5F55</p>
                            <p class="text-sm">\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0\u60A8\u7684\u7B2C\u4E00\u7B14\u8D1F\u503A</p>
                        </div>
                    \`;
                    return;
                }
                
                // \u6309\u7C7B\u578B\u5206\u7EC4
                const groupedLiabilities = liabilities.reduce((acc, liability) => {
                    const type = liability.liability_type || '\u5176\u4ED6';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(liability);
                    return acc;
                }, {});
                
                document.getElementById('liabilitiesContainer').innerHTML = Object.entries(groupedLiabilities).map(([type, items]) => \`
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-credit-card mr-2 text-red-500"></i>
                            \${type} (\${items.length}\u9879)
                        </h3>
                        <div class="space-y-3">
                            \${items.map(liability => \`
                                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-gray-800 mb-2">\${liability.description}</h4>
                                            <div class="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span class="text-gray-500">\u603B\u91D1\u989D\uFF1A</span>
                                                    <span class="font-medium text-red-600">\uFFE5\${liability.total_amount.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">\u5269\u4F59\u91D1\u989D\uFF1A</span>
                                                    <span class="font-medium text-red-600">\uFFE5\${liability.remaining_amount.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">\u6708\u4F9B\uFF1A</span>
                                                    <span class="font-medium">\uFFE5\${liability.monthly_payment.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">\u5229\u7387\uFF1A</span>
                                                    <span class="font-medium">\${liability.interest_rate}%</span>
                                                </div>
                                                \${liability.start_date ? \`
                                                <div>
                                                    <span class="text-gray-500">\u5F00\u59CB\u65E5\u671F\uFF1A</span>
                                                    <span class="font-medium">\${liability.start_date}</span>
                                                </div>
                                                \` : ''}
                                                \${liability.end_date ? \`
                                                <div>
                                                    <span class="text-gray-500">\u7ED3\u675F\u65E5\u671F\uFF1A</span>
                                                    <span class="font-medium text-orange-600">\${liability.end_date}</span>
                                                </div>
                                                \` : ''}
                                            </div>
                                        </div>
                                        <div class="flex flex-col space-y-2 ml-4">
                                            <button onclick="editLiability(\${liability.id})" class="text-blue-500 hover:text-blue-600 p-2">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="deleteLiability(\${liability.id})" class="text-red-500 hover:text-red-600 p-2">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('');
                
            } catch (error) {
                console.error('Failed to load liabilities:', error);
                showToast('\u52A0\u8F7D\u8D1F\u503A\u5217\u8868\u5931\u8D25', 'error');
            }
        }
        
        // \u5220\u9664\u8D1F\u503A
        async function deleteLiability(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D1F\u503A\u5417\uFF1F')) return;
            
            try {
                await apiClient.deleteLiability(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadLiabilities();
                loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u5DE5\u5177\u51FD\u6570
        function getCategoryName(category) {
            const names = {
                'fixed': '\u56FA\u5B9A\u8D44\u4EA7',
                'liquid': '\u6D41\u52A8\u8D44\u4EA7', 
                'consumer': '\u6D88\u8D39\u54C1'
            };
            return names[category] || category;
        }
        
        function getCategoryIcon(category) {
            const icons = {
                'fixed': 'fa-building',
                'liquid': 'fa-tint',
                'consumer': 'fa-shopping-cart'
            };
            return icons[category] || 'fa-tag';
        }
        
        // \u6E32\u67D3\u8D44\u4EA7\u5206\u5E03\u9965\u56FE
        function renderAssetsChart(assetsData) {
            const ctx = document.getElementById('assetsChart');
            if (!ctx || assetsData.length === 0) {
                if (ctx) {
                    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
                    const context = ctx.getContext('2d');
                    context.font = '16px Arial';
                    context.fillStyle = '#9CA3AF';
                    context.textAlign = 'center';
                    context.fillText('\u6682\u65E0\u8D44\u4EA7\u6570\u636E', ctx.width/2, ctx.height/2);
                }
                return;
            }
            
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: assetsData.map(item => getCategoryName(item.category)),
                    datasets: [{
                        data: assetsData.map(item => item.total_value),
                        backgroundColor: [
                            '#3B82F6', // \u84DD\u8272
                            '#10B981', // \u7EFF\u8272
                            '#F59E0B', // \u9EC4\u8272
                            '#EF4444', // \u7EA2\u8272
                            '#8B5CF6', // \u7D2B\u8272
                            '#06B6D4', // \u9752\u8272
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return \`\${context.label}: \uFFE5\${value.toLocaleString()} (\${percentage}%)\`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // \u6E32\u67D3\u8D1F\u503A\u5206\u5E03\u9965\u56FE
        function renderLiabilitiesChart(liabilitiesData) {
            const ctx = document.getElementById('liabilitiesChart');
            if (!ctx || liabilitiesData.length === 0) {
                if (ctx) {
                    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
                    const context = ctx.getContext('2d');
                    context.font = '16px Arial';
                    context.fillStyle = '#9CA3AF';
                    context.textAlign = 'center';
                    context.fillText('\u6682\u65E0\u8D1F\u503A\u6570\u636E', ctx.width/2, ctx.height/2);
                }
                return;
            }
            
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: liabilitiesData.map(item => item.liability_type),
                    datasets: [{
                        data: liabilitiesData.map(item => item.total_amount),
                        backgroundColor: [
                            '#EF4444', // \u7EA2\u8272
                            '#F59E0B', // \u9EC4\u8272
                            '#8B5CF6', // \u7D2B\u8272
                            '#06B6D4', // \u9752\u8272
                            '#10B981', // \u7EFF\u8272
                            '#3B82F6', // \u84DD\u8272
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return \`\${context.label}: \uFFE5\${value.toLocaleString()} (\${percentage}%)\`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // \u5220\u9664\u8D44\u4EA7\u7C7B\u578B
        async function deleteAssetType(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D44\u4EA7\u7C7B\u578B\u5417\uFF1F')) return;
            
            try {
                await apiClient.deleteAssetType(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadAssetTypes();
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u5220\u9664\u8D44\u4EA7
        async function deleteAsset(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D44\u4EA7\u5417\uFF1F')) return;
            
            try {
                await apiClient.deleteAsset(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadAssets();
                loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u7F16\u8F91\u8D44\u91D1\u6D41\u5165\u8BB0\u5F55
        async function editCashFlow(id) {
            try {
                const cashFlows = await apiClient.getCashFlows();
                const flow = cashFlows.find(f => f.id === id);
                if (!flow) {
                    showToast('\u8BB0\u5F55\u4E0D\u5B58\u5728', 'error');
                    return;
                }
                
                showModal(\`
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">\u7F16\u8F91\u8D44\u91D1\u6D41\u5165\u8BB0\u5F55</h3>
                            <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="editCashFlowForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u7C7B\u578B</label>
                                <select name="type" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="income" \${flow.type === 'income' ? 'selected' : ''}>\u6536\u5165</option>
                                    <option value="expense" \${flow.type === 'expense' ? 'selected' : ''}>\u652F\u51FA</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                                <input type="text" name="description" required value="\${flow.description}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u91D1\u989D (\uFFE5)</label>
                                <input type="number" name="amount" required min="0" step="0.01" value="\${flow.amount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u65E5\u671F</label>
                                <input type="date" name="date" required value="\${flow.date}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u5206\u7C7B</label>
                                <input type="text" name="category" value="\${flow.category || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" name="is_recurring" \${flow.is_recurring ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-gray-700">\u5B9A\u671F\u91CD\u590D</span>
                                </label>
                            </div>
                            <div id="editRecurringOptions" class="\${flow.is_recurring ? '' : 'hidden'}">
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u91CD\u590D\u9891\u7387</label>
                                <select name="recurring_type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="daily" \${flow.recurring_type === 'daily' ? 'selected' : ''}>\u6BCF\u5929</option>
                                    <option value="weekly" \${flow.recurring_type === 'weekly' ? 'selected' : ''}>\u6BCF\u5468</option>
                                    <option value="monthly" \${flow.recurring_type === 'monthly' ? 'selected' : ''}>\u6BCF\u6708</option>
                                    <option value="quarterly" \${flow.recurring_type === 'quarterly' ? 'selected' : ''}>\u6BCF\u5B63\u5EA6</option>
                                    <option value="yearly" \${flow.recurring_type === 'yearly' ? 'selected' : ''}>\u6BCF\u5E74</option>
                                </select>
                            </div>
                            <div class="flex space-x-3 pt-4">
                                <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                                <button type="submit" class="flex-1 py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600">\u4FDD\u5B58</button>
                            </div>
                        </form>
                    </div>
                \`);
                
                // \u5B9A\u671F\u9009\u9879\u5207\u6362
                document.querySelector('#editCashFlowForm input[name="is_recurring"]').addEventListener('change', (e) => {
                    document.getElementById('editRecurringOptions').classList.toggle('hidden', !e.target.checked);
                });
                
                // \u8868\u5355\u63D0\u4EA4
                document.getElementById('editCashFlowForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        type: formData.get('type'),
                        description: formData.get('description'),
                        amount: parseFloat(formData.get('amount')),
                        date: formData.get('date'),
                        category: formData.get('category') || null,
                        is_recurring: formData.get('is_recurring') ? 1 : 0,
                        recurring_type: formData.get('is_recurring') ? formData.get('recurring_type') : null
                    };
                    
                    try {
                        await apiClient.updateCashFlow(id, data);
                        hideModal();
                        showToast('\u4FEE\u6539\u6210\u529F');
                        loadCashFlow();
                    } catch (error) {
                        showToast('\u4FEE\u6539\u5931\u8D25', 'error');
                    }
                });
            } catch (error) {
                showToast('\u52A0\u8F7D\u8BB0\u5F55\u5931\u8D25', 'error');
            }
        }
        
        // \u5220\u9664\u8D44\u91D1\u6D41\u5165\u8BB0\u5F55
        async function deleteCashFlow(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\u5417\uFF1F')) return;
            
            try {
                await apiClient.deleteCashFlow(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadCashFlow();
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u663E\u793A\u6DFB\u52A0\u8D1F\u503A\u6A21\u6001\u6846
        function showAddLiabilityModal() {
            showModal(\`
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">\u6DFB\u52A0\u8D1F\u503A</h3>
                        <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addLiabilityForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u8D1F\u503A\u7C7B\u578B</label>
                            <select name="liability_type" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                <option value="">\u8BF7\u9009\u62E9\u8D1F\u503A\u7C7B\u578B</option>
                                <option value="\u623F\u8D37">\u623F\u8D37</option>
                                <option value="\u8F66\u8D37">\u8F66\u8D37</option>
                                <option value="\u4FE1\u7528\u5361">\u4FE1\u7528\u5361</option>
                                <option value="\u4E2A\u4EBA\u501F\u6B3E">\u4E2A\u4EBA\u501F\u6B3E</option>
                                <option value="\u5176\u4ED6">\u5176\u4ED6</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                            <input type="text" name="description" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u603B\u91D1\u989D</label>
                            <input type="number" name="total_amount" required min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5269\u4F59\u91D1\u989D</label>
                            <input type="number" name="remaining_amount" required min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u6708\u4F9B</label>
                            <input type="number" name="monthly_payment" required min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5229\u7387 (%)</label>
                            <input type="number" name="interest_rate" required min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5F00\u59CB\u65E5\u671F</label>
                            <input type="date" name="start_date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u7ED3\u675F\u65E5\u671F</label>
                            <input type="date" name="end_date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                            <button type="submit" class="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">\u6DFB\u52A0</button>
                        </div>
                    </form>
                </div>
            \`);
            
            document.getElementById('addLiabilityForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    liability_type: formData.get('liability_type'),
                    description: formData.get('description'),
                    total_amount: parseFloat(formData.get('total_amount')),
                    remaining_amount: parseFloat(formData.get('remaining_amount')),
                    monthly_payment: parseFloat(formData.get('monthly_payment')),
                    interest_rate: parseFloat(formData.get('interest_rate')),
                    start_date: formData.get('start_date') || null,
                    end_date: formData.get('end_date') || null
                };
                
                try {
                    await apiClient.createLiability(data);
                    hideModal();
                    showToast('\u6DFB\u52A0\u6210\u529F');
                    loadLiabilities();
                    loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
                } catch (error) {
                    showToast('\u6DFB\u52A0\u5931\u8D25', 'error');
                }
            });
        }
        
        // \u5220\u9664\u8D44\u4EA7
        async function deleteAsset(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D44\u4EA7\u5417\uFF1F')) return;
            
            try {
                await apiClient.deleteAsset(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadAssets();
                loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u5220\u9664\u8D1F\u503A
        async function deleteLiability(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D1F\u503A\u5417\uFF1F')) return;
            
            try {
                await apiClient.deleteLiability(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadLiabilities();
                loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u7F16\u8F91\u8D44\u4EA7
        async function editAsset(id) {
            try {
                const assets = await apiClient.getAssets();
                const asset = assets.find(a => a.id === id);
                if (!asset) {
                    showToast('\u8D44\u4EA7\u4E0D\u5B58\u5728', 'error');
                    return;
                }
                
                const assetTypes = await apiClient.getAssetTypes();
                
                showModal(\`
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">\u7F16\u8F91\u8D44\u4EA7</h3>
                            <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="editAssetForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u8D44\u4EA7\u540D\u79F0</label>
                                <input type="text" name="name" required value="\${asset.name}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u8D44\u4EA7\u7C7B\u578B</label>
                                <select name="asset_type_id" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">\u8BF7\u9009\u62E9\u8D44\u4EA7\u7C7B\u578B</option>
                                    \${assetTypes.map(type => \`
                                        <option value="\${type.id}" \${type.id === asset.asset_type_id ? 'selected' : ''}>
                                            \${type.name} (\${getCategoryName(type.category)})
                                        </option>
                                    \`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u5F53\u524D\u4EF7\u503C</label>
                                <input type="number" name="current_value" required min="0" step="0.01" value="\${asset.current_value}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u8D2D\u4E70\u4EF7\u503C</label>
                                <input type="number" name="purchase_value" required min="0" step="0.01" value="\${asset.purchase_value}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u8D2D\u4E70\u65E5\u671F</label>
                                <input type="date" name="purchase_date" required value="\${asset.purchase_date}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u9884\u671F\u6536\u76CA\u7387 (%)</label>
                                <input type="number" name="expected_return_rate" min="0" step="0.01" value="\${asset.expected_return_rate || 0}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                                <textarea name="description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">\${asset.description || ''}</textarea>
                            </div>
                            <div class="flex space-x-3 pt-4">
                                <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                                <button type="submit" class="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">\u4FDD\u5B58</button>
                            </div>
                        </form>
                    </div>
                \`);
                
                document.getElementById('editAssetForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        name: formData.get('name'),
                        asset_type_id: parseInt(formData.get('asset_type_id')),
                        current_value: parseFloat(formData.get('current_value')),
                        purchase_value: parseFloat(formData.get('purchase_value')),
                        purchase_date: formData.get('purchase_date'),
                        expected_return_rate: parseFloat(formData.get('expected_return_rate')) || 0,
                        description: formData.get('description') || null
                    };
                    
                    try {
                        await apiClient.updateAsset(id, data);
                        hideModal();
                        showToast('\u4FEE\u6539\u6210\u529F');
                        loadAssets();
                        loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
                    } catch (error) {
                        showToast('\u4FEE\u6539\u5931\u8D25', 'error');
                    }
                });
                
            } catch (error) {
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u4FE1\u606F\u5931\u8D25', 'error');
            }
        }
        
        // \u7F16\u8F91\u8D1F\u503A
        async function editLiability(id) {
            try {
                const liabilities = await apiClient.getLiabilities();
                const liability = liabilities.find(l => l.id === id);
                if (!liability) {
                    showToast('\u8D1F\u503A\u4E0D\u5B58\u5728', 'error');
                    return;
                }
                
                showModal(\`
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">\u7F16\u8F91\u8D1F\u503A</h3>
                            <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="editLiabilityForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u8D1F\u503A\u7C7B\u578B</label>
                                <select name="liability_type" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                    <option value="">\u8BF7\u9009\u62E9\u8D1F\u503A\u7C7B\u578B</option>
                                    <option value="\u623F\u8D37" \${liability.liability_type === '\u623F\u8D37' ? 'selected' : ''}>\u623F\u8D37</option>
                                    <option value="\u8F66\u8D37" \${liability.liability_type === '\u8F66\u8D37' ? 'selected' : ''}>\u8F66\u8D37</option>
                                    <option value="\u4FE1\u7528\u5361" \${liability.liability_type === '\u4FE1\u7528\u5361' ? 'selected' : ''}>\u4FE1\u7528\u5361</option>
                                    <option value="\u4E2A\u4EBA\u501F\u6B3E" \${liability.liability_type === '\u4E2A\u4EBA\u501F\u6B3E' ? 'selected' : ''}>\u4E2A\u4EBA\u501F\u6B3E</option>
                                    <option value="\u5176\u4ED6" \${liability.liability_type === '\u5176\u4ED6' ? 'selected' : ''}>\u5176\u4ED6</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                                <input type="text" name="description" required value="\${liability.description}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u603B\u91D1\u989D</label>
                                <input type="number" name="total_amount" required min="0" step="0.01" value="\${liability.total_amount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u5269\u4F59\u91D1\u989D</label>
                                <input type="number" name="remaining_amount" required min="0" step="0.01" value="\${liability.remaining_amount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u6708\u4F9B</label>
                                <input type="number" name="monthly_payment" required min="0" step="0.01" value="\${liability.monthly_payment}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u5229\u7387 (%)</label>
                                <input type="number" name="interest_rate" required min="0" step="0.01" value="\${liability.interest_rate}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u5F00\u59CB\u65E5\u671F</label>
                                <input type="date" name="start_date" value="\${liability.start_date || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u7ED3\u675F\u65E5\u671F</label>
                                <input type="date" name="end_date" value="\${liability.end_date || ''}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                            <div class="flex space-x-3 pt-4">
                                <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                                <button type="submit" class="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">\u4FDD\u5B58</button>
                            </div>
                        </form>
                    </div>
                \`);
                
                document.getElementById('editLiabilityForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        liability_type: formData.get('liability_type'),
                        description: formData.get('description'),
                        total_amount: parseFloat(formData.get('total_amount')),
                        remaining_amount: parseFloat(formData.get('remaining_amount')),
                        monthly_payment: parseFloat(formData.get('monthly_payment')),
                        interest_rate: parseFloat(formData.get('interest_rate')),
                        start_date: formData.get('start_date') || null,
                        end_date: formData.get('end_date') || null
                    };
                    
                    try {
                        await apiClient.updateLiability(id, data);
                        hideModal();
                        showToast('\u4FEE\u6539\u6210\u529F');
                        loadLiabilities();
                        loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
                    } catch (error) {
                        showToast('\u4FEE\u6539\u5931\u8D25', 'error');
                    }
                });
                
            } catch (error) {
                showToast('\u52A0\u8F7D\u8D1F\u503A\u4FE1\u606F\u5931\u8D25', 'error');
            }
        }
        
        // \u7F16\u8F91\u8D44\u4EA7\u7C7B\u578B
        async function editAssetType(id) {
            try {
                const assetTypes = await apiClient.getAssetTypes();
                const assetType = assetTypes.find(t => t.id === id);
                if (!assetType) {
                    showToast('\u8D44\u4EA7\u7C7B\u578B\u4E0D\u5B58\u5728', 'error');
                    return;
                }
                
                showModal(\`
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">\u7F16\u8F91\u8D44\u4EA7\u7C7B\u578B</h3>
                            <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="editAssetTypeForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u7C7B\u578B\u540D\u79F0</label>
                                <input type="text" name="name" required value="\${assetType.name}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u5206\u7C7B</label>
                                <select name="category" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                    <option value="">\u8BF7\u9009\u62E9\u5206\u7C7B</option>
                                    <option value="fixed" \${assetType.category === 'fixed' ? 'selected' : ''}>\u56FA\u5B9A\u8D44\u4EA7</option>
                                    <option value="liquid" \${assetType.category === 'liquid' ? 'selected' : ''}>\u6D41\u52A8\u8D44\u4EA7</option>
                                    <option value="consumer" \${assetType.category === 'consumer' ? 'selected' : ''}>\u6D88\u8D39\u54C1</option>
                                </select>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" name="has_depreciation" \${assetType.has_depreciation ? 'checked' : ''} class="mr-2">
                                    <span class="text-sm text-gray-700">\u6709\u6298\u65E7</span>
                                </label>
                            </div>
                            <div id="editDepreciationRate" class="\${assetType.has_depreciation ? '' : 'hidden'}">
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u6298\u65E7\u7387 (%)</label>
                                <input type="number" name="depreciation_rate" min="0" step="0.01" value="\${assetType.depreciation_rate || 0}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                                <textarea name="description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">\${assetType.description || ''}</textarea>
                            </div>
                            <div class="flex space-x-3 pt-4">
                                <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                                <button type="submit" class="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600">\u4FDD\u5B58</button>
                            </div>
                        </form>
                    </div>
                \`);
                
                // \u6298\u65E7\u9009\u9879\u5207\u6362
                document.querySelector('#editAssetTypeForm input[name="has_depreciation"]').addEventListener('change', (e) => {
                    document.getElementById('editDepreciationRate').classList.toggle('hidden', !e.target.checked);
                });
                
                document.getElementById('editAssetTypeForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        name: formData.get('name'),
                        category: formData.get('category'),
                        has_depreciation: formData.get('has_depreciation') ? 1 : 0,
                        depreciation_rate: formData.get('has_depreciation') ? parseFloat(formData.get('depreciation_rate')) || 0 : 0,
                        description: formData.get('description') || null
                    };
                    
                    try {
                        await apiClient.updateAssetType(id, data);
                        hideModal();
                        showToast('\u4FEE\u6539\u6210\u529F');
                        loadDashboardAssetTypes();
                        loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
                    } catch (error) {
                        showToast('\u4FEE\u6539\u5931\u8D25', 'error');
                    }
                });
                
            } catch (error) {
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u7C7B\u578B\u4FE1\u606F\u5931\u8D25', 'error');
            }
        }
        
        // \u663E\u793A\u8D44\u4EA7\u7C7B\u578B\u7BA1\u7406\u9875\u9762
        async function showAssetTypesManagement() {
            try {
                const assetTypes = await apiClient.getAssetTypes();
                
                const groupedTypes = assetTypes.reduce((acc, type) => {
                    if (!acc[type.category]) acc[type.category] = [];
                    acc[type.category].push(type);
                    return acc;
                }, {});
                
                showModal(\`
                    <div class="p-6 max-w-4xl">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">\u8D44\u4EA7\u7C7B\u578B\u7BA1\u7406</h3>
                            <div class="flex space-x-2">
                                <button onclick="showAddAssetTypeModal()" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                                    <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u7C7B\u578B
                                </button>
                                <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="space-y-6 max-h-96 overflow-y-auto">
                            \${Object.entries(groupedTypes).map(([category, types]) => \`
                                <div>
                                    <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
                                        <i class="fas \${getCategoryIcon(category)} mr-2 text-blue-500"></i>
                                        \${getCategoryName(category)} (\${types.length}\u9879)
                                    </h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        \${types.map(type => \`
                                            <div class="bg-gray-50 rounded-lg p-3 border">
                                                <div class="flex justify-between items-start">
                                                    <div class="flex-1">
                                                        <h5 class="font-medium text-gray-800">\${type.name}</h5>
                                                        \${type.description ? \`<p class="text-gray-500 text-sm mt-1">\${type.description}</p>\` : ''}
                                                        \${type.has_depreciation ? \`<p class="text-orange-500 text-xs mt-1">\u6298\u65E7\u7387: \${type.depreciation_rate}%</p>\` : ''}
                                                    </div>
                                                    <div class="flex space-x-1 ml-2">
                                                        <button onclick="editAssetType(\${type.id})" class="text-blue-500 hover:text-blue-600 p-1">
                                                            <i class="fas fa-edit text-sm"></i>
                                                        </button>
                                                        <button onclick="deleteAssetType(\${type.id})" class="text-red-500 hover:text-red-600 p-1">
                                                            <i class="fas fa-trash text-sm"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        \`).join('')}
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`);
                
            } catch (error) {
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u7C7B\u578B\u5931\u8D25', 'error');
            }
        }
        
        // \u5220\u9664\u8D44\u4EA7\u7C7B\u578B
        async function deleteAssetType(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D44\u4EA7\u7C7B\u578B\u5417\uFF1F\u6CE8\u610F\uFF1A\u5220\u9664\u540E\u4F7F\u7528\u8BE5\u7C7B\u578B\u7684\u8D44\u4EA7\u5C06\u663E\u793A\u4E3A\u672A\u5206\u7C7B\u3002')) return;
            
            try {
                await apiClient.deleteAssetType(id);
                showToast('\u5220\u9664\u6210\u529F');
                showAssetTypesManagement(); // \u5237\u65B0\u7BA1\u7406\u9875\u9762
                loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        // \u663E\u793A\u6DFB\u52A0\u8D44\u4EA7\u7C7B\u578B\u6A21\u6001\u6846
        function showAddAssetTypeModal() {
            showModal(\`
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">\u6DFB\u52A0\u8D44\u4EA7\u7C7B\u578B</h3>
                        <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addAssetTypeForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u7C7B\u578B\u540D\u79F0</label>
                            <input type="text" name="name" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5206\u7C7B</label>
                            <select name="category" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                <option value="">\u8BF7\u9009\u62E9\u5206\u7C7B</option>
                                <option value="fixed">\u56FA\u5B9A\u8D44\u4EA7</option>
                                <option value="liquid">\u6D41\u52A8\u8D44\u4EA7</option>
                                <option value="consumer">\u6D88\u8D39\u54C1</option>
                            </select>
                        </div>
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="has_depreciation" class="mr-2">
                                <span class="text-sm text-gray-700">\u6709\u6298\u65E7</span>
                            </label>
                        </div>
                        <div id="addDepreciationRate" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u6298\u65E7\u7387 (%)</label>
                            <input type="number" name="depreciation_rate" min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                            <textarea name="description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                            <button type="submit" class="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600">\u6DFB\u52A0</button>
                        </div>
                    </form>
                </div>
            \`);
            
            // \u6298\u65E7\u9009\u9879\u5207\u6362
            document.querySelector('#addAssetTypeForm input[name="has_depreciation"]').addEventListener('change', (e) => {
                document.getElementById('addDepreciationRate').classList.toggle('hidden', !e.target.checked);
            });
            
            document.getElementById('addAssetTypeForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    name: formData.get('name'),
                    category: formData.get('category'),
                    has_depreciation: formData.get('has_depreciation') ? 1 : 0,
                    depreciation_rate: formData.get('has_depreciation') ? parseFloat(formData.get('depreciation_rate')) || 0 : 0,
                    description: formData.get('description') || null
                };
                
                try {
                    await apiClient.createAssetType(data);
                    hideModal();
                    showToast('\u6DFB\u52A0\u6210\u529F');
                    showAssetTypesManagement(); // \u5237\u65B0\u7BA1\u7406\u9875\u9762
                    loadDashboard(); // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
                } catch (error) {
                    showToast('\u6DFB\u52A0\u5931\u8D25', 'error');
                }
            });
        }
        
        // \u4E8B\u4EF6\u76D1\u542C\u5668
        document.addEventListener('DOMContentLoaded', () => {
            // \u5BFC\u822A\u6309\u94AE
            document.getElementById('dashboardBtn').addEventListener('click', () => showPage('dashboard'));
            document.getElementById('assetsBtn').addEventListener('click', () => showPage('assets'));
            document.getElementById('liabilitiesBtn').addEventListener('click', () => showPage('liabilities'));
            document.getElementById('cashFlowBtn').addEventListener('click', () => showPage('cashFlow'));
            
            // \u6DFB\u52A0\u6309\u94AE
            document.getElementById('addAssetBtn').addEventListener('click', showAddAssetModal);
            document.getElementById('addLiabilityBtn').addEventListener('click', showAddLiabilityModal);
            document.getElementById('addCashFlowBtn').addEventListener('click', showAddCashFlowModal);
            
            // \u6A21\u6001\u6846\u5173\u95ED
            document.getElementById('modal').addEventListener('click', (e) => {
                if (e.target.id === 'modal') hideModal();
            });
            
            // \u521D\u59CB\u5316
            loadDashboard();
        });
        
        // \u663E\u793A\u6DFB\u52A0\u8D44\u4EA7\u7C7B\u578B\u6A21\u6001\u6846
        function showAddTypeModal() {
            showModal(\`
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">\u6DFB\u52A0\u8D44\u4EA7\u7C7B\u578B</h3>
                        <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addTypeForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u7C7B\u578B\u540D\u79F0</label>
                            <input type="text" name="name" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5206\u7C7B</label>
                            <select name="category" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">\u8BF7\u9009\u62E9\u5206\u7C7B</option>
                                <option value="fixed">\u56FA\u5B9A\u8D44\u4EA7</option>
                                <option value="liquid">\u6D41\u52A8\u8D44\u4EA7</option>
                                <option value="consumer">\u6D88\u8D39\u54C1</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                            <textarea name="description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                        </div>
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="has_depreciation" class="mr-2">
                                <span class="text-sm text-gray-700">\u652F\u6301\u6298\u65E7</span>
                            </label>
                        </div>
                        <div id="depreciationRate" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5E74\u6298\u65E7\u7387 (%)</label>
                            <input type="number" name="depreciation_rate" min="0" max="100" step="0.1" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                            <button type="submit" class="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600">\u6DFB\u52A0</button>
                        </div>
                    </form>
                </div>
            \`);
            
            // \u6298\u65E7\u9009\u9879\u5207\u6362
            document.querySelector('input[name="has_depreciation"]').addEventListener('change', (e) => {
                document.getElementById('depreciationRate').classList.toggle('hidden', !e.target.checked);
            });
            
            // \u8868\u5355\u63D0\u4EA4
            document.getElementById('addTypeForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    name: formData.get('name'),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    has_depreciation: formData.get('has_depreciation') ? 1 : 0,
                    depreciation_rate: formData.get('has_depreciation') ? parseFloat(formData.get('depreciation_rate') || 0) / 100 : 0
                };
                
                try {
                    await apiClient.createAssetType(data);
                    hideModal();
                    showToast('\u6DFB\u52A0\u6210\u529F');
                    loadAssetTypes();
                } catch (error) {
                    showToast('\u6DFB\u52A0\u5931\u8D25', 'error');
                }
            });
        }
        
        // \u663E\u793A\u6DFB\u52A0\u8D44\u4EA7\u6A21\u6001\u6846
        async function showAddAssetModal() {
            // \u52A0\u8F7D\u8D44\u4EA7\u7C7B\u578B
            try {
                const types = await apiClient.getAssetTypes();
                if (types.length === 0) {
                    showToast('\u8BF7\u5148\u6DFB\u52A0\u8D44\u4EA7\u7C7B\u578B', 'error');
                    return;
                }
                assetTypes = types;
            } catch (error) {
                showToast('\u52A0\u8F7D\u8D44\u4EA7\u7C7B\u578B\u5931\u8D25', 'error');
                return;
            }
            
            showModal(\`
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">\u6DFB\u52A0\u8D44\u4EA7</h3>
                        <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addAssetForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u8D44\u4EA7\u540D\u79F0</label>
                            <input type="text" name="name" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u8D44\u4EA7\u7C7B\u578B</label>
                            <select name="asset_type_id" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">\u8BF7\u9009\u62E9\u8D44\u4EA7\u7C7B\u578B</option>
                                \${assetTypes.map(type => \`<option value="\${type.id}">\${type.name} (\${getCategoryName(type.category)})</option>\`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5F53\u524D\u4EF7\u503C (\uFFE5)</label>
                            <input type="number" name="current_value" required min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u8D2D\u4E70\u4EF7\u683C (\uFFE5)</label>
                            <input type="number" name="purchase_value" min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u8D2D\u4E70\u65E5\u671F</label>
                            <input type="date" name="purchase_date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                            <button type="submit" class="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">\u6DFB\u52A0</button>
                        </div>
                    </form>
                </div>
            \`);
            
            // \u8868\u5355\u63D0\u4EA4
            document.getElementById('addAssetForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    name: formData.get('name'),
                    asset_type_id: parseInt(formData.get('asset_type_id')),
                    current_value: parseFloat(formData.get('current_value')),
                    purchase_value: formData.get('purchase_value') ? parseFloat(formData.get('purchase_value')) : null,
                    purchase_date: formData.get('purchase_date') || null
                };
                
                try {
                    await apiClient.createAsset(data);
                    hideModal();
                    showToast('\u6DFB\u52A0\u6210\u529F');
                    loadAssets();
                } catch (error) {
                    showToast('\u6DFB\u52A0\u5931\u8D25', 'error');
                }
            });
        }
        
        // \u663E\u793A\u6DFB\u52A0\u8D44\u91D1\u6D41\u5165\u6A21\u6001\u6846
        function showAddCashFlowModal() {
            showModal(\`
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">\u6DFB\u52A0\u8D44\u91D1\u6D41\u5165\u8BB0\u5F55</h3>
                        <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="addCashFlowForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u7C7B\u578B</label>
                            <select name="type" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">\u8BF7\u9009\u62E9\u7C7B\u578B</option>
                                <option value="income">\u6536\u5165</option>
                                <option value="expense">\u652F\u51FA</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u63CF\u8FF0</label>
                            <input type="text" name="description" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="\u5982\uFF1A\u5DE5\u8D44\u3001\u623F\u8D37\u3001\u5956\u91D1\u7B49">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u91D1\u989D (\uFFE5)</label>
                            <input type="number" name="amount" required min="0" step="0.01" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u65E5\u671F</label>
                            <input type="date" name="date" required class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u5206\u7C7B</label>
                            <input type="text" name="category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="\u5982\uFF1A\u5DE5\u4F5C\u3001\u6295\u8D44\u3001\u751F\u6D3B\u7B49">
                        </div>
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="is_recurring" class="mr-2">
                                <span class="text-sm text-gray-700">\u5B9A\u671F\u91CD\u590D</span>
                            </label>
                        </div>
                        <div id="recurringOptions" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-1">\u91CD\u590D\u9891\u7387</label>
                            <select name="recurring_type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="daily">\u6BCF\u5929</option>
                                <option value="weekly">\u6BCF\u5468</option>
                                <option value="monthly">\u6BCF\u6708</option>
                                <option value="quarterly">\u6BCF\u5B63\u5EA6</option>
                                <option value="yearly">\u6BCF\u5E74</option>
                            </select>
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" onclick="hideModal()" class="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">\u53D6\u6D88</button>
                            <button type="submit" class="flex-1 py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600">\u6DFB\u52A0</button>
                        </div>
                    </form>
                </div>
            \`);
            
            // \u5B9A\u671F\u9009\u9879\u5207\u6362
            document.querySelector('input[name="is_recurring"]').addEventListener('change', (e) => {
                document.getElementById('recurringOptions').classList.toggle('hidden', !e.target.checked);
            });
            
            // \u8868\u5355\u63D0\u4EA4
            document.getElementById('addCashFlowForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    type: formData.get('type'),
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount')),
                    date: formData.get('date'),
                    category: formData.get('category') || null,
                    is_recurring: formData.get('is_recurring') ? 1 : 0,
                    recurring_type: formData.get('is_recurring') ? formData.get('recurring_type') : null
                };
                
                try {
                    await apiClient.createCashFlow(data);
                    hideModal();
                    showToast('\u6DFB\u52A0\u6210\u529F');
                    loadCashFlow();
                } catch (error) {
                    showToast('\u6DFB\u52A0\u5931\u8D25', 'error');
                }
            });
        }
        
        // \u8BBE\u7F6E\u9875\u9762\u529F\u80FD
        async function loadSettings() {
            try {
                // \u52A0\u8F7D\u7528\u6237\u4FE1\u606F
                const userInfo = await apiClient.getUserInfo();
                
                document.getElementById('usernameInput').value = userInfo.username || '';
                document.getElementById('phoneInput').value = userInfo.phone || '';
                document.getElementById('emailInput').value = userInfo.email || '';
                
                // \u7ED1\u5B9A\u4FDD\u5B58\u6309\u94AE\u4E8B\u4EF6
                document.getElementById('saveUserInfoBtn').addEventListener('click', saveUserInfo);
                
            } catch (error) {
                showToast('\u52A0\u8F7D\u8BBE\u7F6E\u5931\u8D25', 'error');
            }
        }
        
        // \u4FDD\u5B58\u7528\u6237\u4FE1\u606F
        async function saveUserInfo() {
            const username = document.getElementById('usernameInput').value.trim();
            const phone = document.getElementById('phoneInput').value.trim();
            const email = document.getElementById('emailInput').value.trim();
            
            if (!username) {
                showToast('\u7528\u6237\u540D\u4E0D\u80FD\u4E3A\u7A7A', 'error');
                return;
            }
            
            try {
                await apiClient.updateUserInfo({ username, phone, email });
                showToast('\u4FDD\u5B58\u6210\u529F');
                // \u5237\u65B0\u4EEA\u8868\u677F\u7684\u7528\u6237\u4FE1\u606F
                if (currentPage === 'dashboard') {
                    loadDashboard();
                }
            } catch (error) {
                showToast('\u4FDD\u5B58\u5931\u8D25', 'error');
            }
        }
        
        // \u8D1F\u503A\u64CD\u4F5C\u51FD\u6570
        async function deleteLiability(id) {
            if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D1F\u503A\u5417\uFF1F')) {
                return;
            }
            
            try {
                await apiClient.deleteLiability(id);
                showToast('\u5220\u9664\u6210\u529F');
                loadLiabilities();
                // \u5237\u65B0\u4EEA\u8868\u677F\u6570\u636E
                if (currentPage === 'dashboard') {
                    loadDashboard();
                }
            } catch (error) {
                showToast('\u5220\u9664\u5931\u8D25', 'error');
            }
        }
        
        async function editLiability(id) {
            // TODO: \u5B9E\u73B0\u8D1F\u503A\u7F16\u8F91\u529F\u80FD
            showToast('\u8D1F\u503A\u7F16\u8F91\u529F\u80FD\u5F85\u5B9E\u73B0', 'info');
        }
        
        // CSS\u6837\u5F0F
        const style = document.createElement('style');
        style.textContent = \`
            .nav-tab {
                background: transparent;
                color: #6b7280;
                transition: all 0.2s ease;
            }
            .nav-tab.active {
                background: #3b82f6;
                color: white;
            }
            .nav-tab:hover {
                background: #f3f4f6;
            }
            .nav-tab.active:hover {
                background: #2563eb;
            }
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* \u79FB\u52A8\u7AEF\u4F18\u5316 */
            @media (max-width: 640px) {
                .grid {
                    gap: 0.75rem;
                }
                .p-6 {
                    padding: 1rem;
                }
                .text-xl {
                    font-size: 1.125rem;
                }
                .text-2xl {
                    font-size: 1.25rem;
                }
            }
            
            /* Toast \u52A8\u753B */
            .translate-x-full {
                transform: translateX(100%);
            }
            
            /* \u6A21\u6001\u6846\u52A8\u753B */
            .modal-enter {
                animation: modalEnter 0.3s ease-out;
            }
            
            @keyframes modalEnter {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* \u6309\u94AE\u70B9\u51FB\u6548\u679C */
            .btn-press:active {
                transform: scale(0.98);
            }
        \`;
        document.head.appendChild(style);
        
        // \u9875\u9762\u521D\u59CB\u5316
        document.addEventListener('DOMContentLoaded', function() {
            // \u521D\u59CB\u5316\u83DC\u5355
            initializeMenu();
            
            // \u521D\u59CB\u5316\u5BFC\u822A\u6309\u94AE\u4E8B\u4EF6
            document.getElementById('dashboardBtn').addEventListener('click', () => showPage('dashboard'));
            document.getElementById('assetsBtn').addEventListener('click', () => showPage('assets'));
            document.getElementById('liabilitiesBtn').addEventListener('click', () => showPage('liabilities'));
            document.getElementById('cashFlowBtn').addEventListener('click', () => showPage('cashFlow'));
            
            // \u9ED8\u8BA4\u663E\u793A\u4EEA\u8868\u677F\u9875\u9762
            showPage('dashboard');
        });
    <\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
});
router.get("/assets/*", async (request) => {
  return new Response("Static asset not found", { status: 404 });
});
router.get("/src/*", async (request) => {
  return new Response("Static asset not found", { status: 404 });
});
router.get("/api/asset-types", async (request, env) => {
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM asset_types ORDER BY category, name
    `).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.post("/api/asset-types", async (request, env) => {
  try {
    const data = await request.json();
    const { name, category, has_depreciation, depreciation_rate, description } = data;
    const result = await env.DB.prepare(`
      INSERT INTO asset_types (name, category, has_depreciation, depreciation_rate, description)
      VALUES (?, ?, ?, ?, ?)
    `).bind(name, category, has_depreciation || false, depreciation_rate || 0, description || "").run();
    return new Response(JSON.stringify({ id: result.meta.last_row_id, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/assets", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT a.*, at.name as asset_type_name, at.category, at.has_depreciation, at.depreciation_rate
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.post("/api/assets", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const data = await request.json();
    const { asset_type_id, name, current_value, purchase_value, purchase_date, expected_return_rate, description } = data;
    const result = await env.DB.prepare(`
      INSERT INTO assets (user_id, asset_type_id, name, current_value, purchase_value, purchase_date, expected_return_rate, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, asset_type_id, name, current_value, purchase_value || null, purchase_date || null, expected_return_rate || 0, description || "").run();
    await env.DB.prepare(`
      INSERT INTO asset_value_history (user_id, asset_id, value, record_date)
      VALUES (?, ?, ?, DATE('now'))
    `).bind(userId, result.meta.last_row_id, current_value).run();
    return new Response(JSON.stringify({ id: result.meta.last_row_id, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.put("/api/assets/:id/value", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const assetId = request.params.id;
    const { current_value } = await request.json();
    await env.DB.prepare(`
      UPDATE assets SET current_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(current_value, assetId, userId).run();
    await env.DB.prepare(`
      INSERT INTO asset_value_history (user_id, asset_id, value, record_date)
      VALUES (?, ?, ?, DATE('now'))
    `).bind(userId, assetId, current_value).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.put("/api/assets/:id", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { id } = request.params;
    const data = await request.json();
    const { asset_type_id, name, current_value, purchase_value, purchase_date, expected_return_rate, description } = data;
    const result = await env.DB.prepare(`
      UPDATE assets 
      SET asset_type_id = ?, name = ?, current_value = ?, purchase_value = ?, purchase_date = ?, expected_return_rate = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(asset_type_id, name, current_value, purchase_value || null, purchase_date || null, expected_return_rate || 0, description || "", id, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Asset not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.put("/api/asset-types/:id", async (request, env) => {
  try {
    const { id } = request.params;
    const data = await request.json();
    const { name, category, has_depreciation, depreciation_rate, description } = data;
    const result = await env.DB.prepare(`
      UPDATE asset_types 
      SET name = ?, category = ?, has_depreciation = ?, depreciation_rate = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, category, has_depreciation || false, depreciation_rate || 0, description || "", id).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Asset type not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.delete("/api/asset-types/:id", async (request, env) => {
  try {
    const { id } = request.params;
    const result = await env.DB.prepare(`
      DELETE FROM asset_types WHERE id = ?
    `).bind(id).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Asset type not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.delete("/api/assets/:id", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { id } = request.params;
    await env.DB.prepare(`
      DELETE FROM asset_value_history WHERE asset_id = ? AND user_id = ?
    `).bind(id, userId).run();
    const result = await env.DB.prepare(`
      DELETE FROM assets WHERE id = ? AND user_id = ?
    `).bind(id, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Asset not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/liabilities", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT * FROM liabilities WHERE user_id = ? ORDER BY created_at DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.post("/api/liabilities", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const data = await request.json();
    const { liability_type, description, total_amount, remaining_amount, monthly_payment, interest_rate, start_date, end_date } = data;
    const result = await env.DB.prepare(`
      INSERT INTO liabilities (user_id, liability_type, description, total_amount, remaining_amount, monthly_payment, interest_rate, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, liability_type, description || "", total_amount, remaining_amount, monthly_payment, interest_rate || 0, start_date || null, end_date || null).run();
    return new Response(JSON.stringify({ id: result.meta.last_row_id, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.put("/api/liabilities/:id", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { id } = request.params;
    const data = await request.json();
    const { liability_type, description, total_amount, remaining_amount, monthly_payment, interest_rate, start_date, end_date } = data;
    const result = await env.DB.prepare(`
      UPDATE liabilities 
      SET liability_type = ?, description = ?, total_amount = ?, remaining_amount = ?, monthly_payment = ?, interest_rate = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(liability_type, description || "", total_amount, remaining_amount, monthly_payment, interest_rate || 0, start_date || null, end_date || null, id, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Liability not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.delete("/api/liabilities/:id", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { id } = request.params;
    const result = await env.DB.prepare(`
      DELETE FROM liabilities WHERE id = ? AND user_id = ?
    `).bind(id, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Liability not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/cash-flows", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    let query = "SELECT * FROM cash_flows WHERE user_id = ?";
    let params = [userId];
    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }
    query += " ORDER BY date DESC";
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.post("/api/cash-flows", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const data = await request.json();
    const { date, amount, type, category, description, is_recurring } = data;
    const result = await env.DB.prepare(`
      INSERT INTO cash_flows (user_id, date, amount, type, category, description, is_recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, date, amount, type, category, description || "", is_recurring || 0).run();
    return new Response(JSON.stringify({ id: result.meta.last_row_id, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.delete("/api/cash-flows/:id", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { id } = request.params;
    const result = await env.DB.prepare(`
      DELETE FROM cash_flows WHERE id = ? AND user_id = ?
    `).bind(id, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.put("/api/cash-flows/:id", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { id } = request.params;
    const data = await request.json();
    const { date, amount, type, category, description, is_recurring } = data;
    const result = await env.DB.prepare(`
      UPDATE cash_flows 
      SET date = ?, amount = ?, type = ?, category = ?, description = ?, is_recurring = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(date, amount, type, category, description || "", is_recurring || 0, id, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/dashboard/overview", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results: totalAssets } = await env.DB.prepare(`
      SELECT SUM(current_value) as total_value FROM assets WHERE user_id = ?
    `).bind(userId).all();
    const { results: totalLiabilities } = await env.DB.prepare(`
      SELECT SUM(remaining_amount) as total_debt FROM liabilities WHERE user_id = ?
    `).bind(userId).all();
    const { results: assetsByCategory } = await env.DB.prepare(`
      SELECT at.category, SUM(a.current_value) as total_value, COUNT(a.id) as count
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.user_id = ?
      GROUP BY at.category
    `).bind(userId).all();
    const { results: liabilitiesByType } = await env.DB.prepare(`
      SELECT liability_type, SUM(remaining_amount) as total_amount, COUNT(id) as count
      FROM liabilities
      WHERE user_id = ?
      GROUP BY liability_type
    `).bind(userId).all();
    const { results: monthlyFlow } = await env.DB.prepare(`
      SELECT 
        type,
        SUM(amount) as total_amount
      FROM cash_flows 
      WHERE user_id = ? AND date >= DATE('now', 'start of month')
      GROUP BY type
    `).bind(userId).all();
    const overview = {
      total_assets: totalAssets[0]?.total_value || 0,
      total_liabilities: totalLiabilities[0]?.total_debt || 0,
      net_worth: (totalAssets[0]?.total_value || 0) - (totalLiabilities[0]?.total_debt || 0),
      assets_by_category: assetsByCategory,
      liabilities_by_type: liabilitiesByType,
      monthly_cash_flow: monthlyFlow
    };
    return new Response(JSON.stringify(overview), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/balance-forecast", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const availableYears = await env.DB.prepare(`
      SELECT DISTINCT strftime('%Y', date) as year 
      FROM cash_flows 
      WHERE user_id = ? 
      UNION 
      SELECT DISTINCT strftime('%Y', actual_date) as year 
      FROM cash_flow_history 
      WHERE user_id = ?
      ORDER BY year DESC
    `).bind(userId, userId).all();
    const targetYear = availableYears.results.length > 0 ? availableYears.results[0].year : (/* @__PURE__ */ new Date()).getFullYear().toString();
    const { results: plannedFlow } = await env.DB.prepare(`
      SELECT 
        type as flow_type,
        SUM(amount) as total_amount
      FROM cash_flows 
      WHERE user_id = ? AND strftime('%Y', date) = ?
      GROUP BY type
    `).bind(userId, targetYear).all();
    const { results: actualFlow } = await env.DB.prepare(`
      SELECT 
        type as flow_type,
        SUM(amount) as total_amount
      FROM cash_flow_history 
      WHERE user_id = ? AND strftime('%Y', actual_date) = ?
      GROUP BY type
    `).bind(userId, targetYear).all();
    let plannedIncome = 0;
    let plannedExpense = 0;
    let actualIncome = 0;
    let actualExpense = 0;
    plannedFlow.forEach((flow) => {
      if (flow.flow_type === "income") {
        plannedIncome += flow.total_amount;
      } else if (flow.flow_type === "expense") {
        plannedExpense += flow.total_amount;
      }
    });
    actualFlow.forEach((flow) => {
      if (flow.flow_type === "income") {
        actualIncome += flow.total_amount;
      } else if (flow.flow_type === "expense") {
        actualExpense += flow.total_amount;
      }
    });
    const plannedNetFlow = plannedIncome - plannedExpense;
    const actualNetFlow = actualIncome - actualExpense;
    const status = actualNetFlow > 0 ? "\u76C8\u4F59" : actualNetFlow < 0 ? "\u4E8F\u635F" : "\u5E73\u8861";
    const forecast = {
      planned: {
        income: plannedIncome,
        expense: plannedExpense,
        balance: plannedNetFlow
      },
      actual: {
        income: actualIncome,
        expense: actualExpense,
        balance: actualNetFlow
      },
      comparison: {
        income_diff: actualIncome - plannedIncome,
        expense_diff: actualExpense - plannedExpense,
        balance_diff: actualNetFlow - plannedNetFlow
      },
      status
    };
    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/yearly-income-expense", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        strftime('%Y', date) as year,
        type as flow_type,
        SUM(amount) as total_amount
      FROM cash_flows 
      WHERE user_id = ?
      GROUP BY year, type
      ORDER BY year DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/monthly-income-expense", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const availableYears = await env.DB.prepare(`
      SELECT DISTINCT strftime('%Y', date) as year 
      FROM cash_flows 
      WHERE user_id = ? 
      UNION 
      SELECT DISTINCT strftime('%Y', actual_date) as year 
      FROM cash_flow_history 
      WHERE user_id = ?
      ORDER BY year DESC
    `).bind(userId, userId).all();
    const targetYear = availableYears.results.length > 0 ? availableYears.results[0].year : (/* @__PURE__ */ new Date()).getFullYear().toString();
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
    const { results: plannedData } = await env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        type as flow_type,
        SUM(amount) as total_amount,
        'planned' as data_type
      FROM cash_flows 
      WHERE user_id = ? AND strftime('%Y', date) = ?
      GROUP BY month, type
      ORDER BY month
    `).bind(userId, targetYear).all();
    const { results: actualData } = await env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', actual_date) as month,
        type as flow_type,
        SUM(amount) as total_amount,
        'actual' as data_type
      FROM cash_flow_history 
      WHERE user_id = ? AND strftime('%Y', actual_date) = ?
      GROUP BY month, type
      ORDER BY month
    `).bind(userId, targetYear).all();
    const combinedData = {
      planned: plannedData,
      actual: actualData,
      currentMonth
    };
    return new Response(JSON.stringify(combinedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/asset-returns", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        a.id,
        a.name as asset_name,
        at.name as asset_type,
        a.purchase_value as cost_price,
        a.current_value as current_price,
        a.purchase_date,
        CASE 
          WHEN LOWER(at.name) LIKE '%\u6C7D\u8F66%' OR LOWER(at.name) LIKE '%\u8F66%' THEN
            -- \u6C7D\u8F66\u6309\u7EBF\u6027\u6298\u65E7\u8BA1\u7B97\uFF08\u5047\u8BBE\u6BCF\u6708\u6298\u65E7\u7387\u4E3A2%\uFF09
            -1 * a.purchase_value * 0.02 * 
              CAST((julianday('now') - julianday(a.purchase_date)) / 30.44 AS INTEGER)
          ELSE
            -- \u623F\u5B50\u3001\u80A1\u7968\u7B49\u7528\u73B0\u4EF7-\u4E70\u5165\u4EF7
            (a.current_value - a.purchase_value)
        END as profit_loss,
        CASE 
          WHEN LOWER(at.name) LIKE '%\u6C7D\u8F66%' OR LOWER(at.name) LIKE '%\u8F66%' THEN
            -- \u6C7D\u8F66\u6536\u76CA\u7387\u8BA1\u7B97\uFF08\u8D1F\u6570\uFF09
            CASE WHEN a.purchase_value > 0 THEN
              ROUND((-1 * a.purchase_value * 0.02 * 
                CAST((julianday('now') - julianday(a.purchase_date)) / 30.44 AS INTEGER)
              ) * 100.0 / a.purchase_value, 2)
              ELSE 0
            END
          ELSE
            -- \u5176\u4ED6\u8D44\u4EA7\u6536\u76CA\u7387\u8BA1\u7B97
            CASE WHEN a.purchase_value > 0 THEN 
              ROUND(((a.current_value - a.purchase_value) * 100.0 / a.purchase_value), 2)
              ELSE 0 
            END
        END as return_rate
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.user_id = ?
      ORDER BY profit_loss DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/user/info", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT username, phone, email, last_login, created_at
      FROM users 
      WHERE user_id = ?
    `).bind(userId).all();
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(results[0]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.put("/api/user/info", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const data = await request.json();
    const { username, phone, email } = data;
    const result = await env.DB.prepare(`
      UPDATE users 
      SET username = ?, phone = ?, email = ?, last_login = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(username, phone || null, email || null, userId).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/investment-returns", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        ir.*,
        a.name as asset_name,
        at.name as asset_type_name
      FROM investment_returns ir
      JOIN assets a ON ir.asset_id = a.id
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.user_id = ?
      ORDER BY ir.return_date DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.post("/api/investment-returns", async (request, env) => {
  try {
    const data = await request.json();
    const { asset_id, expected_return, actual_return, return_date, period_type, notes } = data;
    const result = await env.DB.prepare(`
      INSERT INTO investment_returns (asset_id, expected_return, actual_return, return_date, period_type, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(asset_id, expected_return, actual_return, return_date, period_type || "monthly", notes || "").run();
    return new Response(JSON.stringify({ id: result.meta.last_row_id, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/user/info", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT username, created_at, last_login FROM users WHERE user_id = ?
    `).bind(userId).all();
    return new Response(JSON.stringify(results[0] || {}), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/yearly-income-expense", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        strftime('%Y', flow_date) as year,
        flow_type,
        SUM(amount) as total_amount
      FROM cash_flows 
      WHERE user_id = ?
      GROUP BY strftime('%Y', flow_date), flow_type
      ORDER BY year DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/monthly-income-expense", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', flow_date) as month,
        flow_type,
        SUM(amount) as total_amount
      FROM cash_flows 
      WHERE user_id = ? AND flow_date >= DATE('now', '-12 months')
      GROUP BY strftime('%Y-%m', flow_date), flow_type
      ORDER BY month DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/asset-returns", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        at.name as asset_type,
        at.category,
        AVG(a.expected_return_rate) as avg_expected_return,
        COUNT(a.id) as asset_count,
        SUM(a.current_value) as total_value
      FROM assets a
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE a.user_id = ?
      GROUP BY at.id, at.name, at.category
      ORDER BY total_value DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/balance-forecast", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const availableYears = await env.DB.prepare(`
      SELECT DISTINCT strftime('%Y', date) as year 
      FROM cash_flows 
      WHERE user_id = ? 
      UNION 
      SELECT DISTINCT strftime('%Y', actual_date) as year 
      FROM cash_flow_history 
      WHERE user_id = ?
      ORDER BY year DESC
    `).bind(userId, userId).all();
    const targetYear = availableYears.results.length > 0 ? availableYears.results[0].year : (/* @__PURE__ */ new Date()).getFullYear().toString();
    const { results: actualFlow } = await env.DB.prepare(`
      SELECT 
        type as flow_type,
        SUM(amount) as total_amount
      FROM cash_flow_history 
      WHERE user_id = ? AND strftime('%Y', actual_date) = ?
      GROUP BY type
    `).bind(userId, targetYear).all();
    const { results: plannedFlow } = await env.DB.prepare(`
      SELECT 
        type as flow_type,
        SUM(amount) as total_amount
      FROM cash_flows 
      WHERE user_id = ? AND strftime('%Y', date) = ?
      GROUP BY type
    `).bind(userId, targetYear).all();
    const actualIncome = actualFlow.find((f) => f.flow_type === "income")?.total_amount || 0;
    const actualExpense = actualFlow.find((f) => f.flow_type === "expense")?.total_amount || 0;
    const plannedIncome = plannedFlow.find((f) => f.flow_type === "income")?.total_amount || 0;
    const plannedExpense = plannedFlow.find((f) => f.flow_type === "expense")?.total_amount || 0;
    return new Response(JSON.stringify({
      actual: {
        income: actualIncome,
        expense: actualExpense,
        balance: actualIncome - actualExpense
      },
      planned: {
        income: plannedIncome,
        expense: plannedExpense,
        balance: plannedIncome - plannedExpense
      },
      comparison: {
        income_diff: actualIncome - plannedIncome,
        expense_diff: actualExpense - plannedExpense,
        balance_diff: actualIncome - actualExpense - (plannedIncome - plannedExpense)
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/cash-flows/history", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        id,
        type,
        description,
        amount,
        actual_date,
        category,
        created_at
      FROM cash_flow_history 
      WHERE user_id = ?
      ORDER BY actual_date DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/historical-monthly-flow", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', actual_date) as month,
        type,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM cash_flow_history 
      WHERE user_id = ? AND actual_date >= DATE('now', '-12 months')
      GROUP BY month, type
      ORDER BY month DESC
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.get("/api/analytics/asset-value-trends", async (request, env) => {
  try {
    const userId = await getUserId(request, env);
    const { results } = await env.DB.prepare(`
      SELECT 
        avh.record_date,
        avh.value,
        a.name as asset_name,
        at.name as asset_type,
        at.category
      FROM asset_value_history avh
      JOIN assets a ON avh.asset_id = a.id
      JOIN asset_types at ON a.asset_type_id = at.id
      WHERE avh.user_id = ? AND avh.record_date >= DATE('now', '-12 months')
      ORDER BY avh.record_date DESC, a.name
    `).bind(userId).all();
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
router.all("*", () => new Response("Not Found", { status: 404 }));
var worker_default = {
  fetch: router.handle
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e2) {
      console.error("Failed to drain the unused request body.", e2);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e2) {
  return {
    name: e2?.name,
    message: e2?.message ?? String(e2),
    stack: e2?.stack,
    cause: e2?.cause === void 0 ? void 0 : reduceError(e2.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e2) {
    const error = reduceError(e2);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-4iNbFn/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-4iNbFn/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
