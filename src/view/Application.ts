///<reference path="../ref.d.ts"/>
module Coral {
    export class Application extends Coral.Container {
        /**
         * Application class is a {@linkcode Coral.Container}. Application shall be the root of the components tree.
         * @constructor Coral.Application
         * @extends Coral.Container
         * @see $Application
   	     * @param {Coral.Descriptor} [description] A descriptor.
	     * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
	     * @param [owner] The object that create and own the new instance.
         */
	    constructor(description?: Descriptor<Application>, context?) {
            super(description, context);
        }

        /**
         * Once the application is created and added to the DOM tree, this method must be called to start the application.
         * @method run
         * @memberof Coral.Application#
         */
        run() {
            this.addedToDisplay();
        }
    }
    export interface IApplicationDescriptor extends IContainerDescriptor {
    }
}

/**
 * Shortcut for creating an {@linkcode Coral.Application} descriptor.
 * @method $Application
 * @see Coral.Application
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $Application(description: Coral.IApplicationDescriptor): Coral.Descriptor<Coral.Application> {
    return new Coral.Descriptor(Coral.Application, description)
}