<?php

namespace Tests\Theme;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class PersistentPermalinksIntegrationTest extends TestCase
{
    public function test_permalink_rows_and_script_render_for_all_supported_entity_types(): void
    {
        $this->withPersistentPermalinksModule(function (): void {
            $entities = [
                [$this->entities->page(), fn ($entity) => url('/link/' . $entity->id)],
                [$this->entities->book(), fn ($entity) => url('/link/book/' . $entity->id)],
                [$this->entities->chapter(), fn ($entity) => url('/link/chapter/' . $entity->id)],
                [$this->entities->shelf(), fn ($entity) => url('/link/shelf/' . $entity->id)],
            ];

            foreach ($entities as [$entity, $expectedUrl]) {
                $response = $this->asAdmin()->get($entity->getUrl());
                $response->assertOk();

                $url = $expectedUrl($entity);
                $html = $this->withHtml($response);
                $html->assertElementExists('a.entity-meta-item[data-copy-permalink="' . $url . '"]');
                $html->assertElementExists('script[src*="/theme/"][src$="/permalink-copy.js?v=1.1.0"][nonce]');
            }
        });
    }

    public function test_custom_permalink_routes_redirect_to_current_entity_urls(): void
    {
        $this->withPersistentPermalinksModule(function (): void {
            $book = $this->entities->book();
            $chapter = $this->entities->chapter();
            $shelf = $this->entities->shelf();

            $this->asAdmin()->get('/link/book/' . $book->id)->assertRedirect($book->getUrl());
            $this->asAdmin()->get('/link/chapter/' . $chapter->id)->assertRedirect($chapter->getUrl());
            $this->asAdmin()->get('/link/shelf/' . $shelf->id)->assertRedirect($shelf->getUrl());
        });
    }

    protected function withPersistentPermalinksModule(callable $callback): void
    {
        $this->usingThemeFolder(function () use ($callback): void {
            $modulePath = theme_path('modules/persistent-permalinks');
            File::ensureDirectoryExists(dirname($modulePath));
            File::copyDirectory(base_path('themes/persistent-permalinks'), $modulePath);

            $this->refreshApplication();
            $this->artisan('view:clear');

            $callback();
        });
    }
}
