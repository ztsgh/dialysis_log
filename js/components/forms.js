/**
 * 肾友日记 - 表单处理模块
 */

const Forms = (function() {
    // 班次选择变化处理
    function onShiftChange() {
        const shiftSelect = document.getElementById('hd-shift');
        const timeRow = document.getElementById('hd-time-row');
        const startTimeInput = document.getElementById('hd-start-time');
        const endTimeInput = document.getElementById('hd-end-time');
        
        const selectedShift = shiftSelect.value;
        
        if (selectedShift === 'custom') {
            timeRow.style.display = 'grid';
            startTimeInput.value = '';
            endTimeInput.value = '';
            startTimeInput.required = true;
            endTimeInput.required = true;
        } else if (CONSTANTS.SHIFT_TIMES[selectedShift]) {
            timeRow.style.display = 'none';
            startTimeInput.value = CONSTANTS.SHIFT_TIMES[selectedShift].start;
            endTimeInput.value = CONSTANTS.SHIFT_TIMES[selectedShift].end;
            startTimeInput.required = false;
            endTimeInput.required = false;
        } else {
            timeRow.style.display = 'none';
            startTimeInput.value = '';
            endTimeInput.value = '';
            startTimeInput.required = false;
            endTimeInput.required = false;
        }
    }

    // 初始化表单
    function init() {
        window.editingRecordId = null;
        
        const today = Helpers.getTodayStr();
        document.getElementById('hd-date').value = today;
        document.getElementById('pd-date').value = today;
        
        document.getElementById('hd-shift').value = '';
        document.getElementById('hd-time-row').style.display = 'none';
        document.getElementById('hd-start-time').value = '';
        document.getElementById('hd-end-time').value = '';
        
        document.getElementById('hd-mode').value = 'normal';
        
        // 清空血液透析字段
        ['hd-bed', 'hd-weight-before', 'hd-weight-after', 'hd-target-uf', 'hd-actual-uf', 
         'hd-bp-before', 'hd-bp-after', 'hd-heating-duration', 'hd-notes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        document.querySelectorAll('input[name="hd-heating"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="hd-reaction"]').forEach(cb => cb.checked = false);
        
        // 清空腹膜透析字段
        ['pd-concentration', 'pd-inflow', 'pd-outflow', 'pd-dwell-time', 
         'pd-fluid-appearance', 'pd-weight', 'pd-bp', 'pd-notes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.querySelectorAll('input[name="pd-reaction"]').forEach(cb => cb.checked = false);
        
        // 加载默认班次
        const settings = Data.getSettings();
        if (settings.defaultShift) {
            document.getElementById('hd-shift').value = settings.defaultShift;
            onShiftChange();
        }
        
        updateTitle('hd', '血液透析记录');
        updateTitle('pd', '腹膜透析记录');
    }

    // 更新表单标题
    function updateTitle(type, title) {
        const pageHeader = document.querySelector(`#page-record-${type} .page-header h2`);
        if (pageHeader) {
            pageHeader.textContent = title;
        }
    }

    // 提交血液透析表单
    function submitHD(e) {
        if (e) e.preventDefault();
        
        const shiftSelect = document.getElementById('hd-shift');
        const selectedShift = shiftSelect.value;
        const dateValue = document.getElementById('hd-date').value;
        
        if (!selectedShift) {
            showToast('请选择透析班次');
            return;
        }
        
        // 验证日期（与腹膜透析表单保持一致）
        if (!dateValue) {
            showToast('请选择透析日期');
            return;
        }
        const dateValidation = Validate.validateDate(dateValue, '透析日期');
        if (!dateValidation.valid) {
            showToast(dateValidation.message);
            return;
        }
        
        const weightBefore = document.getElementById('hd-weight-before').value;
        const weightAfter = document.getElementById('hd-weight-after').value;
        const actualUF = document.getElementById('hd-actual-uf').value;
        const targetUF = document.getElementById('hd-target-uf').value;
        const bpBefore = document.getElementById('hd-bp-before').value;
        const bpAfter = document.getElementById('hd-bp-after').value;
        
        const validations = [
            Validate.validateDate(dateValue, '透析日期'),
            Validate.validateWeight(weightBefore, '透析前体重'),
            Validate.validateWeight(weightAfter, '透析后体重'),
            Validate.validateUF(actualUF, '实际脱水量'),
            Validate.validateUF(targetUF, '目标脱水量'),
            Validate.validateBloodPressure(bpBefore, '透析前血压'),
            Validate.validateBloodPressure(bpAfter, '透析后血压')
        ];
        
        for (const v of validations) {
            if (!v.valid) {
                showToast(v.message);
                return;
            }
        }
        
        if (weightBefore && weightAfter && parseFloat(weightBefore) <= parseFloat(weightAfter)) {
            if (!confirm('提示：透析前体重未大于透析后体重。\n\n这种情况可能发生在透析期间进食或饮水后。\n\n是否仍要保存此记录？')) {
                return;
            }
        }
        
        const heating = [];
        document.querySelectorAll('input[name="hd-heating"]:checked').forEach(cb => heating.push(cb.value));
        
        const reactions = [];
        document.querySelectorAll('input[name="hd-reaction"]:checked').forEach(cb => reactions.push(cb.value));
        
        let shiftLabel = '';
        if (selectedShift === 'custom') {
            shiftLabel = '自定义';
        } else if (CONSTANTS.SHIFT_TIMES[selectedShift]) {
            shiftLabel = CONSTANTS.SHIFT_TIMES[selectedShift].label;
        }
        
        const record = {
            type: 'hd',
            date: dateValue,
            shift: selectedShift,
            shiftLabel: shiftLabel,
            startTime: document.getElementById('hd-start-time').value,
            endTime: document.getElementById('hd-end-time').value,
            mode: document.getElementById('hd-mode').value,
            bed: document.getElementById('hd-bed').value,
            weightBefore: weightBefore,
            weightAfter: weightAfter,
            targetUF: targetUF,
            actualUF: actualUF,
            bpBefore: bpBefore,
            bpAfter: bpAfter,
            heating: heating,
            heatingDuration: document.getElementById('hd-heating-duration').value,
            reactions: reactions,
            notes: document.getElementById('hd-notes').value
        };
        
        if (window.editingRecordId) {
            Data.updateRecord(window.editingRecordId, record);
            showToast('记录已更新');
        } else {
            Data.addRecord(record);
            showToast('血液透析记录已保存');
        }
        
        document.getElementById('form-hd').reset();
        init();
        showPage('page-home');
    }

    // 提交腹膜透析表单
    function submitPD(e) {
        if (e) e.preventDefault();
        
        const date = document.getElementById('pd-date').value;
        const concentration = document.getElementById('pd-concentration').value;
        const inflow = document.getElementById('pd-inflow').value;
        const outflow = document.getElementById('pd-outflow').value;
        const dwellTime = document.getElementById('pd-dwell-time').value;
        const weight = document.getElementById('pd-weight').value;
        const bp = document.getElementById('pd-bp').value;
        
        if (!date) { showToast('请选择透析日期'); return; }
        if (!concentration) { showToast('请选择透析液浓度'); return; }
        if (!inflow) { showToast('请输入灌入量'); return; }
        if (!outflow) { showToast('请输入排出量'); return; }
        if (!dwellTime) { showToast('请输入留腹时间'); return; }
        
        const validations = [
            Validate.validateWeight(weight, '体重'),
            Validate.validateBloodPressure(bp, '血压')
        ];
        
        for (const v of validations) {
            if (!v.valid) { showToast(v.message); return; }
        }
        
        if (parseFloat(inflow) < 0 || parseFloat(inflow) > 5000) {
            showToast('灌入量应在 0-5000 ml 之间');
            return;
        }
        if (parseFloat(outflow) < 0 || parseFloat(outflow) > 5000) {
            showToast('排出量应在 0-5000 ml 之间');
            return;
        }
        
        const reactions = [];
        document.querySelectorAll('input[name="pd-reaction"]:checked').forEach(cb => reactions.push(cb.value));
        
        const record = {
            type: 'pd',
            date: date,
            concentration: concentration,
            inflow: inflow,
            outflow: outflow,
            dwellTime: dwellTime,
            fluidAppearance: document.getElementById('pd-fluid-appearance').value,
            weight: weight,
            bp: bp,
            reactions: reactions,
            notes: document.getElementById('pd-notes').value
        };
        
        if (window.editingRecordId) {
            Data.updateRecord(window.editingRecordId, record);
            showToast('记录已更新');
        } else {
            Data.addRecord(record);
            showToast('腹膜透析记录已保存');
        }
        
        document.getElementById('form-pd').reset();
        init();
        showPage('page-home');
    }

    // 绑定事件
    function bindEvents() {
        document.getElementById('form-hd').addEventListener('submit', submitHD);
        document.getElementById('form-pd').addEventListener('submit', submitPD);
    }

    return {
        onShiftChange,
        init,
        updateTitle,
        bindEvents,
        submitHD,
        submitPD
    };
})();

// 全局别名
window.Forms = Forms;
window.onShiftChange = Forms.onShiftChange;
window.initForms = Forms.init;
window.updateFormTitle = Forms.updateTitle;
window.submitFormHD = Forms.submitHD;
