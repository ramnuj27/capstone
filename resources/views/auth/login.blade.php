@extends('layouts.app')

@section('title', 'Login - EVAQReady')
@section('content')
<div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-700 via-blue-700 to-blue-600">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-subtle-float">
        <div class="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p class="text-sm text-slate-600 mt-2">Sign in to your EVAQReady account</p>
        </div>

        <div class="p-6 md:p-8 space-y-6">
            <form method="POST" action="{{ route('login') }}">
                @csrf

                <div class="space-y-2">
                    <label for="email" class="block text-sm font-medium text-slate-800">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value="{{ old('email') }}"
                        required
                        autofocus
                        autocomplete="username"
                        placeholder="name@example.com"
                        class="w-full h-11 rounded-xl border @error('email') border-red-400 @else border-slate-200 @enderror bg-white px-4 text-slate-900 focus:outline-none focus:ring-2 @error('email') focus:ring-red-200 @else focus:ring-blue-200 @enderror focus:border-blue-400"
                    >
                    @error('email')
                        <p class="text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="space-y-2">
                    <label for="password" class="block text-sm font-medium text-slate-800">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        autocomplete="current-password"
                        placeholder="Enter password"
                        class="w-full h-11 rounded-xl border @error('password') border-red-400 @else border-slate-200 @enderror bg-white px-4 text-slate-900 focus:outline-none focus:ring-2 @error('password') focus:ring-red-200 @else focus:ring-blue-200 @enderror focus:border-blue-400"
                    >
                    @error('password')
                        <p class="text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="flex items-center gap-3 mt-2">
                    <input id="remember" type="checkbox" name="remember" class="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200">
                    <label for="remember" class="text-sm font-medium text-slate-800">Remember me</label>
                </div>

                <button
                    id="login-submit-btn"
                    type="submit"
                    class="w-full mt-6 py-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-lg rounded-2xl shadow-sm transition"
                >
                    <span id="login-submit-text">Sign In</span>
                    <span
                        id="login-submit-spinner"
                        class="hidden ml-3 inline-block h-4 w-4 rounded-full border-2 border-white/70 border-t-white animate-spin align-middle"
                        aria-hidden="true"
                    ></span>
                </button>
            </form>

            <div class="text-center pt-2">
                <a href="{{ route('register') }}" class="text-sm font-semibold text-blue-700 hover:underline">Don't have an account? Register</a>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const formEl = document.querySelector('form[action="{{ route('login') }}"]');
        const submitBtn = document.getElementById('login-submit-btn');
        const submitText = document.getElementById('login-submit-text');
        const submitSpinner = document.getElementById('login-submit-spinner');

        if (!formEl || !submitBtn || !submitText || !submitSpinner) return;

        formEl.addEventListener('submit', function () {
            submitBtn.disabled = true;
            submitText.textContent = 'Signing in...';
            submitSpinner.classList.remove('hidden');
            submitBtn.classList.add('opacity-90', 'cursor-not-allowed');
        }, { once: true });
    });
</script>
@endsection
