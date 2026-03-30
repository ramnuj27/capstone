<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return $this->redirectToLogin();
    }

    public function callback(): RedirectResponse
    {
        return $this->redirectToLogin();
    }

    public function firebaseLogin(): RedirectResponse
    {
        return $this->redirectToLogin();
    }

    private function redirectToLogin(): RedirectResponse
    {
        return redirect()
            ->to(route('login', absolute: false))
            ->with('status', 'Google sign-in is not available right now.');
    }
}
