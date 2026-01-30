let activities = [];
let activityCounter = 0;
const STORAGE_KEY = 'design-map-state-v1';
let saveIndicatorTimer = null;

const interactionTypes = [
    { value: 'community', label: 'Community (Student - Community)' },
    { value: 'class', label: 'Class (Teacher - Student)' },
    { value: 'group', label: 'Group (Student - Student)' },
    { value: 'individual', label: 'Individual (Student - Content)' }
];

const alpStrategies = [
    { value: 'activate', label: 'Activate Learning', color: '#6aced8' },
    { value: 'promote', label: 'Promote thinking and discussion', color: '#cc6bff' },
    { value: 'facilitate', label: 'Facilitate Demonstration of Learning', color: '#ffc000' },
    { value: 'monitor', label: 'Monitor and Provide Feedback', color: '#f6bbbf' }
];

const keyApplications = [
    { value: 'support-assessment', label: 'Support Assessment for Learning' },
    { value: 'foster-conceptual', label: 'Foster Conceptual Change' },
    { value: 'provide-differentiation', label: 'Provide Differentiation' },
    { value: 'facilitate-learning-together', label: 'Facilitate Learning Together' },
    { value: 'develop-metacognition', label: 'Develop Metacognition' },
    { value: 'enable-personalisation', label: 'Enable Personalisation' },
    { value: 'embed-scaffolding', label: 'Embed Scaffolding' },
    { value: 'increase-motivation', label: 'Increase Motivation' }
];

const keyAppColors = {
    'support-assessment': '#7dd3fc',
    'foster-conceptual': '#a78bfa',
    'provide-differentiation': '#34d399',
    'facilitate-learning-together': '#fbbf24',
    'develop-metacognition': '#fb7185',
    'enable-personalisation': '#38bdf8',
    'embed-scaffolding': '#f472b6',
    'increase-motivation': '#f97316'
};

function init() {
    const restored = loadState();
    if (!restored) {
        addActivity();
    }
    setupEventListeners();
}

function setupEventListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    document.getElementById('addActivityBtn').addEventListener('click', addActivity);
    document.getElementById('generateBtn').addEventListener('click', generateMap);
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('Clear all data?')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });
    document.getElementById('downloadJpgBtn').addEventListener('click', handleJpgDownload);
    document.getElementById('downloadChartsBtn').addEventListener('click', handleChartsDownload);

    const container = document.getElementById('activitiesContainer');
    container.addEventListener('change', handleActivityChange);
    container.addEventListener('input', handleActivityChange);
    container.addEventListener('click', handleActivityClick);

    document.querySelectorAll('#input input, #input textarea, #input select').forEach(el => {
        el.addEventListener('input', saveState);
        el.addEventListener('change', saveState);
    });
}

function addActivity(activityData = {}) {
    activityCounter++;
    const container = document.getElementById('activitiesContainer');

    const activity = {
        id: activityCounter,
        interaction: '',
        alp: '',
        keyApp: '',
        time: '5',
        details: '',
        tech: '',
        ...activityData
    };
    activities.push(activity);

    const div = document.createElement('div');
    div.className = 'activity-item';
    div.dataset.id = activityCounter;
    div.innerHTML = `
        <div class="activity-header">
            <div class="activity-number">${activityCounter}</div>
            <div style="flex: 1;">
                <div class="activity-fields">
                    <div class="form-group">
                        <label>Interaction Type <span class="required">*</span></label>
                        <select data-id="${activityCounter}" data-field="interaction">
                            <option value="">Select type</option>
                            ${interactionTypes.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Active Learning Process <span class="required">*</span></label>
                        <select data-id="${activityCounter}" data-field="alp">
                            <option value="">Select process</option>
                            ${alpStrategies.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Time (mins)</label>
                        <input type="number" min="0" data-id="${activityCounter}" data-field="time" value="5" placeholder="5">
                    </div>
                </div>
                <div class="form-group activity-extra">
                    <label>Activity Details <span class="required">*</span> <span class="field-hint">≤ 115 characters</span></label>
                    <textarea data-id="${activityCounter}" data-field="details" data-max="115" maxlength="115" placeholder="Describe the activity..."></textarea>
                    <div class="char-counter" data-counter-for="details">0/115</div>
                </div>
                <div class="form-group activity-extra">
                    <label>Key Application of Technology</label>
                    <select data-id="${activityCounter}" data-field="keyApp">
                        <option value="">Select category</option>
                        ${keyApplications.map(k => `<option value="${k.value}">${k.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group activity-extra">
                    <label>Tech Tool (Optional) <span class="field-hint">≤ 25 characters</span></label>
                    <input type="text" data-id="${activityCounter}" data-field="tech" data-max="25" maxlength="25" placeholder="e.g., Padlet, SLS, HTML Interactives, Learning Assistant">
                    <div class="char-counter" data-counter-for="tech">0/25</div>
                </div>
            </div>
            <div class="activity-actions">
                <button type="button" class="btn btn-inline-delete" data-action="delete-activity" data-id="${activityCounter}">Delete Activity</button>
            </div>
        </div>
    `;
    container.appendChild(div);
    div.querySelectorAll('[data-field]').forEach(field => {
        const key = field.dataset.field;
        if (activity[key] !== undefined) {
            field.value = activity[key];
        }
    });
    updateCharCounters(div);
}

function handleActivityChange(e) {
    const id = parseInt(e.target.dataset.id, 10);
    const field = e.target.dataset.field;
    if (!id || !field) return;

    const activity = activities.find(a => a.id === id);
    if (activity) {
        if (field === 'time') {
            const value = parseInt(e.target.value, 10);
            if (!Number.isNaN(value) && value < 0) {
                e.target.value = 0;
                activity[field] = '0';
                return;
            }
        }
        activity[field] = e.target.value;
    }
    if (e.target.matches('[data-max]')) {
        updateCharCounters(e.target.closest('.activity-item'));
    }
    saveState();
}

function deleteLastActivity() {
    if (!activities.length) return;
    const items = Array.from(document.querySelectorAll('.activity-item'));
    const lastItem = items[items.length - 1];
    if (lastItem) {
        lastItem.remove();
    }
    activities = activities.slice(0, -1);
    renumberActivities();
    saveState();
}

function handleActivityClick(e) {
    const button = e.target.closest('[data-action="delete-activity"]');
    if (!button) return;

    const id = parseInt(button.dataset.id, 10);
    const item = document.querySelector(`.activity-item[data-id="${id}"]`);
    if (item) {
        item.remove();
    }

    activities = activities.filter(a => a.id !== id);
    renumberActivities();
    saveState();
}

function renumberActivities() {
    const items = Array.from(document.querySelectorAll('.activity-item'));
    activities = items.map((item, index) => {
        const oldId = parseInt(item.dataset.id, 10);
        const activity = activities.find(a => a.id === oldId) || {
            interaction: '',
            alp: '',
            keyApp: '',
            time: '',
            details: '',
            tech: ''
        };
        const newId = index + 1;
        activity.id = newId;

        item.dataset.id = newId;
        const number = item.querySelector('.activity-number');
        if (number) number.textContent = newId;

        item.querySelectorAll('[data-id]').forEach(el => {
            el.dataset.id = newId;
        });

        return activity;
    });

    activityCounter = activities.length;
}

function saveState() {
    const state = {
        meta: {
            topic: document.getElementById('topic')?.value || '',
            level: document.getElementById('level')?.value || '',
            studentProfile: document.getElementById('studentProfile')?.value || '',
            duration: document.getElementById('duration')?.value || '',
            learningOutcomes: document.getElementById('learningOutcomes')?.value || '',
            prerequisiteKnowledge: document.getElementById('prerequisiteKnowledge')?.value || '',
            learningIssues: document.getElementById('learningIssues')?.value || '',
            techIntegration: document.getElementById('techIntegration')?.value || 'optional'
        },
        activities
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        showSaveIndicator();
    } catch (err) {
        console.warn('Unable to save design map state', err);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (!state || !Array.isArray(state.activities)) return false;

        document.getElementById('topic').value = state.meta?.topic || '';
        document.getElementById('level').value = state.meta?.level || '';
        document.getElementById('studentProfile').value = state.meta?.studentProfile || '';
        document.getElementById('duration').value = state.meta?.duration || '';
        document.getElementById('learningOutcomes').value = state.meta?.learningOutcomes || '';
        document.getElementById('prerequisiteKnowledge').value = state.meta?.prerequisiteKnowledge || '';
        document.getElementById('learningIssues').value = state.meta?.learningIssues || '';
        document.getElementById('techIntegration').value = state.meta?.techIntegration || 'optional';

        activities = [];
        activityCounter = 0;
        const container = document.getElementById('activitiesContainer');
        container.innerHTML = '';

        state.activities.forEach(activity => {
            addActivity(activity);
        });

        return true;
    } catch (err) {
        console.warn('Unable to restore design map state', err);
        return false;
    }
}

function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;
    indicator.classList.add('visible');
    if (saveIndicatorTimer) {
        clearTimeout(saveIndicatorTimer);
    }
    saveIndicatorTimer = setTimeout(() => {
        indicator.classList.remove('visible');
    }, 2000);
}

function updateCharCounters(scope) {
    const root = scope || document;
    root.querySelectorAll('[data-max]').forEach(field => {
        const max = parseInt(field.dataset.max, 10);
        if (!max) return;
        const counter = field.parentElement?.querySelector(`.char-counter[data-counter-for="${field.dataset.field}"]`);
        if (!counter) return;
        const count = (field.value || '').length;
        counter.textContent = `${count}/${max}`;
        counter.classList.toggle('over', count > max);
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

function generateMap() {
    const filled = activities.filter(a => a.interaction && a.alp && a.details);

    if (filled.length === 0) {
        alert('Please fill in at least one activity with:\n- Interaction Type\n- Active Learning Process\n- Activity Details');
        return;
    }

    const topic = document.getElementById('topic').value || 'Lesson Design Map';
    const level = document.getElementById('level').value;
    const duration = document.getElementById('duration').value || 60;
    const studentProfile = document.getElementById('studentProfile')?.value;
    const learningOutcomes = document.getElementById('learningOutcomes')?.value;
    const prerequisiteKnowledge = document.getElementById('prerequisiteKnowledge')?.value;
    const learningIssues = document.getElementById('learningIssues')?.value;
    const techIntegration = document.getElementById('techIntegration')?.value;

    renderMap(filled, {
        topic,
        level,
        duration,
        studentProfile,
        learningOutcomes,
        prerequisiteKnowledge,
        learningIssues,
        techIntegration
    });
    updateCharts(filled);
    switchTab('output');
}

function renderMap(filledActivities, meta) {
    const container = document.getElementById('designMapContainer');

    const orderedActivities = [...filledActivities].sort((a, b) => a.id - b.id);

    const totalTime = orderedActivities.reduce((sum, activity) => {
        const time = Math.max(0, parseInt(activity.time, 10) || 0);
        return sum + time;
    }, 0);
    const plannedDuration = parseInt(meta.duration, 10);
    const hasDurationMismatch = Number.isFinite(plannedDuration) && plannedDuration >= 0 && plannedDuration !== totalTime;

    // Group by interaction type
    const grouped = {
        community: [],
        class: [],
        group: [],
        individual: []
    };

    orderedActivities.forEach(a => {
        if (grouped[a.interaction]) {
            grouped[a.interaction].push(a);
        }
    });

    let html = `
            <div class="design-map-wrapper">
            <div style="margin-bottom: 2rem;">
                <h3 style="font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--primary);">${meta.topic}</h3>
                <p style="color: #0f172a; margin-top: 0.5rem;">
                    ${meta.level ? `<strong>Level:</strong> ${meta.level} | ` : ''}<span class="${hasDurationMismatch ? 'duration-mismatch' : ''}">Duration: ${meta.duration} minutes</span>${hasDurationMismatch ? `<span class="duration-warning">; Activities total: ${totalTime} mins</span>` : ''}
                </p>
                <div style="margin-top: 0.75rem; color: var(--text); font-size: 0.95rem; display: grid; gap: 0.35rem;">
                    ${meta.studentProfile ? `<div><strong>Student profile:</strong> ${meta.studentProfile}</div>` : ''}
                    ${meta.learningOutcomes ? `<div><strong>Learning outcomes:</strong> ${meta.learningOutcomes}</div>` : ''}
                    ${meta.prerequisiteKnowledge ? `<div><strong>Prerequisite knowledge:</strong> ${meta.prerequisiteKnowledge}</div>` : ''}
                    ${meta.techIntegration && meta.techIntegration !== 'optional' ? `<div><strong>Level of technology integration:</strong> ${formatTechIntegration(meta.techIntegration)}</div>` : ''}
                    ${meta.learningIssues ? `<div><strong>Learning issue to be addressed:</strong> ${meta.learningIssues}</div>` : ''}
                </div>
            </div>

            <div style="position: relative;">
                <div class="axis-label y-axis">Social Plane</div>
                <div class="axis-label x-axis">Time -></div>

                <div class="design-map">
    `;

    const levels = [
        { key: 'community', label: 'Community\n(Student -\nCommunity)' },
        { key: 'class', label: 'Class\n(Teacher -\nStudent)' },
        { key: 'group', label: 'Group\n(Student -\nStudent)' },
        { key: 'individual', label: 'Individual\n(Student -\nContent)' }
    ];

    levels.forEach((level, index) => {
        const isLast = index === levels.length - 1;
        html += `
            <div class="social-label" style="grid-row:${index + 1}; ${isLast ? 'border-bottom:0;' : ''}">${level.label.replace(/\n/g, '<br>')}</div>
        `;
    });

    const activityCount = orderedActivities.length || 1;
    html += `<div class="activities-grid" style="--activity-count:${activityCount};">`;

    orderedActivities.forEach((act, index) => {
        const rawKeyAppLabel = keyApplications.find(k => k.value === act.keyApp)?.label || act.keyApp;
        const keyAppLabel = formatKeyAppLabel(rawKeyAppLabel);
        const rowIndex = levels.findIndex(level => level.key === act.interaction) + 1;
        const columnIndex = index + 1;

        html += `
            <div class="activity-slot" style="grid-row:${rowIndex}; grid-column:${columnIndex};">
                <div class="activity-box ${act.alp}">
                    ${act.time ? `<div class="activity-time-inline">Activity ${act.id} (${act.time} min)</div>` : `<div class="activity-time-inline">Activity ${act.id}</div>`}
                    ${keyAppLabel ? `<div class="activity-alp-tag"><span class="alp-text">${keyAppLabel}</span></div>` : ''}
                    <div class="activity-title"></div>
                    <div class="activity-details">${act.details}</div>
                    ${act.tech ? `<div class="activity-tech">[Tool]: ${act.tech}</div>` : ''}
                </div>
            </div>
        `;
    });

    html += buildArrowsSvg(orderedActivities, levels);
    html += '</div>';

    html += '</div></div>';

    // Add legend
    html += `
        <div class="legend-table">
            <div class="legend-header">
                <span>Legend</span>
            </div>
    `;

    alpStrategies.forEach(alp => {
        html += `
            <div class="legend-row">
                <div class="legend-color-box" style="background: ${alp.color};"></div>
                <div class="legend-text">${alp.label}</div>
            </div>
        `;
    });

    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
}

function buildArrowsSvg(orderedActivities, levels) {
    if (orderedActivities.length < 2) return '';

    const slotWidth = 240;
    const rowHeight = 150;
    const gap = 20;
    const width = slotWidth * orderedActivities.length;
    const height = rowHeight * levels.length;

    const paths = [];
    for (let i = 0; i < orderedActivities.length - 1; i++) {
        const current = orderedActivities[i];
        const next = orderedActivities[i + 1];
        const currentRow = levels.findIndex(level => level.key === current.interaction) + 1;
        const nextRow = levels.findIndex(level => level.key === next.interaction) + 1;

        const startX = i * slotWidth + (slotWidth - gap) + 4;
        const endX = (i + 1) * slotWidth + 6;
        const startY = (currentRow - 0.5) * rowHeight;
        const endY = (nextRow - 0.5) * rowHeight;

        if (currentRow === nextRow) {
            paths.push(`M ${startX} ${startY} L ${endX - 4} ${endY}`);
            continue;
        }

        paths.push(`M ${startX} ${startY} L ${startX} ${endY} L ${endX - 4} ${endY}`);
    }

    if (!paths.length) return '';

    return `
        <svg class="activity-arrows" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <marker id="arrowhead" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#333"></polygon>
                </marker>
            </defs>
            ${paths.map(path => `<path d="${path}" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" marker-end="url(#arrowhead)"></path>`).join('')}
        </svg>
    `;
}

function updateCharts(filledActivities) {
    const alpTotals = {
        activate: 0,
        promote: 0,
        facilitate: 0,
        monitor: 0
    };
    const interactionTotals = {
        community: 0,
        class: 0,
        group: 0,
        individual: 0
    };
    const keyAppTotals = Object.fromEntries(keyApplications.map(app => [app.value, 0]));

    filledActivities.forEach(activity => {
        const time = Math.max(0, parseInt(activity.time, 10) || 0);
        if (alpTotals[activity.alp] !== undefined) {
            alpTotals[activity.alp] += time;
        }
        if (interactionTotals[activity.interaction] !== undefined) {
            interactionTotals[activity.interaction] += time;
        }
        if (keyAppTotals[activity.keyApp] !== undefined) {
            keyAppTotals[activity.keyApp] += time;
        }
    });

    const alpSlices = [
        { key: 'activate', color: '#6aced8', value: alpTotals.activate },
        { key: 'promote', color: '#cc6bff', value: alpTotals.promote },
        { key: 'facilitate', color: '#ffc000', value: alpTotals.facilitate },
        { key: 'monitor', color: '#f6bbbf', value: alpTotals.monitor }
    ];

    const interactionSlices = [
        { key: 'community', color: '#9ca3af', value: interactionTotals.community },
        { key: 'class', color: '#cfe8fb', value: interactionTotals.class },
        { key: 'group', color: '#ffe39a', value: interactionTotals.group },
        { key: 'individual', color: '#bfbfbf', value: interactionTotals.individual }
    ];

    const keyAppSlices = keyApplications.map(app => ({
        key: app.value,
        color: keyAppColors[app.value],
        value: keyAppTotals[app.value]
    }));

    applyPieChart(document.querySelector('[data-chart="alp"]'), alpSlices);
    applyPieChart(document.querySelector('[data-chart="interaction"]'), interactionSlices);
    applyPieChart(document.querySelector('[data-chart="keyapp"]'), keyAppSlices);
    updateLegendValues(alpSlices, '[data-chart="alp"]');
    updateLegendValues(interactionSlices, '[data-chart="interaction"]');
    updateLegendValues(keyAppSlices, '[data-chart="keyapp"]');
}

function applyPieChart(chartEl, slices) {
    if (!chartEl) return;
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    let currentAngle = 0;
    const gradientStops = slices.map(slice => {
        const angle = total > 0 ? (slice.value / total) * 360 : 0;
        const start = currentAngle;
        const end = currentAngle + angle;
        currentAngle = end;
        return `${slice.color} ${start}deg ${end}deg`;
    });
    chartEl.style.background = `conic-gradient(${gradientStops.join(', ')})`;
    chartEl._slices = slices.map(slice => ({ ...slice }));

    slices.forEach(slice => {
        const label = chartEl.querySelector(`[data-slice="${slice.key}"]`);
        if (!label) return;
        if (total === 0 || slice.value === 0) {
            label.innerHTML = '';
            label.style.display = 'none';
            return;
        }
        const startAngle = slices
            .slice(0, slices.findIndex(s => s.key === slice.key))
            .reduce((sum, s) => sum + (s.value / total) * 360, 0);
        const sliceAngle = (slice.value / total) * 360;
        if (sliceAngle < 18) {
            label.innerHTML = '';
            label.style.display = 'none';
            return;
        }
        const midAngle = startAngle + sliceAngle / 2;
        const radians = (midAngle - 90) * (Math.PI / 180);
        const radius = sliceAngle < 40 ? 28 : 36;
        const x = 50 + radius * Math.cos(radians);
        const y = 50 + radius * Math.sin(radians);

        const percent = ((slice.value / total) * 100).toFixed(1);
        label.innerHTML = `<span class="pie-value">${slice.value}</span><span class="pie-percent">${percent}%</span>`;
        label.style.left = `${x}%`;
        label.style.top = `${y}%`;
        label.style.display = 'block';
    });
}

function updateLegendValues(slices, chartSelector) {
    const chart = document.querySelector(chartSelector)?.closest('.chart-card');
    if (!chart) return;

    slices.forEach(slice => {
        const item = chart.querySelector(`.chart-legend-item[data-key="${slice.key}"]`);
        if (!item) return;
        const valueEl = item.querySelector('.legend-value');
        if (!valueEl) return;
        valueEl.textContent = '';
    });
}

function formatTechIntegration(value) {
    return value
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatKeyAppLabel(label) {
    if (!label) return '';
    const words = label.split(' ').filter(Boolean);
    if (words.length <= 2) return label;
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    return `${line1}<br>${line2}`;
}

function handleJpgDownload() {
    const activeTab = document.querySelector('.tab.active')?.getAttribute('data-tab');
    switchTab('output');

    setTimeout(() => {
        const target = document.querySelector('.print-root');
        if (!target || !window.html2canvas) return;

        const grid = target.querySelector('.activities-grid');
        const previous = {
            targetWidth: target.style.width,
            gridOverflow: grid ? grid.style.overflow : '',
            gridWidth: grid ? grid.style.width : ''
        };

        if (grid) {
            grid.style.overflow = 'visible';
            grid.style.width = `${grid.scrollWidth}px`;
        }
        target.style.width = `${target.scrollWidth}px`;

        target.classList.add('exporting');
        const width = target.scrollWidth;
        const height = target.scrollHeight;
        const maxSide = 6000;
        const scale = Math.min(3, maxSide / Math.max(width, height));
        html2canvas(target, {
            backgroundColor: '#ffffff',
            scale,
            width,
            height,
            windowWidth: width,
            windowHeight: height
        }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'design-map.png';
            link.click();
            target.classList.remove('exporting');
            target.style.width = previous.targetWidth;
            if (grid) {
                grid.style.overflow = previous.gridOverflow;
                grid.style.width = previous.gridWidth;
            }
            if (activeTab) {
                switchTab(activeTab);
            }
        });
    }, 100);
}

function handleChartsDownload() {
    const activeTab = document.querySelector('.tab.active')?.getAttribute('data-tab');
    switchTab('charts');

    setTimeout(() => {
        const target = document.getElementById('chartsDownloadRoot');
        if (!target || !window.html2canvas) return;

        const cleanup = preparePieChartsForDownload(target);
        html2canvas(target, { backgroundColor: '#ffffff', scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'design-map-charts.png';
            link.click();
            cleanup();
            if (activeTab) {
                switchTab(activeTab);
            }
        });
    }, 100);
}

function preparePieChartsForDownload(rootEl) {
    const charts = Array.from(rootEl.querySelectorAll('.pie-chart'));
    const originals = charts.map(chart => {
        const size = chart.offsetWidth || 220;
        const slices = Array.isArray(chart._slices) ? chart._slices : [];
        const dataUrl = renderPieToDataUrl(size, slices);
        return {
            chart,
            previousBackground: chart.style.background,
            previousBackgroundImage: chart.style.backgroundImage,
            previousBackgroundSize: chart.style.backgroundSize,
            previousBackgroundPosition: chart.style.backgroundPosition,
            dataUrl
        };
    });

    originals.forEach(entry => {
        if (!entry.dataUrl) return;
        entry.chart.style.background = `url("${entry.dataUrl}")`;
        entry.chart.style.backgroundSize = 'cover';
        entry.chart.style.backgroundPosition = 'center';
    });

    return () => {
        originals.forEach(entry => {
            entry.chart.style.background = entry.previousBackground;
            entry.chart.style.backgroundImage = entry.previousBackgroundImage;
            entry.chart.style.backgroundSize = entry.previousBackgroundSize;
            entry.chart.style.backgroundPosition = entry.previousBackgroundPosition;
        });
    };
}

function renderPieToDataUrl(size, slices) {
    if (!slices.length) return '';
    const total = slices.reduce((sum, slice) => sum + (slice.value || 0), 0);
    const canvas = document.createElement('canvas');
    const pixelSize = Math.max(2, Math.floor(size * 2));
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const center = pixelSize / 2;
    const radius = center - 2;

    if (total <= 0) {
        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();
        return canvas.toDataURL('image/png');
    }

    let currentAngle = -Math.PI / 2;
    slices.forEach(slice => {
        if (!slice.value) return;
        const sliceAngle = (slice.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        currentAngle += sliceAngle;
    });

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toDataURL('image/png');
}

document.addEventListener('DOMContentLoaded', init);
