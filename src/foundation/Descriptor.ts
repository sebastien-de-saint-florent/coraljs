///<reference path="../ref.d.ts"/>
var global = this;
module Coral {
    export class Bind {
        static simpleBindingExp = /^{[^{}]+}$/;
        static compositeBindingExp = /{[^{}]+}/;
        public mode:number;
        public chain:string;
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
        constructor(chain, mode) {
            this.mode = mode || Bind.SIMPLE_BINDING_MODE;
            this.chain = chain;
        }

        /**
         * Simple binding flag.
         * @constant Coral.Bind.SIMPLE_BINDING_MODE
         * @type {number}
         * @default 1
         */
        static SIMPLE_BINDING_MODE = 1;

        /**
         * Composite binding flag.
         * @constant Coral.Bind.COMPOSITE_BINDING_MODE
         * @type {number}
         * @default 2
         */
        static COMPOSITE_BINDING_MODE = 2;
    }

    export class BindState {
        values: {v;s?:Coral.StateMatching}[];
        /**
         * BindState class represent the declaration of a state dependency.<br/>
         * It is used with {@linkcode Coral.Descriptor} and {@linkcode Coral.StateMixin}.
         * @constructor Coral.BindState
         * @see $BindState
         * @property {Array} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
         * @param {Object} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
         */
        constructor(values:{_?}) {
            this.values = [];
            for (var key in values) {
                if (key === "_")
                    this.values.push({v:values._});
                else
                    this.values.unshift({v:values[key], s:new StateMatching(key)});
            }
        }

        /**
         * Determine the current value for the given context.
         * @method resolve
         * @memberof Coral.BindState#
         * @param {Object} context Context must implements {@linkcode Coral.StateMixin}.
         * @returns {Object} the value that match context current state
         */
        resolve(context) {
            Meta.Mixin(context, Coral.StateMixin);
            for (var i = 0; i < this.values.length; ++i) {
                var value = this.values[i]
                if ((value.s && context.matchState(value.s)) || !value.s)
                    return value;
            }
            return undefined;
        }
    }

    export class Descriptor<T extends Coral.DescribableObject> {
        attributes;
        events;
        watchers;
        constructor(type: string, description: IDescriptor);
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
        constructor(public type, description: IDescriptor) {
            this.type = type;
            this.attributes = Coral.Utils.objectFilter(description, undefined, /^.*Event|.*Watcher$/);
            this.events = Coral.Utils.objectFilter(description, /^(.*)Event$/);
            this.watchers = Coral.Utils.objectFilter(description, /^(.*)Watcher$/);
            Object.defineProperty(this, "uid", { writable: false, enumerable: false, value: Coral.Utils.getUID() });
        }

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
        static instanciateAll<T extends Coral.DescribableObject>(descriptors: Descriptor<T>[], context?, owner?, from?: number, to?: number): T[] {
            var result = [];
            from = from || 0;
            to = to || descriptors.length - 1;
            for (var i = from; i <= to; ++i) {
                result.push(descriptors[i].instanciate(context, owner));
            }
            return result;
        }

        /**
         * Method that create a new instance of the described class
         * @method instanciate
         * @memberof Coral.Descriptor#
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context
         * @param [owner] The object that create and own the new instance
         * @param [item] An optional item used for item rendering
         */
        instanciate(context?, owner?, item?):T {
            var result;
            if (this.type) { // this is a normal descriptor
                if (this.type instanceof Function) { // type is a constructor function
                    result = new this.type(this, context, owner, item);
                }
                else { // type is a chain access to the class
                    var type = Utils.getChain(global, this.type);
                    if (type instanceof Function)
                        result = new type(this, context, owner, item);
                    else throw "'" + this.type + "' is not a constructor";
                }
            }
            else throw "Malformed descriptor : type is missing";
            return result;
        }
    }
   
    export interface IDescriptor {
        includeIn?: string;
        excludeFrom?: string;
        include?: string;
    };
}

/**
 * Shortcut to quickly create a {@linkcode Coral.Bind} object.<br/>
 * Binding mode is detected automatically.
 * @method $Bind
 * @see Coral.Bind
 * @param {string} chain The chain or composition that represent the binding
 * @returns {Coral.Bind}
 */
function $Bind(chain: string): Coral.Bind {
    if (Coral.Bind.simpleBindingExp.test(chain))
        return new Coral.Bind(chain.substring(1, chain.length - 1), Coral.Bind.SIMPLE_BINDING_MODE);
    else if (Coral.Bind.compositeBindingExp.test(chain))
        return new Coral.Bind(chain, Coral.Bind.COMPOSITE_BINDING_MODE);
    else
        return new Coral.Bind(chain, Coral.Bind.SIMPLE_BINDING_MODE);
}

/**
 * Shortcut to quickly create a {@linkcode Coral.BindState} object.
 * @method $BindState
 * @see Coral.BindState
 * @param {Object} values Map containing state expressions and associated values. <code>_</code> is a special key for the default value.
 * @returns {Coral.BindState}
 */
function $BindState(values: { _?: string; }): Coral.BindState {
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
function $Descriptor<T extends Coral.DescribableObject>(type, description: Coral.IDescriptor): Coral.Descriptor<T> {
    return new Coral.Descriptor(type, description)
}