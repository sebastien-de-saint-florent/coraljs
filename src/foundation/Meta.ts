///<reference path="../ref.d.ts"/>
/**
 * Meta provide methods to dynamically add behaviors to existing classes.
 * @namespace Meta
 */
module Meta {
    /**
    * Make <code>subClass</code> inherits from <code>supClass</code>.
    * @method Meta#Extends
    * @param {Function} subClass The class to extend
    * @param {Function} supClass The super class
    */
    export function Extends(subClass, supClass) {
        var subProto = Object.create(supClass.prototype);
        subClass.prototype = subProto;
        subClass.prototype.constructor = subClass;
        subClass.superConstructor = supClass;
    };
    
    /**
     * Create a new Class with the given definition.
     * @method Meta#Class
     * @param {Object} definition Methods and properties.
     * @param {Function} [supClass] The super class.
     * @param {Array} [mixins] An Array of mixins.
     * @returns {Function} The constructor function.
     */
    export function Class(definition: { constructor?: Function }, supClass?, mixins?: Mixin.IMixin[]) {
        var newClass = definition.constructor = definition.hasOwnProperty("constructor") ? definition.constructor : (supClass ? function () {
            supClass.apply(this, arguments);
        } : function () {
            });
        if (supClass) {
            Meta.Extends(newClass, supClass);
            var propertyNames = Object.getOwnPropertyNames(definition);
            for (var i = 0; i < propertyNames.length; ++i)
                Object.defineProperty(newClass.prototype, propertyNames[i], Object.getOwnPropertyDescriptor(definition, propertyNames[i]));
        }
        else
            newClass.prototype = definition;
        if (mixins)
            for (var i = 0; i < mixins.length; ++i)
                Meta.Mixin(newClass.prototype, mixins[i]);
        return newClass;
    }

    /**
     * Apply the given mixin.
     * @method Meta#Mixin
     * @param {Object} object Class prototype or Object.
     * @param {Object} mixin Mixin to apply.
     */
    export function Mixin(object, mixin:Mixin.IMixin) {
        if (!mixin.hasOwnProperty(Meta.Mixin.MIXIN_NAME_KEY))
            Object.defineProperty(mixin, Meta.Mixin.MIXIN_NAME_KEY, {value: Coral.Utils.getUID(), writable: false, enumerable: false, configurable: false});
        var mixinKey = Meta.Mixin.MIXIN_KEY + mixin[Meta.Mixin.MIXIN_NAME_KEY];
        if (!(mixinKey in object)) {
            var dependencies = mixin.__mixin_dependencies;
            if (dependencies)
                for (var i = 0; i < dependencies.length; ++i)
                    Meta.Mixin(object, dependencies[i]);
            var propertyNames = Object.getOwnPropertyNames(mixin);
            for (i = 0; i < propertyNames.length; ++i) {
                var propertyName = propertyNames[i];
                if (propertyName != Meta.Mixin.MIXIN_NAME_KEY && propertyName != Meta.Mixin.MIXIN_DEPENDENCIES_KEY) {
                    var descriptor = Object.getOwnPropertyDescriptor(mixin, propertyName);
                    if (descriptor.value == Meta.Mixin.VIRTUAL) { // the property must be implemented
                        if (!(propertyName in object))
                            Coral.Utils.error("virtual properties not implemented", object, mixin[Meta.Mixin.MIXIN_NAME_KEY]);
                    }
                    else if (!(propertyName in object))// the property is copied
                        Object.defineProperty(object, propertyName, descriptor);
                }
            }
            Object.defineProperty(object, mixinKey, {value: mixin, writable: false, enumerable: false, configurable: false});
        }
    }
    /**
     * @namespace Meta.Mixin
     */
    export module Mixin {
        export interface IMixin {
            __mixin_name?: string;
            __mixin_dependencies?: IMixin[];
        }

        /**
         * Metadata key where mixin information is stored
         * @constant Meta.Mixin.MIXIN_KEY
         * @type {string}
         */
        export var MIXIN_KEY = "__mixin_";
        /**
         * Metadata key where mixin name is stored
         * @constant Meta.Mixin.MIXIN_NAME_KEY
         * @type {string}
         */
        export var MIXIN_NAME_KEY = "__mixin_name";
        /**
         * Metadata key where mixin dependencies are stored
         * @constant Meta.Mixin.MIXIN_DEPENDENCIES_KEY
         * @type {string}
         */
        export var MIXIN_DEPENDENCIES_KEY = "__mixin_dependencies";
        /**
         * Flag indicating that the property must exist
         * @constant Meta.Mixin.VIRTUAL
         * @type {number}
         * @default -4242
         */
        export var VIRTUAL = -4242;

        /**
         * Check if an object has the given mixin.
         * @method Meta.Mixin.is
         * @param {Object} object
         * @param {Object} mixin Mixin to match.
         * @returns {boolean}
         */
        export function is(object, mixin:IMixin):bool {
            return mixin.hasOwnProperty(Meta.Mixin.MIXIN_NAME_KEY) && object[Meta.Mixin.MIXIN_KEY + mixin[Meta.Mixin.MIXIN_NAME_KEY]] !== undefined;
        };
    }

    /**
     * Bindable function transform a property so it will trigger binding listeners when modified.
     * @method Meta#Bindable
     * @param {Object} object The object hosting the property
     * @param {string} key The key of the bindable property
     * @param {Array} [dependencies] Array of dependencies metadata
     */
    export function Bindable(object, key:string, dependencies?:string[]) {
        if (!Meta.Bindable.isBindable(object, key) || dependencies) {
            var hostObject = Meta.Utils.findPropertyDefinition(object, key);
            if (dependencies) {
                var p = Meta.Bindable.DEPENDENCIES_KEY + key;
                Object.defineProperty(hostObject, p, {value: dependencies, writable: false, enumerable: false, configurable: false});
            }
            else {
                if (Meta.Utils.canWrapProperty(hostObject, key)) {
                    var desc = Object.getOwnPropertyDescriptor(hostObject, key) || {value: undefined, writable: true};
                    desc.enumerable = desc.configurable = false;
                    var p = Meta.Bindable.BINDING_KEY + key;
                    if (desc.writable)
                        Meta.Utils.wrapProperty(hostObject, key, p, desc, {
                            get : function () {
                                return this[p];
                            },
                            set : function (v) {
                                if (v === this[p])
                                    return;
                                var o = this[p];
                                this[p] = v;
                                Meta.Bindable.trigger(this, key, this[p], o);
                            }
                        });
                    else
                        Object.defineProperty(hostObject, p, {value: true, writable: false, enumerable: false, configurable: false});
                }
                else
                    Coral.Utils.warning("property cannot be made bindable", object, key);
            }
        }
    }

    /**
     * @namespace Meta.Bindable
     */
    export module Bindable {
        /**
         * The key where binded property is moved
         * @constant Meta.Bindable.BINDING_KEY
         * @type {string}
         * @default
         */
        export var BINDING_KEY = "__binding_";

        /**
         * The key where dependencies metadata are stored
         * @constant Meta.Bindable.DEPENDENCIES_KEY
         * @type {string}
         * @default
         */
        export var DEPENDENCIES_KEY = "__dependencies_";

        /**
         * Define the binding policy when a property listener is created an a non-bindable property.
         * @property Meta.Bindable.autoBindableEnable
         * @type {boolean}
         * @default true
         */
        export var autoBindableEnable = true;

        /**
         * PropertyListener mixin.
         * @constant Meta.Bindable.PropertyListenerMixin
         * @type {Object}
         * @see Coral.Watcher
         * @see Coral.Binding
         */
        export var PropertyListenerMixin = {
            __mixin_name: "PropertyListenerMixin",
            handleChange: Meta.Mixin.VIRTUAL // function(newValue, oldValue, params)
        }

        /**
         * Check if an object's property is bindable.
         * @method Meta.Bindable.isBindable
         * @param {Object} object The object hosting the property
         * @param {string} key The key of the property
         * @returns {boolean} true if the given object's property is bindable
         */
        export function isBindable(object, key:string):bool {
            return Meta.Bindable.BINDING_KEY + key in object || hasDependencies(object, key);
        }

        /**
         * Check if an object's property has dependencies.
         * @method Meta.Bindable.hasDependencies
         * @param {Object} object The object hosting the property.
         * @param {string} key The key of the property.
         * @returns {boolean} true if the given object's property has dependencies
         */
        export function hasDependencies(object, key:string):bool {
            return Meta.Bindable.DEPENDENCIES_KEY + key in object;
        }

        /**
         * Get dependencies associated with an object's property.
         * @method Meta.Bindable.getDependencies
         * @param {Object} object The object hosting the property
         * @param {string} key The key of the property
         * @returns {Array} dependencies array or undefined
         */
        export function getDependencies(object, key:string):string[] {
            return object[Meta.Bindable.DEPENDENCIES_KEY + key];
        }

        /**
         * Trigger all binding handlers for the given object's property.
         * @method Meta.Bindable.trigger
         * @param {Object} object The object hosting the property
         * @param {string} key The key of the property
         * @param newValue The new value to pass to the property listener
         * @param [oldValue] The old value to pass to the property listener
         */
        export function trigger(object, key:string, newValue, oldValue?) {
            if (object.__bindings__ && object.__bindings__[key]) {
                if (object.__bindings__[key].counter !== undefined)
                    Coral.Utils.error("avoid binding loop or use an asynchronous callback", object, key);
                if (!newValue)
                    newValue = object[key];
                object.__bindings__[key].count = object.__bindings__[key].length;
                for (object.__bindings__[key].counter = 0; object.__bindings__[key].counter < object.__bindings__[key].count; ++object.__bindings__[key].counter) {
                    var propertyListener = object.__bindings__[key][object.__bindings__[key].counter];
                    propertyListener.l.handleChange(newValue, oldValue, propertyListener.p);
                }
                object.__bindings__[key].counter = undefined;
            }
        }

        /**
         * Trigger all binding handlers of the given object.<br/>
         * oldValue has a value of undefined for all triggered properties.
         * @method Meta.Bindable.triggerAll
         * @param {Object} object The object hosting the properties.
         * @param {Array} keys An Array of property key.
         */
        export function triggerAll(object, keys:string[]) {
            if (object.__bindings__) {
                keys = keys || Object.keys(object.__bindings__);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (object.__bindings__[key]) {
                        if (object.__bindings__[key].counter !== undefined)
                            Coral.Utils.error("avoid binding loop or use an asynchronous callback", object, key);
                        object.__bindings__[key].count = object.__bindings__[key].length;
                        for (object.__bindings__[key].counter = 0; object.__bindings__[key].counter < object.__bindings__[key].count; ++object.__bindings__[key].counter) {
                            var propertyListener = object.__bindings__[key][object.__bindings__[key].counter];
                            propertyListener.l.handleChange(object[key], undefined, propertyListener.p);
                        }
                        object.__bindings__[key].counter = undefined;
                    }
                }
            }
        }

        export interface IPropertyListenerMixin {
            handleChange(newValue?, oldValue?, params?);
        }


        export interface PropertyListener {
            l:IPropertyListenerMixin;
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
        export function bind(object, key:string, listener:IPropertyListenerMixin, params?):PropertyListener {
            Meta.Mixin(listener, Meta.Bindable.PropertyListenerMixin);
            if (Meta.Bindable.autoBindableEnable)
                Meta.Bindable(object, key);
            else if (!Meta.Bindable.isBindable(object, key))
                Coral.Utils.warning("property is not bindable", object, key);
            var propertyListener = {l:listener, p:params};
            object.__bindings__ = object.__bindings__ || {};
            object.__bindings__[key] = object.__bindings__[key] || [];
            object.__bindings__[key].push(propertyListener);
            return propertyListener;
        }

        /**
         * Unregister a listener object so it don't handle modifications on a property anymore.
         * @method Meta.Bindable.unbind
         * @param {Object} object The object hosting the property
         * @param {string} key The key of the property
         * @param {Object} propertyListener The object returned by Meta.Bindable.bind function
         */
        export function unbind(object, key:string, propertyListener:PropertyListener) {
            if (object.__bindings__ && object.__bindings__[key]) {
                for (var i = 0; i < object.__bindings__[key].length; ++i) {
                    if (object.__bindings__[key][i] === propertyListener) {
                        object.__bindings__[key].splice(i, 1);
                        if (object.__bindings__[key].counter !== undefined && i < object.__bindings__[key].count) {
                            --object.__bindings__[key].count;
                            object.__bindings__[key].counter = i <= object.__bindings__[key].counter ? object.__bindings__[key].counter - 1 : object.__bindings__[key].counter;
                        }
                        break;
                    }
                }
            }
        }
    }
}
