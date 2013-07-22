var Coral;
(function (Coral) {
    /**
    * Utils namespace provide common functions for the framework
    * @namespace Coral.Utils
    */
    (function (Utils) {
        var functionExp = /(.*)\(\s*\)/;

        /**
        * Create a string to represent an object in a log message.
        * @method Coral.Utils.objectInfo
        * @param {Object} object The object in relation with the warning
        * @returns {string}
        */
        function objectInfo(object) {
            var id = object.id || object.uid;
            var constructor = object.constructor.name || "Object";
            if (id)
                return "[" + constructor + " #" + id + "]";
            return "[" + constructor + "]";
        }
        Utils.objectInfo = objectInfo;

        /**
        * Display an error in the console.
        * @method Coral.Utils.error
        * @param {string} message
        * @param {Object} [object] The object in relation with the warning
        * @param {string} [key] The property in relation with the warning
        */
        function error(message, object, key) {
            if (object)
                message = Utils.objectInfo(object) + " " + message;
            if (key)
                message += " : " + key;
            throw message;
        }
        Utils.error = error;

        /**
        * Display a warning in the console.
        * @method Coral.Utils.warning
        * @param {string} message
        * @param {Object} [object] The object in relation with the warning
        * @param {string} [key] The property in relation with the warning
        */
        function warning(message, object, key) {
            if (object)
                message = Utils.objectInfo(object) + " " + message;
            if (key)
                message += " : " + key;
            console.warn(message);
        }
        Utils.warning = warning;

        var objectCounter = 0;

        /**
        * Get a new unique identifier.
        * @method Coral.Utils.getUID
        * @returns {number} An unique identifier
        */
        function getUID() {
            return ++objectCounter;
        }
        Utils.getUID = getUID;

        /**
        * Resolve the value of property chain as {@linkcode Coral.Binding} does.
        * @method Coral.Utils.getChain
        * @param {Object} object
        * @param {string} properties A property chain
        * @returns The result of the property chain
        */
        function getChain(object, properties) {
            var propertiesArray = Array.isArray(properties) ? properties : properties.split(".");
            for (var i = 0; i < propertiesArray.length; ++i) {
                var property = propertiesArray[i];
                var isFunctionCall = false;
                var exec = functionExp.exec(property);
                if (exec && exec.length > 0) {
                    isFunctionCall = true;
                    property = exec[1];
                }
                if (object && property in object) {
                    if (isFunctionCall)
                        object = object[property](); else
                        object = object[property];
                } else
                    return undefined;
            }
            return object;
        }
        Utils.getChain = getChain;

        /**
        * Get all values of property in the prototype chain
        * @method Coral.Utils.prototypalMerge
        * @param {Object} object
        * @param {string} property
        * @returns {Array} An array containing all values of the property
        */
        function prototypalMerge(object, property) {
            var result = [];
            var currentObject = object;
            while (currentObject) {
                if (currentObject.hasOwnProperty(property)) {
                    var p = currentObject[property];
                    if (p)
                        if (Array.isArray(p))
                            result = result.concat(p); else
                            result.push(p);
                }
                currentObject = Object.getPrototypeOf(currentObject);
            }
            return result;
        }
        Utils.prototypalMerge = prototypalMerge;

        /**
        * Wait <code>time</code> milliseconds and then call the callback function
        * @method Coral.Utils.wait
        * @param {number} time Time to wait
        * @param {Function} callback Function to call when timer ends
        * @param {Object} context <code>this</code> for the callback Function
        */
        function wait(time, callback, context) {
            var intervalId = setTimeout(function () {
                callback.call(context);
            }, time);
        }
        Utils.wait = wait;

        /**
        * Call the given function in a later frame update.
        * @method Coral.Utils.callback
        * @param {Function} callback Function to call
        * @param {Object} context <code>this</code> for the callback Function
        */
        function callback(callback, context) {
            Utils.wait(10, callback, context);
        }
        Utils.callback = callback;

        /**
        * return a new object with only properties matching filter regexp
        * @method Coral.Utils.objectFilter
        * @param {Object} object source object
        * @param {RegExp} include a regular expression used to filter included properties, the first capture is used
        * @param {RegExp} exclude a regular expression used to filter excluded properties
        * @returns {Object} the filtered copy
        */
        function objectFilter(object, include, exclude) {
            var result = {};
            if (object)
                for (var key in object) {
                    if (include) {
                        var match = include.exec(key);
                        if (match && (!exclude || !exclude.test(key)))
                            result[match[1]] = object[key];
                    } else if (exclude && !exclude.test(key))
                        result[key] = object[key];
                }
            return result;
        }
        Utils.objectFilter = objectFilter;
    })(Coral.Utils || (Coral.Utils = {}));
    var Utils = Coral.Utils;
})(Coral || (Coral = {}));
var Meta;
(function (Meta) {
    /**
    * Utility functions designed for Meta.
    * @namespace Meta.Utils
    */
    (function (Utils) {
        /**
        * Iterate over prototype chain to find where a property has been declared.
        * @method Meta.Utils.findPropertyDefinition
        * @param {Object} object Base object where search start.
        * @param {string} key Property key to search.
        * @returns {Object} the object where the given property is defined
        */
        function findPropertyDefinition(object, key) {
            var currentObject = object;
            while (currentObject) {
                if (currentObject.hasOwnProperty(key))
                    break;
                currentObject = Object.getPrototypeOf(currentObject);
            }
            return currentObject || object;
        }
        Utils.findPropertyDefinition = findPropertyDefinition;

        /**
        * Test if a property can be wrap into a new property definition.
        * @method Meta.Utils.canWrapProperty
        * @param {Object} object Host object.
        * @param {string} key Property key to test.
        * @returns {bool} <code>true</code> if the property can be wrapped
        */
        function canWrapProperty(object, key) {
            var desc = Object.getOwnPropertyDescriptor(object, key);
            if (desc && desc.writable && (!desc.configurable || Object.isSealed(object) || !Object.isExtensible(object) || Object.isFrozen(object)))
                return false;
            return true;
        }
        Utils.canWrapProperty = canWrapProperty;

        /**
        * Wrap the property key1/desc1 with desc2 by moving the first property to key2.
        * @method Meta.Utils.wrapProperty
        * @param {Object} object Host object.
        * @param {string} key1 Original property key.
        * @param {string} key2 New property key.
        * @param {object} desc1 Original property description.
        * @param {object} desc2 Wrapped property description.
        */
        function wrapProperty(object, key1, key2, desc1, desc2) {
            Object.defineProperty(object, key2, desc1);
            Object.defineProperty(object, key1, desc2);
        }
        Utils.wrapProperty = wrapProperty;
    })(Meta.Utils || (Meta.Utils = {}));
    var Utils = Meta.Utils;
})(Meta || (Meta = {}));
///<reference path="../ref.d.ts"/>
/**
* Meta provide methods to dynamically add behaviors to existing classes.
* @namespace Meta
*/
var Meta;
(function (Meta) {
    /**
    * Make <code>subClass</code> inherits from <code>supClass</code>.
    * @method Meta#Extends
    * @param {Function} subClass The class to extend
    * @param {Function} supClass The super class
    */
    function Extends(subClass, supClass) {
        var subProto = Object.create(supClass.prototype);
        subClass.prototype = subProto;
        subClass.prototype.constructor = subClass;
        subClass.superConstructor = supClass;
    }
    Meta.Extends = Extends;
    ;

    /**
    * Create a new Class with the given definition.
    * @method Meta#Class
    * @param {Object} definition Methods and properties.
    * @param {Function} [supClass] The super class.
    * @param {Array} [mixins] An Array of mixins.
    * @returns {Function} The constructor function.
    */
    function Class(definition, supClass, mixins) {
        var newClass = definition.constructor = definition.hasOwnProperty("constructor") ? definition.constructor : (supClass ? function () {
            supClass.apply(this, arguments);
        } : function () {
        });
        if (supClass) {
            Meta.Extends(newClass, supClass);
            var propertyNames = Object.getOwnPropertyNames(definition);
            for (var i = 0; i < propertyNames.length; ++i)
                Object.defineProperty(newClass.prototype, propertyNames[i], Object.getOwnPropertyDescriptor(definition, propertyNames[i]));
        } else
            newClass.prototype = definition;
        if (mixins)
            for (var i = 0; i < mixins.length; ++i)
                Meta.Mixin(newClass.prototype, mixins[i]);
        return newClass;
    }
    Meta.Class = Class;

    /**
    * Apply the given mixin.
    * @method Meta#Mixin
    * @param {Object} object Class prototype or Object.
    * @param {Object} mixin Mixin to apply.
    */
    function Mixin(object, mixin) {
        if (!mixin.hasOwnProperty(Meta.Mixin.MIXIN_NAME_KEY))
            Object.defineProperty(mixin, Meta.Mixin.MIXIN_NAME_KEY, { value: Coral.Utils.getUID(), writable: false, enumerable: false, configurable: false });
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
                    if (descriptor.value == Meta.Mixin.VIRTUAL) {
                        if (!(propertyName in object))
                            Coral.Utils.error("virtual properties not implemented", object, mixin[Meta.Mixin.MIXIN_NAME_KEY]);
                    } else if (!(propertyName in object))
                        Object.defineProperty(object, propertyName, descriptor);
                }
            }
            Object.defineProperty(object, mixinKey, { value: mixin, writable: false, enumerable: false, configurable: false });
        }
    }
    Meta.Mixin = Mixin;

    /**
    * @namespace Meta.Mixin
    */
    (function (Mixin) {
        /**
        * Metadata key where mixin information is stored
        * @constant Meta.Mixin.MIXIN_KEY
        * @type {string}
        */
        Mixin.MIXIN_KEY = "__mixin_";

        /**
        * Metadata key where mixin name is stored
        * @constant Meta.Mixin.MIXIN_NAME_KEY
        * @type {string}
        */
        Mixin.MIXIN_NAME_KEY = "__mixin_name";

        /**
        * Metadata key where mixin dependencies are stored
        * @constant Meta.Mixin.MIXIN_DEPENDENCIES_KEY
        * @type {string}
        */
        Mixin.MIXIN_DEPENDENCIES_KEY = "__mixin_dependencies";

        /**
        * Flag indicating that the property must exist
        * @constant Meta.Mixin.VIRTUAL
        * @type {number}
        * @default -4242
        */
        Mixin.VIRTUAL = -4242;

        /**
        * Check if an object has the given mixin.
        * @method Meta.Mixin.is
        * @param {Object} object
        * @param {Object} mixin Mixin to match.
        * @returns {boolean}
        */
        function is(object, mixin) {
            return mixin.hasOwnProperty(Meta.Mixin.MIXIN_NAME_KEY) && object[Meta.Mixin.MIXIN_KEY + mixin[Meta.Mixin.MIXIN_NAME_KEY]] !== undefined;
        }
        Mixin.is = is;
        ;
    })(Meta.Mixin || (Meta.Mixin = {}));
    var Mixin = Meta.Mixin;

    /**
    * Bindable function transform a property so it will trigger binding listeners when modified.
    * @method Meta#Bindable
    * @param {Object} object The object hosting the property
    * @param {string} key The key of the bindable property
    * @param {Array} [dependencies] Array of dependencies metadata
    */
    function Bindable(object, key, dependencies) {
        if (!Meta.Bindable.isBindable(object, key) || dependencies) {
            var hostObject = Meta.Utils.findPropertyDefinition(object, key);
            if (dependencies) {
                var p = Meta.Bindable.DEPENDENCIES_KEY + key;
                Object.defineProperty(hostObject, p, { value: dependencies, writable: false, enumerable: false, configurable: false });
            } else {
                if (Meta.Utils.canWrapProperty(hostObject, key)) {
                    var desc = Object.getOwnPropertyDescriptor(hostObject, key) || { value: undefined, writable: true };
                    desc.enumerable = desc.configurable = false;
                    var p = Meta.Bindable.BINDING_KEY + key;
                    if (desc.writable)
                        Meta.Utils.wrapProperty(hostObject, key, p, desc, {
                            get: function () {
                                return this[p];
                            },
                            set: function (v) {
                                if (v === this[p])
                                    return;
                                var o = this[p];
                                this[p] = v;
                                Meta.Bindable.trigger(this, key, this[p], o);
                            }
                        }); else
                        Object.defineProperty(hostObject, p, { value: true, writable: false, enumerable: false, configurable: false });
                } else
                    Coral.Utils.warning("property cannot be made bindable", object, key);
            }
        }
    }
    Meta.Bindable = Bindable;

    /**
    * @namespace Meta.Bindable
    */
    (function (Bindable) {
        /**
        * The key where binded property is moved
        * @constant Meta.Bindable.BINDING_KEY
        * @type {string}
        * @default
        */
        Bindable.BINDING_KEY = "__binding_";

        /**
        * The key where dependencies metadata are stored
        * @constant Meta.Bindable.DEPENDENCIES_KEY
        * @type {string}
        * @default
        */
        Bindable.DEPENDENCIES_KEY = "__dependencies_";

        /**
        * Define the binding policy when a property listener is created an a non-bindable property.
        * @property Meta.Bindable.autoBindableEnable
        * @type {boolean}
        * @default true
        */
        Bindable.autoBindableEnable = true;

        /**
        * PropertyListener mixin.
        * @constant Meta.Bindable.PropertyListenerMixin
        * @type {Object}
        * @see Coral.Watcher
        * @see Coral.Binding
        */
        Bindable.PropertyListenerMixin = {
            __mixin_name: "PropertyListenerMixin",
            handleChange: Meta.Mixin.VIRTUAL
        };

        /**
        * Check if an object's property is bindable.
        * @method Meta.Bindable.isBindable
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @returns {boolean} true if the given object's property is bindable
        */
        function isBindable(object, key) {
            return Meta.Bindable.BINDING_KEY + key in object || hasDependencies(object, key);
        }
        Bindable.isBindable = isBindable;

        /**
        * Check if an object's property has dependencies.
        * @method Meta.Bindable.hasDependencies
        * @param {Object} object The object hosting the property.
        * @param {string} key The key of the property.
        * @returns {boolean} true if the given object's property has dependencies
        */
        function hasDependencies(object, key) {
            return Meta.Bindable.DEPENDENCIES_KEY + key in object;
        }
        Bindable.hasDependencies = hasDependencies;

        /**
        * Get dependencies associated with an object's property.
        * @method Meta.Bindable.getDependencies
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @returns {Array} dependencies array or undefined
        */
        function getDependencies(object, key) {
            return object[Meta.Bindable.DEPENDENCIES_KEY + key];
        }
        Bindable.getDependencies = getDependencies;

        /**
        * Trigger all binding handlers for the given object's property.
        * @method Meta.Bindable.trigger
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @param newValue The new value to pass to the property listener
        * @param [oldValue] The old value to pass to the property listener
        */
        function trigger(object, key, newValue, oldValue) {
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
        Bindable.trigger = trigger;

        /**
        * Trigger all binding handlers of the given object.<br/>
        * oldValue has a value of undefined for all triggered properties.
        * @method Meta.Bindable.triggerAll
        * @param {Object} object The object hosting the properties.
        * @param {Array} keys An Array of property key.
        */
        function triggerAll(object, keys) {
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
        Bindable.triggerAll = triggerAll;

        /**
        * Register a listener object to handle modifications on a property.
        * @method Meta.Bindable.bind
        * @param {Object} object The object hosting the property.
        * @param {string} key The key of the property.
        * @param {Object} listener An object respecting the mixin {@linkcode Meta.Bindable.PropertyListenerMixin}.
        * @returns {Object} the property listener instance created in the given object
        */
        function bind(object, key, listener, params) {
            Meta.Mixin(listener, Meta.Bindable.PropertyListenerMixin);
            if (Meta.Bindable.autoBindableEnable)
                Meta.Bindable(object, key); else if (!Meta.Bindable.isBindable(object, key))
                Coral.Utils.warning("property is not bindable", object, key);
            var propertyListener = { l: listener, p: params };
            object.__bindings__ = object.__bindings__ || {};
            object.__bindings__[key] = object.__bindings__[key] || [];
            object.__bindings__[key].push(propertyListener);
            return propertyListener;
        }
        Bindable.bind = bind;

        /**
        * Unregister a listener object so it don't handle modifications on a property anymore.
        * @method Meta.Bindable.unbind
        * @param {Object} object The object hosting the property
        * @param {string} key The key of the property
        * @param {Object} propertyListener The object returned by Meta.Bindable.bind function
        */
        function unbind(object, key, propertyListener) {
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
        Bindable.unbind = unbind;
    })(Meta.Bindable || (Meta.Bindable = {}));
    var Bindable = Meta.Bindable;
})(Meta || (Meta = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var functionExp = /(.*)\(\s*\)/;
    var BindingBase = (function () {
        /**
        * <code>Watcher</code> object create property listeners on a chain of objects and trigger a callback upon modification.
        * @constructor Coral.BindingBase
        * @property result
        * @property {boolean} binded <code>true</code> if the <code>Watcher</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A dot separated chain of properties or method calls.
        */
        function BindingBase(host, chain) {
            this.host = host;
            this.chain = chain;
            this.properties = chain.split(".");
            this.functions = {};
            for (var i = 0; i < this.properties.length; ++i) {
                var exec = functionExp.exec(this.properties[i]);
                if (exec && exec.length > 0)
                    this.functions[i] = exec[1];
            }
            this.watchers = [];
            this.result = undefined;
        }
        /**
        * Stop the watcher by removing all created property listeners and dependencies.
        * @method unbind
        * @memberof Coral.BindingBase#
        * @returns {Coral.BindingBase} this
        */
        BindingBase.prototype.unbind = function () {
            if (this.binded) {
                this.binded = false;
                while (this.watchers.length > 0) {
                    var watcher = this.watchers.pop();
                    if (watcher) {
                        if (Array.isArray(watcher))
                            for (var i = 0; i < watcher.length; ++i)
                                watcher[i].unbind(); else
                            Meta.Bindable.unbind(this.chainResults[this.watchers.length], this.properties[this.watchers.length], watcher);
                    }
                }
                this.chainResults = undefined;
                this.result = undefined;
            }
            return this;
        };

        /**
        * Internal method that create all needed property listeners and Watcher recursively
        * @private
        */
        BindingBase.prototype.createWatchers = function (object, index) {
            var key = this.functions[index] || this.properties[index];
            var deps = Meta.Bindable.getDependencies(object, key);
            if (deps) {
                var subWatchers = [];
                for (var i = 0; i < deps.length; ++i) {
                    var dep = deps[i].split("@");
                    if (dep.length == 1)
                        subWatchers.push(new Coral.Watcher(object, dep[0], this.watcherDependency, this, index).bind()); else if (dep.length == 2)
                        subWatchers.push(new Coral.EventWatcher(object, dep[0], dep[1], this.eventWatcherDependency, this, index).bind());
                }
                this.watchers.push(subWatchers);
            } else if (!this.functions[index])
                this.watchers.push(Meta.Bindable.bind(object, key, this, index)); else
                this.watchers.push(undefined);

            var result = object[this.properties[index]];
            if (this.functions[index])
                result = object[this.functions[index]]();
            this.chainResults[index + 1] = result;
            if (result && index + 1 < this.properties.length)
                return this.createWatchers(result, index + 1);
            return result;
        };

        /**
        * @private
        */
        BindingBase.prototype.eventWatcherDependency = function (event, index) {
            var object = this.chainResults[index];
            var oldValue = this.chainResults[index + 1];
            var newValue = this.functions[index] ? object[this.functions[index]]() : object[this.properties[index]];
            if (oldValue === newValue)
                return;
            this.chainResults[index + 1] = newValue;
            this.handleChange(newValue, oldValue, index);
        };

        /**
        * @private
        */
        BindingBase.prototype.watcherDependency = function (newValue, oldValue, index) {
            var object = this.chainResults[index];
            oldValue = this.chainResults[index + 1];
            newValue = this.functions[index] ? object[this.functions[index]]() : object[this.properties[index]];
            if (oldValue === newValue)
                return;
            this.chainResults[index + 1] = newValue;
            this.handleChange(newValue, oldValue, index);
        };

        /**
        * shall be override
        * @private
        */
        BindingBase.prototype.handleChange = function (newValue, oldValue, index) {
        };
        return BindingBase;
    })();
    Coral.BindingBase = BindingBase;
})(Coral || (Coral = {}));
Meta.Mixin(Coral.BindingBase.prototype, Meta.Bindable.PropertyListenerMixin);
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Watcher = (function (_super) {
        __extends(Watcher, _super);
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
        function Watcher(host, chain, handler, context, params) {
            _super.call(this, host, chain);
            this.handler = handler;
            this.context = context;
            this.params = params;
        }
        /**
        * Start the watcher by creating all needed property listeners and dependencies.
        * @method bind
        * @memberof Coral.Watcher#
        * @param {boolean} [trigger=false] If true handler will be called after bind finish.
        * @returns {Coral.Watcher} this
        */
        Watcher.prototype.bind = function (trigger) {
            if (!this.binded) {
                this.binded = true;
                this.chainResults = [this.host];
                this.result = this.createWatchers(this.host, 0);
                if (trigger)
                    this.handler.call(this.context, this.result, undefined, this.params);
            }
            return this;
        };

        /**
        * This method handle any change in the watched chain
        * It delete useless watchers, create new ones and trigger notify handler if needed
        * @private
        */
        Watcher.prototype.handleChange = function (newValue, oldValue, index) {
            while (this.watchers.length > index + 1) {
                this.chainResults[this.watchers.length] = undefined;
                var watcher = this.watchers.pop();
                if (watcher) {
                    if (Array.isArray(watcher))
                        for (var i = 0; i < watcher.length; ++i)
                            watcher[i].unbind(); else
                        Meta.Bindable.unbind(this.chainResults[this.watchers.length], this.properties[this.watchers.length], watcher);
                }
            }
            var oldResult = this.result;
            this.chainResults[index + 1] = newValue;
            this.result = newValue;
            if (newValue && index + 1 < this.properties.length)
                this.result = this.createWatchers(newValue, index + 1);
            if (this.result !== oldResult) {
                this.handler.call(this.context, this.result, oldResult, this.params);
            }
        };
        return Watcher;
    })(Coral.BindingBase);
    Coral.Watcher = Watcher;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Binding = (function (_super) {
        __extends(Binding, _super);
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
        function Binding(host, chain, target, property) {
            _super.call(this, host, chain);
            this.target = target;
            this.property = property;
        }
        /**
        * Start the binding. The current value is automatically set on the target property.
        * @method bind
        * @memberof Coral.Binding#
        * @returns {Coral.Binding} this
        */
        Binding.prototype.bind = function () {
            if (!this.binded) {
                this.binded = true;
                this.chainResults = [this.host];
                this.target[this.property] = this.createWatchers(this.host, 0);
            }
            return this;
        };

        /**
        * This method handle any change in watched chain
        * It delete useless watchers, create new ones and set the new value on the target property
        * @private
        */
        Binding.prototype.handleChange = function (newValue, oldValue, index) {
            while (this.watchers.length > index + 1) {
                this.chainResults[this.watchers.length] = undefined;
                var watcher = this.watchers.pop();
                if (watcher) {
                    if (Array.isArray(watcher))
                        for (var i = 0; i < watcher.length; ++i)
                            watcher[i].unbind(); else
                        Meta.Bindable.unbind(this.chainResults[this.watchers.length], this.properties[this.watchers.length], watcher);
                }
            }
            this.chainResults[index + 1] = newValue;
            var result = newValue;
            if (newValue && index + 1 < this.properties.length)
                result = this.createWatchers(newValue, index + 1);
            this.target[this.property] = result;
        };
        return Binding;
    })(Coral.BindingBase);
    Coral.Binding = Binding;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var EventWatcher = (function () {
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
        function EventWatcher(host, chain, event, handler, context, params) {
            this.host = host;
            this.chain = chain;
            this.event = event;
            this.handler = handler;
            this.context = context;
            this.params = params;
            this.uid = Coral.Utils.getUID();
            this.host = host;
            this.event = event;
            this.handler = handler;
            this.context = context;
            this.params = params;
            if (chain)
                this.watcher = new Coral.Watcher(host, chain, this.resultChange, this);
        }
        /**
        * Handler of the watcher created inside the EventWatcher
        * @private
        */
        EventWatcher.prototype.resultChange = function (newValue, oldValue) {
            if (this.result)
                this.result.off([this.event, this.uid]);
            this.result = newValue;
            if (newValue) {
                if (!(newValue instanceof Coral.EventDispatcher))
                    Coral.Utils.error("object must be an instance of Coral.EventDispatcher", newValue);
                newValue.on([this.event, this.uid], this.handler, this.context, this.params);
            }
        };

        /**
        * Start the event watcher
        * @method bind
        * @memberof Coral.EventWatcher#
        * @returns {Coral.EventWatcher} this
        */
        EventWatcher.prototype.bind = function () {
            if (this.watcher)
                this.watcher.bind(true); else
                this.resultChange(this.host, undefined);
            return this;
        };

        /**
        * Stop the watcher by stopping the watcher and remove EventListener
        * @method unbind
        * @memberof Coral.EventWatcher#
        * @returns {Coral.EventWatcher} this
        */
        EventWatcher.prototype.unbind = function () {
            if (this.watcher)
                this.watcher.unbind();
            if (this.result) {
                this.result.off([this.event, this.uid]);
                this.result = undefined;
            }
            return this;
        };
        return EventWatcher;
    })();
    Coral.EventWatcher = EventWatcher;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var compositionExp = /([^{}]+|{([^{}]+)})/g;
    var BindingComposition = (function () {
        /**
        * <code>BindingComposition</code> treat a composition expression for {@linkcode Coral.CompositeBinding}.
        * @constructor Coral.BindingComposition
        * @property {Array} components computation of the binding expression.
        * @param {string} composition The composite binding expression.
        * @see Coral.CompositeBinding
        */
        function BindingComposition(composition) {
            this.components = [];
            var match;
            while (match = compositionExp.exec(composition)) {
                if (match[2])
                    this.components.push({ v: match[2], m: BindingComposition.BINDING_COMPONENT }); else
                    this.components.push({ v: match[1], m: BindingComposition.STRING_COMPONENT });
            }
        }
        BindingComposition.BINDING_COMPONENT = 0;

        BindingComposition.STRING_COMPONENT = 1;
        return BindingComposition;
    })();
    Coral.BindingComposition = BindingComposition;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var CompositeBinding = (function () {
        /**
        * <code>CompositeBinding</code> is a concatenation of strings and bindings<br/>
        * composition must match the regexp <code>([^{}]*|\{[\w.]*\})*</code>
        * @constructor Coral.CompositeBinding
        * @property {boolean} binded <code>true</code> if the <code>CompositeBinding</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string|Coral.BindingComposition} composition Concatenated strings and bindings.
        * @param {Object} target Host object of the target property.
        * @param {string} property Target property key.
        */
        function CompositeBinding(host, composition, target, property) {
            this.host = host;
            this.target = target;
            this.property = property;
            this.watchers = [];
            if (!(composition instanceof Coral.BindingComposition))
                composition = new Coral.BindingComposition(composition);
            this.composition = composition;
            for (var i = 0; i < composition.components.length; ++i) {
                if (composition.components[i].m === Coral.BindingComposition.BINDING_COMPONENT)
                    this.watchers[i] = new Coral.Watcher(host, composition.components[i].v, this.handleChange, this);
            }
        }
        /**
        * @private
        */
        CompositeBinding.prototype.handleChange = function () {
            var result = "";
            for (var i = 0; i < this.composition.components.length; ++i) {
                if (this.watchers[i])
                    result += this.watchers[i].result; else
                    result += this.composition.components[i].v;
            }
            this.target[this.property] = result;
        };

        /**
        * Start the binding by creating all bindings declared in 'composition'
        * @method bind
        * @memberof Coral.CompositeBinding#
        * @returns {Coral.CompositeBinding} this
        */
        CompositeBinding.prototype.bind = function () {
            if (!this.binded) {
                this.binded = true;
                for (var i = 0; i < this.watchers.length; ++i) {
                    if (this.watchers[i])
                        this.watchers[i].bind();
                }
                this.handleChange();
            }
            return this;
        };

        /**
        * Stop the binding
        * @method unbind
        * @memberof Coral.CompositeBinding#
        * @returns {Coral.CompositeBinding} this
        */
        CompositeBinding.prototype.unbind = function () {
            if (this.binded) {
                this.binded = false;
                for (var i = 0; i < this.watchers.length; ++i) {
                    if (this.watchers[i])
                        this.watchers[i].unbind();
                }
            }
            return this;
        };
        return CompositeBinding;
    })();
    Coral.CompositeBinding = CompositeBinding;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var simpleBindingExp = /^[^{}]+$/;
    var compositeBindingExp = /^{[^{}]+}$/;
    var UIBinding = (function () {
        /**
        * Binding on a UI Dom Node.<br/>
        * This class is an abstract base class and is not intended to be instanciated directly.
        * @constructor Coral.UIBinding
        * @property {boolean} binded <code>true</code> if the <code>UIBinding</code> is currently binded.
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A binding chain or a composition.
        * @param {Object} node DOM node object.
        * @param {string} [property] Target property key.
        */
        function UIBinding(host, chain, node, property) {
            this.property = property;
            if (simpleBindingExp.test(chain))
                this.binding = new Coral.Binding(host, chain, this, "result"); else if (compositeBindingExp.test(chain))
                this.binding = new Coral.Binding(host, chain.substring(1, chain.length - 1), this, "result"); else
                this.binding = new Coral.CompositeBinding(host, new Coral.BindingComposition(chain), this, "result");
            this.node = node instanceof $ ? node : $(node);
        }
        Object.defineProperty(UIBinding.prototype, "result", {
            get: function () {
                return this._result;
            },
            set: function (v) {
                var oldResult = this._result;
                this._result = v;
                this.resultChange(v, oldResult);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Internal watcher change handler.<br/>
        * This function assign the Dom node target property with the new value.
        * @private
        */
        UIBinding.prototype.resultChange = function (newValue, oldValue) {
        };

        /**
        * Start the UI binding.<br/>
        * The current value is automatically set on the HTML DOM node.
        * @method bind
        * @memberof Coral.UIBinding#
        * @returns {Coral.UIBinding} this
        */
        UIBinding.prototype.bind = function () {
            this.binding.bind();
            return this;
        };

        /**
        * Stop the UI binding.
        * @method unbind
        * @memberof Coral.UIBinding#
        * @returns {Coral.UIBinding} this
        */
        UIBinding.prototype.unbind = function () {
            this.binding.unbind();
            this._result = undefined;
            return this;
        };
        return UIBinding;
    })();
    Coral.UIBinding = UIBinding;

    var AttributeBinding = (function (_super) {
        __extends(AttributeBinding, _super);
        /**
        * UI binding to a property of an HTML DOM node.
        * @constructor Coral.AttributeBinding
        * @extends Coral.UIBinding
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A binding chain or a composition.
        * @param {Object} node HTML DOM node object.
        * @param {string} property Target property key.
        */
        function AttributeBinding(host, chain, node, property) {
            _super.call(this, host, chain, node, property);
        }
        AttributeBinding.prototype.resultChange = function (newValue, oldValue) {
            if (newValue)
                this.node.attr(this.property, newValue); else
                this.node.removeAttr(this.property);
        };
        return AttributeBinding;
    })(UIBinding);
    Coral.AttributeBinding = AttributeBinding;

    var StyleBinding = (function (_super) {
        __extends(StyleBinding, _super);
        /**
        * UI binding to a style property of an HTML DOM node.
        * @constructor Coral.StyleBinding
        * @extends Coral.UIBinding
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A binding chain or a composition.
        * @param {Object} node HTML DOM node object.
        * @param {string} property Target property key.
        */
        function StyleBinding(host, chain, node, property) {
            _super.call(this, host, chain, node, property);
        }
        StyleBinding.prototype.resultChange = function (newValue, oldValue) {
            this.node.css(this.property, newValue);
        };
        return StyleBinding;
    })(UIBinding);
    Coral.StyleBinding = StyleBinding;

    var ContentBinding = (function (_super) {
        __extends(ContentBinding, _super);
        /**
        * UI binding to the content of an HTML DOM node.
        * @constructor Coral.ContentBinding
        * @extends Coral.UIBinding
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A binding chain or a composition.
        * @param {Object} node HTML DOM node object.
        * @param {boolean} raw If true content is append to DOM without escaping HTML.
        */
        function ContentBinding(host, chain, node, raw) {
            _super.call(this, host, chain, node);
            this.raw = raw;
        }
        ContentBinding.prototype.resultChange = function (newValue, oldValue) {
            if (this.raw)
                this.node.html(newValue); else
                this.node.text(newValue);
        };
        return ContentBinding;
    })(UIBinding);
    Coral.ContentBinding = ContentBinding;

    var ClassSwitchBinding = (function (_super) {
        __extends(ClassSwitchBinding, _super);
        /**
        * UI binding of a css class on an HTML DOM node.<br/>
        * If host/chain result is <code>true</code>, <code>className</code> is apply to the DOM node.
        * @constructor Coral.ClassSwitchBinding
        * @extends Coral.UIBinding
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A binding chain or a composition.
        * @param {Object} node HTML DOM node object.
        * @param {string} className css class name.
        */
        function ClassSwitchBinding(host, chain, node, className) {
            _super.call(this, host, chain, node);
            this.className = className;
        }
        ClassSwitchBinding.prototype.resultChange = function (newValue, oldValue) {
            if (newValue && !oldValue)
                this.node.addClass(this.className); else if (!newValue && oldValue)
                this.node.removeClass(this.className);
        };
        return ClassSwitchBinding;
    })(UIBinding);
    Coral.ClassSwitchBinding = ClassSwitchBinding;

    var ClassBinding = (function (_super) {
        __extends(ClassBinding, _super);
        /**
        * UI binding of a css class on an HTML DOM node.<br/>
        * host/chain result is used as an additional css class name for the DOM node.<br/>
        * When the result change, previous value is removed from css classes.
        * @constructor Coral.ClassBinding
        * @extends Coral.UIBinding
        * @param {Object} host The object hosting the root property.
        * @param {string} chain A binding chain or a composition.
        * @param {Object} node HTML DOM node object.
        */
        function ClassBinding(host, chain, node) {
            _super.call(this, host, chain, node);
        }
        ClassBinding.prototype.resultChange = function (newValue, oldValue) {
            if (oldValue)
                this.node.removeClass(oldValue);
            if (newValue)
                this.node.addClass(newValue);
        };
        return ClassBinding;
    })(UIBinding);
    Coral.ClassBinding = ClassBinding;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var EventDispatcher = (function () {
        /**
        * <code>EventDispatcher</code> is the based class for all object that need to communicate events to others.
        * If <code>parentDispatcher</code> is specified, all events passed with <code>bubble === true</code> will be dispatched to the
        * parent dispatcher.
        * @constructor Coral.EventDispatcher
        * @param {Coral.EventDispatcher} [parentDispatcher] An optional parent <code>EventDispatcher</code>;
        * @see Coral.Event
        */
        function EventDispatcher(parentDispatcher) {
            this.parentDispatcher = parentDispatcher;
            if (parentDispatcher) {
                if (!(parentDispatcher instanceof EventDispatcher))
                    Coral.Utils.error("object must be an instance of Coral.EventDispatcher", parentDispatcher);
            }
        }
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
        EventDispatcher.prototype.on = function (event, handler, context, params, one) {
            this._event_listeners = this._event_listeners || {};
            var eventWithSpace = Array.isArray(event) ? event : event.split(EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
            event = eventWithSpace[0];
            var namespace = eventWithSpace.length > 1 ? eventWithSpace[1] : EventDispatcher.GLOBAL_EVENT_SPACE;
            var currentEventSpace = this._event_listeners[namespace] = this._event_listeners[namespace] || {};
            currentEventSpace[event] = currentEventSpace[event] || [];
            currentEventSpace[event].push({ h: handler, c: context, p: params, o: one });
            return this;
        };

        /**
        * shortcut to {@linkcode Coral.EventDispatcher#on} method with <code>one</code> parameter set to <code>true</code>.
        * @method one
        * @memberof Coral.EventDispatcher#
        * @see EventDispatcher.on
        */
        EventDispatcher.prototype.one = function (event, handler, context, params) {
            return this.on(event, handler, context, params, true);
        };

        /**
        * off method remove all attached handlers corresponding to the passed event.
        * @method off
        * @memberof Coral.EventDispatcher#
        * @param {string} event The event key concatenated with an optional namespace.
        */
        EventDispatcher.prototype.off = function (event) {
            if (this._event_listeners) {
                var eventWithSpace = event instanceof Array ? event : event.split(EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
                var event = eventWithSpace[0];
                var namespace = eventWithSpace.length > 1 ? eventWithSpace[1] : EventDispatcher.GLOBAL_EVENT_SPACE;
                var currentEventSpace = this._event_listeners[namespace] = this._event_listeners[namespace] || {};
                if (event == "")
                    currentEventSpace = undefined; else
                    currentEventSpace[event] = undefined;
            }
            return this;
        };

        /**
        * Dispatch the passed event and trigger all attached handlers
        * @method dispatch
        * @memberof Coral.EventDispatcher#
        * @param {Event} event The event object to dispatch
        */
        EventDispatcher.prototype.dispatch = function (event) {
            if (!(event instanceof Coral.Event))
                Coral.Utils.error("dispatched event must be an instance of Coral.Event", event);
            var bubble = event.bubbles;
            var stop = false;
            if (this._event_listeners) {
                if (event.target)
                    event.currentTarget = this; else
                    event.target = event.currentTarget = this;
                for (var key in this._event_listeners) {
                    var currentEventSpace = this._event_listeners[key];
                    if (currentEventSpace != undefined) {
                        var listeners = currentEventSpace[event.type];
                        if (listeners) {
                            for (var j = 0; !stop && j < listeners.length; ++j) {
                                var listener = listeners[j];
                                var result = listener.h.call(listener.c, event, listener.p);
                                if (result === false || event.isPropagationStopped() || event.isImmediatePropagationStopped())
                                    bubble = false;
                                if (result === false || event.isImmediatePropagationStopped())
                                    stop = true;
                                if (listener.o) {
                                    listeners.splice(j, 1);
                                    --j;
                                }
                            }
                        }
                    }
                }
            }
            if (bubble && !stop && this.parentDispatcher)
                this.parentDispatcher.dispatch(event);
            return this;
        };
        EventDispatcher.GLOBAL_EVENT_SPACE = "_g";

        EventDispatcher.EVENT_NAMESPACE_SEPARATOR = ".";
        return EventDispatcher;
    })();
    Coral.EventDispatcher = EventDispatcher;

    var Event = (function () {
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
        function Event(type, data, bubbles) {
            Object.defineProperty(this, "type", { writable: false, value: type });
            Object.defineProperty(this, "data", { writable: false, value: data });
            Object.defineProperty(this, "bubbles", { writable: false, value: Boolean(bubbles) });
            this._stopPropagation = false;
            this._stopImmediatePropagation = false;
            this.target = undefined;
            this.currentTarget = undefined;
        }
        /**
        * @method isImmediatePropagationStopped
        * @memberof Coral.Event#
        * @returns {boolean} true if {@linkcode Coral.Event#stopImmediatePropagation} has been called on this event.
        */
        Event.prototype.isImmediatePropagationStopped = function () {
            return Boolean(this._stopImmediatePropagation);
        };

        /**
        * @method isPropagationStopped
        * @memberof Coral.Event#
        * @returns {boolean} true if {@linkcode Coral.Event#stopPropagation} has been called on this event.
        */
        Event.prototype.isPropagationStopped = function () {
            return Boolean(this._stopPropagation) || this.isImmediatePropagationStopped();
        };

        /**
        * Stop the propagation of the event. The event won't be dispatch to parent event dispatcher.
        * @method stopPropagation
        * @memberof Coral.Event#
        */
        Event.prototype.stopPropagation = function () {
            this._stopPropagation = true;
        };

        /**
        * Stop immediately the propagation of the event. The event won't be dispatch to parent event dispatcher and pending listeners won't be called.
        * @method stopImmediatePropagation
        * @memberof Coral.Event#
        */
        Event.prototype.stopImmediatePropagation = function () {
            this._stopImmediatePropagation = true;
        };
        return Event;
    })();
    Coral.Event = Event;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Collection = (function (_super) {
        __extends(Collection, _super);
        /**
        * Collection class is an <code>Array</code> wrapper that dispatch events upon modification.
        * @constructor Coral.Collection
        * @property {Array} items Inner Array containing elements.
        * @property {number} length The length of the collection. It can be made Bindable.
        * @param {Array} [source] An array used to store content of the collection.
        */
        function Collection(source) {
            _super.call(this, undefined);
            Object.defineProperty(this, "items", { writable: false, value: source && Array.isArray(source) ? source : [] });
            this.length = this.items.length;
        }
        /**
        * Add an element to the collection and fire <code>add</code> event.
        * @method add
        * @memberof Coral.Collection#
        * @param obj The object to add.
        * @param {boolean} [unique=false] If <code>true</code>, the element is not added if it already exists in the collection.
        */
        Collection.prototype.add = function (obj, unique) {
            if (unique)
                for (var i = 0; i < this.items.length; ++i)
                    if (this.items[i] === obj)
                        return;
            this.items.push(obj);
            this.length += 1;
            this.dispatch(new Coral.Event(Collection.ADD_EVENT, { value: obj, index: this.items.length - 1 }));
        };

        /**
        * Add all elements from the Array <code>objs</code>.
        * @method addAll
        * @memberof Coral.Collection#
        * @param {Array} objs Objects to add.
        * @param {boolean} [unique=false] If <code>true</code>, elements are not added if they already exist in the collection.
        */
        Collection.prototype.addAll = function (objs, unique) {
            for (var i = 0; i < objs.length; ++i)
                this.add(objs[i], unique);
        };

        /**
        * Insert an element in the collection and fire <code>add</code> event.
        * @method insert
        * @memberof Coral.Collection#
        * @param obj The object to add.
        * @param {number} index The index of the added element in the collection.
        * @param {boolean} [unique=false] If <code>true</code>, the element is not added if it already exists in the collection
        */
        Collection.prototype.insert = function (obj, index, unique) {
            if (index > this.items.length)
                return this.add(obj, unique);
            if (unique)
                for (var i = 0; i < this.items.length; ++i)
                    if (this.items[i] === obj)
                        return;
            this.items.splice(index, 0, obj);
            this.length += 1;
            this.dispatch(new Coral.Event(Collection.ADD_EVENT, { value: obj, index: index }));
        };

        /**
        * Remove an element from the collection and fire <code>remove</code> event.
        * @method remove
        * @memberof Coral.Collectiont#
        * @param obj The object to remove.
        * @param {boolean} [all=false] If code>true</code>, all occurrences of the element are removed.
        */
        Collection.prototype.remove = function (obj, all) {
            for (var i = 0; i < this.items.length; ++i) {
                if (this.items[i] === obj) {
                    this.items.splice(i, 1);
                    this.length -= 1;
                    this.dispatch(new Coral.Event(Collection.REMOVE_EVENT, { value: obj, index: i }));
                    if (all)
                        --i; else
                        break;
                }
            }
        };

        /**
        * Remove all elements in <code>objs</code> Array from the collection and fire <code>remove</code> events.
        * @method removeAll
        * @memberof Coral.Collection#
        * @param {Array} objs Objects to remove.
        * @param {boolean} [all=false] If true, all occurrences of elements are removed.
        */
        Collection.prototype.removeAll = function (objs, all) {
            for (var i = 0; i < objs.length; ++i)
                this.remove(objs[i], all);
        };

        /**
        * Move an element into the collection and fire <code>move</code> event.
        * @method move
        * @memberof Coral.Collection#
        * @param {number} from Index of the element to move.
        * @param {number} to New index of the element.
        */
        Collection.prototype.move = function (from, to) {
            var obj = this.items[from];
            this.items.splice(from, 1);
            this.items.splice(to, 0, obj);
            this.dispatch(new Coral.Event(Collection.MOVE_EVENT, { value: obj, from: from, to: to }));
        };

        /**
        * Swap an element with an other.
        * @method swap
        * @memberof Coral.Collection#
        * @param {number} index1 Index of the first element.
        * @param {number} index2 Index of the second element.
        */
        Collection.prototype.swap = function (index1, index2) {
            var item1 = this.items[index1];
            this.set(this.items[index2], index1);
            this.set(item1, index2);
        };

        /**
        * Get an element from the collection.
        * @method get
        * @memberof Coral.Collection#
        * @param {number} at Index of the element.
        */
        Collection.prototype.get = function (at) {
            return this.items[at];
        };

        /**
        * Get an element in the collection and fire <code>set</code> event.
        * @method set
        * @memberof Coral.Collection#
        * @param obj The object to set.
        * @param {number} at Index of the element.
        */
        Collection.prototype.set = function (obj, at) {
            var oldValue = this.items[at];
            this.items[at] = obj;
            this.length = this.items.length;
            this.dispatch(new Coral.Event(Collection.SET_EVENT, { value: obj, oldValue: oldValue, at: at }));
        };
        Collection.ADD_EVENT = "add";

        Collection.REMOVE_EVENT = "remove";

        Collection.MOVE_EVENT = "move";

        Collection.SET_EVENT = "set";
        return Collection;
    })(Coral.EventDispatcher);
    Coral.Collection = Collection;
})(Coral || (Coral = {}));
var Coral;
(function (Coral) {
    ///<reference path="../ref.d.ts"/>
    /**
    * AsynchronousUpdater provide functions to update an object asynchronously
    * @namespace Coral.AsynchronousUpdater
    */
    (function (AsynchronousUpdater) {
        /**
        * Mixin for all objects that can be updated asynchronously
        * @constant Coral.UpdatableMixin
        * @type {Object}
        */
        AsynchronousUpdater.UpdatableMixin = {
            __mixin_name: "UpdatableMixin",
            update: Meta.Mixin.VIRTUAL,
            isUpToDate: false,
            planUpdate: function () {
                this.isUpToDate = false;
                AsynchronousUpdater.planUpdate(this);
            }
        };
        var updateStack = [];
        var timerId = undefined;

        /**
        * Plan an asynchronous update of the <code>updatable</code> object.
        * @method Coral.AsynchronousUpdater.planUpdate
        * @param {Object} updatable An object that implements UpdatableMixin
        */
        function planUpdate(updatable) {
            Meta.Mixin(updatable, AsynchronousUpdater.UpdatableMixin);
            if (updateStack.length == 0)
                timerId = setTimeout(AsynchronousUpdater.triggerUpdate, 0);
            updateStack.push(updatable);
        }
        AsynchronousUpdater.planUpdate = planUpdate;

        /**
        * Trigger update on all registered objects.<br/>
        * This method is automatically called when updates are planned.
        * @method Coral.AsynchronousUpdater.triggerUpdate
        */
        function triggerUpdate() {
            clearTimeout(timerId);
            var stack = updateStack;
            updateStack = [];
            for (var i = 0; i < stack.length; ++i)
                if (!stack[i].isUpToDate)
                    stack[i].update();
        }
        AsynchronousUpdater.triggerUpdate = triggerUpdate;
    })(Coral.AsynchronousUpdater || (Coral.AsynchronousUpdater = {}));
    var AsynchronousUpdater = Coral.AsynchronousUpdater;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    /**
    * Mixin for all objects that can expose state behaviors
    * @constant Coral.StateMixin
    * @type {Object}
    */
    Coral.StateMixin = {
        __mixin_name: "StateMixin",
        matchState: Meta.Mixin.VIRTUAL
    };

    /**
    * Event key for state change event
    * @constant Coral.STATE_CHANGE_EVENT
    * @type {string}
    * @default "stateChange"
    */
    Coral.STATE_CHANGE_EVENT = "stateChange";

    var stateExp = /([0-9a-zA-Z_\-]*).([0-9a-zA-Z_\-.]+)/;

    var StateMatching = (function () {
        /**
        * StateMatching class represent a state expression.<br/>
        * It is used with {@linkcode Coral.StateMixin} to provide state behaviors.
        * @constructor Coral.StateMatching
        * @param {string} statesExpression A state expression: "." separated state values surrounded with ":" separated state names.<br/>exemple ":state.value1.value2:state2.val1".
        */
        function StateMatching(statesExpression) {
            var statesList = statesExpression.split(":");
            for (var i = 0; i < statesList.length; ++i) {
                var states = statesList[i];
                if (states) {
                    var match = stateExp.exec(states);
                    if (match) {
                        var stateName = match[1] || StateMatching.DEFAULT_STATE;
                        var statesValues = match[2].split(".");
                        this[stateName] = statesValues;
                    } else
                        Coral.Utils.error("the state expression is malformed", this, statesExpression);
                }
            }
        }
        StateMatching.DEFAULT_STATE = "__default";
        return StateMatching;
    })();
    Coral.StateMatching = StateMatching;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var global = this;
var Coral;
(function (Coral) {
    var Bind = (function () {
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
        function Bind(chain, mode) {
            this.mode = mode || Bind.SIMPLE_BINDING_MODE;
            this.chain = chain;
        }
        Bind.simpleBindingExp = /^{[^{}]+}$/;
        Bind.compositeBindingExp = /{[^{}]+}/;

        Bind.SIMPLE_BINDING_MODE = 1;

        Bind.COMPOSITE_BINDING_MODE = 2;
        return Bind;
    })();
    Coral.Bind = Bind;

    var BindState = (function () {
        /**
        * BindState class represent the declaration of a state dependency.<br/>
        * It is used with {@linkcode Coral.Descriptor} and {@linkcode Coral.StateMixin}.
        * @constructor Coral.BindState
        * @see $BindState
        * @property {Array} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
        * @param {Object} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
        */
        function BindState(values) {
            this.values = [];
            for (var key in values) {
                if (key === "_")
                    this.values.push({ v: values._ }); else
                    this.values.unshift({ v: values[key], s: new Coral.StateMatching(key) });
            }
        }
        /**
        * Determine the current value for the given context.
        * @method resolve
        * @memberof Coral.BindState#
        * @param {Object} context Context must implements {@linkcode Coral.StateMixin}.
        * @returns {Object} the value that match context current state
        */
        BindState.prototype.resolve = function (context) {
            Meta.Mixin(context, Coral.StateMixin);
            for (var i = 0; i < this.values.length; ++i) {
                var value = this.values[i];
                if ((value.s && context.matchState(value.s)) || !value.s)
                    return value;
            }
            return undefined;
        };
        return BindState;
    })();
    Coral.BindState = BindState;

    var Descriptor = (function () {
        /**
        * Descriptor is some kind of generic Factory. It allows you to describe how to create an object.
        * The described class must be parented to {@linkcode Coral.DescribableObject}.
        * <code>description</code> can contains direct values, {@linkcode Coral.Bind} objects and {@linkcode Coral.BindState} objets.
        * Described events must follow the naming convention <code>/^(.*)Event$/</code> and described watchers the naming convention <code>/^(.*)Watcher$/</code>.
        * @constructor Coral.Descriptor
        * @see $Descriptor
        * @param type The class described by this descriptor
        * @param description Attributes, Events and Watchers description
        */
        function Descriptor(type, description) {
            this.type = type;
            this.type = type;
            this.attributes = Coral.Utils.objectFilter(description, undefined, /^.*Event|.*Watcher$/);
            this.events = Coral.Utils.objectFilter(description, /^(.*)Event$/);
            this.watchers = Coral.Utils.objectFilter(description, /^(.*)Watcher$/);
            Object.defineProperty(this, "uid", { writable: false, enumerable: false, value: Coral.Utils.getUID() });
        }
        Descriptor.instanciateAll = /**
        * Static method that create an Array of instances with <code>descriptors</code>
        * @method instanciateAll
        * @memberof Coral.Descriptor.
        * @param {Array} descriptors An Array of descriptors to instanciate
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context
        * @param [owner] The object that create and own the new instance
        * @param [from] An optional start index for the creation
        * @param [to] An optional end index for the creation
        */
        function (descriptors, context, owner, from, to) {
            var result = [];
            from = from || 0;
            to = to || descriptors.length - 1;
            for (var i = from; i <= to; ++i) {
                result.push(descriptors[i].instanciate(context, owner));
            }
            return result;
        };

        /**
        * Method that create a new instance of the described class
        * @method instanciate
        * @memberof Coral.Descriptor#
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context
        * @param [owner] The object that create and own the new instance
        * @param [item] An optional item used for item rendering
        */
        Descriptor.prototype.instanciate = function (context, owner, item) {
            var result;
            if (this.type) {
                if (this.type instanceof Function) {
                    result = new this.type(this, context, owner, item);
                } else {
                    var type = Coral.Utils.getChain(global, this.type);
                    if (type instanceof Function)
                        result = new type(this, context, owner, item); else
                        throw "'" + this.type + "' is not a constructor";
                }
            } else
                throw "Malformed descriptor : type is missing";
            return result;
        };
        return Descriptor;
    })();
    Coral.Descriptor = Descriptor;

    ;
})(Coral || (Coral = {}));

/**
* Shortcut to quickly create a {@linkcode Coral.Bind} object.<br/>
* Binding mode is detected automatically.
* @method $Bind
* @see Coral.Bind
* @param {string} chain The chain or composition that represent the binding
* @returns {Coral.Bind}
*/
function $Bind(chain) {
    if (Coral.Bind.simpleBindingExp.test(chain))
        return new Coral.Bind(chain.substring(1, chain.length - 1), Coral.Bind.SIMPLE_BINDING_MODE); else if (Coral.Bind.compositeBindingExp.test(chain))
        return new Coral.Bind(chain, Coral.Bind.COMPOSITE_BINDING_MODE); else
        return new Coral.Bind(chain, Coral.Bind.SIMPLE_BINDING_MODE);
}

/**
* Shortcut to quickly create a {@linkcode Coral.BindState} object.
* @method $BindState
* @see Coral.BindState
* @param {Object} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
* @returns {Coral.BindState}
*/
function $BindState(values) {
    return new Coral.BindState(values);
}

/**
* Shortcut to quickly create a {@linkcode Coral.Descriptor} object
* @method $Descriptor
* @see Coral.Descriptor
* @param type The class described by this descriptor
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Descriptor(type, description) {
    return new Coral.Descriptor(type, description);
}

/**
* Shortcut to quickly create a {@linkcode Coral.Descriptor} object without type information
* @method $Descriptor
* @see Coral.Descriptor
* @param type The class described by this descriptor
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Description(type, description) {
    return new Coral.Descriptor(undefined, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var DescribableObject = (function (_super) {
        __extends(DescribableObject, _super);
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
        function DescribableObject(description, context, owner, item) {
            _super.call(this, owner instanceof Coral.EventDispatcher ? owner : undefined);
            Object.defineProperty(this, "context", { writable: false, value: context || global });
            Object.defineProperty(this, "owner", { writable: false, value: owner });
            Object.defineProperty(this, "uid", { writable: false, value: Coral.Utils.getUID() });
            Object.defineProperty(this, "_externalDescription", { writable: false, enumerable: false, value: description });
            Object.defineProperty(this, "_descriptions", { writable: false, enumerable: false, configurable: false, value: { attributes: {}, events: {}, watchers: {} } });
            this.item = item;
            this.triggerDescriptions();

            if (this.context && this.id)
                this.context[this.id] = this;
            if (Meta.Mixin.is(this, Coral.StateMixin))
                this.on([Coral.STATE_CHANGE_EVENT, this.uid], this.triggerInternalDescriptions, this);
            if (this._externalDescription && Meta.Mixin.is(this.context, Coral.StateMixin) && this.context instanceof Coral.EventDispatcher)
                this.context.on([Coral.STATE_CHANGE_EVENT, this.uid], this.triggerExternalDescription, this);
        }
        /**
        * @private
        */
        DescribableObject.prototype.triggerDescriptions = function () {
            this.triggerInternalDescriptionsEventsAndWatchers(this, 0, true);
            if (this._externalDescription)
                this.triggerDescriptionEventsAndWatchers(this._externalDescription, this.context, 1, true);
            if (this._externalDescription)
                this.triggerDescriptionProperties(this._externalDescription, this.context, 1, true);
            this.triggerInternalDescriptionsProperties(this, 0, true);
        };

        /**
        * @private
        */
        DescribableObject.prototype.triggerInternalDescriptions = function () {
            this.triggerInternalDescriptionsEventsAndWatchers(this, 0);
            this.triggerInternalDescriptionsProperties(this, 0);
        };

        /**
        * @private
        */
        DescribableObject.prototype.triggerExternalDescription = function () {
            if (this._externalDescription) {
                this.triggerDescriptionEventsAndWatchers(this._externalDescription, this.context, 1);
                this.triggerDescriptionProperties(this._externalDescription, this.context, 1);
            }
        };

        /**
        * @private
        */
        DescribableObject.prototype.triggerInternalDescriptionsEventsAndWatchers = function (target, degree, first) {
            var prototype = Object.getPrototypeOf(target);
            if (prototype)
                this.triggerInternalDescriptionsEventsAndWatchers(prototype, degree - 1, first);
            if (target.hasOwnProperty("description"))
                this.triggerDescriptionEventsAndWatchers(target.description, this, degree, first);
        };

        /**
        * @private
        */
        DescribableObject.prototype.triggerInternalDescriptionsProperties = function (target, degree, first) {
            var prototype = Object.getPrototypeOf(target);
            if (target.hasOwnProperty("description"))
                this.triggerDescriptionProperties(target.description, this, degree, first);
            if (prototype)
                this.triggerInternalDescriptionsProperties(prototype, degree - 1, first);
        };

        /**
        * @private
        */
        DescribableObject.prototype.triggerDescriptionEventsAndWatchers = function (description, context, degree, first) {
            var events = this._descriptions.events[degree] = this._descriptions.events[degree] || {};
            for (var key in description.events) {
                var value = description.events[key];
                if (value instanceof Coral.BindState) {
                    value = value.resolve(context);
                    var lastValue = events[key];
                    if (lastValue === value)
                        continue;
                    if (lastValue)
                        this.off([key, description.uid]);
                    if (value)
                        this.on([key, description.uid], context[value.v], context);
                    events[key] = value;
                } else if (first)
                    this.on([key, description.uid], context[value], context);
            }
            var watchers = this._descriptions.watchers[degree] = this._descriptions.watchers[degree] || {};
            for (var key in description.watchers) {
                var value = description.watchers[key];
                if (value instanceof Coral.BindState) {
                    value = value.resolve(context);
                    var lastValue = watchers[key];
                    if (lastValue && lastValue.r === value)
                        continue;
                    if (lastValue)
                        lastValue.i.unbind();
                    if (value) {
                        var instance = new Coral.Watcher(this, key, context[value.v], context).bind();
                        watchers[key] = { r: value, i: instance };
                    } else
                        watchers[key] = undefined;
                } else if (first) {
                    var instance = new Coral.Watcher(this, key, context[value], context).bind();
                    watchers[key] = { i: instance };
                }
            }
        };

        /**
        * @private
        */
        DescribableObject.prototype.triggerDescriptionProperties = function (description, context, degree, first) {
            var properties = this._descriptions.attributes;
            for (var key in description.attributes) {
                var lastValue = properties[key];
                if (lastValue && lastValue.d > degree)
                    continue;
                var value = description.attributes[key];
                if (value instanceof Coral.BindState) {
                    value = value.resolve(context);
                    if (value) {
                        if (lastValue && lastValue.r === value)
                            continue;
                        if (lastValue && lastValue.i)
                            lastValue.i.unbind();
                        if (value.v instanceof Coral.Bind) {
                            if (value.v.mode == Coral.Bind.SIMPLE_BINDING_MODE)
                                var instance = new Coral.Binding(context, value.v.chain, this, key).bind(); else
                                var instance = new Coral.CompositeBinding(context, new Coral.BindingComposition(value.v.chain), this, key).bind();
                            properties[key] = { d: degree, r: value, i: instance };
                        } else {
                            this[key] = value.v;
                            properties[key] = { d: degree, r: value };
                        }
                    } else {
                        properties[key] = undefined;
                        this[key] = Object.getPrototypeOf(this)[key];
                    }
                } else if (first) {
                    if (value instanceof Coral.Bind) {
                        if (value.mode == Coral.Bind.SIMPLE_BINDING_MODE)
                            var instance = new Coral.Binding(context, value.chain, this, key).bind(); else
                            var instance = new Coral.CompositeBinding(context, new Coral.BindingComposition(value.chain), this, key).bind();
                        properties[key] = { d: degree, i: instance };
                    } else {
                        this[key] = value;
                        properties[key] = { d: degree };
                    }
                }
            }
        };

        /**
        * @method isExternal
        * @memberof Coral.DescribableObject#
        * @param {string} property The property key.
        * @returns {boolean} 'true' if the property is defined using an external descriptor.
        */
        DescribableObject.prototype.isExternal = function (property) {
            return this._descriptions.attributes[property] != undefined && this._descriptions.attributes[property].d == 1;
        };

        /**
        * Update function use for asynchronous updates
        * @method update
        * @memberof Coral.DescribableObject#
        */
        DescribableObject.prototype.update = function () {
            this.isUpToDate = true;
        };

        /**
        * Bindings and watchers create cross references between objects.<br/>
        * <code>destroy</code> call <code>unbind</code> on all of them to clean all references to this object.<br/>
        * Removing a {@linkcode Coral.DescribableObject} without calling destroy may prevent it from being garbage collected.
        * @method destroy
        * @memberof Coral.DescribableObject#
        */
        DescribableObject.prototype.destroy = function () {
            if (this.context instanceof Coral.EventDispatcher)
                this.context.off([Coral.STATE_CHANGE_EVENT, this.uid]);
            for (var degree in this._descriptions.watchers) {
                var properties = this._descriptions.watchers[degree];
                for (var property in properties) {
                    var value = properties[property];
                    if (value && value.i)
                        value.i.unbind();
                }
            }
            var properties = this._descriptions.attributes;
            for (var property in properties) {
                var value = properties[property];
                if (value && value.i)
                    value.i.unbind();
            }
            if (this.context && this.id)
                this.context[this.id] = undefined;
        };
        return DescribableObject;
    })(Coral.EventDispatcher);
    Coral.DescribableObject = DescribableObject;

    Meta.Bindable(DescribableObject.prototype, "item");
    Meta.Mixin(DescribableObject.prototype, Coral.AsynchronousUpdater.UpdatableMixin);
    Object.defineProperties(DescribableObject.prototype, {
        global: { writable: false, configurable: false, value: global },
        self: { configurable: false, get: function () {
                return this;
            } }
    });
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.DescribableObject} Descriptor
* @method $DescribableObject
* @see Coral.DescribableObject
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $DescribableObject(description) {
    return new Coral.Descriptor(Coral.DescribableObject, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Task = (function (_super) {
        __extends(Task, _super);
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
        function Task(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
        }
        /**
        * Execute the task and dispatch "run" event
        * @method run
        * @memberof Coral.Task#
        */
        Task.prototype.run = function () {
            if (this.running)
                throw "Task [" + this["constructor"].name + "] " + this.uid + " is already running";
            this.dispatch(new Coral.Event(Task.RUN_EVENT));
            this.canceled = false;
            this.running = true;
            this.do();
        };

        /**
        * Task stuff. Shall be override in child classes or configured dynamically.
        * @method do
        * @memberof Coral.Task#
        */
        Task.prototype.do = function () {
        };

        /**
        * Cancel the task if it is running
        * If the task is canceled, a "cancel" event is dispatched
        * @method cancel
        * @memberof Coral.Task#
        */
        Task.prototype.cancel = function () {
            if (this.running) {
                this.canceled = true;
                this.running = false;
                this.dispatch(new Coral.Event(Task.CANCEL_EVENT));
            }
        };

        /**
        * End the task execution and dispatch a "done" event
        * @method done
        * @memberof Coral.Task#
        */
        Task.prototype.done = function () {
            this.running = false;
            this.dispatch(new Coral.Event(Task.DONE_EVENT));
        };
        Task.RUN_EVENT = "run";

        Task.DONE_EVENT = "done";

        Task.CANCEL_EVENT = "cancel";
        return Task;
    })(Coral.DescribableObject);
    Coral.Task = Task;
    Task.prototype.canceled = false;
    Task.prototype.running = false;
    Task.prototype.critical = true;

    var SequentialTasks = (function (_super) {
        __extends(SequentialTasks, _super);
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
        function SequentialTasks(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
        }
        /**
        * Execute all tasks described in tasks property sequentialy
        * @method do
        * @memberof Coral.SequentialTasks#
        */
        SequentialTasks.prototype.do = function () {
            if (!this.tasksInitialized && this.tasks) {
                this._tasks = Coral.Descriptor.instanciateAll(this.tasks, this.isExternal("tasks") ? this.context : this, this);
                this.tasksInitialized = true;
            }
            this.taskIndex = -1;
            this.runNext();
        };

        /**
        * Cancel this task by calling cancel on all runnig sub tasks
        * @method cancel
        * @memberof Coral.SequentialTasks#
        */
        SequentialTasks.prototype.cancel = function () {
            _super.prototype.cancel.call(this);
            if (this.running) {
                if (this._tasks && this.taskIndex < this._tasks.length) {
                    this._tasks[this.taskIndex].off([Task.DONE_EVENT, this.uid]);
                    this._tasks[this.taskIndex].off([Task.CANCEL_EVENT, this.uid]);
                    this._tasks[this.taskIndex].cancel();
                }
            }
        };

        /**
        * @private
        */
        SequentialTasks.prototype.subTaskCanceled = function (event) {
            if (event.target.critical)
                this.cancel(); else
                this.runNext();
        };

        /**
        * @private
        */
        SequentialTasks.prototype.runNext = function () {
            if (this.taskIndex >= 0) {
                this._tasks[this.taskIndex].off([Task.DONE_EVENT, this.uid]);
                this._tasks[this.taskIndex].off([Task.CANCEL_EVENT, this.uid]);
            }
            if (!this.canceled) {
                ++this.taskIndex;
                if (!this._tasks || this._tasks.length <= this.taskIndex)
                    this.done(); else {
                    var task = this._tasks[this.taskIndex];
                    task.on([Task.DONE_EVENT, this.uid], this.runNext, this);
                    task.on([Task.CANCEL_EVENT, this.uid], this.subTaskCanceled, this);
                    task.run();
                }
            }
        };

        /**
        * Call super class destroy and destroy sub tasks
        * @method destroy
        * @memberof Coral.SequentialTasks#
        */
        SequentialTasks.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._tasks)
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].destroy();
                }
        };
        return SequentialTasks;
    })(Task);
    Coral.SequentialTasks = SequentialTasks;

    var ParallelTasks = (function (_super) {
        __extends(ParallelTasks, _super);
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
        function ParallelTasks(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
        }
        /**
        * Execute all tasks described in <code>tasks</code> property in parallel.
        * @method do
        * @memberof Coral.ParallelTasks#
        */
        ParallelTasks.prototype.do = function () {
            if (!this.tasksInitialized && this.tasks) {
                this._tasks = Coral.Descriptor.instanciateAll(this.tasks, this.isExternal("tasks") ? this.context : this, this);
                this.tasksInitialized = true;
            }
            if (!this._tasks || this._tasks.length == 0)
                this.done(); else {
                this.taskCount = 0;
                for (var i = 0; i < this._tasks.length && !this.canceled; ++i) {
                    var task = this._tasks[i];
                    task.on([Task.DONE_EVENT, this.uid], this.partialDone, this);
                    task.on([Task.CANCEL_EVENT, this.uid], this.subTaskCanceled, this);
                    this._tasks[i].run();
                }
            }
        };

        /**
        * Cancel this task by calling cancel on all runnig sub tasks.
        * @method cancel
        * @memberof Coral.ParallelTasks#
        */
        ParallelTasks.prototype.cancel = function () {
            _super.prototype.cancel.call(this);
            if (this._tasks)
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].off([Task.DONE_EVENT, this.uid]);
                    this._tasks[i].off([Task.CANCEL_EVENT, this.uid]);
                    this._tasks[i].cancel();
                }
        };

        /**
        * @private
        */
        ParallelTasks.prototype.subTaskCanceled = function (event) {
            if ((event.target).critical)
                this.cancel(); else
                this.partialDone();
        };

        /**
        * @private
        */
        ParallelTasks.prototype.partialDone = function () {
            if (!this.canceled) {
                ++this.taskCount;
                if (this.taskCount >= this._tasks.length) {
                    for (var i = 0; i < this._tasks.length; ++i) {
                        this._tasks[i].off([Task.DONE_EVENT, this.uid]);
                        this._tasks[i].off([Task.CANCEL_EVENT, this.uid]);
                    }
                    this.done();
                }
            }
        };

        /**
        * Destroy sub tasks.
        * @method destroy
        * @memberof Coral.ParallelTasks#
        */
        ParallelTasks.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._tasks)
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].destroy();
                }
        };
        return ParallelTasks;
    })(Task);
    Coral.ParallelTasks = ParallelTasks;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.Task} Descriptor.
* @method $Task
* @see Coral.Task
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Task(description) {
    return new Coral.Descriptor(Coral.Task, description);
}

/**
* Shortcut for creating a {@linkcode Coral.SequentialTasks} Descriptor.
* @method $SequentialTasks
* @see Coral.SequentialTasks
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $SequentialTasks(description) {
    return new Coral.Descriptor(Coral.SequentialTasks, description);
}

/**
* Shortcut for creating a {@linkcode Coral.ParallelTasks} Descriptor.
* @method $ParallelTasks
* @see Coral.ParallelTasks
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $ParallelTasks(description) {
    return new Coral.Descriptor(Coral.ParallelTasks, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var DescriptorsFactory = (function (_super) {
        __extends(DescriptorsFactory, _super);
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
        function DescriptorsFactory(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
            this.from = this.from || 0;
        }
        Object.defineProperty(DescriptorsFactory.prototype, "descriptors", {
            get: function () {
                return this._descriptors;
            },
            set: function (v) {
                if (this._descriptors == v)
                    return;
                this._descriptors = Array.isArray(v) ? v : [v];
                this.to = this.to || this._descriptors.length;
                this.to = this.to > this._descriptors.length ? this._descriptors.length : this.to;
                this.from = this.from > this._descriptors.length ? 0 : this.from;
                this._descriptorsUpToDate = false;
                this.planUpdate();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DescriptorsFactory.prototype, "from", {
            get: function () {
                return this._from;
            },
            set: function (v) {
                if (this._from == v)
                    return;
                this._from = v;
                this._rangeUpToDate = false;
                this.planUpdate();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DescriptorsFactory.prototype, "to", {
            get: function () {
                return this._to;
            },
            set: function (v) {
                if (this._to == v)
                    return;
                this._to = v;
                this._rangeUpToDate = false;
                this.planUpdate();
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Asynchronous update<br/>
        * It creates all instances from <code>descriptors</code> taking in account <code>from</code>, <code>to</code> and all special properties
        * @method update
        * @memberof Coral.DescriptorsFactory#
        */
        DescriptorsFactory.prototype.update = function () {
            _super.prototype.update.call(this);
            var instancesOwner = this.external ? this.owner.context : this.owner;
            if (!this.descriptors)
                return;
            if (!this._descriptorsUpToDate) {
                if (Meta.Mixin.is(instancesOwner, Coral.StateMixin) && instancesOwner instanceof Coral.EventDispatcher)
                    instancesOwner.off([Coral.STATE_CHANGE_EVENT, this.uid]);
                this._rangeUpToDate = false;
                if (this.instances)
                    for (var i = 0; i < this.instances.length; ++i)
                        this.deactivateInstance(i);
                this.instances = [];
                for (var i = 0; i < this.descriptors.length; ++i) {
                    var descriptor = this.descriptors[i];
                    var instance = { descriptor: descriptor };
                    this.instances.push(instance);
                    if (descriptor.attributes.include)
                        instance.watcher = new Coral.Watcher(instancesOwner, descriptor.attributes.include, this.includeChange, this, i); else if (Meta.Mixin.is(instancesOwner, Coral.StateMixin)) {
                        if (descriptor.attributes.includeIn) {
                            this.dependsOnOwnerState = true;
                            instance.includeIn = new Coral.StateMatching(descriptor.attributes.includeIn);
                        } else if (descriptor.attributes.excludeFrom) {
                            this.dependsOnOwnerState = true;
                            instance.excludeFrom = new Coral.StateMatching(descriptor.attributes.excludeFrom);
                        }
                    }
                }
                if (this.dependsOnOwnerState)
                    instancesOwner.on([Coral.STATE_CHANGE_EVENT, this.uid], this.stateChange, this);
            }
            if (!this._rangeUpToDate) {
                if (this._descriptorsUpToDate) {
                    for (var i = 0; i < this.from; ++i)
                        this.deactivateInstance(i);
                    for (i = this.to; i < this.instances.length; ++i)
                        this.deactivateInstance(i);
                }
                this._descriptorsUpToDate = true;
                this._rangeUpToDate = true;
                for (i = this.from; i < this.to; ++i)
                    this.checkInstance(i);
            }
        };

        /**
        * @private
        */
        DescriptorsFactory.prototype.checkInstance = function (index) {
            if (index < this.from || index >= this.to)
                return;
            var instancesOwner = this.external ? this.owner.context : this.owner;
            var instance = this.instances[index];
            if (instance.watcher) {
                if (!instance.isActive)
                    instance.watcher.bind();
                if (instance.watcher.result)
                    this.activateInstance(index); else
                    this.deactivateInstance(index);
            } else if (instance.includeIn) {
                if (instancesOwner.matchState(instance.includeIn))
                    this.activateInstance(index); else
                    this.deactivateInstance(index);
            } else if (instance.excludeFrom) {
                if (instancesOwner.matchState(instance.excludeFrom))
                    this.deactivateInstance(index); else
                    this.activateInstance(index);
            } else
                this.activateInstance(index);
        };

        /**
        * @private
        */
        DescriptorsFactory.prototype.activateInstance = function (index) {
            var instance = this.instances[index];
            if (instance.isActive)
                return;
            if (!instance.instance)
                instance.instance = instance.descriptor.instanciate(this.external ? this.owner.context : this.owner, this.owner);
            this.collection.insert(instance.instance, this.calculateCollectionIndex(index));
            instance.isActive = true;
        };

        /**
        * @private
        */
        DescriptorsFactory.prototype.deactivateInstance = function (index) {
            var instance = this.instances[index];
            if (instance.watcher)
                instance.watcher.unbind();
            if (instance.instance) {
                this.collection.remove(instance.instance);
                if (!instance.instance.cache) {
                    instance.instance.destroy();
                    instance.instance = undefined;
                }
            }
            instance.isActive = false;
        };

        DescriptorsFactory.prototype.includeChange = function (oldValue, newValue, index) {
            this.checkInstance(index);
        };

        /**
        * @private
        */
        DescriptorsFactory.prototype.stateChange = function (event) {
            for (var i = this.from; i < this.to; ++i) {
                var instance = this.instances[i];
                if (instance.includeIn || instance.excludeFrom)
                    this.checkInstance(i);
            }
        };

        /**
        * @private
        */
        DescriptorsFactory.prototype.calculateCollectionIndex = function (index) {
            var count = 0;
            for (var i = this.from; i < index; ++i)
                if (this.instances[i].isActive)
                    ++count;
            return count;
        };

        /**
        * @private
        */
        DescriptorsFactory.prototype.parseIncludeProperty = function (include) {
            var states = include.split(":");
            var result = [];
            for (var i = 0; i < states.length; ++i) {
                if (states[i] && states[i] != "")
                    result.push(states[i].split("."));
            }
            return result;
        };

        DescriptorsFactory.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            for (var i = 0; i < this.instances.length; ++i)
                if (this.instances[i].watcher)
                    this.instances[i].watcher.unbind();
            while (this.collection.length > 0) {
                var item = this.collection.get(0);
                this.collection.remove(item);
                item.destroy();
            }
            var instancesOwner = this.external ? this.owner.context : this.owner;
            instancesOwner.off([Coral.STATE_CHANGE_EVENT, this.uid]);
        };
        return DescriptorsFactory;
    })(Coral.DescribableObject);
    Coral.DescriptorsFactory = DescriptorsFactory;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.DescriptorsFactory} Descriptor.
* @method $DescriptorsFactory
* @see Coral.DescriptorsFactory
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $DescriptorsFactory(description) {
    return new Coral.Descriptor(Coral.DescriptorsFactory, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var DataDescriptorsFactory = (function (_super) {
        __extends(DataDescriptorsFactory, _super);
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
        function DataDescriptorsFactory(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
        }
        Object.defineProperty(DataDescriptorsFactory.prototype, "items", {
            get: function () {
                return this._items;
            },
            set: function (v) {
                if (this._items == v)
                    return;
                if (this._items && this._items instanceof Coral.Collection) {
                    this._items.off([Coral.Collection.ADD_EVENT, this.uid]);
                    this._items.off([Coral.Collection.REMOVE_EVENT, this.uid]);
                    this._items.off([Coral.Collection.MOVE_EVENT, this.uid]);
                    this._items.off([Coral.Collection.SET_EVENT, this.uid]);
                }
                this._items = v;
                this._itemsUpToDate = false;
                if (this._items && this._items instanceof Coral.Collection) {
                    this.items.on([Coral.Collection.ADD_EVENT, this.uid], this.addHandler, this);
                    this.items.on([Coral.Collection.REMOVE_EVENT, this.uid], this.removeHandler, this);
                    this.items.on([Coral.Collection.MOVE_EVENT, this.uid], this.moveHandler, this);
                    this.items.on([Coral.Collection.SET_EVENT, this.uid], this.setHandler, this);
                }
                this.planUpdate();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DataDescriptorsFactory.prototype, "itemDescriptor", {
            get: function () {
                return this._itemDescriptor;
            },
            set: function (v) {
                if (this._itemDescriptor == v)
                    return;
                this._itemDescriptor = v;
                this._itemDescriptorUpToDate = false;
                this.planUpdate();
            },
            enumerable: true,
            configurable: true
        });

        /**
        * @private
        */
        DataDescriptorsFactory.prototype.addHandler = function (event) {
            var instance = this.itemDescriptor.instanciate(this.external ? this.owner.context : this.owner, this.owner, event.data.value);
            if (event.data.index)
                this.collection.insert(instance, event.data.index); else
                this.collection.add(instance);
        };

        /**
        * @private
        */
        DataDescriptorsFactory.prototype.removeHandler = function (event) {
            this.collection.get(event.data.index).destroy();
            this.collection.remove(this.collection.get(event.data.index));
        };

        DataDescriptorsFactory.prototype.moveHandler = function (event) {
            this.collection.move(event.data.from, event.data.to);
        };

        /**
        * @private
        */
        DataDescriptorsFactory.prototype.setHandler = function (event) {
            this.collection.get(event.data.at).destroy();
            var instance = this.itemDescriptor.instanciate(this.external ? this.owner.context : this.owner, this.owner, event.data.value);
            this.collection.set(instance, event.data.at);
        };

        /**
        * Asynchronous update<br/>
        * Check manually that items and collection are synchronized
        * @method update
        * @memberof Coral.DataDescriptorsFactory#
        */
        DataDescriptorsFactory.prototype.update = function () {
            _super.prototype.update.call(this);
            if (!this._itemDescriptorUpToDate) {
                this._itemDescriptorUpToDate = true;
                while (this.collection.length > 0) {
                    var item = this.collection.get(0);
                    this.collection.remove(item);
                    item.destroy();
                }
            }
            if (!this._itemsUpToDate) {
                this._itemsUpToDate = true;
                var context = this.external ? this.owner.context : this.owner;
                if (this.items)
                    for (var j = 0; j < this.items.length; ++j) {
                        var instance = undefined;
                        if (this.collection.length > j && this.collection.get(j).item == this.items.get(j))
                            instance = this.collection[j]; else {
                            for (var k = j + 1; k < this.collection.length; ++k) {
                                if (this.collection.get(k).item === this.items.get(j)) {
                                    instance = this.collection.get(k);
                                    this.collection.swap(k, j);
                                }
                            }
                        }
                        if (!instance) {
                            instance = this.itemDescriptor.instanciate(context, this.owner, this.items.get(j));
                            this.collection.insert(instance, j);
                        }
                    }
                if (this.items)
                    for (var j = this.items.length; j < this.collection.length; ) {
                        this.collection.get(j).destroy();
                        this.collection.remove(this.collection.get(j));
                    }
            }
        };

        DataDescriptorsFactory.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            while (this.collection.length > 0) {
                var item = this.collection.get(0);
                this.collection.remove(item);
                item.destroy();
            }
            if (this._items && this._items instanceof Coral.Collection) {
                this._items.off([Coral.Collection.ADD_EVENT, this.uid]);
                this._items.off([Coral.Collection.REMOVE_EVENT, this.uid]);
                this._items.off([Coral.Collection.MOVE_EVENT, this.uid]);
                this._items.off([Coral.Collection.SET_EVENT, this.uid]);
            }
        };
        return DataDescriptorsFactory;
    })(Coral.DescribableObject);
    Coral.DataDescriptorsFactory = DataDescriptorsFactory;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.DataDescriptorsFactory} Descriptor
* @method $DataDescriptorsFactory
* @see Coral.DataDescriptorsFactory
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $DataDescriptorsFactory(description) {
    return new Coral.Descriptor(Coral.DataDescriptorsFactory, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var ActionMap = (function (_super) {
        __extends(ActionMap, _super);
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
        function ActionMap(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
            if (!(this.owner instanceof Coral.EventDispatcher))
                Coral.Utils.error("owner of an ActionMap must be an instance of EventDispatcher", this);
            if (this.actions)
                this._actions = Coral.Descriptor.instanciateAll(this.actions, this.isExternal("actions") ? this.context : this, this);
        }
        /**
        * Destroy this instance and all nested {@linkcode Coral.Action}
        * @method destroy
        * @memberof Coral.ActionMap#
        */
        ActionMap.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._actions)
                for (var i = 0; i < this._actions.length; ++i)
                    this._actions[i].destroy();
        };
        return ActionMap;
    })(Coral.DescribableObject);
    Coral.ActionMap = ActionMap;

    var Action = (function (_super) {
        __extends(Action, _super);
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
        function Action(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
            if (!this.event)
                Coral.Utils.error("'event' is mandatory on Action", this);
            if (!(this.owner instanceof ActionMap))
                Coral.Utils.error("owner of an Action must be an instance of ActionMap", this);
            this.owner.owner.on([this.event, this.uid], function (event) {
                this.currentEvent = event;
                this.run();
            }, this);
        }
        Action.prototype.done = function () {
            _super.prototype.done.call(this);
            this.currentEvent = undefined;
        };

        Action.prototype.cancel = function () {
            _super.prototype.cancel.call(this);
            this.currentEvent = undefined;
        };

        Action.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.owner.owner.off([this.event, this.uid]);
        };
        return Action;
    })(Coral.SequentialTasks);
    Coral.Action = Action;
})(Coral || (Coral = {}));

/**
* Shortcut for creating an {@linkcode Coral.ActionMap} descriptor.
* @method $ActionMap
* @see Coral.ActionMap
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $ActionMap(description) {
    return new Coral.Descriptor(Coral.ActionMap, description);
}

/**
* Shortcut for creating an {@linkcode Coral.Action} descriptor.
* @method $Action
* @see Coral.Action
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Action(description) {
    return new Coral.Descriptor(Coral.Action, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var normalizeExp = /^[/]*(.*[^/])[/]*$/;
    var NavigationMap = (function (_super) {
        __extends(NavigationMap, _super);
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
        function NavigationMap(description, context, owner) {
            this.mode = NavigationMap.HISTORY_MODE;
            if (NavigationMap.instance)
                return NavigationMap.instance;
            _super.call(this, description, context, owner);
            NavigationMap.instance = this;
            if (this.actions)
                this._actions = Coral.Descriptor.instanciateAll(this.actions, this.isExternal("actions") ? this.context : this, this);
            if (window && this.mode == NavigationMap.HISTORY_MODE)
                $(window).on("popstate.NavigationMap", this._handlePopState.bind(this));
            if (history && this.mode == NavigationMap.HISTORY_MODE)
                this.historyState = history.state;
        }
        NavigationMap.prototype._handlePopState = function (event) {
            this.historyState = event.state;
            this._calculateSubPath(window.location.pathname);
            this.triggerActions();
        };

        NavigationMap.normalize = /**
        * @private
        */
        function (path) {
            if (path == "" || !path)
                return "/";
            var match = normalizeExp.exec(path);
            if (match) {
                return "/" + match[1];
            } else
                throw "error";
        };

        NavigationMap.prototype._calculateSubPath = function (path) {
            var index = path.lastIndexOf(this._rootPath);
            if (index == 0) {
                var splittedPath = path.substring(this._rootPath.length, path.length);
                this._subPath = NavigationMap.normalize(splittedPath);
                this.currentPath = this._rootPath + this._subPath;
            } else
                throw "error";
        };

        NavigationMap.prototype._calculatePath = function (subPath) {
            this._subPath = NavigationMap.normalize(subPath);
            this.currentPath = this._rootPath + this._subPath;
        };

        /**
        * Start the <code>NavigationMap</code> and trigger nested {@linkcode Coral.NavigationAction} that match <code>currentPath</code>.
        * @method start
        * @memberof Coral.NavigationMap#
        */
        NavigationMap.prototype.start = function (rootPath, silent, fullPath) {
            this._rootPath = NavigationMap.normalize(rootPath);
            this._calculateSubPath(NavigationMap.normalize(fullPath || window.location.pathname));
            if (!silent)
                this.triggerActions();
        };

        /**
        * Navigate to a new path and trigger all matching nested NavigationAction.
        * @method navigate
        * @memberof Coral.NavigationMap#
        */
        NavigationMap.prototype.navigate = function (path, replace, state) {
            this._calculatePath(path);
            if (history && this.mode == NavigationMap.HISTORY_MODE) {
                if (replace)
                    history.replaceState(state, "", this.currentPath); else
                    history.pushState(state, "", this.currentPath);
            }
            this.triggerActions();
        };

        /**
        * Trigger all nested NavigationAction that match current path.
        * @method triggerActions
        * @memberof Coral.NavigationMap#
        */
        NavigationMap.prototype.triggerActions = function () {
            if (this._actions)
                for (var i = 0; i < this._actions.length; ++i) {
                    var action = this._actions[i];
                    action.applyPath(this._subPath);
                }
        };

        /**
        * Destroy this object and all nested actions.
        * @method destroy
        * @memberof Coral.NavigationMap#
        */
        NavigationMap.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (window)
                $(window).off("popstate.NavigationMap");
            if (this._actions)
                for (var i = 0; i < this._actions.length; ++i)
                    this._actions[i].destroy();
            NavigationMap.instance = undefined;
        };
        NavigationMap.instance = undefined;

        NavigationMap.NONE_MODE = 1;

        NavigationMap.HISTORY_MODE = 2;
        return NavigationMap;
    })(Coral.DescribableObject);
    Coral.NavigationMap = NavigationMap;

    var pathRegexp = /([^{}]+|{([^{}]+)})/g;
    var NavigationAction = (function (_super) {
        __extends(NavigationAction, _super);
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
        function NavigationAction(description, context, owner) {
            _super.call(this, description, context, owner, undefined);
            if (!this.path)
                Coral.Utils.error("'path' is mandatory on NavigationAction", this);
            if (!(this.owner instanceof NavigationMap))
                Coral.Utils.error("owner of an NavigationAction must be an instance of NavigationMap", this);
            this._path = NavigationMap.normalize(this.path);
            var match;
            var construct = "";
            var names = [];
            while (match = pathRegexp.exec(this._path)) {
                if (!match[2])
                    construct += match[1]; else {
                    construct += "(.*)";
                    names.push(match[2]);
                }
            }
            this._pathExpression = new RegExp("^" + construct + "$");
            this._names = names;
        }
        /**
        * Check if the given path match the path expression and then run the NavigationAction
        * @method applyPath
        * @memberof Coral.NavigationAction#
        * @param {string} path The path to match
        * @returns {boolean} <code>true</code> if the <code>NavigationAction</code> starts running
        */
        NavigationAction.prototype.applyPath = function (path) {
            var match = this._pathExpression.exec(path);
            if (match) {
                for (var i = 0; i < this._names.length; ++i) {
                    this.params = {};
                    this.params[this._names[i]] = match[i + 1];
                }
                this.run();
                return true;
            }
            return false;
        };
        return NavigationAction;
    })(Coral.SequentialTasks);
    Coral.NavigationAction = NavigationAction;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.NavigationMap} Descriptor.
* @method $NavigationMap
* @see Coral.NavigationMap
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $NavigationMap(description) {
    return new Coral.Descriptor(Coral.NavigationMap, description);
}

/**
* Shortcut for creating a {@linkcode Coral.NavigationAction} Descriptor.
* @method $NavigationAction
* @see Coral.NavigationAction
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $NavigationAction(description) {
    return new Coral.Descriptor(Coral.NavigationAction, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var MethodTask = (function (_super) {
        __extends(MethodTask, _super);
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
        function MethodTask(description, context, owner) {
            this.apply = false;
            _super.call(this, description, context, owner);
        }
        MethodTask.prototype.run = function () {
            _super.prototype.run.call(this);
            if (this.target && this.method) {
                if (this.params)
                    this.apply ? this.target[this.method].apply(this.target, this.params) : this.target[this.method].call(this.target, this.params); else
                    this.target[this.method]();
            }
            this.done();
        };
        return MethodTask;
    })(Coral.Task);
    Coral.MethodTask = MethodTask;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.MethodTask} Descriptor
* @method $MethodTask
* @see Coral.MethodTask
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $MethodTask(description) {
    return new Coral.Descriptor(Coral.MethodTask, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var SetTask = (function (_super) {
        __extends(SetTask, _super);
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
        function SetTask(description, context, owner) {
            _super.call(this, description, context, owner);
        }
        SetTask.prototype.run = function () {
            _super.prototype.run.call(this);
            if (this.target && this.property)
                this.target[this.property] = this.value;
            this.done();
        };
        return SetTask;
    })(Coral.Task);
    Coral.SetTask = SetTask;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.SetTask} Descriptor.
* @method $SetTask
* @see Coral.SetTask
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $SetTask(description) {
    return new Coral.Descriptor(Coral.SetTask, description);
}
///<reference path="../ref.d.ts"/>
var Meta;
(function (Meta) {
    /**
    * Generate Model behavior in the given object.
    * @method Meta#Model
    * @param {Object} prototype Class prototype or Object where properties will be added.
    * @param {string} name The unique name of this model.
    * @param {string} primaryKey The primary key of this model object.
    * @param {Array} keys All keys that belongs to the model.
    */
    function Model(prototype, name, primaryKey, keys) {
        Object.defineProperty(prototype, Meta.Model.MODEL_NAME_KEY, { value: name, writable: false, enumerable: false, configurable: false });
        Object.defineProperty(prototype, Meta.Model.MODEL_PRIMARY_KEY, { value: primaryKey, writable: false, enumerable: false, configurable: false });
        Object.defineProperty(prototype, Meta.Model.MODEL_KEYS_KEY, { value: keys, writable: false, enumerable: false, configurable: false });
        Meta.Model.Store._createStore(name);
        Object.defineProperty(prototype, primaryKey, {
            get: function () {
                return this.__model ? this.__model[primaryKey] : undefined;
            }
        });
        if (keys)
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                Meta.Model.ModelAttribute(prototype, key);
            }
    }
    Meta.Model = Model;

    (function (Model) {
        Model.MODEL_NAME_KEY = "__model_name";
        Model.MODEL_KEYS_KEY = "__model_keys";
        Model.MODEL_PRIMARY_KEY = "__model_primary";
        Model.MODEL_KEY = "__model";
        Model.MODEL_DIRTY_KEY = "__model_dirty";

        /**
        * Register a new model attribute.
        * @method Meta.Model.ModelAttribute
        * @param {Object} object Class prototype or Object where property will be added.
        * @param {string} key The key to add in this model object.
        */
        function ModelAttribute(object, key) {
            var hostObject = Meta.Utils.findPropertyDefinition(object, key);
            var desc = Object.getOwnPropertyDescriptor(hostObject, key);
            if (!desc) {
                Object.defineProperty(object, key, {
                    get: function () {
                        return this.__model ? this.__model[key] : undefined;
                    },
                    set: function (v) {
                        if (!this.hasOwnProperty(Meta.Model.MODEL_KEY))
                            this.__model = {};
                        this.__model[key] = v;
                        this.__model_dirty = true;
                    },
                    enumerable: desc ? desc.enumerable : true
                });
            } else
                Coral.Utils.error("property cannot be a Model property because the property already exist", object, key);
        }
        Model.ModelAttribute = ModelAttribute;

        /**
        * Get the model name of this object.
        * @method Meta.Model.getModelName
        * @param {Object} object
        * @returns {string} Model name.
        */
        function getModelName(object) {
            return object.__model_name;
        }
        Model.getModelName = getModelName;

        /**
        * Get the model primary key name of this object.
        * @method Meta.Model.getPrimaryKey
        * @param {Object} object
        * @returns {string} Primary key name.
        */
        function getPrimaryKey(object) {
            return object.__model_primary;
        }
        Model.getPrimaryKey = getPrimaryKey;

        /**
        * Get the model keys of this object.
        * @method Meta.Model.getKeys
        * @param {Object} object
        * @returns {Array} Model keys.
        */
        function getKeys(object) {
            return object.__model_keys;
        }
        Model.getKeys = getKeys;

        /**
        * Get the model primary key name of this object.
        * @method Meta.Model.getPrimaryValue
        * @param {Object} object
        * @returns {Object} The primary key value.
        */
        function getPrimaryValue(object) {
            return object.__model ? object.__model[Meta.Model.getPrimaryKey(object)] : undefined;
        }
        Model.getPrimaryValue = getPrimaryValue;

        /**
        * Check if an object has dirty model properties.
        * @method Meta.Model.isDirty
        * @param {Object} object
        * @returns {boolean} <code>true</code> if the object is dirty.
        */
        function isDirty(object) {
            return !!object.__model_dirty;
        }
        Model.isDirty = isDirty;

        /**
        * Change the dirty flag to false.
        * @method Meta.Model.clean
        * @param {Object} object
        */
        function clean(object) {
            object.__model_dirty = false;
        }
        Model.clean = clean;

        /**
        * Get all model data as a separated object.
        * @method Meta.Model.getModelData
        * @param {Object} object
        * @returns {Object} The current model data.
        */
        function getModelData(object) {
            return object.__model;
        }
        Model.getModelData = getModelData;

        /**
        * Set the model data object.
        * @method Meta.Model.setModelData
        * @param {Object} object
        * @param {Object} data The new model data.
        * @param {boolean} [silent=false] if <code>true</code> binding are not triggered.
        */
        function setModelData(object, data, silent) {
            object.__model = data;
            object.__model_dirty = false;
            if (!silent)
                Meta.Bindable.triggerAll(object, Meta.Model.getKeys(object));
        }
        Model.setModelData = setModelData;

        (function (Store) {
            Store._stores = {};
            function _createStore(name) {
                this._stores[name] = this._stores[name] || {};
            }
            Store._createStore = _createStore;

            /**
            * Get or update the model corresponding to given parameters.
            * @method Meta.Model.Store.getModel
            * @param {Object} type Class or prototype of a model object.
            * @param {Object} rawData model data.
            * @returns {Object} model.
            */
            function getModel(type, rawData) {
                var prototype = type instanceof Function ? type.prototype : type;
                var primaryValue = rawData[Meta.Model.getPrimaryKey(prototype)];
                if (primaryValue) {
                    var existingModel = this.modelByKey(type, primaryValue);
                    if (existingModel) {
                        Meta.Model.setModelData(existingModel, rawData);
                        return existingModel;
                    } else {
                        var newModel = type instanceof Function ? new type() : Object.create(type);
                        Meta.Model.setModelData(newModel, rawData, true);
                        this.registerModel(newModel);
                        return newModel;
                    }
                }
                return undefined;
            }
            Store.getModel = getModel;

            /**
            * Get or update models corresponding to given parameters.
            * @method Meta.Model.Store.getModels
            * @param {Object} type Class or prototype of a model object.
            * @param {Object} rawDatas models data.
            * @returns {Array} models.
            */
            function getModels(type, rawDatas) {
                var result = [];
                for (var i = 0; i < rawDatas.length; ++i)
                    result.push(this.getModel(type, rawDatas[i]));
                return result;
            }
            Store.getModels = getModels;

            /**
            * Store a given model.
            * @method Meta.Model.Store.registerModel
            * @param {Object} model A model instance.
            * @returns {boolean} <code>true</code> if the model has been stored properly.
            */
            function registerModel(model) {
                var name = Meta.Model.getModelName(model);
                var primaryValue = Meta.Model.getPrimaryValue(model);
                if (name && primaryValue) {
                    var store = this._stores[name];
                    store[primaryValue] = model;
                    return true;
                }
                return false;
            }
            Store.registerModel = registerModel;

            /**
            * Get a model from the cache by its primary key.
            * @method Meta.Model.Store.modelByKey
            * @param {Object} type Class or prototype of a model object.
            * @param {string} primaryValue The primary key.
            * @returns {Object} the requested model.
            */
            function modelByKey(type, primaryValue) {
                var prototype = type instanceof Function ? type.prototype : type;
                var name = Meta.Model.getModelName(prototype);
                if (name) {
                    var store = this._stores[name];
                    return store[primaryValue];
                }
                return undefined;
            }
            Store.modelByKey = modelByKey;

            /**
            * Clear the store of models identified by its model name.<br/>
            * If no name is specified, all stores are cleared.
            * @method Meta.Model.Store.clear
            * @param {string} [name] The name of the model.
            */
            function clear(name) {
                if (!name)
                    for (var name in this._stores)
                        this._stores[name] = {}; else
                    this._stores[name] = {};
            }
            Store.clear = clear;
        })(Model.Store || (Model.Store = {}));
        var Store = Model.Store;
    })(Meta.Model || (Meta.Model = {}));
    var Model = Meta.Model;
})(Meta || (Meta = {}));
///<reference path="../ref.d.ts"/>
var Meta;
(function (Meta) {
    /**
    * Generate a style property on the target object.<br/>
    * Target object must extend {@linkcode Coral.Component}.
    * @method Meta#StyleProperty
    * @param {Object} object Target class prototype or Object
    * @param {string} key Property key for the style attribute
    * @param {string} styleKey Style key on the Dom element
    */
    function StyleProperty(object, key, styleKey) {
        styleKey = styleKey || key;
        Object.defineProperty(object, key, {
            get: function () {
                var domElt = this.$el;
                if (domElt)
                    return domElt.css(styleKey);
                return this.__explicit_style ? this.__explicit_style[styleKey] : undefined;
            },
            set: function (v) {
                if (!this.hasOwnProperty(Meta.StyleProperty.EXPLICIT_STYLE_KEY))
                    this.__explicit_style = {};
                this.__explicit_style[styleKey] = v;
                var domElt = this.$el;
                if (domElt)
                    domElt.css(styleKey, v);
            }
        });
    }
    Meta.StyleProperty = StyleProperty;

    (function (StyleProperty) {
        /**
        * Metadata key where explicit styles are stored.
        * @constant Meta.StyleProperty.EXPLICIT_STYLE_KEY
        * @type {string}
        * @default
        */
        StyleProperty.EXPLICIT_STYLE_KEY = "__explicit_style";

        /**
        * Apply all explicit styles to the Dom element.
        * @method Meta.StyleProperty.applyExplicitStyles
        * @param {Object} object Target object.
        */
        function applyExplicitStyles(object) {
            var domElt = object.$el;
            if (domElt && (object).__explicit_style)
                domElt.css((object).__explicit_style);
        }
        StyleProperty.applyExplicitStyles = applyExplicitStyles;
    })(Meta.StyleProperty || (Meta.StyleProperty = {}));
    var StyleProperty = Meta.StyleProperty;
})(Meta || (Meta = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var whiteSpaceExp = /(^\s+|\s+$)/g;
    var Component = (function (_super) {
        __extends(Component, _super);
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
        function Component(description, context, owner, item) {
            _super.call(this, description, context, owner, item);

            // send "init" event before rendering the view so we can initialize non-configured properties
            this.dispatch(new Coral.Event(Component.INIT_EVENT));

            if (this.states && !this.isExternal("states")) {
                this._statesMap = {};
                this._states = Coral.Descriptor.instanciateAll(Coral.Utils.prototypalMerge(this, "states"), this, this);
                for (var i = 0; i < this._states.length; ++i)
                    this._registerState(this._states[i]);
            }

            if (this.defs && !this.isExternal("defs"))
                this._defs = Coral.Descriptor.instanciateAll(Coral.Utils.prototypalMerge(this, "defs"), this, this);

            // build the skin to render content
            this.buildSkin();

            // search the DOM for directives and execute them
            this.applyDirectives();

            // The view creation is complete
            this.dispatch(new Coral.Event(Component.COMPLETE_EVENT));
        }
        Component.prototype.render = function () {
        };

        /**
        * Implementation of {@linkcode Coral.StateMixin} matchState method.<br/>
        * State management in a Component is done through {@linkcode Coral.State}, {@linkcode Coral.StateValue} and {@linkcode Coral.Transition}.
        * @method matchState
        * @memberof Coral.Component#
        * @param {Coral.StateMatching} states States to match with the current state.
        * @returns {boolean} <code>true</code> if provided <code>states</code> match current state.
        */
        Component.prototype.matchState = function (states) {
            if (!states)
                return true;
            var result = true;
            for (var stateKey in states) {
                var stateValues = states[stateKey];
                if (!this._statesMap) {
                    for (var i = 0; i < stateValues.length; ++i)
                        if (stateValues[i] == "none")
                            break;
                    result = stateValues[i] == "none";
                } else if (stateKey == Coral.StateMatching.DEFAULT_STATE)
                    result = this._defaultState.matchState(stateValues); else if (this._statesMap[stateKey])
                    result = this._statesMap[stateKey].matchState(stateValues);
                if (!result)
                    break;
            }
            return result;
        };

        Component.prototype._registerState = function (state) {
            if (state.name in this._statesMap)
                Coral.Utils.error("State name already used", this, state.name);
            this._statesMap[state.name] = state;
            if (!this._defaultState)
                this._defaultState = state;
            state.on([Coral.State.CHANGE_EVENT, this.uid], this._stateChangeHandler, this);
        };

        /**
        * Handler called when a change event is dispatch on any State
        * @private
        */
        Component.prototype._stateChangeHandler = function (event) {
            var stateChangeEvent = new Coral.Event(Coral.STATE_CHANGE_EVENT, { stateName: event.data.stateName, oldValue: event.data.oldValue, newValue: event.data.newValue });
            this.dispatch(stateChangeEvent);
        };

        /**
        * Return the {@linkcode Coral.State} matching stateName parameter.<br/>
        * If no value is passed, "state" is took instead.
        * @method getState
        * @memberof Coral.Component#
        * @param {string} [stateName="state"] State name.
        * @returns {string} The state corresponding to the given state name.
        */
        Component.prototype.getState = function (stateName) {
            stateName = stateName || "state";
            return this._statesMap[stateName];
        };

        /**
        * This method build the skin if needed and assign it to <code>this.el</code>.</br>
        * If <code>el</code> is already defined <code>skin</code> is not taken in a account.<br/>
        * Skin can be a DOM node to be copied or an HTML string.<br/>
        * If no skin is specified, the default skin is a simple DIV tag.
        * @method buildSkin
        * @memberof Coral.Component#
        */
        Component.prototype.buildSkin = function () {
            if (this.$el && this.$el instanceof $)
                if (this.$el.length > 0)
                    this.el = this.$el[0]; else
                    this.el = undefined;

            if (!this.el && this.skin != undefined && this.skin instanceof $ && this.skin.length > 0)
                this.el = this.skin[0].cloneNode(true); else if (!this.el && this.skin != undefined && typeof (this.skin) == 'string') {
                var normalizedSkin = this.skin.replace(whiteSpaceExp, '');
                var selector = $(Component.skinDiv).html(normalizedSkin);
                if (selector[0].childNodes.length > 0) {
                    this.el = (selector[0].childNodes[0]);
                    selector.empty();
                }
            } else if (!this.el && this.skin != undefined)
                this.el = this.skin.cloneNode(true); else if (!this.el)
                this.el = document.createElement("DIV");

            // From here 'el' exist
            this.$el = $(this.el);

            if (this.id)
                this.$el.attr("id", this.id);

            // add data-component attribute to identify the component in the DOM
            this.$el.attr("data-component", this["constructor"].name);

            // apply explicit styles on current element
            Meta.StyleProperty.applyExplicitStyles(this);

            if (this._states)
                for (var i = 0; i < this._states.length; ++i) {
                    var state = this._states[i];
                    new Coral.ClassBinding(state, "css", this.$el).bind();
                }
            this.render();
        };

        /**
        * Apply all directives registered in <code>directives</code> property<br/>
        * Create bindings associated with data-text, data-html, data-style-*, data-attr-*, data-class-* attributes of the skin.<br/>
        * Create listeners associated with data-action attributes of the skin.
        * @method applyDirectives
        * @memberof Coral.Component#
        */
        Component.prototype.applyDirectives = function () {
            this.clearDirectives();
            var rec = function (node) {
                if (node.attributes) {
                    for (var i = 0; i < node.attributes.length; ++i) {
                        var attribute = node.attributes[i];
                        for (var key in this.directives) {
                            var directive = this.directives[key];
                            var exec = directive.regexp.exec(attribute.name);
                            if (exec) {
                                directive.run.call(this, exec, node, attribute.value);
                                continue;
                            }
                        }
                    }
                }
                for (var i = 0; i < node.children.length; ++i) {
                    var child = node.children[i];
                    if (!child.hasAttribute("data-component"))
                        rec.call(this, child);
                }
            };
            rec.call(this, this.el);
        };

        /**
        * Remove all bindings, events, etc. created from directives
        * @method clearDirectives
        * @memberof Coral.Component#
        */
        Component.prototype.clearDirectives = function () {
            this._directive_binding = this._directive_binding || [];
            this._directive_attach = this._directive_attach || [];
            this._directive_action = this._directive_action || [];
            this._directive_container = false;
            while (this._directive_binding.length > 0)
                this._directive_binding.pop().unbind();
            while (this._directive_attach.length > 0)
                this.detachComponent(this._directive_attach.pop());
            while (this._directive_action.length > 0) {
                var action = this._directive_action.pop();
                this.removeDomEvent(action.node, action.type, action.namespace);
            }
        };

        /**
        * Find the DOM element matching <code>target</code> parameter
        * @method findTarget
        * @memberof Coral.Component#
        * @param {string} target The target <code>data-container</code> value.
        * @param {HTMLElement} [el=this.el] DOM element where the search start.
        * @returns {HTMLElement} the dom element matching <code>target</code>
        */
        Component.prototype.findTarget = function (target, el) {
            el = el || this.el;
            if ($(el).attr("data-container") == target)
                return el;
            for (var i = 0; i < el.children.length; ++i) {
                var child = (el.children[i]);
                if ($(child).attr("data-component"))
                    continue;
                var res = this.findTarget(target, child);
                if (res)
                    return res;
            }
            return undefined;
        };

        /**
        * Attach a component to this one. <code>parent</code> and <code>$container</code> are set on the attached component.
        * @method attachComponent
        * @memberof Coral.Component#
        * @param {Coral.Component} component The component to attach.
        * @param {number} index Insertion index in the target.
        * @param {JQuery} [target=this.$el] target DOM element where the component is attached.
        */
        Component.prototype.attachComponent = function (component, index, target) {
            if (component.isAddedToDisplay)
                throw "child is already displayed";

            this._attachedComponents = this._attachedComponents || [];
            target = target || this.$el;
            if (target instanceof $) {
                component.parent = this;
                component.$container = target;
                var children = component.$container.children();
                if (index >= 0 && children.length > index)
                    $(children[index]).before(component.el); else
                    component.$container.append(component.el);
            } else
                throw "Error : this kind of target is not managed ";

            this._attachedComponents.push(component);

            this.dispatch(new Coral.Event(Component.ATTACH_COMPONENT_EVENT, { component: component }));

            if (this.isAddedToDisplay)
                component.addedToDisplay();
        };

        /**
        * Detach a component from this one. <code>parent</code> and <code>$container</code> are unset on the attached component.
        * @method detachComponent
        * @memberof Coral.Component#
        * @param {Coral.Component} component The component to detach.
        */
        Component.prototype.detachComponent = function (component) {
            if (this._attachedComponents)
                for (var i = 0; i < this._attachedComponents.length; ++i) {
                    if (this._attachedComponents[i] === component) {
                        this._attachedComponents.splice(i, 1);
                        break;
                    }
                }
            if (component.$el)
                component.$el.remove();
            component.parent = component.$container = undefined;

            this.dispatch(new Coral.Event(Component.DETACH_COMPONENT_EVENT, { component: component }));

            if (this.isAddedToDisplay)
                component.removedFromDisplay();
        };

        /**
        * This method is called when the view is added to the display.<br/>
        * It dispatch a <code>addedToDisplay</code> event where you can add DOM event listeners.
        * @method addedToDisplay
        * @memberof Coral.Component#
        */
        Component.prototype.addedToDisplay = function () {
            if (this.isAddedToDisplay)
                return;

            this.isAddedToDisplay = true;
            var domEventList = this._domevents;
            if (domEventList)
                for (var i = 0; i < domEventList.length; ++i) {
                    var domEvent = domEventList[i];
                    this.applyDomEvent(domEvent);
                }
            this.dispatch(new Coral.Event(Component.ADDED_TO_DISPLAY_EVENT));
            if (this._attachedComponents)
                for (var i = 0; i < this._attachedComponents.length; ++i)
                    this._attachedComponents[i].addedToDisplay();
        };

        /**
        * This method is called when the view is removed from the display.<br/>
        * It dispatch a <code>removedFromDisplay</code> event where you can remove DOM event listeners
        * @method removedFromDisplay
        * @memberof Coral.Component#
        */
        Component.prototype.removedFromDisplay = function () {
            if (!this.isAddedToDisplay)
                return;

            this.isAddedToDisplay = false;
            var domEventList = this._domevents;
            if (domEventList)
                for (var i = 0; i < domEventList.length; ++i) {
                    var domEvent = domEventList[i];
                    this.unapplyDomEvent(domEvent);
                }
            this.dispatch(new Coral.Event(Component.REMOVED_FROM_DISPLAY_EVENT));
            if (this._attachedComponents)
                for (var i = 0; i < this._attachedComponents.length; ++i)
                    this._attachedComponents[i].removedFromDisplay();
        };

        Component.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.context[this.id] = undefined;
            if (this._states)
                for (var i = 0; i < this._states.length; ++i)
                    this._states[i].destroy();
            this.clearDirectives();
            if (this._attachedComponents)
                for (var i = 0; i < this._attachedComponents.length; ++i) {
                    this._attachedComponents[i].destroy();
                }
        };

        Component.prototype.addDomEvent = function (node, type, namespace, handler) {
            var domEventList = this._domevents = this._domevents || [];
            var result = { node: node, type: type, namespace: namespace, handler: handler };
            domEventList.push(result);
            if (this.isAddedToDisplay)
                this.applyDomEvent(result);
            return result;
        };

        Component.prototype.applyDomEvent = function (domEvent) {
            var key = domEvent.namespace ? domEvent.type + "." + domEvent.namespace : domEvent.type;
            if (domEvent.node)
                $(domEvent.node).on(key, undefined, { component: this }, domEvent.handler); else
                this.$el.on(key, undefined, { component: this }, domEvent.handler);
        };

        Component.prototype.unapplyDomEvent = function (domEvent) {
            var key = domEvent.namespace ? domEvent.type + "." + domEvent.namespace : domEvent.type;
            if (domEvent.node)
                $(domEvent.node).off(key); else
                this.$el.off(key);
        };

        Component.prototype.removeDomEvent = function (node, type, namespace) {
            node = node || this.el;
            var domEventList = this._domevents;
            if (domEventList)
                for (var i = 0; i < domEventList.length; ++i) {
                    var domEvent = domEventList[i];
                    if ((domEvent.node == node || (!domEvent.node && node == this.el)) && domEvent.type == type && domEvent.namespace == namespace) {
                        this.unapplyDomEvent(domEvent);
                        domEventList.splice(i, 1);
                        --i;
                    }
                }
        };

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
        Component.prototype.on = function (event, handler, context, params, one) {
            var eventWithNamespace = Array.isArray(event) ? event : event.split(Coral.EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
            var eventKey = eventWithNamespace[0];
            var namespace = eventWithNamespace.length > 1 ? eventWithNamespace[1] : undefined;
            if (eventKey in Component.domEvents) {
                var that = this;
                this.addDomEvent(undefined, eventKey, namespace, function (event) {
                    handler.call(context, event, params);
                    if (one)
                        that.removeDomEvent(undefined, eventKey, namespace);
                });
            } else if (eventKey in Component.computedEvents) {
                var delegateInstance;
                var targetDelegate = Component.computedEvents[eventKey];
                var delegateList = this.__computed_event_delegate = this.__computed_event_delegate || [];
                for (var i = 0; i < delegateList.length; ++i) {
                    var delegate = delegateList[i];
                    if (delegate instanceof targetDelegate) {
                        delegateInstance = delegate;
                        break;
                    }
                }
                if (!delegateInstance) {
                    delegateInstance = new targetDelegate(this);
                    delegateList.push(delegateInstance);
                }
                delegateInstance.on(eventWithNamespace, handler, context, params, one);
            } else
                _super.prototype.on.call(this, eventWithNamespace, handler, context, params, one);
            return this;
        };

        /**
        * override {@linkcode Coral.EventDispatcher#off}.<br/>
        * Handle dom events and computed events.
        * @see Coral.EventDispatcher#on
        * @method off
        * @memberof Coral.Component#
        * @param {string} event The event key concatenated with an optional namespace.
        */
        Component.prototype.off = function (event) {
            var eventWithNamespace = Array.isArray(event) ? event : event.split(Coral.EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
            var eventKey = eventWithNamespace[0];
            var namespace = eventWithNamespace.length > 1 ? eventWithNamespace[1] : undefined;
            if (eventKey in Component.domEvents)
                this.removeDomEvent(undefined, eventKey, namespace); else if (eventKey in Component.computedEvents) {
                var delegateInstance;
                var targetDelegate = Component.computedEvents[eventKey];
                var delegateList = this.__computed_event_delegate = this.__computed_event_delegate || [];
                for (var i = 0; i < delegateList.length; ++i) {
                    var delegate = delegateList[i];
                    if (delegate instanceof targetDelegate) {
                        delegateInstance = delegate;
                        break;
                    }
                }
                if (delegateInstance)
                    delegateInstance.off(eventWithNamespace);
            } else
                _super.prototype.off.call(this, eventWithNamespace);
            return this;
        };
        Component.INIT_EVENT = "init";

        Component.COMPLETE_EVENT = "complete";

        Component.ATTACH_COMPONENT_EVENT = "attachComponent";

        Component.DETACH_COMPONENT_EVENT = "detachComponent";

        Component.ADDED_TO_DISPLAY_EVENT = "addedToDisplay";

        Component.REMOVED_FROM_DISPLAY_EVENT = "removedFromDisplay";

        Component.skinDiv = document.createElement("DIV");

        Component.domEvents = {
            click: true,
            dblclick: true,
            mousedown: true,
            mousemove: true,
            mouseover: true,
            mouseout: true,
            mouseup: true,
            keydown: true,
            keypress: true,
            keyup: true,
            abort: true,
            error: true,
            load: true,
            resize: true,
            scroll: true,
            unload: true,
            blur: true,
            change: true,
            focus: true,
            reset: true,
            select: true,
            submit: true,
            focusin: true,
            focusout: true,
            touchstart: true,
            touchend: true,
            touchmove: true,
            touchenter: true,
            touchleave: true,
            touchcancel: true,
            dragstart: true,
            drag: true,
            dragenter: true,
            dragleave: true,
            dragover: true,
            drop: true,
            dragend: true
        };

        Component.computedEvents = {};
        return Component;
    })(Coral.DescribableObject);
    Coral.Component = Component;

    // Bindable properties
    Meta.Bindable(Component.prototype, "model");
    Meta.Bindable(Component.prototype, "models");

    // Style properties
    Meta.StyleProperty(Component.prototype, "width");
    Meta.StyleProperty(Component.prototype, "minWidth");
    Meta.StyleProperty(Component.prototype, "maxWidth");
    Meta.StyleProperty(Component.prototype, "height");
    Meta.StyleProperty(Component.prototype, "minHeight");
    Meta.StyleProperty(Component.prototype, "maxHeight");
    Meta.StyleProperty(Component.prototype, "top");
    Meta.StyleProperty(Component.prototype, "bottom");
    Meta.StyleProperty(Component.prototype, "left");
    Meta.StyleProperty(Component.prototype, "right");
    Meta.StyleProperty(Component.prototype, "marginTop");
    Meta.StyleProperty(Component.prototype, "marginBottom");
    Meta.StyleProperty(Component.prototype, "marginLeft");
    Meta.StyleProperty(Component.prototype, "marginRight");
    Meta.StyleProperty(Component.prototype, "paddingTop");
    Meta.StyleProperty(Component.prototype, "paddingBottom");
    Meta.StyleProperty(Component.prototype, "paddingLeft");
    Meta.StyleProperty(Component.prototype, "paddingRight");
    Meta.StyleProperty(Component.prototype, "display");
    Meta.StyleProperty(Component.prototype, "position");
    Meta.StyleProperty(Component.prototype, "flex");
    Meta.StyleProperty(Component.prototype, "opacity");

    Component.prototype.directives = {
        text: {
            regexp: /^data-text$/,
            run: function (regexpResult, node, value) {
                this._directive_binding.push(new Coral.ContentBinding(this, value, node).bind());
            }
        },
        html: {
            regexp: /^data-html$/,
            run: function (regexpResult, node, value) {
                this._directive_binding.push(new Coral.ContentBinding(this, value, node, true).bind());
            }
        },
        style: {
            regexp: /^data-style-(.+)$/,
            run: function (regexpResult, node, value) {
                this._directive_binding.push(new Coral.StyleBinding(this, value, node, regexpResult[1]).bind());
            }
        },
        cls: {
            regexp: /^data-attr-class|data-class$/,
            run: function (regexpResult, node, value) {
                this._directive_binding.push(new Coral.ClassBinding(this, value, node).bind());
            }
        },
        attr: {
            regexp: /^data-attr-(.+)$/,
            run: function (regexpResult, node, value) {
                this._directive_binding.push(new Coral.AttributeBinding(this, value, node, regexpResult[1]).bind());
            }
        },
        clsSwitch: {
            regexp: /^data-class-(.+)$/,
            run: function (regexpResult, node, value) {
                this._directive_binding.push(new Coral.ClassSwitchBinding(this, value, node, regexpResult[1]).bind());
            }
        },
        action: {
            regexp: /^data-action-(.+)$/,
            run: function (regexpResult, node, value) {
                this._directive_action.push(this.addDomEvent(node, regexpResult[1], this.uid + "-action", this[value].bind(this)));
            }
        },
        attach: {
            regexp: /^data-attach$/,
            run: function (regexpResult, node, value) {
                var $node = $(node);
                this._directive_binding.push(new Coral.Watcher(this, value, function (newValue, oldValue, params) {
                    if (oldValue) {
                        this.detachComponent(oldValue);
                        for (var i = 0; i < this._directive_attach.length; ++i) {
                            if (this._directive_attach[i] === oldValue) {
                                this._directive_attach.splice(i, 1);
                            }
                        }
                    }
                    if (newValue) {
                        this.attachComponent(newValue, 0, $node);
                        this._directive_attach.push(newValue);
                    }
                }, this).bind(true));
            }
        },
        container: {
            regexp: /^data-container$/,
            run: function (regexpResult, node, value) {
                if (!this.childsContainer) {
                    this._directive_container = true;
                    this.childsContainer = $(node);
                }
            }
        }
    };

    Meta.Mixin(Component.prototype, Coral.StateMixin);

    var ComputedEventDelegate = (function (_super) {
        __extends(ComputedEventDelegate, _super);
        /**
        * ComputedEventDelegate is an event delegate used to handle complex events. The delegate class must be register in {@linkcode Coral.Component.computedEvents}.<br/>
        * @constructor Coral.ComputedEventDelegate
        * @extends Coral.EventDispatcher
        * @see $Component
        * @param {Coral.Component} the component delegating event managment.
        */
        function ComputedEventDelegate(component) {
            _super.call(this);
            Object.defineProperty(this, "uid", { writable: false, value: Coral.Utils.getUID() });
            Object.defineProperty(this, "component", { writable: false, value: component });
        }
        return ComputedEventDelegate;
    })(Coral.EventDispatcher);
    Coral.ComputedEventDelegate = ComputedEventDelegate;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a Component Descriptor
* @method $Component
* @see Coral.Component
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Component(description) {
    return new Coral.Descriptor(Coral.Component, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var State = (function (_super) {
        __extends(State, _super);
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
        function State(description, context, owner) {
            this._value = "none";
            name = "state";
            _super.call(this, description, context, owner);
            if (!this.name)
                this.name = "state";
            if (this.values) {
                this._values = Coral.Descriptor.instanciateAll(this.values, this.isExternal("values") ? this.context : this, this);
                this._valuesMap = {};
                for (var i = 0; i < this._values.length; ++i) {
                    this._valuesMap[this._values[i].value] = this._values[i];
                }
            }
            if (this.transitions)
                this._transitions = Coral.Descriptor.instanciateAll(this.transitions, this.isExternal("transitions") ? this.context : this, this);
            this.css = this.name + "-none";
            this._last = "none";
            Coral.Utils.callback(this.updateState, this);
        }
        Object.defineProperty(State.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (v) {
                if (this._value === v)
                    return;
                this._value = v;
                if (this._valuesMap)
                    this.updateState();
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Test if given values match the current state.
        * @method matchState
        * @memberof Coral.State#
        * @param {Array} states A states array to match with.
        * @returns {boolean} <code>true</code> if any value in the array match the current state
        */
        State.prototype.matchState = function (states) {
            for (var i = 0; i < states.length; ++i)
                if ((this._currentState && this._currentState.matchState(states[i])) || (!this._currentState && states[i] == "none"))
                    return true;
            return false;
        };

        /**
        * Update the state with the current value.<br/>
        * updateState may run a transition.
        * @method updateState
        * @memberof Coral.State#
        * @param {string} newValue The new state value
        */
        State.prototype.updateState = function () {
            var newValue = this._value;
            var oldValue = this.getCurrentState();
            if (newValue === oldValue)
                return;
            var matchingTransition;
            if (this._transitions)
                for (var i = 0; i < this._transitions.length; ++i)
                    if (this._transitions[i].match(oldValue, newValue)) {
                        matchingTransition = this._transitions[i];
                        break;
                    }
            if (matchingTransition) {
                if (this.runningTransition)
                    this.waitingChange = {
                        transition: matchingTransition,
                        oldValue: oldValue,
                        newValue: newValue
                    }; else {
                    this.runningTransition = matchingTransition;
                    this.runningTransition.on([Coral.Task.DONE_EVENT, this.uid], this.transitionEnd, this);
                    this.runningTransition.on([Coral.Task.CANCEL_EVENT, this.uid], this.transitionEnd, this);
                    this.runningTransition.run(oldValue, newValue);
                }
            } else {
                if (this.runningTransition)
                    this.waitingChange = newValue; else
                    this.triggerState(newValue);
            }
        };

        /**
        * Transition end handler
        * @method transitionEnd
        * @memberof Coral.State#
        * @private
        */
        State.prototype.transitionEnd = function () {
            this.runningTransition.off([Coral.Task.DONE_EVENT, this.uid]);
            this.runningTransition.off([Coral.Task.CANCEL_EVENT, this.uid]);
            var waitingChange = this.waitingChange;
            this.waitingChange = this.runningTransition = undefined;
            if (waitingChange && "transition" in waitingChange) {
                this.runningTransition = waitingChange.transition;
                this.runningTransition.on([Coral.Task.DONE_EVENT, this.uid], this.transitionEnd, this);
                this.runningTransition.on([Coral.Task.CANCEL_EVENT, this.uid], this.transitionEnd, this);
                this.runningTransition.run(waitingChange.oldValue, waitingChange.newValue);
            } else if (waitingChange)
                this.triggerState(waitingChange);
        };

        /**
        * Change the current state with the given value.<br/>
        * triggerState doesn't run transition.
        * @method triggerState
        * @memberof Coral.State#
        * @param {string} stateValue The new state value
        */
        State.prototype.triggerState = function (stateValue) {
            var oldValue = this.getCurrentState();
            if (this._currentState)
                this._currentState.leave();
            if (!this._currentState)
                this._last = "none"; else if (!this._currentState.intermediate)
                this._last = oldValue;
            this._currentState = this.getStateValue(stateValue);
            if (this._currentState)
                this._currentState.enter();
            var newValue = this.getCurrentState();
            this.dispatch(new Coral.Event(Coral.State.CHANGE_EVENT, { stateName: this.name, oldValue: oldValue, newValue: newValue }));
            this.css = "-" + this.name + "-" + this._last + " " + this.name + "-" + newValue;
        };

        /**
        * Get the nested {@linkcode Coral.StateValue} by its value property
        * @method getStateValue
        * @memberof Coral.State#
        * @param {string} value The value of the requested {@linkcode Coral.StateValue}
        * @returns {Coral.StateValue} The {@linkcode Coral.StateValue} matching <code>value</code>
        */
        State.prototype.getStateValue = function (value) {
            return this._valuesMap[value];
        };

        /**
        * Get the current {@linkcode Coral.StateValue}
        * @method getCurrentStateValue
        * @memberof Coral.State#
        * @returns {Coral.StateValue} The current {@linkcode Coral.StateValue}
        */
        State.prototype.getCurrentStateValue = function () {
            return this._currentState;
        };

        /**
        * Get the value of the current {@linkcode Coral.StateValue}
        * @method getCurrentState
        * @memberof Coral.State#
        * @returns {string} The current state or <code>"none"</code>
        */
        State.prototype.getCurrentState = function () {
            return this._currentState ? this._currentState.value : "none";
        };

        State.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._values)
                for (var i = 0; i < this._values.length; ++i)
                    this._values[i].destroy();
            if (this._transitions)
                for (i = 0; i < this._transitions.length; ++i)
                    this._transitions[i].destroy();
        };
        State.CHANGE_EVENT = "change";
        return State;
    })(Coral.DescribableObject);
    Coral.State = State;

    var StateValue = (function (_super) {
        __extends(StateValue, _super);
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
        function StateValue(description, context, owner) {
            _super.call(this, description, context, owner);
            console.assert(owner instanceof State, "The owner of a StateValue must be a State");
            this.state = owner;
        }
        /**
        * Trigger <code>enterState</code> event
        * @method enter
        * @memberof Coral.StateValue#
        */
        StateValue.prototype.enter = function () {
            this.dispatch(new Coral.Event(StateValue.ENTER_STATE_EVENT));
        };

        /**
        * Trigger <code>leaveState</code> event
        * @method leave
        * @memberof Coral.StateValue#
        */
        StateValue.prototype.leave = function () {
            this.dispatch(new Coral.Event(StateValue.LEAVE_STATE_EVENT));
        };

        /**
        * Test if a value match this {@linkcode Coral.StateValue}
        * @method matchState
        * @memberof Coral.StateValue#
        * @returns {boolean} <code>true</code> if given value match
        */
        StateValue.prototype.matchState = function (state) {
            return this.value == state;
        };
        StateValue.ENTER_STATE_EVENT = "enterState";
        StateValue.LEAVE_STATE_EVENT = "leaveState";
        return StateValue;
    })(Coral.DescribableObject);
    Coral.StateValue = StateValue;

    var Transition = (function (_super) {
        __extends(Transition, _super);
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
        function Transition(description, context, owner) {
            _super.call(this, description, context, owner);
            console.assert(owner instanceof State, "The owner of a Transition must be a State");
            this.state = owner;
        }
        /**
        * Test if a state change match this transition.
        * @method match
        * @memberof Coral.Transition#
        * @returns {boolean} <code>true</code> if <code>from</code> and <code>to</code> match
        */
        Transition.prototype.match = function (from, to) {
            if (this.from == "any" || (this.from == "none" && from == "none") || (from != "none" && this.state.getStateValue(from).matchState(this.from)))
                if (this.to == "any" || (this.to == "none" && to == "none") || (to != "none" && this.state.getStateValue(to).matchState(this.to)))
                    return true;
            return false;
        };

        /**
        * Run the transition.<br/>
        * Override {@linkcode Coral.SequentialTasks#run}
        * @method run
        * @memberof Coral.Transition#
        * @param {string} from The current state
        * @param {string} to The target state
        */
        Transition.prototype.run = function (from, to) {
            this.stateFrom = from;
            this.stateTo = to;
            this.dispatch(new Coral.Event(Transition.TRANSITION_START_EVENT, { stateFrom: this.stateFrom, stateTo: this.stateTo }));
            _super.prototype.run.call(this);
        };

        /**
        * Cancel the transition.<br/>
        * Override {@linkcode Coral.SequentialTasks#cancel}
        * @method cancel
        * @memberof Coral.Transition#
        */
        Transition.prototype.cancel = function () {
            this.state.triggerState(this.stateTo);
            _super.prototype.cancel.call(this);
            this.dispatch(new Coral.Event(Transition.TRANSITION_END_EVENT, { stateFrom: this.stateFrom, stateTo: this.stateTo }, true));
        };

        /**
        * End the transition.<br/>
        * Override {@linkcode Coral.SequentialTasks#done}
        * @method done
        * @memberof Coral.Transition#
        */
        Transition.prototype.done = function () {
            this.state.triggerState(this.stateTo);
            _super.prototype.done.call(this);
            this.dispatch(new Coral.Event(Transition.TRANSITION_END_EVENT, { stateFrom: this.stateFrom, stateTo: this.stateTo }, true));
        };
        Transition.TRANSITION_START_EVENT = "transitionStart";
        Transition.TRANSITION_END_EVENT = "transitionEnd";
        return Transition;
    })(Coral.SequentialTasks);
    Coral.Transition = Transition;

    var IntermediateState = (function (_super) {
        __extends(IntermediateState, _super);
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
        function IntermediateState(description, context, owner, item) {
            this.time = 300;
            _super.call(this, description, context, owner, item);
        }
        /**
        * Change the current state to the intermediate state <code>value</code>.<br/>
        * Override {@linkcode Coral.Task#run}
        * @method run
        * @memberof Coral.IntermediateState#
        */
        IntermediateState.prototype.do = function () {
            var transition = this.owner;
            while (transition && !(transition instanceof Transition))
                transition = transition.owner;
            console.assert(transition, "IntermediateState must be nested into a Transition to take effect");
            transition.state.triggerState(transition.state.getStateValue(this.value));
            var that = this;
            var timeoutId = setTimeout(function () {
                if (!that.canceled)
                    that.done();
            }, this.time);
        };
        return IntermediateState;
    })(Coral.Task);
    Coral.IntermediateState = IntermediateState;
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.State} Descriptor.
* @method $State
* @see Coral.State
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $State(description) {
    return new Coral.Descriptor(Coral.State, description);
}

/**
* Shortcut for creating a {@linkcode Coral.StateValue} Descriptor.
* @method $StateValue
* @see Coral.StateValue
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $StateValue(description) {
    return new Coral.Descriptor(Coral.StateValue, description);
}

/**
* Shortcut for creating a {@linkcode Coral.Transition} Descriptor.
* @method $Transition
* @see Coral.Transition
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Transition(description) {
    return new Coral.Descriptor(Coral.Transition, description);
}

/**
* Shortcut for creating a {@linkcode Coral.IntermediateState} Descriptor.
* @method $IntermediateState
* @see Coral.IntermediateState
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $IntermediateState(description) {
    return new Coral.Descriptor(Coral.IntermediateState, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var BaseContainer = (function (_super) {
        __extends(BaseContainer, _super);
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
        function BaseContainer(description, context, owner, item) {
            Object.defineProperty(this, "childsCollection", { writable: false, value: new Coral.Collection() });
            _super.call(this, description, context, owner, item);

            this.childsContainer = this.childsContainer || $(this.findTarget("") || this.el);

            this.childsCollection.on([Coral.Collection.ADD_EVENT, this.uid], this._childAdded, this);
            this.childsCollection.on([Coral.Collection.REMOVE_EVENT, this.uid], this._childRemoved, this);
            this.childsCollection.on([Coral.Collection.MOVE_EVENT, this.uid], this._childMoved, this);
            this.childsCollection.on([Coral.Collection.SET_EVENT, this.uid], this._childSet, this);

            if (this.childsFactory) {
                this.childsFactory = this.childsFactory.instanciate(this.isExternal("childsFactory") ? this.context : this, this);
                this.childsFactory.collection = this.childsCollection;
                this.childsFactory.external = this.areChildsExternal();
                this.childsFactory.update();
                this.dispatch(new Coral.Event(BaseContainer.CHILD_COMPLETE_EVENT));
            }
        }
        /**
        * Must be override in concrete implementations.
        * @method areChildsExternal
        * @memberof Coral.BaseContainer#
        * @returns {boolean} <code>true</code> if childs descriptors come from an external context.
        */
        BaseContainer.prototype.areChildsExternal = function () {
            return false;
        };

        Object.defineProperty(BaseContainer.prototype, "layout", {
            get: function () {
                return this._layout;
            },
            set: function (v) {
                if (this._layout === v)
                    return;
                if (this._layout)
                    if (this._layout instanceof Coral.DescribableObject)
                        this._layout.destroy();
                if (!v)
                    this._layout = undefined; else if (v instanceof Coral.Descriptor)
                    this._layout = v.instanciate(this.isExternal("layout") ? this.context : this, this);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Add the view <code>child</code> to the current view in container referenced by target.
        * @see Coral.Component#attachComponent
        * @private
        */
        BaseContainer.prototype._addChild = function (child, index, target) {
            if (child.isAddedToDisplay)
                return;

            if (!target)
                target = this.childsContainer;
            if (!target)
                Coral.Utils.error("no childsContainer is defined", this);
            if (target instanceof BaseContainer)
                target._addChild(child, index); else if (target instanceof $)
                this.attachComponent(child, index, target); else
                Coral.Utils.error("this kind of target is not managed", this);

            this.dispatch(new Coral.Event(BaseContainer.CHILD_ADDED_EVENT, { child: child }));
        };

        /**
        * Remove <code>child</code> from this view.
        * @see Coral.Component#attachComponent
        * @private
        */
        BaseContainer.prototype._removeChild = function (child) {
            var parent = child.parent;
            if (parent) {
                parent.detachComponent(child);
                this.dispatch(new Coral.Event(BaseContainer.CHILD_REMOVED_EVENT, { child: child }));
            }
        };

        BaseContainer.prototype._childAdded = function (event) {
            this._addChild(event.data.value, event.data.index);
        };

        BaseContainer.prototype._childRemoved = function (event) {
            this._removeChild(event.data.value);
        };

        BaseContainer.prototype._childMoved = function (event) {
            this._removeChild(event.data.value);
            this._addChild(event.data.value, event.data.to);
        };

        BaseContainer.prototype._childSet = function (event) {
            this._removeChild(event.data.oldValue);
            this._addChild(event.data.value, event.data.at);
        };

        BaseContainer.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this.childsFactory)
                this.childsFactory.destroy();
        };
        BaseContainer.CHILD_ADDED_EVENT = "childAdded";
        BaseContainer.CHILD_REMOVED_EVENT = "childremoved";
        BaseContainer.CHILD_COMPLETE_EVENT = "childComplete";
        return BaseContainer;
    })(Coral.Component);
    Coral.BaseContainer = BaseContainer;
})(Coral || (Coral = {}));
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Container = (function (_super) {
        __extends(Container, _super);
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
        function Container(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
        }
        /**
        * <code>true</code> if <code>childs</code> property come from an external context.<br/>
        * Implementation of {@linkcode Coral.BaseContainer#areChildsExternal}
        * @method areChildsExternal
        * @memberof Coral.Container#
        * @returns {boolean} <code>true</code> if childs descriptors come from an external context
        */
        Container.prototype.areChildsExternal = function () {
            return this.isExternal("childs");
        };
        return Container;
    })(Coral.BaseContainer);
    Coral.Container = Container;

    Container.prototype.childsFactory = new Coral.Descriptor(Coral.DescriptorsFactory, {
        descriptors: new Coral.Bind("childs", Coral.Bind.SIMPLE_BINDING_MODE)
    });
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.Container} Descriptor
* @method $Container
* @see Coral.Container
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Container(description) {
    return new Coral.Descriptor(Coral.Container, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var DataContainer = (function (_super) {
        __extends(DataContainer, _super);
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
        function DataContainer(description, context, owner, item) {
            _super.call(this, description, context, owner, item);
        }
        /**
        * <code>true</code> if <code>itemRenderer</code> property come from an external context.<br/>
        * Implementation of {@linkcode Coral.BaseContainer#areChildsExternal}
        * @method areChildsExternal
        * @memberof Coral.DataContainer#
        * @returns {boolean} <code>true</code> if childs descriptors come from an external context
        */
        DataContainer.prototype.areChildsExternal = function () {
            return this.isExternal("itemRenderer");
        };
        return DataContainer;
    })(Coral.BaseContainer);
    Coral.DataContainer = DataContainer;

    DataContainer.prototype.childsFactory = new Coral.Descriptor(Coral.DataDescriptorsFactory, {
        itemDescriptor: new Coral.Bind("itemRenderer", Coral.Bind.SIMPLE_BINDING_MODE),
        items: new Coral.Bind("items", Coral.Bind.SIMPLE_BINDING_MODE)
    });
})(Coral || (Coral = {}));

/**
* Shortcut for creating a {@linkcode Coral.DataContainer} Descriptor
* @method $DataContainer
* @see Coral.DataContainer
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $DataContainer(description) {
    return new Coral.Descriptor(Coral.DataContainer, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Application = (function (_super) {
        __extends(Application, _super);
        /**
        * Application class is a {@linkcode Coral.Container}. Application shall be the root of the components tree.
        * @constructor Coral.Application
        * @extends Coral.Container
        * @see $Application
        * @param {Coral.Descriptor} [description] A descriptor.
        * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
        * @param [owner] The object that create and own the new instance.
        */
        function Application(description, context) {
            _super.call(this, description, context);
        }
        /**
        * Once the application is created and added to the DOM tree, this method must be called to start the application.
        * @method run
        * @memberof Coral.Application#
        */
        Application.prototype.run = function () {
            this.addedToDisplay();
        };
        return Application;
    })(Coral.Container);
    Coral.Application = Application;
})(Coral || (Coral = {}));

/**
* Shortcut for creating an {@linkcode Coral.Application} descriptor.
* @method $Application
* @see Coral.Application
* @param description Attributes, Events and Watchers description
* @returns {Coral.Descriptor}
*/
function $Application(description) {
    return new Coral.Descriptor(Coral.Application, description);
}
///<reference path="../ref.d.ts"/>
var Coral;
(function (Coral) {
    var Layout = (function (_super) {
        __extends(Layout, _super);
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
        function Layout(description, context, owner) {
            _super.call(this, description, context, owner);
            console.assert(this.owner instanceof Coral.BaseContainer, "The owner of a Layout must be a BaseContainer");
            console.assert(this.owner.childsCollection, "The owner of a Layout must have a childsCollection");
            Object.defineProperty(this, "collection", { writable: false, value: owner.childsCollection });
            this._childsContainerBinding = new Coral.Binding(this.owner, "childsContainer", this, "childsContainer").bind();
        }
        Object.defineProperty(Layout.prototype, "childsContainer", {
            get: function () {
                return this._childsContainer;
            },
            set: function (v) {
                if (this._childsContainer == v)
                    return;
                this._childsContainer = v;
                this._childsContainerUpToDate = false;
                this.planUpdate();
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Destroy this layout
        * Override {@linkcode Coral.DescribableObject#destroy}
        * @method destroy
        * @memberof Coral.Layout#
        */
        Layout.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._childsContainerBinding)
                this._childsContainerBinding.unbind();
        };

        /**
        * Plan an asynchronous update for this layout
        * @method updateLayout
        * @memberof Coral.Layout#
        */
        Layout.prototype.updateLayout = function () {
            this._layoutUpToDate = false;
            this.planUpdate();
        };
        return Layout;
    })(Coral.DescribableObject);
    Coral.Layout = Layout;
})(Coral || (Coral = {}));
///<reference path="./ref.d.ts"/>
// auto run of webapps
$(function () {
    var apps = $("*[data-app]");
    for (var i = 0; i < apps.length; ++i) {
        var appRoot = apps[i];
        var appDescriptor = new Coral.Descriptor($(appRoot).attr("data-app"), {
            el: appRoot
        });
        var app = appDescriptor.instanciate(global, global);
        app.run();
    }
});
//@ sourceMappingURL=file:////Users/seb/coraljs/build/coral.js.map
