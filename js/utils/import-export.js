/**
 * 肾友日记 - 数据导入导出模块
 */

const ImportExport = (function() {
    // CSV 字段转义
    function escapeCSVField(field) {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    // 解析 CSV 行
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
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

    // 标准化日期格式
    function normalizeDate(dateStr) {
        if (!dateStr) return '';
        dateStr = dateStr.trim();
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
    }

    // 导出为 CSV
    function exportToCSV(records) {
        if (!records || records.length === 0) {
            return { success: false, message: '暂无数据可导出' };
        }
        
        let csv = '\ufeff';
        csv += '日期,类型,班次/浓度,透析方式,体重前(kg),体重后(kg),目标脱水量(ml),实际脱水量(ml),血压前,血压后,床位,烤电,烤电时长(分钟),不良反应,备注\n';
        
        records.forEach(r => {
            if (r.type === 'hd') {
                const modeLabel = CONSTANTS.DIALYSIS_MODES[r.mode] || '正常';
                csv += `${escapeCSVField(r.date)},血液透析,${escapeCSVField(r.shiftLabel)},${escapeCSVField(modeLabel)},${escapeCSVField(r.weightBefore)},${escapeCSVField(r.weightAfter)},${escapeCSVField(r.targetUF)},${escapeCSVField(r.actualUF)},${escapeCSVField(r.bpBefore)},${escapeCSVField(r.bpAfter)},${escapeCSVField(r.bed)},${escapeCSVField((r.heating || []).join('/'))},${escapeCSVField(r.heatingDuration)},${escapeCSVField((r.reactions || []).join('/'))},${escapeCSVField(r.notes)}\n`;
            } else {
                csv += `${escapeCSVField(r.date)},腹膜透析,${escapeCSVField(r.concentration)},,${escapeCSVField(r.weight)},,${escapeCSVField(r.inflow)},${escapeCSVField(r.outflow)},${escapeCSVField(r.dwellTime)},${escapeCSVField(r.fluidAppearance || '')},${escapeCSVField(r.bp)},,${escapeCSVField((r.reactions || []).join('/'))},${escapeCSVField(r.notes)}\n`;
            }
        });
        
        return { success: true, data: csv };
    }

    // 导出为 JSON
    function exportToJSON(records) {
        if (!records || records.length === 0) {
            return { success: false, message: '暂无数据可导出' };
        }
        
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            records: records
        };
        
        return { success: true, data: JSON.stringify(data, null, 2) };
    }

    // 下载文件
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // 从 JSON 解析
    function parseJSON(content) {
        try {
            const data = JSON.parse(content);
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

    // 从 CSV 解析
    function parseCSV(content) {
        try {
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            
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
                const row = {};
                headers.forEach((h, idx) => {
                    row[h.trim()] = (values[idx] || '').trim();
                });
                
                if (!row['日期']) continue;
                
                const type = row['类型'] === '腹膜透析' ? 'pd' : 'hd';
                
                if (type === 'hd') {
                    let shiftValue = '';
                    if (row['班次'] === '早班') shiftValue = 'morning';
                    else if (row['班次'] === '中班') shiftValue = 'midday';
                    else if (row['班次'] === '晚班') shiftValue = 'evening';
                    else if (row['班次']) shiftValue = 'custom';
                    
                    let modeValue = 'normal';
                    if (row['透析方式'] === '血滤') modeValue = 'hemofiltration';
                    else if (row['透析方式'] === '灌流') modeValue = 'perfusion';
                    
                    records.push({
                        id: Data.getRecords().length + Date.now() + Math.random() * 1000,
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
                    });
                } else {
                    records.push({
                        id: Data.getRecords().length + Date.now() + Math.random() * 1000,
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
                    });
                }
            }
            
            return records;
        } catch (e) {
            console.error('CSV解析错误:', e);
            return [];
        }
    }

    return {
        escapeCSVField,
        parseCSVLine,
        normalizeDate,
        exportToCSV,
        exportToJSON,
        downloadFile,
        parseJSON,
        parseCSV
    };
})();

// 挂载到全局
window.ImportExport = ImportExport;
