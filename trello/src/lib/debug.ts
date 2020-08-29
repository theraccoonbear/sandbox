export function watched() {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        console.error(`${propertyKey}()`);
    };
}