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

    function load() {
        loadAttempts++;
        if (typeof Chart === 'undefined' || Chart === null) {
            if (loadAttempts < 10) {
                setTimeout(load, 100);
            } else {
                // Chart.js 不可用，只显示统计数字
                renderStatsOnly();
            }
            return;
        }
        
        loadAttempts = 0;
        renderStatsOnly();
        renderCharts(records, hdRecords);
    }
    
    function renderStatsOnly() {
        const records = Data.getRecords();
        
        const hdRecords = records.filter(r => r.type === 'hd');
        const pdRecords = records.filter(r => r.type === 'pd');
        
        document.getElementById('stats-total').textContent = records.length;
        document.getElementById('stats-hd').textContent = hdRecords.length;
        document.getElementById('stats-pd').textContent = pdRecords.length;
        
        if (hdRecords.length > 0) {
            const weights = hdRecords.filter(r => r.weightBefore).map(r => parseFloat(r.weightBefore));
            const ufs = hdRecords.filter(r => r.actualUF).map(r => parseFloat(r.actualUF));
            
            if (weights.length > 0) {
                document.getElementById('stats-avg-weight').textContent = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
            }
            
            if (ufs.length > 0) {
                document.getElementById('stats-avg-uf').textContent = Math.round(ufs.reduce((a, b) => a + b, 0) / ufs.length);
            }
        }
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentRecords = records.filter(r => {
            const parts = r.date.split('-');
            const recordDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return recordDate >= thirtyDaysAgo;
        });
        
        document.getElementById('stats-30days').textContent = recentRecords.length;
        document.getElementById('stats-avg-weekly').textContent = (recentRecords.length / 4.3).toFixed(1);
        
        renderMonthlyReport(records);
        
        // 如果 Chart 可用，渲染图表
        if (typeof Chart !== 'undefined' && Chart !== null) {
            renderCharts(records, hdRecords);
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
            .sort((a, b) => new Date(a.date) - new Date(b.date))
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
                        data: records.map(r => parseFloat(r.weightBefore)),
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '20',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: '透后体重',
                        data: records.map(r => parseFloat(r.weightAfter)),
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
        
        const records = hdRecords
            .filter(r => r.actualUF)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-15);
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无脱水量数据</p>';
            return;
        }
        
        const colors = getChartColors();
        
        ufChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: records.map(r => r.date.slice(5)),
                datasets: [{
                    label: '脱水量 (ml)',
                    data: records.map(r => parseFloat(r.actualUF)),
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
        
        const totalUF = records.reduce((sum, r) => sum + parseFloat(r.actualUF), 0);
        const maxUF = Math.max(...records.map(r => parseFloat(r.actualUF)));
        document.getElementById('stats-total-uf').textContent = Math.round(totalUF);
        document.getElementById('stats-max-uf').textContent = maxUF;
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
            .sort((a, b) => new Date(a.date) - new Date(b.date))
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
                        data: records.map(r => parseInt(r.bpBefore.split('/')[0])),
                        borderColor: '#dc3545',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: '舒张压',
                        data: records.map(r => parseInt(r.bpBefore.split('/')[1])),
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
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-15);
        
        if (records.length === 0) {
            ctx.parentElement.innerHTML = '<p class="empty-tip">暂无超滤数据</p>';
            return;
        }
        
        const ufrData = records.map(r => {
            const weightDiff = parseFloat(r.weightBefore) - parseFloat(r.weightAfter);
            const ufr = parseFloat(r.actualUF);
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
            const parts = r.date.split('-');
            const recordDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return recordDate >= monthStart;
        });
        const hdRecords = monthRecords.filter(r => r.type === 'hd');
        
        let html = '<div class="report-stats">';
        
        if (monthRecords.length > 0) {
            const totalUF = hdRecords.reduce((sum, r) => sum + (parseFloat(r.actualUF) || 0), 0);
            const avgUF = hdRecords.length > 0 ? Math.round(totalUF / hdRecords.length) : 0;
            const avgWeight = hdRecords.length > 0 ? 
                (hdRecords.reduce((sum, r) => sum + (parseFloat(r.weightBefore) || 0), 0) / hdRecords.length).toFixed(1) : 0;
            
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

    return {
        load,
        renderWeightChart,
        renderUFChart,
        renderFrequencyChart,
        renderBPChart,
        renderUFRChart
    };
})();

window.StatsPage = StatsPage;
window.loadStatsPage = StatsPage.load;
