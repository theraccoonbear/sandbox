<?php

$data = array(
	'value' => range(1, 1000),
	'some' => 'stuff',
	'other' => array(
		'stuff' => 'yes',
		'and' => 'things',
		'ok' => 'great',
		'extra' => range(10000, 20000)
	)
);

$iter_count = 1000;
$total = 0;

print '<pre>';
print '<h1>JSON Encode</h1>';
$start = microtime(true);
foreach (range(1, $iter_count) as $idx) {
	$json_ser = json_encode($data);
}
$finish = microtime(true);
$elap = $finish - $start;
$total += $elap;
print "<div>$iter_count encodings in $elap ($start to $finish) seconds</div>";
print '</pre>';

print '<pre>';
print '<h1>JSON Decode</h1>';
$start = microtime(true);
foreach (range(1, $iter_count) as $idx) {
	$json_data = json_decode($json_ser);
}
$finish = microtime(true);
$elap = $finish - $start;
$total += $elap;
print "<div>$iter_count decodings in $elap ($start to $finish) seconds</div>";
print '</pre>';

print "<pre>JSON total: $total</pre>";
$total = 0;

/**************************************************/

print '<pre>';
print '<h1>PHP Serialize</h1>';
$start = microtime(true);
foreach (range(1, $iter_count) as $idx) {
	$php_ser = serialize($data);
}
$finish = microtime(true);
$elap = $finish - $start;
$total += $elap;
print "<div>$iter_count serializations in $elap ($start to $finish) seconds</div>";
print '</pre>';


print '<pre>';
print '<h1>PHP Deserialize</h1>';
$start = microtime(true);
foreach (range(1, $iter_count) as $idx) {
	$php_data = unserialize($php_ser);
}
$finish = microtime(true);
$elap = $finish - $start;
$total += $elap;
print "<div>$iter_count deserializations in $elap ($start to $finish) seconds</div>";
print '</pre>';
print "<pre>JSON total: $total</pre>";
$total = 0;
