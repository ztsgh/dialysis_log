/**
 * 肾友日记 - 历史记录页模块
 */

const HistoryPage = (function() {
    // 排序状态
    let sortDescending = true;
    let pendingDeleteId = null;

    // 加载历史记录页
    function load() {
        updateYearFilter();
        updateSortButton();
        filterRecords();
    }

    // 切换排序顺序
    function toggleSortOrder() {
        sortDescending = !sortDescending;
        updateSortButton();
        filterRecords();
    }

    // 更新排序按钮
    function updateSortButton() {
        const btn = document.getElementById('sort-order-btn');
        if (sortDescending) {
            btn.innerHTML = '<span id="sort-icon">↓</span> 最新优先';
        } else {
            btn.innerHTML = '<span id="sort-icon">↑</span> 最早优先';
        }
    }

    // 更新年份筛选器
    function updateYearFilter() {
        const records = Data.getRecords();
        const yearSelect = document.getElementById('filter-year');
        const currentYear = new Date().getFullYear();
        
        const years = new Set();
        records.forEach(r => {
            if (r.date) {
                const year = r.date.split('-')[0];
                if (year) years.add(year);
            }
        });
        
        years.add(currentYear.toString());
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        
        yearSelect.innerHTML = '<option value="">全部年份</option>';
        sortedYears.forEach(year => {
            yearSelect.innerHTML += `<option value="${year}">${year}年</option>`;
        });
        
        yearSelect.value = currentYear.toString();
    }

    // 筛选记录
    function filterRecords() {
        const typeFilter = document.getElementById('filter-type').value;
        const yearFilter = document.getElementById('filter-year').value;
        const monthFilter = document.getElementById('filter-month').value;
        
        let records = Data.getRecords();
        
        if (typeFilter !== 'all') {
            records = records.filter(r => r.type === typeFilter);
        }
        
        if (yearFilter) {
            records = records.filter(r => r.date && r.date.startsWith(yearFilter));
        }
        
        if (monthFilter) {
            records = records.filter(r => {
                if (!r.date) return false;
                const month = r.date.split('-')[1];
                return month === monthFilter;
            });
        }
        
        records.sort((a, b) => {
            const partsA = a.date.split('-');
            const partsB = b.date.split('-');
            const dateA = new Date(partsA[0], partsA[1] - 1, partsA[2]);
            const dateB = new Date(partsB[0], partsB[1] - 1, partsB[2]);
            return sortDescending ? (dateB - dateA) : (dateA - dateB);
        });
        
        const historyList = document.getElementById('history-list');
        
        if (records.length === 0) {
            historyList.innerHTML = '<p class="empty-tip">暂无符合条件的记录</p>';
        } else {
            historyList.innerHTML = records.map(r => createRecordItemWithActions(r)).join('');
        }
    }

    // 创建记录项
    function createRecordItemWithActions(record) {
        const typeClass = record.type === 'hd' ? 'hd' : 'pd';
        const typeText = record.type === 'hd' ? '🩺 血液透析' : '💊 腹膜透析';
        const dateStr = formatDate(record.date);
        
        let bodyHtml = '';
        if (record.type === 'hd') {
            // 如果 shiftLabel 为空但有 shift 值，尝试转换
            let shiftLabel = record.shiftLabel || '';
            if (!shiftLabel && record.shift) {
                shiftLabel = getShiftLabel(record.shift);
            }
            shiftLabel = shiftLabel || '--';
            const weightBefore = record.weightBefore ? record.weightBefore + ' kg' : '--';
            const weightAfter = record.weightAfter ? record.weightAfter + ' kg' : '--';
            // 优先显示实际脱水量，如果为空则显示目标脱水量
            const ufValue = record.actualUF || record.targetUF || '';
            const ufDisplay = ufValue ? ufValue + ' ml' : '--';
            const bpBefore = record.bpBefore || '--';
            const bpAfter = record.bpAfter ? '/' + record.bpAfter : '';
            const bed = record.bed || '--';
            
            bodyHtml = `
                <div class="record-item-row">
                    <div class="record-detail"><span class="record-detail-label">班次:</span><span class="record-detail-value">${escapeHtml(shiftLabel)}</span></div>
                    <div class="record-detail"><span class="record-detail-label">体重:</span><span class="record-detail-value">${escapeHtml(weightBefore)}→${escapeHtml(weightAfter)}</span></div>
                    <div class="record-detail"><span class="record-detail-label">脱水:</span><span class="record-detail-value">${escapeHtml(ufDisplay)}</span></div>
                </div>
                <div class="record-item-row">
                    <div class="record-detail"><span class="record-detail-label">血压:</span><span class="record-detail-value">${escapeHtml(bpBefore)}${escapeHtml(bpAfter)}</span></div>
                    <div class="record-detail"><span class="record-detail-label">床位:</span><span class="record-detail-value">${escapeHtml(bed)}</span></div>
                </div>
            `;
        } else {
            const concentration = record.concentration || '--';
            const inflow = record.inflow ? record.inflow + ' ml' : '--';
            const outflow = record.outflow ? record.outflow + ' ml' : '--';
            const dwellTime = record.dwellTime || '--';
            const weight = record.weight ? record.weight + ' kg' : '--';
            
            bodyHtml = `
                <div class="record-item-row">
                    <div class="record-detail"><span class="record-detail-label">浓度:</span><span class="record-detail-value">${escapeHtml(concentration)}</span></div>
                    <div class="record-detail"><span class="record-detail-label">灌入:</span><span class="record-detail-value">${escapeHtml(inflow)}</span></div>
                    <div class="record-detail"><span class="record-detail-label">排出:</span><span class="record-detail-value">${escapeHtml(outflow)}</span></div>
                </div>
                <div class="record-item-row">
                    <div class="record-detail"><span class="record-detail-label">留腹:</span><span class="record-detail-value">${escapeHtml(dwellTime)}</span></div>
                    <div class="record-detail"><span class="record-detail-label">体重:</span><span class="record-detail-value">${escapeHtml(weight)}</span></div>
                </div>
            `;
        }
        
        return `
            <div class="record-item" onclick="viewRecordDetail(${record.id})">
                <div class="record-item-header">
                    <span class="record-type ${typeClass}">${typeText}</span>
                    <span class="record-date">${escapeHtml(dateStr)}</span>
                </div>
                <div class="record-item-body">
                    ${bodyHtml}
                </div>
                <div class="record-item-footer">
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteRecordConfirm(${record.id})">删除</button>
                </div>
            </div>
        `;
    }

    // 删除确认
    function deleteRecordConfirm(id) {
        pendingDeleteId = id;
        document.getElementById('delete-modal').classList.add('show');
    }

    // 关闭删除模态框
    function closeDeleteModal() {
        pendingDeleteId = null;
        document.getElementById('delete-modal').classList.remove('show');
    }

    // 确认删除
    function confirmDelete() {
        if (pendingDeleteId !== null) {
            Data.deleteRecord(pendingDeleteId);
            showToast('记录已删除');
            closeDeleteModal();
            filterRecords();
            loadHomePage();
        }
    }

    return {
        load,
        toggleSortOrder,
        filterRecords,
        deleteRecordConfirm,
        closeDeleteModal,
        confirmDelete
    };
})();

// 全局别名
window.HistoryPage = HistoryPage;
window.loadHistoryPage = HistoryPage.load;
window.toggleSortOrder = HistoryPage.toggleSortOrder;
window.filterRecords = HistoryPage.filterRecords;
window.deleteRecordConfirm = HistoryPage.deleteRecordConfirm;
window.closeDeleteModal = HistoryPage.closeDeleteModal;
window.confirmDelete = HistoryPage.confirmDelete;
