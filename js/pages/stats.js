/**
 * 肾友日记 - 统计页模块（Chart.js增强版）
 */

const StatsPage = (function() {
    let weightChart = null;
    let ufChart = null;
    let freqChart = null;
    let bpChart = null;
    let ufrChart = null;
    let loadAttempts = 0;
    let chartLoaded = false;

    // 动态加载 Chart.js
    function loadChartJS() {
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined' && Chart !== null) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'js/chart.min.js';
            script.onload = () => {
                console.log('Chart.js 加载成功');
                resolve();
            };
            script.onerror = () => {
                console.error('Chart.js 加载失败');
                reject(new Error('Chart.js 加载失败'));
            };
            document.head.appendChild(script);
        });
    }

    // 显示加载提示
    function showLoadingHints() {
        const chartCanvases = ['weight-chart', 'uf-chart', 'frequency-chart', 'bp-chart', 'ufr-chart'];
        chartCanvases.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas && canvas.parentElement) {
                const parent = canvas.parentElement;
                if (!parent.querySelector('.chart-loading')) {
                    const loadingDiv = document.createElement('div');
                    loadingDiv.className = 'chart-loading';
                    loadingDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#999;font-size:14px;';
                    loadingDiv.textContent = '图表加载中...';
                    parent.style.position = 'relative';
                    parent.appendChild(loadingDiv);
                }
            }
        });
    }

    // 隐藏加载提示
    function hideLoadingHints() {
        document.querySelectorAll('.chart-loading').forEach(el => el.remove());
    }

    function load() {
        showLoadingHints();
        
        loadChartJS().then(() => {
            chartLoaded = true;
            loadAttempts = 0;
            hideLoadingHints();
            renderStatsOnly();
        }).catch(() => {
            chartLoaded = false;
            loadAttempts++;
            if (loadAttempts < 10) {
                setTimeout(load, 500);
            } else {
                hideLoadingHints();
                renderStatsOnly();
                console.warn('Chart.js 加载超时，图表功能已禁用');
            }
        });
    }
    
    function renderStatsOnly() {
        const records = Data.getRecords();
        
        const hdRecords = records.filter(r => r.type === 'hd');
        const pdRecords = records.filter(r => r.type === 'pd');
        
        document.getElementById('stats-total').textContent = records.length;
        document.getElementById('stats-hd').textContent = hdRecords.length;
        document.getElementById('stats-pd').textContent = pdRecords.length;
        
        if (hdRecords.length > 0) {
            const weights = hdRecords
                .filter(r => Helpers.isValidNumber(r.weightBefore))
                .map(r => Helpers.safeParseFloat(r.weightBefore));
            
            if (weights.length > 0) {
                document.getElementById('stats-avg-weight').textContent = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
            }
            
            // 计算脱水量：优先实际 > 目标 > 体重差值（kg转ml）
            const ufValues = hdRecords.map(r => {
                if (Helpers.isValidNumber(r.actualUF)) return Helpers.safeParseFloat(r.actualUF);
                if (Helpers.isValidNumber(r.targetUF)) return Helpers.safeParseFloat(r.targetUF);
                if (Helpers.isValidNumber(r.weightBefore) && Helpers.isValidNumber(r.weightAfter)) {
                    const weightDiff = Helpers.safeParseFloat(r.weightBefore) - Helpers.safeParseFloat(r.weightAfter);
                    return weightDiff > 0 ? Math.round(weightDiff * 1000) : 0;
                }
                return 0;
            }).filter(v => v > 0);
            
            if (ufValues.length > 0) {
                document.getElementById('stats-avg-uf').textContent = Math.round(ufValues.reduce((a, b) => a + b, 0) / ufValues.length);
            }
        }
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentRecords = records.filter(r => {
            const recordDate = Helpers.parseDate(r.date);
            return recordDate && recordDate >= thirtyDaysAgo;
        });
        
        document.getElementById('stats-30days').textContent = recentRecords.length;
        document.getElementById('stats-avg-weekly').textContent = (recentRecords.length / 4.3).toFixed(1);
        
        renderMonthlyReport(records);
        
        // 如果 Chart 可用，渲染图表
        if (typeof Chart !== 'undefined' && Chart !== null) {
            renderAllCharts(records, hdRecords);
        }
    }

    function getChartColors() {
        const isDark = document.documentElement.classList.contains('dark-mode') || 
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        return {
            primary: '#4A90D9',
            success: '#28a745',
            warning: '#ffc107',
            text: isDark ? '#eaeaea' : '#333333',
            grid: isDark ? '#2a2a4a' : '#e0e0e0',
            background: isDark ? '#16213e' : '#ffffff'
        };
    }

    function renderWeightChart(hdRecords) {
        const ctx = document.getElementById('weight-chart');
        if (!ctx) return;
        
        if (weightChart) weightChart.destroy();
        
        const records = hdRecords
            .filter(r => r.weightBefore && r.weightAfter)
            .sort((a, b) => {
                const dateA = Helpers.parseDate(a.date);
                const dateB = Helpers.parseDate(b.date);
                return (dateA ? dateA.getTime() : 0) - (dateB ? dateB.getTime() : 0);
            })
            .slice(-15);
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无体重数据</p>';
            return;
        }
        
        const colors = getChartColors();
        
        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: records.map(r => r.date.slice(5)),
                datasets: [
                    {
                        label: '透前体重',
                        data: records.map(r => Helpers.safeParseFloat(r.weightBefore)),
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '20',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: '透后体重',
                        data: records.map(r => Helpers.safeParseFloat(r.weightAfter)),
                        borderColor: colors.success,
                        backgroundColor: colors.success + '20',
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.text }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    },
                    x: {
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    }
                }
            }
        });
    }

    function renderUFChart(hdRecords) {
        const ctx = document.getElementById('uf-chart');
        if (!ctx) return;
        
        if (ufChart) ufChart.destroy();
        
        // 筛选有脱水量数据的记录（优先级：实际脱水量 > 目标脱水量 > 体重差值计算）
        const records = hdRecords
            .filter(r => {
                // 有实际脱水量或目标脱水量
                if (r.actualUF || r.targetUF) return true;
                // 或者有体重数据可以计算
                if (r.weightBefore && r.weightAfter) {
                    const diff = parseFloat(r.weightBefore) - parseFloat(r.weightAfter);
                    return diff > 0;
                }
                return false;
            })
            .sort((a, b) => {
                const dateA = Helpers.parseDate(a.date);
                const dateB = Helpers.parseDate(b.date);
                return (dateA ? dateA.getTime() : 0) - (dateB ? dateB.getTime() : 0);
            })
            .slice(-15);
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无脱水量数据</p>';
            return;
        }
        
        const colors = getChartColors();
        
        // 计算脱水量：优先实际 > 目标 > 体重差值（kg转ml，乘以1000）
        const ufData = records.map(r => {
            if (Helpers.isValidNumber(r.actualUF)) return Helpers.safeParseFloat(r.actualUF);
            if (Helpers.isValidNumber(r.targetUF)) return Helpers.safeParseFloat(r.targetUF);
            // 使用体重差值计算（kg * 1000 = ml）
            const weightDiff = Helpers.safeParseFloat(r.weightBefore) - Helpers.safeParseFloat(r.weightAfter);
            return Math.round(weightDiff * 1000);
        });
        
        const ufLabels = records.map(r => {
            const date = r.date.slice(5);
            // 标记数据来源
            if (r.actualUF) return date;
            if (r.targetUF) return date + '*';
            return date + '~';  // ~ 表示由体重计算
        });
        
        ufChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ufLabels,
                datasets: [{
                    label: '脱水量 (ml) *目标 ~计算',
                    data: ufData,
                    backgroundColor: colors.warning + '80',
                    borderColor: colors.warning,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.text }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    },
                    x: {
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    }
                }
            }
        });
        
        const minUF = Math.min(...ufData);
        const maxUF = Math.max(...ufData);
        const avgUF = Math.round(ufData.reduce((sum, val) => sum + val, 0) / ufData.length);
        document.getElementById('stats-min-uf').textContent = minUF;
        document.getElementById('stats-max-uf').textContent = maxUF;
        document.getElementById('stats-avg-uf-chart').textContent = avgUF;
    }

    function renderFrequencyChart(records) {
        const ctx = document.getElementById('frequency-chart');
        if (!ctx) return;
        
        if (freqChart) freqChart.destroy();
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无数据</p>';
            return;
        }
        
        const now = new Date();
        const weeks = [];
        
        for (let i = 3; i >= 0; i--) {
            const weekEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7), 23, 59, 59, 999));
            const weekStart = new Date(Date.UTC(weekEnd.getUTCFullYear(), weekEnd.getUTCMonth(), weekEnd.getUTCDate() - 6, 0, 0, 0, 0));
            
            const weekRecords = records.filter(r => {
                const date = new Date(r.date + 'T00:00:00');
                return date >= weekStart && date <= weekEnd;
            });
            
            weeks.push({
                label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
                hd: weekRecords.filter(r => r.type === 'hd').length,
                pd: weekRecords.filter(r => r.type === 'pd').length
            });
        }
        
        const colors = getChartColors();
        
        freqChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weeks.map(w => w.label),
                datasets: [
                    {
                        label: '血液透析',
                        data: weeks.map(w => w.hd),
                        backgroundColor: colors.primary,
                        stack: 'stack0'
                    },
                    {
                        label: '腹膜透析',
                        data: weeks.map(w => w.pd),
                        backgroundColor: colors.success,
                        stack: 'stack0'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.text }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        ticks: { color: colors.text, stepSize: 1 },
                        grid: { color: colors.grid }
                    },
                    x: {
                        stacked: true,
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    }
                }
            }
        });
    }

    function renderBPChart(hdRecords) {
        const ctx = document.getElementById('bp-chart');
        if (!ctx) return;
        
        if (bpChart) bpChart.destroy();
        
        const records = hdRecords
            .filter(r => r.bpBefore && r.bpBefore.includes('/'))
            .sort((a, b) => {
                const dateA = Helpers.parseDate(a.date);
                const dateB = Helpers.parseDate(b.date);
                return (dateA ? dateA.getTime() : 0) - (dateB ? dateB.getTime() : 0);
            })
            .slice(-15);
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无血压数据</p>';
            return;
        }
        
        const colors = getChartColors();
        
        bpChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: records.map(r => r.date.slice(5)),
                datasets: [
                    {
                        label: '收缩压',
                        data: records.map(r => {
                            if (!r.bpBefore || !r.bpBefore.includes('/')) return null;
                            return Helpers.safeParseInt(r.bpBefore.split('/')[0]);
                        }).filter(v => v !== null),
                        borderColor: '#dc3545',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: '舒张压',
                        data: records.map(r => {
                            if (!r.bpBefore || !r.bpBefore.includes('/')) return null;
                            return Helpers.safeParseInt(r.bpBefore.split('/')[1]);
                        }).filter(v => v !== null),
                        borderColor: '#28a745',
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.text }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    },
                    x: {
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    }
                }
            }
        });
    }

    function renderUFRChart(hdRecords) {
        const ctx = document.getElementById('ufr-chart');
        if (!ctx) return;
        
        if (ufrChart) ufrChart.destroy();
        
        const records = hdRecords
            .filter(r => r.weightBefore && r.weightAfter && r.actualUF)
            .sort((a, b) => {
                const dateA = Helpers.parseDate(a.date);
                const dateB = Helpers.parseDate(b.date);
                return (dateA ? dateA.getTime() : 0) - (dateB ? dateB.getTime() : 0);
            })
            .slice(-15);
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无超滤数据</p>';
            return;
        }
        
        const ufrData = records.map(r => {
            const weightDiff = Helpers.safeParseFloat(r.weightBefore) - Helpers.safeParseFloat(r.weightAfter);
            const ufr = Helpers.safeParseFloat(r.actualUF);
            return weightDiff > 0 ? ((ufr / weightDiff) * 100).toFixed(1) : 0;
        });
        
        const colors = getChartColors();
        
        ufrChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: records.map(r => r.date.slice(5)),
                datasets: [{
                    label: '超滤率 (%)',
                    data: ufrData,
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '20',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.text }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    },
                    x: {
                        ticks: { color: colors.text },
                        grid: { color: colors.grid }
                    }
                }
            }
        });
    }

    function renderMonthlyReport(records) {
        const container = document.getElementById('monthly-report');
        if (!container) return;
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthRecords = records.filter(r => {
            const recordDate = Helpers.parseDate(r.date);
            return recordDate && recordDate >= monthStart;
        });
        const hdRecords = monthRecords.filter(r => r.type === 'hd');
        
        let html = '<div class="report-stats">';
        
        if (monthRecords.length > 0) {
            // 计算脱水量：优先实际 > 目标 > 体重差值（kg转ml）
            const ufValues = hdRecords.map(r => {
                if (Helpers.isValidNumber(r.actualUF)) return Helpers.safeParseFloat(r.actualUF);
                if (Helpers.isValidNumber(r.targetUF)) return Helpers.safeParseFloat(r.targetUF);
                if (Helpers.isValidNumber(r.weightBefore) && Helpers.isValidNumber(r.weightAfter)) {
                    const weightDiff = Helpers.safeParseFloat(r.weightBefore) - Helpers.safeParseFloat(r.weightAfter);
                    return weightDiff > 0 ? Math.round(weightDiff * 1000) : 0;
                }
                return 0;
            });
            const totalUF = ufValues.reduce((sum, val) => sum + val, 0);
            const validUFCount = ufValues.filter(v => v > 0).length;
            const avgUF = validUFCount > 0 ? Math.round(totalUF / validUFCount) : 0;
            const avgWeight = hdRecords.length > 0 ?
                (hdRecords.reduce((sum, r) => sum + Helpers.safeParseFloat(r.weightBefore), 0) / hdRecords.length).toFixed(1) : 0;
            
            html += `
                <div class="report-item">
                    <span class="report-label">透析次数</span>
                    <span class="report-value">${monthRecords.length}次</span>
                </div>
                <div class="report-item">
                    <span class="report-label">血液透析</span>
                    <span class="report-value">${hdRecords.length}次</span>
                </div>
                <div class="report-item">
                    <span class="report-label">平均脱水量</span>
                    <span class="report-value">${avgUF}ml</span>
                </div>
                <div class="report-item">
                    <span class="report-label">平均透前体重</span>
                    <span class="report-value">${avgWeight}kg</span>
                </div>
            `;
        } else {
            html += '<p class="empty-tip" style="grid-column: span 2;">本月暂无记录</p>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    function renderAllCharts(records, hdRecords) {
        renderWeightChart(hdRecords);
        renderUFChart(hdRecords);
        renderFrequencyChart(records);
        renderBPChart(hdRecords);
        renderUFRChart(hdRecords);
    }

    // 销毁所有图表实例（页面切换时调用）
    function destroyAllCharts() {
        if (weightChart) {
            weightChart.destroy();
            weightChart = null;
        }
        if (ufChart) {
            ufChart.destroy();
            ufChart = null;
        }
        if (freqChart) {
            freqChart.destroy();
            freqChart = null;
        }
        if (bpChart) {
            bpChart.destroy();
            bpChart = null;
        }
        if (ufrChart) {
            ufrChart.destroy();
            ufrChart = null;
        }
    }

    return {
        load,
        renderWeightChart,
        renderUFChart,
        renderFrequencyChart,
        renderBPChart,
        renderUFRChart,
        renderAllCharts,
        destroyAllCharts
    };
})();

window.StatsPage = StatsPage;
window.loadStatsPage = StatsPage.load;

// 统计卡片折叠/展开功能
function toggleStatsCard(header) {
    const card = header.closest('.stats-card');
    const content = card.querySelector('.card-content');
    const icon = header.querySelector('.toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
        // 展开时重新渲染图表（如果该卡片包含图表）
        const canvas = content.querySelector('canvas');
        if (canvas && StatsPage) {
            const chartId = canvas.id;
            const records = Data.getRecords();
            const hdRecords = records.filter(r => r.type === 'hd');
            
            // 根据图表ID重新渲染
            if (chartId === 'weight-chart') StatsPage.renderWeightChart(hdRecords);
            else if (chartId === 'uf-chart') StatsPage.renderUFChart(hdRecords);
            else if (chartId === 'frequency-chart') StatsPage.renderFrequencyChart(records);
            else if (chartId === 'bp-chart') StatsPage.renderBPChart(hdRecords);
            else if (chartId === 'ufr-chart') StatsPage.renderUFRChart(hdRecords);
        }
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

window.toggleStatsCard = toggleStatsCard;
