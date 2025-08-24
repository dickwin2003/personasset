// 现金流管理器 - 处理收入支出记录和分析

class CashFlowManager {
    constructor() {
        this.cashFlows = [];
        this.currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        this.init();
    }

    async init() {
        await this.loadCashFlows();
        this.setupEventListeners();
        this.renderCashFlowDashboard();
    }

    async loadCashFlows(startDate = null, endDate = null) {
        try {
            this.cashFlows = await apiClient.getCashFlows(startDate, endDate);
            this.renderCashFlowList();
            this.updateCashFlowSummary();
        } catch (error) {
            console.error('Failed to load cash flows:', error);
            this.showToast('加载现金流数据失败', 'error');
        }
    }

    renderCashFlowDashboard() {
        const container = document.getElementById('cashFlowContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="cash-flow-dashboard">
                <!-- 现金流概览 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="summary-card bg-green-50 border border-green-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-arrow-up text-green-600"></i>
                            </div>
                            <div>
                                <p class="text-sm text-green-600">本月收入</p>
                                <p class="text-xl font-bold text-green-700" id="monthlyIncome">¥0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-card bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-arrow-down text-red-600"></i>
                            </div>
                            <div>
                                <p class="text-sm text-red-600">本月支出</p>
                                <p class="text-xl font-bold text-red-700" id="monthlyExpense">¥0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary-card bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-balance-scale text-blue-600"></i>
                            </div>
                            <div>
                                <p class="text-sm text-blue-600">净现金流</p>
                                <p class="text-xl font-bold" id="netCashFlow">¥0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex flex-wrap gap-3 mb-6">
                    <button id="addIncomeBtn" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center">
                        <i class="fas fa-plus mr-2"></i>记录收入
                    </button>
                    <button id="addExpenseBtn" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center">
                        <i class="fas fa-minus mr-2"></i>记录支出
                    </button>
                    <button id="viewAnalyticsBtn" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center">
                        <i class="fas fa-chart-bar mr-2"></i>现金流分析
                    </button>
                </div>

                <!-- 时间筛选 -->
                <div class="flex flex-wrap gap-3 mb-6">
                    <select id="monthFilter" class="border border-gray-300 rounded-lg px-3 py-2">
                        <option value="">选择月份</option>
                    </select>
                    <button id="loadCurrentMonth" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        当前月份
                    </button>
                    <button id="loadAllData" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        全部数据
                    </button>
                </div>

                <!-- 现金流列表 -->
                <div class="bg-white rounded-lg shadow-md">
                    <div class="p-4 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-800">现金流记录</h3>
                    </div>
                    <div id="cashFlowList" class="p-4">
                        <!-- 现金流记录将在这里显示 -->
                    </div>
                </div>
            </div>
        `;

        this.populateMonthFilter();
    }

    renderCashFlowList() {
        const container = document.getElementById('cashFlowList');
        if (!container) return;

        if (this.cashFlows.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-receipt text-4xl mb-4"></i>
                    <p>暂无现金流记录</p>
                </div>
            `;
            return;
        }

        // 按日期分组
        const groupedFlows = this.groupCashFlowsByDate();
        
        container.innerHTML = Object.entries(groupedFlows)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, flows]) => `
                <div class="date-group mb-6">
                    <h4 class="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                        ${this.formatDate(date)}
                    </h4>
                    <div class="space-y-2">
                        ${flows.map(flow => this.renderCashFlowItem(flow)).join('')}
                    </div>
                </div>
            `).join('');
    }

    renderCashFlowItem(flow) {
        const amount = parseFloat(flow.amount);
        const isIncome = flow.flow_type === 'income';
        
        return `
            <div class="cash-flow-item flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        isIncome ? 'bg-green-100' : 'bg-red-100'
                    }">
                        <i class="fas ${isIncome ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${this.getCategoryName(flow.category)}</p>
                        ${flow.description ? `<p class="text-sm text-gray-500">${flow.description}</p>` : ''}
                        ${flow.is_recurring ? '<span class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">循环</span>' : ''}
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}">
                        ${isIncome ? '+' : '-'}¥${amount.toLocaleString()}
                    </p>
                    <p class="text-xs text-gray-500">${flow.flow_date}</p>
                </div>
            </div>
        `;
    }

    updateCashFlowSummary() {
        const currentMonthFlows = this.cashFlows.filter(flow => 
            flow.flow_date.startsWith(this.currentMonth)
        );

        const income = currentMonthFlows
            .filter(flow => flow.flow_type === 'income')
            .reduce((sum, flow) => sum + parseFloat(flow.amount), 0);

        const expense = currentMonthFlows
            .filter(flow => flow.flow_type === 'expense')
            .reduce((sum, flow) => sum + parseFloat(flow.amount), 0);

        const netFlow = income - expense;

        // 更新显示
        const monthlyIncomeEl = document.getElementById('monthlyIncome');
        const monthlyExpenseEl = document.getElementById('monthlyExpense');
        const netCashFlowEl = document.getElementById('netCashFlow');

        if (monthlyIncomeEl) monthlyIncomeEl.textContent = `¥${income.toLocaleString()}`;
        if (monthlyExpenseEl) monthlyExpenseEl.textContent = `¥${expense.toLocaleString()}`;
        if (netCashFlowEl) {
            netCashFlowEl.textContent = `¥${netFlow.toLocaleString()}`;
            netCashFlowEl.className = `text-xl font-bold ${netFlow >= 0 ? 'text-green-700' : 'text-red-700'}`;
        }
    }

    groupCashFlowsByDate() {
        return this.cashFlows.reduce((groups, flow) => {
            const date = flow.flow_date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(flow);
            return groups;
        }, {});
    }

    populateMonthFilter() {
        const select = document.getElementById('monthFilter');
        if (!select) return;

        // 生成最近12个月的选项
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().slice(0, 7);
            months.push({
                value: monthStr,
                label: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
            });
        }

        select.innerHTML = '<option value="">选择月份</option>' + 
            months.map(month => `<option value="${month.value}">${month.label}</option>`).join('');
    }

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'addIncomeBtn') {
                this.showAddCashFlowModal('income');
            }
            
            if (e.target.id === 'addExpenseBtn') {
                this.showAddCashFlowModal('expense');
            }
            
            if (e.target.id === 'loadCurrentMonth') {
                const now = new Date();
                const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
                await this.loadCashFlows(startDate, endDate);
            }
            
            if (e.target.id === 'loadAllData') {
                await this.loadCashFlows();
            }
        });

        document.addEventListener('change', async (e) => {
            if (e.target.id === 'monthFilter' && e.target.value) {
                const selectedMonth = e.target.value;
                const startDate = selectedMonth + '-01';
                const endDate = new Date(selectedMonth + '-01');
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
                const endDateStr = endDate.toISOString().slice(0, 10);
                
                await this.loadCashFlows(startDate, endDateStr);
            }
        });
    }

    showAddCashFlowModal(type) {
        const isIncome = type === 'income';
        const categories = isIncome ? this.getIncomeCategories() : this.getExpenseCategories();
        
        const modal = this.createModal(`记录${isIncome ? '收入' : '支出'}`, `
            <form id="addCashFlowForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <select id="categorySelect" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                        <option value="">请选择分类</option>
                        ${categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
                    <input type="number" id="flowAmount" class="w-full border border-gray-300 rounded-lg px-3 py-2" step="0.01" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
                    <input type="date" id="flowDate" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
                    <textarea id="flowDescription" class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"></textarea>
                </div>
                
                <div class="flex items-center">
                    <input type="checkbox" id="isRecurring" class="mr-2">
                    <label for="isRecurring" class="text-sm text-gray-700">这是一个循环的${isIncome ? '收入' : '支出'}</label>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 ${isIncome ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white py-2 rounded-lg transition">
                        记录${isIncome ? '收入' : '支出'}
                    </button>
                    <button type="button" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition" onclick="this.closest('.modal').remove()">
                        取消
                    </button>
                </div>
            </form>
        `);

        // 设置默认日期为今天
        document.getElementById('flowDate').valueAsDate = new Date();

        document.getElementById('addCashFlowForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddCashFlow(e.target, type);
            modal.remove();
        });
    }

    async handleAddCashFlow(form, type) {
        const data = {
            flow_type: type,
            category: document.getElementById('categorySelect').value,
            amount: parseFloat(document.getElementById('flowAmount').value),
            flow_date: document.getElementById('flowDate').value,
            description: document.getElementById('flowDescription').value,
            is_recurring: document.getElementById('isRecurring').checked
        };

        try {
            await apiClient.createCashFlow(data);
            this.showToast(`${type === 'income' ? '收入' : '支出'}记录成功`);
            await this.loadCashFlows();
        } catch (error) {
            console.error('Failed to add cash flow:', error);
            this.showToast('记录失败', 'error');
        }
    }

    getIncomeCategories() {
        return [
            { value: 'salary', label: '工资收入' },
            { value: 'bonus', label: '奖金' },
            { value: 'rent_income', label: '租金收入' },
            { value: 'investment_return', label: '投资收益' },
            { value: 'business_income', label: '经营收入' },
            { value: 'freelance', label: '自由职业' },
            { value: 'other_income', label: '其他收入' }
        ];
    }

    getExpenseCategories() {
        return [
            { value: 'housing', label: '住房支出' },
            { value: 'food', label: '餐饮' },
            { value: 'transportation', label: '交通' },
            { value: 'utilities', label: '水电气' },
            { value: 'healthcare', label: '医疗' },
            { value: 'education', label: '教育' },
            { value: 'entertainment', label: '娱乐' },
            { value: 'shopping', label: '购物' },
            { value: 'insurance', label: '保险' },
            { value: 'loan_payment', label: '贷款还款' },
            { value: 'investment', label: '投资' },
            { value: 'other_expense', label: '其他支出' }
        ];
    }

    getCategoryName(category) {
        const allCategories = [...this.getIncomeCategories(), ...this.getExpenseCategories()];
        const found = allCategories.find(cat => cat.value === category);
        return found ? found.label : category;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${
                type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
}

// 初始化现金流管理器
window.cashFlowManager = new CashFlowManager();
