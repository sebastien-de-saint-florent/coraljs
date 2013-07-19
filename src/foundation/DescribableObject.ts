///<reference path="../ref.d.ts"/>
module Coral {
    export class DescribableObject extends Coral.EventDispatcher {
        id:string;
        item;
        context;
        owner;
        description:Coral.Descriptor<Coral.DescribableObject>;
        uid: number;
        // From UpdatableMixin
        isUpToDate: boolean;
        planUpdate: () => any;
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
        constructor(description?: Coral.Descriptor<Coral.DescribableObject>, context?, owner?, item?) {
            super(owner instanceof Coral.EventDispatcher ? owner : undefined);
            Object.defineProperty(this, "context", {writable:false, value: context || global});
            Object.defineProperty(this, "owner", {writable:false, value: owner});
            Object.defineProperty(this, "uid", {writable:false, value: Coral.Utils.getUID()});
            Object.defineProperty(this, "_externalDescription", {writable:false, enumerable: false, value: description});
            Object.defineProperty(this, "_descriptions", {writable:false, enumerable: false, configurable:false, value: {attributes:{},events:{},watchers:{}}});
            this.item = item;
            this.triggerDescriptions();

            // if an id is specified create a reference of the current object into the owner
            if (this.context && this.id)
                this.context[this.id] = this;
            if (Meta.Mixin.is(this, StateMixin)) this.on([Coral.STATE_CHANGE_EVENT, this.uid], this.triggerInternalDescriptions, this);
            if (this._externalDescription && Meta.Mixin.is(this.context, StateMixin) && this.context instanceof EventDispatcher) this.context.on([Coral.STATE_CHANGE_EVENT, this.uid], this.triggerExternalDescription, this);
        }
        private _externalDescription: Coral.Descriptor<Coral.DescribableObject>;
        private _descriptions: {attributes:any[];events:any[];watchers:any[]};
        private includeIn;
        private excludeFrom;
        private include;

        /**
         * @private
         */
        triggerDescriptions () {
            this.triggerInternalDescriptionsEventsAndWatchers(this, 0, true);
            if (this._externalDescription)
                this.triggerDescriptionEventsAndWatchers(this._externalDescription, this.context, 1, true);
            if (this._externalDescription)
                this.triggerDescriptionProperties(this._externalDescription, this.context, 1, true);
            this.triggerInternalDescriptionsProperties(this, 0, true);
        }

        /**
         * @private
         */
        triggerInternalDescriptions () {
            this.triggerInternalDescriptionsEventsAndWatchers(this, 0);
            this.triggerInternalDescriptionsProperties(this, 0);
        }

        /**
         * @private
         */
        triggerExternalDescription () {
            if (this._externalDescription) {
                this.triggerDescriptionEventsAndWatchers(this._externalDescription, this.context, 1);
                this.triggerDescriptionProperties(this._externalDescription, this.context, 1);
            }
        }

        /**
         * @private
         */
        triggerInternalDescriptionsEventsAndWatchers (target, degree: number, first?: boolean) {
            var prototype = Object.getPrototypeOf(target);
            if (prototype)
                this.triggerInternalDescriptionsEventsAndWatchers(prototype, degree - 1, first);
            if (target.hasOwnProperty("description"))
                this.triggerDescriptionEventsAndWatchers(target.description, this, degree, first);
        }

        /**
         * @private
         */
        triggerInternalDescriptionsProperties (target, degree: number, first?: boolean) {
            var prototype = Object.getPrototypeOf(target);
            if (target.hasOwnProperty("description"))
                this.triggerDescriptionProperties(target.description, this, degree, first);
            if (prototype)
                this.triggerInternalDescriptionsProperties(prototype, degree - 1, first);
        }

        /**
         * @private
         */
        triggerDescriptionEventsAndWatchers(description, context, degree: number, first?: boolean) {
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
                }
                else if (first)
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
                        watchers[key] = {r:value, i:instance};
                    }
                    else
                        watchers[key] = undefined;
                }
                else if (first) {
                    var instance = new Coral.Watcher(this, key, context[value], context).bind();
                    watchers[key] = {i:instance};
                }
            }
        }

        /**
         * @private
         */
        triggerDescriptionProperties (description, context, degree: number, first?: boolean) {
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
                        if (value.v instanceof Bind) {
                            if (value.v.mode == Bind.SIMPLE_BINDING_MODE)
                                var instance = new Coral.Binding(context, value.v.chain, this, key).bind();
                            else
                                var instance = new Coral.CompositeBinding(context, new Coral.BindingComposition(value.v.chain), this, key).bind();
                            properties[key] = {d:degree, r:value, i:instance};
                        }
                        else {
                            this[key] = value.v;
                            properties[key] = {d:degree, r:value};
                        }
                    }
                    else {
                        properties[key] = undefined;
                        this[key] = Object.getPrototypeOf(this)[key];
                    }
                }
                else if (first) {
                    if (value instanceof Bind) {
                        if (value.mode == Bind.SIMPLE_BINDING_MODE)
                            var instance = new Coral.Binding(context, value.chain, this, key).bind();
                        else
                            var instance = new Coral.CompositeBinding(context, new Coral.BindingComposition(value.chain), this, key).bind();
                        properties[key] = {d:degree, i:instance};
                    }
                    else {
                        this[key] = value;
                        properties[key] = {d:degree};
                    }
                }
            }
        }

        /**
         * @method isExternal
         * @memberof Coral.DescribableObject#
         * @param {string} property The property key.
         * @returns {boolean} 'true' if the property is defined using an external descriptor.
         */
        isExternal(property:string): boolean {
            return this._descriptions.attributes[property] != undefined && this._descriptions.attributes[property].d == 1;
        }

        /**
         * Update function use for asynchronous updates
         * @method update
         * @memberof Coral.DescribableObject#
         */
        update() {
            this.isUpToDate = true;
        }

        /**
         * Bindings and watchers create cross references between objects.<br/>
         * <code>destroy</code> call <code>unbind</code> on all of them to clean all references to this object.<br/>
         * Removing a {@linkcode Coral.DescribableObject} without calling destroy may prevent it from being garbage collected.
         * @method destroy
         * @memberof Coral.DescribableObject#
         */
        destroy() {
            if (this.context instanceof EventDispatcher)
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
        }

    }
    export interface IDescribableObjectDescriptor extends Coral.IDescriptor {
        id?: string;
    }
    Meta.Bindable(DescribableObject.prototype, "item");
    Meta.Mixin(DescribableObject.prototype, Coral.AsynchronousUpdater.UpdatableMixin);
    Object.defineProperties(DescribableObject.prototype, {
        global: { writable: false, configurable: false, value: global },
        self: { configurable: false, get: function () { return this; } }
    });
}

/**
 * Shortcut for creating a {@linkcode Coral.DescribableObject} Descriptor
 * @method $DescribableObject
 * @see Coral.DescribableObject
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $DescribableObject(description: Coral.IDescribableObjectDescriptor): Coral.Descriptor<Coral.DescribableObject> {
    return new Coral.Descriptor(Coral.DescribableObject, description)
}