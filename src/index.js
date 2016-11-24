/**
 * DiContainer is a dependency injection container.
 * You can derive it and override onResolved to post-process dependencies after they have been resolved (i.e. to inject some form of context). 
 */
export default class DiContainer {
    static diContainerInstance;
    static setContainer(container) {
        DiContainer.diContainerInstance = container;
    }
    static getContainer() {
        return DiContainer.diContainerInstance;
    }

    registry;   

    constructor() {
        this.registry = [];
    }

    /**
     * Registers a dependency.
     * Example:
     *   DiContainer.getContainer().register("MyService", {
     *       dependencies: ["OtherService", "ThirdService"],
     *       factoryMethod: (otherService, thirdService) => new MyService(otherService, thirdService)}
     *   );
     * @param id The unique id for the dependency to be registered
     * @param typeInfo typeinfo object containing dependencies and factorymethod {dependencies?, factoryMethod: (...dependenciesInOrder)}
     */
    register(id, typeInfo) {
        this.registry[id.toLowerCase()] = typeInfo;
    }

    /**
     * Registers an instance as a dependency.
     * Example:
     *   di.registerInstance("myInstance", myInstance);
     * @param id The unique id for the dependency to be registered
     * @param instance The instance to be registered.
     */
    registerInstance(id, instance) {
        this.register(id, {factoryMethod: () => instance });
    }

    /** Resolves a dependecy registered under given id
     * @param id  The unique id for the dependency to be resolved
     * @param recursionPath (Internal) Array of visited dependencies used for cycle detection
     */
    resolve(id, recursionPath = []) {
        id = id.toLowerCase();
        this.checkCycles(id, recursionPath);
        const typeInfo = this.registry[id];
        if (typeInfo === undefined) { throw new Error(`no dependency registered for id '${id}'`); }
        const dependencies = this.resolveMany(typeInfo.dependencies, [id, ...recursionPath]);
        const instance = typeInfo.factoryMethod(...dependencies);
        this.onResolved(id, instance);
        return instance;
    }

    /**
     * Resolves many dependencies
     * @param ids Array of dependency ids to be resolved
     * @param recursionPath (Internal) Array of visited dependencies used for cycle detection
     */
    resolveMany(ids, recursionPath = []) {
        if (!ids) {return []; }
        const dependencies = [];
        ids.forEach(id => dependencies.push(this.resolve(id.toLowerCase(), [...recursionPath])));
        return dependencies;
    }

    checkCycles(id, recursionPath) {
        if (!id || !recursionPath) { return; }
        recursionPath.forEach(previousId => {
            if (previousId === id) {
                throw new Error(`Dependency cycle detected: actual dependency being resolved: '${id}', recursionPath '${recursionPath}'`);
            }
        });
    }

    /* override to do stuff after dependency has been resolved */
    onResolved(id, resolvedInstance) { }
}

export function resetDiContainer(diContainerInstance = new DiContainer()) {
    DiContainer.setContainer(diContainerInstance);
}

if (DiContainer.getContainer() === undefined) {
    resetDiContainer(new DiContainer());
}
