import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const script = await readFile(new URL('../public/permalink-copy.js', import.meta.url), 'utf8');

function loadCopyScript({secureContext = true, writeText, execCommandResult = true, usePopupComponent = true} = {}) {
    let clickHandler = null;
    const appendedInputs = [];
    const removedInputs = [];
    const successMessages = [];
    const errorMessages = [];
    const popupShows = [];
    const statusClasses = new Set();

    const popupInput = {
        focused: false,
        selected: false,
        focus() {
            this.focused = true;
        },
        select() {
            this.selected = true;
        },
    };
    const popupStatus = {
        textContent: '',
        classList: {
            add(name) {
                statusClasses.add(name);
            },
            remove(...names) {
                for (const name of names) statusClasses.delete(name);
            },
        },
    };
    const popup = {
        style: {},
        querySelector(selector) {
            if (selector === '[data-permalink-value]') return popupInput;
            if (selector === '[data-permalink-status]') return popupStatus;
            return null;
        },
    };
    const popupComponent = {
        show(onComplete) {
            popupShows.push(popup);
            if (onComplete) onComplete();
        },
    };

    const document = {
        body: {
            appendChild(input) {
                appendedInputs.push(input);
            },
            removeChild(input) {
                removedInputs.push(input);
            },
        },
        addEventListener(eventName, handler) {
            if (eventName === 'click') clickHandler = handler;
        },
        createElement(tagName) {
            return {
                tagName,
                value: '',
                style: {},
                attributes: {},
                focused: false,
                selected: false,
                setAttribute(name, value) {
                    this.attributes[name] = value;
                },
                focus() {
                    this.focused = true;
                },
                select() {
                    this.selected = true;
                },
            };
        },
        execCommand(command) {
            assert.equal(command, 'copy');
            return execCommandResult;
        },
        getElementById(id) {
            return id === 'permalink-popup' ? popup : null;
        },
    };

    const window = {
        isSecureContext: secureContext,
        $events: {
            success(message) {
                successMessages.push(message);
            },
            error(message) {
                errorMessages.push(message);
            },
        },
    };
    if (usePopupComponent) {
        window.$components = {
            firstOnElement(element, name) {
                assert.equal(element, popup);
                assert.equal(name, 'popup');
                return popupComponent;
            },
        };
    }

    const navigator = {
        clipboard: writeText ? {writeText} : undefined,
    };

    vm.runInNewContext(script, {document, navigator, window});
    assert.equal(typeof clickHandler, 'function');

    return {
        appendedInputs,
        clickHandler,
        errorMessages,
        popup,
        popupInput,
        popupShows,
        popupStatus,
        removedInputs,
        statusClasses,
        successMessages,
    };
}

function createClick(url = 'https://bookstack.example/link/42') {
    let prevented = false;
    const trigger = {
        dataset: {
            copyPermalink: url,
            copyPopup: 'permalink-popup',
            copyPending: 'Copying',
            copySuccess: 'Copied',
            copyError: 'Copy failed',
        },
    };

    return {
        event: {
            target: {
                closest(selector) {
                    return selector === '[data-copy-permalink]' ? trigger : null;
                },
            },
            preventDefault() {
                prevented = true;
            },
        },
        wasPrevented() {
            return prevented;
        },
    };
}

test('copies a permalink and shows a confirmation popup', async () => {
    const copied = [];
    const loaded = loadCopyScript({
        writeText: async text => copied.push(text),
    });
    const click = createClick();

    await loaded.clickHandler(click.event);

    assert.equal(click.wasPrevented(), true);
    assert.deepEqual(copied, ['https://bookstack.example/link/42']);
    assert.deepEqual(loaded.popupShows, [loaded.popup]);
    assert.equal(loaded.popupInput.focused, true);
    assert.equal(loaded.popupInput.selected, true);
    assert.equal(loaded.popupStatus.textContent, 'Copied');
    assert.deepEqual([...loaded.statusClasses], ['text-pos']);
    assert.deepEqual(loaded.successMessages, ['Copied']);
    assert.deepEqual(loaded.errorMessages, []);
    assert.equal(loaded.appendedInputs.length, 0);
});

test('falls back when the Clipboard API rejects the write', async () => {
    const loaded = loadCopyScript({
        writeText: async () => {
            throw new Error('Permission denied');
        },
    });
    const click = createClick();

    await loaded.clickHandler(click.event);

    assert.equal(loaded.appendedInputs.length, 1);
    assert.equal(loaded.appendedInputs[0].tagName, 'textarea');
    assert.equal(loaded.appendedInputs[0].value, 'https://bookstack.example/link/42');
    assert.equal(loaded.appendedInputs[0].focused, true);
    assert.equal(loaded.appendedInputs[0].selected, true);
    assert.deepEqual(loaded.removedInputs, loaded.appendedInputs);
    assert.equal(loaded.popupStatus.textContent, 'Copied');
    assert.deepEqual(loaded.successMessages, ['Copied']);
    assert.deepEqual(loaded.errorMessages, []);
});

test('uses the fallback in an insecure context', async () => {
    let clipboardCalls = 0;
    const loaded = loadCopyScript({
        secureContext: false,
        writeText: async () => clipboardCalls++,
    });
    const click = createClick();

    await loaded.clickHandler(click.event);

    assert.equal(clipboardCalls, 0);
    assert.equal(loaded.appendedInputs.length, 1);
    assert.deepEqual(loaded.successMessages, ['Copied']);
});

test('shows the manual link and an error when both copy methods fail', async () => {
    const loaded = loadCopyScript({
        execCommandResult: false,
        writeText: async () => {
            throw new Error('Permission denied');
        },
    });
    const click = createClick();

    await loaded.clickHandler(click.event);

    assert.deepEqual(loaded.successMessages, []);
    assert.deepEqual(loaded.errorMessages, ['Copy failed']);
    assert.equal(loaded.popupStatus.textContent, 'Copy failed');
    assert.deepEqual([...loaded.statusClasses], ['text-neg']);
    assert.equal(loaded.popupInput.selected, true);
    assert.deepEqual(loaded.removedInputs, loaded.appendedInputs);
});

test('shows the popup without BookStack component helpers', async () => {
    const loaded = loadCopyScript({
        usePopupComponent: false,
        writeText: async () => {},
    });

    await loaded.clickHandler(createClick().event);

    assert.equal(loaded.popup.style.display, 'flex');
    assert.equal(loaded.popupInput.selected, true);
});

test('selects the displayed permalink when it is clicked', async () => {
    const loaded = loadCopyScript();
    let selected = false;

    await loaded.clickHandler({
        target: {
            closest(selector) {
                if (selector === '[data-permalink-value]') {
                    return {select: () => selected = true};
                }
                return null;
            },
        },
    });

    assert.equal(selected, true);
});

test('ignores clicks outside a permalink without assuming an Element target', async () => {
    const loaded = loadCopyScript();
    let prevented = false;

    await loaded.clickHandler({
        target: {nodeType: 3},
        preventDefault() {
            prevented = true;
        },
    });

    assert.equal(prevented, false);
    assert.deepEqual(loaded.successMessages, []);
    assert.deepEqual(loaded.errorMessages, []);
});
