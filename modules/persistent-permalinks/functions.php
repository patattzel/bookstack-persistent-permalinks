<?php

use BookStack\Entities\Queries\BookQueries;
use BookStack\Entities\Queries\BookshelfQueries;
use BookStack\Entities\Queries\ChapterQueries;
use BookStack\Facades\Theme;
use BookStack\Theming\ThemeEvents;
use Illuminate\Routing\Router;

Theme::listen(ThemeEvents::ROUTES_REGISTER_WEB_AUTH, function (Router $router) {
    $router->get('/link/book/{id}', function (int $id) {
        $book = app(BookQueries::class)->findVisibleByIdOrFail($id);
        return redirect($book->getUrl());
    });

    $router->get('/link/chapter/{id}', function (int $id) {
        $chapter = app(ChapterQueries::class)->findVisibleByIdOrFail($id);
        return redirect($chapter->getUrl());
    });

    $router->get('/link/shelf/{id}', function (int $id) {
        $shelf = app(BookshelfQueries::class)->findVisibleByIdOrFail($id);
        return redirect($shelf->getUrl());
    });
});
