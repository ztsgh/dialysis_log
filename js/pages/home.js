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
            const recordDate = Helpers.parseDate(r.date);
            return recordDate && recordDate >= weekStart;
        });
        document.getElementById('week-count').textContent = weekRecords.length;
        
        const monthRecords = records.filter(r => {
            const recordDate = Helpers.parseDate(r.date);
            return recordDate && recordDate >= monthStart;
        });
        document.getElementById('month-count').textContent = monthRecords.length;
        
        document.getElementById('total-count').textContent = records.length;
        
        const recentList = document.getElementById('recent-list');
        const recentRecords = records.slice(0, 5);
        
        if (recentRecords.length === 0) {
            recentList.innerHTML = '<p class="empty-tip">暂无记录，点击上方按钮开始记录</p>';
        } else {
            recentList.innerHTML = recentRecords.map(r => createRecordItemLocal(r)).join('');
        }
    }

    // 使用公共函数创建记录项
    function createRecordItemLocal(record) {
        return Helpers.createRecordItem(record, { showDelete: true });
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
            const date = Helpers.parseDate(r.date);
            if (date) {
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!recordMap[key]) recordMap[key] = [];
                recordMap[key].push(r);
            }
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
        const clickDate = Helpers.parseDate(dateStr);
        if (!clickDate) return;
        
        const dayRecords = records.filter(r => {
            const recordDate = Helpers.parseDate(r.date);
            return recordDate && recordDate.toDateString() === clickDate.toDateString();
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
        onDayClick
    };
})();

window.HomePage = HomePage;
window.loadHomePage = HomePage.load;
