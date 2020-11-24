/**
 * Helper functions to monkey patch functions
 */

const patch = (target, fnName, fnPatch) => {
    const _originalFn = target[fnName];
    target[fnName] = function() {
        return fnPatch.call(target, _originalFn, ...arguments);
    };
};

const tap = (target, fnName, fnPatch) => {
    const _originalFn = target[fnName];
    target[fnName] = function() {
        fnPatch.apply(target, arguments);
        return _originalFn.apply(target, arguments);
    };
};

module.exports = {
    patch: patch,
    tap: tap,
};
