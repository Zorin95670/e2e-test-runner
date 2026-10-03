const { expect } = require('@playwright/test');
const path = require('path');
const { Given, Then, When } = require('../fixtures');
const { render } = require('../../../core/utils');

const ROOT_DIR = path.resolve(__dirname, '../../..');

// Cypress special character sequences supported in typed text, e.g. "my text{enter}".
const SPECIAL_KEYS = {
    '{': '{',
    enter: 'Enter',
    esc: 'Escape',
    backspace: 'Backspace',
    del: 'Delete',
    tab: 'Tab',
    selectall: 'ControlOrMeta+a',
    uparrow: 'ArrowUp',
    downarrow: 'ArrowDown',
    leftarrow: 'ArrowLeft',
    rightarrow: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageup: 'PageUp',
    pagedown: 'PageDown',
};

// Cypress `scrollTo` positions, as ratios of the scrollable size.
const SCROLL_POSITIONS = {
    topLeft: [0, 0],
    top: [0.5, 0],
    topRight: [1, 0],
    left: [0, 0.5],
    center: [0.5, 0.5],
    right: [1, 0.5],
    bottomLeft: [0, 1],
    bottom: [0.5, 1],
    bottomRight: [1, 1],
};

function locate(page, world, templatedSelector) {
    return page.locator(render(templatedSelector, world));
}

async function typeText(locator, text) {
    const parts = text.split(/(\{[^}]+\})/).filter((part) => part !== '');

    await locator.click();

    for (const part of parts) {
        const key = SPECIAL_KEYS[part.slice(1, -1)];

        if (part.startsWith('{') && key) {
            await locator.press(key);
        } else {
            await locator.pressSequentially(part);
        }
    }
}

async function dragBy(page, locator, x, y) {
    const box = await locator.boundingBox();
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + x, startY + y, { steps: 10 });
    await page.mouse.up();
}

// Equivalent of jQuery `width()`/`height()` (content size) and `position()` used by Cypress.
function getBox(locator) {
    return locator.first().evaluate((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const px = (name) => parseFloat(style[name]) || 0;

        return {
            width: rect.width - px('paddingLeft') - px('paddingRight') - px('borderLeftWidth') - px('borderRightWidth'),
            height: rect.height - px('paddingTop') - px('paddingBottom') - px('borderTopWidth') - px('borderBottomWidth'),
            left: el.offsetLeft - px('marginLeft'),
            top: el.offsetTop - px('marginTop'),
        };
    });
}

When('I click on {string}', async ({ page, world }, templatedSelector) => {
    await locate(page, world, templatedSelector).click();
});

When('I force click on {string}', async ({ page, world }, templatedSelector) => {
    await locate(page, world, templatedSelector).click({ force: true });
});

When('I double click on {string}', async ({ page, world }, templatedSelector) => {
    await locate(page, world, templatedSelector).dblclick();
});

When('I scroll to {string} into {string}', async ({ page, world }, position, templatedSelector) => {
    const ratios = SCROLL_POSITIONS[position];

    if (!ratios) {
        throw new Error(`Unknown scroll position "${position}". Available positions: ${Object.keys(SCROLL_POSITIONS).join(', ')}`);
    }

    await locate(page, world, templatedSelector).evaluate((el, [x, y]) => {
        el.scrollTo((el.scrollWidth - el.clientWidth) * x, (el.scrollHeight - el.clientHeight) * y);
    }, ratios);
});

When('I hover {string} to make it visible', async ({ page, world }, templatedSelector) => {
    const locator = locate(page, world, templatedSelector);

    // Same as jQuery `show()` used by Cypress.
    await locator.evaluate((el) => {
        el.style.display = '';

        if (getComputedStyle(el).display === 'none') {
            el.style.display = 'block';
        }
    });
    await expect(locator).toBeVisible();
});

When('I drag {string} onto {string}', async ({ page, world }, templatedOriginSelector, templatedDestinationSelector) => {
    const origin = locate(page, world, templatedOriginSelector);
    const destination = locate(page, world, templatedDestinationSelector);

    await origin.dragTo(destination, { force: true });
});

When('I drag {string} of {int},{int}', async ({ page, world }, templatedSelector, x, y) => {
    await dragBy(page, locate(page, world, templatedSelector), x, y);
});

When('I select {string} in {string}', async ({ page, world }, templatedOption, templatedSelector) => {
    await locate(page, world, templatedSelector).click({ force: true });
    await locate(page, world, templatedOption).click({ force: true });
    await page.waitForTimeout(500);
});

When('I move {string} of {int},{int}', async ({ page, world }, templatedSelector, x, y) => {
    await dragBy(page, locate(page, world, templatedSelector), x, y);
});

Then('I expect the HTML element {string} exists', async ({ page, world }, templatedSelector) => {
    await expect(locate(page, world, templatedSelector).first()).toBeAttached();
});

Then('I expect the HTML element {string} not exists', async ({ page, world }, templatedSelector) => {
    await expect(locate(page, world, templatedSelector)).toHaveCount(0, { timeout: 60000 });
});

Then('I expect the HTML element {string} to be visible', async ({ page, world }, templatedSelector) => {
    await expect(locate(page, world, templatedSelector).first()).toBeVisible();
});

Then('I expect the HTML element {string} to be hidden', async ({ page, world }, templatedSelector) => {
    const locator = locate(page, world, templatedSelector).first();

    // As with Cypress, the element must exist.
    await expect(locator).toBeAttached();
    await expect(locator).toBeHidden();
});

Then('I expect the HTML element {string} to be disabled', async ({ page, world }, templatedSelector) => {
    await expect(locate(page, world, templatedSelector).first()).toBeDisabled();
});

Then('I expect the HTML element {string} to be enabled', async ({ page, world }, templatedSelector) => {
    await expect(locate(page, world, templatedSelector).first()).toBeEnabled();
});

// `:checked` matches like jQuery used by Cypress: any element that is not a checked input/option is "not checked".
function isChecked(locator) {
    return locator.first().evaluate((el) => el.matches(':checked'));
}

Then('I expect the HTML element {string} is checked', async ({ page, world }, templatedSelector) => {
    const locator = locate(page, world, templatedSelector);

    await expect.poll(() => isChecked(locator)).toBe(true);
});

Then('I expect the HTML element {string} is not checked', async ({ page, world }, templatedSelector) => {
    const locator = locate(page, world, templatedSelector);

    await expect.poll(() => isChecked(locator)).toBe(false);
});

Then('I expect the HTML element {string} width is {int}', async ({ page, world }, templatedSelector, width) => {
    const locator = locate(page, world, templatedSelector);

    await expect.poll(async () => Math.trunc((await getBox(locator)).width)).toBe(width);
});

Then('I expect the HTML element {string} height is {int}', async ({ page, world }, templatedSelector, height) => {
    const locator = locate(page, world, templatedSelector);

    await expect.poll(async () => Math.trunc((await getBox(locator)).height)).toBe(height);
});

Then('I expect the HTML element {string} to be at position {int},{int}', async ({ page, world }, templatedSelector, x, y) => {
    const locator = locate(page, world, templatedSelector);

    await expect.poll(async () => {
        const { left, top } = await getBox(locator);

        return [Math.trunc(left), Math.trunc(top)];
    }).toEqual([x, y]);
});

Then('I expect the HTML element {string} to have attribute {string} with value {string}', async ({ page, world }, templatedSelector, templatedAttribute, templatedValue) => {
    const attribute = render(templatedAttribute, world);
    const value = render(templatedValue, world);

    await expect(locate(page, world, templatedSelector).first()).toHaveAttribute(attribute, value);
});

Then('I expect the HTML element {string} contains {string}', async ({ page, world }, templatedSelector, templatedValue) => {
    const value = render(templatedValue, world);

    await expect(locate(page, world, templatedSelector).first()).toContainText(value);
});

Then('I expect the HTML element {string} not contains {string}', async ({ page, world }, templatedSelector, templatedValue) => {
    const value = render(templatedValue, world);

    await expect(locate(page, world, templatedSelector).first()).not.toContainText(value);
});

Then('I expect the HTML element {string} to have value {string}', async ({ page, world }, templatedSelector, templatedValue) => {
    const value = render(templatedValue, world);

    await expect(locate(page, world, templatedSelector).first()).toHaveValue(value);
});

Then('I expect the HTML element {string} appear {int} time(s) on screen', async ({ page, world }, templatedSelector, count) => {
    await expect(locate(page, world, templatedSelector)).toHaveCount(count);
});

Then('I clear the text in the HTML element {string}', async ({ page, world }, templatedSelector) => {
    await locate(page, world, templatedSelector).fill('');
});

Then('I set the text {string} in the HTML element {string}', async ({ page, world }, templatedValue, templatedSelector) => {
    const locator = locate(page, world, templatedSelector);

    await locator.fill('');
    await typeText(locator, render(templatedValue, world));
});

Given('I set the viewport size to {int} px by {int} px', async ({ page }, width, height) => {
    await page.setViewportSize({ width, height });
});

// File paths are relative to the runner directory, like Cypress `selectFile`.
When('I set file input {string} with file(s) {string}', async ({ page, world }, templatedSelector, templatedFilePaths) => {
    const filePaths = render(templatedFilePaths, world)
        .split(',')
        .map((filePath) => path.resolve(ROOT_DIR, filePath.trim()));

    await locate(page, world, templatedSelector).setInputFiles(filePaths);
});
