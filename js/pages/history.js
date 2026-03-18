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
            const dateA = Helpers.parseDate(a.date);
            const dateB = Helpers.parseDate(b.date);
            const timeA = dateA ? dateA.getTime() : 0;
            const timeB = dateB ? dateB.getTime() : 0;
            return sortDescending ? (timeB - timeA) : (timeA - timeB);
        });
        
        const historyList = document.getElementById('history-list');
        
        if (records.length === 0) {
            historyList.innerHTML = '<p class="empty-tip">暂无符合条件的记录</p>';
        } else {
            historyList.innerHTML = records.map(r => createRecordItemWithActions(r)).join('');
        }
    }

    // 使用公共函数创建记录项
    function createRecordItemWithActions(record) {
        return Helpers.createRecordItem(record, { showDelete: true });
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
