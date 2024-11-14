const owner = 'YOUR_GITHUB_USERNAME';
const repo = 'YOUR_REPO_NAME';
const path = 'code_examples';

let codeExamples = [];
let currentTag = 'すべて';

async function fetchCodeExamples() {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
        const data = await response.json();
        
        for (const file of data) {
            if (file.type === 'file' && file.name.endsWith('.json')) {
                const contentResponse = await fetch(file.download_url);
                const content = await contentResponse.json();
                codeExamples.push(content);
            }
        }
        
        createTagTabs();
        renderCodeExamples();
    } catch (error) {
        console.error('Error fetching code examples:', error);
    }
}

function createTagTabs() {
    const tagTabsContainer = document.getElementById('tag-tabs');
    const tags = ['すべて', ...new Set(codeExamples.map(example => example.tag))];
    
    tags.forEach(tag => {
        const button = document.createElement('button');
        button.textContent = tag;
        button.className = 'tag-tab';
        button.dataset.tag = tag;
        button.addEventListener('click', () => {
            currentTag = tag;
            updateTagTabs();
            renderCodeExamples();
        });
        tagTabsContainer.appendChild(button);
    });
    
    updateTagTabs();
}

function updateTagTabs() {
    document.querySelectorAll('.tag-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tag === currentTag);
    });
}

function createCodeExample(example) {
    const container = document.createElement('div');
    container.className = 'code-example';

    container.innerHTML = `
        <h3>${example.title}</h3>
        <p>${example.description}</p>
        <div class="tabs">
            <button class="tab active" data-tab="preview">プレビュー</button>
            <button class="tab" data-tab="html">HTML</button>
            <button class="tab" data-tab="css">CSS</button>
        </div>
        <div class="tab-content active" data-tab="preview">
            ${example.html}
            <style>${example.css}</style>
        </div>
        <div class="tab-content" data-tab="html">
            <pre><code class="language-html">${escapeHtml(example.html)}</code></pre>
            <button class="copy-button" data-code="html">コピー</button>
        </div>
        <div class="tab-content" data-tab="css">
            <pre><code class="language-css">${example.css}</code></pre>
            <button class="copy-button" data-code="css">コピー</button>
        </div>
    `;

    container.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            container.querySelector(`.tab-content[data-tab="${tab.dataset.tab}"]`).classList.add('active');
        });
    });

    container.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const code = example[button.dataset.code];
            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'コピーしました';
                setTimeout(() => {
                    button.textContent = 'コピー';
                }, 2000);
            });
        });
    });

    return container;
}

function renderCodeExamples() {
    const codeExamplesContainer = document.getElementById('code-examples');
    codeExamplesContainer.innerHTML = '';
    codeExamples
        .filter(example => currentTag === 'すべて' || example.tag === currentTag)
        .forEach(example => {
            codeExamplesContainer.appendChild(createCodeExample(example));
        });
    Prism.highlightAll();
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', fetchCodeExamples);