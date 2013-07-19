///<reference path="../ref.d.ts"/>
module Coral {
    interface IDescriptorInstance {
        descriptor: Coral.Descriptor<Coral.DescribableObject>;
        watcher?: Coral.Watcher;
        includeIn?: Coral.StateMatching;
        excludeFrom?: Coral.StateMatching;
        isActive?: boolean;
        instance?;
    }
    export class DescriptorsFactory extends Coral.DescribableObject {
        collection: Coral.Collection<Coral.DescribableObject>;
        external: boolean;
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
        constructor(description?: Descriptor<DescriptorsFactory>, context?, owner?, item?) {
            super(description, context, owner, item);
            this.from = this.from || 0;
        }
        
        private instances: IDescriptorInstance[];
        private _descriptorsUpToDate: boolean;
        private _rangeUpToDate: boolean;
        private dependsOnOwnerState;
        
        private _descriptors: Coral.Descriptor<Coral.DescribableObject>[]
        get descriptors() {
            return this._descriptors;
        }
        set descriptors(v) {
            if (this._descriptors == v)
                return;
            this._descriptors = Array.isArray(v) ? v : [v];
            this.to = this.to || this._descriptors.length;
            this.to = this.to > this._descriptors.length ? this._descriptors.length : this.to;
            this.from = this.from > this._descriptors.length ? 0 : this.from;
            this._descriptorsUpToDate = false;
            this.planUpdate();
        }
        
        private _from: number
        get from() {
            return this._from;
        }
        set from(v) {
            if (this._from == v)
                return;
            this._from = v;
            this._rangeUpToDate = false;
            this.planUpdate();
        }
        
        private _to: number
        get to() {
            return this._to;
        }
        set to(v) {
            if (this._to == v)
                return;
            this._to = v;
            this._rangeUpToDate = false;
            this.planUpdate();
        }
    
        /**
         * Asynchronous update<br/>
         * It creates all instances from <code>descriptors</code> taking in account <code>from</code>, <code>to</code> and all special properties
         * @method update
         * @memberof Coral.DescriptorsFactory#
         */
        update() {
            super.update();
            var instancesOwner = this.external ? this.owner.context : this.owner;
            if (!this.descriptors)
                return;
            if (!this._descriptorsUpToDate) {
                if (Meta.Mixin.is(instancesOwner, StateMixin) && instancesOwner instanceof EventDispatcher)
                    instancesOwner.off([Coral.STATE_CHANGE_EVENT, this.uid]);
                this._rangeUpToDate = false;
                if (this.instances)
                    for (var i = 0; i < this.instances.length; ++i)
                        this.deactivateInstance(i);
                this.instances = [];
                for (var i = 0; i < this.descriptors.length; ++i) {
                    var descriptor = this.descriptors[i];
                    var instance:IDescriptorInstance = { descriptor: descriptor };
                    this.instances.push(instance);
                    if (descriptor.attributes.include)
                        instance.watcher = new Coral.Watcher(instancesOwner, descriptor.attributes.include, this.includeChange, this, i);
                    else if (Meta.Mixin.is(instancesOwner, StateMixin)) {
                        if (descriptor.attributes.includeIn) {
                            this.dependsOnOwnerState = true;
                            instance.includeIn = new StateMatching(descriptor.attributes.includeIn);
                        }
                        else if (descriptor.attributes.excludeFrom) {
                            this.dependsOnOwnerState = true;
                            instance.excludeFrom = new StateMatching(descriptor.attributes.excludeFrom);
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
        }

        /**
         * @private
         */
        checkInstance(index: number) {
            if (index < this.from || index >= this.to)
                return;
            var instancesOwner = this.external ? this.owner.context : this.owner;
            var instance = this.instances[index];
            if (instance.watcher) {
                if (!instance.isActive)
                    instance.watcher.bind();
                if (instance.watcher.result)
                    this.activateInstance(index);
                else
                    this.deactivateInstance(index);
            }
            else if (instance.includeIn) {
                if (instancesOwner.matchState(instance.includeIn))
                    this.activateInstance(index);
                else
                    this.deactivateInstance(index);
            }
            else if (instance.excludeFrom) {
                if (instancesOwner.matchState(instance.excludeFrom))
                    this.deactivateInstance(index);
                else
                    this.activateInstance(index);
            }
            else
                this.activateInstance(index);
        }

        /**
         * @private
         */
        activateInstance(index: number) {
            var instance = this.instances[index];
            if (instance.isActive)
                return;
            if (!instance.instance)
                instance.instance = instance.descriptor.instanciate(this.external ? this.owner.context : this.owner, this.owner);
            this.collection.insert(instance.instance, this.calculateCollectionIndex(index));
            instance.isActive = true;
        }

        /**
         * @private
         */
        deactivateInstance(index: number) {
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
        }

        includeChange(oldValue?, newValue?, index?:number) {
            this.checkInstance(index);
        }

        /**
         * @private
         */
        stateChange(event: Coral.Event) {
            for (var i = this.from; i < this.to; ++i) {
                var instance = this.instances[i];
                if (instance.includeIn || instance.excludeFrom) // this instance depend on owner state
                    this.checkInstance(i);
            }
        }

        /**
         * @private
         */
        calculateCollectionIndex(index: number) {
            var count = 0;
            for (var i = this.from; i < index; ++i)
                if (this.instances[i].isActive)
                    ++count;
            return count;
        }

        /**
         * @private
         */
        parseIncludeProperty(include: string): string[][] {
            var states = include.split(":");
            var result = [];
            for (var i = 0; i < states.length; ++i) {
                if (states[i] && states[i] != "")
                    result.push(states[i].split("."));
            }
            return result;
        }

        destroy() {
            super.destroy();
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
        }
    }
    export interface IDescriptorsFactoryDescriptor extends IDescribableObjectDescriptor {
        descriptors?: Descriptor<Coral.DescribableObject>[];
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
function $DescriptorsFactory(description: Coral.IDescriptorsFactoryDescriptor): Coral.Descriptor<Coral.DescriptorsFactory> {
    return new Coral.Descriptor(Coral.DescriptorsFactory, description)
}