<?php

use Inertia\Testing\AssertableInertia as Assert;

test('login screen does not share google login controls even when providers are configured', function () {
    config()->set('services.google.client_id', 'google-client-id');
    config()->set('services.google.client_secret', 'google-client-secret');
    config()->set('services.google.redirect', 'http://localhost:8000/auth/google/callback');
    config()->set('services.firebase.api_key', 'firebase-api-key');
    config()->set('services.firebase.project_id', 'capstone-8fd09');
    config()->set('services.firebase.auth_domain', 'capstone-8fd09.firebaseapp.com');
    config()->set('services.firebase.storage_bucket', 'capstone-8fd09.firebasestorage.app');
    config()->set('services.firebase.messaging_sender_id', '567528507354');
    config()->set('services.firebase.app_id', '1:567528507354:web:c04159c81744854366a2e3');

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->missing('canUseGoogleLogin')
            ->missing('googleLoginDriver')
            ->etc(),
        );
});

test('guests are sent back to login when hitting the google redirect route', function () {
    $this->get(route('auth.google.redirect'))
        ->assertRedirect(route('login', absolute: false))
        ->assertSessionHas('status', 'Google sign-in is not available right now.');
});

test('guests are sent back to login when hitting the google callback route', function () {
    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('login', absolute: false))
        ->assertSessionHas('status', 'Google sign-in is not available right now.');
});

test('guests are sent back to login when hitting the firebase google route', function () {
    $this->post(route('auth.google.firebase'), [
        'id_token' => 'test-token',
    ])
        ->assertRedirect(route('login', absolute: false))
        ->assertSessionHas('status', 'Google sign-in is not available right now.');
});
