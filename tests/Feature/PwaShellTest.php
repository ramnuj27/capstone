<?php

test('application shell exposes pwa metadata', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertSee('manifest.webmanifest', false)
        ->assertSee('name="theme-color"', false)
        ->assertSee('name="mobile-web-app-capable"', false)
        ->assertSee('name="apple-mobile-web-app-capable"', false);
});

test('pwa public assets are available in the project', function () {
    expect(public_path('manifest.webmanifest'))->toBeFile();
    expect(public_path('offline.html'))->toBeFile();
    expect(public_path('sw.js'))->toBeFile();
    expect(public_path('pwa-192x192.png'))->toBeFile();
    expect(public_path('pwa-512x512.png'))->toBeFile();
});
