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
        this.isProcessing = false; // Flag to prevent redundant AI calls
        
        this.I18N = {
            en: {
                phase: "PHASE", mastered: "Mastered", live_updates: "LIVE UPDATES", quick_tools: "Civic Quick Tools",
                find_booth: "Find Polling Station", fact_checker: "AI Fact-Checker", analytics: "Civic Analytics",
                comparison: "System Comparison", master_module: "MASTER MODULE", listen: "LISTEN", back: "BACK",
                simulator: "Civic Scenario Simulator", what_if: "Ask a 'What if?' about this step.", simulate: "Simulate",
                tutorial: "Official ECI Tutorial", test: "Knowledge Test", mark_mastered: "Mark Mastered",
                google_wallet: "Add to Google Wallet", verified_id: "Verified Civic ID", status: "STATUS", active: "ACTIVE",
                id_number: "ID NUMBER", constituency: "CONSTITUENCY", secure_id: "VOTEWISE AI SECURE BLOCKCHAIN ID",
                check_claims: "Verify Election Claims", claim: "CLAIM", check: "Check", health_meter: "Civic Health Meter",
                readiness: "Your level of electoral readiness", ready_to_vote: "Ready to Vote",
                ai_impact: "AI Impact Projection", estimated_turnout: "Estimated Turnout", bottleneck: "Voter Journey Bottlenecks",
                registration: "Registration", verification: "Verification", polling: "Polling Day", post_election: "Post-Election",
                dashboard: "Dashboard", checklist: "Checklist", timeline: "Timeline", glossary: "Glossary", mock_id: "Mock ID",
                ask_anything: "Ask anything about elections...", mastery: "Mastery", 
                ticker: "📢 DID YOU KNOW? Every vote counts toward democracy.",
                roadmap: "Election Roadmap", subtitle: "Your definitive path to democratic participation"
            },
            hi: {
                phase: "चरण", mastered: "पूर्ण", live_updates: "लाइव अपडेट", quick_tools: "नागरिक त्वरित उपकरण",
                find_booth: "मतदान केंद्र खोजें", fact_checker: "AI फैक्ट-चेकर", analytics: "नागरिक विश्लेषण",
                comparison: "प्रणाली तुलना", master_module: "मास्टर मॉड्यूल", listen: "सुनें", back: "वापस",
                simulator: "नागरिक परिदृश्य सिम्युलेटर", what_if: "इस चरण के बारे में 'क्या होगा अगर?' पूछें।", simulate: "सिमुलेट",
                tutorial: "आधिकारिक ECI ट्यूटोरियल", test: "ज्ञान परीक्षण", mark_mastered: "पूर्ण चिह्नित करें",
                google_wallet: "गूगल वॉलेट में जोड़ें", verified_id: "सत्यापित नागरिक आईडी", status: "स्थिति", active: "सक्रिय",
                id_number: "ID संख्या", constituency: "निर्वाचन क्षेत्र", secure_id: "VOTEWISE AI सुरक्षित ब्लॉकचेन आईडी",
                check_claims: "चुनावी दावों को सत्यापित करें", claim: "दावा", check: "जांचें", health_meter: "नागरिक स्वास्थ्य मीटर",
                readiness: "आपकी चुनावी तैयारी का स्तर", ready_to_vote: "मतदान के लिए तैयार",
                ai_impact: "AI प्रभाव प्रक्षेपण", estimated_turnout: "अनुमानित मतदान", bottleneck: "मतदाता यात्रा बाधाएं",
                registration: "पंजीकरण", verification: "सत्यापन", polling: "मतदान दिवस", post_election: "चुनाव के बाद",
                dashboard: "डैशबोर्ड", checklist: "चेकलिस्ट", timeline: "समयरेखा", glossary: "शब्दावली", mock_id: "मॉक आईडी",
                ask_anything: "चुनावों के बारे में कुछ भी पूछें...", mastery: "निपुणता",
                ticker: "📢 क्या आप जानते हैं? लोकतंत्र में हर वोट मायने रखता है।",
                roadmap: "चुनावी रोडमैप", subtitle: "लोकतांत्रिक भागीदारी का आपका निश्चित मार्ग"
            },
            mr: {
                phase: "टप्पा", mastered: "पूर्ण", live_updates: "थेट अपडेट", quick_tools: "नागरिक साधने",
                find_booth: "मतदान केंद्र शोधा", fact_checker: "AI तथ्य-तपासक", analytics: "नागरिक विश्लेषण",
                comparison: "प्रणाली तुलना", master_module: "मुख्य मॉड्यूल", listen: "ऐका", back: "मागे",
                simulator: "नागरिक सिम्युलेटर", what_if: "काही प्रश्न विचारा?", simulate: "सुरू करा",
                tutorial: "ECI ट्यूटोरियल", test: "ज्ञान चाचणी", mark_mastered: "पूर्ण करा",
                google_wallet: "वॉलेटमध्ये जोडा", verified_id: "सत्यापित आयडी", status: "स्थिती", active: "सक्रिय",
                id_number: "आयडी क्रमांक", constituency: "मतदारसंघ", secure_id: "VOTEWISE AI ब्लॉकचेन आयडी",
                check_claims: "दावे तपासा", claim: "दावा", check: "तपासा", health_meter: "आरोग्य मीटर",
                readiness: "तुमची तयारी", ready_to_vote: "मतदानासाठी तैयार",
                ai_impact: "AI प्रभाव", estimated_turnout: "अंदाज", bottleneck: "अडथळे",
                registration: "नोंदणी", verification: "सत्यापन", polling: "मतदान दिवस", post_election: "निवडणुकीनंतर",
                dashboard: "डॅशबोर्ड", checklist: "चेकलिस्ट", timeline: "टाइमलाइन", glossary: "शब्दकोश", mock_id: "मॉक आयडी",
                ask_anything: "निवडणुकीबद्दल काहीही विचारा...", mastery: "पूर्णता",
                ticker: "📢 तुम्हाला माहित आहे का? लोकशाहीत प्रत्येक मत महत्त्वाचे असते.",
                roadmap: "निवडणूक आराखडा", subtitle: "लोकशाही सहभागाचा तुमचा निश्चित मार्ग"
            },
            ta: {
                phase: "கட்டம்", mastered: "முடிந்தது", live_updates: "நேரடி செய்திகள்", quick_tools: "குடிமை கருவிகள்",
                find_booth: "வாக்குச்சாவடியைக் கண்டறியவும்", fact_checker: "AI உண்மை சரிபார்ப்பவர்", analytics: "குடிமை பகுப்பாய்வு",
                comparison: "அமைப்பு ஒப்பீடு", master_module: "முக்கிய தொகுதி", listen: "கேளுங்கள்", back: "பின்னால்",
                simulator: "குடிமை உருவகப்படுத்துதல்", what_if: "கேள்வி கேட்கவா?", simulate: "தொடங்கு",
                tutorial: "ECI பயிற்சி", test: "அறிவு சோதனை", mark_mastered: "முடிந்தது எனக் குறிக்கவும்",
                google_wallet: "கூகுள் வாலட்டில் சேர்க்கவும்", verified_id: "சரிபார்க்கப்பட்ட ஐடி", status: "நிலை", active: "செயலில்",
                id_number: "ஐடி எண்", constituency: "தொகுதி", secure_id: "VOTEWISE AI பிளாக்சెйин ஐடி",
                check_claims: "உரிமைகோரல்களைச் சரிபார்க்கவும்", claim: "உரிமைகோரல்", check: "சரிபார்க்கவும்", health_meter: "குடிமை சுகாதார மீட்டர்",
                readiness: "உங்கள் தேர்தல் தயார்நிலை", ready_to_vote: "வாக்களிக்கத் தயார்",
                ai_impact: "AI தாக்கம்", estimated_turnout: "மதிப்பீடு", bottleneck: "தடைகள்",
                registration: "பதிவு", verification: "சரிபார்ப்பு", polling: "தேர்தல் நாள்", post_election: "தேர்தலுக்குப் பின்",
                dashboard: "டாஷ்போர்டு", checklist: "சரிபார்ப்பு பட்டியல்", timeline: "காலவரிசை", glossary: "சொற்களஞ்சியம்", mock_id: "போலி ஐடி",
                ask_anything: "தேர்தல் பற்றி எதையும் கேளுండి...", mastery: "தேர்ச்சி",
                ticker: "📢 உங்களுக்குத் தெரியுமா? ஜனநாயகத்தில் ஒவ்வொரு வாக்கும் முக்கியமானது.",
                roadmap: "தேர்தல் வரைபடம்", subtitle: "ஜனநாயகப் பங்களிப்பிற்கான உங்கள் உறுதியான பாதை"
            },
            bn: {
                phase: "পর্যায়", mastered: "সম্পন্ন", live_updates: "লাইভ আপডেট", quick_tools: "নাগরিক সরঞ্জাম",
                find_booth: "ভোটকেন্দ্র খুঁজুন", fact_checker: "AI ফ্যাক্ট-চেকার", analytics: "নাগরিক বিশ্লেষণ",
                comparison: "সিস্টেম তুলনা", master_module: "মাস্টার মডিউল", listen: "শুনুন", back: "পিছনে",
                simulator: "নাগরিক সিমুলেটর", what_if: "প্রশ্ন জিজ্ঞাসা করুন?", simulate: "সিমুলেট",
                tutorial: "অফিসিয়াল ECI টিউটোরিয়াল", test: "জ্ঞান পরীক্ষা", mark_mastered: "সম্পন্ন হিসেবে চিহ্নিত করুন",
                google_wallet: "গুগল ওয়ালেটে যোগ করুন", verified_id: "যাচাইকৃত নাগরিক আইডি", status: "স্থিতি", active: "সক্রিয়",
                id_number: "আইডি নম্বর", constituency: "নির্বাচনী এলাকা", secure_id: "VOTEWISE AI ব্লকচেইন আইডি",
                check_claims: "দাবি যাচাই করুন", claim: "দাবি", check: "চেক করুন", health_meter: "নাগরিক স্বাস্থ্য मीटर",
                readiness: "আপনার নির্বাচনী প্রস্তুতির স্তর", ready_to_vote: "ভোটের জন্য প্রস্তুত",
                ai_impact: "AI প্রভাব", estimated_turnout: "অনুমান", bottleneck: "বাধা",
                registration: "নিবন্ধন", verification: "যাচাইকরণ", polling: "ভোটের দিন", post_election: "নির্বাচন পরবর্তী",
                dashboard: "ড্যাশবোর্ড", checklist: "চেকলিস্ট", timeline: "টাইমলাইন", glossary: "শব্দকোষ", mock_id: "মক আইডি",
                ask_anything: "নির্বাচন সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন...", mastery: "দক্ষতা",
                ticker: "📢 আপনি কি জানেন? গণতন্ত্রে প্রতিটি ভোট গুরুত্বপূর্ণ।",
                roadmap: "নির্বাচনী রোডম্যাপ", subtitle: "গণতান্ত্রিক অংশগ্রহণের আপনার নির্দিষ্ট পথ"
            },
            te: {
                phase: "దశ", mastered: "పూర్తయింది", live_updates: "ప్రత్యక్ష అప్‌డేట్‌లు", quick_tools: "పౌర సాధనాలు",
                find_booth: "పోలింగ్ కేంద్రాన్ని కనుగొనండి", fact_checker: "AI ఫ్యాక్ట్-చెకర్", analytics: "పౌర విశ్లేషణ",
                comparison: "వ్యవస్థ పోలిక", master_module: "మాస్టర్ మాడ్యూల్", listen: "వినండి", back: "వెనుకకు",
                simulator: "సివిక్ సినారియో సిమ్యులేటర్", what_if: "ప్రశ్న అడగండి?", simulate: "సిమ్యులేట్",
                tutorial: "అధికారిక ECI ట్యుటోరియల్", test: "జ్ఞాన పరీక్ష", mark_mastered: "పూర్తయినట్లు గుర్తించండి",
                google_wallet: "గూగుల్ వాలెట్‌కు జోడించండి", verified_id: "ధృవీకరించబడిన ఐడి", status: "స్థితి", active: "క్రియాశీలం",
                id_number: "ఐడి నంబర్", constituency: "నియోజకవర్గం", secure_id: "VOTEWISE AI బ్లాక్‌చైన్ ఐడి",
                check_claims: "క్లెయిమ్‌లను ధృవీకరించండి", claim: "క్లెయిమ్", check: "తనిఖీ చేయండి", health_meter: "పౌర ఆరోగ్య మీటర్",
                readiness: "మీ ఎన్నికల సంసిద్ధత స్థాయి", ready_to_vote: "ఓటు వేయడానికి సిద్ధం",
                ai_impact: "AI ప్రభావం", estimated_turnout: "అంచనా", bottleneck: "అడ్డంకులు",
                registration: "నమోదు", verification: "ధృవీకరణ", polling: "పోలింగ్ రోజు", post_election: "ఎన్నికల తర్వాత",
                dashboard: "డ్యాష్‌బోర్డ్", checklist: "చెక్‌లిస్ట్", timeline: "టైమ్‌లైన్", glossary: "గ్లోసరీ", mock_id: "మాక్ ఐడి",
                ask_anything: "ఎన్నికల గురించి ఏదైనా అడగండి...", mastery: "ప్రావీణ్యం",
                ticker: "📢 మీకు తెలుసా? ప్రజాస్వామ్యంలో ప్రతి ఓటు ముఖ్యమైనది.",
                roadmap: "ఎన్నికల రోడ్‌మ్యాప్", subtitle: "ప్రజాస్వామ్య భాగస్వామ్యం కోసం మీ నిశ్చయాత్మక మార్గం"
            }
        };
        
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
        this.updateNavLabels();
        await this.loadSteps();
        this.renderDashboard();
        this.updatePointsDisplay();
        this.startTickerRotation();
        this.showWelcomeMessage();
        this.bindEvents();
    }

    updateNavLabels() {
        const t = this.I18N[this.currentLanguage] || this.I18N.en;
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const mod = link.getAttribute('data-module');
            if (mod === 'dashboard') link.innerHTML = `<i class="fas fa-th-large"></i> ${t.dashboard}`;
            if (mod === 'checklist') link.innerHTML = `<i class="fas fa-clipboard-check"></i> ${t.checklist}`;
            if (mod === 'timeline') link.innerHTML = `<i class="fas fa-history"></i> ${t.timeline}`;
            if (mod === 'glossary') link.innerHTML = `<i class="fas fa-book"></i> ${t.glossary}`;
            if (mod === 'mock-id') link.innerHTML = `<i class="fas fa-id-card"></i> ${t.mock_id}`;
        });
        const userInput = document.getElementById('userInput');
        if (userInput) userInput.placeholder = t.ask_anything;
        
        const topTicker = document.getElementById('topTicker');
        if (topTicker) topTicker.innerText = t.ticker;

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && !this.currentStep) pageTitle.innerText = t.roadmap;

        const pageSubtitle = document.getElementById('pageSubtitle');
        if (pageSubtitle && !this.currentStep) pageSubtitle.innerText = t.subtitle;

        this.updatePointsDisplay();
    }

    bindEvents() {
        // Global Key Listener for Enter key on buttons/inputs
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.isProcessing) {
                    e.preventDefault();
                    return;
                }
                if (document.activeElement.id === 'scenarioInput') {
                    e.preventDefault();
                    this.simulateInModule();
                }
                if (document.activeElement.id === 'userInput') {
                    e.preventDefault();
                    this.handleChatSubmit();
                }
                if (document.activeElement.id === 'factInput') {
                    e.preventDefault();
                    this.runFactCheck();
                }
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
        const LANG_STRINGS = {
            en: { title: 'Election Roadmap', subtitle: 'Your definitive path to democratic participation' },
            hi: { title: 'चुनाव रोडमैप', subtitle: 'आपकी नागरिक यात्रा' },
            mr: { title: 'निवडणूक रोडमॅप', subtitle: 'लोकशाही सहभागाचा तुमचा मार्ग' },
            ta: { title: 'தேர்தல் வழிகாட்டி', subtitle: 'உங்கள் இனிமையான மக்களாட்சி பிரயாணம்' },
            bn: { title: 'নির্বাচন রোডম্যাপ', subtitle: 'গণতান্ত্রিক অংশগ্রহণের আপনার নির্ধিষ্ট পথ' },
            te: { title: 'ఎన్నికల రోడ్మ్యాప్', subtitle: 'ప్రజాస్వామ్య భాగస్వామ్యంలో మీ నిర్దిష్ట మార్గం' }
        };
        const t = this.I18N[this.currentLanguage] || this.I18N.en;
        const L = LANG_STRINGS[this.currentLanguage] || LANG_STRINGS.en;
        this.pageTitle.innerText = L.title;
        this.pageSubtitle.innerText = L.subtitle;
        
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
                    <h3 style="margin: 0; font-size: 1.5rem;">${t.health_meter}</h3>
                    <p style="margin: 0.5rem 0 0; opacity: 0.9; font-size: 0.9rem;">${t.readiness}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 2.5rem; font-weight: 800;">${Math.round((this.completedSteps.length / 4) * 100)}%</div>
                    <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">${t.ready_to_vote}</div>
                </div>
            </div>
        `;

        this.stepsGrid.innerHTML = healthMeter + this.steps.map((step, idx) => `
            <div class="step-card fade-in" 
                 role="button" 
                 tabindex="0" 
                 aria-label="${t.phase} ${idx + 1}: ${step.title}"
                 onclick="app.navigateToStep('${step.id}')"
                 onkeypress="if(event.key === 'Enter') app.navigateToStep('${step.id}')">
                <div class="step-badge">${t.phase} 0${idx + 1}</div>
                <div class="step-icon-box"><i class="fas ${icons[step.id] || 'fa-info-circle'}"></i></div>
                <h3 class="step-title">${step.title}</h3>
                <p class="step-desc">${step.description}</p>
                ${this.completedSteps.includes(step.id) ? `<div class="step-status"><i class="fas fa-check-circle"></i> ${t.mastered}</div>` : ''}
            </div>
        `).join('');

        // Add Live Ticker
        const ticker = `
            <div style="grid-column: 1 / -1; margin-top: 1rem; background: #fffbeb; border: 1px solid #fde68a; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; overflow: hidden;">
                <span style="background: #fbbf24; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; white-space: nowrap;">${t.live_updates}</span>
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
                <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-header); margin-bottom: 1.5rem;">${t.quick_tools}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div class="list-item" tabindex="0" aria-label="${t.find_booth}" onclick="window.open('https://www.google.com/maps/search/polling+station+near+me', '_blank')" onkeypress="if(event.key === 'Enter') window.open('https://www.google.com/maps/search/polling+station+near+me', '_blank')" style="cursor: pointer;">
                        <div style="width: 45px; height: 45px; background: #fee2e2; color: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700;">${t.find_booth}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7;">Powered by Google Maps</div>
                        </div>
                    </div>
                    <div class="list-item" tabindex="0" aria-label="${t.fact_checker}" onclick="app.showModule('factchecker')" onkeypress="if(event.key === 'Enter') app.showModule('factchecker')" style="cursor: pointer;">
                        <div style="width: 45px; height: 45px; background: #fee2e2; color: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700;">${t.fact_checker}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7;">Deepfake & Misinfo Guard</div>
                        </div>
                    </div>
                    <div class="list-item" tabindex="0" aria-label="${t.analytics}" onclick="app.showModule('analytics')" onkeypress="if(event.key === 'Enter') app.showModule('analytics')" style="cursor: pointer;">
                        <div style="width: 45px; height: 45px; background: #f3e8ff; color: #a855f7; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700;">${t.analytics}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7;">Predictive Heatmaps</div>
                        </div>
                    </div>
                    <div class="list-item" tabindex="0" aria-label="${t.comparison}" onclick="app.showModule('comparison')" onkeypress="if(event.key === 'Enter') app.showModule('comparison')" style="cursor: pointer;">
                        <div style="width: 45px; height: 45px; background: #f0fdf4; color: #22c55e; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700;">${t.comparison}</div>
                            <div style="font-size: 0.75rem; opacity: 0.7;">State vs General Elections</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.stepsGrid.insertAdjacentHTML('beforeend', quickTools);

        // Add Sample Questions for AI Checker on Dashboard
        const sampleQuestions = `
            <div style="grid-column: 1 / -1; margin-top: 3rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 24px;">
                <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text-header); margin-bottom: 1.25rem;"><i class="fas fa-shield-alt" style="color: #e11d48;"></i> Verify These Common Claims</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="list-item" onclick="app.showModule('factchecker'); setTimeout(() => app.runFactCheck('Cannot vote without Voter ID'), 100)" style="cursor: pointer; padding: 1rem; background: white; border-radius: 16px; font-size: 0.9rem; font-weight: 600;">
                        <i class="fas fa-search" style="opacity: 0.3; margin-right: 8px;"></i> Cannot vote without Voter ID
                    </div>
                    <div class="list-item" onclick="app.showModule('factchecker'); setTimeout(() => app.runFactCheck('Can I vote online?'), 100)" style="cursor: pointer; padding: 1rem; background: white; border-radius: 16px; font-size: 0.9rem; font-weight: 600;">
                        <i class="fas fa-search" style="opacity: 0.3; margin-right: 8px;"></i> Can I vote online?
                    </div>
                    <div class="list-item" onclick="app.showModule('factchecker'); setTimeout(() => app.runFactCheck('NOTA button twice'), 100)" style="cursor: pointer; padding: 1rem; background: white; border-radius: 16px; font-size: 0.9rem; font-weight: 600;">
                        <i class="fas fa-search" style="opacity: 0.3; margin-right: 8px;"></i> NOTA cancels election?
                    </div>
                    <div class="list-item" onclick="app.showModule('factchecker'); setTimeout(() => app.runFactCheck('EVM hacked using Bluetooth'), 100)" style="cursor: pointer; padding: 1rem; background: white; border-radius: 16px; font-size: 0.9rem; font-weight: 600;">
                        <i class="fas fa-search" style="opacity: 0.3; margin-right: 8px;"></i> EVM Bluetooth Hack?
                    </div>
                </div>
            </div>
        `;
        this.stepsGrid.insertAdjacentHTML('beforeend', sampleQuestions);
    }

    async navigateToStep(stepId) {
        this.currentStep = stepId;
        const step = this.steps.find(s => s.id === stepId);
        const t = this.I18N[this.currentLanguage] || this.I18N.en;
        
        if (!step) {
            console.error("Step data not found for:", stepId);
            return;
        }

        this.stepsGrid.style.display = 'none';
        
        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <span class="step-badge">${t.master_module}</span>
                        <h2 class="step-title" style="font-size: 2.2rem;">${step.title}</h2>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn-primary" style="background: #f0fdf4; color: #166534; box-shadow: none;" onclick="app.readAloud('dynamicStepData')" aria-label="${t.listen}" title="${t.listen}">
                            <i class="fas fa-volume-up"></i> ${t.listen}
                        </button>
                        <button class="btn-primary" style="background: #f1f5f9; color: var(--text-header); box-shadow: none;" onclick="app.renderDashboard()">
                            <i class="fas fa-arrow-left"></i> ${t.back}
                        </button>
                    </div>
                </div>
                
                <div id="dynamicStepData" class="markdown-content">
                    <div class="shimmer" style="height: 180px; border-radius: 20px;"></div>
                </div>

                <!-- Scenario Simulator -->
                <div class="scenario-box" style="margin-top: 2rem; background: #f0f7ff; border: 1px solid #cce3ff; border-radius: 20px; padding: 2rem;">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;"><i class="fas fa-brain"></i> ${t.simulator}</h4>
                    <p style="font-size: 0.9rem; color: var(--text-body); margin-bottom: 1.5rem;">${t.what_if}</p>
                    <div style="display: flex; gap: 0.75rem;">
                        <input type="text" id="scenarioInput" 
                               placeholder="${t.what_if}" 
                               style="flex: 1; padding: 0.8rem 1.2rem; border-radius: 14px; border: 1px solid #d1d5db; outline: none;">
                        <button class="btn-primary" onclick="app.simulateInModule()">${t.simulate}</button>
                    </div>
                    <div id="suggestedScenarios" style="margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${this.getScenariosForStep(stepId).map(s => `
                            <span class="scenario-chip" onclick="document.getElementById('scenarioInput').value='${s}'; app.simulateInModule()">${s}</span>
                        `).join('')}
                    </div>
                    <div id="scenarioResult" class="markdown-content" style="margin-top: 1.5rem; display: none; padding-top: 1.5rem; border-top: 1px dashed #cce3ff;"></div>
                </div>

                <!-- YouTube Integration -->
                <div style="margin-top: 2rem;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;"><i class="fab fa-youtube"></i> ${t.tutorial}</h4>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                        <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/QtZIlxw871I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                </div>

                <div id="quizContainer" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #f1f5f9;"></div>

                <div style="margin-top: 3.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="app.loadQuiz('${stepId}')">${t.test}</button>
                    <button class="btn-primary" style="background: var(--accent);" onclick="app.markComplete('${stepId}')">${t.mark_mastered}</button>
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

    getScenariosForStep(stepId) {
        const scenarios = {
            'registration': ["What if I missed the registration deadline?", "What if I live in a different city?"],
            'verification': ["What if the BLO does not visit?", "What if my name is misspelled on the roll?"],
            'voting': ["What if someone already voted in my name?", "What if the EVM malfunctions?"],
            'results': ["What if there is a tie?", "What if I suspect counting fraud?"]
        };
        return scenarios[stepId] || [];
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
        const t = this.I18N[this.currentLanguage] || this.I18N.en;
        this.pageTitle.innerText = t.verified_id;
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
                        <i class="fas fa-check-circle"></i> ${t.active}
                    </div>

                    <div style="text-align: left; background: white; border: 1px solid #f1f5f9; padding: 1.5rem; border-radius: 20px; font-size: 0.9rem; margin-bottom: 2.5rem; position: relative;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-body); opacity: 0.6; text-transform: uppercase;">${t.status}</div>
                                <div style="font-weight: 700; color: var(--text-header);">${t.active}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--text-body); opacity: 0.6; text-transform: uppercase;">${t.id_number}</div>
                                <div style="font-weight: 700; color: var(--text-header);">VW-2026-X8</div>
                            </div>
                            <div style="grid-column: span 2;">
                                <div style="font-size: 0.7rem; color: var(--text-body); opacity: 0.6; text-transform: uppercase;">${t.constituency}</div>
                                <div style="font-weight: 700; color: var(--text-header);">BHARAT CENTRAL - DISTRICT 09</div>
                            </div>
                        </div>
                    </div>

                    <button class="btn-primary" style="width: 100%; height: 55px; font-weight: 800; border-radius: 16px;" onclick="alert('Syncing with Google Wallet...')">
                        <i class="fab fa-google-pay" style="font-size: 1.4rem; vertical-align: middle; margin-right: 8px;"></i> ${t.google_wallet}
                    </button>
                    
                    <div style="margin-top: 1.5rem; font-size: 0.6rem; color: var(--text-body); opacity: 0.5; letter-spacing: 1px;">
                        ${t.secure_id}
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
        else if (module === 'factchecker') await this.renderFactChecker();
        else if (module === 'analytics') await this.renderAnalytics();
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
                                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                                        <button onclick="window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Election+Phase:+${encodeURIComponent(i.title)}&dates=20260425T040000Z/20260426T040000Z', '_blank')" style="border: none; background: transparent; color: #3b82f6; cursor: pointer; font-size: 0.8rem; font-weight: 700;" title="Sync to Google Calendar">
                                            <i class="far fa-calendar-plus"></i> Remind Me
                                        </button>
                                        <span style="font-size: 0.7rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: ${i.status === 'Completed' ? '#ecfdf5' : '#f1f5f9'}; color: ${i.status === 'Completed' ? '#059669' : '#64748b'};">
                                            ${i.status}
                                        </span>
                                    </div>
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
        if (this.isProcessing || !input.value) return;
        this.isProcessing = true;
        result.innerHTML = '<div class="shimmer" style="height: 60px;"></div>';
        result.style.display = 'block';
        const query = input.value;
        input.value = ''; // Clear immediately to prevent double-submit
        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, step: this.currentStep, lang: this.currentLanguage })
            });
            const data = await res.json();
            result.innerHTML = marked.parse(data.response);
        } catch (e) { result.innerHTML = "Expert brain is busy."; }
        finally { this.isProcessing = false; }
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
        if (this.isProcessing) return;
        const msg = this.userInput.value.trim();
        if (!msg) return;
        this.isProcessing = true;
        this.addChatMessage(msg, 'user');
        this.userInput.value = '';
        this.getAIResponse(msg, this.currentStep)
            .then(res => this.addChatMessage(res, 'ai'))
            .finally(() => { this.isProcessing = false; });
    }

    addChatMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `bubble ${sender}`;
        div.innerHTML = marked.parse(text);
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showWelcomeMessage() {
        const welcomeTexts = {
            en: "Hello! I am your VoteWise Guide. How can I help you today?",
            hi: "नमस्ते! मैं आपका VoteWise गाइड हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
            mr: "नमस्कार! मी तुमचा VoteWise मार्गदर्शक आहे. मी तुम्हाला कशी मदत करू शकतो?",
            ta: "வணக்கம்! நான் உங்கள் VoteWise வழிகாட்டி. நான் உங்களுக்கு எப்படி உதவ முடியும்?",
                bn: "নমস্কার! আমি আপনার VoteWise গাইড। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
            te: "నమస్కారం! నేను మీ VoteWise గైడ్. నేను మీకు ఎలా సహాయపడగలను?"
        };
        this.addChatMessage(welcomeTexts[this.currentLanguage] || welcomeTexts.en, 'ai');

        const suggestions = {
            en: ["How to register?", "Who can vote?", "Documents needed?", "Find my polling booth", "Lost my Voter ID?", "What is VVPAT?"],
            hi: ["पंजीकरण कैसे करें?", "मतदान कौन कर सकता है?", "जरूरी दस्तावेज?", "मेरा मतदान केंद्र", "वोटर ID खो गई?", "VVPAT क्या है?"],
            mr: ["नोंदणी कशी करावी?", "मतदान कोण करू शकते?", "कागदपत्रे काय हवीत?", "माझे मतदान केंद्र", "मतदार ID हरवली?", "VVPAT काय आहे?"],
            ta: ["பதிவு செய்வது எப்படி?", "யார் வாக்களிக்கலாம்?", "தேவையான ஆவணங்கள்?", "வாக்குச்சாவடி கண்டறி", "வாக்காளர் ID தொலைந்தது?", "VVPAT என்றால் என்ன?"],
            bn: ["নিবন্ধন কিভাবে করবেন?", "কে ভোট দিতে পারবেন?", "প্রয়োজনীয় নথি?", "ভোটকেন্দ্র খুঁজুন", "ভোটার ID হারিয়েছি?", "VVPAT কি?"],
            te: ["నమోదు ఎలా చేయాలి?", "ఎవరు ఓటు వేయవచ్చు?", "అవసరమైన పత్రాలు?", "నా పోలింగ్ బూత్", "ఓటరు ID పోయింది?", "VVPAT అంటే ఏమిటి?"]
        };
        const currentSuggestions = suggestions[this.currentLanguage] || suggestions.en;

        const suggDiv = document.createElement('div');
        suggDiv.style.display = 'flex';
        suggDiv.style.flexWrap = 'wrap';
        suggDiv.style.gap = '0.5rem';
        suggDiv.style.marginTop = '1rem';
        
        currentSuggestions.forEach(s => {
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

    setLanguage(lang) {
        this.currentLanguage = lang;
        sessionStorage.setItem('lang', lang);
        window.location.reload();
    }

    updateLangUI() {
        // Sync the select dropdown to the saved language on page load
        const sel = document.getElementById('langToggle');
        if (sel) sel.value = this.currentLanguage;
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

    readAloud(textId) {
        const text = document.getElementById(textId).innerText;
        const msg = new SpeechSynthesisUtterance(text);
        if(this.currentLanguage === 'hi') msg.lang = 'hi-IN';
        else msg.lang = 'en-IN';
        window.speechSynthesis.speak(msg);
    }

    async renderFactChecker() {
        const t = this.I18N[this.currentLanguage] || this.I18N.en;
        this.pageTitle.innerText = t.fact_checker;
        this.pageSubtitle.innerText = "Real-time Deepfake & Misinformation Guard";
        
        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="padding: 3rem;">
                <div style="background: #fff0f2; border: 1px solid #ffe4e6; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem;">
                    <h4 style="color: #e11d48; margin-bottom: 0.5rem;"><i class="fas fa-exclamation-triangle"></i> ${t.check_claims}</h4>
                    <p style="font-size: 0.9rem; color: #9f1239;">Enter any suspicious news, WhatsApp forward, or claim about the elections to cross-check with official ECI data.</p>
                </div>
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <input type="text" id="factInput" placeholder="e.g., 'Voting dates have changed to Sunday'" style="flex: 1; padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; font-size: 1rem; outline: none;">
                    <button class="btn-primary" onclick="app.runFactCheck()" style="background: #e11d48; border: none; padding: 0 2rem; border-radius: 16px;">
                        <i class="fas fa-search"></i> ${t.check}
                    </button>
                </div>
                
                <!-- Sample Questions Section -->
                <div style="margin-top: 1rem;">
                    <p style="font-size: 0.85rem; font-weight: 700; color: var(--text-body); margin-bottom: 0.75rem;">SAMPLE QUESTIONS TO ASK:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;" id="sampleFactQuestions">
                        <div class="chip" onclick="app.runFactCheck('NOTA button twice')" style="cursor:pointer; padding: 0.6rem 1rem; background: #f1f5f9; border-radius: 30px; font-size: 0.8rem; font-weight: 600; border: 1px solid #e2e8f0;">NOTA cancels election?</div>
                        <div class="chip" onclick="app.runFactCheck('Government employees extra votes')" style="cursor:pointer; padding: 0.6rem 1rem; background: #f1f5f9; border-radius: 30px; font-size: 0.8rem; font-weight: 600; border: 1px solid #e2e8f0;">Extra votes for staff?</div>
                        <div class="chip" onclick="app.runFactCheck('Foreigners living in India can vote')" style="cursor:pointer; padding: 0.6rem 1rem; background: #f1f5f9; border-radius: 30px; font-size: 0.8rem; font-weight: 600; border: 1px solid #e2e8f0;">Foreigners can vote?</div>
                        <div class="chip" onclick="app.runFactCheck('EVM hacked using Bluetooth')" style="cursor:pointer; padding: 0.6rem 1rem; background: #f1f5f9; border-radius: 30px; font-size: 0.8rem; font-weight: 600; border: 1px solid #e2e8f0;">EVM Bluetooth Hack?</div>
                    </div>
                </div>

                <div id="factResult" style="margin-top: 2rem; display: none;"></div>
            </div>
        `;
    }

    async runFactCheck(presetMsg) {
        if (this.isProcessing) return;
        const input = document.getElementById('factInput');
        const resDiv = document.getElementById('factResult');
        if (presetMsg) input.value = presetMsg;
        if (!input.value) return;
        
        this.isProcessing = true;
        resDiv.style.display = 'block';
        resDiv.innerHTML = `
            <div class="shimmer" style="height: 120px; border-radius: 16px;"></div>
            <p style="text-align: center; font-size: 0.85rem; color: #64748b; margin-top: 0.75rem;">🔍 Querying ECI Knowledge Base...</p>
        `;
        
        try {
            const res = await fetch('/api/factcheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input.value, lang: this.currentLanguage })
            });
            const data = await res.json();
            
            resDiv.innerHTML = `
                <div style="background: white; border-radius: 16px; border: 1px solid #eef2f6; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;">CLAIM: "${input.value}"</div>
                    <div class="markdown-content">${marked.parse(data.response || 'Unable to verify.')}</div>
                </div>
            `;
            input.value = ''; // Clear after success
        } catch (e) {
            resDiv.innerHTML = `
                <div style="background: #fff0f2; border-radius: 16px; padding: 1.5rem; border: 1px solid #ffe4e6;">
                    ⚠️ Fact-check offline. Please verify at <a href="https://eci.gov.in" target="_blank" style="color: var(--primary);">eci.gov.in</a>
                </div>
            `;
        } finally {
            this.isProcessing = false;
        }
    }

    async renderAnalytics() {
        const t = this.I18N[this.currentLanguage] || this.I18N.en;
        this.pageTitle.innerText = "Civic Analytics Dashboard";
        this.pageSubtitle.innerText = "Predictive Insights & Bottleneck Heatmaps";
        
        this.moduleContent.innerHTML = `
            <div class="glass-container fade-in" style="padding: 2.5rem;">
                <div style="background: var(--primary-gradient); padding: 2rem; border-radius: 20px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">${t.ai_impact}</div>
                        <h3 style="font-size: 2rem; margin: 0.5rem 0 0;">+14.2% ${t.estimated_turnout}</h3>
                        <p style="margin: 0.5rem 0 0; opacity: 0.8;">Based on 10,000 simulated regional deployments</p>
                    </div>
                    <div style="font-size: 3rem; opacity: 0.8;"><i class="fas fa-chart-line"></i></div>
                </div>

                <h4 style="color: var(--text-header); margin-bottom: 1rem;">${t.bottleneck} (Heatmap)</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                    <div style="background: #fee2e2; padding: 1.5rem; border-radius: 16px; border: 1px solid #fecaca; text-align: center;">
                        <div style="color: #ef4444; font-size: 1.5rem; font-weight: 800;">42%</div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #991b1b; margin-top: 0.5rem;">${t.registration}</div>
                        <div style="font-size: 0.65rem; color: #b91c1c; margin-top: 0.25rem;">High friction area</div>
                    </div>
                    <div style="background: #fef9c3; padding: 1.5rem; border-radius: 16px; border: 1px solid #fef08a; text-align: center;">
                        <div style="color: #eab308; font-size: 1.5rem; font-weight: 800;">28%</div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #854d0e; margin-top: 0.5rem;">${t.verification}</div>
                    </div>
                    <div style="background: #ecfdf5; padding: 1.5rem; border-radius: 16px; border: 1px solid #a7f3d0; text-align: center;">
                        <div style="color: #10b981; font-size: 1.5rem; font-weight: 800;">12%</div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #065f46; margin-top: 0.5rem;">${t.polling}</div>
                    </div>
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                        <div style="color: #64748b; font-size: 1.5rem; font-weight: 800;">18%</div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #334155; margin-top: 0.5rem;">${t.post_election}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.app = new VoteWiseApp();
