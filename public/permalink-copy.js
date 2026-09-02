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

    document.addEventListener('click', async function(event) {
        const target = event.target;
        const link = target && typeof target.closest === 'function'
            ? target.closest('[data-copy-permalink]')
            : null;

        if (!link) {
            return;
        }

        event.preventDefault();

        try {
            await copyText(link.dataset.copyPermalink || '');
            notifySuccess(link.dataset.copySuccess || 'Permalink copied');
        } catch (error) {
            notifyError(link.dataset.copyError || 'Could not copy permalink');
        }
    });
})();
