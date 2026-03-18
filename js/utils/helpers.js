/**
 * 肾友日记 - 工具函数模块
 * 纯函数，不依赖 DOM 或业务逻辑
 */

const Helpers = (function() {
    // HTML 转义（防止 XSS）
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    // 统一的日期解析函数（避免时区问题）
    function parseDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    // 获取今天的日期字符串 (YYYY-MM-DD)
    function getTodayStr() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // 格式化日期
    function formatDate(dateStr) {
        if (!dateStr) return '--';
        
        const date = parseDate(dateStr);
        if (!date || isNaN(date.getTime())) return '--';
        
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${month}月${day}日 ${weekDays[date.getDay()]}`;
    }

    // 获取日期范围
    function getDateRange(days) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        return { start, end };
    }

    // 格式化体重（带单位）
    function formatWeight(value) {
        return value ? `${value} kg` : '--';
    }

    // 格式化脱水量
    function formatUF(value) {
        return value ? `${value} ml` : '--';
    }

    // 格式化血压
    function formatBP(value) {
        return value || '--';
    }

    // 计算体重差
    function calculateWeightDiff(before, after) {
        if (!before || !after) return '--';
        const diff = (parseFloat(before) - parseFloat(after)).toFixed(1);
        return `${diff} kg`;
    }

    // 获取周开始日期
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // 获取月开始日期
    function getMonthStart(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    // 判断是否为今天
    function isToday(dateStr) {
        return dateStr === getTodayStr();
    }

    // 判断是否为昨天
    function isYesterday(dateStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        return dateStr === yesterdayStr;
    }

    // 安全的 JSON 解析
    function safeJSONParse(str, defaultValue = null) {
        try {
            return str ? JSON.parse(str) : defaultValue;
        } catch (e) {
            console.error('JSON 解析失败:', e);
            return defaultValue;
        }
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 安全的数值解析（返回有效数字或默认值）
    function safeParseFloat(value, defaultValue = 0) {
        if (value === null || value === undefined || value === '') return defaultValue;
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    // 安全的整数解析（返回有效整数或默认值）
    function safeParseInt(value, defaultValue = 0) {
        if (value === null || value === undefined || value === '') return defaultValue;
        const num = parseInt(value, 10);
        return isNaN(num) ? defaultValue : num;
    }

    // 检查是否为有效数值
    function isValidNumber(value) {
        if (value === null || value === undefined || value === '') return false;
        const num = parseFloat(value);
        return !isNaN(num) && isFinite(num);
    }

    // 班次标签辅助函数
    function getShiftLabel(shiftValue) {
        if (!shiftValue) return '';
        if (shiftValue === 'morning') return '早班';
        if (shiftValue === 'midday') return '中班';
        if (shiftValue === 'evening') return '晚班';
        if (shiftValue === 'custom') return '自定义';
        return '';
    }

    // 创建记录项HTML（公共函数，消除代码重复）
    function createRecordItem(record, options = {}) {
        const { showDelete = true } = options;
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
        
        const deleteBtn = showDelete ?
            `<div class="record-item-footer"><button class="btn-delete" onclick="event.stopPropagation(); deleteRecordConfirm(${record.id})">删除</button></div>` : '';
        
        return `
            <div class="record-item" onclick="viewRecordDetail(${record.id})">
                <div class="record-item-header">
                    <span class="record-type ${typeClass}">${typeText}</span>
                    <span class="record-date">${escapeHtml(dateStr)}</span>
                </div>
                <div class="record-item-body">
                    ${bodyHtml}
                </div>
                ${deleteBtn}
            </div>
        `;
    }

    return {
        escapeHtml,
        parseDate,
        getTodayStr,
        formatDate,
        getDateRange,
        formatWeight,
        formatUF,
        formatBP,
        calculateWeightDiff,
        getWeekStart,
        getMonthStart,
        isToday,
        isYesterday,
        safeJSONParse,
        safeParseFloat,
        safeParseInt,
        isValidNumber,
        debounce,
        throttle,
        getShiftLabel,
        createRecordItem
    };
})();

// 挂载到全局
window.Helpers = Helpers;
window.escapeHtml = Helpers.escapeHtml;
window.parseDate = Helpers.parseDate;
window.getTodayStr = Helpers.getTodayStr;
window.formatDate = Helpers.formatDate;
window.getShiftLabel = Helpers.getShiftLabel;
window.createRecordItem = Helpers.createRecordItem;
