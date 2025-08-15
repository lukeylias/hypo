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
        this.loadFromURL();
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
        document.getElementById('proxyMetric').addEventListener('change', () => {
            this.handleInput('proxyMetric');
            this.updateProxyMetricPlaceholders();
        });
        document.getElementById('mdaCalculation').addEventListener('input', () => this.handleInput('mdaCalculation'));
        document.getElementById('timeline').addEventListener('input', () => this.handleInput('timeline'));

        // Radio button event listeners
        document.querySelectorAll('input[name="changeImpact"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleInput('changeImpact'));
        });

        // Calculator event listeners - only validate on blur and change for better UX
        document.getElementById('baselineRate').addEventListener('blur', () => this.validateCalculatorField('baselineRate'));
        document.getElementById('baselineRate').addEventListener('input', () => {
            this.clearFieldError('baselineRate');
            this.showCalculateLoadingState();
        });
        document.getElementById('weeklyVisitors').addEventListener('blur', () => this.validateCalculatorField('weeklyVisitors'));
        document.getElementById('weeklyVisitors').addEventListener('input', (e) => {
            this.clearFieldError('weeklyVisitors');
            this.formatNumberWithCommas(e.target);
            this.showCalculateLoadingState();
        });
        document.getElementById('mde').addEventListener('blur', () => this.validateCalculatorField('mde'));
        document.getElementById('mde').addEventListener('input', () => {
            this.clearFieldError('mde');
            this.showCalculateLoadingState();
        });
        document.getElementById('significance').addEventListener('change', () => {
            this.validateCalculatorInputs();
            this.showCalculateLoadingState();
        });
        document.querySelectorAll('input[name="variations"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.validateCalculatorInputs();
                // Show loading state when variations change
                this.showCalculateLoadingState();
            });
        });

        // Separate calculation and progression event listeners
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateTimeline());
        document.getElementById('continueBtn').addEventListener('click', () => this.continueToNextStep());

        // Copy prompt button event listeners
        document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyPrompt(e));
        });

        // Next button event listeners (for other steps)
        document.querySelectorAll('.next-btn').forEach(btn => {
            // Skip the continue button in step 7, handle it separately
            if (btn.id !== 'continueBtn') {
                btn.addEventListener('click', (e) => this.nextStep(e));
            }
        });


        // Export and restart buttons
        document.getElementById('copyMarkdown').addEventListener('click', () => this.copyMarkdown());
        document.getElementById('startOver').addEventListener('click', () => this.startOver());
        document.getElementById('resetForm').addEventListener('click', () => this.startOver());
        document.getElementById('shareForm').addEventListener('click', () => this.shareForm());

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
            
            // Clear any validation errors for this field
            this.clearFieldValidationError(fieldName);
        }
    }

    clearFieldValidationError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement && errorElement.classList.contains('field-validation-error')) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }


    validateCurrentStep() {
        // Remove disabled state validation - buttons are always enabled now
        // Validation will happen when buttons are clicked
    }

    nextStep(event) {
        const stepNumber = parseInt(event.target.closest('.step').dataset.step);
        
        // Validate current step before proceeding
        if (!this.validateStepData(stepNumber)) {
            return; // Don't proceed if validation fails
        }
        
        if (stepNumber === this.maxStep) {
            this.showSummary();
        } else {
            this.currentStep = stepNumber + 1;
            this.updateStepVisibility();
            this.scrollToCurrentStep();
        }
        
        this.saveToStorage();
    }

    validateStepData(stepNumber) {
        let isValid = true;
        
        // Clear any existing step validation errors
        this.clearStepValidationErrors(stepNumber);
        
        switch(stepNumber) {
            case 1:
                if (!this.formData.problem || this.formData.problem.trim().length === 0) {
                    this.showFieldError('problem', 'Please describe the problem or opportunity before continuing.');
                    isValid = false;
                }
                break;
            case 2:
                if (!this.formData.solution || this.formData.solution.trim().length === 0) {
                    this.showFieldError('solution', 'Please describe your proposed solution before continuing.');
                    isValid = false;
                }
                break;
            case 3:
                if (!this.formData.hypothesis || this.formData.hypothesis.trim().length === 0) {
                    this.showFieldError('hypothesis', 'Please write your hypothesis before continuing.');
                    isValid = false;
                }
                break;
            case 4:
                if (!this.formData.longTermMetric || this.formData.longTermMetric.length === 0) {
                    this.showFieldError('longTermMetric', 'Please select a long-term metric before continuing.');
                    isValid = false;
                }
                break;
            case 5:
                if (!this.formData.proxyMetric || this.formData.proxyMetric.length === 0) {
                    this.showFieldError('proxyMetric', 'Please select a proxy metric before continuing.');
                    isValid = false;
                }
                break;
            case 6:
                if (!this.formData.changeImpact || this.formData.changeImpact.length === 0) {
                    this.showStepError(stepNumber, 'Please select the change impact before continuing.');
                    isValid = false;
                }
                break;
            case 7:
                // For Step 7, check if calculator has been completed
                const calculateBtn = document.getElementById('calculateBtn');
                if (!calculateBtn || !calculateBtn.classList.contains('success')) {
                    this.showStepError(stepNumber, 'Please complete the timeline calculation before continuing.');
                    isValid = false;
                }
                break;
            case 8:
                if (!this.formData.timeline || this.formData.timeline.trim().length === 0) {
                    this.showFieldError('timeline', 'Please enter your timeline and plan details before generating the summary.');
                    isValid = false;
                }
                break;
        }
        
        return isValid;
    }

    showFieldError(fieldName, message) {
        // Try to find an existing error element for this field
        let errorElement = document.getElementById(`${fieldName}-error`);
        
        // If no error element exists, create one
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = `${fieldName}-error`;
            errorElement.className = 'field-validation-error';
            
            // Find the field and insert error after it
            const field = document.getElementById(fieldName);
            if (field) {
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    showStepError(stepNumber, message) {
        // Create a general step error that appears at the bottom of the step
        let errorElement = document.getElementById(`step-${stepNumber}-error`);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = `step-${stepNumber}-error`;
            errorElement.className = 'step-validation-error';
            
            // Find the step content and append error
            const stepContent = document.querySelector(`#step-${stepNumber} .step-content`);
            if (stepContent) {
                stepContent.appendChild(errorElement);
            }
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearStepValidationErrors(stepNumber) {
        // Clear field-specific errors in this step
        const stepElement = document.getElementById(`step-${stepNumber}`);
        if (stepElement) {
            const errorElements = stepElement.querySelectorAll('.field-validation-error, .step-validation-error');
            errorElements.forEach(error => {
                error.style.display = 'none';
                error.textContent = '';
            });
        }
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
                
                // Update proxy metric placeholders when Step 7 becomes active
                if (i === 7) {
                    this.updateProxyMetricPlaceholders();
                }
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
        
        // Format MDA calculation as a readable list
        if (this.formData.mdaCalculation) {
            const mdaText = this.formData.mdaCalculation;
            
            // Extract key information from the MDA calculation text
            const durationMatch = mdaText.match(/(\d+) weeks minimum/);
            const baselineMatch = mdaText.match(/(\d+\.?\d*)% baseline conversion rate/);
            const visitorsMatch = mdaText.match(/([\d,]+) weekly visitors/);
            const mdeMatch = mdaText.match(/(\d+(?:\.\d+)?) percentage point improvement/);
            const confidenceMatch = mdaText.match(/(\d+)% confidence/);
            
            const duration = durationMatch ? durationMatch[1] : 'N/A';
            const baseline = baselineMatch ? baselineMatch[1] : 'N/A';
            const visitors = visitorsMatch ? visitorsMatch[1] : 'N/A';
            const mde = mdeMatch ? mdeMatch[1] : 'N/A';
            const confidence = confidenceMatch ? confidenceMatch[1] : 'N/A';
            
            document.getElementById('summary-mda').innerHTML = `
                • <strong>Duration:</strong> ${duration} weeks minimum<br>
                • <strong>Baseline Rate:</strong> ${baseline}%<br>
                • <strong>Weekly Traffic:</strong> ${visitors} visitors<br>
                • <strong>Effect Size:</strong> ${mde} percentage point target<br>
                • <strong>Confidence Level:</strong> ${confidence}%
            `;
        } else {
            document.getElementById('summary-mda').textContent = this.formData.mdaCalculation;
        }
        
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
            
            // Restore default values for calculator fields
            const mdeField = document.getElementById('mde');
            const significanceField = document.getElementById('significance');
            const variationsRadio = document.getElementById('variations-2');
            
            if (mdeField) mdeField.value = '5';
            if (significanceField) significanceField.value = '90';
            if (variationsRadio) variationsRadio.checked = true;
            
            // Reset calculator button state
            const calculateBtn = document.getElementById('calculateBtn');
            if (calculateBtn) {
                calculateBtn.className = 'calculate-btn';
                calculateBtn.innerHTML = 'Calculate Timeline';
                calculateBtn.onclick = () => this.calculateTimeline();
            }
            
            // Hide calculator results
            const calculatorResult = document.getElementById('calculatorResult');
            if (calculatorResult) {
                calculatorResult.style.display = 'none';
            }
            
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
                    <p>Assess the scope and impact of your proposed changes to determine development effort, measurement complexity, and expected effect size.</p>
                    
                    <h4>Impact levels:</h4>
                    <ul>
                        <li><strong>Small:</strong> Copy changes, color adjustments, minor UI tweaks, layout modifications</li>
                        <li><strong>Large:</strong> Complete redesigns, new features, fundamental UX changes, major content overhauls</li>
                    </ul>
                    
                    <h4>Why this matters:</h4>
                    <p><strong>Large changes:</strong></p>
                    <ul>
                        <li>Faster data collection - Big effects are easier to detect statistically</li>
                        <li>Longer development time - More complex to build and implement</li>
                        <li>Harder to isolate learnings - Multiple variables changing makes it difficult to identify what specifically drove results</li>
                    </ul>
                    
                    <p><strong>Small changes:</strong></p>
                    <ul>
                        <li>Faster to build - Quick implementation and deployment</li>
                        <li>Clear learnings - Easy to identify exactly what caused the effect</li>
                        <li>Slower data collection - Small effects require larger sample sizes and longer test durations to reach significance</li>
                    </ul>
                    
                    <p><strong>Trade-off consideration:</strong> Choose based on your timeline constraints, development resources, and learning objectives.</p>
                `
            },
            '7': {
                title: 'MDA Calculation',
                content: `
                    <h4>Purpose</h4>
                    <p>Calculate how long your experiment needs to run to detect meaningful changes with statistical confidence.</p>
                    
                    <h4>What you'll determine:</h4>
                    <ul>
                        <li><strong>Baseline conversion rate</strong> - Current performance of your proxy metric</li>
                        <li><strong>Weekly traffic volume</strong> - How many visitors reach your test area</li>
                        <li><strong>Minimum effect size</strong> - Smallest improvement worth detecting (typically 10%)</li>
                        <li><strong>Timeline needed</strong> - Weeks required to reach statistical significance</li>
                    </ul>
                    
                    <h4>Why this matters:</h4>
                    <p>Understanding your timeline upfront helps with:</p>
                    <ul>
                        <li>Resource planning and expectations</li>
                        <li>Deciding if the test is worth running</li>
                        <li>Choosing between testing approaches (small vs large changes)</li>
                    </ul>
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

    updateProxyMetricPlaceholders() {
        const proxyMetric = this.formData.proxyMetric || 'Proxy Metric';
        
        // Mapping for specific proxy metrics to ContentSquare terms
        const proxyMetricMapping = {
            "Click-through Rate": "specific page/element",
            "Add to Cart Rate": "Add to Cart button",
            "Email Signups": "Email signup form",
            "Page Views per Session": "page views",
            "Time on Page": "page engagement",
            "Form Completion Rate": "form submission",
            "Download Rate": "download action",
            "Video Watch Time": "video engagement",
            "Feature Usage Rate": "feature interaction"
        };
        
        const mappedMetric = proxyMetricMapping[proxyMetric] || proxyMetric;
        
        // Update placeholders in both prompts
        const placeholders = document.querySelectorAll('.proxy-metric-placeholder');
        placeholders.forEach(placeholder => {
            placeholder.textContent = mappedMetric;
        });
        
        // Update baseline rate label
        const baselineRateLabel = document.getElementById('baselineRateLabel');
        if (baselineRateLabel) {
            if (this.formData.proxyMetric) {
                baselineRateLabel.innerHTML = `Current conversion rate for <strong>${this.formData.proxyMetric}</strong>`;
            } else {
                baselineRateLabel.textContent = 'Current conversion rate for your proxy metric';
            }
        }
    }

    async copyPrompt(event) {
        const promptType = event.target.closest('.copy-prompt-btn').dataset.prompt;
        const proxyMetric = this.formData.proxyMetric || 'Proxy Metric';
        
        // Mapping for ContentSquare terms
        const proxyMetricMapping = {
            "Click-through Rate": "specific page/element",
            "Add to Cart Rate": "Add to Cart button", 
            "Email Signups": "Email signup form",
            "Page Views per Session": "page views",
            "Time on Page": "page engagement",
            "Form Completion Rate": "form submission",
            "Download Rate": "download action",
            "Video Watch Time": "video engagement",
            "Feature Usage Rate": "feature interaction"
        };
        
        const mappedMetric = proxyMetricMapping[proxyMetric] || proxyMetric;
        
        let promptText = '';
        if (promptType === 'baseline') {
            promptText = `What's the conversion rate from ${mappedMetric} to Join Complete over the last 90 days?`;
        } else if (promptType === 'traffic') {
            promptText = `How many weekly sessions reach ${mappedMetric} on average over the last 90 days?`;
        }
        
        const button = event.target.closest('.copy-prompt-btn');
        const originalHTML = button.innerHTML;
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(promptText);
                this.showPromptCopySuccess(button);
            } else {
                this.fallbackCopyPrompt(promptText, button);
            }
        } catch (err) {
            this.showPromptCopyError(button);
        }
    }

    fallbackCopyPrompt(text, button) {
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
            this.showPromptCopySuccess(button);
        } catch (err) {
            this.showPromptCopyError(button);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showPromptCopySuccess(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span data-lucide="check"></span>Copied!';
        button.style.background = '#22c55e';
        
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

    showPromptCopyError(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span data-lucide="x"></span>Failed';
        button.style.background = '#ef4444';
        
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

    clearFieldError(fieldName) {
        document.getElementById(`${fieldName}-error`).textContent = '';
    }

    validateCalculatorField(fieldName) {
        const field = document.getElementById(fieldName);
        // Remove commas for parsing numbers
        const rawValue = field.value.replace(/,/g, '');
        const value = fieldName === 'weeklyVisitors' ? parseInt(rawValue) : parseFloat(rawValue);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        let isValid = true;
        
        // Clear previous error
        errorElement.textContent = '';
        
        // Show error for empty fields on blur
        if (field.value.trim() === '') {
            switch(fieldName) {
                case 'baselineRate':
                    errorElement.textContent = 'Baseline rate is required';
                    break;
                case 'weeklyVisitors':
                    errorElement.textContent = 'Weekly visitors is required';
                    break;
                case 'mde':
                    errorElement.textContent = 'MDE is required';
                    break;
            }
            isValid = false;
        } else {
            // Validate field values
            switch(fieldName) {
                case 'baselineRate':
                    if (!value || value < 0.1 || value > 99) {
                        errorElement.textContent = 'Baseline rate must be between 0.1% and 99%';
                        isValid = false;
                    }
                    break;
                case 'weeklyVisitors':
                    if (!value || value < 100) {
                        errorElement.textContent = 'Weekly visitors must be at least 100 for reliable results';
                        isValid = false;
                    }
                    break;
                case 'mde':
                    if (!value || value < 1 || value > 50) {
                        errorElement.textContent = 'MDE should be between 1% and 50% for practical testing';
                        isValid = false;
                    }
                    break;
            }
        }
        
        
        return isValid;
    }

    validateCalculatorInputs() {
        const baselineRate = parseFloat(document.getElementById('baselineRate').value);
        const weeklyVisitors = parseInt(document.getElementById('weeklyVisitors').value.replace(/,/g, ''));
        const mde = parseFloat(document.getElementById('mde').value);
        
        let isValid = true;
        
        // Validate all fields when calculate is clicked
        if (!baselineRate || baselineRate < 0.1 || baselineRate > 99) {
            document.getElementById('baselineRate-error').textContent = baselineRate ? 'Baseline rate must be between 0.1% and 99%' : 'Baseline rate is required';
            isValid = false;
        }
        
        if (!weeklyVisitors || weeklyVisitors < 100) {
            document.getElementById('weeklyVisitors-error').textContent = weeklyVisitors ? 'Weekly visitors must be at least 100 for reliable results' : 'Weekly visitors is required';
            isValid = false;
        }
        
        if (!mde || mde < 1 || mde > 50) {
            document.getElementById('mde-error').textContent = mde ? 'MDE should be between 1% and 50% for practical testing' : 'MDE is required';
            isValid = false;
        }
        
        return isValid;
    }

    updateCalculateButtonState() {
        // Remove disabled state logic - button is always enabled
        // Validation will happen when button is clicked
    }


    formatNumberWithCommas(inputElement) {
        // Get the current cursor position
        const cursorPosition = inputElement.selectionStart;
        
        // Remove any non-numeric characters except commas
        let rawValue = inputElement.value.replace(/[^\d,]/g, '');
        
        // Remove any existing commas to get the pure number
        rawValue = rawValue.replace(/,/g, '');
        
        // Only format if it's a valid number and not empty
        if (rawValue && !isNaN(rawValue) && rawValue !== '') {
            // Format with commas
            const formattedValue = parseInt(rawValue).toLocaleString();
            
            // Calculate the new cursor position (accounting for added commas)
            const commasAdded = formattedValue.split(',').length - inputElement.value.split(',').length;
            const newCursorPosition = cursorPosition + commasAdded;
            
            // Update the value
            inputElement.value = formattedValue;
            
            // Restore cursor position
            inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
        } else if (rawValue === '') {
            // Clear the field if no valid number
            inputElement.value = '';
        }
    }

    getZValue(confidenceLevel) {
        const zValues = {
            90: 1.645,
            95: 1.96,
            99: 2.576,
            80: 0.84  // for power
        };
        return zValues[confidenceLevel] || 1.96;
    }

    calculateSampleSize(baseline, mdePoints, significance, power = 80) {
        const p1 = baseline / 100;
        // Convert percentage points to relative percentage for statistical calculation
        const mdeRelative = (mdePoints / baseline) * 100;
        const p2 = p1 * (1 + mdeRelative / 100);
        
        const zAlpha = this.getZValue(significance);
        const zBeta = this.getZValue(power);
        
        const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
        const denominator = Math.pow(p1 - p2, 2);
        
        return Math.ceil(numerator / denominator);
    }

    // Bonferroni correction for multiple comparisons
    calculateBonferroniSampleSize(baseline, mdePoints, significance, variations, power = 90) {
        // Adjust alpha for number of variant-vs-control comparisons
        const numComparisons = variations - 1; // Each variant vs control
        const alpha = (100 - significance) / 100; // Convert to alpha level
        const adjustedAlpha = alpha / numComparisons; // Bonferroni correction
        const adjustedSignificance = (1 - adjustedAlpha) * 100; // Convert back to confidence level
        
        // Use adjusted significance level
        const p1 = baseline / 100;
        const mdeRelative = (mdePoints / baseline) * 100;
        const p2 = p1 * (1 + mdeRelative / 100);
        
        const zAlpha = this.getZValue(adjustedSignificance);
        const zBeta = this.getZValue(power);
        
        const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
        const denominator = Math.pow(p1 - p2, 2);
        
        return Math.ceil(numerator / denominator);
    }

    // Holm correction (less conservative alternative)
    calculateHolmSampleSize(baseline, mdePoints, significance, variations, power = 90) {
        // For simplicity, using the most conservative step (same as Bonferroni)
        // In practice, Holm allows some tests to use less stringent alpha
        const numComparisons = variations - 1;
        const alpha = (100 - significance) / 100; // Convert to alpha level
        const adjustedAlpha = alpha / numComparisons; // Most conservative Holm step
        const adjustedSignificance = (1 - adjustedAlpha) * 100; // Convert back to confidence level
        
        const p1 = baseline / 100;
        const mdeRelative = (mdePoints / baseline) * 100;
        const p2 = p1 * (1 + mdeRelative / 100);
        
        const zAlpha = this.getZValue(adjustedSignificance);
        const zBeta = this.getZValue(power);
        
        const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
        const denominator = Math.pow(p1 - p2, 2);
        
        return Math.ceil(numerator / denominator);
    }

    // Main calculation function with multiple comparison logic
    calculateExperimentMetrics(baseline, mdePoints, weeklyVisitors, significance, variations, power = 90, correctionMethod = 'bonferroni') {
        let sampleSize;
        
        if (variations > 2) {
            // Apply multiple comparison correction
            if (correctionMethod === 'holm') {
                sampleSize = this.calculateHolmSampleSize(baseline, mdePoints, significance, variations, power);
            } else {
                sampleSize = this.calculateBonferroniSampleSize(baseline, mdePoints, significance, variations, power);
            }
        } else {
            // Standard calculation for A/B tests
            sampleSize = this.calculateSampleSize(baseline, mdePoints, significance, power);
        }
        
        const statisticalWeeks = this.calculateWeeksNeeded(sampleSize, weeklyVisitors, variations);
        const recommendedWeeks = Math.max(2, statisticalWeeks);
        
        return { 
            sampleSize, 
            statisticalWeeks, 
            recommendedWeeks,
            correctionApplied: variations > 2,
            numComparisons: variations - 1,
            correctionMethod: variations > 2 ? correctionMethod : 'none'
        };
    }

    calculateWeeksNeeded(sampleSize, weeklyVisitors, variations) {
        const visitorsPerVariant = weeklyVisitors / variations;
        return Math.ceil(sampleSize / visitorsPerVariant);
    }

    // Generate dynamic timeline display based on statistical requirements
    // Show loading state when inputs change (don't clear results)
    showCalculateLoadingState() {
        const calculateBtn = document.getElementById('calculateBtn');
        
        // Only show loading state if button is not already in initial state
        if (calculateBtn && calculateBtn.className.includes('success')) {
            calculateBtn.className = 'calculate-btn needs-recalculation';
            calculateBtn.innerHTML = '<span data-lucide="refresh-cw"></span>Recalculate Timeline';
            calculateBtn.disabled = false;
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    // Continue to next step (separate from calculation)
    continueToNextStep() {
        // Always allow progression, regardless of calculation state
        this.nextStep();
    }

    generateTimelineDisplay(statisticalWeeks, recommendedWeeks, mdePoints, variations) {
        let display = "";
        
        if (statisticalWeeks < 1) {
            display += `<strong>${recommendedWeeks} ${recommendedWeeks === 1 ? 'week' : 'weeks'} needed for ±${mdePoints}% change detection</strong><br><br>`;
            display += `After ${recommendedWeeks} ${recommendedWeeks === 1 ? 'week' : 'weeks'}, you should see clear results if your change:<br>`;
            display += `• <strong>Improves conversion by +${mdePoints}% or more</strong> (implement it)<br>`;
            display += `• <strong>Hurts conversion by -${mdePoints}% or more</strong> (stop the test)<br>`;
            display += `• <strong>Shows no meaningful change</strong> (effect is likely between -${mdePoints}% and +${mdePoints}%)<br><br>`;
            display += `Statistical minimum (theoretical): &lt;1 week at current traffic<br>`;
            display += `<strong>RECOMMENDED runtime: ${recommendedWeeks} weeks minimum</strong><br><br>`;
            display += `<em>Covers weekday/weekend cycles, novelty effects, SRM checks, and tracking validation</em>`;
        } else {
            display += `<strong>${recommendedWeeks} ${recommendedWeeks === 1 ? 'week' : 'weeks'} needed for ±${mdePoints}% change detection</strong><br><br>`;
            display += `After ${recommendedWeeks} ${recommendedWeeks === 1 ? 'week' : 'weeks'}, you should see clear results if your change:<br>`;
            display += `• <strong>Improves conversion by +${mdePoints}% or more</strong> (implement it)<br>`;
            display += `• <strong>Hurts conversion by -${mdePoints}% or more</strong> (stop the test)<br>`;
            display += `• <strong>Shows no meaningful change</strong> (effect is likely between -${mdePoints}% and +${mdePoints}%)<br><br>`;
            display += `Statistical minimum: ${Math.ceil(statisticalWeeks)} week${Math.ceil(statisticalWeeks) === 1 ? '' : 's'}<br>`;
            display += `<strong>RECOMMENDED runtime: ${recommendedWeeks} weeks</strong><br><br>`;
            
            if (recommendedWeeks > 6) {
                display += `⚠️ <em>Consider if this effect size is worth the testing investment</em><br><br>`;
            }
            
            display += `<em>Allows time for proper detection plus business validation and covers weekday/weekend cycles</em>`;
        }
        
        if (statisticalWeeks !== recommendedWeeks) {
            display += `<br><br>If results are still unclear after ${recommendedWeeks} ${recommendedWeeks === 1 ? 'week' : 'weeks'}, the actual effect is probably smaller than ±${mdePoints}% and may not be worth pursuing.`;
        }
        
        return display;
    }

    calculateTimeline() {
        if (!this.validateCalculatorInputs()) {
            return;
        }
        
        const baselineRate = parseFloat(document.getElementById('baselineRate').value);
        const weeklyVisitors = parseInt(document.getElementById('weeklyVisitors').value.replace(/,/g, ''));
        const mde = parseFloat(document.getElementById('mde').value);
        const significance = parseInt(document.getElementById('significance').value);
        const variations = parseInt(document.querySelector('input[name="variations"]:checked').value);
        
        // Update button to show calculating state
        const calculateBtn = document.getElementById('calculateBtn');
        const originalHTML = calculateBtn.innerHTML;
        calculateBtn.innerHTML = 'Calculating...';
        calculateBtn.disabled = true;
        
        setTimeout(() => {
            // Use enhanced calculation with multiple comparison corrections
            const power = 90; // Default to 90% power
            const correctionMethod = 'bonferroni'; // Default correction method
            
            const metrics = this.calculateExperimentMetrics(
                baselineRate, 
                mde, 
                weeklyVisitors, 
                significance, 
                variations, 
                power, 
                correctionMethod
            );
            
            // Check if timeline is reasonable
            if (metrics.recommendedWeeks > 12) {
                document.getElementById('weeklyVisitors-error').textContent = 'Not enough weekly traffic - consider extending timeline or increasing MDE';
                calculateBtn.innerHTML = originalHTML;
                calculateBtn.disabled = false;
                return;
            }
            
            // Display results
            const resultDiv = document.getElementById('calculatorResult');
            const resultSummary = document.getElementById('resultSummary');
            
            // Generate enhanced timeline display
            const timelineDisplay = this.generateTimelineDisplay(
                metrics.statisticalWeeks, 
                metrics.recommendedWeeks, 
                mde, 
                variations
            );
            
            // Generate sample size display with assumptions
            let sampleSizeDisplay = `Sample size: <strong>${metrics.sampleSize.toLocaleString()}</strong> visitors per variant`;
            
            if (metrics.correctionApplied) {
                sampleSizeDisplay += `<br><em class="assumptions-text">Includes multiplicity correction for ${metrics.numComparisons} variant-vs-control comparisons, ${power}% power, and ${significance}% confidence level</em>`;
            }
            
            resultSummary.innerHTML = `
                <div class="sample-size-section">
                    <h4>${sampleSizeDisplay}</h4>
                </div>
                <br>
                <div class="timeline-section">
                    ${timelineDisplay}
                </div>
                <br>
                <details class="advanced-options">
                    <summary>Advanced Settings</summary>
                    <div class="advanced-content">
                        • Correction method: ${metrics.correctionMethod === 'bonferroni' ? 'Bonferroni (conservative)' : metrics.correctionMethod === 'holm' ? 'Holm (balanced)' : 'None (A/B test)'}<br>
                        • Family-wise alpha: ${significance}%<br>
                        • Statistical power: ${power}%<br>
                        • Comparisons: ${metrics.correctionApplied ? `${metrics.numComparisons} variants vs control` : 'Single A/B comparison'}
                    </div>
                </details>
            `;
            
            resultDiv.style.display = 'block';
            
            // Update button to success state (no continue action)
            calculateBtn.className = 'calculate-btn success';
            calculateBtn.innerHTML = `<span data-lucide="check"></span>Calculation Complete`;
            calculateBtn.disabled = false;
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Generate timeline text for Step 8
            const proxyMetric = this.formData.proxyMetric || 'your proxy metric';
            const timelineText = `Experiment Duration: ${metrics.recommendedWeeks} weeks minimum

Based on your proxy metric (${proxyMetric}) with ${baselineRate}% baseline conversion rate and ${weeklyVisitors.toLocaleString()} weekly visitors across ${variations} variations, you need ${metrics.recommendedWeeks} weeks to detect a ${mde} percentage point improvement with ${significance}% confidence.

${metrics.correctionApplied ? `\nNote: Sample size includes Bonferroni correction for ${metrics.numComparisons} variant-vs-control comparisons.` : ''}

Recommended Plan:
• Week 1-${metrics.recommendedWeeks}: Run experiment
• If statistical significance reached: Implement winning variant
• If no significance: Consider extending 1-2 weeks or redesigning test
• Monitor both proxy metric and long-term metric alignment`;

            // Store the calculated timeline
            this.formData.mdaCalculation = timelineText;
            
            // Update the hidden field
            document.getElementById('mdaCalculation').value = timelineText;
            
            // Save to storage
            this.saveToStorage();
            
            // Calculate button should only handle calculation, no navigation
            
        }, 500); // Small delay to show calculating state
    }

    async shareForm() {
        const shareUrl = this.generateShareUrl();
        const shareBtn = document.getElementById('shareForm');
        const originalHTML = shareBtn.innerHTML;
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shareUrl);
                this.showShareSuccess(shareBtn);
            } else {
                // Fallback for older browsers
                this.fallbackCopyUrl(shareUrl, shareBtn);
            }
        } catch (err) {
            this.showShareError(shareBtn);
        }
    }

    generateShareUrl() {
        // Only include non-empty form data to keep URLs shorter
        const nonEmptyData = {};
        Object.keys(this.formData).forEach(key => {
            if (this.formData[key] && this.formData[key].trim() !== '') {
                nonEmptyData[key] = this.formData[key];
            }
        });

        if (Object.keys(nonEmptyData).length === 0) {
            return window.location.origin + window.location.pathname;
        }

        // Encode the data securely using base64
        const dataString = JSON.stringify({
            step: this.currentStep,
            data: nonEmptyData,
            timestamp: Date.now()
        });
        
        const encoded = btoa(encodeURIComponent(dataString));
        return `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    }

    loadFromURL() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedData = urlParams.get('d');
            
            if (encodedData) {
                const decoded = decodeURIComponent(atob(encodedData));
                const parsedData = JSON.parse(decoded);
                
                // Validate the data structure
                if (parsedData.data && typeof parsedData.data === 'object') {
                    // Merge URL data with existing form data
                    this.formData = { ...this.formData, ...parsedData.data };
                    
                    // Set current step if provided and valid
                    if (parsedData.step && parsedData.step >= 1 && parsedData.step <= this.maxStep) {
                        this.currentStep = parsedData.step;
                    }
                    
                    // Populate form fields with URL data
                    this.populateFormFields();
                    
                    // Clear the URL parameters for security
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        } catch (err) {
            console.warn('Failed to load data from URL:', err);
            // If URL parsing fails, just continue normally
        }
    }

    populateFormFields() {
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

    fallbackCopyUrl(url, button) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showShareSuccess(button);
        } catch (err) {
            this.showShareError(button);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showShareSuccess(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span data-lucide="check"></span>Link Copied!';
        button.style.background = '#22c55e';
        button.style.borderColor = '#22c55e';
        
        // Re-initialize icons for the new check icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.borderColor = '';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
    }

    showShareError(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span data-lucide="x"></span>Share Failed';
        button.style.background = '#ef4444';
        button.style.borderColor = '#ef4444';
        button.style.color = '#ffffff';
        
        // Re-initialize icons for the new x icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.borderColor = '';
            button.style.color = '';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
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