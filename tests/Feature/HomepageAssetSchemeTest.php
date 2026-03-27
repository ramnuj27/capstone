<?php

test('homepage generates secure asset URLs behind forwarded https proxies', function (): void {
    config()->set('app.asset_url', null);

    $response = $this
        ->withServerVariables([
            'HTTP_HOST' => 'capstone-production-54b4.up.railway.app',
            'HTTP_X_FORWARDED_HOST' => 'capstone-production-54b4.up.railway.app',
            'HTTP_X_FORWARDED_PORT' => '443',
            'HTTP_X_FORWARDED_PROTO' => 'https',
            'HTTPS' => 'off',
            'SERVER_PORT' => '80',
            'REMOTE_ADDR' => '10.0.0.10',
        ])
        ->get('/');

    $response
        ->assertOk()
        ->assertSee('https://capstone-production-54b4.up.railway.app/build/assets/', false)
        ->assertDontSee('http://capstone-production-54b4.up.railway.app/build/assets/', false);
});
