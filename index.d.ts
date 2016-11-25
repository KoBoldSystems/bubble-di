// Type definitions for bubble-di
// Project: bubble-di
// Definitions by: Kobold Group http://kobold.com.au

export = bubbleDi;

declare namespace bubbleDi {
/**
 * DiContainer is a dependency injection container.
 * You can derive it and override onResolved to post-process dependencies after they have been resolved (i.e. to inject some form of context). 
 */
class DiContainer {
    constructor();
    /**
     * gets the DiContainer instance
     */
    static getContainer(): DiContainer;
    /**
     * sets the DiContainer instance
     */
    static setContainer(container: DiContainer): void;

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
    register(id: string, typeInfo: TypeInfo): void;

    /**
     * Registers an instance as a dependency.
     * Example:
     *   di.registerInstance("myInstance", myInstance);
     * @param id The unique id for the dependency to be registered
     * @param instance The instance to be registered.
     */
    registerInstance(id: string, instance: any);

    /** Resolves a dependecy registered under given id
     * @param id  The unique id for the dependency to be resolved
     * @param recursionPath (Internal) Array of visited dependencies used for cycle detection
     */
    resolve(id: string): any;

    /**
     * Resolves many dependencies
     * @param ids Array of dependency ids to be resolved
     * @param recursionPath (Internal) Array of visited dependencies used for cycle detection
     */
    resolveMany(ids: string[]): any[];
}
    /**
     * A TypeInfo contains information for resolving a dependencies including it's dependecy graph.
     * it is composed of two properties: dependencies and factoryMethod.
     * The order of the given dependencies defines in which order they will be passed to the factoryMethod.
     * @example
     * // An example for a dependency
     * {
     *      dependencies: ["OtherService", "ThirdService"],
     *      factoryMethod: (otherService, thirdService) => new MyService(otherService, thirdService)
     * }
     */
    export interface TypeInfo {
        /**
         * the dependencies of the dependecy described by this TypeInfo object.
         */
        dependencies?: string[];
        /**
         * The FactoryMethod returning an instance of the dependency bein registered.
         * dependencies will be passed in in the order defined by 'dependencies' property.
         */
        factoryMethod: (...dependencies: any[]) => any;
    }
}
