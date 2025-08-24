// 页面导航控制器

class NavigationController {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = ['dashboard', 'assets', 'liabilities', 'cashFlow', 'record', 'overview', 'settings'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showPage('dashboard');
    }

    setupEventListeners() {
        // 导航按钮事件
        document.addEventListener('click', (e) => {
            // 桌面端导航按钮
            if (e.target.id === 'dashboardBtn' || e.target.closest('#dashboardBtn')) {
                this.showPage('dashboard');
            }
            
            if (e.target.id === 'assetsBtn' || e.target.closest('#assetsBtn')) {
                this.showPage('assets');
            }
            
            if (e.target.id === 'liabilitiesBtn' || e.target.closest('#liabilitiesBtn')) {
                this.showPage('liabilities');
            }
            
            if (e.target.id === 'cashFlowBtn' || e.target.closest('#cashFlowBtn')) {
                this.showPage('cashFlow');
            }
            
            if (e.target.id === 'recordBtn' || e.target.closest('#recordBtn')) {
                this.showPage('record');
            }
            
            if (e.target.id === 'overviewBtn' || e.target.closest('#overviewBtn')) {
                this.showPage('overview');
            }
            
            if (e.target.id === 'settingsBtn' || e.target.closest('#settingsBtn')) {
                this.showPage('settings');
            }
            
            // 移动端底部导航按钮
            if (e.target.id === 'mobileDashboardBtn' || e.target.closest('#mobileDashboardBtn')) {
                this.showPage('dashboard');
            }
            
            if (e.target.id === 'mobileAssetsBtn' || e.target.closest('#mobileAssetsBtn')) {
                this.showPage('assets');
            }
            
            if (e.target.id === 'mobileCashFlowBtn' || e.target.closest('#mobileCashFlowBtn')) {
                this.showPage('cashFlow');
            }
            
            if (e.target.id === 'mobileSettingsBtn' || e.target.closest('#mobileSettingsBtn')) {
                this.showPage('settings');
            }
        });
    }

    showPage(pageName) {
        // 隐藏所有页面
        this.pages.forEach(page => {
            const pageElement = document.getElementById(`${page}Page`);
            if (pageElement) {
                pageElement.classList.add('hidden');
                pageElement.classList.remove('fade-in');
            }
        });

        // 显示目标页面
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            setTimeout(() => {
                targetPage.classList.add('fade-in');
            }, 10);
        }

        // 更新导航按钮状态
        this.updateNavButtons(pageName);
        
        // 更新当前页面
        this.currentPage = pageName;

        // 触发页面特定的初始化
        this.onPageShow(pageName);
    }

    updateNavButtons(activePage) {
        // 底部导航按钮
        const navButtons = [
            'dashboardBtn', 'assetsBtn', 'liabilitiesBtn', 'cashFlowBtn'
        ];
        
        // 桌面端其他按钮
        const otherButtons = [
            'recordBtn', 'overviewBtn', 'settingsBtn'
        ];

        // 更新底部导航按钮状态
        navButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('active');
                
                const navPageMap = {
                    'dashboardBtn': 'dashboard',
                    'assetsBtn': 'assets',
                    'liabilitiesBtn': 'liabilities',
                    'cashFlowBtn': 'cashFlow'
                };

                if (navPageMap[buttonId] === activePage) {
                    button.classList.add('active');
                }
            }
        });
        
        // 更新其他按钮状态
        otherButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('active');
                
                const otherPageMap = {
                    'recordBtn': 'record',
                    'overviewBtn': 'overview',
                    'settingsBtn': 'settings'
                };

                if (otherPageMap[buttonId] === activePage) {
                    button.classList.add('active');
                }
            }
        });
    }

    onPageShow(pageName) {
        switch (pageName) {
            case 'dashboard':
                if (window.dashboard) {
                    window.dashboard.refreshDashboard();
                }
                break;
            case 'assets':
                if (window.assetManager) {
                    window.assetManager.loadAssets();
                }
                break;
            case 'liabilities':
                if (window.assetManager) {
                    window.assetManager.loadLiabilities();
                }
                break;
            case 'cashFlow':
                if (window.cashFlowManager) {
                    window.cashFlowManager.loadCashFlows();
                }
                break;
            default:
                break;
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

// 初始化导航控制器
window.navigationController = new NavigationController();
