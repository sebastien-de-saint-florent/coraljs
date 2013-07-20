///<reference path="../ref.d.ts"/>
module Coral {
    export class ActionMap extends Coral.DescribableObject {
        actions: Descriptor<Action>[];
        _actions: Action[];
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
        constructor(description?: Descriptor<ActionMap>, context?, owner?, item?) {
            super(description, context, owner, item);
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
        destroy() {
            super.destroy();
            if (this._actions)
                for (var i = 0; i < this._actions.length; ++i)
                    this._actions[i].destroy();
        }
    }

    export interface IActionMapDescriptor extends IDescribableObjectDescriptor {
        actions?: Descriptor<Coral.Action>[];
    }

    export class Action extends Coral.SequentialTasks {
        event: string;
        currentEvent: any;
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
        constructor(description?: Descriptor<Action>, context?, owner?, item?) {
            super(description, context, owner, item);
            if (!this.event)
                Coral.Utils.error("'event' is mandatory on Action", this);
            if (!(this.owner instanceof ActionMap))
                Coral.Utils.error("owner of an Action must be an instance of ActionMap", this);
            this.owner.owner.on([this.event, this.uid], function (event) {
                this.currentEvent = event;
                this.run();
            }, this)
        }

        done() {
            super.done();
            this.currentEvent = undefined;
        }

        cancel() {
            super.cancel();
            this.currentEvent = undefined;
        }

        destroy() {
            super.destroy();
            this.owner.owner.off([this.event, this.uid]);
        }
    }

    export interface IActionDescriptor extends ISequentialTasksDescriptor {
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
function $ActionMap(description: Coral.IActionMapDescriptor): Coral.Descriptor<Coral.ActionMap> {
    return new Coral.Descriptor(Coral.ActionMap, description)
}

/**
 * Shortcut for creating an {@linkcode Coral.Action} descriptor.
 * @method $Action
 * @see Coral.Action
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $Action(description: Coral.IActionDescriptor): Coral.Descriptor<Coral.Action> {
    return new Coral.Descriptor(Coral.Action, description)
}