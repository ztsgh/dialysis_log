/**
 * 肾友日记 - 设置页模块
 */

const SettingsPage = (function() {
    // 加载设置页
    function load() {
        const settings = Data.getSettings();
        document.getElementById('dry-weight').value = settings.dryWeight || '';
        document.getElementById('dialysis-type').value = settings.dialysisType || 'hd';
        document.getElementById('default-shift').value = settings.defaultShift || '';
        
        // 更新主题按钮状态
        updateThemeButtons(settings.theme || 'auto');
        
        // 加载备注模板
        loadNoteTemplates();
        
        // 加载提醒设置
        if (typeof loadReminderSettings === 'function') {
            loadReminderSettings();
        }
    }

    return {
        load
    };
})();

// 全局别名
window.SettingsPage = SettingsPage;
window.loadSettingsPage = SettingsPage.load;
