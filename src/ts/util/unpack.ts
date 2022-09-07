const UNPACK_STARTING_CHAR_CODE = 32;

type Unpacker<T> = (c: string[]) => T;

const unpackTupleBuilder = <R extends T[], T = any>(...unpackers: Unpacker<T>[]): Unpacker<R> => {
  return (packed: string[]) => {
    return unpackers.map<T>((unpacker, i) => {
      const result = unpacker(packed) as T;
      //console.log('tuple', packed, i, result);
      return result;
    }) as R;
  };
};

const unpackFixedLengthArrayBuilder = <A extends T[], T = any>(unpacker: Unpacker<T>, length: number): Unpacker<A> => {
  return (packed: string[]) => {
    return new Array(length).fill(0).map(() => unpacker(packed)) as A;
  };
};

const unpackSizedArrayBuilder = <T>(unpacker: Unpacker<T>): Unpacker<T[]> => {
  return (packed: string[]) => {
    let length  = unpackUnsignedInteger(packed);
    const result: T[] = [];
    while (length > 0) {
      result.push(unpacker(packed));
      length--;
    }
    return result;
  }
}

const unpackNumberBuilder = (scale: number, offset: number): Unpacker<number> => {
  return (packed: string[]) => {
    const charAt = packed.shift();
    const result = (charAt.charCodeAt(0) - UNPACK_STARTING_CHAR_CODE) * scale/64 + offset;
    //console.log(charAt, result, packed);
    return result;
  };
}

const unpackAngle = unpackNumberBuilder(Math.PI * 2, -Math.PI);
const unpackUnsignedInteger = unpackNumberBuilder(64, 0);
// goes from -2 to 2
const unpackFloat2 = unpackNumberBuilder(4, -2);

const unpackRecordBuilder = <Key extends string | number, Value>(
    keyUnpacker: Unpacker<Key>, valueUnpacker: Unpacker<Value>
) => {
  return (packed: string[]): Partial<Record<Key, Value>> => {
    let size = unpackUnsignedInteger(packed);
    const result: Partial<Record<Key, Value>> = {};
    while (size > 0) {
      const key = keyUnpacker(packed);
      const value = valueUnpacker(packed);
      result[key] = value;
      size--;
    }
    return result;
  };
};

const unpackVector3Rotations = unpackSizedArrayBuilder(unpackFixedLengthArrayBuilder<Vector3>(unpackAngle, 3));

const unpackEntityBodyPartAnimationSequences = unpackRecordBuilder<number, EntityBodyPartAnimationSequence>(
    unpackUnsignedInteger,
    unpackTupleBuilder<[Vector3[], 0 | 1, EasingId, number]>(
        unpackVector3Rotations,
        unpackUnsignedInteger,
        unpackUnsignedInteger,
        unpackFloat2,
    ),
);

//const unpackPlanes = unpackSizedArrayBuilder()

// packing

type Packer<T> = (value: T) => string[];

const packTupleBuilder = <R extends T[], T = any>(...packers: Packer<T>[]): Packer<R> => {
  return (value: R): string[]=> {
    return packers.flatMap((v, i) => v(value[i])) as any;
  };
};

const packFixedLengthArrayBuilder = <A extends T[], T = any>(packer: Packer<T>, length: number): Packer<A> => {
  return (value: T[]): string[] => {
    return value.flatMap(packer);
  };
};

const packSizedArrayBuilder = <T>(packer: Packer<T>) => {
  return (value: T[]): string[] => {
    return value.reduce((acc, v) => {
      return acc.concat(...packer(v));
    }, packUnsignedInteger(value.length));
  };
};

const packNumberBuilder = (scale: number, offset: number): Packer<number> => {
  return (value: number) => [String.fromCharCode(Math.round(UNPACK_STARTING_CHAR_CODE + (value - offset) * 64/scale))];
};

// -PI..PI
const packAngle = packNumberBuilder(Math.PI*2, -Math.PI);
// 0..64
const packUnsignedInteger = packNumberBuilder(64, 0);
// -2..2
const packFloat2 = packNumberBuilder(4, -2);

const packParsedNumberBuilder = (packer: Packer<number>): Packer<string> => {
  return (value: string) => packer(parseInt(value));
};

const packDefaultBuilder = <T>(packer: Packer<T>, defaultValue: T): Packer<T | undefined | null> => {
  return (value: T | undefined | null) => packer(value || defaultValue);
};  

const packRecordBuilder = <Key extends string | number, Value>(keyPacker: Packer<string>, valuePacker: Packer<Value>) => {
  return (record: Record<Key, Value>) => {
    let size = 0;
    const result: string[] = [];
    for (const key in record) {
      const value = record[key];
      size++;
      result.push(...keyPacker(key));
      result.push(...valuePacker(value));
    }
    result.unshift(...packUnsignedInteger(size));
    return result;
  };
};

const packVector3Rotations = packSizedArrayBuilder(packFixedLengthArrayBuilder<Vector3>(packAngle, 3));

const packEntityBodyPartAnimationSequences = packRecordBuilder<number, EntityBodyPartAnimationSequence>(
  packParsedNumberBuilder(packUnsignedInteger),
  packTupleBuilder<[Vector3[], (0 | 1)?, EasingId?, number?]>(
      packVector3Rotations, 
      packDefaultBuilder(packUnsignedInteger, 0),
      packDefaultBuilder<EasingId>(packUnsignedInteger as Packer<EasingId>, EASE_LINEAR),
      packDefaultBuilder(packFloat2, 0),
  ),
);

// safe

type SafeUnpacker<T> = (packed: string, original: T) => T;

const safeUnpackerBuilder = <T>(unpacker: Unpacker<T>, packer?: Packer<T> | Falsey): SafeUnpacker<T> => {
  return (packed: string, original: T) => {
    if (FLAG_UNPACK_USE_ORIGINALS) {
      return original;
    }  
    if (FLAG_UNPACK_CHECK_ORIGINALS && packer) {
      const packedOriginal = packer(original).join('');
      if (packed != packedOriginal) {
        try {
          throw new Error(`expected '${packedOriginal.replace(/\'/g, '\\\'')}' got '${packed}' for ${JSON.stringify(original)}`)
        } catch (e) {
          console.warn(e);
        }
        return original;
      }  
    }  
    return unpacker(packed.split(''));
  };
};

const safeUnpackVector3Rotations = safeUnpackerBuilder<Vector3[]>(
    unpackVector3Rotations,
    FLAG_UNPACK_CHECK_ORIGINALS && packVector3Rotations,
);

const safeUnpackAnimationSequence = safeUnpackerBuilder<EntityBodyAnimationSequence<number>>(
    unpackEntityBodyPartAnimationSequences,
    FLAG_UNPACK_CHECK_ORIGINALS && packEntityBodyPartAnimationSequences,
);