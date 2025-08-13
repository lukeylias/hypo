// AB Test Setup Guide JavaScript
class ABTestGuide {
    constructor() {
        this.currentStep = 1;
        this.maxStep = 8;
        this.formData = {
            problem: '',
            solution: '',
            hypothesis: '',
            longTermMetric: '',
            proxyMetric: '',
            changeImpact: '',
            mdaCalculation: '',
            timeline: ''
        };
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.initializeIcons();
        this.setupEventListeners();
        this.updateStepVisibility();
        this.validateCurrentStep();
    }

    initializeIcons() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    setupEventListeners() {
        // Form field event listeners
        document.getElementById('problem').addEventListener('input', () => this.handleInput('problem'));
        document.getElementById('solution').addEventListener('input', () => this.handleInput('solution'));
        document.getElementById('hypothesis').addEventListener('input', () => this.handleInput('hypothesis'));
        document.getElementById('longTermMetric').addEventListener('change', () => this.handleInput('longTermMetric'));
        document.getElementById('proxyMetric').addEventListener('change', () => this.handleInput('proxyMetric'));
        document.getElementById('mdaCalculation').addEventListener('input', () => this.handleInput('mdaCalculation'));
        document.getElementById('timeline').addEventListener('input', () => this.handleInput('timeline'));

        // Radio button event listeners
        document.querySelectorAll('input[name="changeImpact"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleInput('changeImpact'));
        });

        // Quick example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectExample(e));
        });

        // Next button event listeners
        document.querySelectorAll('.next-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.nextStep(e));
        });


        // Export and restart buttons
        document.getElementById('copyMarkdown').addEventListener('click', () => this.copyMarkdown());
        document.getElementById('startOver').addEventListener('click', () => this.startOver());

        // Info button event listeners
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openModal(e));
        });

        // Modal close event listeners
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) {
                this.closeModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('modal-overlay').classList.contains('active')) {
                this.closeModal();
            }
        });

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveToStorage();
            }
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    handleInput(fieldName) {
        const element = document.getElementById(fieldName) || document.querySelector(`input[name="${fieldName}"]:checked`);
        
        if (element) {
            this.formData[fieldName] = element.value;
            this.saveToStorage();
            this.validateCurrentStep();
        }
    }

    selectExample(event) {
        const value = event.target.dataset.value;
        const problemInput = document.getElementById('problem');
        problemInput.value = value;
        this.formData.problem = value;
        this.saveToStorage();
        this.validateCurrentStep();
        problemInput.focus();
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`#step-${this.currentStep}`);
        const nextBtn = currentStepElement.querySelector('.next-btn');
        
        let isValid = false;
        
        switch(this.currentStep) {
            case 1:
                isValid = this.formData.problem.trim().length > 0;
                break;
            case 2:
                isValid = this.formData.solution.trim().length > 0;
                break;
            case 3:
                isValid = this.formData.hypothesis.trim().length > 0;
                break;
            case 4:
                isValid = this.formData.longTermMetric.length > 0;
                break;
            case 5:
                isValid = this.formData.proxyMetric.length > 0;
                break;
            case 6:
                isValid = this.formData.changeImpact.length > 0;
                break;
            case 7:
                isValid = this.formData.mdaCalculation.trim().length > 0;
                break;
            case 8:
                isValid = this.formData.timeline.trim().length > 0;
                break;
        }
        
        nextBtn.disabled = !isValid;
    }

    nextStep(event) {
        const stepNumber = parseInt(event.target.closest('.step').dataset.step);
        
        if (stepNumber === this.maxStep) {
            this.showSummary();
        } else {
            this.currentStep = stepNumber + 1;
            this.updateStepVisibility();
            this.scrollToCurrentStep();
        }
        
        this.saveToStorage();
    }


    updateStepVisibility() {
        for (let i = 1; i <= this.maxStep; i++) {
            const stepElement = document.getElementById(`step-${i}`);
            
            if (i < this.currentStep) {
                // Completed step
                stepElement.style.display = 'block';
                stepElement.className = 'step completed';
                this.populateCompletedStep(i);
            } else if (i === this.currentStep) {
                // Current active step
                stepElement.style.display = 'block';
                stepElement.className = 'step active';
                this.populateCurrentStep(i);
            } else {
                // Future steps
                stepElement.style.display = 'none';
                stepElement.className = 'step pending';
            }
        }
        
        // Hide summary if not completed
        const summary = document.getElementById('summary');
        if (this.currentStep <= this.maxStep) {
            summary.style.display = 'none';
        }
    }

    populateCurrentStep(stepNumber) {
        const fieldMap = {
            1: 'problem',
            2: 'solution', 
            3: 'hypothesis',
            4: 'longTermMetric',
            5: 'proxyMetric',
            6: 'changeImpact',
            7: 'mdaCalculation',
            8: 'timeline'
        };
        
        const fieldName = fieldMap[stepNumber];
        if (fieldName && this.formData[fieldName]) {
            const element = document.getElementById(fieldName);
            if (element) {
                element.value = this.formData[fieldName];
            } else if (fieldName === 'changeImpact') {
                const radioElement = document.querySelector(`input[name="changeImpact"][value="${this.formData[fieldName]}"]`);
                if (radioElement) {
                    radioElement.checked = true;
                }
            }
        }
    }

    populateCompletedStep(stepNumber) {
        // This method could show a summary preview in completed steps
        // For now, just ensure the data is populated
        this.populateCurrentStep(stepNumber);
    }

    scrollToCurrentStep() {
        const currentStepElement = document.querySelector(`#step-${this.currentStep}`);
        if (currentStepElement) {
            const elementTop = currentStepElement.offsetTop;
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    }

    showSummary() {
        // Hide all steps
        for (let i = 1; i <= this.maxStep; i++) {
            const stepElement = document.getElementById(`step-${i}`);
            stepElement.className = 'step completed';
        }
        
        // Populate summary
        this.populateSummary();
        
        // Show summary section
        const summary = document.getElementById('summary');
        summary.style.display = 'block';
        const summaryTop = summary.offsetTop;
        window.scrollTo({
            top: summaryTop,
            behavior: 'smooth'
        });
    }

    populateSummary() {
        document.getElementById('summary-problem').textContent = this.formData.problem;
        document.getElementById('summary-solution').textContent = this.formData.solution;
        document.getElementById('summary-hypothesis').textContent = this.formData.hypothesis;
        document.getElementById('summary-longterm').textContent = this.formData.longTermMetric;
        document.getElementById('summary-proxy').textContent = this.formData.proxyMetric;
        document.getElementById('summary-impact').textContent = this.formData.changeImpact;
        document.getElementById('summary-mda').textContent = this.formData.mdaCalculation;
        document.getElementById('summary-timeline').textContent = this.formData.timeline;
    }

    generateMarkdown() {
        return `# AB Test Plan

## Problem/Opportunity Identification

${this.formData.problem}

## Solution Proposal

${this.formData.solution}

## Hypothesis Formation

${this.formData.hypothesis}

## Long-term Metric Selection

${this.formData.longTermMetric}

## Proxy Metric Identification

${this.formData.proxyMetric}

## Change Impact Assessment

${this.formData.changeImpact}

## MDA Calculation

${this.formData.mdaCalculation}

## Timeline & Plan Setting

${this.formData.timeline}

---

_Generated by AB Test Setup Guide_`;
    }

    async copyMarkdown() {
        const markdown = this.generateMarkdown();
        const copyBtn = document.getElementById('copyMarkdown');
        const originalText = copyBtn.innerHTML;
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(markdown);
                this.showCopySuccess(copyBtn);
            } else {
                // Fallback for older browsers
                this.fallbackCopyTextToClipboard(markdown, copyBtn);
            }
        } catch (err) {
            this.showCopyError(copyBtn);
        }
    }

    fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess(button);
        } catch (err) {
            this.showCopyError(button);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showCopySuccess(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span data-lucide="check"></span>Copied!';
        button.style.background = '#22c55e';
        
        // Re-initialize icons for the new check icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
    }

    showCopyError(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span data-lucide="x"></span>Copy Failed';
        button.style.background = '#ef4444';
        
        // Re-initialize icons for the new x icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
    }

    startOver() {
        if (confirm('Are you sure you want to start over? This will clear all your progress.')) {
            this.currentStep = 1;
            this.formData = {
                problem: '',
                solution: '',
                hypothesis: '',
                longTermMetric: '',
                proxyMetric: '',
                changeImpact: '',
                mdaCalculation: '',
                timeline: ''
            };
            
            // Clear all form fields
            document.querySelectorAll('input, textarea, select').forEach(field => {
                if (field.type === 'radio') {
                    field.checked = false;
                } else {
                    field.value = '';
                }
            });
            
            this.saveToStorage();
            this.updateStepVisibility();
            this.validateCurrentStep();
            this.scrollToCurrentStep();
        }
    }

    openModal(event) {
        const stepNumber = event.target.closest('.info-btn').dataset.step;
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        const stepInfo = this.getStepInfo(stepNumber);
        modalTitle.textContent = stepInfo.title;
        modalBody.innerHTML = stepInfo.content;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Re-initialize icons in modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Focus on close button for accessibility
        setTimeout(() => {
            document.getElementById('modal-close').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    getStepInfo(stepNumber) {
        const stepInfoMap = {
            '1': {
                title: 'Problem/Opportunity Identification',
                content: `
                    <h4>Purpose</h4>
                    <p>This step helps you clearly define the problem or opportunity you want to address with your AB test. A well-defined problem is the foundation of any successful experiment.</p>
                    
                    <h4>What to include:</h4>
                    <ul>
                        <li>Specific metrics or behaviors you've observed</li>
                        <li>Data sources that identified the issue</li>
                        <li>Impact on business goals</li>
                        <li>User pain points or friction areas</li>
                    </ul>
                    
                    <h4>Example:</h4>
                    <p><em>"Analytics show 70% cart abandonment at checkout, with highest drop-off at payment step according to funnel analysis."</em></p>
                `
            },
            '2': {
                title: 'Solution Proposal',
                content: `
                    <h4>Purpose</h4>
                    <p>Describe your proposed solution to address the problem identified in step 1. This should be specific and actionable.</p>
                    
                    <h4>Best practices:</h4>
                    <ul>
                        <li>Be specific about what changes you'll make</li>
                        <li>Focus on one primary change per test</li>
                        <li>Consider user experience impact</li>
                        <li>Ensure the solution addresses the root cause</li>
                    </ul>
                    
                    <h4>Example:</h4>
                    <p><em>"Add security badges, trust seals, and payment method icons above the checkout form to increase user confidence."</em></p>
                `
            },
            '3': {
                title: 'Hypothesis Formation',
                content: `
                    <h4>Purpose</h4>
                    <p>Create a testable hypothesis using the "I believe [solution] will [outcome] BECAUSE [reasoning]" format.</p>
                    
                    <h4>Components of a good hypothesis:</h4>
                    <ul>
                        <li><strong>Belief:</strong> Your proposed solution</li>
                        <li><strong>Outcome:</strong> Specific, measurable result</li>
                        <li><strong>Reasoning:</strong> Why you think this will work</li>
                    </ul>
                    
                    <h4>Example:</h4>
                    <p><em>"I believe adding trust badges will increase checkout completion by 15% BECAUSE users will feel more confident about payment security."</em></p>
                `
            },
            '4': {
                title: 'Long-term Metric Selection',
                content: `
                    <h4>Purpose</h4>
                    <p>Choose the primary business metric that your test aims to improve. This should align with your overall business objectives.</p>
                    
                    <h4>Considerations:</h4>
                    <ul>
                        <li>Choose metrics that matter to business success</li>
                        <li>Ensure you can measure the metric accurately</li>
                        <li>Consider the time needed to see meaningful results</li>
                        <li>Select metrics with sufficient volume for statistical significance</li>
                    </ul>
                    
                    <h4>Common metrics:</h4>
                    <p>Conversion rate, revenue per visitor, customer lifetime value, retention rate, subscription signups.</p>
                `
            },
            '5': {
                title: 'Proxy Metric Identification',
                content: `
                    <h4>Purpose</h4>
                    <p>Select a proxy metric that provides faster feedback and correlates with your long-term metric. This helps you detect early signals of success or failure.</p>
                    
                    <h4>Benefits of proxy metrics:</h4>
                    <ul>
                        <li>Faster feedback cycles</li>
                        <li>Earlier detection of test performance</li>
                        <li>Ability to make quicker decisions</li>
                        <li>Reduced risk of running ineffective tests too long</li>
                    </ul>
                    
                    <h4>Examples:</h4>
                    <p>If your long-term metric is conversion rate, proxy metrics might be add-to-cart rate, time on checkout page, or form completion rate.</p>
                `
            },
            '6': {
                title: 'Change Impact Assessment',
                content: `
                    <h4>Purpose</h4>
                    <p>Assess the scope and impact of your proposed changes to determine the expected effect size and testing requirements.</p>
                    
                    <h4>Impact levels:</h4>
                    <ul>
                        <li><strong>Minor:</strong> Small copy changes, color adjustments, minor UI tweaks</li>
                        <li><strong>Moderate:</strong> Layout changes, new content sections, feature modifications</li>
                        <li><strong>Major:</strong> Complete redesigns, new features, fundamental UX changes</li>
                    </ul>
                    
                    <h4>Why this matters:</h4>
                    <p>Larger changes typically have bigger effects but may require longer test durations and larger sample sizes to detect significance.</p>
                `
            },
            '7': {
                title: 'MDA Calculation',
                content: `
                    <h4>Purpose</h4>
                    <p>Determine your Minimum Detectable Audience (MDA) - the sample size needed to detect a meaningful difference between variants.</p>
                    
                    <h4>Key factors:</h4>
                    <ul>
                        <li>Current conversion rate</li>
                        <li>Minimum effect size you want to detect</li>
                        <li>Desired statistical confidence level (typically 95%)</li>
                        <li>Statistical power (typically 80%)</li>
                    </ul>
                    
                    <h4>Tools:</h4>
                    <p>Use online calculators like Optimizely's sample size calculator or Evan Miller's AB test calculator to determine your MDA.</p>
                `
            },
            '8': {
                title: 'Timeline & Plan Setting',
                content: `
                    <h4>Purpose</h4>
                    <p>Define your testing timeline, success criteria, and decision-making framework before launching the test.</p>
                    
                    <h4>Include in your plan:</h4>
                    <ul>
                        <li>Minimum test duration</li>
                        <li>Maximum test duration</li>
                        <li>Success/failure criteria</li>
                        <li>Decision points for early stopping</li>
                        <li>Post-test analysis plan</li>
                    </ul>
                    
                    <h4>Best practices:</h4>
                    <p>Run tests for at least one business cycle, account for seasonality, and have clear criteria for when to stop testing.</p>
                `
            }
        };
        
        return stepInfoMap[stepNumber] || {
            title: 'Step Information',
            content: '<p>Information not available for this step.</p>'
        };
    }

    saveToStorage() {
        const dataToSave = {
            currentStep: this.currentStep,
            formData: this.formData,
            timestamp: new Date().toISOString()
        };
        
        try {
            sessionStorage.setItem('abTestGuideData', JSON.stringify(dataToSave));
        } catch (err) {
            console.warn('Failed to save to sessionStorage:', err);
        }
    }

    loadFromStorage() {
        try {
            const savedData = sessionStorage.getItem('abTestGuideData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.currentStep = parsed.currentStep || 1;
                this.formData = { ...this.formData, ...parsed.formData };
                
                // Populate form fields with saved data
                Object.keys(this.formData).forEach(key => {
                    if (this.formData[key]) {
                        const element = document.getElementById(key);
                        if (element) {
                            element.value = this.formData[key];
                        } else if (key === 'changeImpact') {
                            const radioElement = document.querySelector(`input[name="changeImpact"][value="${this.formData[key]}"]`);
                            if (radioElement) {
                                radioElement.checked = true;
                            }
                        }
                    }
                });
            }
        } catch (err) {
            console.warn('Failed to load from sessionStorage:', err);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ABTestGuide();
});

// Handle page visibility changes for auto-save
document.addEventListener('visibilitychange', () => {
    if (window.abTestGuide && document.visibilityState === 'hidden') {
        window.abTestGuide.saveToStorage();
    }
});

// Store reference globally for debugging
window.addEventListener('load', () => {
    if (window.abTestGuide) {
        window.abTestGuide = new ABTestGuide();
    }
});