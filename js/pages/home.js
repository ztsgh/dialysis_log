/**
 * 肾友日记 - 首页模块（日历版）
 */

const HomePage = (function() {
    let currentView = 'calendar';
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    function load() {
        loadStats();
        renderCalendar();
        
        if (currentView === 'calendar') {
            showCalendarView();
        } else {
            showListView();
        }
    }

    function loadStats() {
        const records = Data.getRecords();
        const now = new Date();
        
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + 6) % 7);
        weekStart.setHours(0, 0, 0, 0);
        
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const weekRecords = records.filter(r => {
            const parts = r.date.split('-');
            const recordDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return recordDate >= weekStart;
        });
        document.getElementById('week-count').textContent = weekRecords.length;
        
        const monthRecords = records.filter(r => {
            const parts = r.date.split('-');
            const recordDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return recordDate >= monthStart;
        });
        document.getElementById('month-count').textContent = monthRecords.length;
        
        document.getElementById('total-count').textContent = records.length;
        
        const recentList = document.getElementById('recent-list');
        const recentRecords = records.slice(0, 5);
        
        if (recentRecords.length === 0) {
            recentList.innerHTML = '<p class="empty-tip">暂无记录，点击上方按钮开始记录</p>';
        } else {
            recentList.innerHTML = recentRecords.map(r => createRecordItem(r)).join('');
        }
    }

    function createRecordItem(record) {
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

    function switchView(view) {
        currentView = view;
        
        document.getElementById('btn-calendar-view').classList.toggle('active', view === 'calendar');
        document.getElementById('btn-list-view').classList.toggle('active', view === 'list');
        
        if (view === 'calendar') {
            showCalendarView();
        } else {
            showListView();
        }
    }

    function showCalendarView() {
        document.getElementById('calendar-view').style.display = 'block';
        document.getElementById('list-view').style.display = 'none';
    }

    function showListView() {
        document.getElementById('calendar-view').style.display = 'none';
        document.getElementById('list-view').style.display = 'block';
    }

    function prevMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    }

    function nextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    }

    function renderCalendar() {
        const records = Data.getRecords();
        
        const titleEl = document.getElementById('calendar-title');
        titleEl.textContent = `${currentYear}年${currentMonth + 1}月`;
        
        const daysContainer = document.getElementById('calendar-days');
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
        
        const recordMap = {};
        records.forEach(r => {
            // 使用更可靠的日期解析方法
            const dateParts = r.date.split('-');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            if (!recordMap[key]) recordMap[key] = [];
            recordMap[key].push(r);
        });
        
        let html = '';
        
        // 上月日期
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day empty other-month"><span class="calendar-day-number">${day}</span></div>`;
        }
        
        // 当月日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${currentMonth}-${day}`;
            const dayRecords = recordMap[dateKey] || [];
            const isToday = isCurrentMonth && today.getDate() === day;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (dayRecords.length > 0) {
                const hdCount = dayRecords.filter(r => r.type === 'hd').length;
                const pdCount = dayRecords.filter(r => r.type === 'pd').length;
                if (hdCount > 0 && pdCount > 0) {
                    classes += ' hd-pd';
                } else if (hdCount > 0) {
                    classes += ' hd';
                } else if (pdCount > 0) {
                    classes += ' pd';
                }
            }
            
            html += `
                <div class="${classes}" onclick="HomePage.onDayClick('${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}')">
                    <span class="calendar-day-number">${day}</span>
                </div>
            `;
        }
        
        // 下月日期补齐
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day empty other-month"><span class="calendar-day-number">${day}</span></div>`;
        }
        
        daysContainer.innerHTML = html;
    }

    function onDayClick(dateStr) {
        const records = Data.getRecords();
        const dayRecords = records.filter(r => {
            // 使用更可靠的日期解析方法
            const recordParts = r.date.split('-');
            const recordDate = new Date(recordParts[0], recordParts[1] - 1, recordParts[2]);
            const clickParts = dateStr.split('-');
            const clickDate = new Date(clickParts[0], clickParts[1] - 1, clickParts[2]);
            return recordDate.toDateString() === clickDate.toDateString();
        });
        
        if (dayRecords.length === 0) {
            // 无记录 → 进入添加页面，日期自动填充
            Forms.init();
            const dateInput = document.getElementById('hd-date');
            if (dateInput) dateInput.value = dateStr;
            
            const pdDateInput = document.getElementById('pd-date');
            if (pdDateInput) pdDateInput.value = dateStr;
            
            showToast('添加 ' + dateStr + ' 的透析记录');
            showPage('page-record-hd');
        } else if (dayRecords.length === 1) {
            // 1条记录 → 进入修改页面
            editRecord(dayRecords[0].id);
        } else {
            // 多条记录 → 跳转到列表页筛选当天
            showToast('当天有 ' + dayRecords.length + ' 条记录');
            document.getElementById('filter-year').value = dateStr.split('-')[0];
            document.getElementById('filter-month').value = dateStr.split('-')[1];
            HistoryPage.filterRecords();
            showPage('page-history');
        }
    }

    return {
        load,
        switchView,
        prevMonth,
        nextMonth,
        renderCalendar,
        onDayClick,
        createRecordItem
    };
})();

window.HomePage = HomePage;
window.loadHomePage = HomePage.load;
