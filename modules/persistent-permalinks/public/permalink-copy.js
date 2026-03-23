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

    async function copyText(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(text);
            return;
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.value = text;
        input.setAttribute('readonly', 'readonly');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, input.value.length);

        const copied = document.execCommand('copy');
        document.body.removeChild(input);

        if (!copied) {
            throw new Error('Copy command failed');
        }
    }

    document.addEventListener('click', async function(event) {
        const link = event.target.closest('[data-copy-permalink]');
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
