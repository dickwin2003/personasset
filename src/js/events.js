// 事件处理模块

// 设置事件监听器
function setupEventListeners() {
    /** @type {any} */
    const globalWindow = window;
    // 导航按钮
    globalWindow.elements.recordBtn.addEventListener('click', () => switchView('record'));
    globalWindow.elements.overviewBtn.addEventListener('click', () => switchView('overview'));
    globalWindow.elements.settingsBtn.addEventListener('click', () => switchView('settings'));
    
    // 记录页按钮
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', importData);
    
    // 添加调试信息
    const exportClipboardBtn = document.getElementById('exportClipboardBtn');
    const importClipboardBtn = document.getElementById('importClipboardBtn');
    
    if (exportClipboardBtn) {
        console.log('Export clipboard button found');
        exportClipboardBtn.addEventListener('click', function() {
            console.log('Export clipboard button clicked');
            exportToClipboard();
        });
    } else {
        console.error('Export clipboard button not found');
    }
    
    if (importClipboardBtn) {
        console.log('Import clipboard button found');
        importClipboardBtn.addEventListener('click', function() {
            console.log('Import clipboard button clicked');
            importFromClipboard();
        });
    } else {
        console.error('Import clipboard button not found');
    }
    
    document.getElementById('populateLastDataBtn').addEventListener('click', populateLastData);
    
    // 设置页按钮
    document.getElementById('addAccountBtn').addEventListener('click', addAccount);
    document.getElementById('saveHistoryBtn').addEventListener('click', saveHistoryChanges);
    
    // 显示设置
    document.getElementById('showNotesCheckbox').addEventListener('change', toggleNotesDisplay);
    document.getElementById('showDecimalCheckbox').addEventListener('change', toggleDecimalDisplay);
    document.getElementById('thousandsSeparatorCheckbox').addEventListener('change', toggleThousandsSeparator);
    
    // 总览页事件监听器（使用防抖函数优化性能）
    document.getElementById('trendPeriodSelect').addEventListener('change', window.debouncedRenderOverviewPage);
    document.getElementById('logScaleCheckbox').addEventListener('change', window.debouncedRenderOverviewPage);
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 处理键盘快捷键
function handleKeyboardShortcuts(e) {
    // Ctrl+S 或 Cmd+S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveData();
    }
}

// 处理金额变更
function handleAmountChange(e) {
    updateTotal();
}

// 处理备注变更
function handleNoteChange(e) {
    // 只在显示备注时处理变更
    if (!window.state.data.config.showNotes) return;
    
    const account = e.target.dataset.account;
    const note = e.target.value;
    const currentDate = document.getElementById('currentDate').textContent;
    
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
}

// 处理键盘事件
function handleKeyDown(e) {
    if (e.key === 'Enter') {
        const inputs = Array.from(document.querySelectorAll('.amount-input'));
        const currentIndex = inputs.indexOf(e.target);
        const nextIndex = (currentIndex + 1) % inputs.length;
        inputs[nextIndex].focus();
    }
}

// 拖拽处理函数
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        // 重新排序数组
        const movedAccount = window.state.data.config.accounts[fromIndex];
        window.state.data.config.accounts.splice(fromIndex, 1);
        window.state.data.config.accounts.splice(toIndex, 0, movedAccount);
        
        // 重新渲染账户列表
        window.renderAccountsManagement();
        
        // 自动保存设置
        saveData();
    }
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

// 将函数添加到全局作用域
window.setupEventListeners = setupEventListeners;
window.handleKeyboardShortcuts = handleKeyboardShortcuts;
window.handleAmountChange = handleAmountChange;
window.handleNoteChange = handleNoteChange;
window.handleKeyDown = handleKeyDown;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;