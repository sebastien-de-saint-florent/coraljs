/**
* Utils namespace provide common functions for the framework
* @namespace Coral.Utils
*/
declare module Coral.Utils {
    /**
    * Create a string to represent an object in a log message.
    * @method Coral.Utils.objectInfo
    * @param {Object} object The object in relation with the warning
    * @returns {string}
    */
    function objectInfo(object: any): string;
    /**
    * Display an error in the console.
    * @method Coral.Utils.error
    * @param {string} message
    * @param {Object} [object] The object in relation with the warning
    * @param {string} [key] The property in relation with the warning
    */
    function error(message: string, object?, key?: string): void;
    /**
    * Display a warning in the console.
    * @method Coral.Utils.warning
    * @param {string} message
    * @param {Object} [object] The object in relation with the warning
    * @param {string} [key] The property in relation with the warning
    */
    function warning(message: string, object?, key?: string): void;
    /**
    * Get a new unique identifier.
    * @method Coral.Utils.getUID
    * @returns {number} An unique identifier
    */
    function getUID(): number;
    function getChain(object, properties: string): any;
    function getChain(object, properties: string[]): any;
    /**
    * Get all values of property in the prototype chain
    * @method Coral.Utils.prototypalMerge
    * @param {Object} object
    * @param {string} property
    * @returns {Array} An array containing all values of the property
    */
    function prototypalMerge(object, property: string): any[];
    /**
    * Wait <code>time</code> milliseconds and then call the callback function
    * @method Coral.Utils.wait
    * @param {number} time Time to wait
    * @param {Function} callback Function to call when timer ends
    * @param {Object} context <code>this</code> for the callback Function
    */
    function wait(time: number, callback: () => any, context: any): void;
    /**
    * Call the given function in a later frame update.
    * @method Coral.Utils.callback
    * @param {Function} callback Function to call
    * @param {Object} context <code>this</code> for the callback Function
    */
    function callback(callback: () => any, context): void;
    /**
    * return a new object with only properties matching filter regexp
    * @method Coral.Utils.objectFilter
    * @param {Object} object source object
    * @param {RegExp} include a regular expression used to filter included properties, the first capture is used
    * @param {RegExp} exclude a regular expression used to filter excluded properties
    * @returns {Object} the filtered copy
    */
    function objectFilter(object, include: RegExp, exclude?: RegExp): any;
}
/**
* Utility functions designed for Meta.
* @namespace Meta.Utils
*/
declare module Meta.Utils {
    /**
    * Iterate over prototype chain to find where a property has been declared.
    * @method Meta.Utils.findPropertyDefinition
    * @param {Object} object Base object where search start.
    * @param {string} key Property key to search.
    * @returns {Object} the object where the given property is defined
    */
    function findPropertyDefinition(object, key: string);
    /**
    * Test if a property can be wrap into a new property definition.
    * @method Meta.Utils.canWrapProperty
    * @param {Object} object Host object.
    * @param {string} key Property key to test.
    * @returns {bool} <code>true</code> if the property can be wrapped
    */
    function canWrapProperty(object, key: string): boolean;
    /**
    * Wrap the property key1/desc1 with desc2 by moving the first property to key2.
    * @method Meta.Utils.wrapProperty
    * @param {Object} object Host object.
    * @param {string} key1 Original property key.
    * @param {string} key2 New property key.
    * @param {object} desc1 Original property description.
    * @param {object} desc2 Wrapped property description.
    */
    function wrapProperty(object, key1: string, key2: string, desc1: PropertyDescriptor, desc2: PropertyDescriptor): void;
}
/**
* Meta provide methods to dynamically add behaviors to existing classes.
* @namespace Meta
*/
declare module Meta {
    /**
    * Make <code>subClass</code> inherits from <code>supClass</code>.
    * @method Meta#Extends
    * @param {Function} subClass The class to extend
    * @param {Function} supClass The super class
    */
    function Extends(subClass, supClass): void;
    /**
    * Create a new Class with the given definition.
    * @method Meta#Class
    * @param {Object} definition Methods and properties.
    * @param {Function} [supClass] The super class.
    * @param {Array} [mixins] An Array of mixins.
    * @returns {Function} The constructor function.
    */
    function Class(definition: {
        constructor?: Function;
    }, supClass?, mixins?: Mixin.IMixin[]): Function;
    /**
    * Apply the given mixin.
    * @method Meta#Mixin
    * @param {Object} object Class prototype or Object.
    * @param {Object} mixin Mixin to apply.
    */
    function Mixin(object, mixin: Mixin.IMixin): void;
    /**
    * @namespace Meta.Mixin
    */
    module Mixin {
        interface IMixin {
            __mixin_name?: string;
            __mixin_dependencies?: IMixin[];
        }
        /**
        * Metadata key where mixin information is stored
        * @constant Meta.Mixin.MIXIN_KEY
        * @type {string}
        */
        var MIXIN_KEY: string;
        /**
        * Metadata key where mixin name is stored
        * @constant Meta.Mixin.MIXIN_NAME_KEY
        * @type {string}
        */
        var MIXIN_NAME_KEY: string;
        /**
        * Metadata key where mixin dependencies are stored
        * @constant Meta.Mixin.MIXIN_DEPENDENCIES_KEY
        * @type {string}
        */
        var MIXIN_DEPENDENCIES_KEY: string;
        /**
        * Flag indicating that the property must exist
        * @constant Meta.Mixin.VIRTUAL
        * @type {number}
        * @default -4242
        */
        var VIRTUAL: number;
        /**
        * Check if an object has the given mixin.
        * @method Meta.Mixin.is
        * @param {Object} object
        * @param {Object} mixin Mixin to match.
        * @returns {boolean}
        */
        function is(object, mixin: IMixin): boolean;
    }
    /**
    * Bindable function transform a property so it will trigger binding listeners when modified.
    * @method Meta#Bindable
    * @param {Object} object The object hosting the property
    * @param {string} key The key of the bindable property
    * @param {Array} [dependencies] Array of dependencies metadata
    */
    function Bindable(object, key: string, dependencies?: string[]): void;
    /**
    * @namespace Meta.Bindable
    */
    module Bindable {
        /**
        * The key where binded property is moved
        * @constant Meta.Bindable.BINDING_KEY
        * @type {string}
        * @default
        */
        var BINDING_KEY: string;
        /**
        * The key where dependencies metadata are stored
        * @constant Meta.Bindable.DEPENDENCIES_KEY
        * @type {string}
        * @default
        */
        var DEPENDENCIES_KEY: string;
        /**
        * Define the binding policy when a property listener is created an a non-bindable property.
        * @property Meta.Bindable.autoBindableEnable
        * @type {boolean}
        * @default true
        */
        var autoBindableEnable: boolean;
        /**
        * PropertyListener mixin.
        * @constant Meta.Bindable.PropertyListenerMixin
        * @type {Object}
        * @see Coral.Watcher
        * @see Coral.Binding
        */
        var PropertyListenerMixin: {
            __mixin_name: string;
            handleChange: number;
        };
        /**
        * Check if an object's property is bindable.
        * @method Meta.Bindable.isBindable
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @returns {boolean} true if the given object's property is bindable
        */
        function isBindable(object, key: string): boolean;
        /**
        * Check if an object's property has dependencies.
        * @method Meta.Bindable.hasDependencies
        * @param {Object} object The object hosting the property.
        * @param {string} key The key of the property.
        * @returns {boolean} true if the given object's property has dependencies
        */
        function hasDependencies(object, key: string): boolean;
        /**
        * Get dependencies associated with an object's property.
        * @method Meta.Bindable.getDependencies
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @returns {Array} dependencies array or undefined
        */
        function getDependencies(object, key: string): string[];
        /**
        * Trigger all binding handlers for the given object's property.
        * @method Meta.Bindable.trigger
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @param newValue The new value to pass to the property listener
        * @param [oldValue] The old value to pass to the property listener
        */
        function trigger(object, key: string, newValue, oldValue?): void;
        /**
        * Trigger all binding handlers of the given object.<br/>
        * oldValue has a value of undefined for all triggered properties.
        * @method Meta.Bindable.triggerAll
        * @param {Object} object The object hosting the properties.
        * @param {Array} keys An Array of property key.
        */
        function triggerAll(object, keys: string[]): void;
        interface IPropertyListenerMixin {
            handleChange(newValue?, oldValue?, params?);
        }
        interface PropertyListener {
            l: IPropertyListenerMixin;
            p;
        }
        /**
        * Register a listener object to handle modifications on a property.
        * @method Meta.Bindable.bind
        * @param {Object} object The object hosting the property.
        * @param {string} key The key of the property.
        * @param {Object} listener An object respecting the mixin {@linkcode Meta.Bindable.PropertyListenerMixin}.
        * @returns {Object} the property listener instance created in the given object
        */
        function bind(object, key: string, listener: IPropertyListenerMixin, params?): PropertyListener;
        /**
        * Unregister a listener object so it don't handle modifications on a property anymore.
        * @method Meta.Bindable.unbind
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @param {Object} propertyListener The object returned by Meta.Bindable.bind function
        */
        function unbind(object, key: string, propertyListener: PropertyListener): void;
    }
}
declare module Coral {
    class BindingBase {
        public host;
        public chain: string;
        public binded: boolean;
        public result;
        /**
        * <code>Watcher</code> object create property listeners on a chain of objects and trigger a callback upon modification.
        * @constructor Coral.BindingBase
        * @property result
        * @property {boolean} binded <code>true</code> if the <code>Watcher</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A dot separated chain of properties or method calls.
        */
        constructor(host, chain: string);
        public properties: string[];
        public functions: {};
        public watchers: any[];
        public chainResults: any[];
        /**
        * Stop the watcher by removing all created property listeners and dependencies.
        * @method unbind
        * @memberof Coral.BindingBase#
        * @returns {Coral.BindingBase} this
        */
        public unbind(): BindingBase;
        /**
        * Internal method that create all needed property listeners and Watcher recursively
        * @private
        */
        public createWatchers(object, index: number);
        /**
        * @private
        */
        private eventWatcherDependency(event?, index?);
        /**
        * @private
        */
        private watcherDependency(newValue?, oldValue?, index?);
        /**
        * shall be override
        * @private
        */
        public handleChange(newValue?, oldValue?, index?: number): void;
    }
}
declare module Coral {
    class Watcher extends Coral.BindingBase {
        private handler;
        private context;
        private params;
        /**
        * <code>Watcher</code> object create property listeners on a chain of objects and trigger a callback upon modification.
        * @constructor Coral.Watcher
        * @extends Coral.BindingBase
        * @property result The current value beeing watched.
        * @property {boolean} binded <code>true</code> if the <code>Watcher</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A dot separated chain of properties or method calls.
        * @param {Function} handler The callback triggered when the result change.
        * @param {Object} [context] The context object applied to the handler.
        * @param [params] Additional params to be passed to the handler.
        * @example
        // Simple Watcher
        var host = {
        nested: {
        val:2
        }
        };
        var watcher = new Coral.Watcher(host, "nested.val", function(newValue, oldValue, params) {
        // handler triggered
        });
        * @example
        // Watcher with function call
        var host = {
        nested: {
        getVal:function() {return 2;}
        }
        };
        var watcher = new Coral.Watcher(host, "nested.getVal()", function(newValue, oldValue, params) {
        // handler triggered
        });
        */
        constructor(host, chain: string, handler: (newValue?: any, oldValue?: any, params?: any) => any, context?, params?);
        /**
        * Start the watcher by creating all needed property listeners and dependencies.
        * @method bind
        * @memberof Coral.Watcher#
        * @param {boolean} [trigger=false] If true handler will be called after bind finish.
        * @returns {Coral.Watcher} this
        */
        public bind(trigger?: boolean): Watcher;
        /**
        * This method handle any change in the watched chain
        * It delete useless watchers, create new ones and trigger notify handler if needed
        * @private
        */
        public handleChange(newValue?, oldValue?, index?: number): void;
    }
}
declare module Coral {
    class Binding extends Coral.BindingBase {
        private target;
        private property;
        /**
        * <code>Binding</code> object create property listeners to watch an objects chain and assign result to the target property.
        * @constructor Coral.Binding
        * @extends Coral.BindingBase
        * @see Meta.Bindable
        * @property {boolean} binded <code>true</code> if the <code>Binding</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A dot separated chain of properties or method calls.
        * @param {Object} target Host object of the target property.
        * @param {string} property Target property key.
        */
        constructor(host, chain: string, target, property: string);
        /**
        * Start the binding. The current value is automatically set on the target property.
        * @method bind
        * @memberof Coral.Binding#
        * @returns {Coral.Binding} this
        */
        public bind(): Binding;
        /**
        * This method handle any change in watched chain
        * It delete useless watchers, create new ones and set the new value on the target property
        * @private
        */
        public handleChange(newValue?, oldValue?, index?: number): void;
    }
}
declare module Coral {
    class EventWatcher {
        private host;
        private chain;
        private event;
        private handler;
        private context;
        private params;
        /**
        * EventWatcher watch a property chain and listen on the result object for events.
        * @constructor Coral.EventWatcher
        * @property {boolean} binded <code>true</code> if the <code>EventWatcher</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A dot separated chain of properties or method calls.
        * @param {string} event The event key to listen.
        * @param {Function} handler The callback triggered when the result change.
        * @param {Object} context The context object applied to the handler.
        * @param [params] Additional params to be passed to the handler.
        */
        constructor(host, chain: string, event: string, handler: (event?: any, params?: any) => any, context?, params?);
        private watcher;
        private uid;
        private result;
        /**
        * Handler of the watcher created inside the EventWatcher
        * @private
        */
        public resultChange(newValue?, oldValue?): void;
        /**
        * Start the event watcher
        * @method bind
        * @memberof Coral.EventWatcher#
        * @returns {Coral.EventWatcher} this
        */
        public bind(): EventWatcher;
        /**
        * Stop the watcher by stopping the watcher and remove EventListener
        * @method unbind
        * @memberof Coral.EventWatcher#
        * @returns {Coral.EventWatcher} this
        */
        public unbind(): EventWatcher;
    }
}
declare module Coral {
    class BindingComposition {
        public components: {
            v: any;
            m: any;
        }[];
        /**
        * <code>BindingComposition</code> treat a composition expression for {@linkcode Coral.CompositeBinding}.
        * @constructor Coral.BindingComposition
        * @property {Array} components computation of the binding expression.
        * @param {string} composition The composite binding expression.
        * @see Coral.CompositeBinding
        */
        constructor(composition);
        /**
        * Binding component flag.
        * @constant Coral.BindingComposition.BINDING_COMPONENT
        * @type {number}
        * @default 0
        */
        static BINDING_COMPONENT: number;
        /**
        * String component flag.
        * @constant Coral.BindingComposition.STRING_COMPONENT
        * @type {number}
        * @default 1
        */
        static STRING_COMPONENT: number;
    }
}
declare module Coral {
    class CompositeBinding {
        private host;
        private target;
        private property;
        public binded: boolean;
        constructor(host, composition: string, target, property: string);
        constructor(host, composition: Coral.BindingComposition, target, property: string);
        private watchers;
        private composition;
        /**
        * @private
        */
        public handleChange(): void;
        /**
        * Start the binding by creating all bindings declared in 'composition'
        * @method bind
        * @memberof Coral.CompositeBinding#
        * @returns {Coral.CompositeBinding} this
        */
        public bind(): CompositeBinding;
        /**
        * Stop the binding
        * @method unbind
        * @memberof Coral.CompositeBinding#
        * @returns {Coral.CompositeBinding} this
        */
        public unbind(): CompositeBinding;
    }
}
declare module Coral {
    class UIBinding {
        public property: string;
        public binded: boolean;
        constructor(host, chain: string, node: Node, property?: string);
        constructor(host, chain: string, node: JQuery, property?: string);
        private binding;
        public node: JQuery;
        private _result;
        private result;
        /**
        * Internal watcher change handler.<br/>
        * This function assign the Dom node target property with the new value.
        * @private
        */
        public resultChange(newValue?, oldValue?): void;
        /**
        * Start the UI binding.<br/>
        * The current value is automatically set on the HTML DOM node.
        * @method bind
        * @memberof Coral.UIBinding#
        * @returns {Coral.UIBinding} this
        */
        public bind(): UIBinding;
        /**
        * Stop the UI binding.
        * @method unbind
        * @memberof Coral.UIBinding#
        * @returns {Coral.UIBinding} this
        */
        public unbind(): UIBinding;
    }
    class AttributeBinding extends UIBinding {
        constructor(host, chain: string, node: HTMLElement, property: string);
        constructor(host, chain: string, node: JQuery, property: string);
        public resultChange(newValue?, oldValue?): void;
    }
    class StyleBinding extends UIBinding {
        constructor(host, chain: string, node: HTMLElement, property: string);
        constructor(host, chain: string, node: JQuery, property: string);
        public resultChange(newValue?, oldValue?): void;
    }
    class ContentBinding extends UIBinding {
        public raw: boolean;
        constructor(host, chain: string, node: HTMLElement, raw?: boolean);
        constructor(host, chain: string, node: JQuery, raw?: boolean);
        public resultChange(newValue?, oldValue?): void;
    }
    class ClassSwitchBinding extends UIBinding {
        public className: string;
        constructor(host, chain: string, node: HTMLElement, className: string);
        constructor(host, chain: string, node: JQuery, className: string);
        public resultChange(newValue?, oldValue?): void;
    }
    class ClassBinding extends UIBinding {
        constructor(host, chain: string, node: HTMLElement);
        constructor(host, chain: string, node: JQuery);
        public resultChange(newValue?, oldValue?): void;
    }
}
declare module Coral {
    class EventDispatcher {
        private parentDispatcher;
        /**
        * Name of the global event space
        * @constant EventDispatcher.GLOBAL_EVENT_SPACE
        * @type {string}
        * @default
        */
        static GLOBAL_EVENT_SPACE: string;
        /**
        * Delimiter of event and namespace
        * @constant EventDispatcher.EVENT_NAMESPACE_SEPARATOR
        * @type {string}
        * @default
        */
        static EVENT_NAMESPACE_SEPARATOR: string;
        /**
        * <code>EventDispatcher</code> is the based class for all object that need to communicate events to others.
        * If <code>parentDispatcher</code> is specified, all events passed with <code>bubble === true</code> will be dispatched to the
        * parent dispatcher.
        * @constructor Coral.EventDispatcher
        * @param {Coral.EventDispatcher} [parentDispatcher] An optional parent <code>EventDispatcher</code>;
        * @see Coral.Event
        */
        constructor(parentDispatcher?: EventDispatcher);
        private _event_listeners;
        /**
        * on method attach an handler to an event with an optional namespace separated with a ".".
        * @method on
        * @memberof Coral.EventDispatcher#
        * @param {string} event The event key concatenated with an optional namespace
        * @param {Function} handler The callback triggered when the event is dispatched
        * @param {Object} context The context object applied to the handler
        * @param [params] Additional params to be passed to the handler
        * @param {boolean} [one=false] If true, handler will be automaticaly removed the first time it is called
        */
        public on(event: any, handler, context?, params?, one?: boolean): EventDispatcher;
        /**
        * shortcut to {@linkcode Coral.EventDispatcher#on} method with <code>one</code> parameter set to <code>true</code>.
        * @method one
        * @memberof Coral.EventDispatcher#
        * @see EventDispatcher.on
        */
        public one(event, handler, context?, params?): EventDispatcher;
        /**
        * off method remove all attached handlers corresponding to the passed event.
        * @method off
        * @memberof Coral.EventDispatcher#
        * @param {string} event The event key concatenated with an optional namespace.
        */
        public off(event): EventDispatcher;
        /**
        * Dispatch the passed event and trigger all attached handlers
        * @method dispatch
        * @memberof Coral.EventDispatcher#
        * @param {Event} event The event object to dispatch
        */
        public dispatch(event: Event): EventDispatcher;
    }
    class Event {
        public type: string;
        public data: any;
        public bubbles: boolean;
        public target: EventDispatcher;
        public currentTarget: EventDispatcher;
        /**
        * <code>Event</code> is the base class for all events dispatched using {@linkcode Coral.EventDispatcher}
        * @constructor Coral.Event
        * @property {string} type The event key.
        * @property {Object} data Data pass along with the event.
        * @property {boolean} bubbles Bubbling flag.
        * @param {string} type The event key.
        * @param {Object} [data] Additional data to pass with the Event.
        * @param {boolean} [bubbles] If true, event will be dispatched to parent dispatchers until it is stopped.
        * @see Coral.EventDispatcher
        */
        constructor(type: string, data?, bubbles?: boolean);
        private _stopPropagation;
        private _stopImmediatePropagation;
        /**
        * @method isImmediatePropagationStopped
        * @memberof Coral.Event#
        * @returns {boolean} true if {@linkcode Coral.Event#stopImmediatePropagation} has been called on this event.
        */
        public isImmediatePropagationStopped(): boolean;
        /**
        * @method isPropagationStopped
        * @memberof Coral.Event#
        * @returns {boolean} true if {@linkcode Coral.Event#stopPropagation} has been called on this event.
        */
        public isPropagationStopped(): boolean;
        /**
        * Stop the propagation of the event. The event won't be dispatch to parent event dispatcher.
        * @method stopPropagation
        * @memberof Coral.Event#
        */
        public stopPropagation(): void;
        /**
        * Stop immediately the propagation of the event. The event won't be dispatch to parent event dispatcher and pending listeners won't be called.
        * @method stopImmediatePropagation
        * @memberof Coral.Event#
        */
        public stopImmediatePropagation(): void;
    }
}
declare module Coral {
    class Collection<T> extends Coral.EventDispatcher {
        /**
        * Add event key
        * @constant Coral.Collection.ADD_EVENT
        * @type {string}
        * @default "add"
        */
        static ADD_EVENT: string;
        /**
        * Remove event key
        * @constant Coral.Collection.REMOVE_EVENT
        * @type {string}
        * @default "remove"
        */
        static REMOVE_EVENT: string;
        /**
        * Move event key
        * @constant Coral.Collection.MOVE_EVENT
        * @type {string}
        * @default "move"
        */
        static MOVE_EVENT: string;
        /**
        * Set event key
        * @constant Coral.Collection.SET_EVENT
        * @type {string}
        * @default "set"
        */
        static SET_EVENT: string;
        public length: number;
        public items: T[];
        /**
        * Collection class is an <code>Array</code> wrapper that dispatch events upon modification.
        * @constructor Coral.Collection
        * @property {Array} items Inner Array containing elements.
        * @property {number} length The length of the collection. It can be made Bindable.
        * @param {Array} [source] An array used to store content of the collection.
        */
        constructor(source?: T[]);
        /**
        * Add an element to the collection and fire <code>add</code> event.
        * @method add
        * @memberof Coral.Collection#
        * @param obj The object to add.
        * @param {boolean} [unique=false] If <code>true</code>, the element is not added if it already exists in the collection.
        */
        public add(obj: T, unique?: boolean): void;
        /**
        * Add all elements from the Array <code>objs</code>.
        * @method addAll
        * @memberof Coral.Collection#
        * @param {Array} objs Objects to add.
        * @param {boolean} [unique=false] If <code>true</code>, elements are not added if they already exist in the collection.
        */
        public addAll(objs: T[], unique?: boolean): void;
        /**
        * Insert an element in the collection and fire <code>add</code> event.
        * @method insert
        * @memberof Coral.Collection#
        * @param obj The object to add.
        * @param {number} index The index of the added element in the collection.
        * @param {boolean} [unique=false] If <code>true</code>, the element is not added if it already exists in the collection
        */
        public insert(obj: T, index: number, unique?: boolean): void;
        /**
        * Remove an element from the collection and fire <code>remove</code> event.
        * @method remove
        * @memberof Coral.Collectiont#
        * @param obj The object to remove.
        * @param {boolean} [all=false] If code>true</code>, all occurrences of the element are removed.
        */
        public remove(obj: T, all?: boolean): void;
        /**
        * Remove all elements in <code>objs</code> Array from the collection and fire <code>remove</code> events.
        * @method removeAll
        * @memberof Coral.Collection#
        * @param {Array} objs Objects to remove.
        * @param {boolean} [all=false] If true, all occurrences of elements are removed.
        */
        public removeAll(objs: T[], all?: boolean): void;
        /**
        * Move an element into the collection and fire <code>move</code> event.
        * @method move
        * @memberof Coral.Collection#
        * @param {number} from Index of the element to move.
        * @param {number} to New index of the element.
        */
        public move(from: number, to: number): void;
        /**
        * Swap an element with an other.
        * @method swap
        * @memberof Coral.Collection#
        * @param {number} index1 Index of the first element.
        * @param {number} index2 Index of the second element.
        */
        public swap(index1: number, index2: number): void;
        /**
        * Get an element from the collection.
        * @method get
        * @memberof Coral.Collection#
        * @param {number} at Index of the element.
        */
        public get(at: number): T;
        /**
        * Get an element in the collection and fire <code>set</code> event.
        * @method set
        * @memberof Coral.Collection#
        * @param obj The object to set.
        * @param {number} at Index of the element.
        */
        public set(obj: T, at: number): void;
    }
}
/**
* AsynchronousUpdater provide functions to update an object asynchronously
* @namespace Coral.AsynchronousUpdater
*/
declare module Coral.AsynchronousUpdater {
    interface IUpdatableMixin {
        update();
        isUpToDate: boolean;
        planUpdate();
    }
    /**
    * Mixin for all objects that can be updated asynchronously
    * @constant Coral.UpdatableMixin
    * @type {Object}
    */
    var UpdatableMixin: {
        __mixin_name: string;
        update: number;
        isUpToDate: boolean;
        planUpdate: () => void;
    };
    /**
    * Plan an asynchronous update of the <code>updatable</code> object.
    * @method Coral.AsynchronousUpdater.planUpdate
    * @param {Object} updatable An object that implements UpdatableMixin
    */
    function planUpdate(updatable): void;
    /**
    * Trigger update on all registered objects.<br/>
    * This method is automatically called when updates are planned.
    * @method Coral.AsynchronousUpdater.triggerUpdate
    */
    function triggerUpdate(): void;
}
declare module Coral {
    interface IStateMixin {
        matchState(matching: StateMatching): boolean;
    }
    /**
    * Mixin for all objects that can expose state behaviors
    * @constant Coral.StateMixin
    * @type {Object}
    */
    var StateMixin: {
        __mixin_name: string;
        matchState: number;
    };
    /**
    * Event key for state change event
    * @constant Coral.STATE_CHANGE_EVENT
    * @type {string}
    * @default "stateChange"
    */
    var STATE_CHANGE_EVENT: string;
    interface IStateMatching {
        [stateName: string]: string[];
    }
    class StateMatching implements IStateMatching {
        /**
        * StateMatching class represent a state expression.<br/>
        * It is used with {@linkcode Coral.StateMixin} to provide state behaviors.
        * @constructor Coral.StateMatching
        * @param {string} statesExpression A state expression: "." separated state values surrounded with ":" separated state names.<br/>exemple ":state.value1.value2:state2.val1".
        */
        constructor(statesExpression: string);
        /**
        * The key of the default state in a StateMatching object
        * @constant Coral.StateMatching.DEFAULT_STATE
        * @type {string}
        * @default "__default"
        */
        static DEFAULT_STATE: string;
    }
}
declare var global;
declare module Coral {
    class Bind {
        static simpleBindingExp: RegExp;
        static compositeBindingExp: RegExp;
        public mode: number;
        public chain: string;
        /**
        * Bind class represent the declaration of a binding.</br>
        * It is used with {@linkcode Coral.Descriptor} to declare {@linkcode Coral.Binding} and {@linkcode Coral.CompositeBinding}.
        * @constructor Coral.Bind
        * @see $Bind
        * @property {number} mode The chain or composition that represent the binding.
        * @property {string} chain The binding mode : {@linkcode Coral.Bind.SIMPLE_BINDING_MODE} or {@linkcode Coral.Bind.COMPOSITE_BINDING_MODE}.
        * @param {string} chain The chain or composition that represent the binding.
        * @param {number} [mode] The binding mode : {@linkcode Coral.Bind.SIMPLE_BINDING_MODE} or {@linkcode Coral.Bind.COMPOSITE_BINDING_MODE}.
        */
        constructor(chain, mode);
        /**
        * Simple binding flag.
        * @constant Coral.Bind.SIMPLE_BINDING_MODE
        * @type {number}
        * @default 1
        */
        static SIMPLE_BINDING_MODE: number;
        /**
        * Composite binding flag.
        * @constant Coral.Bind.COMPOSITE_BINDING_MODE
        * @type {number}
        * @default 2
        */
        static COMPOSITE_BINDING_MODE: number;
    }
    class BindState {
        public values: {
            v: any;
            s?: Coral.StateMatching;
        }[];
        /**
        * BindState class represent the declaration of a state dependency.<br/>
        * It is used with {@linkcode Coral.Descriptor} and {@linkcode Coral.StateMixin}.
        * @constructor Coral.BindState
        * @see $BindState
        * @property {Array} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
        * @param {Object} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
        */
        constructor(values: {
            _?: any;
        });
        /**
        * Determine the current value for the given context.
        * @method resolve
        * @memberof Coral.BindState#
        * @param {Object} context Context must implements {@linkcode Coral.StateMixin}.
        * @returns {Object} the value that match context current state
        */
        public resolve(context): {
            v: any;
            s?: Coral.StateMatching;
        };
    }
    class Descriptor<T extends Coral.DescribableObject> {
        public type;
        public attributes;
        public events;
        public watchers;
        constructor(type: string, description: IDescriptor);
        /**
        * Static method that create an Array of instances with <code>descriptors</code>
        * @method instanciateAll
        * @memberof Coral.Descriptor.
        * @param {Array} descriptors An Array of descriptors to instanciate
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context
        * @param [owner] The object that create and own the new instance
        * @param [from] An optional start index for the creation
        * @param [to] An optional end index for the creation
        */
        static instanciateAll<T extends Coral.DescribableObject>(descriptors: Descriptor<T>[], context?, owner?, from?: number, to?: number): T[];
        /**
        * Method that create a new instance of the described class
        * @method instanciate
        * @memberof Coral.Descriptor#
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context
        * @param [owner] The object that create and own the new instance
        * @param [item] An optional item used for item rendering
        */
        public instanciate(context?, owner?, item?): T;
    }
    interface IDescriptor {
        includeIn?: string;
        excludeFrom?: string;
        include?: string;
    }
}
/**
* Shortcut to quickly create a {@linkcode Coral.Bind} object.<br/>
* Binding mode is detected automatically.
* @method $Bind
* @see Coral.Bind
* @param {string} chain The chain or composition that represent the binding
* @returns {Coral.Bind}
*/
declare function $Bind(chain: string): any;
/**
* Shortcut to quickly create a {@linkcode Coral.BindState} object.
* @method $BindState
* @see Coral.BindState
* @param {Object} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
* @returns {Coral.BindState}
*/
declare function $BindState(values: {
    _?: string;
}): any;
/**
* Shortcut to quickly create a {@linkcode Coral.Descriptor} object
* @method $Descriptor
* @see Coral.Descriptor
* @param type The class described by this descriptor
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Descriptor<T extends Coral.DescribableObject>(type, description: Coral.IDescriptor): Coral.Descriptor<T>;
declare module Coral {
    class DescribableObject extends Coral.EventDispatcher {
        public id: string;
        public item;
        public context;
        public owner;
        public description: Coral.Descriptor<DescribableObject>;
        public uid: number;
        public isUpToDate: boolean;
        public planUpdate: () => any;
        /**
        * DescribableObject class is the base class for all objects that can be instanciated using {@linkcode Coral.Descriptor}
        * @constructor Coral.DescribableObject
        * @extends Coral.EventDispatcher
        * @see $DescribableObject
        * @property {Object} context The context for bindings and listeners.
        * @property {Object} owner The owner of this instance.
        * @property {Coral.Descriptor} description Internal default description of the object.
        * @property {number} uid An unique identifier.
        * @property {string} id An optional name for this instance.
        * @property item The data that this object represent. Used with item rendering.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<DescribableObject>, context?, owner?, item?);
        private _externalDescription;
        private _descriptions;
        private includeIn;
        private excludeFrom;
        private include;
        /**
        * @private
        */
        public triggerDescriptions(): void;
        /**
        * @private
        */
        public triggerInternalDescriptions(): void;
        /**
        * @private
        */
        public triggerExternalDescription(): void;
        /**
        * @private
        */
        public triggerInternalDescriptionsEventsAndWatchers(target, degree: number, first?: boolean): void;
        /**
        * @private
        */
        public triggerInternalDescriptionsProperties(target, degree: number, first?: boolean): void;
        /**
        * @private
        */
        public triggerDescriptionEventsAndWatchers(description, context, degree: number, first?: boolean): void;
        /**
        * @private
        */
        public triggerDescriptionProperties(description, context, degree: number, first?: boolean): void;
        /**
        * @method isExternal
        * @memberof Coral.DescribableObject#
        * @param {string} property The property key.
        * @returns {boolean} 'true' if the property is defined using an external descriptor.
        */
        public isExternal(property: string): boolean;
        /**
        * Update function use for asynchronous updates
        * @method update
        * @memberof Coral.DescribableObject#
        */
        public update(): void;
        /**
        * Bindings and watchers create cross references between objects.<br/>
        * <code>destroy</code> call <code>unbind</code> on all of them to clean all references to this object.<br/>
        * Removing a {@linkcode Coral.DescribableObject} without calling destroy may prevent it from being garbage collected.
        * @method destroy
        * @memberof Coral.DescribableObject#
        */
        public destroy(): void;
    }
    interface IDescribableObjectDescriptor extends Coral.IDescriptor {
        id?: string;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.DescribableObject} Descriptor
* @method $DescribableObject
* @see Coral.DescribableObject
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $DescribableObject(description: Coral.IDescribableObjectDescriptor): Coral.Descriptor<Coral.DescribableObject>;
declare module Coral {
    class Task extends Coral.DescribableObject {
        /**
        * Run event key
        * @constant Coral.Task.RUN_EVENT
        * @type {string}
        * @default "run"
        */
        static RUN_EVENT: string;
        /**
        * Done event key
        * @constant Coral.Task.DONE_EVENT
        * @type {string}
        * @default "done"
        */
        static DONE_EVENT: string;
        /**
        * Cancel event key
        * @constant Coral.Task.CANCEL_EVENT
        * @type {string}
        * @default "cancel"
        */
        static CANCEL_EVENT: string;
        public canceled: boolean;
        public running: boolean;
        public critical: boolean;
        /**
        * Task is the base class for running a job.
        * @constructor Coral.Task
        * @extends Coral.DescribableObject
        * @see $Task
        * @property {boolean} running A <code>true</code> value means that the Task is running.
        * @property {boolean} canceled A <code>true</code> value means that the last execution has been canceled.
        * @property {boolean} critical A <code>true</code> value means that dependant tasks must also be canceled with this one. Default value : <code>true</code>.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<Task>, context?, owner?, item?);
        /**
        * Execute the task and dispatch "run" event
        * @method run
        * @memberof Coral.Task#
        */
        public run(): void;
        /**
        * Cancel the task if it is running
        * If the task is canceled, a "cancel" event is dispatched
        * @method cancel
        * @memberof Coral.Task#
        */
        public cancel(): void;
        /**
        * End the task execution and dispatch a "done" event
        * @method done
        * @memberof Coral.Task#
        */
        public done(): void;
    }
    interface ITaskDescriptor extends Coral.IDescribableObjectDescriptor {
        critical?: boolean;
        cancelEvent?;
        runEvent?;
        doneEvent?;
        runningWatcher?;
        canceledWatcher?;
        criticalWatcher?;
    }
    class SequentialTasks extends Task {
        public tasks: Task[];
        /**
        * SequentialTasks is a Task that run nested "tasks" sequentialy
        * @constructor Coral.SequentialTasks
        * @extends Coral.Task
        * @see $SequentialTasks
        * @property {Array} tasks An array of {@linkcode Coral.Descriptor}. Object described must extends {@linkcode Coral.Task}.
        * @param {Coral.Descriptor} [description] A descriptor
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance
        * @param [item] An optional item used for item rendering
        */
        constructor(description?: Coral.Descriptor<SequentialTasks>, context?, owner?, item?);
        private tasksInitialized;
        private taskIndex;
        /**
        * Execute all tasks described in tasks property sequentialy
        * @method run
        * @memberof Coral.SequentialTasks#
        */
        public run(): void;
        /**
        * Cancel this task by calling cancel on all runnig sub tasks
        * @method cancel
        * @memberof Coral.SequentialTasks#
        */
        public cancel(): void;
        /**
        * @private
        */
        public subTaskCanceled(event): void;
        /**
        * @private
        */
        public runNext(): void;
        /**
        * Call super class destroy and destroy sub tasks
        * @method destroy
        * @memberof Coral.SequentialTasks#
        */
        public destroy(): void;
    }
    interface ISequentialTasksDescriptor extends ITaskDescriptor {
        tasks?: Coral.Descriptor<Task>[];
    }
    class ParallelTasks extends Task {
        public tasks: Task[];
        /**
        * ParallelTasks is a {@linkcode Coral.Task} that run nested <code>tasks</code> in parallel.
        * @constructor Coral.ParallelTasks
        * @extends Coral.Task
        * @see $ParallelTasks
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<ParallelTasks>, context?, owner?, item?);
        private tasksInitialized;
        private taskCount;
        /**
        * Execute all tasks described in <code>tasks</code> property in parallel.
        * @method run
        * @memberof Coral.ParallelTasks#
        */
        public run(): void;
        /**
        * Cancel this task by calling cancel on all runnig sub tasks.
        * @method cancel
        * @memberof Coral.ParallelTasks#
        */
        public cancel(): void;
        /**
        * @private
        */
        public subTaskCanceled(event: Coral.Event): void;
        /**
        * @private
        */
        public partialDone(): void;
        /**
        * Destroy sub tasks.
        * @method destroy
        * @memberof Coral.ParallelTasks#
        */
        public destroy(): void;
    }
    interface IParallelTasksDescriptor extends ITaskDescriptor {
        tasks?: Coral.Descriptor<Task>[];
    }
}
/**
* Shortcut for creating a {@linkcode Coral.Task} Descriptor.
* @method $Task
* @see Coral.Task
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Task(description: Coral.ITaskDescriptor): Coral.Descriptor<Coral.Task>;
/**
* Shortcut for creating a {@linkcode Coral.SequentialTasks} Descriptor.
* @method $SequentialTasks
* @see Coral.SequentialTasks
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $SequentialTasks(description: Coral.ISequentialTasksDescriptor): Coral.Descriptor<Coral.SequentialTasks>;
/**
* Shortcut for creating a {@linkcode Coral.ParallelTasks} Descriptor.
* @method $ParallelTasks
* @see Coral.ParallelTasks
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $ParallelTasks(description: Coral.IParallelTasksDescriptor): Coral.Descriptor<Coral.ParallelTasks>;
declare module Coral {
    class DescriptorsFactory extends Coral.DescribableObject {
        public collection: Coral.Collection<Coral.DescribableObject>;
        public external: boolean;
        /**
        * DescriptorsFactory manage an array of descriptors, instanciate described object and add them to the passed collection<br/>
        * DescriptorsFactory take some special properties into account:<ul>
        * <li><code>includeIn</code> : a state expression; the described object will be included in DOM only if <code>includeIn</code> match current state</li>
        * <li><code>excludeFrom</code> : a state expression; the described object will be included in DOM only if <code>excludeFrom</code> do not match current state</li>
        * <li><code>include</code> : a binding chain; the described object will be included in DOM only if the result of this binding is <code>true</code></li>
        * </ul>
        * @constructor Coral.DescriptorsFactory
        * @extends Coral.DescribableObject
        * @see $DescriptorsFactory
        * @property {Array} descriptors The Array of descriptor to manage.
        * @property {number} from The begin index in <code>descriptors</code>.
        * @property {number} to The end index in <code>descriptors</code>.
        * @property {Coral.Collection} collection The result collection where instances are stored.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<DescriptorsFactory>, context?, owner?, item?);
        private instances;
        private _descriptorsUpToDate;
        private _rangeUpToDate;
        private dependsOnOwnerState;
        private _descriptors;
        public descriptors : Coral.Descriptor<Coral.DescribableObject>[];
        private _from;
        public from : number;
        private _to;
        public to : number;
        /**
        * Asynchronous update<br/>
        * It creates all instances from <code>descriptors</code> taking in account <code>from</code>, <code>to</code> and all special properties
        * @method update
        * @memberof Coral.DescriptorsFactory#
        */
        public update(): void;
        /**
        * @private
        */
        public checkInstance(index: number): void;
        /**
        * @private
        */
        public activateInstance(index: number): void;
        /**
        * @private
        */
        public deactivateInstance(index: number): void;
        public includeChange(oldValue?, newValue?, index?: number): void;
        /**
        * @private
        */
        public stateChange(event: Coral.Event): void;
        /**
        * @private
        */
        public calculateCollectionIndex(index: number): number;
        /**
        * @private
        */
        public parseIncludeProperty(include: string): string[][];
        public destroy(): void;
    }
    interface IDescriptorsFactoryDescriptor extends Coral.IDescribableObjectDescriptor {
        descriptors?: Coral.Descriptor<Coral.DescribableObject>[];
        from?: number;
        to?: number;
        collection?: Coral.Collection<Coral.DescribableObject>;
        descriptorsWatcher?;
        fromWatcher?;
        toWatcher?;
        collectionWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.DescriptorsFactory} Descriptor.
* @method $DescriptorsFactory
* @see Coral.DescriptorsFactory
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $DescriptorsFactory(description: Coral.IDescriptorsFactoryDescriptor): Coral.Descriptor<Coral.DescriptorsFactory>;
declare module Coral {
    class DataDescriptorsFactory extends Coral.DescribableObject {
        public collection: Coral.Collection<Coral.DescribableObject>;
        /**
        * DataDescriptorsFactory create <code>itemDescriptor</code> instances for every object contains in <code>items</code> collection. Changes on <code>items</code> are tracked to ensure all instances are up to date.
        * @constructor Coral.DataDescriptorsFactory
        * @extends Coral.DescribableObject
        * @see $DataDescriptorsFactory
        * @property {Coral.Collection} items The collection of data objects.
        * @property {Coral.Descriptor} itemDescriptor The descriptor that will be instanciated for every item.
        * @property {Coral.Collection} collection The result collection where instances are stored.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<DataDescriptorsFactory>, context?, owner?, item?);
        private external;
        private _itemsUpToDate;
        private _items;
        public items : Coral.Collection<any>;
        private _itemDescriptorUpToDate;
        private _itemDescriptor;
        public itemDescriptor : Coral.Descriptor<Coral.DescribableObject>;
        /**
        * @private
        */
        public addHandler(event: Coral.Event): void;
        /**
        * @private
        */
        public removeHandler(event: Coral.Event): void;
        public moveHandler(event: Coral.Event): void;
        /**
        * @private
        */
        public setHandler(event: Coral.Event): void;
        /**
        * Asynchronous update<br/>
        * Check manually that items and collection are synchronized
        * @method update
        * @memberof Coral.DataDescriptorsFactory#
        */
        public update(): void;
        public destroy(): void;
    }
    interface IDataDescriptorsFactoryDescriptor extends Coral.IDescribableObjectDescriptor {
        items?: Coral.Collection<any>;
        itemDescriptor?: Coral.Descriptor<Coral.DescribableObject>;
        collection?: Coral.Collection<Coral.DescribableObject>;
        itemsWatcher?;
        itemDescriptorWatcher?;
        collectionWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.DataDescriptorsFactory} Descriptor
* @method $DataDescriptorsFactory
* @see Coral.DataDescriptorsFactory
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $DataDescriptorsFactory(description: Coral.IDataDescriptorsFactoryDescriptor): Coral.Descriptor<Coral.DataDescriptorsFactory>;
declare module Coral {
    class ActionMap extends Coral.DescribableObject {
        public actions: Action[];
        /**
        * ActionMap is an {@linkcode Coral.Action} list responding to events dispatched by the owner.<br/>
        * The owner of this object must be an {@linkcode Coral.EventDispatcher}.
        * @constructor Coral.ActionMap
        * @extends Coral.DescribableObject
        * @see $ActionMap
        * @property {Array} actions An Array of {@linkcode Coral.Descriptor}. Object described must extends {@linkcode Coral.Action}.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<ActionMap>, context?, owner?, item?);
        /**
        * Destroy this instance and all nested {@linkcode Coral.Action}
        * @method destroy
        * @memberof Coral.ActionMap#
        */
        public destroy(): void;
    }
    interface IActionMapDescriptor extends Coral.IDescribableObjectDescriptor {
        actions?: Coral.Descriptor<Action>[];
    }
    class Action extends Coral.SequentialTasks {
        public event: string;
        public currentEvent: any;
        /**
        * Action is a {@linkcode Coral.SequentialTasks} that automatically run when the owner of the parent {@linkcode Coral.ActionMap} dispatch {@linkcode Coral.Action#event}.<br/>
        * Action expose the event in {@linkcode Coral.Action#currentEvent} property during execution.
        * @constructor Coral.Action
        * @extends Coral.SequentialTasks
        * @see $Action
        * @property {string} event The event key to listen to.
        * @property {Coral.Event} currentEvent The current event that triggered this action. <code>currentEvent</code> is not set when the action is not running.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<Action>, context?, owner?, item?);
        public done(): void;
        public cancel(): void;
        public destroy(): void;
    }
    interface IActionDescriptor extends Coral.ISequentialTasksDescriptor {
        event?: string;
        eventWatcher?;
        currentEventWatcher?;
    }
}
/**
* Shortcut for creating an {@linkcode Coral.ActionMap} descriptor.
* @method $ActionMap
* @see Coral.ActionMap
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $ActionMap(description: Coral.IActionMapDescriptor): Coral.Descriptor<Coral.ActionMap>;
/**
* Shortcut for creating an {@linkcode Coral.Action} descriptor.
* @method $Action
* @see Coral.Action
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Action(description: Coral.IActionDescriptor): Coral.Descriptor<Coral.Action>;
declare module Coral {
    class NavigationMap extends Coral.DescribableObject {
        public mode: number;
        public actions: NavigationAction[];
        public currentPath: string;
        /**
        * <code>NavigationMap</code> listen to history API and trigger childs {@linkcode NavigationAction} when change occurs.<br/>
        * <code>NavigationMap</code> can only be instanciated once, any other call to the constructor will raise an error.<br/>
        * You can get the unique instance of <code>NavigationMap</code> by accessing {@linkcode NavigationMap.instance}.
        * @constructor Coral.NavigationMap
        * @extends Coral.DescribableObject
        * @see $NavigationMap
        * @property {number} mode <code>NavigationMap.NONE_MODE</code> or <code>NavigationMap.HISTORY_MODE</code>.
        * @property {Array} actions An Array of {@linkcode Coral.Descriptor}. Described objects must extends {@linkcode Coral.NavigationAction}.
        * @property {string} currentPath The current path of the navigation.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<NavigationMap>, context?, owner?);
        private historyState;
        private _rootPath;
        private _subPath;
        /**
        * Unique instance of NavigationMap
        * @type {Coral.NavigationMap}
        * @name Coral.NavigationMap.instance
        */
        static instance: NavigationMap;
        /**
        * Navigation flag 'none'
        * @constant Coral.NavigationMap.NONE_MODE
        * @type {number}
        * @default 1
        */
        static NONE_MODE: number;
        /**
        * Navigation flag 'history'
        * @constant Coral.NavigationMap.HISTORY_MODE
        * @type {number}
        * @default 2
        */
        static HISTORY_MODE: number;
        public _handlePopState(event): void;
        /**
        * @private
        */
        static normalize(path: string): string;
        public _calculateSubPath(path: string): void;
        public _calculatePath(subPath: string): void;
        /**
        * Start the <code>NavigationMap</code> and trigger nested {@linkcode Coral.NavigationAction} that match <code>currentPath</code>.
        * @method start
        * @memberof Coral.NavigationMap#
        */
        public start(rootPath?: string, silent?: boolean, fullPath?: string): void;
        /**
        * Navigate to a new path and trigger all matching nested NavigationAction.
        * @method navigate
        * @memberof Coral.NavigationMap#
        */
        public navigate(path: string, replace?: boolean, state?): void;
        /**
        * Trigger all nested NavigationAction that match current path.
        * @method triggerActions
        * @memberof Coral.NavigationMap#
        */
        public triggerActions(): void;
        /**
        * Destroy this object and all nested actions.
        * @method destroy
        * @memberof Coral.NavigationMap#
        */
        public destroy(): void;
    }
    interface INavigationMapDescriptor extends Coral.IDescribableObjectDescriptor {
        actions?: Coral.Descriptor<NavigationAction>[];
        mode?: number;
        currentPathWatcher?;
    }
    class NavigationAction extends Coral.SequentialTasks {
        public path: string;
        public params: any;
        /**
        * NavigationAction is a {@linkcode Coral.SequentialTasks} that automatically run when navigation change to a path that match <code>path</code> property.<br/>
        * Navigation params are directly accesible in {@linkcode Coral.NavigationMap} under <code>params</code> object.
        * @constructor Coral.NavigationAction
        * @extends Coral.SequentialTasks
        * @see $NavigationAction
        * @property {string} path An expression of a path. It must match <code>/([^{}]+|{([^{}]+)})+/</code>.
        * @property {Object} params All captured params specified in the path expression.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<NavigationAction>, context?, owner?);
        private _path;
        private _pathExpression;
        private _names;
        /**
        * Check if the given path match the path expression and then run the NavigationAction
        * @method applyPath
        * @memberof Coral.NavigationAction#
        * @param {string} path The path to match
        * @returns {boolean} <code>true</code> if the <code>NavigationAction</code> starts running
        */
        public applyPath(path): boolean;
    }
    interface INavigationActionDescriptor extends Coral.ISequentialTasksDescriptor {
        path?: string;
        pathWatcher?;
        paramsWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.NavigationMap} Descriptor.
* @method $NavigationMap
* @see Coral.NavigationMap
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $NavigationMap(description: Coral.INavigationMapDescriptor): Coral.Descriptor<Coral.NavigationMap>;
/**
* Shortcut for creating a {@linkcode Coral.NavigationAction} Descriptor.
* @method $NavigationAction
* @see Coral.NavigationAction
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $NavigationAction(description: Coral.INavigationActionDescriptor): Coral.Descriptor<Coral.NavigationAction>;
declare module Coral {
    class MethodTask extends Coral.Task {
        public apply: boolean;
        public target;
        public method: string;
        public params;
        /**
        * MethodTask is a simple task that call a method on a given object.
        * @constructor Coral.MethodTask
        * @extends Coral.Task
        * @see $MethodTask
        * @property {Object} target The object hosting <code>method</code>.
        * @property {string} method The method to call on object <code>target</code>.
        * @property {boolean} apply If <code>true</code>, the method is call with <code>apply</code>.
        * @property {Object} params Params to pass to the method.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<MethodTask>, context?, owner?);
        public run(): void;
    }
    interface IMethodTaskDescriptor extends Coral.ITaskDescriptor {
        target?: Object;
        method?: string;
        apply?: boolean;
        params?;
        targetWatcher?;
        methodWatcher?;
        applyWatcher?;
        paramsWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.MethodTask} Descriptor
* @method $MethodTask
* @see Coral.MethodTask
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $MethodTask(description: Coral.IMethodTaskDescriptor): Coral.Descriptor<Coral.MethodTask>;
declare module Coral {
    class SetTask extends Coral.Task {
        public target;
        public property: string;
        public value;
        /**
        * SetTask is a simple task that set a value on a given object.
        * @constructor Coral.SetTask
        * @extends Coral.Task
        * @see $SetTask
        * @property {Object} target The object hosting <code>property</code>.
        * @property {string} property The property key to set.
        * @property {Object} value The value to set property with.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<SetTask>, context?, owner?);
        public run(): void;
    }
    interface ISetTaskDescriptor extends Coral.ITaskDescriptor {
        target?: Object;
        property?: string;
        value?;
        targetWatcher?;
        propertyWatcher?;
        valueWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.SetTask} Descriptor.
* @method $SetTask
* @see Coral.SetTask
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $SetTask(description: Coral.ISetTaskDescriptor): Coral.Descriptor<Coral.SetTask>;
declare module Meta {
    /**
    * Generate Model behavior in the given object.
    * @method Meta#Model
    * @param {Object} prototype Class prototype or Object where properties will be added.
    * @param {string} name The unique name of this model.
    * @param {string} primaryKey The primary key of this model object.
    * @param {Array} keys All keys that belongs to the model.
    */
    function Model(prototype, name: string, primaryKey: string, keys: string[]): void;
    module Model {
        var MODEL_NAME_KEY: string;
        var MODEL_KEYS_KEY: string;
        var MODEL_PRIMARY_KEY: string;
        var MODEL_KEY: string;
        var MODEL_DIRTY_KEY: string;
        /**
        * Register a new model attribute.
        * @method Meta.Model.ModelAttribute
        * @param {Object} object Class prototype or Object where property will be added.
        * @param {string} key The key to add in this model object.
        */
        function ModelAttribute(object, key: string): void;
        /**
        * Get the model name of this object.
        * @method Meta.Model.getModelName
        * @param {Object} object
        * @returns {string} Model name.
        */
        function getModelName(object): string;
        /**
        * Get the model primary key name of this object.
        * @method Meta.Model.getPrimaryKey
        * @param {Object} object
        * @returns {string} Primary key name.
        */
        function getPrimaryKey(object): string;
        /**
        * Get the model keys of this object.
        * @method Meta.Model.getKeys
        * @param {Object} object
        * @returns {Array} Model keys.
        */
        function getKeys(object): string[];
        /**
        * Get the model primary key name of this object.
        * @method Meta.Model.getPrimaryValue
        * @param {Object} object
        * @returns {Object} The primary key value.
        */
        function getPrimaryValue(object): any;
        /**
        * Check if an object has dirty model properties.
        * @method Meta.Model.isDirty
        * @param {Object} object
        * @returns {boolean} <code>true</code> if the object is dirty.
        */
        function isDirty(object): boolean;
        /**
        * Change the dirty flag to false.
        * @method Meta.Model.clean
        * @param {Object} object
        */
        function clean(object): void;
        /**
        * Get all model data as a separated object.
        * @method Meta.Model.getModelData
        * @param {Object} object
        * @returns {Object} The current model data.
        */
        function getModelData(object): any;
        /**
        * Set the model data object.
        * @method Meta.Model.setModelData
        * @param {Object} object
        * @param {Object} data The new model data.
        * @param {boolean} [silent=false] if <code>true</code> binding are not triggered.
        */
        function setModelData(object, data, silent?: boolean): void;
        module Store {
            var _stores: {};
            function _createStore(name: string): void;
            /**
            * Get or update the model corresponding to given parameters.
            * @method Meta.Model.Store.getModel
            * @param {Object} type Class or prototype of a model object.
            * @param {Object} rawData model data.
            * @returns {Object} model.
            */
            function getModel(type, rawData): any;
            /**
            * Get or update models corresponding to given parameters.
            * @method Meta.Model.Store.getModels
            * @param {Object} type Class or prototype of a model object.
            * @param {Object} rawDatas models data.
            * @returns {Array} models.
            */
            function getModels(type, rawDatas: any[]): any[];
            /**
            * Store a given model.
            * @method Meta.Model.Store.registerModel
            * @param {Object} model A model instance.
            * @returns {boolean} <code>true</code> if the model has been stored properly.
            */
            function registerModel(model): boolean;
            /**
            * Get a model from the cache by its primary key.
            * @method Meta.Model.Store.modelByKey
            * @param {Object} type Class or prototype of a model object.
            * @param {string} primaryValue The primary key.
            * @returns {Object} the requested model.
            */
            function modelByKey(type, primaryValue);
            /**
            * Clear the store of models identified by its model name.<br/>
            * If no name is specified, all stores are cleared.
            * @method Meta.Model.Store.clear
            * @param {string} [name] The name of the model.
            */
            function clear(name: string): void;
        }
    }
}
declare module Meta {
    /**
    * Generate a style property on the target object.<br/>
    * Target object must extend {@linkcode Coral.Component}.
    * @method Meta#StyleProperty
    * @param {Object} object Target class prototype or Object
    * @param {string} key Property key for the style attribute
    * @param {string} styleKey Style key on the Dom element
    */
    function StyleProperty(object: {
        $el: JQuery;
    }, key: string, styleKey?: string): void;
    module StyleProperty {
        /**
        * Metadata key where explicit styles are stored.
        * @constant Meta.StyleProperty.EXPLICIT_STYLE_KEY
        * @type {string}
        * @default
        */
        var EXPLICIT_STYLE_KEY: string;
        /**
        * Apply all explicit styles to the Dom element.
        * @method Meta.StyleProperty.applyExplicitStyles
        * @param {Object} object Target object.
        */
        function applyExplicitStyles(object: {
            $el: JQuery;
        }): void;
    }
}
declare module Coral {
    class Component extends Coral.DescribableObject {
        /**
        * Add event key
        * @constant Coral.Component.INIT_EVENT
        * @type {string}
        * @default "init"
        */
        static INIT_EVENT: string;
        /**
        * Add event key
        * @constant Coral.Component.COMPLETE_EVENT
        * @type {string}
        * @default "complete"
        */
        static COMPLETE_EVENT: string;
        /**
        * Add event key
        * @constant Coral.Component.ATTACH_COMPONENT_EVENT
        * @type {string}
        * @default "attachComponent"
        */
        static ATTACH_COMPONENT_EVENT: string;
        /**
        * Add event key
        * @constant Coral.Component.DETACH_COMPONENT_EVENT
        * @type {string}
        * @default "detachComponent"
        */
        static DETACH_COMPONENT_EVENT: string;
        /**
        * Add event key
        * @constant Coral.Component.ADDED_TO_DISPLAY_EVENT
        * @type {string}
        * @default "addedToDisplay"
        */
        static ADDED_TO_DISPLAY_EVENT: string;
        /**
        * Add event key
        * @constant Coral.Component.REMOVED_FROM_DISPLAY_EVENT
        * @type {string}
        * @default "removedFromDisplay"
        */
        static REMOVED_FROM_DISPLAY_EVENT: string;
        static skinDiv: HTMLElement;
        public el: HTMLElement;
        public $el: JQuery;
        public skin: any;
        public width;
        public minWidth;
        public maxWidth;
        public height;
        public minHeight;
        public maxHeight;
        public top;
        public bottom;
        public left;
        public right;
        public marginTop;
        public marginBottom;
        public marginLeft;
        public marginRight;
        public paddingTop;
        public paddingBottom;
        public paddingLeft;
        public paddingRight;
        public display: string;
        public position: string;
        public flex;
        public opacity: number;
        public defs: Coral.DescribableObject[];
        public states: Coral.DescribableObject[];
        public isAddedToDisplay: boolean;
        public parent: Component;
        public $container: JQuery;
        public directives;
        /**
        * <code>Component</code> class is the base class for all UI components.
        * @constructor Coral.Component
        * @extends Coral.DescribableObject
        * @see $Component
        * @property {HTMLElement} el Dom element for this component. <code>el</code> is a simple DIV by default. If a skin is specified, <code>el</code> is the root element of this skin. <code>el</code> can be specifed explicitly.
        * @property {JQuery} $el JQuery wrapper for el property.
        * @property {JQuery|HTMLElement|string} skin The html skin use for this component. If skin is a Jquery wrapper or a DOM node, <code>el</code> will be a deep copy of it.
        * @property {string|number} width width style property.
        * @property {string|number} minWidth minWidth style property.
        * @property {string|number} maxWidth maxWidth style property.
        * @property {string|number} height height style property.
        * @property {string|number} minHeight minHeight style property.
        * @property {string|number} maxHeight maxHeight style property.
        * @property {string|number} top top style property.
        * @property {string|number} bottom bottom style property.
        * @property {string|number} left left style property.
        * @property {string|number} right right style property.
        * @property {string|number} marginTop marginTop style property.
        * @property {string|number} marginBottom marginBottom style property.
        * @property {string|number} marginLeft marginLeft style property.
        * @property {string|number} marginRight marginRight style property.
        * @property {string|number} paddingTop paddingTop style property.
        * @property {string|number} paddingBottom paddingBottom style property.
        * @property {string|number} paddingLeft paddingLeft style property.
        * @property {string|number} paddingRight paddingRight style property.
        * @property {string} display display style property.
        * @property {string} position position style property.
        * @property {string|number} flex flex style property.
        * @property {number} opacity opacity style property.
        * @property {Array} defs An array of {@linkcode Coral.Descriptor}. All described objects are instanciated during construction.
        * @property {Array} states An array of {@linkcode Coral.Descriptor}. All described objects shall extends {@linkcode Coral.State}.
        * @property {boolean} isAddedToDisplay <code>true</code> if the component is currently present in the DOM tree.
        * @property {Coral.Component} parent The parent <code>Component</code> in the DOM tree.
        * @property {Jquery} $container A JQuery wrapper to the parent container.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<Component>, context?, owner?, item?);
        private _statesMap;
        private _defaultState;
        private _directive_binding;
        private _directive_attach;
        private _directive_action;
        private _directive_container;
        private _attachedComponents;
        private _domevents;
        public render(): void;
        /**
        * Implementation of {@linkcode Coral.StateMixin} matchState method.<br/>
        * State management in a Component is done through {@linkcode Coral.State}, {@linkcode Coral.StateValue} and {@linkcode Coral.Transition}.
        * @method matchState
        * @memberof Coral.Component#
        * @param {Coral.StateMatching} states States to match with the current state.
        * @returns {boolean} <code>true</code> if provided <code>states</code> match current state.
        */
        public matchState(states: Coral.StateMatching): boolean;
        public _registerState(state: Coral.State): void;
        /**
        * Handler called when a change event is dispatch on any State
        * @private
        */
        public _stateChangeHandler(event: Coral.Event): void;
        /**
        * Return the {@linkcode Coral.State} matching stateName parameter.<br/>
        * If no value is passed, "state" is took instead.
        * @method getState
        * @memberof Coral.Component#
        * @param {string} [stateName="state"] State name.
        * @returns {string} The state corresponding to the given state name.
        */
        public getState(stateName: string): Coral.State;
        /**
        * This method build the skin if needed and assign it to <code>this.el</code>.</br>
        * If <code>el</code> is already defined <code>skin</code> is not taken in a account.<br/>
        * Skin can be a DOM node to be copied or an HTML string.<br/>
        * If no skin is specified, the default skin is a simple DIV tag.
        * @method buildSkin
        * @memberof Coral.Component#
        */
        public buildSkin(): void;
        /**
        * Apply all directives registered in <code>directives</code> property<br/>
        * Create bindings associated with data-text, data-html, data-style-*, data-attr-*, data-class-* attributes of the skin.<br/>
        * Create listeners associated with data-action attributes of the skin.
        * @method applyDirectives
        * @memberof Coral.Component#
        */
        public applyDirectives(): void;
        /**
        * Remove all bindings, events, etc. created from directives
        * @method clearDirectives
        * @memberof Coral.Component#
        */
        public clearDirectives(): void;
        /**
        * Find the DOM element matching <code>target</code> parameter
        * @method findTarget
        * @memberof Coral.Component#
        * @param {string} target The target <code>data-container</code> value.
        * @param {HTMLElement} [el=this.el] DOM element where the search start.
        * @returns {HTMLElement} the dom element matching <code>target</code>
        */
        public findTarget(target: string, el?: HTMLElement);
        /**
        * Attach a component to this one. <code>parent</code> and <code>$container</code> are set on the attached component.
        * @method attachComponent
        * @memberof Coral.Component#
        * @param {Coral.Component} component The component to attach.
        * @param {number} index Insertion index in the target.
        * @param {JQuery} [target=this.$el] target DOM element where the component is attached.
        */
        public attachComponent(component: Component, index: number, target?: JQuery): void;
        /**
        * Detach a component from this one. <code>parent</code> and <code>$container</code> are unset on the attached component.
        * @method detachComponent
        * @memberof Coral.Component#
        * @param {Coral.Component} component The component to detach.
        */
        public detachComponent(component: Component): void;
        /**
        * This method is called when the view is added to the display.<br/>
        * It dispatch a <code>addedToDisplay</code> event where you can add DOM event listeners.
        * @method addedToDisplay
        * @memberof Coral.Component#
        */
        public addedToDisplay(): void;
        /**
        * This method is called when the view is removed from the display.<br/>
        * It dispatch a <code>removedFromDisplay</code> event where you can remove DOM event listeners
        * @method removedFromDisplay
        * @memberof Coral.Component#
        */
        public removedFromDisplay(): void;
        public destroy(): void;
        public addDomEvent(node: HTMLElement, type: string, namespace: string, handler): {
            node: HTMLElement;
            type: string;
            namespace: string;
            handler: any;
        };
        public applyDomEvent(domEvent): void;
        public unapplyDomEvent(domEvent): void;
        public removeDomEvent(node: HTMLElement, type: string, namespace: string): void;
        /**
        * A map containing all dom events manage by {@linkcode Coral.Component#on} method
        * @constant Coral.Component.domEvents
        * @type {Object}
        * @default
        */
        static domEvents: {
            click: boolean;
            dblclick: boolean;
            mousedown: boolean;
            mousemove: boolean;
            mouseover: boolean;
            mouseout: boolean;
            mouseup: boolean;
            keydown: boolean;
            keypress: boolean;
            keyup: boolean;
            abort: boolean;
            error: boolean;
            load: boolean;
            resize: boolean;
            scroll: boolean;
            unload: boolean;
            blur: boolean;
            change: boolean;
            focus: boolean;
            reset: boolean;
            select: boolean;
            submit: boolean;
            focusin: boolean;
            focusout: boolean;
            touchstart: boolean;
            touchend: boolean;
            touchmove: boolean;
            touchenter: boolean;
            touchleave: boolean;
            touchcancel: boolean;
            dragstart: boolean;
            drag: boolean;
            dragenter: boolean;
            dragleave: boolean;
            dragover: boolean;
            drop: boolean;
            dragend: boolean;
        };
        /**
        * A map containing all computed events manage by {@linkcode Coral.Component#on} method
        * @constant Coral.Component.computedEvents
        * @type {Object}
        * @default
        */
        static computedEvents: {
            [computedEvent: string]: any;
        };
        private __computed_event_delegate;
        /**
        * override {@linkcode Coral.EventDispatcher#on}<br/>
        * If <code>event</code> is present in the {@linkcode Coral.Component.domEvents} map, an event listener on <code>el</code> is created.<br/>
        * If <code>event</code> is present in the {@linkcode Coral.Component.computedEvents} map, a ComputedEventDelegate is created with the component.<br/>
        * If <code>event</code> is not present in the last two maps, default behavior.
        * @method on
        * @memberof Coral.Component#
        * @param {string} event The event key concatenated with an optional namespace
        * @param {Function} handler The callback triggered when the event is dispatched
        * @param {Object} context The context object applied to the handler
        * @param [params] Additional params to be passed to the handler
        * @param {boolean} [one=false] If true, handler will be automaticaly removed the first time it is called
        */
        public on(event: any, handler, context?, params?, one?: boolean): Component;
        /**
        * override {@linkcode Coral.EventDispatcher#off}.<br/>
        * Handle dom events and computed events.
        * @see Coral.EventDispatcher#on
        * @method off
        * @memberof Coral.Component#
        * @param {string} event The event key concatenated with an optional namespace.
        */
        public off(event): Component;
    }
    interface IComponentDescriptor extends Coral.IDescribableObjectDescriptor {
        skin?;
        model?;
        models?;
        width?;
        minWidth?;
        maxWidth?;
        height?;
        minHeight?;
        maxHeight?;
        top?;
        bottom?;
        left?;
        right?;
        marginTop?;
        marginBottom?;
        marginLeft?;
        marginRight?;
        paddingTop?;
        paddingBottom?;
        paddingLeft?;
        paddingRight?;
        display?: string;
        position?: string;
        flex?;
        opacity?: number;
        defs?: Coral.Descriptor<Coral.DescribableObject>[];
        states?: Coral.Descriptor<Coral.State>[];
        initEvent?;
        completeEvent?;
        attachComponentEvent?;
        detachComponentEvent?;
        addedToDisplayEvent?;
        removedFromDisplayEvent?;
        stateChangeEvent?;
        clickEvent?;
        dblclickEvent?;
        mousedownEvent?;
        mousemoveEvent?;
        mouseoverEvent?;
        mouseoutEvent?;
        mouseupEvent?;
        keydownEvent?;
        keypressEvent?;
        keyupEvent?;
        abortEvent?;
        errorEvent?;
        loadEvent?;
        resizeEvent?;
        scrollEvent?;
        unloadEvent?;
        blurEvent?;
        changeEvent?;
        focusEvent?;
        resetEvent?;
        selectEvent?;
        submitEvent?;
        focusinEvent?;
        focusoutEvent?;
        touchstartEvent?;
        touchendEvent?;
        touchmoveEvent?;
        touchenterEvent?;
        touchleaveEvent?;
        touchcancelEvent?;
        dragstartEvent?;
        dragEvent?;
        dragenterEvent?;
        dragleaveEvent?;
        dragoverEvent?;
        dropEvent?;
        dragendEvent?;
        modelWatcher?;
        modelsWatcher?;
        widthWatcher?;
        minWidthWatcher?;
        maxWidthWatcher?;
        heightWatcher?;
        minHeightWatcher?;
        maxHeightWatcher?;
        topWatcher?;
        bottomWatcher?;
        leftWatcher?;
        rightWatcher?;
        marginTopWatcher?;
        marginBottomWatcher?;
        marginLeftWatcher?;
        marginRightWatcher?;
        paddingTopWatcher?;
        paddingBottomWatcher?;
        paddingLeftWatcher?;
        paddingRightWatcher?;
        displayWatcher?;
        positionWatcher?;
        flexWatcher?;
        opacityWatcher?;
        parentWatcher?;
        $containerWatcher?;
        isAddedToDisplayWatcher?;
    }
    class ComputedEventDelegate extends Coral.EventDispatcher {
        public uid: number;
        public component: Component;
        /**
        * ComputedEventDelegate is an event delegate used to handle complex events. The delegate class must be register in {@linkcode Coral.Component.computedEvents}.<br/>
        * @constructor Coral.ComputedEventDelegate
        * @extends Coral.EventDispatcher
        * @see $Component
        * @param {Coral.Component} the component delegating event managment.
        */
        constructor(component: Component);
    }
}
/**
* Shortcut for creating a Component Descriptor
* @method $Component
* @see Coral.Component
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Component(description: Coral.IComponentDescriptor): Coral.Descriptor<Coral.Component>;
declare module Coral {
    class State extends Coral.DescribableObject {
        static CHANGE_EVENT: string;
        public name: string;
        public values: StateValue[];
        public transitions: Transition[];
        public css: string;
        /**
        * State class must be used with {@linkcode Coral.Component} to provide state dependencies.<br/>
        * Values of this state are defined by nested {@linkcode Coral.StateValue}.
        * @constructor Coral.State
        * @extends Coral.DescribableObject
        * @see $State
        * @property {string} name The name of this state. Default value : <code>"state"</code>.
        * @property {string} value The current state.
        * @property {Array} values An array of {@linkcode Coral.Descriptor}. All described objects are must extend {@linkcode Coral.StateValue}.
        * @property {Array} transitions An array of {@linkcode Coral.Descriptor}. All described objects are must extend {@linkcode Coral.Transition}.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<State>, context?, owner?);
        private _valuesMap;
        private _last;
        private _currentState;
        private waitingChange;
        private runningTransition;
        private _value;
        public value : string;
        /**
        * Test if given values match the current state.
        * @method matchState
        * @memberof Coral.State#
        * @param {Array} states A states array to match with.
        * @returns {boolean} <code>true</code> if any value in the array match the current state
        */
        public matchState(states: string[]): boolean;
        /**
        * Update the state with the current value.<br/>
        * updateState may run a transition.
        * @method updateState
        * @memberof Coral.State#
        * @param {string} newValue The new state value
        */
        public updateState(): void;
        /**
        * Transition end handler
        * @method transitionEnd
        * @memberof Coral.State#
        * @private
        */
        public transitionEnd(): void;
        /**
        * Change the current state with the given value.<br/>
        * triggerState doesn't run transition.
        * @method triggerState
        * @memberof Coral.State#
        * @param {string} stateValue The new state value
        */
        public triggerState(stateValue: string): void;
        /**
        * Get the nested {@linkcode Coral.StateValue} by its value property
        * @method getStateValue
        * @memberof Coral.State#
        * @param {string} value The value of the requested {@linkcode Coral.StateValue}
        * @returns {Coral.StateValue} The {@linkcode Coral.StateValue} matching <code>value</code>
        */
        public getStateValue(value: string): StateValue;
        /**
        * Get the current {@linkcode Coral.StateValue}
        * @method getCurrentStateValue
        * @memberof Coral.State#
        * @returns {Coral.StateValue} The current {@linkcode Coral.StateValue}
        */
        public getCurrentStateValue(): StateValue;
        /**
        * Get the value of the current {@linkcode Coral.StateValue}
        * @method getCurrentState
        * @memberof Coral.State#
        * @returns {string} The current state or <code>"none"</code>
        */
        public getCurrentState(): string;
        public destroy(): void;
    }
    interface IStateDescriptor extends Coral.IDescribableObjectDescriptor {
        name?: string;
        value?: string;
        values?: Coral.Descriptor<StateValue>[];
        transitions?: Coral.Descriptor<Transition>[];
        changeEvent?;
    }
    class StateValue extends Coral.DescribableObject {
        static ENTER_STATE_EVENT: string;
        static LEAVE_STATE_EVENT: string;
        public value: string;
        public state: State;
        public intermediate: boolean;
        /**
        * StateValue class must be used with {@linkcode Coral.State} to provide state managment.<br/>
        * It defines a possible value of the parent {@linkcode Coral.State}.
        * @constructor Coral.StateValue
        * @extends Coral.DescribableObject
        * @see $StateValue
        * @property {string} value The value described.
        * @property {Coral.State} state The parent {@linkcode Coral.State}.
        * @property {boolean} intermediate <code>true</code> if this value must only be used with {@linkcode Coral.IntermediateState}. Default: <code>false</code>.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<StateValue>, context?, owner?);
        /**
        * Trigger <code>enterState</code> event
        * @method enter
        * @memberof Coral.StateValue#
        */
        public enter(): void;
        /**
        * Trigger <code>leaveState</code> event
        * @method leave
        * @memberof Coral.StateValue#
        */
        public leave(): void;
        /**
        * Test if a value match this {@linkcode Coral.StateValue}
        * @method matchState
        * @memberof Coral.StateValue#
        * @returns {boolean} <code>true</code> if given value match
        */
        public matchState(state: string): boolean;
    }
    interface IStateValueDescriptor extends Coral.IDescribableObjectDescriptor {
        value?: string;
        intermediate?: boolean;
        enterStateEvent?;
        leaveStateEvent?;
    }
    class Transition extends Coral.SequentialTasks {
        static TRANSITION_START_EVENT: string;
        static TRANSITION_END_EVENT: string;
        public from: string;
        public to: string;
        public state: State;
        /**
        * Transition class must be used with {@linkcode Coral.State} to provide state managment.<br/>
        * It defines a sequence of {@linkcode Coral.Task} to execute when a state change.
        * @constructor Coral.Transition
        * @extends Coral.SequentialTasks
        * @see $Transition
        * @property {string} from The value of the current state. If not specfied it can be any value.
        * @property {string} to The value of the target state. If not specfied it can be any value.
        * @property {Coral.State} state The parent {@linkcode Coral.State}.
        * @param {Coral.Descriptor} [description] A descriptor
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<Transition>, context?, owner?);
        private stateFrom;
        private stateTo;
        /**
        * Test if a state change match this transition.
        * @method match
        * @memberof Coral.Transition#
        * @returns {boolean} <code>true</code> if <code>from</code> and <code>to</code> match
        */
        public match(from: string, to: string): boolean;
        /**
        * Run the transition.<br/>
        * Override {@linkcode Coral.SequentialTasks#run}
        * @method run
        * @memberof Coral.Transition#
        * @param {string} from The current state
        * @param {string} to The target state
        */
        public run(from?: string, to?: string): void;
        /**
        * Cancel the transition.<br/>
        * Override {@linkcode Coral.SequentialTasks#cancel}
        * @method cancel
        * @memberof Coral.Transition#
        */
        public cancel(): void;
        /**
        * End the transition.<br/>
        * Override {@linkcode Coral.SequentialTasks#done}
        * @method done
        * @memberof Coral.Transition#
        */
        public done(): void;
    }
    interface ITransitionDescriptor extends Coral.ISequentialTasksDescriptor {
        from?: string;
        to?: string;
        transitionStartEvent?;
        transitionEndEvent?;
        fromWatcher?;
        toWatcher?;
    }
    class IntermediateState extends Coral.Task {
        public time: number;
        public value: string;
        /**
        * IntermediateState class must be nested in a {@linkcode Coral.Transition}.<br/>
        * It is a task that change the current state to an intermediate one.
        * @constructor Coral.IntermediateState
        * @extends Coral.Task
        * @see $IntermediateState
        * @see Coral.Transition
        * @see Coral.StateValue
        * @property {number} time The waiting time after changing the current state. Default : 300ms.
        * @property {string} value The intermediate state key.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<IntermediateState>, context?, owner?, item?);
        /**
        * Change the current state to the intermediate state <code>value</code>.<br/>
        * Override {@linkcode Coral.Task#run}
        * @method run
        * @memberof Coral.IntermediateState#
        */
        public run(): void;
    }
    interface IIntermediateStateDescriptor extends Coral.ITaskDescriptor {
        time?: number;
        value?: string;
        timeWatcher?;
        valueWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.State} Descriptor.
* @method $State
* @see Coral.State
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $State(description: Coral.IStateDescriptor): Coral.Descriptor<Coral.State>;
/**
* Shortcut for creating a {@linkcode Coral.StateValue} Descriptor.
* @method $StateValue
* @see Coral.StateValue
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $StateValue(description: Coral.IStateValueDescriptor): Coral.Descriptor<Coral.StateValue>;
/**
* Shortcut for creating a {@linkcode Coral.Transition} Descriptor.
* @method $Transition
* @see Coral.Transition
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Transition(description: Coral.ITransitionDescriptor): Coral.Descriptor<Coral.Transition>;
/**
* Shortcut for creating a {@linkcode Coral.IntermediateState} Descriptor.
* @method $IntermediateState
* @see Coral.IntermediateState
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $IntermediateState(description: Coral.IIntermediateStateDescriptor): Coral.Descriptor<Coral.IntermediateState>;
declare module Coral {
    class BaseContainer extends Coral.Component {
        static CHILD_ADDED_EVENT: string;
        static CHILD_REMOVED_EVENT: string;
        static CHILD_COMPLETE_EVENT: string;
        public childsFactory;
        public childsContainer;
        public childsCollection: Coral.Collection<Coral.Component>;
        /**
        * BaseContainer class is the base class for container components.
        * @constructor Coral.BaseContainer
        * @extends Coral.Component
        * @see $BaseContainer
        * @see Coral.Component#attachComponent
        * @property {JQuery|Coral.BaseContainer} childsContainer Childs Component are added in <code>childsContainer</code>. It can be specified explicitly. Default value is the element with <code>data-container</code> specified or <code>this.$el</code>.
        * @property {Coral.DescribableObject} childsFactory Creation of child component is delegated to the factory. If no factory is specified you must populate <code>childsCollection</code> yourself.
        * @property {Coral.Collection} childsCollection Collection of nested childs. When a childs is added to this collection, it is automatically attached to this component.
        * @property {Coral.DescribableObject} layout A javascript based layout. If CSS layouting is not enough you can create a layout object that use both <code>childsContainer</code> and <code>childsCollection</code> to calculate the layout.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<BaseContainer>, context?, owner?, item?);
        /**
        * Must be override in concrete implementations.
        * @method areChildsExternal
        * @memberof Coral.BaseContainer#
        * @returns {boolean} <code>true</code> if childs descriptors come from an external context.
        */
        public areChildsExternal(): boolean;
        private _layout;
        public layout : Coral.Layout;
        /**
        * Add the view <code>child</code> to the current view in container referenced by target.
        * @see Coral.Component#attachComponent
        * @private
        */
        public _addChild(child: Coral.Component, index: number, target?): void;
        /**
        * Remove <code>child</code> from this view.
        * @see Coral.Component#attachComponent
        * @private
        */
        public _removeChild(child: Coral.Component): void;
        public _childAdded(event: Coral.Event): void;
        public _childRemoved(event: Coral.Event): void;
        public _childMoved(event: Coral.Event): void;
        public _childSet(event: Coral.Event): void;
        public destroy(): void;
    }
    interface IBaseContainerDescriptor extends Coral.IDescribableObjectDescriptor {
        childsContainer?: JQuery;
        childsFactory?: Coral.DescribableObject;
        layout?: Coral.Descriptor<Coral.Layout>;
        childAddedEvent?;
        childRemovedEvent?;
        childCompleteEvent?;
        layoutWatcher?;
        childsContainerWatcher?;
    }
}
declare module Coral {
    class Container extends Coral.BaseContainer {
        public childs: Coral.Descriptor<Coral.Component>[];
        /**
        * Container class is a {@linkcode Coral.BaseContainer} that use a {@linkcode Coral.DescriptorsFactory}
        * @constructor Coral.Container
        * @extends Coral.BaseContainer
        * @see $Container
        * @property {Array} childs An array of {@linkcode Coral.Descriptor}. All described objects are delegated to <code>childsFactory</code>.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<Coral.Component>, context?, owner?, item?);
        /**
        * <code>true</code> if <code>childs</code> property come from an external context.<br/>
        * Implementation of {@linkcode Coral.BaseContainer#areChildsExternal}
        * @method areChildsExternal
        * @memberof Coral.Container#
        * @returns {boolean} <code>true</code> if childs descriptors come from an external context
        */
        public areChildsExternal(): boolean;
    }
    interface IContainerDescriptor extends Coral.IBaseContainerDescriptor {
        childs?: Coral.Descriptor<Coral.Component>[];
        childsWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.Container} Descriptor
* @method $Container
* @see Coral.Container
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Container(description: Coral.IContainerDescriptor): Coral.Descriptor<Coral.Container>;
declare module Coral {
    class DataContainer extends Coral.BaseContainer {
        public itemRenderer: Coral.Descriptor<Coral.Component>;
        public items: Coral.Collection<any>;
        /**
        * DataContainer class is a {@linkcode Coral.BaseContainer} that use a {@linkcode Coral.DataDescriptorsFactory}
        * @constructor Coral.DataContainer
        * @extends Coral.BaseContainer
        * @see $DataContainer
        * @property {Coral.Descriptor} itemRenderer A description for all childs in the container.
        * @property {Coral.Collection} items A collection of data objects. An <code>itemRenderer</code> instance is created for every object in the list.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance .
        * @param [item] An optional item used for item rendering.
        */
        constructor(description?: Coral.Descriptor<DataContainer>, context?, owner?, item?);
        /**
        * <code>true</code> if <code>itemRenderer</code> property come from an external context.<br/>
        * Implementation of {@linkcode Coral.BaseContainer#areChildsExternal}
        * @method areChildsExternal
        * @memberof Coral.DataContainer#
        * @returns {boolean} <code>true</code> if childs descriptors come from an external context
        */
        public areChildsExternal(): boolean;
    }
    interface IDataContainerDescriptor extends Coral.IBaseContainerDescriptor {
        itemRenderer?: Coral.Descriptor<Coral.Component>;
        items?: Coral.Collection<any>;
        itemRendererWatcher?;
        itemsWatcher?;
    }
}
/**
* Shortcut for creating a {@linkcode Coral.DataContainer} Descriptor
* @method $DataContainer
* @see Coral.DataContainer
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $DataContainer(description: Coral.IDataContainerDescriptor): Coral.Descriptor<Coral.DataContainer>;
declare module Coral {
    class Application extends Coral.Container {
        /**
        * Application class is a {@linkcode Coral.Container}. Application shall be the root of the components tree.
        * @constructor Coral.Application
        * @extends Coral.Container
        * @see $Application
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<Application>, context?);
        /**
        * Once the application is created and added to the DOM tree, this method must be called to start the application.
        * @method run
        * @memberof Coral.Application#
        */
        public run(): void;
    }
    interface IApplicationDescriptor extends Coral.IContainerDescriptor {
    }
}
/**
* Shortcut for creating an {@linkcode Coral.Application} descriptor.
* @method $Application
* @see Coral.Application
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
declare function $Application(description: Coral.IApplicationDescriptor): Coral.Descriptor<Coral.Application>;
declare module Coral {
    class Layout extends Coral.DescribableObject {
        /**
        * Layout class must be use with {@linkcode Coral.BaseContainer} to provide script based layout.
        * @constructor Coral.Layout
        * @extends Coral.DescribableObject
        * @see $Layout
        * @property {JQuery} childsContainer Binding to the parent <code>childsContainer</code> property.
        * @property {boolean} _childsContainerUpToDate Flag that indicate if childsContainer change since last update.
        * @property {boolean} _layoutUpToDate Flag that indicate if layout must be recalculated.
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        constructor(description?: Coral.Descriptor<Layout>, context?, owner?);
        private _childsContainerBinding;
        private _layoutUpToDate;
        private _childsContainerUpToDate;
        private _childsContainer;
        public childsContainer : any;
        /**
        * Destroy this layout
        * Override {@linkcode Coral.DescribableObject#destroy}
        * @method destroy
        * @memberof Coral.Layout#
        */
        public destroy(): void;
        /**
        * Plan an asynchronous update for this layout
        * @method updateLayout
        * @memberof Coral.Layout#
        */
        public updateLayout(): void;
    }
    interface ILayoutDescriptor extends Coral.IDescribableObjectDescriptor {
    }
}
