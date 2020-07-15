export function onlyUnique<T>(value: T, index: number, self: Array<T>) { 
    return self.indexOf(value) === index;
}

export function onlyUniqueForField<T, K>(fieldAccessor: (item: T) => K) { 
    return (value: T, index: number, self: Array<T>) => 
        onlyUnique(fieldAccessor(value), index, self.map(fieldAccessor));
}