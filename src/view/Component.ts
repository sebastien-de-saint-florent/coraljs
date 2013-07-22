///<reference path="../ref.d.ts"/>
module Coral {
    var whiteSpaceExp = /(^\s+|\s+$)/g;
    export class Component extends Coral.DescribableObject {
        /**
         * Add event key
         * @constant Coral.Component.INIT_EVENT
         * @type {string}
         * @default "init"
         */
        static INIT_EVENT = "init";
        /**
         * Add event key
         * @constant Coral.Component.COMPLETE_EVENT
         * @type {string}
         * @default "complete"
         */
        static COMPLETE_EVENT = "complete";
        /**
         * Add event key
         * @constant Coral.Component.ATTACH_COMPONENT_EVENT
         * @type {string}
         * @default "attachComponent"
         */
        static ATTACH_COMPONENT_EVENT = "attachComponent";
        /**
         * Add event key
         * @constant Coral.Component.DETACH_COMPONENT_EVENT
         * @type {string}
         * @default "detachComponent"
         */
        static DETACH_COMPONENT_EVENT = "detachComponent";
        /**
         * Add event key
         * @constant Coral.Component.ADDED_TO_DISPLAY_EVENT
         * @type {string}
         * @default "addedToDisplay"
         */
        static ADDED_TO_DISPLAY_EVENT = "addedToDisplay";
        /**
         * Add event key
         * @constant Coral.Component.REMOVED_FROM_DISPLAY_EVENT
         * @type {string}
         * @default "removedFromDisplay"
         */
        static REMOVED_FROM_DISPLAY_EVENT = "removedFromDisplay";

        static skinDiv = document.createElement("DIV");

        el: HTMLElement;
        $el: JQuery;
        skin: any;
        width;
        minWidth;
        maxWidth;
        height;
        minHeight;
        maxHeight;
        top;
        bottom;
        left;
        right;
        marginTop;
        marginBottom;
        marginLeft;
        marginRight;
        paddingTop;
        paddingBottom;
        paddingLeft;
        paddingRight;
        display: string;
        position: string;
        flex;
        opacity: number;
        defs: Descriptor<Coral.DescribableObject>[];
        _defs: Coral.DescribableObject[];
        states: Descriptor<Coral.DescribableObject>[];
        _states: Coral.DescribableObject[];
        isAddedToDisplay: boolean;
        parent: Coral.Component;
        $container: JQuery;
        directives;

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
        constructor(description?: Descriptor<Component>, context?, owner?, item?) {
            super(description, context, owner, item);
        
            // send "init" event before rendering the view so we can initialize non-configured properties
            this.dispatch(new Coral.Event(Component.INIT_EVENT));
        
            // initialize and analyze states
            if (this.states && !this.isExternal("states")) {
                this._statesMap = {};
                this._states = Descriptor.instanciateAll(Coral.Utils.prototypalMerge(this, "states"), this, this);
                for (var i = 0; i < this._states.length; ++i)
                    this._registerState(this._states[i]);
            }
        
            // initialize descriptor from defs
            if (this.defs && !this.isExternal("defs"))
                this._defs = Descriptor.instanciateAll(Coral.Utils.prototypalMerge(this, "defs"), this, this);

            // build the skin to render content
            this.buildSkin();
        
            // search the DOM for directives and execute them
            this.applyDirectives();
        
            // The view creation is complete
            this.dispatch(new Coral.Event(Component.COMPLETE_EVENT));
        }
        private _statesMap: {[a:string]:State};
        private _defaultState: Coral.State;
        private _directive_binding: any[];
        private _directive_attach: any[];
        private _directive_action: any[];
        private _directive_container: boolean;
        private _attachedComponents: Coral.Component[];
        private _domevents: any[];
    
    
        render() { }
    
        /**
         * Implementation of {@linkcode Coral.StateMixin} matchState method.<br/>
         * State management in a Component is done through {@linkcode Coral.State}, {@linkcode Coral.StateValue} and {@linkcode Coral.Transition}.
         * @method matchState
         * @memberof Coral.Component#
         * @param {Coral.StateMatching} states States to match with the current state.
         * @returns {boolean} <code>true</code> if provided <code>states</code> match current state.
         */
        matchState(states: StateMatching): boolean {
            if (!states) // matching against empty states is always true
                return true;
            var result = true;
            for (var stateKey in states) {
                var stateValues = states[stateKey]
			    if (!this._statesMap) { // if states is not initialized yet
                    // check if states contains 'none'
                    for (var i = 0; i < stateValues.length; ++i)
                        if (stateValues[i] == "none")
                            break;
                    result = stateValues[i] == "none";
                }
                else if (stateKey == Coral.StateMatching.DEFAULT_STATE)
                    result = this._defaultState.matchState(stateValues);
                else if (this._statesMap[stateKey])
                    result = this._statesMap[stateKey].matchState(stateValues);
                if (!result)
                    break;
            }
            return result;
        }
    
        _registerState(state: State) {
            if (state.name in this._statesMap)
                Coral.Utils.error("State name already used", this, state.name);
            this._statesMap[state.name] = state;
            if (!this._defaultState)
                this._defaultState = state;
            state.on([Coral.State.CHANGE_EVENT, this.uid], this._stateChangeHandler, this);
        }
    
        /**
         * Handler called when a change event is dispatch on any State
         * @private
         */
        _stateChangeHandler(event: Coral.Event) {
            var stateChangeEvent = new Coral.Event(Coral.STATE_CHANGE_EVENT, { stateName: event.data.stateName, oldValue: event.data.oldValue, newValue: event.data.newValue });
            this.dispatch(stateChangeEvent);
        }
    
        /**
         * Return the {@linkcode Coral.State} matching stateName parameter.<br/>
         * If no value is passed, "state" is took instead.
         * @method getState
         * @memberof Coral.Component#
         * @param {string} [stateName="state"] State name.
         * @returns {string} The state corresponding to the given state name.
         */
        getState(stateName: string) {
            stateName = stateName || "state";
            return this._statesMap[stateName];
        }
    
    
        /**
         * This method build the skin if needed and assign it to <code>this.el</code>.</br>
         * If <code>el</code> is already defined <code>skin</code> is not taken in a account.<br/>
         * Skin can be a DOM node to be copied or an HTML string.<br/>
         * If no skin is specified, the default skin is a simple DIV tag.
         * @method buildSkin
         * @memberof Coral.Component#
         */
        buildSkin() {
            // if el is already defined, we check if it is a jquery wrapper and adapt it if necessary
            if (this.$el && this.$el instanceof $)
                if (this.$el.length > 0)
                    this.el = this.$el[0];
                else
                    this.el = undefined;
            // The skin is a selector pointing to the DOM. Do a deep copy of it
            if (!this.el && this.skin != undefined && this.skin instanceof $ && this.skin.length > 0)
                this.el = this.skin[0].cloneNode(true);
            // The skin is a string representing HTML content. Create it in the cached div
            else if (!this.el && this.skin != undefined && typeof (this.skin) == 'string') {
                var normalizedSkin = this.skin.replace(whiteSpaceExp, '');
                var selector = $(Component.skinDiv).html(normalizedSkin);
                if (selector[0].childNodes.length > 0) {
                    this.el = <HTMLElement>(selector[0].childNodes[0]);
                    selector.empty();
                }
            }
            // The skin is a DOM Node. Do a deep copy of it
            else if (!this.el && this.skin != undefined)
                this.el = this.skin.cloneNode(true);
            // The skin is not specified or do not contain anything. Create an empty div as root element
            else if (!this.el)
                this.el = document.createElement("DIV");
            // From here 'el' exist
            this.$el = $(this.el);
            // complete id attribute with component id value
            if (this.id) this.$el.attr("id", this.id);
            // add data-component attribute to identify the component in the DOM
            this.$el.attr("data-component", this["constructor"].name);
            // apply explicit styles on current element
            Meta.StyleProperty.applyExplicitStyles(this);
            // add classes corresponding to current states
            if (this._states)
                for (var i = 0; i < this._states.length; ++i) {
                    var state = this._states[i];
                    new Coral.ClassBinding(state, "css", this.$el).bind();
                }
            this.render();
        }
    
        /**
         * Apply all directives registered in <code>directives</code> property<br/>
         * Create bindings associated with data-text, data-html, data-style-*, data-attr-*, data-class-* attributes of the skin.<br/>
         * Create listeners associated with data-action attributes of the skin.
         * @method applyDirectives
         * @memberof Coral.Component#
         */
        applyDirectives() {
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
        }
    
        /**
         * Remove all bindings, events, etc. created from directives
         * @method clearDirectives
         * @memberof Coral.Component#
         */
        clearDirectives() {
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
    
        }

        /**
         * Find the DOM element matching <code>target</code> parameter
         * @method findTarget
         * @memberof Coral.Component#
         * @param {string} target The target <code>data-container</code> value.
         * @param {HTMLElement} [el=this.el] DOM element where the search start.
         * @returns {HTMLElement} the dom element matching <code>target</code>
         */
        findTarget(target:string, el?: HTMLElement) {
            el = el || this.el;
            if ($(el).attr("data-container") == target)
                return el;
            for (var i = 0; i < el.children.length; ++i) {
                var child = <HTMLElement>(el.children[i]);
                if ($(child).attr("data-component"))
                    continue;
                var res = this.findTarget(target, child);
                if (res)
                    return res;
            }
            return undefined;
        }

        /**
         * Attach a component to this one. <code>parent</code> and <code>$container</code> are set on the attached component.
         * @method attachComponent
         * @memberof Coral.Component#
         * @param {Coral.Component} component The component to attach.
         * @param {number} index Insertion index in the target.
         * @param {JQuery} [target=this.$el] target DOM element where the component is attached.
         */
        attachComponent(component: Coral.Component, index: number, target?: JQuery) {
            if (component.isAddedToDisplay)
                throw "child is already displayed";

            this._attachedComponents = this._attachedComponents || [];
            target = target || this.$el;
            if (target instanceof $) {
                component.parent = this;
                component.$container = target;
                var children = component.$container.children();
                if (index >= 0 && children.length > index)
                    $(children[index]).before(component.el);
                else
                    component.$container.append(component.el);
            }
            else throw "Error : this kind of target is not managed ";

            this._attachedComponents.push(component);

            this.dispatch(new Coral.Event(Component.ATTACH_COMPONENT_EVENT, { component: component }));

            if (this.isAddedToDisplay)
                component.addedToDisplay();
        }


        /**
         * Detach a component from this one. <code>parent</code> and <code>$container</code> are unset on the attached component.
         * @method detachComponent
         * @memberof Coral.Component#
         * @param {Coral.Component} component The component to detach.
         */
        detachComponent(component: Coral.Component) {
            if (this._attachedComponents)
                for (var i = 0; i < this._attachedComponents.length; ++i) {
                    if (this._attachedComponents[i] === component) {
                        this._attachedComponents.splice(i, 1);
                        break;
                    }
                }
            if (component.$el) component.$el.remove();
            component.parent = component.$container = undefined;

            this.dispatch(new Coral.Event(Component.DETACH_COMPONENT_EVENT, { component: component }));

            if (this.isAddedToDisplay)
                component.removedFromDisplay();
        }

        /**
         * This method is called when the view is added to the display.<br/>
         * It dispatch a <code>addedToDisplay</code> event where you can add DOM event listeners.
         * @method addedToDisplay
         * @memberof Coral.Component#
         */
        addedToDisplay() {
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
        }

        /**
         * This method is called when the view is removed from the display.<br/>
         * It dispatch a <code>removedFromDisplay</code> event where you can remove DOM event listeners
         * @method removedFromDisplay
         * @memberof Coral.Component#
         */
        removedFromDisplay() {
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
        }

        destroy() {
            super.destroy();
            this.context[this.id] = undefined;
            if (this._states)
                for (var i = 0; i < this._states.length; ++i)
                    this._states[i].destroy();
            this.clearDirectives();
            if (this._attachedComponents)
                for (var i = 0; i < this._attachedComponents.length; ++i) {
                    this._attachedComponents[i].destroy();
                }
        }

        addDomEvent(node: HTMLElement, type: string, namespace: string, handler) {
            var domEventList = this._domevents = this._domevents || [];
            var result = { node: node, type: type, namespace: namespace, handler: handler };
            domEventList.push(result);
            if (this.isAddedToDisplay)
                this.applyDomEvent(result);
            return result;
        }

        applyDomEvent(domEvent) {
            var key = domEvent.namespace ? domEvent.type + "." + domEvent.namespace : domEvent.type;
            if (domEvent.node)
                $(domEvent.node).on(key, undefined, { component: this }, domEvent.handler);
            else
                this.$el.on(key, undefined, { component: this }, domEvent.handler);
        }

        unapplyDomEvent(domEvent) {
            var key = domEvent.namespace ? domEvent.type + "." + domEvent.namespace : domEvent.type;
            if (domEvent.node)
                $(domEvent.node).off(key);
            else
                this.$el.off(key);
        }

        removeDomEvent(node: HTMLElement, type: string, namespace: string) {
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
        }

        /**** Override EventDispatcher to handle computed events and dom events ****/

        /**
         * A map containing all dom events manage by {@linkcode Coral.Component#on} method
         * @constant Coral.Component.domEvents
         * @type {Object}
         * @default
         */
        static domEvents = {
            click: true, dblclick: true, mousedown: true, mousemove: true, mouseover: true, mouseout: true, mouseup: true,
            keydown: true, keypress: true, keyup: true,
            abort: true, error: true, load: true, resize: true, scroll: true, unload: true,
            blur: true, change: true, focus: true, reset: true, select: true, submit: true, focusin: true, focusout: true,
            touchstart: true, touchend: true, touchmove: true, touchenter: true, touchleave: true, touchcancel: true,
            dragstart: true, drag: true, dragenter: true, dragleave: true, dragover: true, drop: true, dragend: true,
        };

        /**
         * A map containing all computed events manage by {@linkcode Coral.Component#on} method
         * @constant Coral.Component.computedEvents
         * @type {Object}
         * @default
         */
        static computedEvents: { [computedEvent:string]: any} = {
        };

        private __computed_event_delegate: Coral.ComputedEventDelegate[];
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
        on(event: any, handler, context?, params?, one?: boolean) {
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
            }
            else if (eventKey in Component.computedEvents) {
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
            }
            else
                super.on(eventWithNamespace, handler, context, params, one);
            return this;
        }

        /**
         * override {@linkcode Coral.EventDispatcher#off}.<br/>
         * Handle dom events and computed events.
         * @see Coral.EventDispatcher#on
         * @method off
         * @memberof Coral.Component#
	     * @param {string} event The event key concatenated with an optional namespace.
         */
        off(event) {
            var eventWithNamespace = Array.isArray(event) ? event : event.split(Coral.EventDispatcher.EVENT_NAMESPACE_SEPARATOR);
            var eventKey = eventWithNamespace[0];
            var namespace = eventWithNamespace.length > 1 ? eventWithNamespace[1] : undefined;
            if (eventKey in Component.domEvents)
                this.removeDomEvent(undefined, eventKey, namespace);
            else if (eventKey in Component.computedEvents) {
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
            }
            else
                super.off(eventWithNamespace);
            return this;
        }

    }
    
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
                this._directive_binding.push(new Coral.Watcher(this, value, function (newValue?, oldValue?, params?) {
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
        },
    }

    Meta.Mixin(Component.prototype, Coral.StateMixin);

    export interface IComponentDescriptor extends IDescribableObjectDescriptor {
        skin?;
        model?;
        models?;
        width?;
        minWidth?;
        maxWidth?;
        height?;
        minHeight?;
        maxHeight?;
        top?;
        bottom?;
        left?;
        right?;
        marginTop?;
        marginBottom?;
        marginLeft?;
        marginRight?;
        paddingTop?;
        paddingBottom?;
        paddingLeft?;
        paddingRight?;
        display?: string;
        position?: string;
        flex?;
        opacity?: number;
        defs?: Descriptor<Coral.DescribableObject>[];
        states?: Descriptor<Coral.State>[];
        initEvent?;
        completeEvent?;
        attachComponentEvent?;
        detachComponentEvent?;
        addedToDisplayEvent?;
        removedFromDisplayEvent?;
        stateChangeEvent?;
        // dom events
        clickEvent?; dblclickEvent?; mousedownEvent?; mousemoveEvent?; mouseoverEvent?; mouseoutEvent?; mouseupEvent?;
        keydownEvent?; keypressEvent?; keyupEvent?;
        abortEvent?; errorEvent?; loadEvent?; resizeEvent?; scrollEvent?; unloadEvent?;
        blurEvent?; changeEvent?; focusEvent?; resetEvent?; selectEvent?; submitEvent?; focusinEvent?; focusoutEvent?;
        touchstartEvent?; touchendEvent?; touchmoveEvent?; touchenterEvent?; touchleaveEvent?; touchcancelEvent?;
        dragstartEvent?; dragEvent?; dragenterEvent?; dragleaveEvent?; dragoverEvent?; dropEvent?; dragendEvent?;
        modelWatcher?;
        modelsWatcher?;
        widthWatcher?;
        minWidthWatcher?;
        maxWidthWatcher?;
        heightWatcher?;
        minHeightWatcher?;
        maxHeightWatcher?;
        topWatcher?;
        bottomWatcher?;
        leftWatcher?;
        rightWatcher?;
        marginTopWatcher?;
        marginBottomWatcher?;
        marginLeftWatcher?;
        marginRightWatcher?;
        paddingTopWatcher?;
        paddingBottomWatcher?;
        paddingLeftWatcher?;
        paddingRightWatcher?;
        displayWatcher?;
        positionWatcher?;
        flexWatcher?;
        opacityWatcher?;
        parentWatcher?;
        $containerWatcher?;
        isAddedToDisplayWatcher?;
    }

    export class ComputedEventDelegate extends Coral.EventDispatcher {
        uid: number;
        component: Component;
        /**
         * ComputedEventDelegate is an event delegate used to handle complex events. The delegate class must be register in {@linkcode Coral.Component.computedEvents}.<br/>
         * @constructor Coral.ComputedEventDelegate
         * @extends Coral.EventDispatcher
         * @see $Component
         * @param {Coral.Component} the component delegating event managment.
         */
        constructor(component: Component) {
            super();
            Object.defineProperty(this, "uid", { writable: false, value: Coral.Utils.getUID() });
            Object.defineProperty(this, "component", { writable: false, value: component });
        }
    }
}

/**
 * Shortcut for creating a Component Descriptor
 * @method $Component
 * @see Coral.Component
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $Component(description: Coral.IComponentDescriptor): Coral.Descriptor<Coral.Component> {
	return new Coral.Descriptor(Coral.Component, description)
}