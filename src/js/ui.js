// UI交互模块

// 显示Toast提示
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    // 重置状态并准备显示
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg transition-all duration-300 ${
        type === 'error' ? 'bg-red-500' : 'bg-gray-800'
    } text-white translate-y-full opacity-0`;
    
    // 强制重绘
    void toast.offsetWidth;
    
    // 显示toast (同时移除translate和opacity)
    toast.classList.remove('translate-y-full', 'opacity-0');
    
    // 隐藏toast
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
}

// 切换视图
function switchView(view) {
    /** @type {any} */
    const globalWindow = window;
    globalWindow.state.currentView = view;
    
    // 更新按钮状态
    globalWindow.elements.recordBtn.classList.remove('active');
    globalWindow.elements.overviewBtn.classList.remove('active');
    globalWindow.elements.settingsBtn.classList.remove('active');
    
    // 隐藏所有页面
    globalWindow.elements.recordPage.classList.add('hidden');
    globalWindow.elements.overviewPage.classList.add('hidden');
    globalWindow.elements.settingsPage.classList.add('hidden');
    
    // 显示对应页面并激活按钮
    if (view === 'record') {
        globalWindow.elements.recordPage.classList.remove('hidden');
        globalWindow.elements.recordBtn.classList.add('active');
        globalWindow.renderRecordPage();
    } else if (view === 'overview') {
        globalWindow.elements.overviewPage.classList.remove('hidden');
        globalWindow.elements.overviewBtn.classList.add('active');
        globalWindow.renderOverviewPage();
    } else {
        globalWindow.elements.settingsPage.classList.remove('hidden');
        globalWindow.elements.settingsBtn.classList.add('active');
        globalWindow.renderSettingsPage();
    }
}

// 切换账户筛选状态
function toggleAccountFilter(account) {
    if (!window.state.data.config.filteredAccounts) {
        window.state.data.config.filteredAccounts = [];
    }
    
    const index = window.state.data.config.filteredAccounts.indexOf(account);
    if (index > -1) {
        // 取消筛选
        window.state.data.config.filteredAccounts.splice(index, 1);
    } else {
        // 添加筛选
        window.state.data.config.filteredAccounts.push(account);
    }
    
    // 使用防抖函数重新渲染总览页面
    window.debouncedRenderOverviewPage();
}

// 检查账户是否被筛选掉或隐藏
function isAccountFiltered(account) {
    // 检查是否被用户筛选掉
    const isUserFiltered = window.state.data.config.filteredAccounts && 
                          window.state.data.config.filteredAccounts.includes(account);
                          
    // 检查是否被隐藏
    const isHidden = window.state.data.config.hiddenAccounts && 
                    window.state.data.config.hiddenAccounts.includes(account);
    
    return isUserFiltered || isHidden;
}

// 删除账户
function deleteAccount(index) {
    const accountName = window.state.data.config.accounts[index];
    if (confirm(`确定要删除账户 "${accountName}" 吗？这将永久删除该账户及其所有历史记录！`)) {
        // 从账户列表中删除
        window.state.data.config.accounts.splice(index, 1);
        
        // 从资产数据中删除该账户的所有记录
        window.state.data.assets = window.state.data.assets.filter(asset => asset.account !== accountName);
        
        // 从隐藏账户列表中删除（如果存在）
        if (window.state.data.config.hiddenAccounts) {
            const hiddenIndex = window.state.data.config.hiddenAccounts.indexOf(accountName);
            if (hiddenIndex > -1) {
                window.state.data.config.hiddenAccounts.splice(hiddenIndex, 1);
            }
        }
        
        // 从筛选账户列表中删除（如果存在）
        if (window.state.data.config.filteredAccounts) {
            const filteredIndex = window.state.data.config.filteredAccounts.indexOf(accountName);
            if (filteredIndex > -1) {
                window.state.data.config.filteredAccounts.splice(filteredIndex, 1);
            }
        }
        
        // 重新渲染相关界面
        window.renderAccountsManagement();
        if (window.state.currentView === 'record') {
            window.renderRecordPage();
        } else if (window.state.currentView === 'overview') {
            window.renderOverviewPage();
        } else if (window.state.currentView === 'settings') {
            window.renderHistoryEditor();
        }

        // 保存更新到localStorage
        saveData(); // 自动保存账户设置
        saveData();
        
        showToast('账户及其所有数据已删除');
    }
}

// 切换账户可见性
function toggleAccountVisibility(index, isCurrentlyHidden) {
    const account = window.state.data.config.accounts[index];
    
    // 初始化隐藏账户数组（如果不存在）
    if (!window.state.data.config.hiddenAccounts) {
        window.state.data.config.hiddenAccounts = [];
    }
    
    if (isCurrentlyHidden) {
        // 当前是隐藏状态，需要显示
        const hiddenIndex = window.state.data.config.hiddenAccounts.indexOf(account);
        if (hiddenIndex > -1) {
            window.state.data.config.hiddenAccounts.splice(hiddenIndex, 1);
        }
    } else {
        // 当前是显示状态，需要隐藏
        if (!window.state.data.config.hiddenAccounts.includes(account)) {
            window.state.data.config.hiddenAccounts.push(account);
        }
    }
    
    // 重新渲染账户管理界面
    window.renderAccountsManagement();
    
    // 如果在总览页面，需要重新渲染图表
    if (window.state.currentView === 'overview') {
        window.renderOverviewPage();
    }

    // 自动保存设置
    saveData();

    showToast(isCurrentlyHidden ? '账户已显示' : '账户已隐藏');
}

// 编辑账户名称
function editAccountName(index) {
    const oldName = window.state.data.config.accounts[index];
    const newName = prompt('请输入新的账户名称:', oldName);
    
    if (newName && newName.trim() && newName !== oldName) {
        // 更新账户名称
        window.state.data.config.accounts[index] = newName.trim();
        
        // 更新资产数据中的账户名称
        window.state.data.assets.forEach(asset => {
            if (asset.account === oldName) {
                asset.account = newName.trim();
            }
        });
        
        // 更新隐藏账户列表中的名称
        if (window.state.data.config.hiddenAccounts) {
            const hiddenIndex = window.state.data.config.hiddenAccounts.indexOf(oldName);
            if (hiddenIndex > -1) {
                window.state.data.config.hiddenAccounts[hiddenIndex] = newName.trim();
            }
        }
        
        // 更新筛选账户列表中的名称
        if (window.state.data.config.filteredAccounts) {
            const filteredIndex = window.state.data.config.filteredAccounts.indexOf(oldName);
            if (filteredIndex > -1) {
                window.state.data.config.filteredAccounts[filteredIndex] = newName.trim();
            }
        }
        
        // 重新渲染相关界面
        window.renderAccountsManagement();
        if (window.state.currentView === 'record') {
            window.renderRecordPage();
        } else if (window.state.currentView === 'overview') {
            window.renderOverviewPage();
        } else if (window.state.currentView === 'settings') {
            window.renderHistoryEditor();
        }

        // 自动保存设置
        saveData();

        showToast('账户名称已更新');
    }
}

// 添加账户
function addAccount() {
    const accountName = prompt('请输入新账户名称:');
    if (accountName && accountName.trim()) {
        window.state.data.config.accounts.push(accountName.trim());
        window.renderAccountsManagement();
        saveData(); // 自动保存账户设置
        showToast('账户已添加');
    }
}

// 删除资产记录
function deleteAsset(date, account) {
    if (confirm(`确定要删除 ${date} 的 ${account} 记录吗？`)) {
        window.state.data.assets = window.state.data.assets.filter(
            a => !(a.date === date && a.account === account)
        );
        window.renderHistoryEditor();
        showToast('记录已删除');
    }
}

// 保存历史更改
function saveHistoryChanges() {
    // 更新资产金额和备注
    document.querySelectorAll('.asset-amount').forEach(input => {
        const date = input.dataset.date;
        const account = input.dataset.account;
        const amount = parseFloat(input.value) || 0;
        
        const asset = window.state.data.assets.find(a => 
            a.date === date && a.account === account
        );
        if (asset) {
            asset.amount = amount;
        }
    });
    
    document.querySelectorAll('.asset-note').forEach(input => {
        const date = input.dataset.date;
        const account = input.dataset.account;
        const note = input.value;
        
        const asset = window.state.data.assets.find(a => 
            a.date === date && a.account === account
        );
        if (asset) {
            asset.note = note;
        }
    });

    // 保存到localStorage
    saveData();

    showToast('更改已保存');
}

// 切换备注显示
function toggleNotesDisplay(e) {
    window.state.data.config.showNotes = e.target.checked;
    saveData(); // 自动保存设置
    if (window.state.currentView === 'record') {
        window.renderRecordPage();
    }
}

// 切换小数点显示
function toggleDecimalDisplay(e) {
    window.state.data.config.showDecimal = e.target.checked;
    saveData(); // 自动保存设置
    if (window.state.currentView === 'record') {
        window.renderRecordPage();
    }
}

// 切换千分位符显示（仅对总计金额）
function toggleThousandsSeparator(e) {
    window.state.data.config.useThousandsSeparator = e.target.checked;
    saveData(); // 自动保存设置
    // 更新总计显示
    updateTotal();
    // 如果在总览页面，更新总览页总计显示
    if (window.state.currentView === 'overview') {
        updateOverviewTotal();
    }
}

// 填充上次数据到文本框（不保存）
function populateLastData() {
    const currentDate = document.getElementById('currentDate').textContent;
    
    // 查找最近一次有记录的日期（早于今天）
    let lastRecordDate = null;
    const earlierDates = [...new Set(window.state.data.assets.filter(a => a.date < currentDate).map(a => a.date))].sort();
    
    // 查找最近一次记录日期
    if (earlierDates.length > 0) {
        lastRecordDate = earlierDates[earlierDates.length - 1];
    }
    
    // 如果没有历史记录，提示用户
    if (!lastRecordDate) {
        showToast('没有历史数据可填充', 'error');
        return;
    }
    
    // 为每个账户填充数据
    window.state.data.config.accounts.forEach(account => {
        // 查找最近一次该账户的记录
        const accountRecords = window.state.data.assets
            .filter(a => a.account === account && a.date === lastRecordDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
        if (accountRecords.length > 0) {
            const lastAsset = accountRecords[0];
            
            // 填充金额输入框
            const amountInput = document.querySelector(`.amount-input[data-account="${account}"]`);
            if (amountInput) {
                amountInput.value = window.formatAmountForDisplay(lastAsset.amount, window.state.data.config.units.record);
            }
            
            // 填充备注输入框（如果有显示）
            if (window.state.data.config.showNotes) {
                const noteInput = document.querySelector(`.note-input[data-account="${account}"]`);
                if (noteInput) {
                    noteInput.value = lastAsset.note || '';
                }
            }
        }
    });
    
    // 更新总计
    updateTotal();
    
    showToast(`已填充${lastRecordDate}的数据`);
}

// 防抖的总览页面渲染函数
const debouncedRenderOverviewPage = window.debounce(window.renderOverviewPage, 300);

// 将函数添加到全局作用域
window.showToast = showToast;
window.switchView = switchView;
window.toggleAccountFilter = toggleAccountFilter;
window.isAccountFiltered = isAccountFiltered;
window.deleteAccount = deleteAccount;
window.toggleAccountVisibility = toggleAccountVisibility;
window.editAccountName = editAccountName;
window.addAccount = addAccount;
window.deleteAsset = deleteAsset;
window.saveHistoryChanges = saveHistoryChanges;
window.toggleNotesDisplay = toggleNotesDisplay;
window.toggleDecimalDisplay = toggleDecimalDisplay;
window.toggleThousandsSeparator = toggleThousandsSeparator;
window.populateLastData = populateLastData;
window.debouncedRenderOverviewPage = debouncedRenderOverviewPage;