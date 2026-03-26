/**
 * 肾友日记 - 透析记录Demo
 * 使用LocalStorage存储数据
 */

// ==================== 页面导航 ====================

function showPage(pageId) {
    try {
        // 只在非记录编辑页面时重置编辑状态
        if (pageId !== 'page-record-hd' && pageId !== 'page-record-pd') {
            window.editingRecordId = null;
        }
        
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 更新底部导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navMap = {
            'page-home': 0,
            'page-history': 1,
            'page-stats': 2,
            'page-settings': 3
        };
        
        if (navMap[pageId] !== undefined) {
            document.querySelectorAll('.nav-item')[navMap[pageId]].classList.add('active');
        }
        
        // 离开统计页时销毁图表实例
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id === 'page-stats' && pageId !== 'page-stats') {
            if (window.StatsPage && StatsPage.destroyAllCharts) {
                StatsPage.destroyAllCharts();
            }
        }
        
        // 根据页面加载数据
        if (pageId === 'page-home') {
            loadHomePage();
        } else if (pageId === 'page-history') {
            loadHistoryPage();
        } else if (pageId === 'page-stats') {
            loadStatsPage();
        } else if (pageId === 'page-settings') {
            loadSettingsPage();
        } else if (pageId === 'page-record-hd-quick') {
            // 每次进入快速添加页面时初始化默认值
            initQuickAddPage();
        }
    } catch (e) {
        console.error('页面切换错误:', e);
    }
}

// ==================== 数据导出 ====================

// CSV 字段转义函数（处理逗号、引号、换行符）
function escapeCSVField(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    // 如果包含逗号、引号或换行符，需要用引号包裹并转义内部引号
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function exportData() {
    const records = getRecords();
    if (records.length === 0) {
        showToast('暂无数据可导出');
        return;
    }
    
    // 生成CSV内容
    let csv = '\ufeff'; // UTF-8 BOM
    csv += '日期,类型,班次/浓度,透析方式,体重前(kg),体重后(kg),目标脱水量(ml),实际脱水量(ml),血压前,血压后,床位,烤电,烤电时长(分钟),不良反应,备注\n';
    
    records.forEach(r => {
        if (r.type === 'hd') {
            const modeLabel = DIALYSIS_MODES[r.mode] || '正常';
            csv += `${escapeCSVField(r.date)},血液透析,${escapeCSVField(r.shiftLabel)},${escapeCSVField(modeLabel)},${escapeCSVField(r.weightBefore)},${escapeCSVField(r.weightAfter)},${escapeCSVField(r.targetUF)},${escapeCSVField(r.actualUF)},${escapeCSVField(r.bpBefore)},${escapeCSVField(r.bpAfter)},${escapeCSVField(r.bed)},${escapeCSVField((r.heating || []).join('/'))},${escapeCSVField(r.heatingDuration)},${escapeCSVField((r.reactions || []).join('/'))},${escapeCSVField(r.notes)}\n`;
        } else {
            csv += `${escapeCSVField(r.date)},腹膜透析,${escapeCSVField(r.concentration)},,${escapeCSVField(r.weight)},,${escapeCSVField(r.inflow)},${escapeCSVField(r.outflow)},${escapeCSVField(r.dwellTime)},${escapeCSVField(r.fluidAppearance || '')},${escapeCSVField(r.bp)},,${escapeCSVField((r.reactions || []).join('/'))},${escapeCSVField(r.notes)}\n`;
        }
    });
    
    // 下载文件
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `透析记录_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('数据已导出');
}

// ==================== 数据导入 ====================

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            let importedRecords = [];
            
            if (fileName.endsWith('.json')) {
                // 导入JSON格式
                importedRecords = importFromJSON(content);
            } else if (fileName.endsWith('.csv')) {
                // 导入CSV格式
                importedRecords = importFromCSV(content);
            } else {
                showToast('不支持的文件格式');
                return;
            }
            
            if (importedRecords.length === 0) {
                showToast('没有有效数据可导入');
                return;
            }
            
            // 确认导入
            if (confirm(`将导入 ${importedRecords.length} 条记录，是否继续？\n（现有数据将被保留）`)) {
                // 合并数据，根据日期+类型去重
                const existingRecords = getRecords();
                const recordKeySet = new Map();
                
                // 现有记录建立去重 key
                existingRecords.forEach(r => {
                    const key = `${r.date}-${r.type}`;
                    recordKeySet.set(key, r);
                });
                
                let duplicateCount = 0;
                const newRecords = [];
                const importedKeySet = new Map();
                
                // 导入记录去重（同时检查内部重复和与现有记录的重复）
                importedRecords.forEach(record => {
                    const key = `${record.date}-${record.type}`;
                    // 检查是否已存在
                    if (recordKeySet.has(key) || importedKeySet.has(key)) {
                        duplicateCount++;
                    } else {
                        importedKeySet.set(key, true);
                        recordKeySet.set(key, record);
                        newRecords.push(record);
                    }
                });
                
                // 为导入的记录分配新ID
                newRecords.forEach(record => {
                    record.id = generateUniqueId();
                    if (!record.createdAt) {
                        record.createdAt = new Date().toISOString();
                    }
                    // 如果 shiftLabel 为空但 shift 有值，尝试生成
                    if (!record.shiftLabel && record.shift) {
                        record.shiftLabel = getShiftLabel(record.shift);
                    }
                });
                
                // 合并并保存
                const mergedRecords = [...newRecords, ...existingRecords];
                // 按日期排序（最新的在前）
                mergedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
                saveRecords(mergedRecords);
                
                let toastMsg = `成功导入 ${newRecords.length} 条记录`;
                if (duplicateCount > 0) {
                    toastMsg += `（${duplicateCount}条重复已跳过）`;
                }
                showToast(toastMsg);
                
                // 刷新页面数据
                try {
                    loadHomePage();
                } catch (e) {
                    console.error('刷新页面失败:', e);
                }
            }
        } catch (error) {
            console.error('导入错误:', error);
            showToast('导入失败：' + error.message);
        }
    };
    
    reader.onerror = function() {
        showToast('文件读取失败');
    };
    
    reader.readAsText(file, 'UTF-8');
    
    // 清空input，允许重复导入同一文件
    input.value = '';
}

// 从JSON导入
function importFromJSON(content) {
    try {
        const data = JSON.parse(content);
        // 支持数组或对象格式
        if (Array.isArray(data)) {
            return data.filter(r => r.type && r.date);
        } else if (data.records && Array.isArray(data.records)) {
            return data.records.filter(r => r.type && r.date);
        }
        return [];
    } catch (e) {
        console.error('JSON解析错误:', e);
        return [];
    }
}

// 从CSV导入
function importFromCSV(content) {
    try {
        // 移除BOM标记
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        
        // 处理不同换行符
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
        return [];
    }
    
    const headers = parseCSVLine(lines[0]);
        const records = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = parseCSVLine(line);
            
            // 构建行数据对象
            const row = {};
            headers.forEach((h, idx) => {
                row[h.trim()] = (values[idx] || '').trim();
            });
            
            // 检查日期是否有效
            if (!row['日期']) {
                continue;
            }
            
            // 解析类型
            const type = row['类型'] === '腹膜透析' ? 'pd' : 'hd';
            
            // 标准化日期格式（确保月和日有前导零，支持 - 和 / 分隔符）
            const normalizeDate = (dateStr) => {
                if (!dateStr) return '';
                // 去除前后空格
                dateStr = dateStr.trim();
                // 支持短横和斜杠两种分隔符
                let parts = dateStr.split('-');
                if (parts.length !== 3) {
                    parts = dateStr.split('/');
                }
                if (parts.length === 3) {
                    const year = parts[0].trim();
                    const month = parts[1].trim().padStart(2, '0');
                    const day = parts[2].trim().padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
                return dateStr.trim();
            };
            
            if (type === 'hd') {
                // 根据班次标签反推班次值
                let shiftValue = '';
                if (row['班次'] === '早班') shiftValue = 'morning';
                else if (row['班次'] === '中班') shiftValue = 'midday';
                else if (row['班次'] === '晚班') shiftValue = 'evening';
                else if (row['班次']) shiftValue = 'custom';
                
                // 解析透析方式
                let modeValue = 'normal';
                if (row['透析方式'] === '血滤') modeValue = 'hemofiltration';
                else if (row['透析方式'] === '灌流') modeValue = 'perfusion';
                
                const record = {
                    id: generateUniqueId(),
                    type: 'hd',
                    date: normalizeDate(row['日期']),
                    shift: shiftValue,
                    shiftLabel: row['班次'] || '',
                    startTime: '',
                    endTime: '',
                    mode: modeValue,
                    bed: row['床位'] || '',
                    weightBefore: row['体重前(kg)'] || '',
                    weightAfter: row['体重后(kg)'] || '',
                    actualUF: row['脱水量(ml)'] || '',
                    bpBefore: row['血压前'] || '',
                    bpAfter: row['血压后'] || '',
                    heating: row['烤电'] ? row['烤电'].split('/') : [],
                    heatingDuration: row['烤电时长(分钟)'] || '',
                    reactions: row['不良反应'] ? row['不良反应'].split('/') : [],
                    notes: row['备注'] || '',
                    createdAt: new Date().toISOString()
                };
                records.push(record);
            } else {
                const record = {
                    id: generateUniqueId(),
                    type: 'pd',
                    date: normalizeDate(row['日期']),
                    concentration: row['浓度'] || '',
                    inflow: row['灌入量(ml)'] || '',
                    outflow: row['排出量(ml)'] || '',
                    dwellTime: row['留腹时间'] || '',
                    weight: row['体重前(kg)'] || '',
                    bp: row['血压前'] || '',
                    reactions: row['不良反应'] ? row['不良反应'].split('/') : [],
                    notes: row['备注'] || '',
                    createdAt: new Date().toISOString()
                };
                records.push(record);
            }
        }
        
        return records;
    } catch (e) {
        console.error('CSV解析错误:', e);
        return [];
    }
}

// 解析CSV行（处理引号内的逗号）
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            // 检查是否为转义引号（两个连续引号）
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // 跳过下一个引号
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result;
}

// 清除所有数据
function clearAllData() {
    if (confirm('确定要清除所有透析记录吗？此操作不可恢复！')) {
        Data.clearAllRecords();
        showToast('所有透析记录已清除');
        loadHomePage();
    }
}

// ==================== 工具函数 ====================

// 生成记录详情 HTML（公共函数，消除代码重复）
function generateRecordDetailsHtml(record) {
    let detailsHtml = '';
    if (record.type === 'hd') {
        // 透析类型显示
        const modeLabel = DIALYSIS_MODES[record.mode] || '正常';
        detailsHtml = `
            <div class="record-detail">
                <span class="record-detail-label">班次</span>
                <span class="record-detail-value">${escapeHtml(record.shiftLabel) || '--'}</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">类型</span>
                <span class="record-detail-value">${escapeHtml(modeLabel)}</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">透前体重</span>
                <span class="record-detail-value">${escapeHtml(record.weightBefore) || '--'} kg</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">透后体重</span>
                <span class="record-detail-value">${escapeHtml(record.weightAfter) || '--'} kg</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">脱水量</span>
                <span class="record-detail-value">${escapeHtml(record.actualUF) || '--'} ml</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">床位</span>
                <span class="record-detail-value">${escapeHtml(record.bed) || '--'}</span>
            </div>
        `;
        if (record.heating && record.heating.length > 0) {
            detailsHtml += `
                <div class="record-detail">
                    <span class="record-detail-label">烤电</span>
                    <span class="record-detail-value">${escapeHtml(record.heating.join('、'))}</span>
                </div>
            `;
        }
    } else {
        detailsHtml = `
            <div class="record-detail">
                <span class="record-detail-label">灌入量</span>
                <span class="record-detail-value">${escapeHtml(record.inflow) || '--'} ml</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">排出量</span>
                <span class="record-detail-value">${escapeHtml(record.outflow) || '--'} ml</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">浓度</span>
                <span class="record-detail-value">${escapeHtml(record.concentration) || '--'}</span>
            </div>
            <div class="record-detail">
                <span class="record-detail-label">留腹时间</span>
                <span class="record-detail-value">${escapeHtml(record.dwellTime) || '--'}</span>
            </div>
        `;
    }
    return detailsHtml;
}

// 显示Toast提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 保存血液透析记录 - 委托给forms.js中带验证的版本
function saveHDRecord() {
    Forms.submitHD();
}

// 保存腹膜透析记录 - 委托给forms.js中带验证的版本
function savePDRecord() {
    Forms.submitPD();
}

// 保存设置
function saveSettings() {
    const settings = {
        dryWeight: document.getElementById('dry-weight').value,
        dialysisType: document.getElementById('dialysis-type').value,
        defaultShift: document.getElementById('default-shift').value,
        theme: getSettings().theme || 'auto',
        noteTemplates: getSettings().noteTemplates || []
    };
    Data.saveSettings(settings);
    showToast('设置已保存');
}

// 快速保存血液透析记录
function saveQuickHDRecord() {
    const date = document.getElementById('quick-date').value;
    const shift = document.getElementById('quick-shift').value;
    const weightBefore = document.getElementById('quick-weight-before').value;
    const targetUF = document.getElementById('quick-target-uf').value;
    const bed = document.getElementById('quick-bed').value;
    const mode = document.getElementById('quick-mode').value || 'normal';
    
    // 验证必填字段
    if (!date) {
        showToast('请选择透析日期');
        return;
    }
    if (!shift) {
        showToast('请选择透析班次');
        return;
    }
    if (!weightBefore) {
        showToast('请输入透析前体重');
        return;
    }
    
    // 获取班次显示标签
    const shiftLabel = Helpers.getShiftLabel(shift);
    
    // 创建记录
    const record = {
        id: Date.now(),
        type: 'hd',
        date: date,
        shift: shift,
        shiftLabel: shiftLabel,
        weightBefore: weightBefore,
        targetUF: targetUF,
        bed: bed,
        mode: mode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // 保存记录
    Data.addRecord(record);
    showToast('记录已保存');
    
    // 返回首页并刷新
    showPage('page-home');
    loadHomePage();
}

// 初始化快速添加页面
function initQuickAddPage() {
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quick-date').value = today;
    
    // 设置默认班次（从设置中读取）
    const settings = getSettings();
    if (settings.defaultShift) {
        document.getElementById('quick-shift').value = settings.defaultShift;
    }
}

// 编辑记录
function editRecord(id) {
    const records = getRecords();
    const record = records.find(r => r.id === id);
    
    if (!record) {
        showToast('记录不存在');
        return;
    }
    
    // 设置编辑状态（使用全局属性，与 forms.js 保持一致）
    window.editingRecordId = id;
    
    if (record.type === 'hd') {
        // 填充血液透析表单
        // 日期格式处理：确保日期只包含日期部分（YYYY-MM-DD）
        const dateValue = record.date ? record.date.split('T')[0] : '';
        document.getElementById('hd-date').value = dateValue;
        document.getElementById('hd-shift').value = record.shift || '';
        
        // 先填充时间值，再根据班次类型决定是否调用 onShiftChange
        document.getElementById('hd-start-time').value = record.startTime || '';
        document.getElementById('hd-end-time').value = record.endTime || '';
        
        // 根据班次类型决定时间输入框的显示状态
        const timeRow = document.getElementById('hd-time-row');
        const startTimeInput = document.getElementById('hd-start-time');
        const endTimeInput = document.getElementById('hd-end-time');
        const selectedShift = record.shift || '';
        
        if (selectedShift === 'custom') {
            timeRow.style.display = 'grid';
            startTimeInput.required = true;
            endTimeInput.required = true;
        } else if (SHIFT_TIMES[selectedShift]) {
            timeRow.style.display = 'none';
            startTimeInput.required = false;
            endTimeInput.required = false;
        } else {
            timeRow.style.display = 'none';
            startTimeInput.required = false;
            endTimeInput.required = false;
        }
        document.getElementById('hd-mode').value = record.mode || 'normal';
        document.getElementById('hd-bed').value = record.bed || '';
        document.getElementById('hd-weight-before').value = record.weightBefore || '';
        document.getElementById('hd-weight-after').value = record.weightAfter || '';
        document.getElementById('hd-target-uf').value = record.targetUF || '';
        document.getElementById('hd-actual-uf').value = record.actualUF || '';
        document.getElementById('hd-bp-before').value = record.bpBefore || '';
        document.getElementById('hd-bp-after').value = record.bpAfter || '';
        document.getElementById('hd-heating-duration').value = record.heatingDuration || '';
        document.getElementById('hd-notes').value = record.notes || '';
        
        // 设置烤电选项
        document.querySelectorAll('input[name="hd-heating"]').forEach(cb => {
            cb.checked = (record.heating || []).includes(cb.value);
        });
        
        // 设置不良反应选项
        document.querySelectorAll('input[name="hd-reaction"]').forEach(cb => {
            cb.checked = (record.reactions || []).includes(cb.value);
        });
        
        // 更新标题
        updateFormTitle('hd', '编辑血液透析记录');
        
        showPage('page-record-hd');
    } else if (record.type === 'pd') {
        // 填充腹膜透析表单
        // 日期格式处理：确保日期只包含日期部分（YYYY-MM-DD）
        const dateValue = record.date ? record.date.split('T')[0] : '';
        document.getElementById('pd-date').value = dateValue;
        document.getElementById('pd-concentration').value = record.concentration || '';
        document.getElementById('pd-inflow').value = record.inflow || '';
        document.getElementById('pd-outflow').value = record.outflow || '';
        document.getElementById('pd-dwell-time').value = record.dwellTime || '';
        document.getElementById('pd-fluid-appearance').value = record.fluidAppearance || '';
        document.getElementById('pd-weight').value = record.weight || '';
        document.getElementById('pd-bp').value = record.bp || '';
        document.getElementById('pd-notes').value = record.notes || '';
        
        // 设置不良反应选项
        document.querySelectorAll('input[name="pd-reaction"]').forEach(cb => {
            cb.checked = (record.reactions || []).includes(cb.value);
        });
        
        // 更新标题
        updateFormTitle('pd', '编辑腹膜透析记录');
        
        showPage('page-record-pd');
    }
}

// 查看记录详情
function viewRecordDetail(id) {
    // 点击记录项时跳转到编辑
    editRecord(id);
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 隐藏首屏 Loading
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('hidden');
    }
    // 清除超时
    if (window.__loaderTimeout) {
        clearTimeout(window.__loaderTimeout);
        window.__loaderTimeout = null;
    }
    
    // 初始化主题
    initTheme();
    
    initForms();
    initQuickAddPage();
    loadHomePage();
    
    // 绑定删除确认按钮事件
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    
    // 点击模态框背景关闭
    document.getElementById('delete-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDeleteModal();
        }
    });
    
    // 监听系统主题变化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            const settings = getSettings();
            if (settings.theme === 'auto') {
                // 自动模式下，跟随系统变化
                applyTheme('auto');
            }
        });
    }
    
    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // 初始化网络状态显示
    updateOnlineStatus();
});

// ==================== 网络状态管理 ====================

let isOnline = navigator.onLine;

function updateOnlineStatus() {
    const wasOffline = !isOnline;
    isOnline = navigator.onLine;
    
    if (isOnline) {
        if (wasOffline) {
            showToast('网络已恢复，数据已自动同步');
            triggerBackgroundSync();
        }
    } else {
        showToast('当前处于离线状态，数据将保存在本地');
    }
}

function triggerBackgroundSync() {
    // TODO: 后台同步预留功能（需对接后端API）
    // 当前纯前端版本不需要后台同步，保留此函数接口以便后续扩展
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register('sync-records');
        }).catch(() => {
            // 静默失败，不影响用户操作
        });
    }
}

// Service Worker 消息监听
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
            if (confirm('应用已更新到最新版本，是否刷新页面以获取最新内容？')) {
                window.location.reload();
            }
        }
    });
}