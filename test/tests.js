import { expect } from "chai";
import DiContainer from "../src/index";

class Child1Service {
    childMethod() {
        return "child1";
    }
}
class Child3Service {
    childMethod() {
        return "child3";
    }
}
class Child2Service {
    child3Service;
    constructor(child3Service) {
        this.child3Service = child3Service;
    }
    childMethod() {
        return `child2-${this.child3Service.childMethod()}`;
    }
}
class TestService {
    child1Service;
    child2Service;

    constructor(child1Service, child2Service) {
        this.child1Service = child1Service;
        this.child2Service = child2Service;
    }

    testMethod() {
        return `${this.child1Service.childMethod()}-${this.child2Service.childMethod()}`;
    }
}



class Child5Service {
    childMethod() {
        return "child5";
    }
}
class Child4Service extends Child2Service {
    child5Service;
    constructor(child3Service, child5Service) {
        super(child3Service);
        this.child5Service = child5Service;
    }
    childMethod() {
        return `I am child4 and i have ${this.child5Service.childMethod()} and my base class has ${super.childMethod()}`;
    }
}


class CycleDependency3 {
    cycleDependency2;
    constructor(cycleDependency2) {
        this.cycleDependency2 = cycleDependency2;
    }
}
class CycleDependency2 {
    cycleDependency3;
    constructor(cycleDependency3) {
        this.cycleDependency3 = cycleDependency3;
    }
}
class CycleDependencyRoot {
    cycleDependency2;
    constructor(cycleDependency2) {
        this.cycleDependency2 = cycleDependency2;
    }
}

 class MyDiContainer extends DiContainer {
     called;

    constructor() {
        super();
        this.called = false;
    }

    onResolved(id, resolvedInstance) {
        if (resolvedInstance && id) {
            this.called = true;
        }

        this.called = true;
    }

    getCalled() {
        return this.called;
    }
}

describe("DependencyResolver", () => {
    const diContainer = DiContainer.getContainer();
    it("it should be capable of registering and locating dependencies with nested dependencies", () => {

        expect(diContainer).to.not.be.undefined;

        diContainer.register("Child1Service", { dependencies: [], factoryMethod: () => new Child1Service() });
        diContainer.register("Child2Service", {
            dependencies: ["Child3Service"],
            factoryMethod: child3Service => new Child2Service(child3Service) },
        );
        diContainer.register("Child3Service", { dependencies: [], factoryMethod: () => new Child3Service() });
        diContainer.register("Child4Service", {
            dependencies: ["Child3Service", "Child5Service"],
            factoryMethod: (child3Service, child5Service) => new Child4Service(child3Service, child5Service),
        });
        diContainer.register("Child5Service", { dependencies: [], factoryMethod: () => new Child5Service() });
        diContainer.register("TestService", {
            dependencies: ["Child1Service", "Child2Service"],
            factoryMethod: (child1Service, child2Service) => new TestService(child1Service, child2Service) },
        );

        expect(diContainer.resolve("Child1Service")).to.not.be.undefined;

        const testService = diContainer.resolve("TestService");
        expect(testService.testMethod()).to.equal("child1-child2-child3");

        const child4Service = diContainer.resolve("Child4Service");
        expect(child4Service.childMethod()).to.equal("I am child4 and i have child5 and my base class has child2-child3");
    });

    it("registerInstance should register an instance", () => {
        const di = new DiContainer();
        const myInstance = {};
        di.registerInstance("myInstance", myInstance);
        const resolved = di.resolve("myInstance");

        expect(myInstance === resolved).to.be.true;
    });

    it("it should throw an error for not found dependencies", () => {
        expect(() => { diContainer.resolve("NotRegistered"); }).to.throw(Error);
    });



    it("it should detect cycles in dependencies", () => {
        diContainer.register(
            "CycleDependencyRoot",
            {
                dependencies: ["CycleDependency2"],
                factoryMethod: cycleDependency2 => new CycleDependencyRoot(cycleDependency2),
            },
        );
        diContainer.register(
            "CycleDependency2",
            {
                dependencies: ["CycleDependency3"],
                factoryMethod: cycleDependency3 => new CycleDependency2(cycleDependency3),
            },
        );
        diContainer.register(
            "CycleDependency3",
            {
                dependencies: ["CycleDependency2"],
                factoryMethod: cycleDependency2 => new CycleDependency3(cycleDependency2),
            },
        );

        expect(() => { diContainer.resolve("CycleDependencyRoot"); }).to.throw(Error);
    });



    it("it should call onResolved in subTypes after resolving a dependency", () => {
        const c = new MyDiContainer();
        c.register("Child3Service", { factoryMethod: () => new Child3Service() });
        expect(c.getCalled()).to.be.false;
        c.resolve("Child3Service");
        expect(c.getCalled()).to.be.true;
    });
});

