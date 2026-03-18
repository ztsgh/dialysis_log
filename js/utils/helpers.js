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

    // 格式化日期
    function formatDate(dateStr) {
        if (!dateStr) return '--';
        
        let normalizedDate = dateStr.trim();
        if (normalizedDate.includes('/')) {
            const parts = normalizedDate.split('/');
            if (parts.length === 3) {
                const year = parts[0].trim();
                const month = parts[1].trim().padStart(2, '0');
                const day = parts[2].trim().padStart(2, '0');
                normalizedDate = `${year}-${month}-${day}`;
            }
        }
        
        const date = new Date(normalizedDate);
        if (isNaN(date.getTime())) return '--';
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
        const today = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
        return dateStr === today;
    }

    // 判断是否为昨天
    function isYesterday(dateStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = new Date(yesterday.getTime() + yesterday.getTimezoneOffset() * 60000).toISOString().split('T')[0];
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

    return {
        escapeHtml,
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
        debounce,
        throttle
    };
})();

// 挂载到全局
window.Helpers = Helpers;
window.escapeHtml = Helpers.escapeHtml;
window.formatDate = Helpers.formatDate;
