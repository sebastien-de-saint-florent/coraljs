///<reference path="../ref.d.ts"/>
module Coral {
    var compositionExp = /([^{}]+|{([^{}]+)})/g;
    export class BindingComposition {
        components: {v;m;}[];
        /**
         * <code>BindingComposition</code> treat a composition expression for {@linkcode Coral.CompositeBinding}.
         * @constructor Coral.BindingComposition
         * @property {Array} components computation of the binding expression.
         * @param {string} composition The composite binding expression.
         * @see Coral.CompositeBinding
         */
         constructor(composition) {
            this.components = [];
            var match;
             while (match = compositionExp.exec(composition)) {
                if (match[2])
                    this.components.push({ v: match[2], m: BindingComposition.BINDING_COMPONENT });
                else
                    this.components.push({ v: match[1], m: BindingComposition.STRING_COMPONENT });
            }
        }
        /**
         * Binding component flag.
         * @constant Coral.BindingComposition.BINDING_COMPONENT
         * @type {number}
         * @default 0
         */
        static BINDING_COMPONENT = 0;

        /**
         * String component flag.
         * @constant Coral.BindingComposition.STRING_COMPONENT
         * @type {number}
         * @default 1
         */
        static STRING_COMPONENT = 1;
    }
}
