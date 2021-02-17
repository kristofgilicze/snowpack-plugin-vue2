// ---------------------------------------------------------------------------------------------------------------------
// Adapter for `vue-template-compiler`
// ---------------------------------------------------------------------------------------------------------------------

const { parse, compileTemplate, compileStyle } = require('@vue/component-compiler-utils');
const compiler = require('vue-template-compiler');

// ---------------------------------------------------------------------------------------------------------------------

function $parse(source, parseOptions)
{
    // Pull out options so they can be more easily mapped.
    const { sourceMap, filename, sourceRoot, pad } = parseOptions;

    // Parse SFC into a descriptor
    const descriptor = parse({
        source,
        filename,
        compiler,
        compilerParseOptions: { pad: pad ?? 'line' },
        sourceRoot,
        needMap: sourceMap
    });

    return {
        descriptor,
        errors: []  // TODO: How do we handle errors?
    }
}

function $compileTemplate(options)
{
    // There's a lot more work we'd have to do to be 100% compatible, but the snowpack plugin only passes in 5 options,
    // and they all line up except for `compilerOptions`. So, meh, let's only worry about what we have to.

    // This is done manually in @vue/compiler-sfc, but controlled by a boolean in `@vue/component-compiler-utils`. So,
    // we ignore all the hard work the plugin did, and just toggle a boolean so the compiler will redo the work. Eh, as
    // far as hacks go, this isn't the worst.
    if(options?.compilerOptions?.scopeId)
    {
        options.scoped = true;
    } // end if

    // We don't need compiler options
    delete options.compilerOptions;

    //------------------------------------------------------------------------------------------------------------------

    const results = compileTemplate({ ...options, compiler });

    // TODO: Make sure the results are actually compatible. They look really close, but it's hard to say
    return { ...results };
}

function $compileStyle(options)
{
    // There's a lot more work we'd have to do to be 100% compatible, but the snowpack plugin only passes in 6 options,
    // and they all line up. So, meh, let's only worry about what we have to.

    const results = compileStyle(options);

    // Modify the output to include the only non-optional thing missing. While this doesn't appear to be used, I'm a
    // bit worried it could be in the future.
    return {
        ...results,
        dependencies: new Set()
    };
}

// ---------------------------------------------------------------------------------------------------------------------

module.exports = {
    parse: $parse,
    compileTemplate: $compileTemplate,
    compileStyle: $compileStyle
};

// ---------------------------------------------------------------------------------------------------------------------