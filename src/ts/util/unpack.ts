///<reference path="./hax.ts"/>

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

const unpackAngle = unpackNumberBuilder(CONST_2_PI_2DP, -CONST_PI_2DP);
// 0 to 64 (TODO should be 0..63)
const unpackUnsignedInteger = unpackNumberBuilder(64, 0);
// goes from -2 to 2
const unpackFloat2 = unpackNumberBuilder(4, -2);
// goes from -1 to 1
const unpackFloat1 = unpackNumberBuilder(2, -1);
// goes from -.5 to .5
const unpackFloatHalf = unpackNumberBuilder(1, -.5);
// goes from 0 to 0.1
const unpackUnsignedFloatPoint1 = unpackNumberBuilder(.1, 0);
// goes from 0 to 255
const unpackColorComponent = unpackNumberBuilder(255, 0);

const unpackRecordBuilder = <Key extends string | number, Value>(
    keyUnpacker: Unpacker<Key>, valueUnpacker: Unpacker<Value>
) => {
  return (packed: string[]): Partial<Record<Key, Value>> => {
    const result: Partial<Record<Key, Value>> = {};
    while (packed.length) {
      const key = keyUnpacker(packed);
      const value = valueUnpacker(packed);
      result[key] = value;
    }
    return result;
  };
};

const unpackVector3Rotations = unpackSizedArrayBuilder(unpackFixedLengthArrayBuilder<Vector3>(unpackAngle, 3));
const unpackVector3Normal = unpackFixedLengthArrayBuilder<Vector3>(unpackFloat1, 3);

const unpackVector4RGBA: Unpacker<Vector4> = unpackFixedLengthArrayBuilder(unpackColorComponent, 4);

const unpackEntityBodyPartAnimationSequences = unpackRecordBuilder<number, EntityBodyPartAnimationSequence>(
    unpackUnsignedInteger,
    unpackTupleBuilder<[Vector3[], 0 | 1, EasingId, number]>(
        unpackVector3Rotations,
        unpackUnsignedInteger,
        unpackUnsignedInteger,
        unpackFloat2,
    ),
);

const unpackSmallPlane: Unpacker<Plane> = (packed: string[]) => {
  const normal = vectorNNormalize(unpackVector3Normal(packed));
  return {
    normal,
    d: unpackUnsignedFloatPoint1(packed),
  }
};

const unpackSmallPlanes = unpackSizedArrayBuilder(unpackSmallPlane); 

//const unpackPlanes = unpackSizedArrayBuilder()

// packing

type Packer<T> = (value: T) => string[];

const packTupleBuilder = <R extends T[], T = any>(...packers: Packer<T>[]): Packer<R> => {
  return (value: R): string[]=> {
    return packers.map((v, i) => v(value[i])).flat() as any;
  };
};

const packFixedLengthArrayBuilder = <A extends T[], T = any>(packer: Packer<T>, length: number): Packer<A> => {
  return (value: T[]): string[] => {
    return value.map(packer).flat();
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
const packAngle = packNumberBuilder(CONST_2_PI_2DP, -CONST_PI_2DP);
// 0..64 (TODO should be 0..63)
const packUnsignedInteger = packNumberBuilder(64, 0);
// -2..2
const packFloat2 = packNumberBuilder(4, -2);
// -1..1
const packFloat1 = packNumberBuilder(2, -1);
// -.5..-5
const packFloatPoint5 = packNumberBuilder(1, -.5);
// 0..0.1
const packUnsignedFloatPoint1 = packNumberBuilder(.1, 0);
// 0 to 255
const packColorComponent = packNumberBuilder(255, 0);

const packParsedNumberBuilder = (packer: Packer<number>): Packer<string> => {
  return (value: string) => packer(parseInt(value));
};

const packDefaultBuilder = <T>(packer: Packer<T>, defaultValue: T): Packer<T | undefined | null> => {
  return (value: T | undefined | null) => packer(value || defaultValue);
};  

const packRecordBuilder = <Key extends string | number, Value>(keyPacker: Packer<string>, valuePacker: Packer<Value>) => {
  return (record: Record<Key, Value>) => {
    const result: string[] = [];
    for (const key in record) {
      const value = record[key];
      result.push(...keyPacker(key));
      result.push(...valuePacker(value));
    }
    return result;
  };
};

const packVector3Rotations = packSizedArrayBuilder(packFixedLengthArrayBuilder<Vector3>(packAngle, 3));
const packVector3Normal = packFixedLengthArrayBuilder<Vector3>(packFloat1, 3)
const packVector4RGBA = packFixedLengthArrayBuilder(packColorComponent, 4);


const packEntityBodyPartAnimationSequences = packRecordBuilder<number, EntityBodyPartAnimationSequence>(
  packParsedNumberBuilder(packUnsignedInteger),
  packTupleBuilder<[Vector3[], (0 | 1)?, EasingId?, number?]>(
      packVector3Rotations, 
      packDefaultBuilder(packUnsignedInteger, 0),
      packDefaultBuilder<EasingId>(packUnsignedInteger as Packer<EasingId>, EASE_LINEAR),
      packDefaultBuilder(packFloat2, 0),
  ),
);

const packSmallPlane: Packer<Plane> = (value: Plane): string[] => {
  return packVector3Normal(vectorNNormalize(value.normal)).concat(packUnsignedFloatPoint1(value.d));
};

const packSmallPlanes = packSizedArrayBuilder(packSmallPlane);

// safe

type SafeUnpacker<T> = (packed: string[], original?: T | Falsey) => T;

const safeUnpackerBuilder = <T>(unpacker: Unpacker<T>, packer?: Packer<T> | Falsey): SafeUnpacker<T> => {
  return (packed: string[], original?: T | Falsey) => {
    if (FLAG_UNPACK_CHECK_ORIGINALS && packer && original) {
      const packedOriginal = packer(original).join('');
      if (packed.join('') != packedOriginal) {
        try {
          throw new Error(`expected '${packedOriginal.replace(/\'/g, '\\\'')}' got '${packed.join('')}' for ${JSON.stringify(original)}`)
        } catch (e) {
          console.warn(e);
        }
        packed = [...packedOriginal];
      }  
    }  
    if (FLAG_UNPACK_USE_ORIGINALS && original) {
      return original;
    }
    return unpacker([...packed]);
  };
};

const safeUnpackVector3Rotations = FLAG_UNPACK_CHECK_ORIGINALS 
    ? safeUnpackerBuilder<Vector3[]>(
        unpackVector3Rotations,
        packVector3Rotations,
    )
    : unpackVector3Rotations;

const safeUnpackAnimationSequence = FLAG_UNPACK_CHECK_ORIGINALS 
    ? safeUnpackerBuilder<EntityBodyAnimationSequence<number>>(
        unpackEntityBodyPartAnimationSequences,
        packEntityBodyPartAnimationSequences,
    ) 
    : unpackEntityBodyPartAnimationSequences;

const safeUnpackPlanes = FLAG_UNPACK_CHECK_ORIGINALS
    ? safeUnpackerBuilder<Plane[]>(
        unpackSmallPlanes,
        FLAG_UNPACK_CHECK_ORIGINALS && packSmallPlanes,
    )
    : unpackSmallPlanes;

const safeUnpackRGBA = FLAG_UNPACK_CHECK_ORIGINALS
    ? safeUnpackerBuilder<Vector4>(
        unpackVector4RGBA,
        FLAG_UNPACK_CHECK_ORIGINALS && packVector4RGBA,
    )
    : unpackVector4RGBA;