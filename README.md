# AB Test Setup Guide

A comprehensive web application that guides users through creating effective AB test plans using an 8-step progressive form with clean, professional UI and data persistence.

## Features

- **Progressive 8-Step Form**: Guides users through the complete AB testing planning process
- **Data Persistence**: Automatically saves progress using sessionStorage
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Markdown Export**: Generate clean markdown summaries of test plans
- **Interactive UI**: Smooth animations and microinteractions
- **Modern Design**: Clean, professional interface using Inter font and Lucide icons

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start creating your AB test plan!

## File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling and responsive design
├── script.js           # JavaScript functionality and logic
└── README.md           # This file
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- **Google Fonts**: Inter font family (loaded from CDN)
- **Lucide Icons**: Icon library (loaded from CDN)

No build process or package manager required - just open and run!

## Usage

### 8-Step Process

1. **Problem/Opportunity Identification**: Define what you're trying to solve
2. **Solution Proposal**: Describe your proposed solution
3. **Hypothesis Formation**: Create a testable hypothesis
4. **Long-term Metric Selection**: Choose your primary success metric
5. **Proxy Metric Identification**: Select a proxy metric for faster feedback
6. **Change Impact Assessment**: Assess the scope of your changes
7. **MDA Calculation**: Define your minimum detectable audience
8. **Timeline & Plan Setting**: Set your testing timeline and plan

### Features

- **Auto-save**: Your progress is automatically saved as you type
- **Edit Mode**: Click edit icons to modify completed steps
- **Quick Examples**: Use predefined examples for faster form completion
- **Validation**: Form validation ensures all required fields are completed
- **Export**: Copy your complete test plan as formatted markdown

## Technical Implementation

- **Vanilla JavaScript**: No frameworks or libraries required
- **CSS Grid & Flexbox**: Modern layout techniques for responsive design
- **SessionStorage**: Browser-based persistence (data cleared when tab closes)
- **Progressive Enhancement**: Works even if JavaScript is disabled
- **Semantic HTML**: Proper document structure for accessibility

## Development

The application is built with modern web standards and requires no build process. Simply edit the files and refresh your browser to see changes.

### Key Features Implemented

- ✅ Semantic HTML5 structure
- ✅ Responsive CSS Grid/Flexbox layout
- ✅ Interactive form validation
- ✅ Progressive step flow
- ✅ Data persistence with sessionStorage
- ✅ Clipboard API integration
- ✅ Accessibility features (ARIA labels, keyboard navigation)
- ✅ Smooth animations and transitions
- ✅ Mobile-optimized touch interactions

## License

This project is open source and available under the MIT License.