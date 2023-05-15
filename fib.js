const cp = require('child_process');

const wait = (msg) => {
    console.log(`${msg}\nPress any key to continue...`);
    cp.spawnSync("read _ ", {shell: true, stdio: [0, 1, 2]});
};
 
const fib = n => n < 3 ? 1 : (fib(n - 1) + fib(n - 2));

const mfC = {};
const memFib = n => {
    if (n < 1 || parseInt(n) != n) { throw new Error("Fibonacci number indices are only positive integers!"); }
    if (n < 3) { return 1; }
    if (typeof mfC[n] == 'undefined') {
        mfC[n] = memFib(n - 1) + memFib(n - 2);
    }
    return mfC[n];
};

const newTimer = (name) => {
    const s = (new Date()).getTime();
    return { done: () => `${name}: ${(new Date()).getTime() - s}ms` };
}

const doRange = (name, max, fn) => {
    let i = 1;
    console.log(`${name}:`);
    const timer = newTimer(name);
    while (i <= max) {
        const seqTimer = newTimer(`  ${name} (${i})`);
        const res = fn(i);
        console.log(seqTimer.done(), res);
        i++;
    }
    console.log(timer.done())
};

wait(`Let's do a standard fibonacci up to 10`)
doRange('Fibonacci', 10, fib);
wait(`Diesel, this is super fast!  Let's do up to 40.`);
doRange('Fibonacci', 40, fib);
wait(`Hmmm, that really slowed down a bit, but it can't get much worse, right? ...43?`);
doRange('Fibonacci', 43, fib);
wait(`Holy crap, this really sucks, it's getting progressively worse.  What if we MEMOIZED at 40?`);
doRange('Memoized Fibonacci', 40, memFib);
wait('Fuck yeah!  Can it go higer? ...100!?');
doRange('Memoized Fibonacci', 100, memFib);
wait('Whoa! How about 1000!?');
doRange('Memoized Fibonacci', 1000, memFib);
console.log(`Wow, that's super impressive!`);

