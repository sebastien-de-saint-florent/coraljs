///<reference path="../ref.d.ts"/>
module Coral {
    export class EventDispatcher {
        /**
         * Name of the global event space
         * @constant EventDispatcher.GLOBAL_EVENT_SPACE
         * @type {string}
         * @default
         */
        static GLOBAL_EVENT_SPACE = "_g";

        /**
         * Delimiter of event and namespace
         * @constant EventDispatcher.EVENT_NAMESPACE_SEPARATOR
         * @type {string}
         * @default
         */
        static EVENT_NAMESPACE_SEPARATOR = ".";

        /**
         * <code>EventDispatcher</code> is the based class for all object that need to communicate events to others.
         * If <code>parentDispatcher</code> is specified, all events passed with <code>bubble === true</code> will be dispatched to the
         * parent dispatcher.
         * @constructor Coral.EventDispatcher
         * @param {Coral.EventDispatcher} [parentDispatcher] An optional parent <code>EventDispatcher</code>;
         * @see Coral.Event
         */
        constructor(private parentDispatcher?:EventDispatcher) {
            if (parentDispatcher) {
                if (!(parentDispatcher instanceof EventDispatcher))
                    Utils.error("object must be an instance of Coral.EventDispatcher", parentDispatcher);
            }
        }

        private _event_listeners: {_g?;};
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
        on(event:any, handler, context?, params?, one?:boolean) {
            this._event_listeners = this._event_listeners || {};
            var eventWithSpace:string[] = Array.isArray(event) ? event : event.split(EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
            event = eventWithSpace[0];
            var namespace = eventWithSpace.length > 1 ? eventWithSpace[1] : EventDispatcher.GLOBAL_EVENT_SPACE;
            var currentEventSpace = this._event_listeners[namespace] = this._event_listeners[namespace] || {};
            currentEventSpace[event] = currentEventSpace[event] || [];
            currentEventSpace[event].push({h:handler, c:context, p:params, o:one});
            return this;
        }

        /**
         * shortcut to {@linkcode Coral.EventDispatcher#on} method with <code>one</code> parameter set to <code>true</code>.
         * @method one
         * @memberof Coral.EventDispatcher#
         * @see EventDispatcher.on
         */
        one(event, handler, context?, params?) {
            return this.on(event, handler, context, params, true);
        }

        /**
         * off method remove all attached handlers corresponding to the passed event.
         * @method off
         * @memberof Coral.EventDispatcher#
         * @param {string} event The event key concatenated with an optional namespace.
         */
        off(event) {
            if (this._event_listeners) {
                var eventWithSpace = event instanceof Array ? event : event.split(EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
                var event = eventWithSpace[0];
                var namespace = eventWithSpace.length > 1 ? eventWithSpace[1] : EventDispatcher.GLOBAL_EVENT_SPACE;
                var currentEventSpace = this._event_listeners[namespace] = this._event_listeners[namespace] || {};
                if (event == "")
                    currentEventSpace = undefined;
                else
                    currentEventSpace[event] = undefined;
            }
            return this;
        }

        /**
         * Dispatch the passed event and trigger all attached handlers
         * @method dispatch
         * @memberof Coral.EventDispatcher#
         * @param {Event} event The event object to dispatch
         */
        dispatch(event:Coral.Event) {
            if (!(event instanceof Coral.Event))
                Utils.error("dispatched event must be an instance of Coral.Event", event);
            var bubble = event.bubbles;
            var stop = false;
            if (this._event_listeners) {
                // initialize current target and target
                if (event.target)
                    event.currentTarget = this;
                else
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
        }
    }

    export class Event {
        public type:string;
        public data:any;
        public bubbles:bool;
        public target:EventDispatcher;
        public currentTarget:EventDispatcher;
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
        constructor(type:string, data?, bubbles?:bool) {
            Object.defineProperty(this, "type", {writable:false, value: type});
            Object.defineProperty(this, "data", {writable:false, value: data});
            Object.defineProperty(this, "bubbles", {writable:false, value: Boolean(bubbles)});
            this._stopPropagation = false;
            this._stopImmediatePropagation = false;
            this.target = undefined;
            this.currentTarget = undefined;
        }

        private _stopPropagation:bool;
        private _stopImmediatePropagation:bool;

        /**
         * @method isImmediatePropagationStopped
         * @memberof Coral.Event#
         * @returns {boolean} true if {@linkcode Coral.Event#stopImmediatePropagation} has been called on this event.
         */
        isImmediatePropagationStopped() {
            return Boolean(this._stopImmediatePropagation);
        }

        /**
         * @method isPropagationStopped
         * @memberof Coral.Event#
         * @returns {boolean} true if {@linkcode Coral.Event#stopPropagation} has been called on this event.
         */
        isPropagationStopped() {
            return Boolean(this._stopPropagation) || this.isImmediatePropagationStopped();
        }

        /**
         * Stop the propagation of the event. The event won't be dispatch to parent event dispatcher.
         * @method stopPropagation
         * @memberof Coral.Event#
         */
        stopPropagation() {
            this._stopPropagation = true;
        }

        /**
         * Stop immediately the propagation of the event. The event won't be dispatch to parent event dispatcher and pending listeners won't be called.
         * @method stopImmediatePropagation
         * @memberof Coral.Event#
         */
        stopImmediatePropagation() {
            this._stopImmediatePropagation = true;
        }
    }
}
