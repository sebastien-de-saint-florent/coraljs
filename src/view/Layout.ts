///<reference path="../ref.d.ts"/>
module Coral {
    export class Layout extends Coral.DescribableObject {
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
        constructor(description?: Descriptor<Layout>, context?, owner?) {
            super(description, context, owner);
            console.assert(this.owner instanceof Coral.BaseContainer, "The owner of a Layout must be a BaseContainer");
            console.assert(this.owner.childsCollection, "The owner of a Layout must have a childsCollection");
            Object.defineProperty(this, "collection", { writable: false, value: owner.childsCollection });
            this._childsContainerBinding = new Coral.Binding(this.owner, "childsContainer", this, "childsContainer").bind();
        }
        private _childsContainerBinding: Coral.Binding;
        private _layoutUpToDate: boolean;
        private _childsContainerUpToDate: boolean;

        private _childsContainer;
        get childsContainer() {
            return this._childsContainer;
        }
        set childsContainer(v) {
            if (this._childsContainer == v)
                return;
            this._childsContainer = v;
            this._childsContainerUpToDate = false;
            this.planUpdate();
        }
    
        /**
         * Destroy this layout
         * Override {@linkcode Coral.DescribableObject#destroy}
         * @method destroy
         * @memberof Coral.Layout#
         */
        destroy() {
            super.destroy();
            if (this._childsContainerBinding)
                this._childsContainerBinding.unbind();
        }
    
        /**
         * Plan an asynchronous update for this layout
         * @method updateLayout
         * @memberof Coral.Layout#
         */
        updateLayout() {
            this._layoutUpToDate = false;
            this.planUpdate();
        }
    }

    export interface ILayoutDescriptor extends IDescribableObjectDescriptor {
    }
}