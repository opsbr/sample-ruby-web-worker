# sample-ruby-web-worker

A sample JavaScript application to run `ruby.wasm` on a Web Worker with communicating between main thread.

## What is this?

A PoC level application to show how to execute `ruby.wasm` on a Web Worker. This application also implements
a communication method between main thread and `ruby.wasm` thread using `stdin` and `stderr`.

The main motivation for this application is "How to execute blocking operation inside `ruby.wasm`?"
Because we wanted to write a `ruby.wasm` application with a blocking call delegated to the main JavaScript thread.

It is possible by using `ruby.wasm`'s JS extension, but it opens whole JS capabilities to `ruby.wasm` which
we want to prevent. Also, without synchronized blocking on JS side, `ruby.wasm` needs to loop operations
without sleep and consumes CPU unnecessarily.

In this application, we use `SharedArrayBuffer` and `Atomics.wait()` to block `ruby.wasm` operations.
To simplify our implementation, we piggyback on the existing IO implementations i.e. `stdin/stderr`
so that we don't have to write any C extensions. We use `stderr` for sending a request from `ruby.wasm` and
`stdin` for responding back to `ruby.wasm`.

Thanks to WASI, we can easily implement our custom `stdin/stderr` on JS side. In the web worker thread,
it simply relays `stderr` message to the main thread. When `stdin` is called, it synchronously waits for
`SharedArrayBuffer`'s update by the main thread. Until then, the web worker thread is blocked but
no need to loop anything. Once the main thread updates the `SharedArrayBuffer`, the worker thread resumes
the `stdin` operation automatically and sends the response back to `ruby.wasm`.

With this architecture, simple synchronous operations like below works as expected:

```ruby
$stdin.sync = true
$stdout.sync = true
$stderr.sync = true

def main
  loop do
    $stderr.puts "I need coffee!"
    puts gets
    $stderr.puts "I need beer!"
    puts gets
  end
end

main
```

## Install

Node.js is required. Recommend to use devcontainer.

```
git clone https://github.com/opsbr/sample-ruby-web-worker.git
cd sample-ruby-web-worker
npm install
```

`ruby.wasm` binary will be automatically downloaded as well.

## Usage

```
npm run dev

# or

npm run build
npm run preview
```

Then, access `http://localhost:3000` and see JavaScript console:

```
[worker] stderr: I need coffee!
[main]   onmessage: I need coffee!
[main]   Making coffee...
[worker] stdin: (waiting)
[main]   I'm alive!
[main]   Coffee is ready!
[worker] stdin: "Your coffee! ☕\n"
[worker] stdin: (waiting)
[worker] stdin: ""
Your coffee! ☕

[worker] stderr: I need beer!
[main]   onmessage: I need beer!
[worker] stdin: (waiting)
[main]   Making beer...
[main]   I'm alive!
[main]   Beer is ready!
[worker] stdin: "Your beer! 🍺\n"
[worker] stdin: (waiting)
[worker] stdin: ""
Your beer! 🍺

[worker] stderr: I need coffee!
...
```

## Notes

- `SharedArrayBuffer` requires secure context. We set the two HTTP response headers for this purpose. See also https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
- We use [Astro](https://astro.build/) but it doesn't support custom HTTP headers yet. PR is open https://github.com/withastro/astro/pull/5564
  - Until then, we need [this patch](https://github.com/opsbr/sample-ruby-web-worker/blob/main/patches/astro%2B1.6.14.patch)

## Author

2022 OpsBR Software Technology Inc.

Visit https://opsbr.com

## License

MIT

## Acknowledgement

kateinoigakukun helped us by kind suggestions. We really appreciate them.
https://github.com/ruby/ruby.wasm/issues/126 and https://github.com/ruby/ruby.wasm/issues/127
