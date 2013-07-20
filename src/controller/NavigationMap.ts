///<reference path="../ref.d.ts"/>
module Coral {
    var normalizeExp = /^[/]*(.*[^/])[/]*$/;
    export class NavigationMap extends Coral.DescribableObject {
        mode: number;
        actions: Descriptor<NavigationAction>[];
        _actions: NavigationAction[];
        currentPath: string;
        /**
         * <code>NavigationMap</code> listen to history API and trigger childs {@linkcode NavigationAction} when change occurs.<br/>
         * <code>NavigationMap</code> can only be instanciated once, any other call to the constructor will raise an error.<br/>
         * You can get the unique instance of <code>NavigationMap</code> by accessing {@linkcode NavigationMap.instance}.
         * @constructor Coral.NavigationMap
         * @extends Coral.DescribableObject
         * @see $NavigationMap
         * @property {number} mode <code>NavigationMap.NONE_MODE</code> or <code>NavigationMap.HISTORY_MODE</code>.
         * @property {Array} actions An Array of {@linkcode Coral.Descriptor}. Described objects must extends {@linkcode Coral.NavigationAction}.
         * @property {string} currentPath The current path of the navigation.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         */
        constructor(description?: Descriptor<NavigationMap>, context?, owner?) {
            this.mode = NavigationMap.HISTORY_MODE;
            if (NavigationMap.instance)
                return NavigationMap.instance;
            super(description, context, owner);
            NavigationMap.instance = this;
            if (this.actions)
                this._actions = Coral.Descriptor.instanciateAll(this.actions, this.isExternal("actions") ? this.context : this, this);
            if (window && this.mode == NavigationMap.HISTORY_MODE)
                $(window).on("popstate.NavigationMap", this._handlePopState.bind(this));
            if (history && this.mode == NavigationMap.HISTORY_MODE)
                this.historyState = history.state;
        }

        private historyState;
        private _rootPath: string;
        private _subPath: string;

        /**
         * Unique instance of NavigationMap
         * @type {Coral.NavigationMap}
         * @name Coral.NavigationMap.instance
         */
        static instance:NavigationMap = undefined;

        /**
         * Navigation flag 'none'
         * @constant Coral.NavigationMap.NONE_MODE
         * @type {number}
         * @default 1
         */
        static NONE_MODE = 1;
        /**
         * Navigation flag 'history'
         * @constant Coral.NavigationMap.HISTORY_MODE
         * @type {number}
         * @default 2
         */
        static HISTORY_MODE = 2;

        _handlePopState(event) {
            this.historyState = event.state;
            this._calculateSubPath(window.location.pathname);
            this.triggerActions();
        }

        /**
         * @private
         */
        static normalize(path: string): string {
            if (path == "" || !path)
                return "/";
            var match = normalizeExp.exec(path);
            if (match) {
                return "/" + match[1];
            }
            else
                throw "error";
        }

        _calculateSubPath(path: string) {
            var index = path.lastIndexOf(this._rootPath);
            if (index == 0) {
                var splittedPath = path.substring(this._rootPath.length, path.length);
                this._subPath = NavigationMap.normalize(splittedPath);
                this.currentPath = this._rootPath + this._subPath;
            }
            else
                throw "error";
        }

        _calculatePath(subPath: string) {
            this._subPath = NavigationMap.normalize(subPath);
            this.currentPath = this._rootPath + this._subPath;
        }

        /**
         * Start the <code>NavigationMap</code> and trigger nested {@linkcode Coral.NavigationAction} that match <code>currentPath</code>.
         * @method start
         * @memberof Coral.NavigationMap#
         */
        start(rootPath?: string, silent?: boolean, fullPath?: string) {
            this._rootPath = NavigationMap.normalize(rootPath);
            this._calculateSubPath(NavigationMap.normalize(fullPath || window.location.pathname));
            if (!silent)
                this.triggerActions();
        }

        /**
         * Navigate to a new path and trigger all matching nested NavigationAction.
         * @method navigate
         * @memberof Coral.NavigationMap#
         */
        navigate(path: string, replace?: boolean, state?) {
            this._calculatePath(path);
            if (history && this.mode == NavigationMap.HISTORY_MODE) {
                if (replace)
                    history.replaceState(state, "", this.currentPath);
                else
                    history.pushState(state, "", this.currentPath);
            }
            this.triggerActions();
        }

        /**
         * Trigger all nested NavigationAction that match current path.
         * @method triggerActions
         * @memberof Coral.NavigationMap#
         */
        triggerActions() {
            if (this._actions)
                for (var i = 0; i < this._actions.length; ++i) {
                    var action = this._actions[i];
                    action.applyPath(this._subPath);
                }
        }

        /**
         * Destroy this object and all nested actions.
         * @method destroy
         * @memberof Coral.NavigationMap#
         */
        destroy() {
            super.destroy();
            if (window)
                $(window).off("popstate.NavigationMap");
            if (this._actions)
                for (var i = 0; i < this._actions.length; ++i)
                    this._actions[i].destroy();
            NavigationMap.instance = undefined;
        }
    }

    export interface INavigationMapDescriptor extends IDescribableObjectDescriptor {
        actions?: Descriptor<Coral.NavigationAction>[];
        mode?: number;
        currentPathWatcher?;
    }
    
    var pathRegexp = /([^{}]+|{([^{}]+)})/g;
    export class NavigationAction extends Coral.SequentialTasks {
        path: string;
        params: any;
        /**
         * NavigationAction is a {@linkcode Coral.SequentialTasks} that automatically run when navigation change to a path that match <code>path</code> property.<br/>
         * Navigation params are directly accesible in {@linkcode Coral.NavigationMap} under <code>params</code> object.
         * @constructor Coral.NavigationAction
         * @extends Coral.SequentialTasks
         * @see $NavigationAction
         * @property {string} path An expression of a path. It must match <code>/([^{}]+|{([^{}]+)})+/</code>.
         * @property {Object} params All captured params specified in the path expression.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         */
        constructor(description?: Descriptor<NavigationAction>, context?, owner?) {
            super(description, context, owner, undefined);
            if (!this.path)
                Coral.Utils.error("'path' is mandatory on NavigationAction", this);
            if (!(this.owner instanceof NavigationMap))
                Coral.Utils.error("owner of an NavigationAction must be an instance of NavigationMap", this);
            this._path = NavigationMap.normalize(this.path);
            var match;
            var construct = "";
            var names = [];
            while (match = pathRegexp.exec(this._path)) {
                if (!match[2])
                    construct += match[1];
                else {
                    construct += "(.*)";
                    names.push(match[2]);
                }
            }
            this._pathExpression = new RegExp("^" + construct + "$");
            this._names = names;
        }
        private _path: string;
        private _pathExpression: RegExp;
        private _names: string[];

        /**
         * Check if the given path match the path expression and then run the NavigationAction
         * @method applyPath
         * @memberof Coral.NavigationAction#
         * @param {string} path The path to match
         * @returns {boolean} <code>true</code> if the <code>NavigationAction</code> starts running
         */
        applyPath(path) {
            var match = this._pathExpression.exec(path);
            if (match) {
                for (var i = 0; i < this._names.length; ++i) {
                    this.params = {};
                    this.params[this._names[i]] = match[i + 1];
                }
                this.run();
                return true;
            }
            return false;
        }
    }
    
    export interface INavigationActionDescriptor extends ISequentialTasksDescriptor {
        path?: string;
        pathWatcher?;
        paramsWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.NavigationMap} Descriptor.
 * @method $NavigationMap
 * @see Coral.NavigationMap
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $NavigationMap(description: Coral.INavigationMapDescriptor): Coral.Descriptor<Coral.NavigationMap> {
    return new Coral.Descriptor(Coral.NavigationMap, description)
}

/**
 * Shortcut for creating a {@linkcode Coral.NavigationAction} Descriptor.
 * @method $NavigationAction
 * @see Coral.NavigationAction
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $NavigationAction(description: Coral.INavigationActionDescriptor): Coral.Descriptor<Coral.NavigationAction> {
    return new Coral.Descriptor(Coral.NavigationAction, description)
}