/**
 * 肾友日记 - 数据层模块
 * 负责数据存储、CRUD操作
 */

const Data = (function() {
    // ==================== 常量定义 ====================
    const DATA_KEY = 'dialysis_records';
    const SETTINGS_KEY = 'dialysis_settings';

    // ==================== 私有变量 ====================
    let recordsCache = null;
    let settingsCache = null;
    let idCounter = 0;

    // ==================== 私有函数 ====================
    function generateUniqueId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        idCounter = (idCounter + 1) % 10000;
        return timestamp * 10000 + random * 10 + idCounter;
    }

    // ==================== 公共 API ====================
    
    // 获取所有记录（带缓存）
    function getRecords() {
        if (!Array.isArray(recordsCache)) {
            const data = localStorage.getItem(DATA_KEY);
            try {
                recordsCache = data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('记录解析失败，使用空数组:', e);
                recordsCache = [];
            }
        }
        return recordsCache;
    }

    // 清除数据缓存
    function clearRecordsCache() {
        recordsCache = null;
    }

    // 保存记录
    function saveRecords(records) {
        localStorage.setItem(DATA_KEY, JSON.stringify(records));
        recordsCache = records;
    }

    // 添加新记录
    function addRecord(record) {
        const records = getRecords();
        record.id = generateUniqueId();
        record.createdAt = new Date().toISOString();
        records.unshift(record);
        saveRecords(records);
        return record;
    }

    // 更新记录
    function updateRecord(id, updatedData) {
        const records = getRecords();
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = { ...records[index], ...updatedData, updatedAt: new Date().toISOString() };
            saveRecords(records);
            return records[index];
        }
        return null;
    }

    // 删除记录
    function deleteRecord(id) {
        const records = getRecords();
        const filtered = records.filter(r => r.id !== id);
        saveRecords(filtered);
    }

    // 获取设置（带缓存）
    function getSettings() {
        const defaultSettings = {
            dryWeight: '',
            dialysisType: 'hd',
            defaultShift: '',
            theme: 'auto',
            noteTemplates: []
        };
        
        if (!settingsCache || typeof settingsCache !== 'object') {
            const data = localStorage.getItem(SETTINGS_KEY);
            try {
                if (!data || data === 'undefined' || data === 'null' || data === '') {
                    throw new Error('Invalid settings data');
                }
                const parsed = JSON.parse(data);
                if (parsed && typeof parsed === 'object') {
                    settingsCache = parsed;
                } else {
                    throw new Error('Invalid settings data');
                }
            } catch (e) {
                console.error('设置解析失败，使用默认设置:', e);
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
                settingsCache = defaultSettings;
            }
        }
        return settingsCache || defaultSettings;
    }

    // 保存设置
    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        settingsCache = settings;
    }

    // 获取单条记录
    function getRecordById(id) {
        const records = getRecords();
        return records.find(r => r.id === id) || null;
    }

    // 清空所有记录
    function clearAllRecords() {
        saveRecords([]);
    }

    // 按类型获取记录
    function getRecordsByType(type) {
        const records = getRecords();
        return records.filter(r => r.type === type);
    }

    // 按日期范围获取记录
    function getRecordsByDateRange(startDate, endDate) {
        const records = getRecords();
        return records.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate >= startDate && recordDate <= endDate;
        });
    }

    // 导出 API
    return {
        generateUniqueId,
        getRecords,
        clearRecordsCache,
        saveRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        getSettings,
        saveSettings,
        getRecordById,
        clearAllRecords,
        getRecordsByType,
        getRecordsByDateRange
    };
})();

// 挂载到全局（使用赋值而非声明，避免冲突）
window.Data = Data;
window.generateUniqueId = Data.generateUniqueId;
window.getRecords = Data.getRecords;
window.clearRecordsCache = Data.clearRecordsCache;
window.saveRecords = Data.saveRecords;
window.addRecord = Data.addRecord;
window.updateRecord = Data.updateRecord;
window.deleteRecord = Data.deleteRecord;
window.getSettings = Data.getSettings;
window.saveSettings = Data.saveSettings;
