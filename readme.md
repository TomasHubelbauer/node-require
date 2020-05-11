# Node `require`

I'm often using the following pattern when writing one-off scripts or programs
where I want to use `async`/`await` but cannot due to the current lack of top-
level `await` in NodeJS:

```js
void async function() {
  // `await`
}()
```

I find this cleaner than an IIFE or declaring the function with a name like
`main` without `void` and then fire-and-forget-ing it by calling it using
`main()`. It is an IIFE, but the `void` keyword is magical in that it allows it
to be called without enclosing it in ugly parentheses.

However, I also sometimes schedule those scripts or programs to run periodically
using another Node program I wrote. I currently use `spawn` to run each script
which allows me to capture the stdout, stderr and exit code of each run and wait
for each script's run to end before dispatching the next script, so that each
script has the full network bandwidth at its disposal and if it prepares data
for the next script in chain, no race conditions occur.

I am thinking of using `require` instead of `spawn` to activate the dependant
scripts, but it has a downside of me having to expose them using
`module.exports` at which point the neat `void async function()` syntax is no
longer usable because `void` doesn't return the value it executes, but returns
`undefined` instead.

So I can't use this:

```javascript
// Can not use this
module.exports = void async function() {

}()
```

I can use this:

```javascript
// Can use this but ugly
module.exports = (async function() {

});
```

But that's ugly. I can also name the function something and do this:

```javascript
async function main() {

}

module.exports = main();
```

This will return the running promise so it's possible to directly `await` the
`require` return value like so:

```javascript
await require('./dep');
```

This is okay, but I still have to name the function, which is what I was looking
to avoid because I find not naming the function which is just there to provide
an async scope emulating top level await to be cleaner.

Alas, it looks like there is no real way to keep using `void async function` and
also be able to take the `Promise` instance that gets created there by the self-
execution using `()` and then `await` it later.

If I don't bind it to anything (like `module.exports`), I just won't be able to
access it to await it later.

If there was a way to enumerate runtime promises, I could use that, although
that would be a hack for a sake of an in the end small thing of not having to
name the TLA-emulator async function.

BTW the work on TLA in V8 (so later in Node) is documented here:

https://v8.dev/features/top-level-await

It looks like it would be possible to just use `await require` when the TLA
support lands. It says that it would just work in modules and I am not sure if
that means that just by the virtue of using TLA the script becomes a module due
to TLA desugaring to `module.exports = (async function() {})()` or if the script
file would have to have the Node's MJS extension to specifically designate it a
module.

In any case, I would not be disappointed either way. The first case is what I'd
like to see the most, but using the `.mjs` extensions frees `index.js` to be a
website for the script while `index.mjs` can be the entry-point which is still
invokable using `node .` instead of specifying a non-default file name. But the
question there is if `index.mjs` would be resolved before `index.js` by Node.

Right now `index.mjs` is not resolved even with `--experimental-modules` even in
the absence of `index.js` so this probably remains to be seen.

## Conclusion

For now, I've opted to use the following pattern:

```js
module.exports = function() {

};

module.exports = module.exports();
```

It does not introduce a level or nesting nor parentheses and it also doesn't
really introduce a need for naming things because the `module.exports` symbol
name is predefined, so I feel like this is a nice win-win where most of the
feel of `void async function() {}()` remains but it is also exported so other
processes can `require` the module. In this case it is not exported as already
running, but that's something I wasn't particularly partial about, so that's
okay.

It is also important to use `chdir` to step into the required script's directory
and back if the script should make files in its directory and not the invoker's.

## Update

I've settled on this:

```js
module.exports = async function () {

};

if (process.cwd() === __dirname) {
  module.exports();
}
```

Still no need to name anything, but there are benefits in that the importer can
decide when to start running the function (it does not start running at import
time) yet it is still possible to test it by running `node .` (assuming the code
is in a file named `index.js`) due to the check at the end which invokes it if
it sees the current working directory is the same as the script file's directory.

In case the function returns a value, I go with: `module.exports.then(console.log)`.
If it works out, this prints the return value. If there is an error, the runtime
reports it.
