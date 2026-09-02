(function() {
    function notifySuccess(message) {
        if (window.$events && typeof window.$events.success === 'function') {
            window.$events.success(message);
        }
    }

    function notifyError(message) {
        if (window.$events && typeof window.$events.error === 'function') {
            window.$events.error(message);
        }
    }

    function copyTextFallback(text, clipboardError) {
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', 'readonly');
        input.setAttribute('aria-hidden', 'true');
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        input.style.top = '0';
        document.body.appendChild(input);

        try {
            input.focus();
            input.select();

            if (!document.execCommand('copy')) {
                throw clipboardError || new Error('Copy command failed');
            }
        } finally {
            document.body.removeChild(input);
        }
    }

    async function copyText(text) {
        let clipboardError = null;

        if (window.isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch (error) {
                clipboardError = error;
            }
        }

        copyTextFallback(text, clipboardError);
    }

    function getPopupComponent(popup) {
        if (!popup || !window.$components || typeof window.$components.firstOnElement !== 'function') {
            return null;
        }

        return window.$components.firstOnElement(popup, 'popup');
    }

    function showPopup(trigger) {
        const popup = document.getElementById(trigger.dataset.copyPopup || '');
        if (!popup) {
            return null;
        }
        if (typeof popup.contains === 'function' && popup.contains(trigger)) {
            return popup;
        }

        const focusLink = function() {
            const input = popup.querySelector('[data-permalink-value]');
            if (input) {
                input.focus();
                input.select();
            }
        };
        const component = getPopupComponent(popup);

        if (component && typeof component.show === 'function') {
            component.show(focusLink);
        } else {
            popup.style.display = 'flex';
            focusLink();
        }

        return popup;
    }

    function updateStatus(popup, message, success) {
        if (!popup) {
            return;
        }

        const status = popup.querySelector('[data-permalink-status]');
        if (!status) {
            return;
        }

        status.textContent = message;
        status.classList.remove('text-pos', 'text-neg');
        if (success !== null) {
            status.classList.add(success ? 'text-pos' : 'text-neg');
        }
    }

    document.addEventListener('click', async function(event) {
        const target = event.target;
        const trigger = target && typeof target.closest === 'function'
            ? target.closest('[data-copy-permalink]')
            : null;

        if (trigger) {
            event.preventDefault();

            const url = trigger.dataset.copyPermalink || '';
            const copyOperation = copyText(url);
            const popup = showPopup(trigger);
            updateStatus(popup, trigger.dataset.copyPending || 'Copying permalink…', null);

            try {
                await copyOperation;
                const message = trigger.dataset.copySuccess || 'Permalink copied';
                updateStatus(popup, message, true);
                notifySuccess(message);
            } catch (error) {
                const message = trigger.dataset.copyError || 'Could not copy permalink';
                updateStatus(popup, message, false);
                notifyError(message);
            }

            return;
        }

        const manualInput = target && typeof target.closest === 'function'
            ? target.closest('[data-permalink-value]')
            : null;
        if (manualInput) {
            manualInput.select();
            return;
        }

        const closeButton = target && typeof target.closest === 'function'
            ? target.closest('[data-permalink-popup-close]')
            : null;
        if (closeButton) {
            const popup = closeButton.closest('.popup-background');
            if (popup && !getPopupComponent(popup)) {
                popup.style.display = 'none';
            }
        }
    });
})();
