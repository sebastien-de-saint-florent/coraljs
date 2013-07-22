///<reference path="../ref.d.ts"/>
module Coral {
    export class EventWatcher {
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
        constructor(private host, private chain:string, private event:string, private handler:(event?, params?) => any, private context?, private params?) {
            this.uid = Utils.getUID();
            this.host = host;
            this.event = event;
            this.handler = handler;
            this.context = context;
            this.params = params;
            if (chain)
                this.watcher = new Watcher(host, chain, this.resultChange, this);
        }
        private watcher:Coral.Watcher;
        private uid:number;
        private result;

        /**
         * Handler of the watcher created inside the EventWatcher
         * @private
         */
        resultChange(newValue?, oldValue?) {
            if (this.result)
                this.result.off([this.event, this.uid]);
            this.result = newValue;
            if (newValue) {
                if (!(newValue instanceof Coral.EventDispatcher))
                    Coral.Utils.error("object must be an instance of Coral.EventDispatcher", newValue);
                newValue.on([this.event, this.uid], this.handler, this.context, this.params);
            }
        }

        /**
         * Start the event watcher
         * @method bind
         * @memberof Coral.EventWatcher#
         * @returns {Coral.EventWatcher} this
         */
        bind(): EventWatcher {
            if (this.watcher)
                this.watcher.bind(true);
            else
                this.resultChange(this.host, undefined);
            return this;
        }

        /**
         * Stop the watcher by stopping the watcher and remove EventListener
         * @method unbind
         * @memberof Coral.EventWatcher#
         * @returns {Coral.EventWatcher} this
         */
        unbind(): EventWatcher {
            if (this.watcher)
                this.watcher.unbind();
            if (this.result) {
                this.result.off([this.event, this.uid]);
                this.result = undefined;
            }
            return this;
        }
    }
}
