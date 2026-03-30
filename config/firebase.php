<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Local Development Fallback
    |--------------------------------------------------------------------------
    |
    | Some local XAMPP / Windows environments cannot open outbound HTTPS
    | connections to Google's token verification endpoints. When this flag is
    | enabled, the app may accept Firebase Google ID token claims without the
    | signature check as a local-development fallback only.
    |
    */

    'allow_unverified_local_tokens' => (bool) env('FIREBASE_ALLOW_UNVERIFIED_LOCAL_TOKENS', false),

    /*
    |--------------------------------------------------------------------------
    | Cached Firebase Public Keys
    |--------------------------------------------------------------------------
    |
    | These certificates are used as a fallback when the local PHP runtime
    | cannot reach Google's public key endpoint. Firebase rotates these keys
    | periodically, so the app will prefer the live endpoint whenever it is
    | reachable and fall back to the cached set only when needed.
    |
    */

    'cached_public_keys' => [
        '732ca96713b1dd172385084ce9f4381ad00cece4' => <<<'CERT'
-----BEGIN CERTIFICATE-----
MIIDHDCCAgSgAwIBAgIIaaHiOfVOKI0wDQYJKoZIhvcNAQEFBQAwMTEvMC0GA1UE
Awwmc2VjdXJldG9rZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wHhcNMjYw
MzEzMjAzNzQ2WhcNMjYwMzMwMDg1MjQ2WjAxMS8wLQYDVQQDDCZzZWN1cmV0b2tl
bi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTCCASIwDQYJKoZIhvcNAQEFBQAD
ggEPADCCAQoCggEBAOzVnYodl48T01v4dax7UqSnTRV83nhp/T73CWU696FyOkQC
ZPEy09SPkv54R8yhAcCGpOa8vQaeTEfF6yYDvNWRvdoVjgXbLmWSzlAQBznOT6n+
sEyFg1Or19J6rOV8rl1iRVapRK3+aD0zpIsB0vyaGs6YqJIyqHRk98xoEE1gW6q1
QGkVx0oOf+v/iydr8+mvLmWJmJ1571FSQAuGX6Jh3fcBye2e1rHJ7BAXc38Xhpsk
YmdneSyxpd/8/HK/5vIJZ84wwBu5mjQe7/QONjo4zpYkKe+UYw8dbORzvdG5U2uv
9u6VnTaYWEiJ0WvcL67VGctw9BcR0OEvEjEuOHUCAwEAAaM4MDYwDAYDVR0TAQH/
BAIwADAOBgNVHQ8BAf8EBAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwIwDQYJ
KoZIhvcNAQEFBQADggEBAA+snTU4YxppfEL4l9WOyZCPu2tck+HP9uhMe127rra5
SPxQOvC8sAY1NRcVqCSvLt+USSkLKRuUzcRVxJ16IwSzjBzfAUZYSnIEb6du3/Ry
D9FYlsIbcQHp0KWuIqhljgVgXSeDPN09Ts95VdqbwnWC3cYBTYqSAJdl2a0ArDWG
8xcRdT5EHYXR3tInqZQAW0qem7OejbH6Va/d7qLoNEHwWeMjdB9pbukusMPZTsBO
GCqDTjtd7ik6f4QSAmkoXHNNfEnX1aV4opkscTBSEnV9T4+O7vzj2JmevPffTD5w
bTb8fwnzJU6M0DdufVrHz3C/5rP04YaLvL6Q3cwc4qQ=
-----END CERTIFICATE-----
CERT,
        'a2dfb8a38b52d9f09edcaa5070a0e8f0a9e098ba' => <<<'CERT'
-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJAMQDIzsu2k/BMA0GCSqGSIb3DQEBBQUAMDExLzAtBgNV
Awwmc2VjdXJldG9rZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wHhcNMjYw
MzA1MjAzNzQ1WhcNMjYwMzIyMDg1MjQ1WjAxMS8wLQYDVQQDDCZzZWN1cmV0b2tl
bi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTCCASIwDQYJKoZIhvcNAQEFBQAD
ggEPADCCAQoCggEBAQDDUlu3xCyvq4FEjhdspli4h32LDvYiJgDR+73Lt99uvsrV
2rMoGb7aj8+IM+Fjg2cej6ETRmMtmMnqo8g6+0PWwm/zYuIU/lU63xg2Log2jsir
mix2MOsO28T0Ps/C+npsvaforX00Kbl2vJFqCXE7GFUNbZyTCyBfXWaT3jQbfswL
5Lb5hPzB+AQ35EJRDn8pWjjl6b3JHvaEHOV2r33+mLRKbbSvnT9Pl6YLyt3X1LVo
ilLAuz2v/QfdzDopsVO0XclBIWHCnOR+0WrtKSzAE6/AMCKFx6n4+LmLn3U+Q7nu
DdOyzqiYZlGTtV5MnmwAqAjtsFZy8EbIO2cYxM3lAgMBAAGjODA2MAwGA1UdEwEB
/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMCMA0G
CSqGSIb3DQEBBQUAA4IBAQCv8ZSThQqNBFD+jPT/cDksjRV2f72EK7JKg+A0Y9NC
5TGquSstDKwnwsykLHdPPGAZw284vrxwu1RgTFUmWRwJl0k7+OW1WOesHEtY5u2X
WSA55sTGiXuhIPZ8bS77MmOhBCDzFBXoo9gWrWm3Fq9YEVHdhL8O3w+psF8DfqPI
goSHmza/q2ejKlRJZaJyCx4+OQKrKY8Z9/ml/TUFe4+hwqUo7yg5PbscOtBqO4E8
Sl1ASjn5ETzvWXooYUMrMk5rpxT0n3gO2wwo/9mRWSJqkIpAR/aBtyMa+hVFZLtw
P7FYFHHqML1aZ5wXHofUji06v25K7uoCCSqVi6El2c89
-----END CERTIFICATE-----
CERT,
    ],
];
