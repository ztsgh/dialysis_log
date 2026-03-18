/**
 * 肾友日记 - 主题管理组件
 */

const Theme = (function() {
    // 应用主题
    function applyTheme(theme) {
        const root = document.documentElement;
        root.classList.remove('dark-mode', 'light-mode');
        
        if (theme === 'dark') {
            root.classList.add('dark-mode');
        } else if (theme === 'light') {
            root.classList.add('light-mode');
        }
    }

    // 设置主题
    function setTheme(theme) {
        const settings = Data.getSettings();
        settings.theme = theme;
        Data.saveSettings(settings);
        
        applyTheme(theme);
        updateThemeButtons(theme);
        
        if (typeof showToast === 'function') {
            showToast('主题已更改');
        }
    }

    // 更新主题按钮状态
    function updateThemeButtons(activeTheme) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`theme-${activeTheme}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // 初始化主题
    function init() {
        const settings = Data.getSettings();
        const theme = settings.theme || 'auto';
        applyTheme(theme);
        updateThemeButtons(theme);
        
        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                const currentSettings = Data.getSettings();
                if (currentSettings.theme === 'auto') {
                    applyTheme('auto');
                }
            });
        }
    }

    return {
        applyTheme,
        setTheme,
        updateThemeButtons,
        init
    };
})();

// 挂载到全局
window.Theme = Theme;
window.applyTheme = Theme.applyTheme;
window.setTheme = Theme.setTheme;
window.initTheme = Theme.init;
window.updateThemeButtons = Theme.updateThemeButtons;
