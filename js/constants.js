/**
 * 肾友日记 - 常量配置模块
 */

const CONSTANTS = (function() {
    // 班次时间配置
    const SHIFT_TIMES = {
        morning: { start: '06:30', end: '10:30', label: '早班' },
        midday: { start: '11:30', end: '15:30', label: '中班' },
        evening: { start: '16:30', end: '20:30', label: '晚班' }
    };

    // 透析方式配置
    const DIALYSIS_MODES = {
        normal: '正常',
        hemofiltration: '血滤',
        perfusion: '灌流'
    };

    // 透析液浓度选项
    const CONCENTRATIONS = ['1.5%', '2.0%', '2.5%', '4.25%'];

    // 透析液性状选项
    const FLUID_APPEARANCES = ['清亮', '微浑', '浑浊', '血性'];

    // 不良反应选项 - 血液透析（与index.html同步）
    const HD_REACTIONS = ['低血压', '抽筋', '恶心', '头晕', '无'];

    // 不良反应选项 - 腹膜透析（与index.html同步）
    const PD_REACTIONS = ['腹痛', '发热', '水肿', '无'];

    // 烤电项目选项（与index.html同步）
    const HEATING_OPTIONS = ['红外线照射', '中频理疗', '低频理疗', '超短波治疗', '其他'];

    // 提醒提前时间选项
    const REMINDER_TIMES = [
        { value: 30, label: '30分钟' },
        { value: 60, label: '1小时' },
        { value: 120, label: '2小时' }
    ];

    return {
        SHIFT_TIMES,
        DIALYSIS_MODES,
        CONCENTRATIONS,
        FLUID_APPEARANCES,
        HD_REACTIONS,
        PD_REACTIONS,
        HEATING_OPTIONS,
        REMINDER_TIMES
    };
})();

// 挂载到全局
window.CONSTANTS = CONSTANTS;
window.SHIFT_TIMES = CONSTANTS.SHIFT_TIMES;
window.DIALYSIS_MODES = CONSTANTS.DIALYSIS_MODES;
