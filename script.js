let activities = [];
let activityCounter = 0;
const STORAGE_KEY = 'design-map-state-v1';
let saveIndicatorTimer = null;
let selectedActivityId = null;
let outputEditorAddMode = false;
let observationForm = null;

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
    initOutputEditor();
    updateValidationWarnings();
    updateLessonSummaryStrip();
    updateCharts(getFilledActivities());
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
    const pptxBtn = document.getElementById('downloadPptxBtn');
    if (pptxBtn) {
        pptxBtn.addEventListener('click', handlePptxDownload);
    }
    document.getElementById('downloadChartsBtn').addEventListener('click', handleChartsDownload);
    const applyMarkdownBtn = document.getElementById('applyMarkdownBtn');
    if (applyMarkdownBtn) {
        applyMarkdownBtn.addEventListener('click', applyMarkdownInput);
    }
    const pasteSampleBtn = document.getElementById('pasteMarkdownSampleBtn');
    if (pasteSampleBtn) {
        pasteSampleBtn.addEventListener('click', pasteMarkdownSample);
    }
    const copyPromptBtn = document.getElementById('copyMarkdownPromptBtn');
    if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', copyMarkdownPrompt);
    }
    const copyBtn = document.getElementById('copyPromptBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyPromptToClipboard);
    }
    const observationDocxBtn = document.getElementById('downloadObservationDocxBtn');
    if (observationDocxBtn) {
        observationDocxBtn.addEventListener('click', handleObservationDocxDownload);
    }
    const refreshObservationBtn = document.getElementById('refreshObservationBtn');
    if (refreshObservationBtn) {
        refreshObservationBtn.addEventListener('click', refreshObservationFormFromInputs);
    }

    const container = document.getElementById('activitiesContainer');
    container.addEventListener('change', handleActivityChange);
    container.addEventListener('input', handleActivityChange);
    container.addEventListener('click', handleActivityClick);

    const observationContainer = document.getElementById('lessonObservationContainer');
    if (observationContainer) {
        observationContainer.addEventListener('input', handleObservationFormInput);
        observationContainer.addEventListener('change', handleObservationFormInput);
    }

    document.querySelectorAll('#input input, #input textarea, #input select').forEach(el => {
        el.addEventListener('input', saveState);
        el.addEventListener('change', saveState);
    });

    document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-switch-tab]');
        if (!trigger) return;
        const tabName = trigger.getAttribute('data-switch-tab');
        if (tabName) {
            switchTab(tabName);
        }
    });
}

function copyMarkdownPrompt() {
    const sample = document.getElementById('markdownPromptSample');
    if (!sample) return;
    const text = sample.textContent || '';
    if (!text.trim()) return;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => {});
        return;
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    try {
        document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(temp);
}

function pasteMarkdownSample() {
    const target = document.getElementById('markdownInput');
    const sample = document.getElementById('markdownSampleTemplate');
    if (!target || !sample) return;
    target.value = sample.textContent || '';
    target.focus();
}

function applyMarkdownInput() {
    const input = document.getElementById('markdownInput');
    if (!input) return;
    const parsed = parseMarkdown(input.value || '');
    if (!parsed) return;

    const meta = parsed.meta;
    if (meta.topic !== undefined) document.getElementById('topic').value = meta.topic;
    if (meta.level !== undefined) document.getElementById('level').value = meta.level;
    if (meta.studentProfile !== undefined) document.getElementById('studentProfile').value = meta.studentProfile;
    if (meta.duration !== undefined) document.getElementById('duration').value = meta.duration;
    if (meta.learningOutcomes !== undefined) document.getElementById('learningOutcomes').value = meta.learningOutcomes;
    if (meta.prerequisiteKnowledge !== undefined) document.getElementById('prerequisiteKnowledge').value = meta.prerequisiteKnowledge;
    if (meta.learningIssues !== undefined) document.getElementById('learningIssues').value = meta.learningIssues;
    if (meta.techIntegration !== undefined) document.getElementById('techIntegration').value = meta.techIntegration;

    const container = document.getElementById('activitiesContainer');
    if (container) container.innerHTML = '';
    activities = [];
    activityCounter = 0;

    parsed.activities.forEach(activity => addActivity(activity));
    saveState();
    updateValidationWarnings();
    switchTab('input');
}

function parseMarkdown(text) {
    const lines = (text || '').split(/\r?\n/);
    const meta = {};
    const activitiesParsed = [];
    let currentActivity = null;
    let currentField = '';
    let currentMetaField = '';

    const pushActivity = () => {
        if (currentActivity) {
            activitiesParsed.push(currentActivity);
            currentActivity = null;
            currentField = '';
        }
    };

    lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;
        if (line.startsWith('//')) return;
        if (line.startsWith('#')) {
            if (/^##\s*Activity/i.test(line)) {
                pushActivity();
                currentActivity = {
                    interaction: '',
                    alp: '',
                    keyApp: '',
                    time: '5',
                    details: '',
                    tech: ''
                };
            }
            return;
        }

        const cleanedLine = line.replace(/^-\s+/, '');
        const colonIndex = cleanedLine.indexOf(':');
        if (colonIndex === -1) {
            if (currentActivity && currentField === 'details') {
                currentActivity.details = `${currentActivity.details} ${line}`.trim();
            } else if (currentMetaField) {
                meta[currentMetaField] = `${meta[currentMetaField] || ''} ${line}`.trim();
            }
            return;
        }

        const key = cleanedLine.slice(0, colonIndex).trim().toLowerCase();
        let value = cleanedLine.slice(colonIndex + 1).trim();
        value = value.split(' //')[0].trim();
        currentMetaField = '';

        if (currentActivity) {
            switch (key) {
                case 'interaction type':
                    currentActivity.interaction = mapInteractionValue(value);
                    currentField = '';
                    break;
                case 'active learning process':
                    currentActivity.alp = mapAlpValue(value);
                    currentField = '';
                    break;
                case 'time (mins)':
                case 'time':
                    currentActivity.time = value;
                    currentField = '';
                    break;
                case 'activity details':
                    currentActivity.details = value;
                    currentField = 'details';
                    break;
                case 'key application of technology':
                    currentActivity.keyApp = mapKeyAppValue(value);
                    currentField = '';
                    break;
                case 'tech tool':
                    currentActivity.tech = value;
                    currentField = '';
                    break;
                default:
                    if (currentField === 'details' && value) {
                        currentActivity.details = `${currentActivity.details} ${value}`.trim();
                    }
                    break;
            }
            return;
        }

        switch (key) {
            case 'topic':
                meta.topic = value;
                break;
            case 'level':
                meta.level = value;
                break;
            case 'student profile':
                meta.studentProfile = value;
                break;
            case 'duration (minutes)':
            case 'duration':
                meta.duration = value;
                break;
            case 'learning outcomes':
                meta.learningOutcomes = value;
                currentMetaField = 'learningOutcomes';
                break;
            case 'prerequisite knowledge':
                meta.prerequisiteKnowledge = value;
                currentMetaField = 'prerequisiteKnowledge';
                break;
            case 'learning issue to be addressed':
                meta.learningIssues = value;
                currentMetaField = 'learningIssues';
                break;
            case 'level of technology integration':
                meta.techIntegration = mapTechIntegration(value);
                break;
            default:
                break;
        }
    });

    pushActivity();
    return { meta, activities: activitiesParsed };
}

function mapInteractionValue(value) {
    const cleaned = (value || '').trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    const direct = interactionTypes.find(t => t.value === lower);
    if (direct) return direct.value;
    const label = interactionTypes.find(t => t.label.toLowerCase() === lower);
    return label ? label.value : '';
}

function mapAlpValue(value) {
    const cleaned = (value || '').trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    const direct = alpStrategies.find(a => a.value === lower);
    if (direct) return direct.value;
    const label = alpStrategies.find(a => a.label.toLowerCase() === lower);
    return label ? label.value : '';
}

function mapKeyAppValue(value) {
    const cleaned = (value || '').trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    const direct = keyApplications.find(k => k.value === lower);
    if (direct) return direct.value;
    const label = keyApplications.find(k => k.label.toLowerCase() === lower);
    return label ? label.value : '';
}

function mapTechIntegration(value) {
    const cleaned = (value || '').trim().toLowerCase();
    if (!cleaned) return 'optional';
    if (['optional', 'replacement', 'amplification', 'transformation'].includes(cleaned)) {
        return cleaned;
    }
    return 'optional';
}

function initOutputEditor() {
    const editor = document.getElementById('outputEditor');
    if (!editor) return;

    const interactionSelect = document.getElementById('editorInteraction');
    const alpSelect = document.getElementById('editorAlp');
    const keyAppSelect = document.getElementById('editorKeyApp');

    interactionSelect.innerHTML = `<option value="">Select type</option>${interactionTypes
        .map(t => `<option value="${t.value}">${t.label}</option>`)
        .join('')}`;
    alpSelect.innerHTML = `<option value="">Select process</option>${alpStrategies
        .map(a => `<option value="${a.value}">${a.label}</option>`)
        .join('')}`;
    keyAppSelect.innerHTML = `<option value="">Select category</option>${keyApplications
        .map(k => `<option value="${k.value}">${k.label}</option>`)
        .join('')}`;

    const closeBtn = document.getElementById('outputEditorClose');
    closeBtn?.addEventListener('click', closeOutputEditor);
    const addBtn = document.getElementById('outputEditorAdd');
    addBtn?.addEventListener('click', handleEditorAddActivity);
    const deleteBtn = document.getElementById('outputEditorDelete');
    deleteBtn?.addEventListener('click', handleEditorDeleteActivity);

    ['editorInteraction', 'editorAlp', 'editorTime', 'editorDetails', 'editorKeyApp', 'editorTech'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', handleEditorChange);
        el.addEventListener('change', handleEditorChange);
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
                        <label>Active Learning Process <span class="required">*</span> <span class="field-hint">What students are mainly doing in this activity</span></label>
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
                    <label>Key Application of Technology <span class="field-hint">How the technology supports learning here</span></label>
                    <select data-id="${activityCounter}" data-field="keyApp">
                        <option value="">Select category</option>
                        ${keyApplications.map(k => `<option value="${k.value}">${k.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group activity-extra">
                    <label>Tech Tool <span class="field-hint">≤ 25 characters</span></label>
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
    updateLessonSummaryStrip();
    updateLccPrompt();
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
        activities,
        observationForm
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        showSaveIndicator();
        updateLessonSummaryStrip();
        updateLccPrompt();
        updateValidationWarnings();
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
        observationForm = normalizeObservationFormState(state.observationForm);
        updateLessonSummaryStrip();
        updateLccPrompt();

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
    document.body.classList.toggle('output-open', tabName === 'output');
    updateLessonSummaryStrip();
    if (tabName === 'output') {
        const filled = getFilledActivities();
        if (!filled.length) {
            renderOutputEmptyState();
            closeOutputEditor();
        } else {
            renderMap(filled, getMetaFromInputs());
        }
    }
    if (tabName === 'charts') {
        updateCharts(getFilledActivities());
    }
    if (tabName === 'lcc') {
        updateLccPrompt();
    }
    if (tabName === 'observation') {
        updateLessonObservationForm();
    }
}

function generateMap() {
    syncActivitiesFromDom();
    const filled = getFilledActivities();

    if (filled.length === 0) {
        alert('Please fill in at least one activity with:\n- Interaction Type\n- Active Learning Process\n- Activity Details');
        return;
    }

    const meta = getMetaFromInputs();

    renderMap(filled, meta);
    updateCharts(filled);
    switchTab('output');
}

function getFilledActivities() {
    return activities.filter(a => a.interaction && a.alp && a.details);
}

function syncActivitiesFromDom() {
    const items = Array.from(document.querySelectorAll('.activity-item'));
    if (!items.length) return;
    activities = items.map((item, index) => {
        const id = parseInt(item.dataset.id, 10) || index + 1;
        const getValue = field => item.querySelector(`[data-field="${field}"]`)?.value || '';
        return {
            id,
            interaction: getValue('interaction'),
            alp: getValue('alp'),
            keyApp: getValue('keyApp'),
            time: getValue('time') || '5',
            details: getValue('details'),
            tech: getValue('tech')
        };
    });
    activityCounter = activities.length;
    updateValidationWarnings();
}

function getMetaFromInputs() {
    return {
        topic: document.getElementById('topic')?.value || 'Lesson Design Map',
        level: document.getElementById('level')?.value || '',
        duration: document.getElementById('duration')?.value || 60,
        studentProfile: document.getElementById('studentProfile')?.value || '',
        learningOutcomes: document.getElementById('learningOutcomes')?.value || '',
        prerequisiteKnowledge: document.getElementById('prerequisiteKnowledge')?.value || '',
        learningIssues: document.getElementById('learningIssues')?.value || '',
        techIntegration: document.getElementById('techIntegration')?.value || 'optional'
    };
}

function updateLessonSummaryStrip() {
    const topicEl = document.getElementById('summaryTopic');
    const levelEl = document.getElementById('summaryLevel');
    const durationEl = document.getElementById('summaryDuration');
    const activitiesEl = document.getElementById('summaryActivities');
    const readyEl = document.getElementById('summaryReady');
    if (!topicEl || !levelEl || !durationEl || !activitiesEl || !readyEl) return;

    const topic = document.getElementById('topic')?.value || '';
    const level = document.getElementById('level')?.value || '';
    const duration = document.getElementById('duration')?.value || '';
    const totalActivities = activities.length;
    const completeActivities = getFilledActivities().length;
    const durationValue = String(duration || '').trim();

    topicEl.textContent = String(topic || '').trim() || 'Untitled lesson';
    levelEl.textContent = String(level || '').trim() || 'Not set';
    durationEl.textContent = durationValue ? `${durationValue} min` : 'Not set';
    activitiesEl.textContent = `${totalActivities} total`;
    readyEl.textContent = `${completeActivities} complete`;
}

function renderOutputEmptyState() {
    const container = document.getElementById('designMapContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state empty-state-rich stagger-item" style="--delay:0.04s;">
            <div class="empty-icon">Map</div>
            <h3>No Design Map Yet</h3>
            <p>Fill in the lesson activities, then generate the map when you are ready to see the lesson flow visually.</p>
            <button class="btn btn-primary" type="button" data-switch-tab="input">Open Input</button>
        </div>
    `;
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
            <div class="design-map-wrapper stagger-item" style="--delay:0.04s;">
            <div class="design-map-summary stagger-item" style="--delay:0.08s; margin-bottom: 2rem;">
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

            <div class="stagger-item" style="--delay:0.14s; position: relative;">
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
    const fillClass = activityCount <= 6 ? 'fill-width' : '';
    html += `<div class="activities-grid ${fillClass}" style="--activity-count:${activityCount};">`;

    orderedActivities.forEach((act, index) => {
        const rawKeyAppLabel = keyApplications.find(k => k.value === act.keyApp)?.label || act.keyApp;
        const keyAppLabel = formatKeyAppLabel(rawKeyAppLabel);
        const rowIndex = levels.findIndex(level => level.key === act.interaction) + 1;
        const columnIndex = index + 1;

        html += `
            <div class="activity-slot" style="grid-row:${rowIndex}; grid-column:${columnIndex};">
                <div class="activity-box ${act.alp}" data-activity-id="${act.id}">
                    ${act.time ? `<div class="activity-time-inline">Activity ${act.id} (${act.time} min)</div>` : `<div class="activity-time-inline">Activity ${act.id}</div>`}
                    ${keyAppLabel ? `<div class="activity-alp-tag"><span class="alp-text">${keyAppLabel}</span></div>` : ''}
                    <div class="activity-title"></div>
                    <div class="activity-details">${act.details}</div>
                    ${act.tech ? `<div class="activity-tech">[Tool]: ${act.tech}</div>` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';

    html += '</div></div>';

    // Add legend
    html += `
        <div class="legend-table stagger-item" style="--delay:0.22s;">
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
    requestAnimationFrame(() => updateArrowsFromDom(orderedActivities, levels));
    bindOutputInteractions();
    updateValidationWarnings();
}

function updateValidationWarnings() {
    const inputWarning = document.getElementById('inputWarning');
    const outputWarning = document.getElementById('outputWarning');
    const missingIds = [];

    activities.forEach(activity => {
        if (!activity.interaction || !activity.alp || !activity.details) {
            missingIds.push(activity.id);
        }
    });

    let text = '';
    if (missingIds.length === 1) {
        text = `Activity ${missingIds[0]}'s compulsory fields are not keyed in. Please key in or delete the activity.`;
    } else if (missingIds.length > 1) {
        text = `Activity ${formatIdList(missingIds)}'s compulsory fields are not keyed in. Please key in or delete the activities.`;
    }
    if (inputWarning) {
        inputWarning.textContent = text;
        inputWarning.classList.toggle('visible', Boolean(text));
    }
    if (outputWarning) {
        outputWarning.textContent = text;
        outputWarning.classList.toggle('visible', Boolean(text));
    }
}

function formatIdList(ids) {
    const list = ids.map(id => String(id));
    if (list.length <= 2) return list.join(' and ');
    return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function bindOutputInteractions() {
    const container = document.getElementById('designMapContainer');
    if (!container) return;

    const boxes = container.querySelectorAll('.activity-box[data-activity-id]');
    boxes.forEach(box => {
        box.addEventListener('pointerdown', handleActivityDragStart);
        box.addEventListener('click', handleActivityClickOutput);
    });
}

function handleActivityClickOutput(e) {
    const box = e.currentTarget;
    const id = parseInt(box.dataset.activityId, 10);
    if (!id) return;
    if (box.dataset.dragged === 'true') {
        box.dataset.dragged = 'false';
        return;
    }
    openOutputEditor(id);
}

function handleActivityDragStart(e) {
    const box = e.currentTarget;
    const id = parseInt(box.dataset.activityId, 10);
    if (!id) return;

    const startY = e.clientY;
    const startX = e.clientX;
    box.classList.add('dragging');
    box.setPointerCapture(e.pointerId);

    const onMove = moveEvent => {
        const dy = moveEvent.clientY - startY;
        box.style.transform = `translateY(${dy}px)`;
        if (Math.abs(dy) > 4 || Math.abs(moveEvent.clientX - startX) > 4) {
            box.dataset.dragged = 'true';
        }
    };

    const onUp = upEvent => {
        box.releasePointerCapture(upEvent.pointerId);
        box.classList.remove('dragging');
        box.style.transform = '';

        const grid = document.querySelector('.activities-grid');
        if (grid && box.dataset.dragged === 'true') {
            const rect = grid.getBoundingClientRect();
            const rowH = rect.height / 4;
            const y = Math.min(rect.bottom - 1, Math.max(rect.top + 1, upEvent.clientY));
            const rowIndex = Math.min(3, Math.max(0, Math.floor((y - rect.top) / rowH)));
            const rowMap = ['community', 'class', 'group', 'individual'];
            updateActivityField(id, 'interaction', rowMap[rowIndex]);
            refreshOutputMap();
        }

        box.dataset.dragged = 'false';

        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
}

function refreshOutputMap() {
    const filled = getFilledActivities();
    updateCharts(filled);
    if (!filled.length) {
        renderOutputEmptyState();
        closeOutputEditor();
        return;
    }
    renderMap(filled, getMetaFromInputs());
}

function openOutputEditor(activityId) {
    const editor = document.getElementById('outputEditor');
    if (!editor) return;
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    selectedActivityId = activityId;
    editor.classList.add('active');
    editor.setAttribute('aria-hidden', 'false');
    outputEditorAddMode = false;
    updateOutputEditorCloseTitle();
    const titleEl = document.getElementById('outputEditorTitle');
    if (titleEl) {
        titleEl.textContent = `(Activity ${activityId})`;
    }

    document.getElementById('editorInteraction').value = activity.interaction || '';
    document.getElementById('editorAlp').value = activity.alp || '';
    document.getElementById('editorTime').value = activity.time || '';
    document.getElementById('editorDetails').value = activity.details || '';
    document.getElementById('editorKeyApp').value = activity.keyApp || '';
    document.getElementById('editorTech').value = activity.tech || '';
}

function closeOutputEditor() {
    const editor = document.getElementById('outputEditor');
    if (!editor) return;
    selectedActivityId = null;
    outputEditorAddMode = false;
    updateOutputEditorCloseTitle();
    editor.classList.remove('active');
    editor.setAttribute('aria-hidden', 'true');
}


function handleEditorChange(e) {
    if (!selectedActivityId) return;
    const fieldMap = {
        editorInteraction: 'interaction',
        editorAlp: 'alp',
        editorTime: 'time',
        editorDetails: 'details',
        editorKeyApp: 'keyApp',
        editorTech: 'tech'
    };

    const field = fieldMap[e.target.id];
    if (!field) return;
    updateActivityField(selectedActivityId, field, e.target.value);
    refreshOutputMap();
}

function handleEditorAddActivity() {
    if (!selectedActivityId) {
        addActivity();
        renumberActivities();
        const lastId = activities.length;
        if (lastId) {
            openOutputEditor(lastId);
        }
        outputEditorAddMode = true;
        updateOutputEditorCloseTitle();
        refreshOutputMap();
        return;
    }
    insertActivityAfterSelected(selectedActivityId);
}

function handleEditorDeleteActivity() {
    if (!selectedActivityId) return;
    deleteActivityById(selectedActivityId);
    closeOutputEditor();
    refreshOutputMap();
}

function deleteActivityById(activityId) {
    const item = document.querySelector(`.activity-item[data-id="${activityId}"]`);
    if (item) item.remove();
    activities = activities.filter(a => a.id !== activityId);
    renumberActivities();
    syncActivitiesFromDom();
    saveState();
    updateCharts(getFilledActivities());
    refreshOutputMap();
}

function insertActivityAfterSelected(activityId) {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    const anchor = container.querySelector(`.activity-item[data-id="${activityId}"]`);
    if (!anchor) return;

    addActivity();
    const newItem = container.lastElementChild;
    if (newItem && newItem !== anchor) {
        if (anchor.nextSibling) {
            container.insertBefore(newItem, anchor.nextSibling);
        } else {
            container.appendChild(newItem);
        }
    }

    renumberActivities();
    syncActivitiesFromDom();
    saveState();
    refreshOutputMap();

    const newIndex = Array.from(container.querySelectorAll('.activity-item')).indexOf(newItem) + 1;
    if (newIndex) {
        openOutputEditor(newIndex);
        outputEditorAddMode = true;
        updateOutputEditorCloseTitle();
    }
}

function updateOutputEditorCloseTitle() {
    const closeBtn = document.getElementById('outputEditorClose');
    if (!closeBtn) return;
    if (outputEditorAddMode) {
        closeBtn.title = 'Close to add activity.';
    } else {
        closeBtn.removeAttribute('title');
    }
}

function updateActivityField(activityId, field, value) {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    activity[field] = value;

    if (selectedActivityId === activityId) {
        const editorMap = {
            interaction: 'editorInteraction',
            alp: 'editorAlp',
            time: 'editorTime',
            details: 'editorDetails',
            keyApp: 'editorKeyApp',
            tech: 'editorTech'
        };
        const editorId = editorMap[field];
        const editorEl = editorId ? document.getElementById(editorId) : null;
        if (editorEl && editorEl.value !== value) {
            editorEl.value = value;
        }
    }

    const input = document.querySelector(`[data-id="${activityId}"][data-field="${field}"]`);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    saveState();
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
    const emptyState = document.getElementById('chartsEmptyState');
    const content = document.getElementById('chartsContent');
    const hasData = Array.isArray(filledActivities) && filledActivities.length > 0;
    if (emptyState) {
        emptyState.hidden = hasData;
    }
    if (content) {
        content.hidden = !hasData;
    }
    if (!hasData) {
        return;
    }

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

function updateArrowsFromDom(orderedActivities, levels) {
    if (orderedActivities.length < 2) return;
    const container = document.getElementById('designMapContainer');
    const grid = container?.querySelector('.activities-grid');
    if (!grid) return;
    const existing = grid.querySelector('.activity-arrows');
    if (existing) existing.remove();

    const gridRect = grid.getBoundingClientRect();
    const width = Math.max(grid.scrollWidth, grid.clientWidth);
    const height = Math.max(grid.scrollHeight, grid.clientHeight);
    const paths = [];

    const getBoxRect = activityId => {
        const box = grid.querySelector(`.activity-box[data-activity-id="${activityId}"]`);
        return box ? box.getBoundingClientRect() : null;
    };

    for (let i = 0; i < orderedActivities.length - 1; i++) {
        const current = orderedActivities[i];
        const next = orderedActivities[i + 1];
        const currentRect = getBoxRect(current.id);
        const nextRect = getBoxRect(next.id);
        if (!currentRect || !nextRect) continue;

        const startX = currentRect.right - gridRect.left + grid.scrollLeft;
        const startY = (currentRect.top + currentRect.bottom) / 2 - gridRect.top + grid.scrollTop;
        const endX = nextRect.left - gridRect.left + grid.scrollLeft;
        const endY = (nextRect.top + nextRect.bottom) / 2 - gridRect.top + grid.scrollTop;

        if (Math.abs(startY - endY) < 2) {
            paths.push(`M ${startX} ${startY} L ${endX - 4} ${endY}`);
            continue;
        }

        paths.push(`M ${startX} ${startY} L ${startX} ${endY} L ${endX - 4} ${endY}`);
    }

    if (!paths.length) return;

    const svg = `
        <svg class="activity-arrows" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:${width}px;height:${height}px;">
            <defs>
                <marker id="arrowhead" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill="#333"></polygon>
                </marker>
            </defs>
            ${paths.map(path => `<path d="${path}" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" marker-end="url(#arrowhead)"></path>`).join('')}
        </svg>
    `;
    grid.insertAdjacentHTML('beforeend', svg);
}

function updateLccPrompt() {
    const box = document.getElementById('promptMarkdown');
    if (!box) return;
    box.value = buildPromptMarkdown();
}

function createObservationFormStateFromInputs() {
    const meta = getMetaFromInputs();
    const filled = getFilledActivities().sort((a, b) => a.id - b.id);

    return {
        title: 'Lesson Observation Form',
        subtitle: buildObservationSubtitle(meta),
        topic: meta.topic || '',
        level: meta.level || '',
        duration: meta.duration ? `${meta.duration} minutes` : '',
        studentProfile: meta.studentProfile || '',
        techIntegration: formatPromptTechIntegration(meta.techIntegration),
        learningOutcomes: meta.learningOutcomes || '',
        prerequisiteKnowledge: meta.prerequisiteKnowledge || '',
        learningIssues: meta.learningIssues || '',
        rows: filled.map(createObservationRowFromActivity)
    };
}

function createObservationRowFromActivity(activity) {
    return {
        id: String(activity.id || ''),
        title: `Activity ${activity.id}`,
        time: activity.time ? `${activity.time} min` : '',
        interaction: getInteractionLabel(activity.interaction) || '',
        alp: getAlpLabel(activity.alp) || '',
        details: activity.details || '',
        keyApp: getKeyAppLabel(activity.keyApp) || '',
        tech: activity.tech || '',
        observation: ''
    };
}

function buildObservationSubtitle(meta) {
    const parts = [];
    if (meta.topic) parts.push(meta.topic);
    if (meta.level) parts.push(meta.level);
    if (meta.duration) parts.push(`${meta.duration} minutes`);
    return parts.join(' | ');
}

function normalizeObservationFormState(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const normalize = value => String(value || '');
    const rows = Array.isArray(raw.rows)
        ? raw.rows.map((row, index) => ({
            id: normalize(row?.id || index + 1),
            title: normalize(row?.title || `Activity ${index + 1}`),
            time: normalize(row?.time),
            interaction: normalize(row?.interaction),
            alp: normalize(row?.alp),
            details: normalize(row?.details),
            keyApp: normalize(row?.keyApp),
            tech: normalize(row?.tech),
            observation: normalize(row?.observation)
        }))
        : [];

    return {
        title: normalize(raw.title || 'Lesson Observation Form'),
        subtitle: normalize(raw.subtitle),
        topic: normalize(raw.topic),
        level: normalize(raw.level),
        duration: normalize(raw.duration),
        studentProfile: normalize(raw.studentProfile),
        techIntegration: normalize(raw.techIntegration),
        learningOutcomes: normalize(raw.learningOutcomes),
        prerequisiteKnowledge: normalize(raw.prerequisiteKnowledge),
        learningIssues: normalize(raw.learningIssues),
        rows
    };
}

function ensureObservationForm(forceReset = false) {
    const normalized = normalizeObservationFormState(observationForm);
    if (!forceReset && normalized && (normalized.rows.length || hasObservationFormContent(normalized))) {
        observationForm = normalized;
        return observationForm;
    }

    syncActivitiesFromDom();
    observationForm = createObservationFormStateFromInputs();
    return observationForm;
}

function hasObservationFormContent(form) {
    if (!form) return false;
    const customTitle = String(form.title || '').trim();
    if (customTitle && customTitle !== 'Lesson Observation Form') {
        return true;
    }
    const topLevelFields = [
        form.subtitle,
        form.topic,
        form.level,
        form.duration,
        form.studentProfile,
        form.techIntegration,
        form.learningOutcomes,
        form.prerequisiteKnowledge,
        form.learningIssues
    ];
    if (topLevelFields.some(value => String(value || '').trim())) {
        return true;
    }
    return Array.isArray(form.rows) && form.rows.some(row =>
        ['title', 'time', 'interaction', 'alp', 'details', 'keyApp', 'tech', 'observation']
            .some(field => String(row?.[field] || '').trim())
    );
}

function refreshObservationFormFromInputs() {
    syncActivitiesFromDom();
    if (hasObservationFormContent(observationForm)) {
        const confirmed = confirm('Refresh the lesson observation form from the current lesson inputs? This will replace any edits made in the observation page.');
        if (!confirmed) return;
    }
    observationForm = createObservationFormStateFromInputs();
    saveState();
    updateLessonObservationForm();
}

function updateLessonObservationForm() {
    const container = document.getElementById('lessonObservationContainer');
    if (!container) return;

    const form = ensureObservationForm();

    if (!form.rows.length) {
        container.innerHTML = `
            <div class="empty-state empty-state-rich stagger-item" style="--delay:0.04s;">
                <div class="empty-icon">Form</div>
                <h3>No Lesson Observation Form Yet</h3>
                <p>Fill in at least one complete activity to generate the observation layout.</p>
                <button class="btn btn-primary" type="button" data-switch-tab="input">Open Input</button>
            </div>
        `;
        return;
    }

    const rows = form.rows.map((row, index) => buildObservationActivityRow(row, index)).join('');

    container.innerHTML = `
        <div class="lesson-observation-sheet stagger-item" style="--delay:0.04s;">
            <div class="lesson-observation-heading stagger-item" style="--delay:0.08s;">
                <div>
                    <div class="lesson-observation-subtitle">
                        <input
                            type="text"
                            value="${escapeAttribute(form.title)}"
                            data-observation-meta="title"
                            aria-label="Lesson observation form title"
                        >
                        <textarea
                            rows="2"
                            data-observation-meta="subtitle"
                            aria-label="Lesson observation form subtitle"
                            placeholder="Add a subtitle or context line for this form..."
                        >${escapeHtml(form.subtitle)}</textarea>
                    </div>
                </div>
            </div>
            <div class="lesson-observation-meta-grid stagger-item" style="--delay:0.14s;">
                ${buildObservationMetaCard('topic', 'Topic', form.topic)}
                ${buildObservationMetaCard('level', 'Level', form.level)}
                ${buildObservationMetaCard('duration', 'Duration', form.duration)}
                ${buildObservationMetaCard('studentProfile', 'Student profile', form.studentProfile, true)}
                ${buildObservationMetaCard('techIntegration', 'Technology integration', form.techIntegration)}
            </div>
            <div class="lesson-observation-notes stagger-item" style="--delay:0.2s;">
                ${buildObservationNoteCard('learningOutcomes', 'Learning outcomes', form.learningOutcomes)}
                ${buildObservationNoteCard('prerequisiteKnowledge', 'Prerequisite knowledge', form.prerequisiteKnowledge)}
                ${buildObservationNoteCard('learningIssues', 'Learning issue to be addressed', form.learningIssues)}
            </div>
            <div class="lesson-observation-table-wrap stagger-item" style="--delay:0.26s;">
                <table class="lesson-observation-table">
                    <thead>
                        <tr>
                            <th>Planned Lesson Activity</th>
                            <th>Lesson Observation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function buildObservationMetaCard(field, label, value, multiline = false) {
    const control = multiline
        ? `<textarea rows="3" data-observation-meta="${field}" aria-label="${escapeAttribute(label)}">${escapeHtml(value)}</textarea>`
        : `<input type="text" value="${escapeAttribute(value)}" data-observation-meta="${field}" aria-label="${escapeAttribute(label)}">`;

    return `
        <div class="lesson-observation-meta-card">
            <span class="lesson-observation-meta-label">${escapeHtml(label)}</span>
            <div class="lesson-observation-meta-value">${control}</div>
        </div>
    `;
}

function buildObservationNoteCard(field, label, value) {
    return `
        <div class="lesson-observation-note">
            <strong>${escapeHtml(label)}</strong>
            <textarea
                rows="3"
                data-observation-meta="${field}"
                aria-label="${escapeAttribute(label)}"
                placeholder="Type ${escapeAttribute(label.toLowerCase())} here..."
            >${escapeHtml(value)}</textarea>
        </div>
    `;
}

function buildObservationField(rowIndex, field, label, value) {
    return `
        <label class="observation-field">
            <span class="observation-field-label">${escapeHtml(label)}</span>
            <input
                type="text"
                value="${escapeAttribute(value)}"
                data-observation-row="${rowIndex}"
                data-observation-field="${field}"
                aria-label="${escapeAttribute(`Activity ${rowIndex + 1} ${label}`)}"
            >
        </label>
    `;
}

function buildObservationActivityRow(row, rowIndex) {
    const titleValue = row.title || `Activity ${rowIndex + 1}`;

    return `
        <tr>
            <td>
                <div class="observation-activity-title">
                    <input
                        type="text"
                        value="${escapeAttribute(titleValue)}"
                        data-observation-row="${rowIndex}"
                        data-observation-field="title"
                        aria-label="${escapeAttribute(`Activity ${rowIndex + 1} title`)}"
                    >
                </div>
                <div class="observation-chip-row">
                    ${buildObservationField(rowIndex, 'time', 'Time', row.time)}
                    ${buildObservationField(rowIndex, 'interaction', 'Interaction', row.interaction)}
                    ${buildObservationField(rowIndex, 'alp', 'Active Learning Process', row.alp)}
                </div>
                <label class="observation-activity-details">
                    <span class="observation-field-label">Activity Details</span>
                    <textarea
                        rows="4"
                        data-observation-row="${rowIndex}"
                        data-observation-field="details"
                        aria-label="${escapeAttribute(`Activity ${rowIndex + 1} details`)}"
                    >${escapeHtml(row.details)}</textarea>
                </label>
                <div class="observation-inline-list">
                    <label class="observation-field">
                        <span class="observation-field-label">Key Application of Technology</span>
                        <textarea
                            rows="2"
                            data-observation-row="${rowIndex}"
                            data-observation-field="keyApp"
                            aria-label="${escapeAttribute(`Activity ${rowIndex + 1} key application of technology`)}"
                        >${escapeHtml(row.keyApp)}</textarea>
                    </label>
                    <label class="observation-field">
                        <span class="observation-field-label">Tech Tool</span>
                        <textarea
                            rows="2"
                            data-observation-row="${rowIndex}"
                            data-observation-field="tech"
                            aria-label="${escapeAttribute(`Activity ${rowIndex + 1} tech tool`)}"
                        >${escapeHtml(row.tech)}</textarea>
                    </label>
                </div>
            </td>
            <td>
                <div class="lesson-observation-box">
                    <textarea
                        rows="8"
                        data-observation-row="${rowIndex}"
                        data-observation-field="observation"
                        aria-label="${escapeAttribute(`Lesson observation notes for activity ${rowIndex + 1}`)}"
                        placeholder="Type lesson observation notes here..."
                    >${escapeHtml(row.observation)}</textarea>
                </div>
            </td>
        </tr>
    `;
}

function handleObservationFormInput(e) {
    const target = e.target;
    if (!target) return;

    const metaField = target.getAttribute('data-observation-meta');
    if (metaField) {
        ensureObservationForm();
        observationForm[metaField] = target.value;
        saveState();
        return;
    }

    const rowIndex = parseInt(target.getAttribute('data-observation-row'), 10);
    const field = target.getAttribute('data-observation-field');
    if (Number.isNaN(rowIndex) || !field) return;

    ensureObservationForm();
    if (!observationForm.rows[rowIndex]) return;
    observationForm.rows[rowIndex][field] = target.value;
    saveState();
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function buildPromptMarkdown() {
    const topic = document.getElementById('topic')?.value || '';
    const level = document.getElementById('level')?.value || '';
    const studentProfile = document.getElementById('studentProfile')?.value || '';
    const durationRaw = document.getElementById('duration')?.value || '';
    const learningOutcomes = document.getElementById('learningOutcomes')?.value || '';
    const prerequisiteKnowledge = document.getElementById('prerequisiteKnowledge')?.value || '';
    const learningIssues = document.getElementById('learningIssues')?.value || '';
    const techIntegration = document.getElementById('techIntegration')?.value || '';

    const lines = [];
    lines.push('Create lesson plan with the following information:');
    lines.push('');
    lines.push(`- Topic: ${formatPromptValue(topic)}`);
    lines.push(`- Level: ${formatPromptValue(level)}`);
    lines.push(`- Student profile: ${formatPromptValue(studentProfile)}`);
    lines.push(`- Duration: ${formatPromptDuration(durationRaw)}`);
    lines.push(`- Learning outcomes: ${formatPromptValue(learningOutcomes)}`);
    lines.push(`- Prerequisite knowledge: ${formatPromptValue(prerequisiteKnowledge)}`);
    lines.push(`- Learning issue to be addressed: ${formatPromptValue(learningIssues)}`);
    lines.push(`- Level of technology integration: ${formatPromptTechIntegration(techIntegration)}`);

    if (activities.length) {
        lines.push('- Learning activities:');
        activities.forEach((activity, index) => {
            lines.push(`  ${index + 1}. Activity ${index + 1}`);
            lines.push(`     - Interaction type: ${formatPromptValue(getInteractionLabel(activity.interaction))}`);
            lines.push(`     - Active learning process: ${formatPromptValue(getAlpLabel(activity.alp))}`);
            lines.push(`     - Time: ${formatPromptDuration(activity.time)}`);
            lines.push(`     - Activity details: ${formatPromptValue(activity.details)}`);
            lines.push(`     - Key application of technology: ${formatPromptValue(getKeyAppLabel(activity.keyApp))}`);
            lines.push(`     - Tech tool: ${formatPromptValue(activity.tech)}`);
        });
    } else {
        lines.push('- Learning activities: Not specified');
    }

    return lines.join('\n');
}

function formatPromptValue(value) {
    const trimmed = String(value || '').trim();
    return trimmed ? trimmed : 'Not specified';
}

function formatPromptDuration(value) {
    const trimmed = String(value || '').trim();
    return trimmed ? `${trimmed} minutes` : 'Not specified';
}

function formatPromptTechIntegration(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return 'Not specified';
    if (trimmed === 'optional') return 'Optional';
    return formatTechIntegration(trimmed);
}

function getInteractionLabel(value) {
    if (!value) return '';
    return interactionTypes.find(item => item.value === value)?.label || value;
}

function getAlpLabel(value) {
    if (!value) return '';
    return alpStrategies.find(item => item.value === value)?.label || value;
}

function getKeyAppLabel(value) {
    if (!value) return '';
    return keyApplications.find(item => item.value === value)?.label || value;
}

function copyPromptToClipboard() {
    const box = document.getElementById('promptMarkdown');
    if (!box) return;
    const text = box.value || '';
    const onSuccess = () => showCopyStatus('Copied to clipboard.', true);
    const onFailure = () => showCopyStatus('Unable to copy. Please select and copy manually.', false);

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(onFailure);
        return;
    }

    const wasReadonly = box.hasAttribute('readonly');
    if (wasReadonly) box.removeAttribute('readonly');
    box.focus();
    box.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            onSuccess();
        } else {
            onFailure();
        }
    } catch (err) {
        onFailure();
    }
    if (wasReadonly) box.setAttribute('readonly', '');
    window.getSelection()?.removeAllRanges();
}

function showCopyStatus(message, success) {
    const status = document.getElementById('copyStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('visible', Boolean(success));
    setTimeout(() => {
        status.textContent = '';
        status.classList.remove('visible');
    }, 2400);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function downloadCanvasAsPng(canvas, fileName) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName;
    link.click();
}

function addExportClassInClone(clonedDoc, selector) {
    const clonedTarget = clonedDoc.querySelector(selector);
    if (clonedTarget) {
        clonedTarget.classList.add('exporting');
    }
}

async function handleJpgDownload() {
    syncActivitiesFromDom();
    const filled = getFilledActivities();
    if (!filled.length) {
        alert('Please fill in at least one complete activity before downloading the Design Map image.');
        return;
    }

    const activeTab = document.querySelector('.tab.active')?.getAttribute('data-tab');
    switchTab('output');
    await wait(100);

    const target = document.querySelector('.print-root');
    if (!target || !window.html2canvas || !target.querySelector('.design-map-wrapper')) {
        if (activeTab) {
            switchTab(activeTab);
        }
        alert('Please generate a design map with at least one activity first.');
        return;
    }

    const grid = target.querySelector('.activities-grid');
    const previous = {
        targetWidth: target.style.width,
        gridOverflow: grid ? grid.style.overflow : '',
        gridWidth: grid ? grid.style.width : ''
    };

    try {
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
        const canvas = await html2canvas(target, {
            backgroundColor: '#ffffff',
            scale,
            width,
            height,
            windowWidth: width,
            windowHeight: height,
            onclone: clonedDoc => addExportClassInClone(clonedDoc, '.print-root')
        });
        downloadCanvasAsPng(canvas, 'design-map.png');
    } catch (err) {
        console.error('Unable to download design map image', err);
        alert('Unable to download the Design Map image.');
    } finally {
        target.classList.remove('exporting');
        target.style.width = previous.targetWidth;
        if (grid) {
            grid.style.overflow = previous.gridOverflow;
            grid.style.width = previous.gridWidth;
        }
        if (activeTab) {
            switchTab(activeTab);
        }
    }
}

async function handleChartsDownload() {
    syncActivitiesFromDom();
    const filled = getFilledActivities();
    if (!filled.length) {
        alert('Please fill in at least one complete activity before downloading the charts.');
        return;
    }

    const activeTab = document.querySelector('.tab.active')?.getAttribute('data-tab');
    switchTab('charts');
    updateCharts(filled);
    await wait(100);

    const content = document.getElementById('chartsContent');
    const target = document.getElementById('chartsDownloadRoot');
    if (!target || !window.html2canvas || content?.hidden) {
        if (activeTab) {
            switchTab(activeTab);
        }
        alert('Charts are not ready to download yet.');
        return;
    }

    const cleanup = preparePieChartsForDownload(target);
    try {
        target.classList.add('exporting');
        const canvas = await html2canvas(target, {
            backgroundColor: '#ffffff',
            scale: 2,
            onclone: clonedDoc => addExportClassInClone(clonedDoc, '#chartsDownloadRoot')
        });
        downloadCanvasAsPng(canvas, 'design-map-charts.png');
    } catch (err) {
        console.error('Unable to download charts image', err);
        alert('Unable to download the charts image.');
    } finally {
        target.classList.remove('exporting');
        cleanup();
        if (activeTab) {
            switchTab(activeTab);
        }
    }
}

async function handleObservationDocxDownload() {
    const form = ensureObservationForm();
    updateLessonObservationForm();

    if (!form.rows.length) {
        alert('Please fill in at least one complete activity before downloading the lesson observation form.');
        return;
    }
    if (!window.JSZip) {
        alert('DOCX export is unavailable because JSZip is not loaded.');
        return;
    }

    try {
        const blob = await buildObservationDocxBlob(form);
        downloadBlob(blob, 'lesson-observation-form.docx');
    } catch (err) {
        console.error('Unable to generate lesson observation DOCX', err);
        alert('Unable to generate the lesson observation DOCX file.');
    }
}

async function buildObservationDocxBlob(form) {
    const zip = new window.JSZip();
    const createdAt = new Date().toISOString();

    zip.file('[Content_Types].xml', buildObservationContentTypesXml());
    zip.folder('_rels').file('.rels', buildObservationRootRelsXml());

    const props = zip.folder('docProps');
    props.file('core.xml', buildObservationCoreXml(createdAt, form));
    props.file('app.xml', buildObservationAppXml(form));

    const word = zip.folder('word');
    word.file('document.xml', buildObservationDocumentXml(form));
    word.folder('_rels').file('document.xml.rels', buildObservationDocumentRelsXml());

    return zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE'
    });
}

function buildObservationContentTypesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function buildObservationRootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function buildObservationCoreXml(createdAt, form) {
    const title = xmlEscape(form.title || 'Lesson Observation Form');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>${title}</dc:title>
    <dc:creator>Design Map Generator</dc:creator>
    <cp:lastModifiedBy>Design Map Generator</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`;
}

function buildObservationAppXml(form) {
    const title = xmlEscape(form.title || 'Lesson Observation Form');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
    <Application>Design Map Generator</Application>
    <DocSecurity>0</DocSecurity>
    <ScaleCrop>false</ScaleCrop>
    <HeadingPairs>
        <vt:vector size="2" baseType="variant">
            <vt:variant><vt:lpstr>Sections</vt:lpstr></vt:variant>
            <vt:variant><vt:i4>1</vt:i4></vt:variant>
        </vt:vector>
    </HeadingPairs>
    <TitlesOfParts>
        <vt:vector size="1" baseType="lpstr">
            <vt:lpstr>${title}</vt:lpstr>
        </vt:vector>
    </TitlesOfParts>
    <Company></Company>
    <LinksUpToDate>false</LinksUpToDate>
    <SharedDoc>false</SharedDoc>
    <HyperlinksChanged>false</HyperlinksChanged>
    <AppVersion>1.0</AppVersion>
</Properties>`;
}

function buildObservationDocumentRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
}

function buildObservationDocumentXml(form) {
    const metaLines = [
        { label: 'Topic', value: form.topic },
        { label: 'Level', value: form.level },
        { label: 'Duration', value: form.duration },
        { label: 'Student profile', value: form.studentProfile },
        { label: 'Level of technology integration', value: form.techIntegration },
        { label: 'Learning outcomes', value: form.learningOutcomes },
        { label: 'Prerequisite knowledge', value: form.prerequisiteKnowledge },
        { label: 'Learning issue to be addressed', value: form.learningIssues }
    ].filter(item => String(item.value || '').trim());

    const intro = [
        buildWordParagraph(form.title || 'Lesson Observation Form', {
            bold: true,
            size: 32,
            color: '0B4F6C',
            align: 'center',
            spacingAfter: 180
        })
    ];

    if (String(form.subtitle || '').trim()) {
        intro.push(buildWordParagraph(form.subtitle, {
            size: 20,
            color: '475569',
            align: 'center',
            spacingAfter: 220
        }));
    }

    metaLines.forEach((line, index) => {
        intro.push(buildWordParagraph(`${line.label}: ${line.value}`, {
            size: 22,
            color: '0F172A',
            spacingAfter: index === metaLines.length - 1 ? 220 : 80
        }));
    });

    const tableXml = buildObservationTableXml(form.rows || []);

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
    <w:body>
        ${intro.join('')}
        ${tableXml}
        <w:p/>
        <w:sectPr>
            <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
            <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="450" w:footer="450" w:gutter="0"/>
        </w:sectPr>
    </w:body>
</w:document>`;
}

function buildObservationTableXml(rows) {
    const leftWidth = 6700;
    const rightWidth = 8500;
    const tableRows = [
        `<w:tr>
            <w:trPr>
                <w:tblHeader/>
            </w:trPr>
            ${buildWordCell(buildWordParagraph('Planned Lesson Activity', {
                bold: true,
                size: 22,
                color: '0B4F6C',
                align: 'center',
                spacingAfter: 0
            }), leftWidth, { fill: 'EAF3FB', center: true })}
            ${buildWordCell(buildWordParagraph('Lesson Observation', {
                bold: true,
                size: 22,
                color: '0B4F6C',
                align: 'center',
                spacingAfter: 0
            }), rightWidth, { fill: 'EAF3FB', center: true })}
        </w:tr>`
    ];

    rows.forEach((row, index) => {
        const paragraphs = [
            buildWordParagraph(row.title || `Activity ${index + 1}`, {
                bold: true,
                size: 24,
                color: '0B4F6C',
                spacingAfter: 100
            }),
            buildWordParagraph(`Time: ${row.time || 'Not specified'}`, {
                size: 20,
                spacingAfter: 40
            }),
            buildWordParagraph(`Interaction: ${row.interaction || 'Not specified'}`, {
                size: 20,
                spacingAfter: 40
            }),
            buildWordParagraph(`Active learning process: ${row.alp || 'Not specified'}`, {
                size: 20,
                spacingAfter: 80
            })
        ];

        paragraphs.push(...buildWordParagraphsFromText(`Activity details: ${row.details || ''}`, {
            size: 20,
            spacingAfter: row.keyApp || row.tech ? 80 : 120
        }));

        if (row.keyApp) {
            paragraphs.push(buildWordParagraph(`Key application of technology: ${row.keyApp}`, {
                size: 20,
                spacingAfter: row.tech ? 50 : 120
            }));
        }
        if (row.tech) {
            paragraphs.push(buildWordParagraph(`Tech tool: ${row.tech}`, {
                size: 20,
                spacingAfter: 120
            }));
        }

        const observationParagraphs = String(row.observation || '').trim()
            ? buildWordParagraphsFromText(row.observation, { size: 20, spacingAfter: 40 }).join('')
            : `${buildWordParagraph(' ', { spacingAfter: 0 })}${buildWordParagraph(' ', { spacingAfter: 0 })}`;

        tableRows.push(`
            <w:tr>
                <w:trPr>
                    <w:trHeight w:val="2200" w:hRule="atLeast"/>
                </w:trPr>
                ${buildWordCell(paragraphs.join(''), leftWidth)}
                ${buildWordCell(observationParagraphs, rightWidth)}
            </w:tr>
        `);
    });

    return `
        <w:tbl>
            <w:tblPr>
                <w:tblW w:w="15200" w:type="dxa"/>
                <w:tblLayout w:type="fixed"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="8" w:space="0" w:color="C9D8E7"/>
                    <w:left w:val="single" w:sz="8" w:space="0" w:color="C9D8E7"/>
                    <w:bottom w:val="single" w:sz="8" w:space="0" w:color="C9D8E7"/>
                    <w:right w:val="single" w:sz="8" w:space="0" w:color="C9D8E7"/>
                    <w:insideH w:val="single" w:sz="8" w:space="0" w:color="C9D8E7"/>
                    <w:insideV w:val="single" w:sz="8" w:space="0" w:color="C9D8E7"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="140" w:type="dxa"/>
                    <w:left w:w="140" w:type="dxa"/>
                    <w:bottom w:w="140" w:type="dxa"/>
                    <w:right w:w="140" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>
            <w:tblGrid>
                <w:gridCol w:w="${leftWidth}"/>
                <w:gridCol w:w="${rightWidth}"/>
            </w:tblGrid>
            ${tableRows.join('')}
        </w:tbl>
    `;
}

function buildWordCell(content, width, options = {}) {
    const props = [
        `<w:tcW w:w="${width}" w:type="dxa"/>`,
        '<w:vAlign w:val="top"/>'
    ];

    if (options.fill) {
        props.push(`<w:shd w:val="clear" w:color="auto" w:fill="${options.fill}"/>`);
    }
    if (options.center) {
        props.push('<w:textDirection w:val="lrTb"/>');
    }

    return `<w:tc><w:tcPr>${props.join('')}</w:tcPr>${content || '<w:p/>'}</w:tc>`;
}

function buildWordParagraphsFromText(text, options = {}) {
    const lines = String(text || '').split(/\r?\n/);
    return lines.map((line, index) => buildWordParagraph(line || ' ', {
        ...options,
        spacingAfter: index === lines.length - 1 ? options.spacingAfter : 40
    }));
}

function buildWordParagraph(text, options = {}) {
    const paragraphProps = [];
    if (options.align) {
        paragraphProps.push(`<w:jc w:val="${options.align}"/>`);
    }

    const spacing = [];
    if (options.spacingBefore !== undefined) spacing.push(`w:before="${options.spacingBefore}"`);
    if (options.spacingAfter !== undefined) spacing.push(`w:after="${options.spacingAfter}"`);
    if (spacing.length) {
        paragraphProps.push(`<w:spacing ${spacing.join(' ')}/>`);
    }

    const runProps = [];
    if (options.bold) runProps.push('<w:b/>');
    if (options.size) {
        runProps.push(`<w:sz w:val="${options.size}"/>`);
        runProps.push(`<w:szCs w:val="${options.size}"/>`);
    }
    if (options.color) {
        runProps.push(`<w:color w:val="${options.color}"/>`);
    }

    return `<w:p>${paragraphProps.length ? `<w:pPr>${paragraphProps.join('')}</w:pPr>` : ''}<w:r>${runProps.length ? `<w:rPr>${runProps.join('')}</w:rPr>` : ''}<w:t xml:space="preserve">${xmlEscape(text || '')}</w:t></w:r></w:p>`;
}

function xmlEscape(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function downloadBlob(blob, fileName) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function handlePptxDownload() {
    const activeTab = document.querySelector('.tab.active')?.getAttribute('data-tab');
    switchTab('output');

    setTimeout(async () => {
        if (!window.PptxGenJS) return;

        const filled = activities.filter(a => a.interaction && a.alp && a.details);
        if (!filled.length) {
            alert('Please generate a design map with at least one activity first.');
            if (activeTab) switchTab(activeTab);
            return;
        }

        const meta = {
            topic: document.getElementById('topic')?.value || 'Lesson Design Map',
            level: document.getElementById('level')?.value || '',
            duration: document.getElementById('duration')?.value || '',
            studentProfile: document.getElementById('studentProfile')?.value || '',
            learningOutcomes: document.getElementById('learningOutcomes')?.value || '',
            prerequisiteKnowledge: document.getElementById('prerequisiteKnowledge')?.value || '',
            learningIssues: document.getElementById('learningIssues')?.value || '',
            techIntegration: document.getElementById('techIntegration')?.value || ''
        };

        const pptx = new window.PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';
        buildEditableDesignMapSlides(pptx, filled, meta);
        await buildChartsSlide(pptx, activeTab);
        pptx.writeFile({ fileName: 'design-map-editable.pptx' });

        if (activeTab) {
            switchTab(activeTab);
        }
    }, 100);
}

function buildEditableDesignMapSlides(pptx, filledActivities, meta) {
    buildMetaSlide(pptx, meta);
    buildDesignMapSlide(pptx, filledActivities, meta);
    buildLegendSlide(pptx);
}

function buildMetaSlide(pptx, meta) {
    const slide = pptx.addSlide();
    const slideW = 13.333;
    const marginX = 0.7;
    const marginY = 0.6;

    slide.addText(meta.topic || 'Lesson Design Map', {
        x: marginX,
        y: marginY,
        w: slideW - marginX * 2,
        h: 0.5,
        fontFace: 'Georgia',
        fontSize: 26,
        bold: true,
        color: '0F172A'
    });

    const subtitleParts = [];
    if (meta.level) subtitleParts.push(`Level: ${meta.level}`);
    if (meta.duration) subtitleParts.push(`Duration: ${meta.duration} minutes`);
    slide.addText(subtitleParts.join(' | '), {
        x: marginX,
        y: marginY + 0.6,
        w: slideW - marginX * 2,
        h: 0.4,
        fontFace: 'Karla',
        fontSize: 14,
        color: '0F172A'
    });

    const metaLines = [];
    if (meta.studentProfile) metaLines.push(`Student profile: ${meta.studentProfile}`);
    if (meta.learningOutcomes) metaLines.push(`Learning outcomes: ${meta.learningOutcomes}`);
    if (meta.prerequisiteKnowledge) metaLines.push(`Prerequisite knowledge: ${meta.prerequisiteKnowledge}`);
    if (meta.techIntegration && meta.techIntegration !== 'optional') {
        metaLines.push(`Level of technology integration: ${formatTechIntegration(meta.techIntegration)}`);
    }
    if (meta.learningIssues) metaLines.push(`Learning issue to be addressed: ${meta.learningIssues}`);

    if (metaLines.length) {
        slide.addText(metaLines.join('\n'), {
            x: marginX,
            y: marginY + 1.2,
            w: slideW - marginX * 2,
            h: 5.2,
            fontFace: 'Karla',
            fontSize: 14,
            color: '334155',
            valign: 'top'
        });
    }
}

function buildDesignMapSlide(pptx, filledActivities, meta) {
    const slide = pptx.addSlide();
    const slideW = 13.333;
    const slideH = 7.5;
    const marginX = 0.05;
    const marginY = 0.35;
    const labelW = 0.7;
    const gridX = marginX + labelW;
    const gridY = marginY + 0.1;
    const gridW = slideW - marginX * 2 - labelW;
    const gridH = slideH - gridY - marginY - 0.2;
    const rows = 4;
    const cols = Math.max(1, filledActivities.length);
    const rowH = gridH / rows;
    const colW = gridW / cols;

    const socialLabels = [
        'Community\n(Student - Community)',
        'Class\n(Teacher - Student)',
        'Group\n(Student - Student)',
        'Individual\n(Student - Content)'
    ];

    for (let r = 0; r < rows; r++) {
        slide.addShape(pptx.ShapeType.rect, {
            x: gridX,
            y: gridY + r * rowH,
            w: gridW,
            h: rowH,
            fill: { color: 'FFFFFF' },
            line: { color: 'CBD5F5', width: 1 }
        });

        slide.addText(socialLabels[r], {
            x: marginX,
            y: gridY + r * rowH + 0.05,
            w: labelW - 0.1,
            h: rowH - 0.1,
            fontFace: 'Karla',
            fontSize: 5.2,
            color: '334155',
            align: 'center',
            valign: 'mid'
        });
    }

    slide.addText('Time →', {
        x: gridX + gridW / 2 - 0.4,
        y: gridY + gridH + 0.05,
        w: 0.8,
        h: 0.3,
        fontFace: 'Karla',
        fontSize: 6,
        color: '64748B',
        align: 'center'
    });

    const alpFill = {
        activate: '6ACED8',
        promote: 'CC6BFF',
        facilitate: 'FFC000',
        monitor: 'F6BBBF'
    };

    const ordered = [...filledActivities].sort((a, b) => a.id - b.id);
    ordered.forEach((act, index) => {
        const rowIndex = ['community', 'class', 'group', 'individual'].indexOf(act.interaction);
        const x = gridX + index * colW + 0.12;
        const y = gridY + rowIndex * rowH + 0.12;
        const w = colW - 0.24;
        const h = rowH - 0.24;
        const fill = alpFill[act.alp] || 'E2E8F0';

        slide.addShape(pptx.ShapeType.roundRect, {
            x,
            y,
            w,
            h,
            radius: 0.1,
            fill: { color: fill },
            line: { color: '94A3B8', width: 0.5 }
        });

        const header = act.time ? `Activity ${act.id} (${act.time} min)` : `Activity ${act.id}`;
        const keyAppLabel = formatKeyAppLabel(getKeyAppLabel(act.keyApp)).replace(/<br>/g, '\n');
        const techLine = act.tech ? `[Tool]: ${act.tech}` : '';
        const lines = [header];
        lines.push(act.details || '');
        if (techLine) lines.push(techLine);

        const fontSize = Math.max(6, Math.min(7, Math.floor(Math.min(w, h) * 4.5))) + 1;

        slide.addText(lines.join('\n'), {
            x: x + 0.08,
            y: y + 0.08,
            w: w - 0.16,
            h: h - 0.16,
            fontFace: 'Karla',
            fontSize,
            color: '0F172A',
            valign: 'top',
            autoFit: true
        });

        if (keyAppLabel) {
            const tagH = Math.max(0.28, Math.min(0.4, h * 0.28));
            const tagW = Math.max(0.6, w - 0.2);
            const tagX = x + 0.1;
            const tagY = y + h - tagH - 0.08;

            slide.addShape(pptx.ShapeType.roundRect, {
                x: tagX,
                y: tagY,
                w: tagW,
                h: tagH,
                radius: 0.05,
                fill: { color: '2F2F2F' },
                line: { color: '2F2F2F', width: 0.5 }
            });

            slide.addText(keyAppLabel, {
                x: tagX + 0.04,
                y: tagY + 0.02,
                w: tagW - 0.08,
                h: tagH - 0.04,
                fontFace: 'Karla',
                fontSize: 6.5,
                bold: true,
                color: 'FFFFFF',
                align: 'center',
                valign: 'mid',
                autoFit: true
            });
        }
    });

    // Draw arrows between activities
    if (ordered.length > 1) {
        const addLine = (x1, y1, x2, y2, withArrow) => {
            const minX = Math.min(x1, x2);
            const minY = Math.min(y1, y2);
            const w = Math.max(0.02, Math.abs(x2 - x1));
            const h = Math.max(0.02, Math.abs(y2 - y1));
            slide.addShape(pptx.ShapeType.line, {
                x: minX,
                y: minY,
                w,
                h,
                line: { color: '111111', width: 1.5, endArrowType: withArrow ? 'triangle' : undefined }
            });
        };

        ordered.forEach((act, index) => {
            if (index === ordered.length - 1) return;
            const next = ordered[index + 1];
            const rowA = ['community', 'class', 'group', 'individual'].indexOf(act.interaction);
            const rowB = ['community', 'class', 'group', 'individual'].indexOf(next.interaction);

            const ax = gridX + index * colW + 0.12;
            const ay = gridY + rowA * rowH + 0.12;
            const aw = colW - 0.24;
            const ah = rowH - 0.24;
            const bx = gridX + (index + 1) * colW + 0.12;
            const by = gridY + rowB * rowH + 0.12;
            const bh = rowH - 0.24;

            const startX = ax + aw;
            const startY = ay + ah / 2;
            const endX = bx;
            const endY = by + bh / 2;

            if (rowA === rowB) {
                addLine(startX, startY, endX, endY, true);
                return;
            }

            const midX = startX + 0.1;
            addLine(startX, startY, midX, endY, false);
            addLine(midX, endY, endX, endY, true);
        });
    }
}

function buildLegendSlide(pptx) {
    const slide = pptx.addSlide();
    const slideW = 13.333;
    const legendW = 6.2;
    const legendH = 3.6;
    const x = (slideW - legendW) / 2;
    const y = 1.6;

    slide.addText('Legend', {
        x,
        y: y - 0.6,
        w: legendW,
        h: 0.4,
        fontFace: 'Karla',
        fontSize: 20,
        bold: true,
        color: '0F172A',
        align: 'center'
    });

    slide.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w: legendW,
        h: legendH,
        fill: { color: 'FFFFFF' },
        line: { color: 'CBD5F5', width: 1 }
    });

    alpStrategies.forEach((alp, i) => {
        const itemY = y + 0.4 + i * 0.7;
        slide.addShape(pptx.ShapeType.rect, {
            x: x + 0.5,
            y: itemY,
            w: 0.35,
            h: 0.35,
            fill: { color: alp.color.replace('#', '') },
            line: { color: '94A3B8', width: 0.5 }
        });
        slide.addText(alp.label, {
            x: x + 1.0,
            y: itemY - 0.02,
            w: legendW - 1.4,
            h: 0.4,
            fontFace: 'Karla',
            fontSize: 14,
            color: '0F172A',
            valign: 'mid'
        });
    });
}

async function buildChartsSlide(pptx, activeTab) {
    if (!window.html2canvas) return;
    switchTab('charts');

    await wait(120);
    const content = document.getElementById('chartsContent');
    const target = document.getElementById('chartsDownloadRoot');
    if (!target || content?.hidden) {
        if (activeTab) switchTab(activeTab);
        return;
    }

    const cleanup = preparePieChartsForDownload(target);
    try {
        target.classList.add('exporting');
        const canvas = await html2canvas(target, {
            backgroundColor: '#ffffff',
            scale: 2,
            onclone: clonedDoc => addExportClassInClone(clonedDoc, '#chartsDownloadRoot')
        });
        const slide = pptx.addSlide();
        const dataUrl = canvas.toDataURL('image/png');
        const slideW = 13.333;
        const slideH = 7.5;
        const imgW = canvas.width / 96;
        const imgH = canvas.height / 96;
        const scaleRatio = Math.min(slideW / imgW, slideH / imgH);
        const w = imgW * scaleRatio;
        const h = imgH * scaleRatio;
        const x = (slideW - w) / 2;
        const y = (slideH - h) / 2;
        slide.addImage({ data: dataUrl, x, y, w, h });
    } finally {
        target.classList.remove('exporting');
        cleanup();
        if (activeTab) switchTab(activeTab);
    }
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
