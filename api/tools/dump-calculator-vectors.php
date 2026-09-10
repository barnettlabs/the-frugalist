<?php

/**
 * Emits reference output for the calculator parity tests.
 *
 * Reads packages/contracts/fixtures/cases.json, runs every case through the
 * Laravel calculators, and writes packages/contracts/fixtures/golden.json.
 * The TypeScript ports are then asserted against that file, which is what makes
 * "the port is correct" a claim the test suite can actually check rather than
 * something we eyeball.
 *
 * Regenerate with:  php api/tools/dump-calculator-vectors.php
 *
 * Keep this script until the Laravel calculators are deleted in Phase 6 - it is
 * the only thing that can produce a new reference if a case is added.
 */

require __DIR__.'/../vendor/autoload.php';

use App\Services\Calculators\FinanceCalculator;
use App\Services\Calculators\LeaseCalculator;
use App\Services\Calculators\MortgageCalculator;

$root = dirname(__DIR__, 2);
$casesPath = $root.'/packages/contracts/fixtures/cases.json';
$outPath = $root.'/packages/contracts/fixtures/golden.json';

$cases = json_decode(file_get_contents($casesPath), true, 512, JSON_THROW_ON_ERROR);

$out = ['finance' => [], 'lease' => [], 'mortgage' => []];

foreach ($cases['finance'] as $case) {
    $out['finance'][] = [
        'name' => $case['name'],
        'with_schedule' => FinanceCalculator::fromArray($case['input'])->summary(true),
        'without_schedule' => FinanceCalculator::fromArray($case['input'])->summary(false),
    ];
}

foreach ($cases['lease'] as $case) {
    $out['lease'][] = [
        'name' => $case['name'],
        'with_schedule' => LeaseCalculator::fromArray($case['input'])->summary(true),
        'without_schedule' => LeaseCalculator::fromArray($case['input'])->summary(false),
    ];
}

foreach ($cases['mortgage'] as $case) {
    $out['mortgage'][] = [
        'name' => $case['name'],
        'with_schedule' => MortgageCalculator::fromArray($case['input'])->summary(true),
        'without_schedule' => MortgageCalculator::fromArray($case['input'])->summary(false),
    ];
}

/*
 * serialize_precision=17 round-trips a double exactly. The default of -1 uses
 * the shortest representation that survives a round trip, which is also lossless
 * but formats differently between PHP and JavaScript - and a formatting
 * difference would read as a parity failure. 17 makes both sides agree.
 */
ini_set('serialize_precision', '17');

file_put_contents(
    $outPath,
    json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n"
);

$counts = array_map('count', $out);
echo "wrote {$outPath}\n";
echo 'cases: '.json_encode($counts)."\n";
