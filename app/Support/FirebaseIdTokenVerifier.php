<?php

namespace App\Support;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Http;
use stdClass;
use Throwable;

class FirebaseIdTokenVerifier
{
    /**
     * @return array{email: string, firebase_uid: string, google_id: string, name: string|null}|null
     */
    public function verify(string $idToken): ?array
    {
        $projectId = config('services.firebase.project_id');

        if (! filled($projectId)) {
            return null;
        }

        $decodedToken = $this->decodeToken($idToken);

        if (! $decodedToken instanceof stdClass && $this->allowsUnverifiedLocalTokens()) {
            $decodedToken = $this->decodeTokenWithoutVerification($idToken);
        }

        if (! $decodedToken instanceof stdClass) {
            return null;
        }

        if (($decodedToken->aud ?? null) !== $projectId) {
            return null;
        }

        if (($decodedToken->iss ?? null) !== "https://securetoken.google.com/{$projectId}") {
            return null;
        }

        $firebaseUid = $decodedToken->user_id ?? $decodedToken->sub ?? null;
        $email = $decodedToken->email ?? null;
        $emailVerified = $decodedToken->email_verified ?? false;
        $name = $decodedToken->name ?? null;
        $firebaseClaims = $this->normalizeArray($decodedToken->firebase ?? null);
        $signInProvider = $firebaseClaims['sign_in_provider'] ?? null;

        if (! filled($firebaseUid) || ! filled($email) || $emailVerified !== true) {
            return null;
        }

        if ($signInProvider !== 'google.com') {
            return null;
        }

        $googleId = $this->extractGoogleIdentity($firebaseClaims, (string) $firebaseUid);

        return [
            'email' => (string) $email,
            'firebase_uid' => (string) $firebaseUid,
            'google_id' => $googleId,
            'name' => filled($name) ? (string) $name : null,
        ];
    }

    private function allowsUnverifiedLocalTokens(): bool
    {
        return (bool) config('firebase.allow_unverified_local_tokens', false);
    }

    private function decodeToken(string $idToken): ?stdClass
    {
        try {
            JWT::$leeway = 60;

            return JWT::decode($idToken, $this->publicKeys());
        } catch (Throwable) {
            return null;
        }
    }

    private function decodeTokenWithoutVerification(string $idToken): ?stdClass
    {
        try {
            $segments = explode('.', $idToken);

            if (count($segments) !== 3) {
                return null;
            }

            $payload = JWT::jsonDecode(JWT::urlsafeB64Decode($segments[1]));

            if (is_array($payload)) {
                $payload = (object) $payload;
            }

            return $payload instanceof stdClass ? $payload : null;
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return array<string, Key>
     */
    private function publicKeys(): array
    {
        $certificates = array_replace(
            config('firebase.cached_public_keys', []),
            $this->fetchLiveCertificates(),
        );

        $keys = [];

        foreach ($certificates as $keyId => $certificate) {
            if (! is_string($keyId) || ! is_string($certificate) || trim($certificate) === '') {
                continue;
            }

            $keys[$keyId] = new Key($certificate, 'RS256');
        }

        return $keys;
    }

    /**
     * @return array<string, string>
     */
    private function fetchLiveCertificates(): array
    {
        try {
            $response = Http::acceptJson()
                ->timeout(3)
                ->get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        } catch (Throwable) {
            return [];
        }

        if ($response->failed()) {
            return [];
        }

        $certificates = $response->json();

        return is_array($certificates) ? $certificates : [];
    }

    /**
     * @param  array<string, mixed>  $firebaseClaims
     */
    private function extractGoogleIdentity(array $firebaseClaims, string $fallback): string
    {
        $identities = $this->normalizeArray($firebaseClaims['identities'] ?? null);
        $googleIdentities = $identities['google.com'] ?? null;

        if (is_array($googleIdentities) && filled($googleIdentities[0] ?? null)) {
            return (string) $googleIdentities[0];
        }

        return $fallback;
    }

    /**
     * @return array<string, mixed>
     */
    private function normalizeArray(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if ($value instanceof stdClass) {
            return (array) $value;
        }

        return [];
    }
}
