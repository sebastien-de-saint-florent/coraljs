///<reference path="../ref.d.ts"/>
module Coral {
    export class BaseContainer extends Coral.Component {

        static CHILD_ADDED_EVENT = "childAdded";
        static CHILD_REMOVED_EVENT = "childremoved";
        static CHILD_COMPLETE_EVENT = "childComplete";

        childsFactory;
        childsContainer;
        childsCollection: Coral.Collection<Coral.Component>;

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
        constructor(description?: Descriptor<BaseContainer>, context?, owner?, item?) {
            Object.defineProperty(this, "childsCollection", { writable: false, value: new Coral.Collection() });
            super(description, context, owner, item);
        
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
        areChildsExternal(): boolean {
            return false;
        }

        private _layout: Coral.Layout;
        get layout() {
            return this._layout;
        }
        set layout(v) {
            if (this._layout === v)
                return;
            if (this._layout)
                if (this._layout instanceof Coral.DescribableObject)
                    this._layout.destroy();
            if (!v)
                this._layout = undefined;
            else if (v instanceof Descriptor)
                this._layout = v.instanciate(this.isExternal("layout") ? this.context : this, this);
        }
    
        /**
         * Add the view <code>child</code> to the current view in container referenced by target.
         * @see Coral.Component#attachComponent
         * @private
         */
        _addChild(child: Coral.Component, index: number, target?) {
            if (child.isAddedToDisplay)
                return;
        
            if (!target)
                target = this.childsContainer;
            if (!target)
                Coral.Utils.error("no childsContainer is defined", this);
            if (target instanceof BaseContainer)
                target._addChild(child, index);
            else if (target instanceof $)
                this.attachComponent(child, index, target);
            else Coral.Utils.error("this kind of target is not managed", this);

            this.dispatch(new Coral.Event(BaseContainer.CHILD_ADDED_EVENT, { child: child }));
        }

        /**
         * Remove <code>child</code> from this view.
         * @see Coral.Component#attachComponent
         * @private
         */
        _removeChild(child: Coral.Component) {
            var parent = child.parent;
            if (parent) {
                parent.detachComponent(child);
                this.dispatch(new Coral.Event(BaseContainer.CHILD_REMOVED_EVENT, { child: child }));
            }
        }

        _childAdded(event: Coral.Event) {
            this._addChild(event.data.value, event.data.index);
        }

        _childRemoved(event: Coral.Event) {
            this._removeChild(event.data.value);
        }

        _childMoved(event: Coral.Event) {
            this._removeChild(event.data.value);
            this._addChild(event.data.value, event.data.to);
        }

        _childSet(event: Coral.Event) {
            this._removeChild(event.data.oldValue);
            this._addChild(event.data.value, event.data.at);
        }

        destroy() {
            super.destroy();
            if (this.childsFactory)
                this.childsFactory.destroy();
        }
    }

    export interface IBaseContainerDescriptor extends IDescribableObjectDescriptor {
        childsContainer?: JQuery;
        childsFactory?: DescribableObject;
        layout?: Descriptor<Coral.Layout>;
        childAddedEvent?;
        childRemovedEvent?;
        childCompleteEvent?;
        layoutWatcher?;
        childsContainerWatcher?;
    }
}