const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('https://tousatable-madeinnormandie.fr/#gallery');
    await new Promise(r => setTimeout(r, 3000)); // wait for 1.5s popup delay + animation

    // Evaluate in page context
    await page.evaluate(async () => {
        console.log('Finding and clicking Newsletter trigger...');
        // The trigger is often in the footer.
        // If not found, we can just render the modal by interacting or dispatching event
        // Let's find any button with "newsletter"
        const btns = Array.from(document.querySelectorAll('button, a, span'));
        const newsletterBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('newsletter'));
        if (newsletterBtn) {
            newsletterBtn.click();
            console.log('Clicked newsletter button');
        } else {
            console.log('Could not find newsletter trigger by text');
            // Try specific known selector if possible, or force open
            // but we don't have a global to force open it.
            // Let's click the "Continuer" button if the popup is already open
            // Wait, the popup might open automatically after scrolling!
        }
    });

    // Let's scroll down to trigger automatic popup
    await page.evaluate(() => window.scrollBy(0, 5000));
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
        const input = document.querySelector('input[name="contact"]');
        if (input) {
            input.value = 'test@example.com';
            const nextBtn = document.querySelector('button[type="submit"]');
            if (nextBtn) {
                nextBtn.click();
                console.log('Clicked next');
            }
        }
    });

    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
        const fName = document.querySelector('input[name="firstName"]');
        const lName = document.querySelector('input[name="lastName"]');
        if (fName && lName) {
            fName.value = 'John';
            lName.value = 'Doe';
            const nextBtn = document.querySelector('button[type="submit"]');
            if (nextBtn) {
                nextBtn.click();
                console.log('Clicked submit');
            }
        }
    });

    // Wait for the submit to process (which fails due to Firebase, so confetti won't trigger anyway!)
    await new Promise(r => setTimeout(r, 3000));

    // FORCE CONFETTI MANUALLY TO SEE IF IT BREAKS
    console.log("Forcing confetti manually via window object or simulating inside page");
    await page.evaluate(() => {
        // Try calling the function directy if bound to DOM? We cannot.
        // Instead let's just evaluate the EXACT confetti code from NewsletterModal:
    });

    await browser.close();
})();
