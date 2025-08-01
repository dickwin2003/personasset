// 全局状态管理
const state = {
    currentView: 'record',
    data: {
        assets: [],
        config: {
            units: {
                record: "元",
                overview: "万",
                summary: "元"
            },
            accounts: ["支付宝", "工商银行", "微信钱包"],
            showNotes: false,
            showDecimal: false,
            useThousandsSeparator: false, // 是否使用千分位符（仅对总计金额）
            filteredAccounts: [], // 添加账户筛选功能
            hiddenAccounts: [] // 添加隐藏账户功能
        }
    },
    chartInstances: {}
};

// 将state添加到全局作用域
/** @type {any} */
const globalWindow2 = window;
globalWindow2.state = state;

// 注册Chart.js插件，但只在需要的图表中启用
Chart.register(ChartDataLabels);

// 页面元素缓存
const elements = {
    recordPage: null,
    overviewPage: null,
    settingsPage: null,
    recordBtn: null,
    overviewBtn: null,
    settingsBtn: null
};

// 将elements添加到全局作用域
/** @type {any} */
const globalWindow = window;
globalWindow.elements = elements;

// 单位定义（从constants.js文件中获取）
// const units = ["元", "千", "万", "十万", "百万", "千万", "亿"];
// const unitValues = {
//     "元": 1,
//     "千": 1000,
//     "万": 10000,
//     "十万": 100000,
//     "百万": 1000000,
//     "千万": 10000000,
//     "亿": 100000000
// };

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    window.setupEventListeners();
    window.loadData();
    window.renderRecordPage();
});

// 初始化应用
function initApp() {
    // 缓存常用元素
    /** @type {any} */
    const globalWindow3 = window;
    globalWindow3.elements.recordPage = document.getElementById('recordPage');
    globalWindow3.elements.overviewPage = document.getElementById('overviewPage');
    globalWindow3.elements.settingsPage = document.getElementById('settingsPage');
    globalWindow3.elements.recordBtn = document.getElementById('recordBtn');
    globalWindow3.elements.overviewBtn = document.getElementById('overviewBtn');
    globalWindow3.elements.settingsBtn = document.getElementById('settingsBtn');
    
    // 设置当前日期
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    document.getElementById('currentDate').textContent = dateString;
}


































