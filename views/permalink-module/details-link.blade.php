@php
    $permalinkUrl = match ($entity->getType()) {
        'page' => url('/link/' . $entity->id),
        'book' => url('/link/book/' . $entity->id),
        'chapter' => url('/link/chapter/' . $entity->id),
        'bookshelf' => url('/link/shelf/' . $entity->id),
        default => null,
    };
    $popupId = $permalinkUrl ? 'permalink-copy-popup-' . $entity->getType() . '-' . $entity->id : null;
@endphp

@if($permalinkUrl)
    <button type="button"
            class="entity-meta-item permalink-copy-trigger"
            data-copy-permalink="{{ $permalinkUrl }}"
            data-copy-popup="{{ $popupId }}"
            data-copy-pending="{{ trans('permalinks.copying') }}"
            data-copy-success="{{ trans('permalinks.copied') }}"
            data-copy-error="{{ trans('permalinks.copy_failed') }}"
            aria-haspopup="dialog"
            aria-controls="{{ $popupId }}">
        @icon('link')
        <span>{{ trans('permalinks.label') }}</span>
    </button>

    <div component="popup"
         id="{{ $popupId }}"
         class="popup-background"
         role="dialog"
         aria-modal="true"
         aria-labelledby="{{ $popupId }}-title">
        <div class="popup-body very-small" tabindex="-1">
            <div class="popup-header primary-background">
                <div id="{{ $popupId }}-title" class="popup-title">{{ trans('permalinks.popup_title') }}</div>
                <button refs="popup@hide"
                        data-permalink-popup-close
                        type="button"
                        class="popup-header-close"
                        title="{{ trans('common.close') }}"
                        aria-label="{{ trans('common.close') }}">@icon('close')</button>
            </div>

            <div class="popup-content px-m py-m">
                <p class="permalink-copy-status" data-permalink-status role="status" aria-live="polite">
                    {{ trans('permalinks.copying') }}
                </p>

                <div class="form-group mb-none">
                    <label for="{{ $popupId }}-value">{{ trans('permalinks.manual_copy') }}</label>
                    <input id="{{ $popupId }}-value"
                           class="input-fill-width permalink-copy-value"
                           data-permalink-value
                           type="text"
                           value="{{ $permalinkUrl }}"
                           readonly>
                </div>
            </div>

            <div class="popup-footer">
                <button type="button"
                        data-copy-permalink="{{ $permalinkUrl }}"
                        data-copy-popup="{{ $popupId }}"
                        data-copy-pending="{{ trans('permalinks.copying') }}"
                        data-copy-success="{{ trans('permalinks.copied') }}"
                        data-copy-error="{{ trans('permalinks.copy_failed') }}">
                    {{ trans('permalinks.copy_again') }}
                </button>
                <button refs="popup@hide" data-permalink-popup-close type="button">
                    {{ trans('common.close') }}
                </button>
            </div>
        </div>
    </div>

    @once
        @push('head')
            <style data-permalink-copy-style nonce="{{ $cspNonce }}">
                {!! file_get_contents(\BookStack\Facades\Theme::findFirstFile('public/permalink-copy.css')) !!}
            </style>
        @endpush
        @push('body-end')
            <script data-permalink-copy-script nonce="{{ $cspNonce }}">
                {!! file_get_contents(\BookStack\Facades\Theme::findFirstFile('public/permalink-copy.js')) !!}
            </script>
        @endpush
    @endonce
@endif
