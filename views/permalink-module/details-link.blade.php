@php
    $permalinkUrl = match ($entity->getType()) {
        'page' => url('/link/' . $entity->id),
        'book' => url('/link/book/' . $entity->id),
        'chapter' => url('/link/chapter/' . $entity->id),
        'bookshelf' => url('/link/shelf/' . $entity->id),
        default => null,
    };
@endphp

@if($permalinkUrl)
    <a href="{{ $permalinkUrl }}"
       class="entity-meta-item"
       data-copy-permalink="{{ $permalinkUrl }}"
       data-copy-success="{{ trans('permalinks.copied') }}"
       data-copy-error="{{ trans('permalinks.copy_failed') }}">
        @icon('link')
        <div>{{ trans('permalinks.label') }}</div>
    </a>

    @once
        @push('body-end')
            <script src="{{ url('/theme/' . \BookStack\Facades\Theme::getTheme() . '/permalink-copy.js') }}" nonce="{{ $cspNonce }}"></script>
        @endpush
    @endonce
@endif
