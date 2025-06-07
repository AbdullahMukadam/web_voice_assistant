function extractPageContext(contextSize) {
    const content = [];


    if (document.title) {
        content.push(`Page Title: ${document.title}`);
    }


    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        content.push(`Page Description: ${metaDesc.content}`);
    }


    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
        if (h.textContent.trim() && !h.closest('.wva-container')) {
            content.push(`${h.tagName}: ${h.textContent.trim()}`);
        }
    });


    const paragraphs = document.querySelectorAll('p, li');
    paragraphs.forEach(p => {
        if (p.textContent.trim().length > 30 && !p.closest('.wva-container')) {
            content.push(`Content: ${p.textContent.trim()}`);
        }
    });


    const formElements = document.querySelectorAll('label, input[placeholder], textarea[placeholder]');
    formElements.forEach(el => {
        if (el.textContent?.trim() || el.placeholder) {
            content.push(`Form: ${el.textContent?.trim() || el.placeholder}`);
        }
    });

    return content.join('\n').substring(0, contextSize || 5000);
}

if (typeof exports !== "undefined") {
    exports.extractPageContext = extractPageContext
}