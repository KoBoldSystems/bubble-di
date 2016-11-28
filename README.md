bubble-di
=========================

A simple, Dependecy Injection Container for Javascript and Typescript.
Typings included.

**Installation**

```
npm install --save bubble-di
```

**How does it work?**

#### Simple example
```javascript
var {DiContainer} = require("bubble-di");
// import { DiContainer } from "bubble-di";

DiContainer.setContainer(new DiContainer());

DiContainer.getContainer().registerInstance("foo", () => {console.log("foo");});
const fooFunc = DiContainer.getContainer().resolve("foo");
fooFunc(); // prints 'foo'

class Bar { sayBar() {console.log("bar");}}

DiContainer.getContainer().registerInstance("bar", new Bar());
const bar = DiContainer.getContainer().resolve("bar");
bar.sayBar(); // prints 'bar'
```

#### Transitive dependencies
```javascript
var {DiContainer} = require("bubble-di");
// import { DiContainer } from "bubble-di";

DiContainer.setContainer(new DiContainer());

class Bar { sayBar(){ console.log("bar"); } }
class Baz { sayBaz(){ console.log("baz"); } }
class Foo { 
    constructor (bar, baz)
    {
        bar.sayBar();
        baz.sayBaz();
        // ...
    }
};

DiContainer.getContainer().registerInstance("bar", new Bar());
DiContainer.getContainer().registerInstance("baz", new Baz());
DiContainer.getContainer().register("foo", {
    dependencies: ["bar", "baz"],
    factoryMethod: (bar, baz) => new Foo(bar, baz) },
);
const foo = DiContainer.getContainer().resolve("foo"); // will print "bar" and "baz".
```

#### Deriving the DiContainer to postprocess dependencies after being resolved
```javascript
var {DiContainer} = require("bubble-di");
// import { DiContainer } from "bubble-di";

class MyDiContainer extends DiContainer {
    onResolved(id, resolvedInstance) {
        console.log(`id being resolved: '${id}'`);
        // do stuff with resolvedInstance
    }
}

DiContainer.setContainer(new MyDiContainer ());
DiContainer.getContainer().registerInstance("foo", {});
DiContainer.getContainer().resolve("foo"); // will print "id being resolved: 'foo'"
```

## License

MIT
