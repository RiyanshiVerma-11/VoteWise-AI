/**
 * VoteWise AI - L6 'Zero-Regression' Production Core
 * Restored: Google Wallet Mock ID, Full Quiz Engine, Scenario Enter-Key
 */

class VoteWiseApp {
    constructor() {
        this.currentStep = null;
        this.currentLanguage = sessionStorage.getItem('lang') || 'en'; 
        this.voiceEnabled = false;
        this.steps = [];
        this.completedSteps = JSON.parse(sessionStorage.getItem('completedSteps')) || [];
        this.civicPoints = parseInt(localStorage.getItem('civicPoints')) || 0;
        
        // UI Bindings
        this.chatPanel = document.getElementById('chatPanel');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.stepsGrid = document.getElementById('stepsGrid');
        this.moduleContent = document.getElementById('moduleContent');
        this.pageTitle = document.getElementById('pageTitle');
        this.pageSubtitle = document.getElementById('pageSubtitle');
        this.langToggle = document.getElementById('langToggle');

        this.init();
    }

    async init() {
        this.updateLangUI();
        await this.loadSteps();
        this.renderDashboard();
        this.updatePointsDisplay();
        this.startTickerRotation();
        this.showWelcomeMessage();
        this.bindEvents();
    }

    bindEvents() {
        // Global Key Listener for Enter key on buttons/inputs
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (document.activeElement.id === 'scenarioInput') this.simulateInModule();
                if (document.activeElement.id === 'userInput') this.handleChatSubmit();
                if (document.activeElement.classList.contains('nav-link')) {
                    const module = document.activeElement.getAttribute('data-module');
                    if (module) this.showModule(module);
                }
            }
        });

        // Chatbot Close and Trigger are now natively handled by inline HTML onclick attributes
        // to prevent race conditions during module initialization.

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            const aiTrigger = document.querySelector('.ai-trigger');
            if (this.chatPanel && this.chatPanel.classList.contains('open') && 
                !this.chatPanel.contains(e.target) && (!aiTrigger || !aiTrigger.contains(e.target))) {
                this.toggleChat();
            }
        });
    }

    async loadSteps() {
        try {
            const res = await fetch(`/api/steps?lang=${this.currentLanguage}`);
            this.steps = await res.json();
        } catch (e) { console.error("Data Fetch Failure", e); }
    }

    updatePointsDisplay() {
        const pDisplay = document.getElementById('userPoints');
        const progress = Math.round((this.completedSteps.length / 4) * 100);
        if (pDisplay) pDisplay.innerHTML = `${this.civicPoints} Pts | ${progress}% Mastery`;
    }

    renderDashboard() {
        this.pageTitle.innerText = this.currentLanguage === 'hi' ? "चुनाव रोडमैप" : "Election Roadmap";
        this.pageSubtitle.innerText = this.currentLanguage === 'hi' ? "आपकी नागरिक यात्रा" : "Your definitive path to democratic participation";
        
        this.moduleContent.innerHTML = '';
        this.stepsGrid.style.display = 'grid';
        this.updateNavLinks('dashboard');
        
        const icons = {
            "registration": "fa-user-plus",
            "verification": "fa-shield-alt",
            "voting": "fa-vote-yea",
            "results": "fa-chart-pie"
        };

        // Civic Health Meter
        const healthMeter = `
            <div style="grid-column: 1 / -1; background: var(--primary-gradient); color: white; padding: 2rem; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h3 style="margin: 0; font-size: 1.5rem;">${this.currentLanguage === 'hi' ? 'नागरिक स्वास्थ्य मीटर' : 'Civic Health Meter'}</h3>
                    <p style="margin: 0.5rem 0 0; opacity: 0.9; font-size: 0.9rem;">${this.currentLanguage === 'hi' ? 'आपकी चुनावी तैयारी का स्तर' : 'Your level of electoral readiness'}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 2.5rem; font-weight: 800;">${Math.round((this.completedSteps.length / 4) * 100)}%</div>
                    <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Ready to Vote</div>
                </div>
            </div>
        `;

        this.stepsGrid.innerHTML = healthMeter + this.steps.map((step, idx) => `
            <div class="step-card fade-in" 
                 role="button" 
                 tabindex="0" 
                 aria-label="Phase ${idx + 1}: ${step.title}"
                 onclick="app.navigateToStep('${step.id}')"
                 onkeypress="if(event.key === 'Enter') app.navigateToStep('${step.id}')">
                <div class="step-badge">PHASE 0${idx + 1}</div>
                <div class="step-icon-box"><i class="fas ${icons[step.id] || 'fa-info-circle'}"></i></div>
                <h3 class="step-title">${step.title}</h3>
                <p class="step-desc">${step.description}</p>
                ${this.completedSteps.includes(step.id) ? '<div class="step-status"><i class="fas fa-check-circle"></i> Mastered</div>' : ''}
            </div>
        `).join('');

        // Add Live Ticker
        const ticker = `
            <div style="grid-column: 1 / -1; margin-top: 1rem; background: #fffbeb; border: 1px solid #fde68a; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; overflow: hidden;">
                <span style="background: #fbbf24; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; white-space: nowrap;">LIVE UPDATES</span>
                <marquee style="font-size: 0.9rem; color: #92400e; font-weight: 500;">
                    ${this.currentLanguage === 'hi' ? 
                        "चुनाव आयोग ने नए पंजीकरण की तारीख बढ़ाई... अपने नजदीकी बूथ की जानकारी के लिए 'खोज' टूल का उपयोग करें... 18 वर्ष से अधिक आयु के सभी नागरिक पंजीकरण के पात्र हैं।" : 
                        "ECI extends registration deadline for Phase 1... Use the 'Find Booth' tool for local station info... All citizens above 18 are eligible to register."}
                </marquee>
            </div>
        `;
        this.stepsGrid.insertAdjacentHTML('afterbegin', ticker);

        // Add Quick Tools Section
        const quickTools = `
            <div style="grid-column: 1 / -1; margin-top: 3rem;">
                <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-header); margin-bottom: 1.5rem;">Civic Quick Tools</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div class="list-item" tabindex="0" onclick="window.open('https://www.google.com/maps/search/polling+station+near+me', '_blank')" onkeypress="if(event.key === 'Enter') window.open('https://www.google.com/maps/search/polling+station+near+me', '_blank')" style="cursor: pointer;">
                        <div style="width: 45px; height: 45px; background: #fee2e2; color: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700;">Find Polling Station</div>
                            <div style="font-size: 0.75rem; opacity: 0.7;">Powered by Google Maps</div>
                        </div>
                    </div>
                    <div class="list-item" tabindex="0" onclick="app.showModule('comparison')" onkeypress="if(event.key === 'Enter') app.showModule('comparison')" style="cursor: pointer;">
                        <div style="width: 45px; height: 45px; background: #f0fdf4; color: #22c55e; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700;">System Comparison</div>
                            <div style="font-size: 0.75rem; opacity: 0.7;">State vs General Elections</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.stepsGrid.insertAdjacentHTML('beforeend', quickTools);
    }

    async navigateToStep(stepId) {
        this.currentStep = stepId;
        const step = this.steps.find(s => s.id === stepId);
        
        if (!step) {
            console.error("Step data not found for:", stepId);
            alert("Error loading step data. Please refresh the page.");
            return;
        }

        this.stepsGrid.style.display = 'none';
        
        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <span class="step-badge">MASTER MODULE</span>
                        <h2 class="step-title" style="font-size: 2.2rem;">${step.title}</h2>
                    </div>
                    <button class="btn-primary" style="background: #f1f5f9; color: var(--text-header); box-shadow: none;" onclick="app.renderDashboard()">
                        <i class="fas fa-arrow-left"></i> BACK
                    </button>
                </div>
                
                <div id="dynamicStepData" class="markdown-content">
                    <div class="shimmer" style="height: 180px; border-radius: 20px;"></div>
                </div>

                <!-- Scenario Simulator -->
                <div class="scenario-box" style="margin-top: 2rem; background: #f0f7ff; border: 1px solid #cce3ff; border-radius: 20px; padding: 2rem;">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;"><i class="fas fa-brain"></i> Civic Scenario Simulator</h4>
                    <p style="font-size: 0.9rem; color: var(--text-body); margin-bottom: 1.5rem;">Ask a "What if?" about this step.</p>
                    <div style="display: flex; gap: 0.75rem;">
                        <input type="text" id="scenarioInput" 
                               placeholder="What if I lost my ID?" 
                               style="flex: 1; padding: 0.8rem 1.2rem; border-radius: 14px; border: 1px solid #d1d5db; outline: none;"
                               onkeydown="if(event.key === 'Enter') app.simulateInModule()">
                        <button class="btn-primary" onclick="app.simulateInModule()">Simulate</button>
                    </div>
                    <div id="scenarioResult" class="markdown-content" style="margin-top: 1.5rem; display: none; padding-top: 1.5rem; border-top: 1px dashed #cce3ff;"></div>
                </div>

                <div id="quizContainer" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #f1f5f9;"></div>

                <div style="margin-top: 3.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="app.loadQuiz('${stepId}')">Knowledge Test</button>
                    <button class="btn-primary" style="background: var(--accent);" onclick="app.markComplete('${stepId}')">Mark Mastered</button>
                </div>
            </div>
        `;

        const intro = await this.getAIResponse(`Explain ${step.title}`, stepId);
        document.getElementById('dynamicStepData').innerHTML = marked.parse(intro);
    }

    async loadQuiz(stepId) {
        const container = document.getElementById('quizContainer');
        container.style.display = 'block';
        container.innerHTML = '<div class="shimmer" style="height: 120px; border-radius: 20px;"></div>';
        try {
            const res = await fetch(`/api/quiz/${stepId}?lang=${this.currentLanguage}`);
            const questions = await res.json();
            container.innerHTML = questions.map((q, idx) => `
                <div class="fade-in" style="margin-bottom: 2rem; background: #f8fafc; padding: 2rem; border-radius: 24px; border: 1px solid #eef2f6;" id="q-${idx}">
                    <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 1.5rem;">${q.question}</p>
                    <div style="display: grid; gap: 0.75rem;">
                        ${q.options.map((opt, oIdx) => `<button class="quiz-opt" onclick="app.checkAnswer(${idx}, ${oIdx}, ${q.correct_answer}, '${q.explanation.replace(/'/g, "\\'")}')">${opt}</button>`).join('')}
                    </div>
                    <div id="feedback-${idx}" style="margin-top: 1rem; display: none;"></div>
                </div>
            `).join('');
            container.scrollIntoView({ behavior: 'smooth' });
        } catch (e) { container.innerHTML = 'Error loading quiz.'; }
    }

    checkAnswer(qIdx, selectedIdx, correctIdx, explanation) {
        const feedback = document.getElementById(`feedback-${qIdx}`);
        const buttons = document.querySelectorAll(`#q-${qIdx} .quiz-opt`);
        buttons.forEach(btn => btn.disabled = true);
        if (selectedIdx === correctIdx) {
            feedback.innerHTML = `<span style="color: var(--accent); font-weight: 700;">✓ Correct! +10 Pts</span><p>${explanation}</p>`;
            this.addPoints(10);
        } else {
            feedback.innerHTML = `<span style="color: var(--danger); font-weight: 700;">✗ Incorrect</span><p>${explanation}</p>`;
        }
        feedback.style.display = 'block';
    }

    renderMockID() {
        this.pageTitle.innerText = "Verified Civic ID";
        const user = JSON.parse(sessionStorage.getItem('user')) || { name: 'Voter' };
        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'V';
        const displayName = user.name || 'Voter';

        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="display: flex; flex-direction: column; align-items: center; padding: 4rem;">
                <!-- High-Fidelity Plastic Card Design -->
                <div style="width: 380px; height: 550px; background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%); border-radius: 32px; box-shadow: 0 40px 80px rgba(0,0,0,0.12); border: 1px solid #e2e8f0; position: relative; overflow: hidden; padding: 2.5rem; text-align: center;">
                    <!-- Holographic Accent -->
                    <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-radius: 50%; filter: blur(40px);"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                        <div style="width: 50px; height: 40px; background: #e2e8f0; border-radius: 8px; position: relative;">
                            <div style="position: absolute; top: 10px; left: 10px; width: 30px; height: 20px; border: 1px solid #94a3b8; border-radius: 4px;"></div>
                            <small style="position: absolute; bottom: 2px; right: 4px; font-size: 0.5rem; opacity: 0.5;">CHIP</small>
                        </div>
                        <div style="font-weight: 900; color: var(--primary); font-size: 1.2rem;">V</div>
                    </div>

                    <div style="width: 120px; height: 120px; background: var(--primary-gradient); border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 3.5rem; font-weight: 800; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);">
                        ${initial}
                    </div>

                    <h2 style="font-size: 2rem; font-weight: 800; color: var(--text-header); margin-bottom: 0.25rem;">${displayName}</h2>
                    <div style="display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 16px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-bottom: 2.5rem;">
                        <i class="fas fa-check-circle"></i> VERIFIED CITIZEN
                    </div>

                    <div style="text-align: left; background: white; border: 1px solid #f1f5f9; padding: 1.5rem; border-radius: 20px; font-size: 0.9rem; margin-bottom: 2.5rem; position: relative;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-body); opacity: 0.6; text-transform: uppercase;">Status</div>
                                <div style="font-weight: 700; color: var(--text-header);">ACTIVE</div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-body); opacity: 0.6; text-transform: uppercase;">ID Number</div>
                                <div style="font-weight: 700; color: var(--text-header);">VW-2026-X8</div>
                            </div>
                            <div style="grid-column: span 2;">
                                <div style="font-size: 0.7rem; color: var(--text-body); opacity: 0.6; text-transform: uppercase;">Constituency</div>
                                <div style="font-weight: 700; color: var(--text-header);">BHARAT CENTRAL - DISTRICT 09</div>
                            </div>
                        </div>
                    </div>

                    <button class="btn-primary" style="width: 100%; height: 55px; font-weight: 800; border-radius: 16px;" onclick="alert('Syncing with Google Wallet...')">
                        <i class="fab fa-google-pay" style="font-size: 1.4rem; vertical-align: middle; margin-right: 8px;"></i> Add to Google Wallet
                    </button>
                    
                    <div style="margin-top: 1.5rem; font-size: 0.6rem; color: var(--text-body); opacity: 0.5; letter-spacing: 1px;">
                        VOTEWISE AI SECURE BLOCKCHAIN ID
                    </div>
                </div>
            </div>`;
    }

    async showModule(module) {
        this.updateNavLinks(module);
        this.stepsGrid.style.display = 'none';
        if (module === 'checklist') await this.renderChecklist();
        else if (module === 'timeline') await this.renderTimeline();
        else if (module === 'mock-id') this.renderMockID();
        else if (module === 'glossary') await this.renderGlossary();
        else if (module === 'comparison') await this.renderComparison();
        else this.renderDashboard();
    }

    async renderComparison() {
        this.pageTitle.innerText = this.currentLanguage === 'hi' ? "प्रणाली तुलना" : "System Comparison";
        this.pageSubtitle.innerText = this.currentLanguage === 'hi' ? "लोकसभा बनाम विधानसभा" : "General Elections vs State Assembly";
        
        const headers = this.currentLanguage === 'hi' ? ["विशेषता", "लोकसभा (General)", "विधानसभा (State)"] : ["Feature", "General (Lok Sabha)", "State (Vidhan Sabha)"];
        const rows = this.currentLanguage === 'hi' ? [
            ["स्तर", "राष्ट्रीय", "राज्य"],
            ["नेता", "प्रधान मंत्री (PM)", "मुख्य मंत्री (CM)"],
            ["कार्यकाल", "5 वर्ष", "5 वर्ष"],
            ["मतदाता", "सभी भारतीय नागरिक", "राज्य के नागरिक"]
        ] : [
            ["Level", "National", "State"],
            ["Leader", "Prime Minister (PM)", "Chief Minister (CM)"],
            ["Term", "5 Years", "5 Years"],
            ["Voting Body", "All Indian Citizens", "Citizens of the State"]
        ];

        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="overflow-x: auto; background: var(--glass-bg); backdrop-filter: var(--glass-blur);">
                <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(0,0,0,0.05); text-align: left;">
                            ${headers.map(h => `<th style="padding: 1.25rem;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                <td style="padding: 1.25rem; font-weight: 700; color: var(--primary);">${row[0]}</td>
                                <td style="padding: 1.25rem;">${row[1]}</td>
                                <td style="padding: 1.25rem;">${row[2]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }


    async renderGlossary() {
        this.pageTitle.innerText = this.currentLanguage === 'hi' ? "नागरिक शब्दावली" : "Civic Glossary";
        this.pageSubtitle.innerText = this.currentLanguage === 'hi' ? "महत्वपूर्ण चुनावी शब्द और उनके अर्थ" : "Essential election terms and their meanings";
        
        const terms = this.currentLanguage === 'hi' ? [
            { t: "EPIC", d: "मतदाता फोटो पहचान पत्र - आपका आधिकारिक मतदाता पहचान पत्र।" },
            { t: "EVM", d: "इलेक्ट्रॉनिक वोटिंग मशीन - जिसका उपयोग वोट रिकॉर्ड करने के लिए किया जाता है।" },
            { t: "VVPAT", d: "वोटर वेरिफिएबल पेपर ऑडिट ट्रेल - आपके वोट को सत्यापित करने के लिए एक भौतिक पर्ची।" },
            { t: "BLO", d: "बूथ स्तर के अधिकारी - जमीनी सत्यापन के लिए स्थानीय चुनाव आयोग प्रतिनिधि।" },
            { t: "आचार संहिता", d: "चुनाव के दौरान उम्मीदवारों और दलों के लिए दिशानिर्देश।" },
            { t: "निर्वाचन क्षेत्र", d: "एक विशिष्ट क्षेत्र जिसका प्रतिनिधित्व एक निर्वाचित अधिकारी द्वारा किया जाता है।" }
        ] : [
            { t: "EPIC", d: "Electors Photo Identity Card - Your official voter ID." },
            { t: "EVM", d: "Electronic Voting Machine used to record votes." },
            { t: "VVPAT", d: "Voter Verifiable Paper Audit Trail - A physical slip to verify your vote." },
            { t: "BLO", d: "Booth Level Officer - Local ECI representative for field verification." },
            { t: "Model Code of Conduct", d: "Guidelines for candidates and parties during elections." },
            { t: "Constituency", d: "A specific area represented by an elected official." }
        ];

        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="padding: 3.5rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
                    ${terms.map(item => `
                        <div class="glass-card list-item" tabindex="0" style="flex-direction: column; align-items: flex-start; gap: 0.75rem; padding: 2rem; border-color: rgba(255,255,255,0.5);">
                            <div style="font-weight: 800; color: var(--primary); font-size: 1.2rem; letter-spacing: -0.5px;">${item.t}</div>
                            <div style="font-size: 0.95rem; opacity: 0.85; font-weight: 400; line-height: 1.6;">${item.d}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }



    updateNavLinks(activeId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const oc = link.getAttribute('onclick') || "";
            if (oc.includes(activeId)) link.classList.add('active');
        });
    }

    async renderChecklist() {
        this.pageTitle.innerText = this.currentLanguage === 'hi' ? "विशेषज्ञ चेकलिस्ट" : "Expert Checklist";
        this.pageSubtitle.innerText = this.currentLanguage === 'hi' ? "पंजीकरण के लिए आवश्यक दस्तावेज" : "Essential documents required for your registration";
        
        const res = await fetch(`/api/checklist?lang=${this.currentLanguage}`);
        const items = await res.json();
        
        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="padding: 3rem;">
                <div style="display: grid; gap: 1.5rem;">
                    ${items.map((item, idx) => `
                        <div class="list-item" tabindex="0" onclick="this.classList.toggle('checked'); const i = this.querySelector('.check-icon'); if(this.classList.contains('checked')){ i.className='fas fa-check-circle check-icon'; i.style.color='#10b981'; } else { i.className='far fa-circle check-icon'; i.style.color='#cbd5e1'; }" style="display: flex; gap: 1.5rem; padding: 1.5rem; background: white; border-radius: 20px; border: 1px solid #eef2f6; transition: all 0.3s ease; cursor: pointer;">
                            <div style="width: 50px; height: 50px; background: #f0f7ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.2rem; flex-shrink: 0;">
                                <i class="fas ${item.icon}"></i>
                            </div>
                            <div>
                                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-header); margin-bottom: 0.25rem;">${item.title}</h4>
                                <p style="font-size: 0.9rem; color: var(--text-body); opacity: 0.8; line-height: 1.5;">${item.description}</p>
                            </div>
                            <div style="margin-left: auto; align-self: center;">
                                <i class="far fa-circle check-icon" style="color: #cbd5e1; font-size: 1.2rem; transition: all 0.2s;"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async renderTimeline() {
        this.pageTitle.innerText = this.currentLanguage === 'hi' ? "घटना समयरेखा" : "Event Timeline";
        this.pageSubtitle.innerText = this.currentLanguage === 'hi' ? "चुनावी प्रक्रिया के महत्वपूर्ण चरण" : "Critical milestones in the electoral journey";

        const res = await fetch(`/api/timeline?lang=${this.currentLanguage}`);
        const data = await res.json();
        
        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="padding: 3rem;">
                <div class="timeline-stepper" style="position: relative; padding-left: 2rem;">
                    <div style="position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: #e2e8f0;"></div>
                    ${data.map((i, idx) => `
                        <div class="timeline-node" tabindex="0" style="position: relative; margin-bottom: 3rem;">
                            <div style="position: absolute; left: -31px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: ${i.status === 'Completed' ? '#10b981' : (i.status === 'In Progress' ? 'var(--primary)' : '#e2e8f0')}; border: 4px solid white; box-shadow: 0 0 0 2px ${i.status === 'Completed' ? '#10b981' : (i.status === 'In Progress' ? 'var(--primary)' : '#e2e8f0')}; z-index: 2;"></div>
                            <div style="background: white; padding: 2rem; border-radius: 24px; border: 1px solid #eef2f6; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">${i.phase}</span>
                                    <span style="font-size: 0.7rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: ${i.status === 'Completed' ? '#ecfdf5' : '#f1f5f9'}; color: ${i.status === 'Completed' ? '#059669' : '#64748b'};">
                                        ${i.status}
                                    </span>
                                </div>
                                <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--text-header); margin-bottom: 0.5rem;">${i.title}</h4>
                                <p style="font-size: 0.95rem; color: var(--text-body); line-height: 1.6; opacity: 0.8;">${i.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async simulateInModule() {
        const input = document.getElementById('scenarioInput');
        const result = document.getElementById('scenarioResult');
        if (!input.value) return;
        result.innerHTML = '<div class="shimmer" style="height: 60px;"></div>';
        result.style.display = 'block';
        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input.value, step: this.currentStep, lang: this.currentLanguage })
            });
            const data = await res.json();
            result.innerHTML = marked.parse(data.response);
        } catch (e) { result.innerHTML = "Expert brain is busy."; }
        input.value = '';
    }

    async getAIResponse(message, step) {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, step, lang: this.currentLanguage })
            });
            const data = await res.json();
            return data.response || data.detail || "I'm sorry, the Guide is currently unavailable.";
        } catch (e) { return "Guide offline."; }
    }

    toggleChat() { 
        if (!this.chatPanel) {
            this.chatPanel = document.getElementById('chatPanel');
            console.log("Re-binding chat panel:", this.chatPanel);
        }
        if (this.chatPanel) {
            this.chatPanel.classList.toggle('open');
            console.log("Chat panel toggled. State:", this.chatPanel.classList.contains('open'));
        } else {
            console.error("Chat panel not found in DOM!");
        }
    }

    handleChatSubmit() {
        const msg = this.userInput.value.trim();
        if (!msg) return;
        this.addChatMessage(msg, 'user');
        this.userInput.value = '';
        this.getAIResponse(msg, this.currentStep).then(res => this.addChatMessage(res, 'ai'));
    }

    addChatMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `bubble ${sender}`;
        div.innerHTML = marked.parse(text);
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showWelcomeMessage() {
        const welcomeText = this.currentLanguage === 'hi' 
            ? "नमस्ते! मैं आपका VoteWise गाइड हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" 
            : "Hello! I am your VoteWise Guide. How can I help you today?";
        this.addChatMessage(welcomeText, 'ai');

        const suggestions = this.currentLanguage === 'hi' ? [
            "पंजीकरण कैसे करें?", "मतदान कौन कर सकता है?", "पंजीकरण के लिए दस्तावेज?",
            "मेरा मतदान केंद्र कहां है?", "अगर मेरा वोटर आईडी खो गया है?", "VVPAT क्या है?"
        ] : [
            "How to register?", "Who can vote?", "Documents for registration?",
            "Where is my polling booth?", "What if I lost my Voter ID?", "What is VVPAT?"
        ];

        const suggDiv = document.createElement('div');
        suggDiv.style.display = 'flex';
        suggDiv.style.flexWrap = 'wrap';
        suggDiv.style.gap = '0.5rem';
        suggDiv.style.marginTop = '1rem';
        
        suggestions.forEach(s => {
            const btn = document.createElement('button');
            btn.innerText = s;
            btn.style.padding = '0.5rem 1rem';
            btn.style.borderRadius = '20px';
            btn.style.border = '1px solid var(--primary)';
            btn.style.background = 'white';
            btn.style.color = 'var(--primary)';
            btn.style.fontSize = '0.8rem';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                this.userInput.value = s;
                this.handleChatSubmit();
            };
            suggDiv.appendChild(btn);
        });
        
        this.chatMessages.appendChild(suggDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addPoints(pts) { this.civicPoints += pts; localStorage.setItem('civicPoints', this.civicPoints); this.updatePointsDisplay(); }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
        sessionStorage.setItem('lang', this.currentLanguage);
        window.location.reload();
    }

    updateLangUI() {
        const l = this.currentLanguage === 'hi' ? "हिंदी / English" : "English / Hindi";
        if (this.langToggle) this.langToggle.innerHTML = `<i class="fas fa-language"></i> ${l}`;
    }

    startTickerRotation() {
        const facts = ["Every vote counts.", "World's largest democracy."];
        let idx = 0;
        setInterval(() => {
            const t = document.querySelector('.ticker-content');
            if (t) {
                t.classList.add('slide-out');
                setTimeout(() => {
                    t.innerText = `📢 ${facts[idx]}`;
                    t.classList.remove('slide-out');
                    t.classList.add('slide-in');
                    setTimeout(() => t.classList.remove('slide-in'), 50);
                    idx = (idx + 1) % facts.length;
                }, 600);
            }
        }, 5000);
    }

    markComplete(stepId) {
        if (!this.completedSteps.includes(stepId)) {
            this.completedSteps.push(stepId);
            sessionStorage.setItem('completedSteps', JSON.stringify(this.completedSteps));
        }
        this.renderDashboard();
    }
}

window.app = new VoteWiseApp();
