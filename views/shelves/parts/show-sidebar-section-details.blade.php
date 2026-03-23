<div id="details" class="mb-xl">
    <h5>{{ trans('common.details') }}</h5>
    <div class="blended-links">
        @include('entities.meta', ['entity' => $shelf, 'watchOptions' => null])
        @include('permalink-module.details-link', ['entity' => $shelf])
        @if($shelf->hasPermissions())
            <div class="active-restriction">
                @if(userCan(\BookStack\Permissions\Permission::RestrictionsManage, $shelf))
                    <a href="{{ $shelf->getUrl('/permissions') }}" class="entity-meta-item">
                        @icon('lock')
                        <div>{{ trans('entities.shelves_permissions_active') }}</div>
                    </a>
                @else
                    <div class="entity-meta-item">
                        @icon('lock')
                        <div>{{ trans('entities.shelves_permissions_active') }}</div>
                    </div>
                @endif
            </div>
        @endif
    </div>
</div>
