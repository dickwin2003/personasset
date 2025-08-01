// 页面渲染模块

// 渲染记录页面
function renderRecordPage() {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = '';
    
    const currentDate = document.getElementById('currentDate').textContent;
    
    window.state.data.config.accounts.forEach((account, index) => {
        // 查找当天该账户的数据
        const asset = window.state.data.assets.find(a => 
            a.date === currentDate && a.account === account
        );
        
        const amount = asset ? asset.amount : 0;
        const note = asset ? asset.note : '';
        
        const accountDiv = document.createElement('div');
        accountDiv.className = 'flex items-center justify-between p-3 border rounded';
        accountDiv.innerHTML = `
            <span class="font-medium">${account}</span>
            <div class="flex flex-col">
                <div class="flex items-center mb-1">
                    ${window.state.data.config.showNotes ? `<input 
                        type="text"
                        data-account="${account}"
                        value="${note}"
                        class="w-32 px-2 py-1 border rounded text-sm note-input mr-2"
                        placeholder="备注"
                    >` : ''}
                    <input 
                        type="${window.state.data.config.showDecimal ? 'number' : 'text'}"
                        data-account="${account}"
                        value="${window.formatAmountForDisplay(amount, window.state.data.config.units.record)}"
                        class="w-32 px-2 py-1 border rounded text-right amount-input"
                        placeholder="0"
                    >
                    <span class="ml-2 text-gray-500">${window.state.data.config.units.record}</span>
                </div>
            </div>
        `;
        accountsList.appendChild(accountDiv);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.amount-input').forEach(input => {
        input.addEventListener('input', handleAmountChange);
        input.addEventListener('keydown', handleKeyDown);
    });
    
    // 添加备注输入框事件监听器（仅在显示备注时）
    if (window.state.data.config.showNotes) {
        document.querySelectorAll('.note-input').forEach(input => {
            input.addEventListener('input', handleNoteChange);
        });
    }
    
    // 更新总计
    updateTotal();
    
    // 备注显示控制
    const notesSection = document.getElementById('notesSection');
    if (notesSection) {
        if (window.state.data.config.showNotes) {
            notesSection.classList.remove('hidden');
        } else {
            notesSection.classList.add('hidden');
        }
    }
}

// 渲染总览页面
function renderOverviewPage() {
    // 更新总资产显示
    updateOverviewTotal();
    
    // 渲染账户筛选按钮
    renderAccountFilters();
    
    // 使用Chart.js渲染各种图表
    window.renderTrendChart();
    window.renderPieChart();
    window.renderBarChart();
    window.renderStackedAreaChart();
}

// 渲染设置页面
function renderSettingsPage() {
    // 显示设置
    document.getElementById('showNotesCheckbox').checked = window.state.data.config.showNotes;
    document.getElementById('showDecimalCheckbox').checked = window.state.data.config.showDecimal;
    document.getElementById('thousandsSeparatorCheckbox').checked = window.state.data.config.useThousandsSeparator;
    
    // 单位设置
    renderUnitButtons('recordUnits', window.state.data.config.units.record, 'record');
    renderUnitButtons('overviewUnits', window.state.data.config.units.overview, 'overview');
    renderUnitButtons('summaryUnits', window.state.data.config.units.summary, 'summary');
    
    // 账户管理
    renderAccountsManagement();
    
    // 历史编辑器
    renderHistoryEditor();
}

// 渲染账户筛选按钮
function renderAccountFilters() {
    const container = document.getElementById('accountFilters');
    container.innerHTML = '';
    
    // 获取所有唯一账户名称，使用 Set 提高性能
    const accountsSet = new Set();
    for (let i = 0; i < window.state.data.assets.length; i++) {
        accountsSet.add(window.state.data.assets[i].account);
    }
    const accounts = Array.from(accountsSet);
    
    // 过滤掉隐藏的账户
    const visibleAccounts = accounts.filter(account => {
        return !window.state.data.config.hiddenAccounts || 
               !window.state.data.config.hiddenAccounts.includes(account);
    });
    
    // 使用文档片段减少DOM操作次数
    const fragment = document.createDocumentFragment();
    
    // 为每个可见账户创建筛选按钮
    for (let i = 0; i < visibleAccounts.length; i++) {
        const account = visibleAccounts[i];
        const button = document.createElement('button');
        button.className = `px-3 py-1 text-sm rounded ${isAccountFiltered(account) ? 'bg-gray-200 text-gray-700' : 'bg-blue-500 text-white'}`;
        button.textContent = account;
        button.dataset.account = account;
        button.addEventListener('click', () => toggleAccountFilter(account));
        fragment.appendChild(button);
    }
    
    container.appendChild(fragment);
}

// 渲染单位按钮
function renderUnitButtons(containerId, activeUnit, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    window.units.forEach(unit => {
        const button = document.createElement('button');
        button.className = `px-2 py-1 text-xs rounded unit-btn ${unit === activeUnit ? 'active' : 'bg-gray-200'}`;
        button.textContent = unit;
        button.addEventListener('click', () => {
            window.state.data.config.units[type] = unit;
            renderUnitButtons(containerId, unit, type);
            saveData(); // 自动保存单位设置
            if (window.state.currentView === 'record') {
                renderRecordPage();
            } else if (window.state.currentView === 'overview') {
                renderOverviewPage();
            } else if (window.state.currentView === 'settings') {
                // 如果在设置页面，需要更新相关显示
                if (type === 'summary') {
                    updateOverviewTotal();
                } else if (type === 'overview') {
                    // 如果更改了总览单位，需要重新渲染图表
                    renderOverviewPage();
                }
            }
        });
        container.appendChild(button);
    });
}

// 渲染账户管理
function renderAccountsManagement() {
    const container = document.getElementById('accountsManagement');
    container.innerHTML = '';
    
    window.state.data.config.accounts.forEach((account, index) => {
        // 检查账户是否被隐藏
        const isHidden = window.state.data.config.hiddenAccounts && 
                        window.state.data.config.hiddenAccounts.includes(account);
        
        const accountDiv = document.createElement('div');
        accountDiv.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
        accountDiv.draggable = true;
        accountDiv.dataset.index = index;
        accountDiv.addEventListener('dragstart', handleDragStart);
        accountDiv.addEventListener('dragover', handleDragOver);
        accountDiv.addEventListener('drop', handleDrop);
        accountDiv.addEventListener('dragend', handleDragEnd);
        accountDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-grip-lines mr-2 text-gray-400 cursor-move drag-handle"></i>
                <span class="account-name">${account}</span>
            </div>
            <div class="flex items-center space-x-2">
                <button class="edit-account px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600" 
                        data-index="${index}">
                    编辑
                </button>
                <button class="toggle-account px-2 py-1 ${isHidden ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs rounded" 
                        data-index="${index}" data-hidden="${isHidden}">
                    ${isHidden ? '显示' : '隐藏'}
                </button>
                <button class="delete-account px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" data-index="${index}">
                    删除
                </button>
            </div>
        `;
        container.appendChild(accountDiv);
    });
    
    // 添加删除事件监听器
    document.querySelectorAll('.delete-account').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteAccount(index);
        });
    });
    
    // 添加切换隐藏/显示事件监听器
    document.querySelectorAll('.toggle-account').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const isHidden = e.target.dataset.hidden === 'true';
            toggleAccountVisibility(index, isHidden);
        });
    });
    
    // 添加编辑事件监听器
    document.querySelectorAll('.edit-account').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            editAccountName(index);
        });
    });
}

// 渲染历史编辑器
function renderHistoryEditor() {
    const container = document.getElementById('historyEditor');
    if (window.state.data.assets.length === 0) {
        container.innerHTML = '<div class="p-3 bg-gray-50 border-b font-medium">暂无历史数据</div>';
        return;
    }
    
    // 按日期分组
    const groupedAssets = {};
    window.state.data.assets.forEach(asset => {
        if (!groupedAssets[asset.date]) {
            groupedAssets[asset.date] = [];
        }
        groupedAssets[asset.date].push(asset);
    });
    
    container.innerHTML = '';
    Object.keys(groupedAssets).sort().reverse().forEach(date => {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'border-b';
        dateDiv.innerHTML = `
            <div class="p-3 bg-gray-100 font-medium cursor-pointer flex justify-between items-center">
                <span>${date}</span>
                <i class="fas fa-chevron-down transform rotate-180"></i>
            </div>
            <div class="history-details p-3">
                ${groupedAssets[date].map(asset => `
                    <div class="grid grid-cols-12 gap-2 mb-2 items-center">
                        <div class="col-span-3 text-sm">${asset.account}</div>
                        <input type="number" value="${asset.amount}" 
                            class="col-span-4 px-2 py-1 border rounded text-sm asset-amount"
                            data-date="${asset.date}" data-account="${asset.account}">
                        <input type="text" value="${asset.note}" 
                            class="col-span-4 px-2 py-1 border rounded text-sm asset-note"
                            data-date="${asset.date}" data-account="${asset.account}">
                        <button class="col-span-1 text-red-500 delete-asset-btn" 
                            data-date="${asset.date}" data-account="${asset.account}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(dateDiv);
    });
    
    // 添加展开/收起功能
    document.querySelectorAll('.history-details').forEach((el, index) => {
        const header = el.previousElementSibling;
        header.addEventListener('click', () => {
            el.classList.toggle('hidden');
            const icon = header.querySelector('i');
            icon.classList.toggle('rotate-180');
        });
        
        // 默认展开最新日期
        if (index === 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    
    // 添加删除事件监听器
    document.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const date = e.target.closest('button').dataset.date;
            const account = e.target.closest('button').dataset.account;
            deleteAsset(date, account);
        });
    });
}

// 渲染快照列表
function renderSnapshotList() {
    const snapshotList = document.getElementById('snapshotList');
    snapshotList.innerHTML = '';
    
    // 获取最近的记录日期
    const dates = [...new Set(window.state.data.assets.map(a => a.date))].sort().reverse();
    const latestDate = dates[0];
    
    if (!latestDate) {
        snapshotList.innerHTML = '<div class="text-center py-4 text-gray-500">暂无资产数据</div>';
        return;
    }
    
    // 获取该日期的资产快照
    const snapshot = window.state.data.assets.filter(a => a.date === latestDate);
    
    // 按金额排序，显示资产最多的在前面
    snapshot.sort((a, b) => b.amount - a.amount);
    
    snapshot.forEach(asset => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center p-2 border-b';
        itemDiv.innerHTML = `
            <div>
                <div class="font-medium">${asset.account}</div>
                <div class="text-sm text-gray-500">${asset.date}</div>
            </div>
            <div class="text-right">
                <div class="font-medium">${window.formatAmountForDisplay(asset.amount, window.state.data.config.units.summary)} ${window.state.data.config.units.summary}</div>
                ${asset.note ? `<div class="text-sm text-gray-500">${asset.note}</div>` : ''}
            </div>
        `;
        snapshotList.appendChild(itemDiv);
    });
}

// 更新总计
function updateTotal() {
    let total = 0;
    const currentDate = document.getElementById('currentDate').textContent;
    
    // 处理金额输入框
    document.querySelectorAll('.amount-input').forEach(input => {
        const account = input.dataset.account;
        const displayValue = input.value.trim();
        
        // 检查账户是否被隐藏
        const isHidden = window.state.data.config.hiddenAccounts && 
                        window.state.data.config.hiddenAccounts.includes(account);
        
        if (displayValue && !isHidden) {
            const value = window.parseAmount(displayValue, window.state.data.config.units.record);
            total += value;
            
            // 更新或创建资产记录
            let asset = window.state.data.assets.find(a => 
                a.date === currentDate && a.account === account
            );
            
            if (!asset) {
                // 获取备注值（仅在显示备注时）
                let note = "";
                if (window.state.data.config.showNotes) {
                    const noteInput = document.querySelector(`.note-input[data-account="${account}"]`);
                    note = noteInput ? noteInput.value : "";
                }
                
                asset = { date: currentDate, account, amount: 0, note: "" };
                window.state.data.assets.push(asset);
            }
            
            asset.amount = value;
        }
    });
    
    // 处理备注输入框（仅在显示备注时）
    if (window.state.data.config.showNotes) {
        document.querySelectorAll('.note-input').forEach(input => {
            const account = input.dataset.account;
            const note = input.value;
            
            // 检查账户是否被隐藏
            const isHidden = window.state.data.config.hiddenAccounts && 
                            window.state.data.config.hiddenAccounts.includes(account);
            
            if (isHidden) return; // 如果账户被隐藏，跳过处理
            
            // 查找或创建资产记录
            let asset = window.state.data.assets.find(a => 
                a.date === currentDate && a.account === account
            );
            
            if (!asset) {
                // 获取金额值
                const amountInput = document.querySelector(`.amount-input[data-account="${account}"]`);
                const displayValue = amountInput ? amountInput.value.trim() : "0";
                const amount = displayValue ? window.parseAmount(displayValue, window.state.data.config.units.record) : 0;
                
                asset = { date: currentDate, account, amount, note: "" };
                window.state.data.assets.push(asset);
            }
            
            asset.note = note;
        });
    }
    
    // 显示总计和单位（使用专门的总计金额格式化函数）
    document.getElementById('totalAmount').textContent = 
        window.formatTotalAmountForDisplay(total, window.state.data.config.units.summary);
    document.getElementById('totalUnit').textContent = window.state.data.config.units.summary;
}

// 更新总览页总资产显示
function updateOverviewTotal() {
    // 获取最新日期
    const dates = [...new Set(window.state.data.assets.map(a => a.date))].sort();
    const latestDate = dates[dates.length - 1];
    
    // 计算最新日期的总资产（排除隐藏账户和被筛选掉的账户）
    let total = 0;
    const filteredAccounts = window.state.data.config.filteredAccounts || [];
    const hiddenAccounts = window.state.data.config.hiddenAccounts || [];
    
    // 使用 for 循环而不是 forEach 提高性能
    for (let i = 0; i < window.state.data.assets.length; i++) {
        const asset = window.state.data.assets[i];
        // 只计算最新日期且未被筛选掉和未被隐藏的资产
        if (asset.date === latestDate && 
            !filteredAccounts.includes(asset.account) && 
            !hiddenAccounts.includes(asset.account)) {
            total += asset.amount;
        }
    }
    
    // 显示总计和单位（使用专门的总计金额格式化函数）
    document.getElementById('overviewTotalAmount').textContent = 
        window.formatTotalAmountForDisplay(total, window.state.data.config.units.summary);
    document.getElementById('overviewTotalUnit').textContent = window.state.data.config.units.summary;
}

// 将函数添加到全局作用域
window.renderRecordPage = renderRecordPage;
window.renderOverviewPage = renderOverviewPage;
window.renderSettingsPage = renderSettingsPage;
window.renderAccountFilters = renderAccountFilters;
window.renderUnitButtons = renderUnitButtons;
window.renderAccountsManagement = renderAccountsManagement;
window.renderHistoryEditor = renderHistoryEditor;
window.renderSnapshotList = renderSnapshotList;
window.updateTotal = updateTotal;
window.updateOverviewTotal = updateOverviewTotal;