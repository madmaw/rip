const haxShortenMethods = <F, T extends F>(o: F, variableName: string): T => {
  const mapped = new Map<string, string>();
  for(const k in o) {
    const shortened = k.replace(/(^..)[a-z]*([A-Z]?)?[a-z]*([A-Z]?)?[a-z]*([A-Z]?)?[a-z]*(.+)$/, '$1$2$3$4$5');
    if (FLAG_DEBUG_SHORTENED_METHODS) {
      if (shortened != k) {
        if (o[shortened]) {
          console.log(`//${shortened} from ${k} already exists: ${mapped.get(shortened)}`);
        } else {
          mapped.set(shortened, k);
        }
      }  
    }
    o[shortened] = o[k];
  }
  if (FLAG_DEBUG_SHORTENED_METHODS) {  
    // also generate the replacements
    const gruntMappings = [...mapped.entries()].map(([k, v]) => {
      return `{ from: "${variableName}.${v}(", to: "${variableName}['${k}'](" }, `
    }); 
    for( let i=0; i<gruntMappings.length; i += 100) {
      console.log(gruntMappings.slice(i, i + 100).join(''));
    }
  }
  return o as any;
};

const CONST_PI_0DP = 3;
const CONST_2_PI_0DP = 6;
const CONST_PI_ON_3_0DP = 1;

const CONST_PI_1DP = 3.1;
const CONST_PI_ON_2_1DP = 1.6;
const CONST_2_PI_1DP = 6.3;
const CONST_3_PI_ON_2_1DP = 4.7;

const CONST_PI_2DP = 3.14;
const CONST_PI_ON_2_2DP = 1.57;
const CONST_2_PI_2DP = 6.28;
const CONST_3_PI_ON_2_2DP = 4.71;
const CONST_PI_ON_4_2DP = .78;
const CONST_3_PI_ON_4_2DP = 2.36;

const CONST_PI_3DP = 3.142;
const CONST_PI_ON_2_3DP = 1.571;
const CONST_2_PI_3DP = 6.283;
const CONST_3_PI_ON_2_3DP = 4.712;

const CONST_PI_ON_1_5_1DP = 2.1;
const CONST_PI_ON_1_6_1DP = 2;
const CONST_PI_ON_1_7_1DP = 1.8;
const CONST_PI_ON_1_8_1DP = 1.7;
const CONST_PI_ON_2_5_1DP = 1.3;
const CONST_PI_ON_2_7_1DP = 1.2;
const CONST_PI_ON_3_1DP = 1;
const CONST_PI_ON_4_1DP = .8;
const CONST_PI_ON_5_1DP = .6;
const CONST_PI_ON_6_1DP = .5;
const CONST_PI_ON_7_2DP = .44;
const CONST_PI_ON_8_1DP = .4;
const CONST_PI_ON_9_1DP = .3;
const CONST_PI_ON_10_2DP = .31;
const CONST_PI_ON_11_2DP = .29;
const CONST_PI_ON_12_2DP = .26;
const CONST_PI_ON_15_1DP = .2;
const CONST_PI_ON_15_2DP = .2;
const CONST_PI_ON_18_2DP = .17;
const CONST_PI_ON_20_2DP = .16;
const CONST_PI_ON_24_2DP = .13;
const CONST_PI_ON_30_2DP = .1;
const CONST_PI_ON_50_2DP = .06;
const CONST_PI_ON_60_2DP = .05;
const CONST_PI_ON_100_2DP = .03;