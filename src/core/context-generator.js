function extractPageContext() {
    const content = [];

    // Get title
    if (document.title) {
        content.push(`Page Title: ${document.title}`);
    }

    // Get meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        content.push(`Page Description: ${metaDesc.content}`);
    }

    // Get headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
        if (h.textContent.trim() && !h.closest('.wva-container')) {
            content.push(`${h.tagName}: ${h.textContent.trim()}`);
        }
    });

    // Get main content paragraphs
    const paragraphs = document.querySelectorAll('p, li');
    paragraphs.forEach(p => {
        if (p.textContent.trim().length > 30 && !p.closest('.wva-container')) {
            content.push(`Content: ${p.textContent.trim()}`);
        }
    });

    // Get form labels and inputs
    const formElements = document.querySelectorAll('label, input[placeholder], textarea[placeholder]');
    formElements.forEach(el => {
        if (el.textContent?.trim() || el.placeholder) {
            content.push(`Form: ${el.textContent?.trim() || el.placeholder}`);
        }
    });

    return content.join('\n').substring(0, 5000); // Limit context size
}

if (typeof exports !== "undefined") {
    exports.extractPageContext = extractPageContext
}