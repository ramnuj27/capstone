<?php

test('composer requires php 8.4 or newer for deployment targets', function (): void {
    $projectRoot = dirname(__DIR__, 2);
    $composer = json_decode(
        file_get_contents($projectRoot.'/composer.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect(data_get($composer, 'require.php'))->toBe('^8.4');
});

test('github actions test matrix matches the supported php versions', function (): void {
    $projectRoot = dirname(__DIR__, 2);
    $workflow = file_get_contents($projectRoot.'/.github/workflows/tests.yml');

    expect($workflow)
        ->not->toBeFalse()
        ->toContain("'8.4'")
        ->toContain("'8.5'")
        ->not->toContain("'8.3'");
});
