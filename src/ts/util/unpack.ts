///<reference path="../flags.ts"/>
///<reference path="./hax.ts"/>

// avoid white space ' ' = 32 so we don't strip it later and \' so we don't have to escape it
const UNPACK_STARTING_CHAR_CODE = 40;
const UNPACK_ALLOWABLE_OVERFLOW = 50;

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

const unpackArrayBuilder = <A extends T[], T = any>(unpacker: Unpacker<T>, length?: number): Unpacker<A> => {
  return (packed: string[]) => {
    let len = length
        ? length
        : length < 0
            ? 0
            : unpackUnsignedInteger(packed);
    const result: T[] = [];
    while (len > 0 || length < 0 && packed.length) {
      result.push(unpacker(packed));
      len--;
    }
    return result as A;
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

const unpackVector3Rotations = unpackArrayBuilder(unpackArrayBuilder<Vector3>(unpackAngle, 3), -1);
const unpackVector3Normal = unpackArrayBuilder<Vector3>(unpackFloat1, 3);
const unpackVector4RGBA: Unpacker<Vector4> = unpackArrayBuilder(unpackColorComponent, 4);
const unpackMatrix4: Unpacker<Matrix4> = unpackArrayBuilder(unpackFloat1, 16);

const unpackEntityBodyPartAnimationSequences = unpackRecordBuilder<number, EntityBodyPartAnimationSequence>(
    unpackUnsignedInteger,
    unpackTupleBuilder<[Vector3[], 0 | 1, EasingId, number]>(
        unpackArrayBuilder(unpackArrayBuilder<Vector3>(unpackAngle, 3)), // sized
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

const unpackSmallPlanes = unpackArrayBuilder(unpackSmallPlane, -1); 
const unpackUnsignedIntegerArray = unpackArrayBuilder(unpackUnsignedInteger, -1);
const unpackVector3Normals = unpackArrayBuilder(unpackVector3Normal, -1);

const unpackEntityBodyPart: Unpacker<Part<number>> = (packed: string[]) => {
  const id = unpackUnsignedInteger(packed);
  const modelId = unpackUnsignedInteger(packed) as ModelId;
  const incomingDamageMultiplier = unpackFloat2(packed);
  const outgoingDamage = unpackFloat2(packed);
  // broken by no sizing
  const colorTextureIds = unpackUnsignedIntegerArray(packed) as ColorTextureId[];
  // broken by no sizing
  const normalTextureIds = unpackUnsignedIntegerArray(packed) as NormalTextureId[];
  const preRotationTransform = unpackMatrix4(packed);
  const postRotationTransform = unpackMatrix4(packed);
  const childs = unpackEntityBodyPartArray(packed);
  const jointAttachmentHeldTransform = unpackMatrix4(packed);
  const jointAttachmentHolderTransform = unpackMatrix4(packed);
  const jointAttachmentHolderPartId = unpackUnsignedInteger(packed);

  return {
    id,
    modelId,
    incomingDamageMultiplier,
    outgoingDamage,
    colorTextureIds,
    normalTextureIds,
    preRotationTransform,
    postRotationTransform,
    childs,
    jointAttachmentHeldTransform,
    jointAttachmentHolderTransform,
    jointAttachmentHolderPartId,
  };
};

const unpackEntityBodyPartArray = unpackArrayBuilder(unpackEntityBodyPart);



//const unpackPlanes = unpackSizedArrayBuilder()

// packing

type Packer<T> = (value: T) => string[];

const packTupleBuilder = <R extends readonly T[], T = any>(...packers: Packer<T>[]): Packer<R> => {
  return (value: R): string[]=> {
    return packers.map((v, i) => v(value[i])).flat() as any;
  };
};

// length can be zero/undefined, indicating we should write the length out, or -1, indicating we should gobble up all the values
const packArrayBuilder = <R extends readonly T[], T = any>(packer: Packer<T>, arrayLength?: number) => {
  return (value: R): string[] => {
    const arr = arrayLength ? [] : packUnsignedInteger(value.length);
    return [...arr, ...value.map(packer).flat()];
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

const packVector3Rotations = packArrayBuilder(packArrayBuilder<Vector3>(packAngle, 3), -1);
const packVector3Normal = packArrayBuilder<Vector3>(packFloat1, 3)
const packVector4RGBA = packArrayBuilder(packColorComponent, 4);
const packMatrix4 = packArrayBuilder(packFloat1, 16);

const packEntityBodyPartAnimationSequences = packRecordBuilder<number, EntityBodyPartAnimationSequence>(
  packParsedNumberBuilder(packUnsignedInteger),
  packTupleBuilder<[Vector3[], (0 | 1)?, EasingId?, number?]>(
      packArrayBuilder(packArrayBuilder<Vector3>(packAngle, 3)), // writes out size
      packDefaultBuilder(packUnsignedInteger, 0),
      packDefaultBuilder<EasingId>(packUnsignedInteger as Packer<EasingId>, EASE_LINEAR),
      packDefaultBuilder(packFloat2, 0),
  ),
);

const packSmallPlane: Packer<Plane> = (value: Plane): string[] => {
  // not used in production code, so concat does not inflat size
  return packVector3Normal(vectorNNormalize(value.normal)).concat(packUnsignedFloatPoint1(value.d));
};

const packSmallPlanes = packArrayBuilder(packSmallPlane, -1);

const packUnsignedIntegerArray = packArrayBuilder(packUnsignedInteger, -1);

const packEntityBodyPart: Packer<Part<number>> = (value: Part<number>) => {
  return [
    ...packUnsignedInteger(value.id),
    ...packUnsignedInteger(value.modelId),
    ...packFloat2(value.incomingDamageMultiplier || 0),
    ...packFloat2(value.outgoingDamage || 0),
    // broken assumes greedy
    ...packUnsignedIntegerArray(value.colorTextureIds),
    // broken assumes greedy
    ...packUnsignedIntegerArray(value.normalTextureIds || []),
    ...packMatrix4(value.preRotationTransform || matrix4Identity()), // identity matrix compresses well?
    ...packMatrix4(value.postRotationTransform || matrix4Identity()),
    ...packEntityBodyPartArray(value.childs || []),
    ...packMatrix4(value.jointAttachmentHeldTransform || matrix4Identity()),
    ...packMatrix4(value.jointAttachmentHolderTransform || matrix4Identity()),
    ...packUnsignedInteger(value.jointAttachmentHolderPartId || 0),
    // JOINT attachment holder animations
  ];
};

const packEntityBodyPartArray = packArrayBuilder(packEntityBodyPart);

const packVector3Normals = packArrayBuilder(packVector3Normal, -1);

// const packShapedRule: Packer<ShapedRule> = (value: ShapedRule) => {
//   return [
    
//   ]
// };
// const packShapedRules = packArrayBuilder(packShapedRule, -1);

// safe

type SafeUnpacker<T> = (packed: string[], original?: T | Falsey) => T;

const safeUnpackerBuilder = <T>(unpacker: Unpacker<T>, packer?: Packer<T> | Falsey): SafeUnpacker<T> => {
  return (packed?: string[], original?: T | Falsey) => {
    if (FLAG_UNPACK_CHECK_ORIGINALS && packer && original && packed) {
      const packedOriginal = packer(original);
      if (packed.join('') != packedOriginal.join('')) {
        const repackedOriginal = packer(unpacker([...packedOriginal]));
        if (repackedOriginal.join('') != packedOriginal.join('')) {
          // packer is busted!
          const diff = repackedOriginal.map((v, i) => packedOriginal[i] == v ? [] : [v, packedOriginal[i], i]).filter(i => i.length > 0);
          throw new Error(diff.map(([c1, c2, i]) => `${i}: ${c1}/${c2}`).join(' '));
        }
        const unprintable = packedOriginal.findIndex(c => c.charCodeAt(0) > UNPACK_STARTING_CHAR_CODE + 64 + UNPACK_ALLOWABLE_OVERFLOW) 
        if (unprintable >= 0) {
          throw new Error(
              'unprintable character "'
              + packedOriginal[unprintable]
              + '"('
              + packedOriginal[unprintable].charCodeAt(0)
              + ') at '+unprintable+' in '+packedOriginal.join('')
          );
        }
        try {
          throw new Error(`expected '${packedOriginal.join('').replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')}' got '${packed.join('').replace(/\'/g, '\\\'')}' for ${JSON.stringify(original)}`)
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

const safeUnpackVector3Normals = FLAG_UNPACK_CHECK_ORIGINALS
    ? safeUnpackerBuilder<Vector3[]>(
          unpackVector3Normals,
          FLAG_UNPACK_CHECK_ORIGINALS && packVector3Normals,
    )
    : unpackVector3Normals;

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

const safeUnpackMatrix4 = FLAG_UNPACK_CHECK_ORIGINALS
    ? safeUnpackerBuilder<Matrix4>(
        unpackMatrix4,
        FLAG_UNPACK_CHECK_ORIGINALS && packMatrix4,
    )
    : unpackMatrix4;

const safeUnpackEntityBodyPart = FLAG_UNPACK_CHECK_ORIGINALS
    ? safeUnpackerBuilder<Part<number>>(
          unpackEntityBodyPart,
          FLAG_UNPACK_CHECK_ORIGINALS && packEntityBodyPart,
    )
    : unpackEntityBodyPart;

const safeUnpackUnsignedIntegerArray = FLAG_UNPACK_CHECK_ORIGINALS
    ? safeUnpackerBuilder<number[]>(
      unpackUnsignedIntegerArray,
      FLAG_UNPACK_CHECK_ORIGINALS && packUnsignedIntegerArray,
    )
    : unpackUnsignedIntegerArray;

// const safeUnpackShapedRules = FLAG_UNPACK_CHECK_ORIGINALS
//     ? safeUnpackerBuilder<ShapedRule>(
//         unpackShapedRules,
//         FLAG_UNPACK_CHECK_ORIGINALS && packShapedRules,
//     )
//     : unpackShapedRules;