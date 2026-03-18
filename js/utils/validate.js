/**
 * 肾友日记 - 数据验证模块
 * 纯验证函数，不依赖 DOM
 */

const Validate = (function() {
    // 验证体重范围（20kg - 200kg）
    function validateWeight(value, fieldName) {
        if (!value) return { valid: true };
        const num = parseFloat(value);
        if (isNaN(num) || num < 20 || num > 200) {
            return { valid: false, message: `${fieldName}应在 20-200 kg 之间` };
        }
        return { valid: true };
    }

    // 验证脱水量范围（0 - 10000ml）
    function validateUF(value, fieldName) {
        if (!value) return { valid: true };
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 10000) {
            return { valid: false, message: `${fieldName}应在 0-10000 ml 之间` };
        }
        return { valid: true };
    }

    // 验证血压格式（如：120/80）
    function validateBloodPressure(value, fieldName) {
        if (!value) return { valid: true };
        const pattern = /^(\d{2,3})\s*[\/\\]\s*(\d{2,3})$/;
        if (!pattern.test(value)) {
            return { valid: false, message: `${fieldName}格式不正确，应为如：120/80` };
        }
        const match = value.match(pattern);
        const systolic = parseInt(match[1]);
        const diastolic = parseInt(match[2]);
        if (systolic < 60 || systolic > 250 || diastolic < 40 || diastolic > 150) {
            return { valid: false, message: `${fieldName}数值异常，请检查` };
        }
        return { valid: true };
    }

    // 验证灌入量/排出量范围（0 - 5000ml）
    function validateFluidVolume(value, fieldName) {
        if (!value) return { valid: true };
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 5000) {
            return { valid: false, message: `${fieldName}应在 0-5000 ml 之间` };
        }
        return { valid: true };
    }

    // 验证必填字段
    function validateRequired(value, fieldName) {
        if (!value || String(value).trim() === '') {
            return { valid: false, message: `请填写${fieldName}` };
        }
        return { valid: true };
    }

    // 验证日期格式（YYYY-MM-DD）
    function validateDate(value, fieldName) {
        if (!value) return { valid: true };
        const pattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!pattern.test(value)) {
            return { valid: false, message: `${fieldName}格式不正确，应为 YYYY-MM-DD` };
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { valid: false, message: `${fieldName}日期无效` };
        }
        return { valid: true };
    }

    // 验证时间格式（HH:MM）
    function validateTime(value, fieldName) {
        if (!value) return { valid: true };
        const pattern = /^(\d{1,2}):(\d{2})$/;
        if (!pattern.test(value)) {
            return { valid: false, message: `${fieldName}格式不正确，应为 HH:MM` };
        }
        return { valid: true };
    }

    return {
        validateWeight,
        validateUF,
        validateBloodPressure,
        validateFluidVolume,
        validateRequired,
        validateDate,
        validateTime
    };
})();

// 挂载到全局
window.Validate = Validate;
window.validateWeight = Validate.validateWeight;
window.validateUF = Validate.validateUF;
window.validateBloodPressure = Validate.validateBloodPressure;
