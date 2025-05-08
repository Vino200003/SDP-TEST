/**
 * Debug utility for diagnosing rendering issues
 */

export const logRenderInfo = (componentName) => {
  console.log(`[${new Date().toISOString()}] Rendering ${componentName}`);
};

export const checkRenderEnvironment = () => {
  // Check for common React rendering environment issues
  const issues = [];

  if (!window.React) {
    issues.push('React not found in window - possible bundling issue');
  }

  if (!document.getElementById('root')) {
    issues.push('Root element not found - check HTML structure');
  }

  const reactVersion = window.React?.version || 'unknown';
  console.log(`React version: ${reactVersion}`);
  console.log(`Rendering in ${process.env.NODE_ENV} mode`);

  if (issues.length > 0) {
    console.warn('Potential rendering issues detected:');
    issues.forEach(issue => console.warn(`- ${issue}`));
  } else {
    console.log('Rendering environment looks good');
  }

  return issues.length === 0;
};

// Run this once when the module is imported
checkRenderEnvironment();
