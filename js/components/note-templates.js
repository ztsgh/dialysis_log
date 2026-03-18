/**
 * 肾友日记 - 备注模板模块
 */

const NoteTemplates = (function() {
    // 加载模板列表
    function load() {
        const settings = Data.getSettings();
        const templates = settings.noteTemplates || [];
        const templateList = document.getElementById('template-list');
        
        if (templates.length === 0) {
            templateList.innerHTML = '<p class="empty-tip">暂无模板，添加后可在记录表单中快速使用</p>';
        } else {
            templateList.innerHTML = templates.map((template, index) => `
                <div class="template-item">
                    <span class="template-text">${escapeHtml(template)}</span>
                    <button type="button" class="btn btn-secondary btn-small" onclick="NoteTemplates.delete(${index})">删除</button>
                </div>
            `).join('');
        }
        
        updateButtons();
    }

    // 添加模板
    function add() {
        const input = document.getElementById('new-template');
        const text = input.value.trim();
        
        if (!text) {
            showToast('请输入模板内容');
            return;
        }
        
        const settings = Data.getSettings();
        if (!settings.noteTemplates) {
            settings.noteTemplates = [];
        }
        
        if (settings.noteTemplates.includes(text)) {
            showToast('该模板已存在');
            return;
        }
        
        if (settings.noteTemplates.length >= 10) {
            showToast('最多添加10个模板');
            return;
        }
        
        settings.noteTemplates.push(text);
        Data.saveSettings(settings);
        
        input.value = '';
        load();
        showToast('模板已添加');
    }

    // 删除模板
    function deleteIndex(index) {
        const settings = Data.getSettings();
        if (settings.noteTemplates && settings.noteTemplates.length > index) {
            settings.noteTemplates.splice(index, 1);
            Data.saveSettings(settings);
            load();
            showToast('模板已删除');
        }
    }

    // 插入模板到备注框
    function insert(text, targetId) {
        const textarea = document.getElementById(targetId);
        if (!textarea) return;
        
        const currentValue = textarea.value;
        textarea.value = currentValue ? currentValue + ' ' + text : text;
        textarea.focus();
    }

    // 更新表单中的模板按钮
    function updateButtons() {
        const settings = Data.getSettings();
        const templates = settings.noteTemplates || [];
        
        const hdContainer = document.getElementById('hd-template-btns');
        if (hdContainer) {
            hdContainer.innerHTML = templates.length ? templates.map((template, index) =>
                `<button type="button" class="template-btn" data-template-index="${index}" data-target="hd-notes">${escapeHtml(template)}</button>`
            ).join('') : '';
        }
        
        const pdContainer = document.getElementById('pd-template-btns');
        if (pdContainer) {
            pdContainer.innerHTML = templates.length ? templates.map((template, index) =>
                `<button type="button" class="template-btn" data-template-index="${index}" data-target="pd-notes">${escapeHtml(template)}</button>`
            ).join('') : '';
        }
        
        // 事件委托
        document.querySelectorAll('.template-btn[data-template-index]').forEach(btn => {
            btn.onclick = function() {
                const index = parseInt(this.getAttribute('data-template-index'));
                const targetId = this.getAttribute('data-target');
                const currentSettings = Data.getSettings();
                const currentTemplates = currentSettings.noteTemplates || [];
                if (currentTemplates[index]) {
                    insert(currentTemplates[index], targetId);
                }
            };
        });
    }

    return {
        load,
        add,
        delete: deleteIndex,
        insert,
        updateButtons
    };
})();

// 全局别名
window.NoteTemplates = NoteTemplates;
window.loadNoteTemplates = NoteTemplates.load;
window.addNoteTemplate = NoteTemplates.add;
window.deleteNoteTemplate = NoteTemplates.delete;
window.insertTemplate = NoteTemplates.insert;
window.updateTemplateButtons = NoteTemplates.updateButtons;
